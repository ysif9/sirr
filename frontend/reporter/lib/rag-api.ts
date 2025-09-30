/**
 * API configuration and utilities for the RAG Legal Chatbot
 */

export const RAG_API_CONFIG = {
  RAG_SERVICE_URL: process.env.NEXT_PUBLIC_RAG_SERVICE_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
};

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

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'error';
  timestamp: string;
  services?: {
    vectorStore: boolean;
    llm: boolean;
    webSearch: boolean;
    chatbotService: boolean;
    overall: boolean;
  };
}

/**
 * Send a chat message to the RAG service
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${RAG_API_CONFIG.RAG_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    throw error;
  }
}

/**
 * Send a streaming chat message to the RAG service
 * For now, this simulates streaming by using the regular API and yielding chunks
 */
export async function* sendStreamingChatMessage(request: ChatRequest): AsyncGenerator<Partial<ChatResponse>, ChatResponse, unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_API_CONFIG.TIMEOUT);

  try {
    // Use the regular chat endpoint since we don't have streaming yet
    const response = await fetch(`${RAG_API_CONFIG.RAG_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();

    // Simulate streaming by yielding the response in chunks
    const words = data.response.split(' ');
    let currentText = '';

    // Yield progress updates
    yield {
      response: '',
      sessionId: data.sessionId,
      processingTime_ms: 0,
      metadata: { ...data.metadata, status: 'processing' }
    };

    // Simulate typing effect by yielding words progressively
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];

      yield {
        response: currentText,
        sessionId: data.sessionId,
        processingTime_ms: data.processingTime_ms,
        metadata: { ...data.metadata, status: 'streaming' }
      };

      // Small delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Return the final response
    return {
      ...data,
      metadata: { ...data.metadata, status: 'completed' }
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    throw error;
  }
}

/**
 * Check the health of the RAG service
 */
export async function checkServiceHealth(): Promise<HealthCheckResponse> {
  try {
    const response = await fetch(`${RAG_API_CONFIG.RAG_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Clear a chat session
 */
export async function clearChatSession(sessionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${RAG_API_CONFIG.RAG_SERVICE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Failed to clear session'
    };
  }
}

/**
 * Get service statistics
 */
export async function getServiceStats(): Promise<any> {
  try {
    const response = await fetch(`${RAG_API_CONFIG.RAG_SERVICE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}