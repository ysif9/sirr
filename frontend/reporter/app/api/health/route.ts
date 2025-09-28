/**
 * Health Check API Route
 */

import { NextResponse } from 'next/server';
import { getRAGConfig, validateConfig } from '@/lib/rag-config';

export async function GET() {
  try {
    const config = getRAGConfig();
    const configErrors = validateConfig(config);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        configuration: configErrors.length === 0,
        googleApi: !!config.googleApiKey,
        tavilyApi: !!config.tavilyApiKey,
        vectorStore: !!config.vectorStore.password,
      }
    };

    // Overall health check
    const isHealthy = Object.values(health.services).every(service => service === true);
    health.status = isHealthy ? 'healthy' : 'unhealthy';

    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
