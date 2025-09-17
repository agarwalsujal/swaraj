// Configuration for test environment
module.exports = {
  env: 'test',

  server: {
    port: process.env.TEST_PORT || 3001,
    host: 'localhost'
  },

  database: {
    name: process.env.TEST_DB_NAME || 'swaraj_test',
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    logQueries: false,
    logParameters: false,
    alter: false,
    force: true,  // Always recreate tables in test for clean state
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  },

  logging: {
    level: 'error',  // Only log errors in test environment
    console: true,
    file: false,
    cloudWatch: false,
    silent: process.env.TEST_SILENT === 'true' // Option to silence all logs during tests
  },

  security: {
    helmet: {
      contentSecurityPolicy: false // Disable CSP for testing
    },
    rateLimiter: {
      enabled: false // Disable rate limiting for tests
    }
  },

  rateLimit: {
    standard: {
      windowMs: 15 * 60 * 1000,
      max: 1000 // Very high limit for testing
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 1000
    },
    ai: {
      windowMs: 60 * 60 * 1000,
      max: 1000
    }
  },

  gemini: {
    apiKey: 'test-api-key', // Mock key for testing
    model: 'gemini-pro',
    maxTokens: 1024
  },

  auth: {
    jwtSecret: 'test-jwt-secret',
    jwtExpiresIn: '1h',
    refreshTokenExpiresIn: '2h',
    passwordResetExpiresIn: '15m',
    google: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      callbackUrl: 'http://localhost:3001/api/auth/google/callback'
    }
  },

  // Monitoring config for tests
  monitoring: {
    enabled: false
  }
};