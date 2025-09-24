import os
import pprint
from typing import List, Dict, Any
from typing_extensions import TypedDict
import asyncio  # For running async functions
import os
import pprint
from typing import List, Dict, Any
from typing_extensions import TypedDict
import asyncio # For running async functions
import json # Import json to format tool schema
import re
# LangChain / LangGraph Imports
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, SystemMessage  # Added SystemMessage import
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.graph import END, StateGraph, START
from dotenv import load_dotenv
from langchain.docstore.document import Document
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
    # For a demo, you might comment out the web search path in the graph if you don't have it.
    # exit() # Or exit if web search is mandatory

# --- LLMs and Embeddings ---
print("Initializing Embedding Model: intfloat/multilingual-e5-large...")
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large",
                                   encode_kwargs={"normalize_embeddings": True})
print("Embedding Model initialized.")

print("Initializing Generative LLM (Gemini 2.5 Pro)...")
llm_gen = ChatGoogleGenerativeAI(model="models/gemini-2.5-pro", temperature=0.3, max_output_tokens=1000)
print("Generative LLM initialized.")

print("Initializing Grader LLM (Gemini 2.5 Pro) with lower temperature for more deterministic output...")
llm_grader = ChatGoogleGenerativeAI(model="models/gemini-2.5-pro", temperature=0,
                                    max_output_tokens=100)  # Lower max_tokens for graders
print("Grader LLM initialized.")

# --- Vector Store ---
print(f"Loading ChromaDB from {PERSIST_DIRECTORY}...")
try:
    vectorstore = Chroma(
        persist_directory=PERSIST_DIRECTORY,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME
    )
    retriever = vectorstore.as_retriever()
    print("ChromaDB loaded and retriever created successfully.")
except Exception as e:
    print(f"Error loading ChromaDB: {e}")
    print("Please ensure `data_loading.py` has been run at least once to create the ChromaDB.")
    exit()

# --- Web Search Tool ---
web_search_tool = TavilySearchResults(max_results=3)  # Limit results for conciseness


# --- Graph State ---
class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        question: The user's initial question.
        generation: The LLM's generated answer.
        documents: A list of retrieved documents (LangChain Document objects).
        query_analysis: The LLM's analysis of the query.
        relevance_score: 'yes' or 'no' from relevance grader.
        hallucination_score: 'yes' or 'no' from hallucination grader.
        answer_score: 'yes' or 'no' from answer grader.
    """
    question: str
    generation: str
    documents: List[Document]
    query_analysis: str
    relevance_score: str
    hallucination_score: str
    answer_score: str


# --- Tool Definitions for Query Analysis Router ---
class LegalQuestion(BaseModel):
    """
    Use this tool for questions that are related to Egyptian law and could be answered by searching the vectorstore.
    Examples: "ما هي شروط اكتساب الجنسية المصرية؟", "متى يسقط الرهن الحيازي؟", "ماذا يحظر فعله على الطريق؟"
    """
    query: str = Field(description="The query to use when searching the legal knowledge base.")


class NonLegalQuestion(BaseModel):
    """
    Use this tool for questions that are not related to Egyptian law, or are general conversational greetings.
    Examples: "كيف حالك اليوم؟", "من هو رئيس مصر؟", "ما هو الطقس في القاهرة؟"
    """
    query: str = Field(description="The original user question to respond to directly.")


# --- MODIFIED: Explicitly define tools for the prompt ---
tools = [LegalQuestion, NonLegalQuestion]
tool_schemas = [tool.schema() for tool in tools]
formatted_tool_schemas = json.dumps(tool_schemas, indent=2, ensure_ascii=False)  # Keep Arabic characters

# Preamble for Query Analysis LLM
query_analysis_preamble = f"""
أنت مساعد خبير في تحليل استفسارات المستخدمين القانونية. مهمتك هي تحديد ما إذا كان السؤال يتعلق بالقانون المصري ويمكن الإجابة عليه من قاعدة بيانات قانونية، أم أنه سؤال عام أو غير قانوني.
يجب عليك استخدام إحدى الأدوات المتاحة للإجابة على السؤال.

أدواتك المتاحة هي:
{formatted_tool_schemas}

