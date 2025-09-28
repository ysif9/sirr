import os
import re
import warnings
from pathlib import Path
from typing import List

import psycopg
from dotenv import load_dotenv
from langchain.docstore.document import Document
from langchain_community.document_loaders import DirectoryLoader, Docx2txtLoader
from langchain_community.vectorstores import PGVector
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from psycopg import sql

load_dotenv()

# Issue deprecation warning
warnings.warn(
    "This data_loading.py script is deprecated. Use 'python scripts/init_vector_embeddings.py' or 'poe init-vectors' instead.",
    DeprecationWarning,
    stacklevel=2
)


# --- Your EgyptianLawSplitter Class (No Changes Needed Here) ---
class EgyptianLawSplitter:
    """
    Splits Egyptian legal documents by 'مادة' or 'المادة', including variations like:
    - مادة 3
    - مادة (3)
    - المادة 3
    - المادة ( 3)
    - Also handles Arabic numerals (١, ٢, ٣...)
    """

    def __init__(self, chunk_overlap: int = 0, **kwargs):
        self.chunk_overlap = chunk_overlap
        # Regex pattern to match all accepted forms of article headings
        # Allows both English (0-9) and Arabic (\u0660-\u0669) numerals
        self.article_pattern = re.compile(
            r"(?:^|\s)(?:المادة|مادة)\s*(?:\(\s*)?(\d+|[\u0660-\u0669]+)(?:\s*\))?",
            flags=re.IGNORECASE
        )

    def split_text(self, text: str) -> List[str]:
        matches = list(self.article_pattern.finditer(text))
        article_chunks = []  # type: ignore

        leading_text_buffer = []  # type: ignore
        last_match_end = 0

        for i, match in enumerate(matches):
            current_article_start = match.start()

            # Determine the end of the current chunk
            next_article_start = matches[i + 1].start() if i + 1 < len(matches) else len(text)

            chunk_content = text[current_article_start:next_article_start].strip()

            # Validate that it actually starts with "مادة" or "المادة" (after slicing)
            if re.match(r"^(?:المادة|مادة)\s*(?:\(\s*)?(\d+|[\u0660-\u0669]+)", chunk_content, flags=re.IGNORECASE):
                # If this is the very first article being added, prepend any accumulated leading text
                if not article_chunks and leading_text_buffer:
                    chunk_content = "\n".join(leading_text_buffer) + "\n" + chunk_content
                    leading_text_buffer.clear()  # Clear buffer as it's been used
                article_chunks.append(chunk_content)

            last_match_end = next_article_start

        # --- Final handling of leading_text_buffer if no articles were found or it remains un-prepended ---
        if not article_chunks and leading_text_buffer:
            # If no articles were found at all, and there's leading text, make it one chunk
            article_chunks.append("\n".join(leading_text_buffer).strip())
        elif article_chunks and leading_text_buffer:
            # If leading text existed but wasn't prepended to the *first* chunk.
            # Prepend to the first actual article chunk.
            article_chunks[0] = "\n".join(leading_text_buffer) + "\n" + article_chunks[0]
            leading_text_buffer.clear()

        return article_chunks



# --- 1. Load documents ---
BASE_DIR = Path(__file__).resolve().parent
directory_path = BASE_DIR / "Data"

loader = DirectoryLoader(directory_path, glob="**/*.docx", loader_cls=Docx2txtLoader)  # type: ignore
raw_documents = loader.load()

split_documents = []

# --- 2. Split documents ---
splitter_instance = EgyptianLawSplitter()

for doc in raw_documents:
    text_content = doc.page_content
    source_path = doc.metadata.get("source", "unknown_file")

    if not text_content or not text_content.strip():
        print(f"Warning: Document '{source_path}' has no content after stripping.")
        continue

    article_chunks = splitter_instance.split_text(text_content)

    for chunk in article_chunks:
        # Re-match to get the article number for metadata, ensuring it's from the start of the chunk
        match = re.match(r"^(?:المادة|مادة)\s*(?:\(\s*)?(\d+|[\u0660-\u0669]+)(?:\s*\))?", chunk, flags=re.IGNORECASE)
        article_number = match.group(1) if match else None

        split_documents.append(Document(
            page_content=chunk,
            metadata={
                "source": source_path,
                "article_number": article_number
            }
        ))

# --- 3. Initialize Embedding Model ---
print("Initializing Google Gemini embedding model...")

# Get Google API key from environment
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is required")

embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=google_api_key  # type: ignore
)
print("Google Gemini embedding model initialized.")


# --- 4. Create pgvector db store and add documents ---
print(f"\nInserting {len(split_documents)} chunks into pgvector store. This may take a while...")

try:

    # Configuration
    PG_ADMIN_DB = os.getenv("PG_ADMIN_DB", "postgres")  # admin db to connect initially
    PG_USER = os.getenv("POSTGRES_DB_USER", "law_user")
    PG_PASSWORD = os.getenv("POSTGRES_DB_PASSWORD", "your_secure_password")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("VECTOR_HOST_PORT", "5435")
    PG_DBNAME = os.getenv("VECTOR_DB_NAME", "egyptian_law_db")
    COLLECTION_NAME = "egyptian_law_articles"

    CONNECTION_STRING = f"postgresql+psycopg://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DBNAME}"


    def create_database_if_not_exists():
        try:
            admin_conn = psycopg.connect(
                dbname=PG_ADMIN_DB,
                user=PG_USER,
                password=PG_PASSWORD,
                host=PG_HOST,
                port=PG_PORT
            )
            admin_conn.autocommit = True
            admin_cur = admin_conn.cursor()

            # Check if database exists
            admin_cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (PG_DBNAME,))
            exists = admin_cur.fetchone()

            if exists:
                print(f"Database '{PG_DBNAME}' already exists.")
            else:
                admin_cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(PG_DBNAME)))
                print(f"Database '{PG_DBNAME}' created successfully.")

            admin_cur.close()
            admin_conn.close()
        except Exception as e:
            print(f"Error while creating database: {e}")
            raise




    create_database_if_not_exists()


    vectorstore = PGVector.from_documents(
        documents=split_documents,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        connection_string=CONNECTION_STRING,
    )

    print(f"Successfully inserted {len(split_documents)} chunks into pgvector collection '{COLLECTION_NAME}'.")

    print(f"Successfully created pgvector collection and inserted {len(split_documents)} chunks.")


    print("\n--- Testing vector store retrieval ---")
    query = "ما هي شروط اكتساب الجنسية المصرية؟"
    retrieved_docs = vectorstore.similarity_search(query, k=3)

    print(f"Query: '{query}'")
    for i, doc in enumerate(retrieved_docs):
        print(
            f"Retrieved Document {i + 1} (Source: {doc.metadata.get('source', 'N/A')}, Article: {doc.metadata.get('article_number', 'N/A')}):")
        print(doc.page_content[:500])
        print("-" * 20)

except Exception as e:
    print(f"An error occurred during pgvector operation: {e}")
    print("Please ensure you have pgvector installed and sufficient disk space.")


print(f"\nTotal raw documents loaded: {len(raw_documents)}")
print(f"Total final chunks created: {len(split_documents)}")

