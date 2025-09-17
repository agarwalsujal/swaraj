// Configuration for production environment
module.exports = {
  env: 'production',

  server: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0'  // Listen on all network interfaces
  },

  database: {
    name: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    logQueries: false,  // Disable query logging in production for performance
    logParameters: false,
    alter: false,       // Never alter tables automatically in production
    force: false,       // Never force table recreation in production
    pool: {
      max: 20,         // Increased pool size for production
      min: 5,
      acquire: 60000,  // Longer timeouts for production
      idle: 10000
    }
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  logging: {
    level: 'info',
    console: false,
    file: true,
    cloudWatch: true,
    logDirectory: process.env.LOG_DIR || '/var/log/swaraj',
    maxFiles: '30d',   // Keep logs for 30 days
    maxSize: '50m',    // 50MB max file size
    format: 'json'     // JSON format for production logs
  },

  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", process.env.API_URL || "https://api.yourdomain.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
      },
      frameguard: {
        action: 'deny'
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    },
    rateLimiter: {
      enabled: true
    },
    trustProxy: true  // For proper IP detection behind reverse proxies
  },

  rateLimit: {
    standard: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5
    },
    ai: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50
    }
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    maxTokens: process.env.GEMINI_MAX_TOKENS || 1024
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL
    }
  },

  // Set up monitoring endpoints
  monitoring: {
    enabled: true,
    requireApiKey: true,
    metrics: {
      collectIntervalMs: 60000 // Collect metrics every minute
    }
  }
};