إذا كان السؤال قانونيًا بوضوح ويتعلق بالقانون المصري، فاستخدم أداة `legal_question`.
إذا كان السؤال عامًا، أو تحية، أو لا يتعلق بالقانون المصري، فاستخدم أداة `non_legal_question`.
يجب أن يكون ناتجك هو استدعاء لأحد الأدوات.
"""

# LLM with tool use for query analysis (without preamble in init)
# We still bind_tools for LangChain's internal handling, but the prompt is key for Gemini
structured_llm_router_tools = llm_grader.bind_tools(
    tools=tools  # Use the list of tools defined earlier
)
query_analysis_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(content=query_analysis_preamble),  # Use SystemMessage with explicit tool info
        HumanMessage(content="{question}")
    ]
)
query_analysis_chain = query_analysis_prompt | structured_llm_router_tools


# --- Grader LLM Chains (no changes) ---

# Retrieval Grader
class GradeDocuments(BaseModel):
    """Binary score for relevance check on retrieved documents."""
    binary_score: str = Field(description="Documents are relevant to the question, 'yes' or 'no'")


retrieval_grader_preamble = """أنت مقيّم يقوم بتقييم مدى صلة المستندات المسترجعة بسؤال المستخدم.
إذا كان المستند يحتوي على كلمات مفتاحية أو معنى دلالي متعلق بسؤال المستخدم، فقم بتقييمه على أنه ذو صلة.
امنح درجة ثنائية "نعم" أو "لا" للإشارة إلى ما إذا كان المستند ذو صلة بالسؤال.
"""
retrieval_grader_llm_structured = llm_grader.with_structured_output(GradeDocuments)
retrieval_grader_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(content=retrieval_grader_preamble),  # Use SystemMessage
        HumanMessage(content="المستند المسترجع: \\n\\n {document} \\n\\n سؤال المستخدم: {question}")
    ]
)
retrieval_grader_chain = retrieval_grader_prompt | retrieval_grader_llm_structured


# Hallucination Grader
class GradeHallucinations(BaseModel):
    """Binary score for hallucination present in generation answer."""
    binary_score: str = Field(description="Answer is grounded in the facts, 'yes' or 'no'")


hallucination_grader_preamble = """أنت مقيّم يقوم بتقييم ما إذا كانت إجابة LLM تستند إلى / مدعومة بمجموعة من الحقائق المسترجعة.
امنح درجة ثنائية "نعم" أو "لا". "نعم" تعني أن الإجابة تستند إلى / مدعومة بمجموعة الحقائق.
"""
hallucination_grader_llm_structured = llm_grader.with_structured_output(GradeHallucinations)
hallucination_grader_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(content=hallucination_grader_preamble),  # Use SystemMessage
        HumanMessage(content="مجموعة الحقائق: \\n\\n {documents} \\n\\n إجابة LLM: {generation}")
    ]
)
hallucination_grader_chain = hallucination_grader_prompt | hallucination_grader_llm_structured


# Answer Grader
class GradeAnswer(BaseModel):
    """Binary score to assess answer addresses question."""
    binary_score: str = Field(description="Answer addresses the question, 'yes' or 'no'")


answer_grader_preamble = """أنت مقيّم يقوم بتقييم ما إذا كانت الإجابة تعالج / تحل السؤال.
امنح درجة ثنائية "نعم" أو "لا". "نعم" تعني أن الإجابة تحل السؤال.
"""
answer_grader_llm_structured = llm_grader.with_structured_output(GradeAnswer)
answer_grader_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(content=answer_grader_preamble),  # Use SystemMessage
        HumanMessage(content="سؤال المستخدم: \\n\\n {question} \\n\\n إجابة LLM: {generation}")
    ]
)
answer_grader_chain = answer_grader_prompt | answer_grader_llm_structured

# --- Generation Chain ---
rag_generation_preamble = """أنت مساعد للإجابة على الأسئلة القانونية. استخدم قطع السياق المسترجعة التالية للإجابة على السؤال بدقة ومهنية، مع التركيز على القانون المصري. إذا لم تعرف الإجابة من السياق المقدم، قل أنك لا تعرف. استخدم ثلاث جمل كحد أقصى وحافظ على الإجابة موجزة ومباشرة.
"""


def rag_prompt_builder(x):
    formatted_docs = "\n\n".join([doc.page_content for doc in x["documents"]])
    return ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=rag_generation_preamble),  # Use SystemMessage
            HumanMessage(content=f"السؤال: {x['question']} \\n\\n السياق: {formatted_docs} \\n\\n الإجابة: ")
        ]
    )


rag_chain = rag_prompt_builder | llm_gen | StrOutputParser()

# --- Static Apology Message ---
STATIC_APOLOGY_MESSAGE = """
أنا مساعدك القانوني الذكي، مهمتي هي مساعدتك في أي استفسارات تتعلق بالقانون المصري.
عذرًا، لا يمكنني مساعدتك في الأسئلة العامة أو غير القانونية. يرجى الرجوع إلى مساعدين ذكاء اصطناعي آخرين لمثل هذه الأسئلة.
"""

# --- Web Search Generation Chain ---
web_rag_generation_preamble = """أنت مساعد للإجابة على الأسئلة. استخدم قطع السياق المسترجعة التالية من البحث عبر الويب للإجابة على السؤال. إذا لم تعرف الإجابة من السياق المقدم، قل أنك لا تعرف. استخدم ثلاث جمل كحد أقصى وحافظ على الإجابة موجزة.
"""


def web_rag_prompt_builder(x):
    formatted_docs = "\n\n".join([doc.page_content for doc in x["documents"]])
    return ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=web_rag_generation_preamble),  # Use SystemMessage
            HumanMessage(
                content=f"السؤال: {x['question']} \\n\\n السياق من البحث على الويب: {formatted_docs} \\n\\n الإجابة: ")
        ]
    )


web_rag_chain = web_rag_prompt_builder | llm_gen | StrOutputParser()


# --- Graph Nodes ---

async def query_analysis_node(state: GraphState) -> Dict[str, Any]:  # Made async
    """
    Analyzes the user's question to determine if it's legal or non-legal.
    """
    print("---QUERY ANALYSIS---")
    question = state["question"]

    try:
        response = await query_analysis_chain.ainvoke({"question": question})

        # --- MODIFIED: More robust tool_calls parsing for ChatGoogleGenerativeAI ---
        tool_calls = []
        if hasattr(response, 'tool_calls') and response.tool_calls:
            tool_calls.extend(response.tool_calls)
        # Sometimes, Gemini might output tool code in content if not perfectly parsed
        elif response.content and 'tool_code' in response.content:
            try:
                # Attempt to parse tool call from content if it's structured as code
                # This is a heuristic and might need refinement based on actual LLM output patterns
                tool_code_match = re.search(r'tool_code\s*\((.*?)\)', response.content, re.DOTALL)
                if tool_code_match:
                    tool_json_str = tool_code_match.group(1)
                    # Attempt to clean and load JSON
                    # This might still be brittle. LLM should ideally use proper tool_calls.
                    tool_json_str = tool_json_str.replace("\\'", "'").replace("\\\"", "\"").replace("```json\n",
                                                                                                    "").replace("\n```",
                                                                                                                "").strip()
                    tool_info = json.loads(tool_json_str)
                    # Reconstruct a pseudo FunctionCall object
                    if 'name' in tool_info and 'arguments' in tool_info:
                        # Create a mock tool call object that resembles what LangChain expects
                        class MockFunctionCall:
                            def __init__(self, name, args):
                                self.name = name
                                self.args = args

                        tool_calls.append(MockFunctionCall(tool_info['name'], tool_info['arguments']))
            except json.JSONDecodeError as e:
                print(f"---DEBUG: Failed to parse tool call from content: {e}---")
            except Exception as e:
                print(f"---DEBUG: Generic error parsing tool call from content: {e}---")

        if tool_calls:
            tool_call = tool_calls[0]  # Get the first tool call
            if tool_call.name == "legal_question":
                print(f"---DECISION: LEGAL QUESTION (Query: {tool_call.args.get('query')})---")
                return {"question": tool_call.args.get('query'), "query_analysis": "legal"}
            elif tool_call.name == "non_legal_question":
                print(f"---DECISION: NON-LEGAL QUESTION (Query: {tool_call.args.get('query')})---")
                return {"question": tool_call.args.get('query'), "query_analysis": "non_legal"}

        # --- MODIFIED: Default to 'legal' if LLM doesn't call a tool or its response is unexpected ---
        print(
            f"---DECISION: LLM DID NOT CALL A TOOL. Defaulting to LEGAL. LLM text: {response.content[:100] if response.content else 'None'}---")
        return {"question": question, "query_analysis": "legal"}  # <--- CHANGED DEFAULT HERE
    except Exception as e:
        print(f"---ERROR IN QUERY ANALYSIS: {e}. Defaulting to legal.---")
        # Ensure 'question' is always returned to maintain state
        return {"question": question, "query_analysis": "legal"}  # <--- CHANGED DEFAULT HERE


def retrieve_node(state: GraphState) -> Dict[str, List[Document]]:
    """
    Retrieves documents from the vector store based on the legal question.
    """
    print("---RETRIEVE FROM VECTORSTORE---")
    question = state["question"]
    documents = retriever.invoke(question)  # This is a synchronous call
    return {"documents": documents, "question": question}


async def grade_documents_node(state: GraphState) -> Dict[str, Any]:
    """
    Determines whether the retrieved documents are relevant to the question.
    """
    print("---GRADE DOCUMENT RELEVANCE---")
    question = state["question"]
    documents = state["documents"]

    filtered_docs = []
    relevance_score = "no"

    for d in documents:
        try:
            score = await retrieval_grader_chain.ainvoke(
                {"question": question, "document": d.page_content}
            )
            grade = score.binary_score
            if grade == "yes":
                print(
                    f"---GRADE: DOCUMENT RELEVANT (Source: {os.path.basename(d.metadata.get('source'))}, Article: {d.metadata.get('article_number')})---")
                filtered_docs.append(d)
                relevance_score = "yes"
            else:
                print(
                    f"---GRADE: DOCUMENT NOT RELEVANT (Source: {os.path.basename(d.metadata.get('source'))}, Article: {d.metadata.get('article_number')})---")
        except Exception as e:
            print(f"---ERROR GRADING DOCUMENT: {e}. Assuming NOT relevant.---")
            continue

    return {"documents": filtered_docs, "question": question, "relevance_score": relevance_score}


async def generate_node(state: GraphState) -> Dict[str, Any]:
    """
    Generates an answer using the LLM based on retrieved documents or web search results.
    """
    print("---GENERATE ANSWER---")
    question = state["question"]
    documents = state["documents"]

    if state.get("query_analysis") == "web_search_context":
        print("---Using Web Search RAG Chain---")
        generation = await web_rag_chain.ainvoke({"documents": documents, "question": question})
    else:
        print("---Using VectorStore RAG Chain---")
        generation = await rag_chain.ainvoke({"documents": documents, "question": question})

    return {"question": question, "documents": documents, "generation": generation}


async def web_search_node(state: GraphState) -> Dict[str, Any]:
    """
    Performs a web search based on the question.
    """
    print("---PERFORMING WEB SEARCH---")
    question = state["question"]
    try:
        docs = web_search_tool.invoke({"query": question})
        web_results_docs = [Document(page_content=d["content"], metadata={"source": d["url"]}) for d in docs]
        print(f"---WEB SEARCH FOUND {len(web_results_docs)} RESULTS---")
    except Exception as e:
        print(f"---ERROR DURING WEB SEARCH: {e}. No web results.---")
        web_results_docs = []

    return {"documents": web_results_docs, "question": question, "query_analysis": "web_search_context"}


async def form_apology_node(state: GraphState) -> Dict[str, Any]:
    """
    Generates a static apology message for non-legal questions.
    """
    print("---FORMING STATIC APOLOGY---")
    return {"question": state["question"], "generation": STATIC_APOLOGY_MESSAGE}


async def grade_generation_node(state: GraphState) -> Dict[str, Any]:
    """
    Determines whether the generation is grounded in the document and answers the question.
    This combines Hallucination and Answer grading.
    """
    print("---CHECK HALLUCINATIONS AND ANSWER RELEVANCE---")
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    hallucination_score = "no"
    answer_score = "no"

    if not documents:
        print("---NO DOCUMENTS PROVIDED FOR GROUNDING CHECK---")
        try:
            a_score = await answer_grader_chain.ainvoke(
                {"question": question, "generation": generation}
            )
            answer_score = a_score.binary_score
            print(f"---ANSWER GRADE (without grounding): {answer_score}---")
            hallucination_score = "yes"
        except Exception as e:
            print(f"---ERROR GRADING ANSWER (no documents): {e}. Defaulting to NOT useful.---")
            answer_score = "no"

    else:
        try:
            h_score = await hallucination_grader_chain.ainvoke(
                {"documents": "\n".join([d.page_content for d in documents]), "generation": generation}
            )
            hallucination_score = h_score.binary_score
            print(f"---HALLUCINATION SCORE: {hallucination_score}---")

            if hallucination_score == "yes":
                a_score = await answer_grader_chain.ainvoke(
                    {"question": question, "generation": generation}
                )
                answer_score = a_score.binary_score
                print(f"---ANSWER GRADE: {answer_score}---")
            else:
                print("---GENERATION NOT GROUNDED, SKIPPING ANSWER GRADE---")

        except Exception as e:
            print(f"---ERROR GRADING GENERATION: {e}. Defaulting to NOT useful.---")
            hallucination_score = "no"
            answer_score = "no"

    return {
        "question": question,
        "documents": documents,
        "generation": generation,
        "hallucination_score": hallucination_score,
        "answer_score": answer_score
    }


# --- Graph Edges (Decision Logic) ---

def route_question(state: GraphState) -> str:
    """
    Routes the question based on query analysis.
    """
    print("---ROUTE QUESTION---")
    query_analysis_result = state["query_analysis"]

    if query_analysis_result == "non_legal":
        print("---ROUTE TO APOLOGY (NON-LEGAL)---")
        return "form_apology"
    elif query_analysis_result == "legal":
        print("---ROUTE TO RETRIEVE (LEGAL)---")
        return "retrieve"
    else:
        print("---ROUTE TO APOLOGY (UNCLASSIFIED)---")
        return "form_apology"


def decide_on_relevance(state: GraphState) -> str:
    """
    Determines whether to generate an answer, or perform web search if documents are not relevant.
    """
    print("---DECIDE ON DOCUMENT RELEVANCE---")
    relevance = state["relevance_score"]

    if relevance == "yes":
        print("---DECISION: DOCUMENTS ARE RELEVANT, GENERATE---")
        return "generate"
    else:
        print("---DECISION: DOCUMENTS NOT RELEVANT, TRY WEB SEARCH---")
        return "web_search"


def decide_on_generation_quality(state: GraphState) -> str:
    """
    Determines if generation is good enough, or needs regeneration/web search.
    """
    print("---DECIDE ON GENERATION QUALITY---")
    hallucination_score = state["hallucination_score"]
    answer_score = state["answer_score"]

    if hallucination_score == "no":
        print("---DECISION: GENERATION NOT GROUNDED, RE-GENERATE---")
        return "generate"
    elif answer_score == "no":
        print("---DECISION: GENERATION DOES NOT ANSWER QUESTION, TRY WEB SEARCH---")
        return "web_search"
    else:
        print("---DECISION: GENERATION IS GOOD, END---")
        return "end"


# --- Build Graph ---
print("\n--- Building LangGraph Workflow ---")
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("query_analysis", query_analysis_node)  # B
workflow.add_node("form_apology", form_apology_node)  # C
workflow.add_node("retrieve", retrieve_node)  # D
workflow.add_node("grade_documents", grade_documents_node)  # E
workflow.add_node("generate", generate_node)  # F
workflow.add_node("web_search", web_search_node)  # G
workflow.add_node("grade_generation", grade_generation_node)  # H, I combined

# Build graph
workflow.add_edge(START, "query_analysis")  # A --> B

workflow.add_conditional_edges(
    "query_analysis",
    route_question,
    {
        "form_apology": "form_apology",  # B -- non legal --> C
        "retrieve": "retrieve",  # B -- legal Question --> D
    },
)

workflow.add_edge("form_apology", END)  # C --> J (end with apology)

workflow.add_edge("retrieve", "grade_documents")  # D --> E

workflow.add_conditional_edges(
    "grade_documents",
    decide_on_relevance,
    {
        "generate": "generate",  # E -- Yes --> F
        "web_search": "web_search",  # E -- No --> G
    },
)

workflow.add_edge("web_search", "generate")  # G --> F (web search results feed into generation)

workflow.add_edge("generate", "grade_generation")  # F --> H/I combined

workflow.add_conditional_edges(
    "grade_generation",
    decide_on_generation_quality,
    {
        "generate": "generate",  # H -- Yes --> F (regenerate if hallucination)
        "web_search": "web_search",  # I -- No --> G (if grounded but not answering)
        "end": END,  # I -- Yes --> J
    },
)

# Compile the graph
app = workflow.compile()
print("--- LangGraph Workflow Compiled ---")


# --- Main Execution Loop (Interactive Chatbot) ---
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


if __name__ == "__main__":
    asyncio.run(run_chatbot())
