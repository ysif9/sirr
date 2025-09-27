import asyncio
from pprint import pprint
from langchain_community.vectorstores import PGVector
import os
import psycopg2
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langgraph.graph import END, StateGraph, START
from langchain.schema import Document
from typing import List
from typing_extensions import TypedDict
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from dotenv import load_dotenv
import os
load_dotenv()


# --- Configuration ---
PERSIST_DIRECTORY = "./chroma_db"
COLLECTION_NAME = "egyptian_law_articles"

# --- API Key Checks ---
if not os.getenv("GOOGLE_API_KEY"):
    print("Error: GOOGLE_API_KEY environment variable not set.")
    print("Please set it before running this script.")
    exit()

# IMPORTANT: Tavily API Key for Web Search
if not os.getenv("TAVILY_API_KEY"):
    print("Warning: TAVILY_API_KEY environment variable not set.")
    print("Web search functionality will be limited or fail. Please set it for full functionality.")

# --- LLMs and Embeddings ---
print("Initializing Embedding Model: intfloat/multilingual-e5-large...")
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large",
                                   encode_kwargs={"normalize_embeddings": True})
print("Embedding Model initialized.")
# --- Vector Store ---
print(f"Loading data from pgvector ")


# Load DB config (make sure these match your setup)
PG_USER = os.getenv("POSTGRES_DB_USER", "law_user")
PG_PASSWORD = os.getenv("POSTGRES_DB_PASSWORD", "your_secure_password")
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("VECTOR_HOST_PORT", "5435")
PG_DBNAME = os.getenv("VECTOR_DB_NAME", "vector_dev")
COLLECTION_NAME = "egyptian_law_articles"

CONNECTION_STRING = f"postgresql+psycopg2://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DBNAME}"

try:
    vectorstore = PGVector(
        collection_name=COLLECTION_NAME,
        connection_string=CONNECTION_STRING,
        embedding_function=embeddings,
    )
    retriever = vectorstore.as_retriever(k=6)
    print("PGVector retriever created successfully from PostgreSQL.")
except Exception as e:
    print(f"Error loading PGVector retriever: {e}")
    print("Please ensure your database, collection, and vector embeddings exist.")
    exit()

llm = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", temperature=0)


# Data model
class GradeDocuments(BaseModel):
    """Binary score for relevance check on retrieved documents."""

    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )


# LLM with function call

structured_llm_grader = llm.with_structured_output(GradeDocuments)

# Prompt
system = """You are a grader assessing questions in arabic whether they are related to egyptian laws or not . \n
    If the question is related to egyptian constitution, civil, traffic or penalties law answer with yes else no. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
grade_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "User question: {question}"),
    ]
)

relevance_grader = grade_prompt | structured_llm_grader



structured_llm_grader = llm.with_structured_output(GradeDocuments)

# Prompt
system = """You are a grader assessing relevance of a retrieved document to a user question. \n
    If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
grade_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ]
)

retrieval_grader = grade_prompt | structured_llm_grader

# Prompt
prompt = PromptTemplate(
    template="""You are a grader assessing whether an answer is grounded in / supported by a set of facts. \n
    Here are the facts:
    \n ------- \n
    {documents}
    \n ------- \n
    Here is the answer: {generation}
    Give a binary score 'yes' or 'no' score to indicate whether the answer is grounded in / supported by a set of facts. \n
    Provide the binary score as a JSON with a single key 'score' and no preamble or explanation.""",
    input_variables=["generation", "documents"],
)

hallucination_grader = prompt | llm | JsonOutputParser()

# Prompt
prompt = PromptTemplate(
    template="""You are a grader assessing whether an answer is useful to resolve a question. \n
    Here is the answer:
    \n ------- \n
    {generation}
    \n ------- \n
    Here is the question: {question}
    Give a binary score 'yes' or 'no' to indicate whether the answer is useful to resolve a question. \n
    Provide the binary score as a JSON with a single key 'score' and no preamble or explanation.""",
    input_variables=["generation", "question"],
)

answer_grader = prompt | llm | JsonOutputParser()


