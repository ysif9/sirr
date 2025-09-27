# Legal AI Chatbot Development Guide

This guide details how to set up, load data for, and run the Adaptive RAG Legal Chatbot. The chatbot uses **uv** for dependency management, a Docker-managed PostgreSQL database, and Google Generative AI (Gemini) for its LLM capabilities.

## Prerequisites

-   Python 3.13+
-   [uv](https://docs.astral.sh/uv/) for dependency management
-   Docker & Docker Compose (for PostgreSQL database)
-   **Google API Key**: For accessing Gemini models.
-   **Tavily API Key**: For web search functionality.

### Installation

1.  **Install uv:**
    -   Follow the official [uv installation guide](https://docs.astral.sh/uv/getting-started/installation/)
    -   Quick install:
        ```bash
        # Unix/macOS
        curl -LsSf https://astral.sh/uv/install.sh | sh

        # Windows (PowerShell)
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
        ```
2.  **Install Docker:**
    -   Follow the official [Docker installation guide](https://docs.docker.com/get-docker/)
    -   Ensure Docker Compose is included (bundled with Docker Desktop)

## Environment Configuration

You need to set up environment variables for API keys and database connection.

1.  **Create your local `.env` file:**
    If you don't have one, create a `.env` file in the root of your project (or in the `Chatbot` directory if that's where your Python scripts are running from).

    ```bash
    cp .env.example .env
    ```
    (Assuming you have a `.env.example` in the project root with the necessary variables)

2.  **Edit your `.env` file:**
    Ensure the following variables are set with your actual values:

    ```dotenv
    # --- Google API Key ---
    GOOGLE_API_KEY="your_google_api_key_here"

    # --- Tavily Search API Key ---
    TAVILY_API_KEY="your_tavily_api_key_here"

    # --- PostgreSQL Database (for vector store) ---
    POSTGRES_DB_USER="postgres"         # Or your custom user from docker-compose
    POSTGRES_DB_PASSWORD="postgres"     # Or your custom password from docker-compose
    PG_HOST="localhost"                 # Or "127.0.0.1" if running on host.
                                        # If your RAG_chatbot.py also runs inside Docker Compose, use "db"
    VECTOR_HOST_PORT="5435"             # The host port mapped to your db container's 5432 (e.g., 5435:5432)
    VECTOR_DB_NAME="vector_dev"         # Your database name for the vector store
    PG_ADMIN_DB="postgres"              # Admin DB for initial connection (e.g., 'postgres')
    ```
    **Note:** The `VECTOR_HOST_PORT` should match the host-side port you mapped in your `docker-compose.yml` (e.g., if it's `5435:5432`, use `5435`).

## Database Setup (PostgreSQL with `pgvector`)

The chatbot utilizes a PostgreSQL database with the `pgvector` extension for storing vector embeddings.

1.  **Build and Start Database Container:**
    Your `docker-compose.yml` should define a `db` service using an image that has `pgvector` installed (e.g., `pgvector/pgvector:pg17` or a custom build with `postgres:17.5-alpine3.20` + `pgvector` compilation).

    First, ensure any old, incompatible data volumes are removed to avoid version conflicts.
    Navigate to your project root (where `docker-compose.yml` is located) and run:

    ```bash
    docker compose down -v
    docker compose up -d --build vector_db # Only build and start the db service
    ```
    This will create a fresh PostgreSQL container with `pgvector` accessible on `localhost:<VECTOR_HOST_PORT>`.

## Data Loading and Embedding

This step processes your Egyptian law documents, splits them into chunks, generates embeddings, and stores them in your PostgreSQL `pgvector` database.

1.  **Place your data:**
    Ensure your `.docx` files containing Egyptian legal texts are located in the `Data/` directory, relative to your `data_loading.py` script.

2.  **Run the data loading script:**
    Navigate to the `Chatbot` directory (or wherever `data_loading.py` is) and execute:

    ```bash
    python data_loading.py
    ```
    This script will:
    *   Load your `.docx` files.
    *   Split them into individual legal articles.
    *   Initialize the `intfloat/multilingual-e5-large` embedding model (this may take a few minutes on the first run as it downloads the model).
    *   Create the `vector_dev` database (if it doesn't exist).
    *   Create the `egyptian_law_articles` collection (table) in `pgvector`.
    *   Generate and store embeddings for all your document chunks.

    **Note on Embedding Model:**
    The `intfloat/multilingual-e5-large` model is a powerful multilingual model but can be resource-intensive and take time to download initially.
    If you experience issues or need a faster, less resource-demanding alternative for quick testing, you can change the `model_name` in `data_loading.py` (and `RAG_chatbot.py`) to a smaller model, e.g., `"sentence-transformers/distiluse-base-multilingual-cased-v2"`.

## Running the Chatbot

The `RAG_chatbot.py` file contains the LangGraph workflow that orchestrates the adaptive RAG process, including query analysis, retrieval, grading, and generation.

### 1. Interactive Chatbot (for testing)

To run the chatbot in an interactive console mode:

1.  Ensure you have completed the "Data Loading and Embedding" step.
2.  Navigate to the `Chatbot` directory and execute:

    ```bash
    python RAG_chatbot.py
    ```
3.  The chatbot will prompt you for questions in Arabic. Type `exit` to quit.

    ```
    --- Adaptive RAG Legal Chatbot ---
    Enter your questions in Arabic. Type 'exit' to quit.

    Your question: ما هي مدة الحكم الرئاسي؟
    --- Chatbot Flow ---
    ---QUERY ANALYSIS NODE TEST---
    ---DEBUG: Raw LLM Response Message: content='legal' additional_kwargs={'finish_reason': 'STOP', 'model_name': 'gemini-2.0-flash-001', 'safety_ratings': []} id='run--1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d-0' usage_metadata={'input_tokens': 90, 'output_tokens': 1, 'total_tokens': 91}---
    ---DEBUG: Text-based classification: 'legal'---
    ---DECISION: CLASSIFIED AS LEGAL QUESTION---
    ---ROUTE QUESTION---
    ---ROUTE TO RETRIEVE (LEGAL)---
    Node: query_analysis
    ---RETRIEVE FROM VECTORSTORE---
    Node: retrieve
    ---CHECK DOCUMENT RELEVANCE TO QUESTION---
    ---GRADE: DOCUMENT RELEVANT---
    ---GRADE: DOCUMENT RELEVANT---
    ---GRADE: DOCUMENT NOT RELEVANT---
    Node: grade_documents
    ---ASSESS GRADED DOCUMENTS---
    ---DECISION: GENERATE---
    Node: decide_to_generate
    ---GENERATE---
    Node: generate
    ---GRADE GENERATION NODE (passes to decision function)---
    Node: grade_generation
    ---CHECK HALLUCINATIONS---
    ---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---
    ---DECISION: GENERATION ADDRESSES QUESTION---
    Node: decide_generation_quality

    --- FINAL ANSWER ---
    وفقًا للقانون المصري، مدة الحكم الرئاسي هي ست سنوات تبدأ من تاريخ إعلان فوزه في الانتخابات. ولا يجوز إعادة انتخاب الرئيس لأكثر من فترتين متتاليتين.

    Your question: كيف حالك؟
    --- Chatbot Flow ---
    ---QUERY ANALYSIS NODE TEST---
    ---DEBUG: Raw LLM Response Message: content='non_legal' additional_kwargs={'finish_reason': 'STOP', 'model_name': 'gemini-2.0-flash-001', 'safety_ratings': []} id='run--a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d-0' usage_metadata={'input_tokens': 90, 'output_tokens': 1, 'total_tokens': 91}---
    ---DEBUG: Text-based classification: 'non_legal'---
    ---DECISION: CLASSIFIED AS NON-LEGAL QUESTION---
    ---ROUTE QUESTION---
    ---ROUTE TO APOLOGY (NON-LEGAL)---
    Node: query_analysis
    ---FORMING AN APOLOGY---
    Node: generate_apology

    --- FINAL ANSWER ---

    نعتذر، ولكن لا يمكننا تقديم إجابة على السؤال التالي لأنه لا يندرج ضمن نطاق الأسئلة القانونية المتعلقة بالقوانين أو الدستور المصري:

    كيف حالك؟

    يرجى التأكد من أن سؤالك متعلق بمسألة قانونية ضمن الإطار المصري، وسنكون سعداء بمساعدتك.
    ```

### 2. Importing for Frontend Integration

You can integrate the chatbot's core logic into your Django frontend in two ways:

#### a) Using the `run_chatbot` function for interactive/streaming responses:

This method is suitable for a long-running process or if you want to stream the output. You would modify `run_chatbot` to accept the question directly and return the final answer.

```python
# In your Django view or API endpoint (e.g., chatbot_api.py)

import asyncio
from RAG_chatbot import run_chatbot # Assuming RAG_chatbot.py is accessible

async def get_chatbot_response(question: str) -> str:
    # You would typically set up the inputs dictionary
    # and call the `app.astream` or `app.ainvoke` directly,
    # as `run_chatbot` in the example is designed for interactive console.

    # For simplicity, if run_chatbot were adapted to take 'question' and return 'answer':
    # You would need to modify RAG_chatbot.py's run_chatbot signature
    # and internal loop to just process one question and return.
    # For now, let's show how to use the 'app' directly.

    # Example: Directly using the 'app' graph (preferred for API)
    from RAG_chatbot import app # Import the compiled graph directly
    
    inputs = {"question": question, "generation": None, "documents": []}
    final_generation = None
    
    # Use a regular event loop if not already in an async context
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # If already in an async context (e.g., ASGI server)
        async for s in app.astream(inputs):
            for key, value in s.items():
                if "generation" in value and value["generation"] is not None:
                    final_generation = value["generation"]
        return final_generation
    else:
        # If not in an async context, run it
        async def _run_single_query():
            nonlocal final_generation
            async for s in app.astream(inputs):
                for key, value in s.items():
                    if "generation" in value and value["generation"] is not None:
                        final_generation = value["generation"]
            return final_generation
        return await _run_single_query()


# Example usage in a Django view (assuming an async view or using sync_to_async)
# from asgiref.sync import sync_to_async

# async def my_chatbot_view(request):
#     user_question = request.GET.get('q', 'ما هي مدة الحكم الرئاسي؟')
#     response_text = await get_chatbot_response(user_question)
#     return HttpResponse(response_text)
