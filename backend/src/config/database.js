const mongoose = require('mongoose');
const { logger } = require('../middleware/logger');

module.exports = async function connectDatabase(retries = 5) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', { message: error.message, retriesLeft: retries });
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return connectDatabase(retries - 1);
  }
};
