const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

// Create a handler generator that logs rate limit hits
const createRateLimiter = (options) => {
  return rateLimit({
    ...options,
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        rateLimit: {
          limit: options.max,
          windowMs: options.windowMs,
          remaining: req.rateLimit.remaining,
          resetTime: new Date(req.rateLimit.resetTime)
        }
      });

      res.status(options.statusCode).json({
        error: options.message
      });
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

exports.apiLimiter = createRateLimiter({
  windowMs: config.rateLimit?.standard?.windowMs || 900000, // 15 minutes
  max: config.rateLimit?.standard?.max || 100,
  message: 'Too many requests, please try again later.'
});

exports.authLimiter = createRateLimiter({
  windowMs: config.rateLimit?.auth?.windowMs || 900000, // 15 minutes
  max: config.rateLimit?.auth?.max || 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes'
});

exports.aiQueryLimiter = createRateLimiter({
  windowMs: config.rateLimit?.ai?.windowMs || 3600000, // 1 hour
  max: config.rateLimit?.ai?.max || 50, // Limit each IP to 50 AI queries per hour
  message: 'AI query limit reached, please try again later'
});