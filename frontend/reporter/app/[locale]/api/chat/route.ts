/**
 * Chat API Route for RAG Legal Chatbot
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getRAGConfig, validateConfig } from '@/lib/rag-config';
import { RAGWorkflowService } from '@/lib/rag-services';
import { ChatRequest, ChatResponse } from '@/lib/rag-types';

// Error messages for internationalization
const errorMessages = {
  en: 'Sorry, an error occurred while processing your message. Please try again.',
  ar: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.',
};

// Initialize RAG service
let ragService: RAGWorkflowService | null = null;

function initializeRAGService() {
  if (!ragService) {
    const config = getRAGConfig();
    const configErrors = validateConfig(config);
    
    if (configErrors.length > 0) {
      console.error('RAG configuration errors:', configErrors);
      throw new Error(`Configuration errors: ${configErrors.join(', ')}`);
    }
    
    ragService = new RAGWorkflowService(config);
    console.log('RAG service initialized');
  }
  return ragService;
}

export async function POST(request: NextRequest) {
  let body: ChatRequest | null = null;
  try {
    // Parse request body
    body = await request.json();

    // FIX: Add a guard clause to ensure body is not null before destructuring.
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { message, sessionId, userId } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Initialize RAG service
    const rag = initializeRAGService();

    // Generate session ID if not provided
    const finalSessionId = sessionId || uuidv4();

    console.log('Processing chat request:', {
      sessionId: finalSessionId,
      userId,
      messageLength: message.length
    });

    const startTime = Date.now();

    // Process the message through RAG
    const response = await rag.processQuery(message.trim());
    
    const processingTime = Date.now() - startTime;

    // Prepare response
    const chatResponse: ChatResponse = {
      response,
      sessionId: finalSessionId,
      processingTime_ms: processingTime,
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
    };

    console.log('Chat request completed:', {
      sessionId: finalSessionId,
      processingTime,
      responseLength: response.length
    });

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Determine locale, default to 'en'
    const locale = body?.locale === 'ar' ? 'ar' : 'en';
    const responseMessage = errorMessages[locale];

    const errorResponse: ChatResponse = {
      response: responseMessage,
      sessionId: 'error',
      processingTime_ms: 0,
      metadata: {
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RAG Legal Chatbot API',
    endpoints: {
      'POST /api/chat': 'Send a chat message',
      'GET /api/health': 'Health check'
    }
  });
}