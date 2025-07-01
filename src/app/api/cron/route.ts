import { NextResponse } from 'next/server'
import { createLogger, transports, format } from 'winston'

// Configure logging
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/cron.log' })
  ]
})

// API endpoint to call (update with your production endpoint)
const API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/rag`
  : '/api/rag'

export async function GET() {
  try {
    logger.info('Starting hourly API call');
    
    const response = await fetch(API_URL);
    const data = await response.json();

    logger.info('API call successful', {
      status: response.status,
      data
    });
    
    return NextResponse.json({ 
      success: true,
      data
    });
  } catch (error) {
    logger.error('API call failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}