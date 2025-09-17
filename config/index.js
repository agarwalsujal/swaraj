// Main config loader that loads environment-specific configuration
const development = require('./development');
const production = require('./production');
const test = require('./test');

// Default to development if not specified
const env = process.env.NODE_ENV || 'development';

// Config map
const configs = {
  development,
  production,
  test
};

// Export the config for the current environment
module.exports = configs[env] || development;