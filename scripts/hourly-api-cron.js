const cron = require('node-cron');
const axios = require('axios');
const { createLogger, transports, format } = require('winston');

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
});

// API endpoint to call (update with your actual endpoint)
const API_URL = 'http://localhost:3000/api/rag';

// Schedule job to run every hour at minute 0
cron.schedule('*/1 * * * * *', async () => {
  try {
    logger.info('Starting hourly API call');
    
    const response = await axios.get(API_URL, {
      
    });

    logger.info('API call successful', {
      status: response.status,
      data: response.data
    });
  } catch (error) {
    logger.error('API call failed', {
      error: error.message,
      stack: error.stack
    });
  }
});

logger.info('Cron job scheduler started');
console.log('Cron job scheduler running. Check logs/cron.log for details.');