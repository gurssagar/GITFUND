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

// API endpoint to call (update with your production endpoint)
const API_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/rag`
  : 'http://localhost:3000/api/rag';

module.exports = async (req, res) => {
  try {
    logger.info('Starting hourly API call');
    
    const response = await axios.get(API_URL);

    logger.info('API call successful', {
      status: response.status,
      data: response.data
    });
    
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('API call failed', {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};