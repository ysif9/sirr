/**
 * RAG Configuration Management
 */

import { RAGConfig } from './rag-types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the main .env file
if (typeof window === 'undefined') {
  // Server-side: load from main project .env file
  const mainEnvPath = path.resolve(process.cwd(), '../../.env');
  console.log('Loading .env from:', mainEnvPath);
  dotenv.config({ path: mainEnvPath });
}

export function getRAGConfig(): RAGConfig {
  return {
    googleApiKey: process.env.GOOGLE_API_KEY || '',
    tavilyApiKey: process.env.TAVILY_API_KEY || '',
    vectorStore: {
      host: 'localhost',
      port: parseInt(process.env.VECTOR_HOST_PORT || '5434'),
      database: process.env.VECTOR_DB_NAME || 'vector_dev',
      username: process.env.POSTGRES_DB_USER || 'postgres',
      password: process.env.POSTGRES_DB_PASSWORD || '',
      collectionName: 'egyptian_law_articles',
    },
    llm: {
      model: 'models/gemini-2.0-flash',
      temperature: 0,
      maxTokens: 4096,
    },
    retriever: {
      k: 6,
      scoreThreshold: 0.5,
    },
    workflow: {
      maxIterations: 3,
      timeoutMs: 300000,
    },
  };
}

export function validateConfig(config: RAGConfig): string[] {
  const errors: string[] = [];

  if (!config.googleApiKey) {
    errors.push('GOOGLE_API_KEY is required');
  }

  if (!config.tavilyApiKey) {
    errors.push('TAVILY_API_KEY is required');
  }

  if (!config.vectorStore.password) {
    errors.push('PG_PASSWORD is required');
  }

  // Log configuration status for debugging
  console.log('RAG Configuration validation:', {
    googleApiKey: config.googleApiKey ? 'Present' : 'Missing',
    tavilyApiKey: config.tavilyApiKey ? `Present (${config.tavilyApiKey.substring(0, 8)}...)` : 'Missing',
    vectorStorePassword: config.vectorStore.password ? 'Present' : 'Missing'
  });

  return errors;
}
