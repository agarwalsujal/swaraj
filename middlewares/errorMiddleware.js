const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  const error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    logger.warn(`Validation Error: ${err.message}`, {
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });
  } else if (err.name === 'UnauthorizedError') {
    error.status = 401;
    logger.warn(`Unauthorized Access: ${err.message}`, {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  } else if (err.name === 'ForbiddenError') {
    error.status = 403;
    logger.warn(`Forbidden Access: ${err.message}`, {
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });
  } else if (error.status >= 500) {
    // Log server errors with full details
    logger.error(`Server Error: ${err.message}`, {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      body: req.body,
      params: req.params,
      query: req.query
    });
  } else {
    // Log other errors
    logger.info(`Client Error (${error.status}): ${err.message}`, {
      path: req.path,
      method: req.method
    });
  }

  res.status(error.status).json(error);
};

exports.notFound = (req, res) => {
  const message = `Resource not found - ${req.originalUrl}`;

  logger.info(`404 Not Found: ${req.originalUrl}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  res.status(404).json({
    message: message
  });
};