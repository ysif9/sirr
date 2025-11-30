/**
 * RAG Services Implementation
 */

import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import axios from 'axios';
import { Document, SearchResult, GradeResult, RAGConfig, LLMError, WebSearchError, VectorStoreError, PROMPT_TEMPLATES } from './rag-types';

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
        binaryScore: scope.includes('yes') ? 'yes' : 'no'
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
 * PostgreSQL PGVector-based vector store using Google Gemini embeddings
 */
export class PostgreSQLVectorStore {
  private embeddings: GoogleGenerativeAIEmbeddings;
  private vectorStore: PGVectorStore | null = null;
  private isInitialized: boolean = false;

  constructor(private config: RAGConfig) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      apiKey: config.googleApiKey,
    });

    // Initialize connection to PostgreSQL
    this.initializeVectorStore();
  }

  private async initializeVectorStore(): Promise<void> {
    try {
      console.log('Initializing PostgreSQL vector store connection...');

      const connectionString = `postgresql://${this.config.vectorStore.username}:${this.config.vectorStore.password}@${this.config.vectorStore.host}:${this.config.vectorStore.port}/${this.config.vectorStore.database}`;

      this.vectorStore = new PGVectorStore(this.embeddings, {
        postgresConnectionOptions: {
          connectionString,
        },
        tableName: "langchain_pg_embedding",
        collectionName: this.config.vectorStore.collectionName,
        collectionTableName: "langchain_pg_collection",
        columns: {
          idColumnName: "id",
          vectorColumnName: "embedding",
          contentColumnName: "document",
          metadataColumnName: "metadata",
        },
      });

      this.isInitialized = true;
      console.log('PostgreSQL vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing PostgreSQL vector store:', error);
      this.isInitialized = false;
    }
  }

async similaritySearch(query: string, k: number = 6): Promise<Document[]> {
  try {
    // Check if vector store is initialized
    if (!this.isInitialized || !this.vectorStore) {
      console.warn('Vector store not initialized, attempting to reinitialize...');
      await this.initializeVectorStore();

      if (!this.isInitialized || !this.vectorStore) {
        throw new VectorStoreError('Failed to initialize PostgreSQL vector store');
      }
    }

    console.log(`Performing similarity search for query: "${query}" with k=${k}`);

    // Perform similarity search using PGVector
    const results = await this.vectorStore.similaritySearch(query, k);


    // Filter by score threshold if available
    const filteredResults = results.filter(doc => {
      const score = doc.metadata?.score || 1.0;
      return score >= this.config.retriever.scoreThreshold;
    });


    return filteredResults;
  } catch (error) {
    console.error('Error in PostgreSQL similarity search:', error);

    // Fallback to sample documents for development/testing
    return this.fallbackSampleDocuments(query, k);
  }
}

  private fallbackSampleDocuments(query: string, k: number): Document[] {
    console.log('Using fallback sample documents due to database connection issues');

    // Sample Egyptian legal documents for fallback
    const sampleDocuments: Document[] = [
      {
        pageContent: "حقوق المستأجر في القانون المصري تشمل الحق في الانتفاع بالعين المؤجرة والحق في الحماية من الطرد التعسفي. يحق للمستأجر استخدام العين المؤجرة للغرض المتفق عليه في العقد.",
        metadata: { source: "قانون الإيجار المصري", title: "حقوق المستأجر", type: "legal_article", score: 0.8 }
      },
      {
        pageContent: "التزامات المؤجر تشمل تسليم العين المؤجرة في حالة صالحة للانتفاع والقيام بالصيانة اللازمة. كما يلتزم المؤجر بعدم التدخل في انتفاع المستأجر بالعين المؤجرة.",
        metadata: { source: "قانون الإيجار المصري", title: "التزامات المؤجر", type: "legal_article", score: 0.7 }
      },
      {
        pageContent: "عقد العمل في القانون المصري يحدد حقوق والتزامات كل من العامل وصاحب العمل. يحق للعامل الحصول على أجر عادل وإجازات سنوية وحماية من الفصل التعسفي.",
        metadata: { source: "قانون العمل المصري", title: "عقد العمل", type: "legal_article", score: 0.6 }
      }
    ];

    // Simple keyword matching for fallback
    const queryWords = query.toLowerCase().split(' ');
    const scoredDocs = sampleDocuments.map(doc => {
      const content = doc.pageContent.toLowerCase();
      let matchScore = 0;

      queryWords.forEach(word => {
        if (content.includes(word)) {
          matchScore += 1;
        }
      });

      return {
        ...doc,
        metadata: {
          ...doc.metadata,
          score: matchScore > 0 ? doc.metadata.score : 0.1
        }
      };
    });

    return scoredDocs
      .filter(doc => (doc.metadata.score || 0) >= 0.1)
      .sort((a, b) => (b.metadata.score || 0) - (a.metadata.score || 0))
      .slice(0, k);
  }
}

/**
 * RAG Workflow Service
 */
export class RAGWorkflowService {
  private llmService: LLMService;
  private webSearchService: WebSearchService;
  private vectorStore: PostgreSQLVectorStore;

  constructor(config: RAGConfig) {
    this.llmService = new LLMService(config);
    this.webSearchService = new WebSearchService(config);
    this.vectorStore = new PostgreSQLVectorStore(config);
  }

  async processQuery(question: string): Promise<string> {
    try {
      console.log('Processing query:', question);

      // Step 1: Check if question is legal
      const legalScope = await this.llmService.checkLegalScope(question);
      console.log('Legal scope:', legalScope.binaryScore);

      if (legalScope.binaryScore === 'no') {

        return PROMPT_TEMPLATES.apology.replace("{question}", question);
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
      if (needWebSearch && relevantDocs.length <= 2) {
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
