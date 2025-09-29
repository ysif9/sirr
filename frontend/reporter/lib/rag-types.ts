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
  locale?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  processingTime_ms: number;
  sources?: any[]; // FIX: Added optional sources property
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
  legal: `أنت مساعد قانوني متخصص في القانون المصري. استخدم السياق المقدم للإجابة على السؤال بدقة ووضوح.

السياق:
{context}

السؤال: {question}

تعليمات:
• أجب باللغة العربية فقط
• استند إلى السياق المقدم في إجابتك
• إذا لم تجد معلومات كافية في السياق، اذكر ذلك بوضوح
• قدم إجابة مفصلة ومفيدة
• اذكر المواد القانونية ذات الصلة إن وجدت

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

  gradeDocuments: `أنت خبير في تقييم مدى صلة الوثائق بالأسئلة القانونية.

السؤال: {question}

الوثيقة: {document}

هل هذه الوثيقة ذات صلة بالسؤال؟ أجب بـ "yes" أو "no" فقط.

الإجابة:`,

  gradeGeneration: `أنت خبير في تقييم جودة الإجابات القانونية.

السؤال: {question}

الإجابة المولدة: {generation}

السياق المستخدم: {context}

هل هذه الإجابة مفيدة وتجيب على السؤال بشكل صحيح؟ أجب بـ "yes" أو "no" فقط.

الإجابة:`,

  legalScope: `أنت خبير في تحديد ما إذا كان السؤال قانونياً أم لا.

السؤال: {question}

هل هذا السؤال متعلق بالقانون المصري أو يحتاج استشارة قانونية؟ أجب بـ "legal" أو "not_legal" فقط.

الإجابة:`,

  transformQuery: `حول السؤال التالي إلى استعلام بحث مناسب للبحث على الإنترنت:

السؤال الأصلي: {question}

استعلام البحث المحسن:`
};