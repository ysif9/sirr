import re
import os
from typing import List, Dict
from langchain.docstore.document import Document
from langchain_community.document_loaders import Docx2txtLoader, DirectoryLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma  # Import ChromaDB


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
        article_chunks = []

        leading_text_buffer = []
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
directory_path = "Data/"  # Ensure this path is correct relative to your script

loader = DirectoryLoader(directory_path, glob="**/*.docx", loader_cls=Docx2txtLoader)
raw_documents = loader.load()

split_documents = []

# --- 2. Split documents using EgyptianLawSplitter ---
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
print("Initializing embedding model: intfloat/multilingual-e5-large...")
# You might keep normalize_embeddings=True for E5 models
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large",
                                   encode_kwargs={"normalize_embeddings": True})
print("Embedding model initialized.")

# --- 4. Configure ChromaDB ---
# This is the directory where ChromaDB will store its persistent files
# Create this directory if it doesn't exist
persist_directory = "./chroma_db"
if not os.path.exists(persist_directory):
    os.makedirs(persist_directory)
    print(f"Created ChromaDB persistence directory: {persist_directory}")

# --- 5. Create ChromaDB store and add documents ---
print(f"\nInserting {len(split_documents)} chunks into ChromaDB store. This may take a while...")

try:
    # If you want to clear the existing ChromaDB data each time you run:
    # from chromadb.api import API
    # import chromadb.utils.embedding_functions as ef
    # from chromadb import PersistentClient
    # client = PersistentClient(path=persist_directory)
    # try:
    #     client.delete_collection(name="egyptian_law_articles")
    #     print("Cleared existing ChromaDB collection.")
    # except Exception:
    #     pass # Collection might not exist yet

    # Create a new ChromaDB instance or load an existing one
    vectorstore = Chroma.from_documents(
        documents=split_documents,  # Your list of LangChain Document objects
        embedding=embeddings,  # The embedding model
        persist_directory=persist_directory,
        collection_name="egyptian_law_articles"  # Name of your collection
    )
    # This call saves the embeddings to disk
    vectorstore.persist()
    print(f"Successfully created ChromaDB store and inserted {len(split_documents)} chunks.")

    # --- Optional: Test Retrieval ---
    print("\n--- Testing vector store retrieval ---")
    query = "ما هي شروط اكتساب الجنسية المصرية؟"  # Example query in Arabic
    retrieved_docs = vectorstore.similarity_search(query, k=3)

    print(f"Query: '{query}'")
    for i, doc in enumerate(retrieved_docs):
        print(
            f"Retrieved Document {i + 1} (Source: {doc.metadata.get('source', 'N/A')}, Article: {doc.metadata.get('article_number', 'N/A')}):")
        print(doc.page_content[:500])  # Print first 500 characters of the retrieved content
        print("-" * 20)

except Exception as e:
    print(f"An error occurred during ChromaDB operation: {e}")
    print("Please ensure you have chromadb installed and sufficient disk space.")

# --- 6. Print results (Optional, for debugging chunks) ---
print(f"\nTotal raw documents loaded: {len(raw_documents)}")
print(f"Total final chunks created: {len(split_documents)}")

# Inspect the last 20 chunks (or adjust range)
print("\n--- Inspecting a sample of created chunks ---")
sample_start = max(0, len(split_documents) - 50)  # Inspect the last 50 chunks
for i, chunk_doc in enumerate(split_documents[sample_start:], sample_start + 1):
    print(f"\n--- Chunk {i} ---")
    print(f"Source: {chunk_doc.metadata.get('source')}")
    print(f"Article Number: {chunk_doc.metadata.get('article_number', 'N/A')}")
    print(f"Metadata: {chunk_doc.metadata}")
    print(chunk_doc.page_content[:1000])  # Print first 1000 chars
    print("-" * 70)