legal_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", """أنت مستشار قانوني تجيب عن الأسئلة المتعلقة بالقوانين المصرية باللغة العربية.
استخدم السياق التالي للإجابة على السؤال. إذا لم يكن السياق كافياً للإجابة، يرجى ذكر ذلك باختصار.
حاول أن تكون الإجابة مباشرة ومفصلة قدر الإمكان."""),
        ("human", "السياق:\n\n{context}\n\nالسؤال:\n\n{question}")
    ]
)


llm = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", temperature=0)

# --- Format documents ---
def format_docs(docs):
    return "\n\n".join(doc for doc in docs)

# --- Chain Setup ---
rag_chain = (
    {
        "context": RunnableLambda(format_docs),
        "question": RunnablePassthrough()
    }
    | legal_prompt
    | llm
    | StrOutputParser()
)

# Prompt
system = """You are a question rewriter that transforms user questions into optimized queries for web search.

Your task is to:
- Understand the underlying legal intent behind the original question.
- Rewrite the question in **Arabic**, making it clearer, more specific, and well-suited for search engines.
- Ensure the rewritten question focuses **exclusively** on **Egyptian laws or the Egyptian constitution**.
- Explicitly indicate that search results should come only from **trusted Egyptian sources** (such as government sites, legal databases, or reputable Egyptian legal entities or trusted Egyptian newspapers).
- **Do not** include or imply interest in laws from other countries, general knowledge, social, or non-legal topics.

Return only the improved Arabic search query.
"""
re_write_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        (
            "human",
            "Here is the initial question: \n\n {question} \n Formulate an improved question.",
        ),
    ]
)

question_rewriter = re_write_prompt | llm | StrOutputParser()

web_search_tool = TavilySearchResults(k=2)



class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        question: question
        generation: LLM generation
        web_search: whether to add search
        documents: list of documents
    """

    question: str
    generation: str
    web_search: str
    documents: List[str]


#############################################
from langchain.schema import Document


def retrieve(state):
    """
    Retrieve documents

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    print("---RETRIEVE---")
    question = state["question"]

    # Retrieval
    documents = retriever.get_relevant_documents(question)
    return {"documents": documents, "question": question}


def generate(state):
    """
    Generate answer

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation, that contains LLM generation
    """
    print("---GENERATE---")
    question = state["question"]
    documents = state["documents"]

    # RAG generation
    generation = rag_chain.invoke({"context": documents, "question": question})
    return {"documents": documents, "question": question, "generation": generation}


def decide_legal(state):
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with only filtered relevant documents
    """

    print("---CHECK WHETHER QUESTION IS LEGAL---")
    question = state["question"]

    score = relevance_grader.invoke(
        {"question": question}
    )
    grade = score.binary_score
    if grade == "yes":
        print("---QUESTION IS LEGAL---")

    else:
        print("---QUESTION IS NON-LEGAL---")

    return None


def grade_documents(state):
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with only filtered relevant documents
    """

    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]

    # Score each doc
    filtered_docs = []
    web_search = "No"
    irrelevant_docs = 0
    for d in documents:
        score = retrieval_grader.invoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.binary_score
        if grade == "yes":
            print("---GRADE: DOCUMENT RELEVANT---")
            filtered_docs.append(d)
        else:
            print("---GRADE: DOCUMENT NOT RELEVANT---")
            irrelevant_docs += 1

        if irrelevant_docs >= 2:
            web_search = "Yes"
    return {"documents": filtered_docs, "question": question, "web_search": web_search}


def transform_query(state):
    """
    Transform the query to produce a better question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates question key with a re-phrased question
    """

    print("---TRANSFORM QUERY---")
    question = state["question"]
    documents = state["documents"]

    # Re-write question
    better_question = question_rewriter.invoke({"question": question})
    return {"documents": documents, "question": better_question}


def web_search(state):
    """
    Web search based on the re-phrased question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with appended web results
    """

    print("---WEB SEARCH---")
    question = state["question"]
    documents = state["documents"]

    # Web search
    docs = web_search_tool.invoke({"query": question})
    web_results = "\n".join([d["content"] for d in docs])
    web_results = Document(page_content=web_results)
    documents.append(web_results)

    return {"documents": documents, "question": question}


### Edges


def decide_to_generate(state):
    """
    Determines whether to generate an answer, or re-generate a question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Binary decision for next node to call
    """

    print("---ASSESS GRADED DOCUMENTS---")
    state["question"]
    web_search = state["web_search"]
    state["documents"]

    if web_search == "Yes":
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        print(
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"
        )
        return "transform_query"
    else:
        # We have relevant documents, so generate answer
        print("---DECISION: GENERATE---")
        return "generate"


def generate_apology(state):
    print("---FORMING AN APOLOGY---")
    apology = f"""نعتذر، ولكن لا يمكننا تقديم إجابة على السؤال التالي لأنه لا يندرج ضمن نطاق الأسئلة القانونية المتعلقة بالقوانين أو الدستور المصري:

