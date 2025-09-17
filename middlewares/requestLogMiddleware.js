const logger = require('../utils/logger');

/**
 * Middleware to log all incoming requests
 */
const requestLogger = (req, res, next) => {
  // Get the start time
  const start = Date.now();

  // Log when request is received
  logger.debug(`Incoming ${req.method} request to ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Store original end function to intercept it
  const originalEnd = res.end;

  // Override end function to log response information
  res.end = function (chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - start;

    // Get response status code
    const statusCode = res.statusCode;

    // Log response info based on status code
    if (statusCode >= 500) {
      logger.error(`Response ${statusCode} sent for ${req.method} ${req.originalUrl} in ${responseTime}ms`, {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        responseTime,
        userId: req.user?.id,
        ip: req.ip
      });
    } else if (statusCode >= 400) {
      logger.warn(`Response ${statusCode} sent for ${req.method} ${req.originalUrl} in ${responseTime}ms`, {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        responseTime,
        userId: req.user?.id,
        ip: req.ip
      });
    } else {
      logger.info(`Response ${statusCode} sent for ${req.method} ${req.originalUrl} in ${responseTime}ms`, {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        responseTime,
        userId: req.user?.id,
        ip: req.ip
      });
    }

    // Call the original end function
    originalEnd.apply(this, arguments);
  };

  next();
};

module.exports = requestLogger;