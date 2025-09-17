// Configuration for development environment
module.exports = {
  env: 'development',

  server: {
    port: process.env.PORT || 3000,
    host: 'localhost'
  },

  database: {
    name: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    logQueries: true,
    logParameters: true,
    alter: true,  // Allow Sequelize to alter tables in development
    force: false, // Don't force table recreation
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
    level: 'debug',
    console: true,
    file: true,
    cloudWatch: false,
    logDirectory: './logs',
    maxFiles: '14d',   // Keep logs for 14 days
    maxSize: '20m',    // 20MB max file size
    format: 'combined' // combined vs json
  },

  security: {
    helmet: {
      contentSecurityPolicy: false // Disable CSP for development
    },
    rateLimiter: {
      enabled: true
    }
  },

  rateLimit: {
    standard: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000                 // Higher limit for development
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20                   // Higher limit for development
    },
    ai: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100                  // Higher limit for development
    }
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro',
    maxTokens: 1024
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    jwtExpiresIn: '7d',
    refreshTokenExpiresIn: '30d',
    passwordResetExpiresIn: '1h',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: 'http://localhost:3000/api/auth/google/callback'
    }
  }
};