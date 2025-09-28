/**
 * RAG Services Implementation
 */

import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import axios from 'axios';
import { Document, SearchResult, GradeResult, RAGConfig, LLMError, WebSearchError, PROMPT_TEMPLATES } from './rag-types';

/**
 * LLM Service using Google Gemini
 */
export class LLMService {
  private llm: ChatGoogleGenerativeAI;

  constructor(private config: RAGConfig) {
    this.llm = new ChatGoogleGenerativeAI({
      model: config.llm.model,
      temperature: config.llm.temperature,
      maxOutputTokens: config.llm.maxTokens,
      apiKey: config.googleApiKey,
    });
  }

  async generateWithTemplate(template: string, variables: Record<string, string>): Promise<string> {
    try {
      let prompt = template;
      for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      const response = await this.llm.invoke(prompt);
      return response.content as string;
    } catch (error) {
      throw new LLMError(`LLM generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async gradeDocument(question: string, document: Document): Promise<GradeResult> {
    try {
      const response = await this.generateWithTemplate(PROMPT_TEMPLATES.gradeDocuments, {
        question,
        document: document.pageContent
      });

      const score = response.toLowerCase().trim();
      return {
        binaryScore: score.includes('yes') ? 'yes' : 'no'
      };
    } catch (error) {
      throw new LLMError(`Document grading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async gradeGeneration(question: string, generation: string, documents: Document[]): Promise<GradeResult> {
    try {
      const context = documents.map(doc => doc.pageContent).join('\n\n');
      const response = await this.generateWithTemplate(PROMPT_TEMPLATES.gradeGeneration, {
        question,
        generation,
        context
      });

      const score = response.toLowerCase().trim();
      return {
        binaryScore: score.includes('yes') ? 'yes' : 'no'
      };
    } catch (error) {
      throw new LLMError(`Generation grading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkLegalScope(question: string): Promise<GradeResult> {
    try {
      const response = await this.generateWithTemplate(PROMPT_TEMPLATES.legalScope, {
        question
      });

      const scope = response.toLowerCase().trim();
      return {
        binaryScore: scope.includes('legal') ? 'yes' : 'no'
      };
    } catch (error) {
      throw new LLMError(`Legal scope check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transformQuery(question: string): Promise<string> {
    try {
      return await this.generateWithTemplate(PROMPT_TEMPLATES.transformQuery, {
        question
      });
    } catch (error) {
      throw new LLMError(`Query transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Web Search Service using Tavily API
 */
export class WebSearchService {
  constructor(private config: RAGConfig) {}

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      // Check if API key is available
      if (!this.config.tavilyApiKey || this.config.tavilyApiKey.trim() === '') {
        console.warn('Tavily API key not configured, skipping web search');
        return [];
      }

      console.log('Making Tavily API request with query:', query);

      const requestData = {
        api_key: this.config.tavilyApiKey,
        query,
        search_depth: 'basic',
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: maxResults
      };

      const response = await axios.post('https://api.tavily.com/search', requestData, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Tavily API response status:', response.status);

      if (!response.data || !response.data.results) {
        console.warn('No results returned from Tavily API, response:', response.data);
        return [];
      }

      console.log('Tavily API returned', response.data.results.length, 'results');

      return response.data.results.map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        content: result.content || '',
        score: result.score || 0
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Tavily API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 400) {
          console.error('Bad request to Tavily API - check API key and request format');
        } else if (error.response?.status === 401) {
          console.error('Unauthorized - check Tavily API key');
        } else if (error.response?.status === 429) {
          console.error('Rate limit exceeded for Tavily API');
        }
      } else {
        console.error('Non-Axios error in web search:', error);
      }

      // Return empty results instead of throwing to allow RAG to continue
      return [];
    }
  }
}

/**
 * Google Gemini embeddings-based vector store
 */
export class GeminiVectorStore {
  private documents: Document[] = [];
  private embeddings: GoogleGenerativeAIEmbeddings;
  private documentEmbeddings: number[][] = [];

  constructor(private config: RAGConfig) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      apiKey: config.googleApiKey,
    });

    // Initialize with some sample Egyptian legal documents
    this.documents = [
      {
        pageContent: "حقوق المستأجر في القانون المصري تشمل الحق في الانتفاع بالعين المؤجرة والحق في الحماية من الطرد التعسفي. يحق للمستأجر استخدام العين المؤجرة للغرض المتفق عليه في العقد.",
        metadata: { source: "قانون الإيجار المصري", title: "حقوق المستأجر", type: "legal_article" }
      },
      {
        pageContent: "التزامات المؤجر تشمل تسليم العين المؤجرة في حالة صالحة للانتفاع والقيام بالصيانة اللازمة. كما يلتزم المؤجر بعدم التدخل في انتفاع المستأجر بالعين المؤجرة.",
        metadata: { source: "قانون الإيجار المصري", title: "التزامات المؤجر", type: "legal_article" }
      },
      {
        pageContent: "عقد العمل في القانون المصري يحدد حقوق والتزامات كل من العامل وصاحب العمل. يحق للعامل الحصول على أجر عادل وإجازات سنوية وحماية من الفصل التعسفي.",
        metadata: { source: "قانون العمل المصري", title: "عقد العمل", type: "legal_article" }
      },
      {
        pageContent: "الزواج في القانون المصري يتطلب توافر شروط معينة منها الأهلية والرضا وعدم وجود موانع شرعية أو قانونية. يجب توثيق عقد الزواج لدى المأذون المختص.",
        metadata: { source: "قانون الأحوال الشخصية", title: "الزواج", type: "legal_article" }
      },
      {
        pageContent: "الطلاق في القانون المصري له أنواع مختلفة منها الطلاق الرجعي والطلاق البائن. للمطلقة حقوق مالية تشمل النفقة والمتعة ونفقة العدة.",
        metadata: { source: "قانون الأحوال الشخصية", title: "الطلاق", type: "legal_article" }
      }
    ];

    // Initialize embeddings for documents
    this.initializeEmbeddings();
  }

  private async initializeEmbeddings(): Promise<void> {
    try {
      const documentTexts = this.documents.map(doc => doc.pageContent);
      this.documentEmbeddings = await this.embeddings.embedDocuments(documentTexts);
      console.log('Document embeddings initialized successfully');
    } catch (error) {
      console.error('Error initializing document embeddings:', error);
      // Fallback to empty embeddings array
      this.documentEmbeddings = [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async similaritySearch(query: string, k: number = 6): Promise<Document[]> {
    try {
      // If embeddings are not initialized yet, wait for them
      if (this.documentEmbeddings.length === 0) {
        await this.initializeEmbeddings();
      }

      // If still no embeddings, fallback to keyword search
      if (this.documentEmbeddings.length === 0) {
        return this.fallbackKeywordSearch(query, k);
      }

      // Generate query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Calculate similarities
      const scoredDocs = this.documents.map((doc, index) => {
        const similarity = this.cosineSimilarity(queryEmbedding, this.documentEmbeddings[index]);
        return { doc, score: similarity };
      });

      // Filter by score threshold and return top k
      return scoredDocs
        .filter(item => item.score >= this.config.retriever.scoreThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map(item => ({
          ...item.doc,
          metadata: { ...item.doc.metadata, score: item.score }
        }));
    } catch (error) {
      console.error('Error in similarity search:', error);
      // Fallback to keyword search
      return this.fallbackKeywordSearch(query, k);
    }
  }

  private fallbackKeywordSearch(query: string, k: number): Document[] {
    console.log('Using fallback keyword search');
    const queryWords = query.toLowerCase().split(' ');

    const scoredDocs = this.documents.map(doc => {
      const content = doc.pageContent.toLowerCase();
      let score = 0;

      queryWords.forEach(word => {
        if (content.includes(word)) {
          score += 1;
        }
      });

      return { doc, score };
    });

    return scoredDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => ({
        ...item.doc,
        metadata: { ...item.doc.metadata, score: item.score }
      }));
  }
}

/**
 * RAG Workflow Service
 */
export class RAGWorkflowService {
  private llmService: LLMService;
  private webSearchService: WebSearchService;
  private vectorStore: GeminiVectorStore;

  constructor(config: RAGConfig) {
    this.llmService = new LLMService(config);
    this.webSearchService = new WebSearchService(config);
    this.vectorStore = new GeminiVectorStore(config);
  }

  async processQuery(question: string): Promise<string> {
    try {
      console.log('Processing query:', question);

      // Step 1: Check if question is legal
      const legalScope = await this.llmService.checkLegalScope(question);
      console.log('Legal scope:', legalScope.binaryScore);

      if (legalScope.binaryScore === 'no') {
        return await this.llmService.generateWithTemplate(PROMPT_TEMPLATES.apology, { question });
      }

      // Step 2: Retrieve relevant documents
      const documents = await this.vectorStore.similaritySearch(question, 6);
      console.log('Retrieved documents:', documents.length);

      // Step 3: Grade documents for relevance
      const relevantDocs: Document[] = [];
      let needWebSearch = false;

      for (const doc of documents) {
        const grade = await this.llmService.gradeDocument(question, doc);
        if (grade.binaryScore === 'yes') {
          relevantDocs.push(doc);
        } else {
          needWebSearch = true;
        }
      }

      console.log('Relevant documents:', relevantDocs.length);

      // Step 4: Web search if needed
      if (needWebSearch && relevantDocs.length < 2) {
        try {
          console.log('Performing web search');
          const transformedQuery = await this.llmService.transformQuery(question);
          const searchResults = await this.webSearchService.search(transformedQuery, 3);

          if (searchResults.length > 0) {
            const webDocs: Document[] = searchResults.map(result => ({
              pageContent: result.content,
              metadata: {
                source: result.url,
                title: result.title,
                type: 'web_search',
                score: result.score
              }
            }));

            relevantDocs.push(...webDocs);
            console.log('Added web search results:', webDocs.length);
          } else {
            console.log('No web search results found');
          }
        } catch (error) {
          console.error('Web search failed, continuing with available documents:', error);
          // Continue with whatever documents we have - don't let web search failure break the entire flow
        }
      }

      // Step 5: Generate response
      const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
      const response = await this.llmService.generateWithTemplate(PROMPT_TEMPLATES.legal, {
        context,
        question
      });

      console.log('Generated response length:', response.length);

      // Step 6: Grade generation quality
      const generationGrade = await this.llmService.gradeGeneration(question, response, relevantDocs);
      console.log('Generation grade:', generationGrade.binaryScore);

      return response;
    } catch (error) {
      console.error('RAG workflow error:', error);
      return 'عذراً، حدث خطأ في معالجة سؤالك. يرجى المحاولة مرة أخرى.';
    }
  }
}
