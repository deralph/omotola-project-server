const http = require('http');
const dotenv = require('dotenv');
const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const { logger } = require('./src/middleware/logger');
const { startReminderScheduler } = require('./src/jobs/reminderScheduler');
const { startAnalyticsAggregator } = require('./src/jobs/analyticsAggregator');

dotenv.config();

const PORT = process.env.PORT || 5000;
let server;

(async () => {
  try {
    await connectDatabase();
    server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
    startReminderScheduler();
    startAnalyticsAggregator();
  } catch (error) {
    logger.error('Server startup failed', { error: error.message });
    process.exit(1);
  }
})();

const shutdown = () => {
  logger.info('Graceful shutdown started');
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
