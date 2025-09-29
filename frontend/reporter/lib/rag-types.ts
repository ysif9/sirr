/**
 * Type definitions for the RAG Legal Chatbot
 */

export interface Document {
  pageContent: string;
  metadata: {
    source?: string;
    title?: string;
    type?: string;
    score?: number;
    [key: string]: any;
  };
}

export interface RAGState {
  question: string;
  documents: Document[];
  legalScope?: 'legal' | 'not_legal';
  webSearch?: 'Yes' | 'No';
  generation?: string;
  generationGrade?: 'yes' | 'no';
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  processingTime_ms: number;
  processingSteps?: string[];
  metadata?: {
    userId?: string;
    timestamp?: string;
    messageCount?: number;
    status?: string;
    error?: boolean;
    errorMessage?: string;
  };
}

export interface RAGConfig {
  googleApiKey: string;
  tavilyApiKey: string;
  vectorStore: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    collectionName: string;
  };
  llm: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  retriever: {
    k: number;
    scoreThreshold: number;
  };
  workflow: {
    maxIterations: number;
    timeoutMs: number;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface GradeResult {
  binaryScore: 'yes' | 'no';
  reasoning?: string;
}

// Error classes
export class RAGError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'RAGError';
  }
}

export class LLMError extends RAGError {
  constructor(message: string) {
    super(message, 'LLM_ERROR');
    this.name = 'LLMError';
  }
}

export class VectorStoreError extends RAGError {
  constructor(message: string) {
    super(message, 'VECTOR_STORE_ERROR');
    this.name = 'VectorStoreError';
  }
}

export class WebSearchError extends RAGError {
  constructor(message: string) {
    super(message, 'WEB_SEARCH_ERROR');
    this.name = 'WebSearchError';
  }
}

// Prompt templates
export const PROMPT_TEMPLATES = {
  legal: `أنت مساعد قانوني متخصص في القانون المصري. استخدم السياق المقدم للإجابة على السؤال بدقة ووضوح وبأسلوب يراعي احتياجات المستخدم.

السياق:
{context}

السؤال: {question}

تعليمات:
• أجب باللغة العربية فقط
• استند إلى السياق المقدم في إجابتك دون الإشارة إلى وجود أو نقص المعلومات فيه
• قدّم إجابة مفصلة وواضحة ومباشرة للمستخدم
• إذا كانت هناك جوانب قد تختلف بحسب ظروف كل حالة أو بحسب تفسير المحكمة، فاذكر ذلك بأسلوب مهني
• يمكنك الإشارة إلى المواد القانونية ذات الصلة إن وُجدت، دون الإشارة إلى ما إذا كانت مذكورة في السياق أم لا
• يُفضل تنبيه المستخدم إلى الرجوع لنص القانون الكامل أو استشارة محامٍ مختص عند الحاجة
اذا لم يقدم تفاصيل عن مادة قم بتجاهلها
الإجابة:`,

  apology: `أعتذر، ولكنني متخصص في تقديم الاستشارات القانونية المصرية فقط.

سؤالك: {question}

لا يمكنني الإجابة على هذا السؤال لأنه خارج نطاق تخصصي القانوني. يرجى طرح سؤال متعلق بالقانون المصري وسأكون سعيداً لمساعدتك.

أمثلة على الأسئلة التي يمكنني الإجابة عليها:
• حقوق المستأجر والمالك
• قوانين العمل والعمال
• الأحوال الشخصية والزواج والطلاق
• القانون التجاري والشركات
• القانون الجنائي والعقوبات`,

  gradeDocuments: `You are a grader assessing relevance of a retrieved document to a user question.

If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant.

Give a binary score: "yes" or "no" to indicate whether the document is relevant to the question.

Retrieved document:

{document}

User question: {question}

Answer:`,

  gradeGeneration: `You are an expert in evaluating the quality of legal answers.

Question: {question}

Generated answer: {generation}

Used context: {context}

Is this answer helpful and does it correctly answer the question? Respond with "yes" or "no" only.

Answer:`,

    legalScope :`You are an expert at determining whether a question is legal or not, specifically if it relates to Egyptian law.

Only respond with "yes" if the question is **clearly and directly** about a legal matter governed by the **Egyptian constitution, civil law, traffic law, drug laws, or penalties law**.

Do **not** mark questions as "yes" if they are:
- Social, political, religious, or moral in nature **without a clear legal context**
- General inquiries or opinions that are **not based on specific legal issues**
- Vague or indirectly related to law without explicit legal terminology or implications

Use "yes" **only if the question requires legal interpretation, action, or reference to Egyptian legal texts**. Otherwise, respond with "no".

Question: {question}

Answer:
`,


  transformQuery: `You are a question rewriter that transforms user questions into optimized queries for web search.

Your task is to:
- Understand the underlying legal intent behind the original question.
- Rewrite the question in Arabic, making it clearer, more specific, and well-suited for search engines.
- Ensure the rewritten question focuses exclusively on Egyptian laws or the Egyptian constitution.


Original question: {question}

Return only the improved Arabic search query.
`
};
