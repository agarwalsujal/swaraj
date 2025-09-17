const validator = require('validator');

// Registration validation
exports.validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate name
  if (!name) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Login validation
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Subscription validation
exports.validateSubscription = (req, res, next) => {
  const { plan } = req.body;
  const validPlans = ['free', 'basic', 'premium'];

  if (!plan) {
    return res.status(400).json({
      message: 'Subscription plan is required'
    });
  }

  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      message: 'Invalid subscription plan. Valid plans are: ' + validPlans.join(', ')
    });
  }

  next();
};

// AI Query validation
exports.validateAIQuery = (req, res, next) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      message: 'Query is required'
    });
  }

  if (typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      message: 'Query must be a non-empty string'
    });
  }

  if (query.length > 2000) {
    return res.status(400).json({
      message: 'Query must be less than 2000 characters'
    });
  }

  next();
};