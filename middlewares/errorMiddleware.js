exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
  } else if (err.name === 'UnauthorizedError') {
    error.status = 401;
  } else if (err.name === 'ForbiddenError') {
    error.status = 403;
  }

  // Log error
  if (error.status === 500) {
    // Log to monitoring service or file
    console.error('Server Error:', error);
  }

  res.status(error.status).json(error);
};

exports.notFound = (req, res) => {
  res.status(404).json({
    message: 'Resource not found'
  });
};