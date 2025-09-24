import os
import numpy as np
from typing import List, Dict, Any
from sklearn.cluster import AgglomerativeClustering
from langchain.docstore.document import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.language_models import BaseChatModel  # For summarization
# --- CHANGE START ---
from langchain_google_genai import ChatGoogleGenerativeAI  # Import Google's Chat model
# --- CHANGE END ---
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import asyncio  # For running async functions
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# --- Configuration ---
PERSIST_DIRECTORY = "./chroma_db"
BASE_COLLECTION_NAME = "egyptian_law_articles"
RAPTOR_COLLECTION_NAME_PREFIX = "egyptian_law_raptor_level_"  # For hierarchical storage
SUMMARY_MAX_TOKENS = 500  # Adjust based on your LLM's context window and desired summary length

# Ensure your Google API key is set as an environment variable (GOOGLE_API_KEY)
# os.environ["GOOGLE_API_KEY"] = "YOUR_GOOGLE_API_KEY" # Uncomment and set if not in .env or system
if not os.getenv("GOOGLE_API_KEY"):
    print("Error: GOOGLE_API_KEY environment variable not set.")
    print("Please set it before running this script.")
    exit()

# --- 1. Initialize Embedding Model ---
print("Initializing embedding model: intfloat/multilingual-e5-large...")
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large",
                                   encode_kwargs={"normalize_embeddings": True})
print("Embedding model initialized.")

# --- 2. Initialize LLM for Summarization ---
print("Initializing LLM for summarization (using ChatGoogleGenerativeAI/gemini-pro)...")
# --- CHANGE START ---
llm_summarizer: BaseChatModel = ChatGoogleGenerativeAI(model="models/gemini-1.5-pro-002", temperature=0.3,
                                                       max_output_tokens=SUMMARY_MAX_TOKENS)
# Note: Gemini models might use max_output_tokens instead of max_tokens
# --- CHANGE END ---
print("LLM for summarization initialized.")

# --- Summarization Prompt ---
# Keep the prompt in Arabic, as Gemini Pro handles multilingual input well.
summary_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system",
         "أنت مساعد قانوني محترف. مهمتك هي تلخيص النصوص القانونية بدقة واختصار، مع التركيز على النقاط الأساسية والحجج القانونية. يجب أن يكون الملخص واضحًا ومفيدًا، ويجب أن يكون باللغة العربية. إذا كان النص المقدم غير قانوني أو غير مفهوم، قم بتلخيص ما هو مفهوم منه أو اذكر أنه لا يمكن تلخيصه كونه غير قانوني."),
        ("user", "لخص هذا النص القانوني:\n{text}\n\nالملخص:")
    ]
)
summary_chain = summary_prompt_template | llm_summarizer | StrOutputParser()


# --- RAPTOR Core Functions (no changes needed here from previous version) ---

def load_base_chunks(persist_dir: str, collection_name: str) -> List[Document]:
    """Loads the base article chunks from ChromaDB."""
    print(f"Loading base article chunks from ChromaDB collection: {collection_name} in {persist_dir}...")
    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings,
        collection_name=collection_name
    )
    client = vectorstore.get()

    docs = []
    if client and client['ids']:
        for i in range(len(client['ids'])):
            doc = Document(
                page_content=client['documents'][i],
                metadata=client['metadatas'][i]
            )
            docs.append(doc)

    print(f"Loaded {len(docs)} base chunks.")
    return docs


async def summarize_cluster(docs_in_cluster: List[Document], level: int, cluster_id: str) -> Document:
    """Generates a summary for a cluster of documents."""
    combined_text = "\n\n---\n\n".join([doc.page_content for doc in docs_in_cluster])

    print(f"  - Summarizing cluster {cluster_id} (Level {level})...")
    try:
        summary = await summary_chain.ainvoke({"text": combined_text})
    except Exception as e:
        print(f"    Warning: LLM summarization failed for cluster {cluster_id}: {e}. Using a truncated combined text.")
        summary = combined_text[:SUMMARY_MAX_TOKENS * 2]  # Fallback to truncated text

    summary_metadata = {
        "source": f"RAPTOR_Summary_Level_{level}",
        "summary_of_chunks": [doc.metadata.get("chunk_id", f"unknown_chunk_{j}") for j, doc in
                              enumerate(docs_in_cluster)],
        "level": level,
        "cluster_id": cluster_id,
        "original_docs_count": len(docs_in_cluster)
    }
    return Document(page_content=summary, metadata=summary_metadata)


