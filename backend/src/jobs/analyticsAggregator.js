const cron = require('node-cron');
const Analytics = require('../models/Analytics');
const { logger } = require('../middleware/logger');

function startAnalyticsAggregator() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const count = await Analytics.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      logger.info(`Daily analytics events processed: ${count}`);
    } catch (error) {
      logger.error('Analytics aggregation error', { error: error.message });
    }
  });
}

module.exports = { startAnalyticsAggregator };
