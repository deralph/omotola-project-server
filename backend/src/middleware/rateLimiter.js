const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');

const apiLimiter = rateLimit({ windowMs: RATE_LIMIT.windowMs, max: RATE_LIMIT.max, standardHeaders: true, legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: RATE_LIMIT.aiWindowMs, max: RATE_LIMIT.aiMax, standardHeaders: true, legacyHeaders: false });

module.exports = { apiLimiter, aiLimiter };