def cluster_documents(docs: List[Document], n_clusters: int) -> Dict[int, List[Document]]:
    """Clusters documents based on their embeddings."""
    if len(docs) <= n_clusters:
        return {i: [doc] for i, doc in enumerate(docs)}

    print(f"  - Clustering {len(docs)} documents into {n_clusters} clusters...")
    doc_embeddings = [embeddings.embed_query(doc.page_content) for doc in docs]

    effective_n_clusters = min(n_clusters, len(docs))

    clustering_model = AgglomerativeClustering(
        n_clusters=effective_n_clusters,
        metric='euclidean',  # ✅ New param
        linkage='ward'
    )

    labels = clustering_model.fit_predict(doc_embeddings)

    clusters: Dict[int, List[Document]] = {i: [] for i in range(effective_n_clusters)}
    for doc, label in zip(docs, labels):
        clusters[label].append(doc)

    print(f"  - Created {len(clusters)} clusters.")
    return clusters


async def build_raptor_hierarchy(
    base_persist_dir: str,
    base_collection_name: str,
    llm_summarizer: BaseChatModel,
    max_levels: int = 3,
    docs_per_cluster: int = 5
) -> List[Chroma]:
    """
    Recursively builds the RAPTOR hierarchy.
    Returns a list of Chroma vector stores, one for each level.
    """
    all_level_vectorstores = []

    # Level 0: Original documents
    current_level_docs = load_base_chunks(base_persist_dir, base_collection_name)
    if not current_level_docs:
        print("No base documents found to build RAPTOR hierarchy.")
        return []

    level_0_collection_name = f"{RAPTOR_COLLECTION_NAME_PREFIX}0"
    level_0_vectorstore = Chroma.from_documents(
        documents=current_level_docs,
        embedding=embeddings,
        persist_directory=base_persist_dir,
        collection_name=level_0_collection_name
    )
    level_0_vectorstore.persist()
    all_level_vectorstores.append(level_0_vectorstore)
    print(f"Stored {len(current_level_docs)} documents in Level 0 ChromaDB collection: {level_0_collection_name}")

    for level in range(1, max_levels + 1):
        print(f"\n--- Building RAPTOR Level {level} ---")
        if len(current_level_docs) <= docs_per_cluster:
            print(f"Fewer than {docs_per_cluster} documents at Level {level - 1}, stopping hierarchy construction.")
            break

        n_clusters = max(1, len(current_level_docs) // docs_per_cluster)

        clusters = cluster_documents(current_level_docs, n_clusters)

        next_level_docs = []

        for cluster_id, cluster_docs in clusters.items():
            summary_doc = await summarize_cluster(cluster_docs, level, f"L{level}_C{cluster_id}")
            next_level_docs.append(summary_doc)

        if not next_level_docs:
            print(f"No summaries generated for Level {level}, stopping hierarchy construction.")
            break

        level_collection_name = f"{RAPTOR_COLLECTION_NAME_PREFIX}{level}"
        level_vectorstore = Chroma.from_documents(
            documents=next_level_docs,
            embedding=embeddings,
            persist_directory=base_persist_dir,
            collection_name=level_collection_name
        )
        level_vectorstore.persist()
        all_level_vectorstores.append(level_vectorstore)
        print(f"Stored {len(next_level_docs)} summaries in Level {level} ChromaDB collection: {level_collection_name}")

        current_level_docs = next_level_docs

    print("\nRAPTOR hierarchy built successfully.")
    return all_level_vectorstores


if __name__ == "__main__":

    print("Starting RAPTOR hierarchy construction...")

    loop = asyncio.get_event_loop()
    if loop.is_running():
        raptor_stores = loop.create_task(build_raptor_hierarchy(
            base_persist_dir=PERSIST_DIRECTORY,
            base_collection_name=BASE_COLLECTION_NAME,
            llm_summarizer=llm_summarizer,
            max_levels=2,  # For a demo, 2-3 levels are usually enough
            docs_per_cluster=5  # Adjust based on how many articles you want per summary
        ))
    else:
        raptor_stores = asyncio.run(build_raptor_hierarchy(
            base_persist_dir=PERSIST_DIRECTORY,
            base_collection_name=BASE_COLLECTION_NAME,
            llm_summarizer=llm_summarizer,
            max_levels=2,
            docs_per_cluster=5
        ))

    print(f"\nCreated {len(raptor_stores)} RAPTOR vector stores across different levels.")