{state["question"]}

يرجى التأكد من أن سؤالك متعلق بمسألة قانونية ضمن الإطار المصري، وسنكون سعداء بمساعدتك.
"""
    return {"generation": apology}


def grade_generation(state):
    """
    Node that prepares for grading decision — does nothing but passes state through.
    The actual decision is made in a separate routing function.
    """
    print("---GRADE GENERATION NODE (passes to decision function)---")
    return state


def decide_generation_quality(state):
    """
    Decision function that returns next node name: 'useful', 'not useful', or 'not supported'.
    """
    print("---CHECK HALLUCINATIONS---")
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    score = hallucination_grader.invoke({"documents": documents, "generation": generation})
    grade = score["score"]

    if grade == "yes":
        print("---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---")
        score = answer_grader.invoke({"question": question, "generation": generation})
        grade = score["score"]
        if grade == "yes":
            print("---DECISION: GENERATION ADDRESSES QUESTION---")
            return "useful"
        else:
            print("---DECISION: GENERATION DOES NOT ADDRESS QUESTION---")
            return "not useful"
    else:
        print("---DECISION: GENERATION IS NOT GROUNDED IN DOCUMENTS, RE-TRY---")
        return "not supported"
############################################################
from langgraph.graph import END, StateGraph, START

workflow = StateGraph(GraphState)

# Define the nodes
workflow.add_node("decide_legal", decide_legal)  # check legal scope
workflow.add_node("retrieve", retrieve)  # retrieve
workflow.add_node("grade_documents", grade_documents)  # grade documents
workflow.add_node("generate", generate)  # generate
workflow.add_node("transform_query", transform_query)  # transform query
workflow.add_node("web_search_node", web_search)  # web search
workflow.add_node("generate_apology", generate_apology)  # generate apology
workflow.add_node("grade_generation", grade_generation)  # hallucination and usefulness check
workflow.add_node("decide_to_generate", decide_generation_quality)

# Build graph
workflow.add_edge(START, "decide_legal")

# After checking legality
workflow.add_conditional_edges(
    "decide_legal",
    lambda state: "retrieve" if relevance_grader.invoke({"question": state["question"]}).binary_score == "yes" else "generate_apology",
    {
        "retrieve": "retrieve",
        "generate_apology": "generate_apology",
    },
)

# If not legal, go to apology then end
workflow.add_edge("generate_apology", END)

# Retrieval path
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "transform_query": "transform_query",
        "generate": "generate",
    },
)
workflow.add_edge("transform_query", "web_search_node")
workflow.add_edge("web_search_node", "generate")

# Generation quality grading
workflow.add_edge("generate", "grade_generation")
#workflow.add_node("grade_generation", grade_generation)

workflow.add_conditional_edges(
    "grade_generation",
    decide_generation_quality,  # <- now this is the routing logic
    {
        "useful": END,
        "not useful": "generate",
        "not supported": "generate",
    },
)
# Compile
app = workflow.compile()
################################################################################



async def run_chatbot():
    print("\n--- Adaptive RAG Legal Chatbot ---")
    print("Enter your questions in Arabic. Type 'exit' to quit.")

    while True:
        user_question = input("\nYour question: ")
        if user_question.lower() == 'exit':
            print("Exiting chatbot. Goodbye!")
            break

        if not user_question.strip():
            print("Please enter a question.")
            continue

        inputs = {"question": user_question, "generation": None, "documents": []}

        print("\n--- Chatbot Flow ---")
        try:
            full_output = []
            async for s in app.astream(inputs):
                for key, value in s.items():
                    print(f"Node: {key}")
                    full_output.append(value)

            final_generation = None
            for output_state in reversed(full_output):
                if "generation" in output_state and output_state["generation"] is not None:
                    final_generation = output_state["generation"]
                    break

            if final_generation:
                print("\n--- FINAL ANSWER ---")
                print(final_generation)
            else:
                print("\n--- CHATBOT COULD NOT GENERATE AN ANSWER ---")

        except Exception as e:
            print(f"\n--- An error occurred during chatbot interaction: {e} ---")
    return final_generation

if __name__ == "__main__":
    asyncio.run(run_chatbot())
