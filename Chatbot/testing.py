import os
from typing import List, Dict
from langchain.docstore.document import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Configuration for ChromaDB
# This should match the persist_directory used in data_loading.py
PERSIST_DIRECTORY = "./chroma_db"
COLLECTION_NAME = "egyptian_law_articles"

# --- 1. Initialize Embedding Model ---
# Ensure this uses the SAME model as your data_loading.py
print("Initializing embedding model for retrieval: intfloat/multilingual-e5-large...")
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large", encode_kwargs={"normalize_embeddings": True})
print("Embedding model initialized.")

# --- 2. Load the existing ChromaDB vector store ---
print(f"Loading ChromaDB from {PERSIST_DIRECTORY}...")
try:
    vectorstore = Chroma(
        persist_directory=PERSIST_DIRECTORY,
        embedding_function=embeddings, # Pass the embedding function
        collection_name=COLLECTION_NAME
    )
    print("ChromaDB loaded successfully.")
except Exception as e:
    print(f"Error loading ChromaDB: {e}")
    print("Please ensure `data_loading.py` has been run at least once to create the ChromaDB.")
    exit() # Exit if we can't load the DB

# --- 3. Interactive Retrieval Function ---
def interactive_retrieve():
    print("\n--- Starting Interactive Retrieval Test ---")
    print("Enter your legal questions in Arabic. Type 'exit' to quit.")

    while True:
        question = input("\nYour legal question: ")
        if question.lower() == 'exit':
            print("Exiting interactive test. Goodbye!")
            break

        if not question.strip():
            print("Please enter a question.")
            continue

        try:
            # Perform similarity search in ChromaDB
            # Adjust k (number of retrieved documents) as needed
            retrieved_docs: List[Document] = vectorstore.similarity_search(question, k=4)

            if retrieved_docs:
                print(f"\n--- Retrieved Documents for: '{question}' ---")
                for i, doc in enumerate(retrieved_docs):
                    # For source path, extract just the filename for cleaner output
                    source_filename = os.path.basename(doc.metadata.get('source', 'N/A'))
                    print(f"[{i+1}] Source: {source_filename}, Article: {doc.metadata.get('article_number', 'N/A')}")
                    print("Content Snippet:")
                    # Print a reasonable snippet, replacing newlines for better readability in console
                    print(doc.page_content[:].replace('\n', ' ') + "...")
                    print("-" * 50)
            else:
                print("No relevant documents found for your question.")

        except Exception as e:
            print(f"An error occurred during retrieval: {e}")

if __name__ == "__main__":
    interactive_retrieve()
