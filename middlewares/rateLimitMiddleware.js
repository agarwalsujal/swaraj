const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

exports.authLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

exports.aiQueryLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 50, // Limit each IP to 50 AI queries per hour
  message: {
    error: 'AI query limit reached, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});