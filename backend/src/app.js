const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { httpLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const whitelist = (process.env.CORS_WHITELIST || '').split(',').filter(Boolean);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: (origin, cb) => (!origin || !whitelist.length || whitelist.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))) }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(httpLogger);
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' }));
app.get('/api/stats', (_req, res) => res.json({ uptime: process.uptime() }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/materials', require('./routes/material.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/recommendations', require('./routes/recommendation.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/reminders', require('./routes/reminder.routes'));
app.use('/api/context', require('./routes/context.routes'));
app.use('/api/resources', require('./routes/resource.routes'));

app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
