const { logger } = require('./logger');

module.exports = (err, _req, res, _next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, error: status === 500 ? 'Internal server error' : err.message });
};
