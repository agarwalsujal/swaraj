const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const compression = require('compression');

// Load environment-specific config first
const config = require('./config');

// Setup logger before anything else
const logger = require('./utils/logger');

// Import middleware
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const requestLogger = require('./middlewares/requestLogMiddleware');

// Import utils
const setupSwagger = require('./utils/swagger');

// Import database
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet(config.security.helmet));
app.use(cors(config.cors));

// Performance middleware
app.use(compression());

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
app.use(passport.initialize());

// Request logging (must be after body parsers to log request body)
app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);

// Import monitoring utilities
const { getHealthInfo } = require('./utils/monitoringUtils');

// Routes
app.get('/api/health', async (req, res) => {
  try {
    const healthInfo = await getHealthInfo();

    // Set appropriate status code based on health status
    const statusCode = healthInfo.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(healthInfo);
  } catch (error) {
    logger.error('Health check error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve health information',
      timestamp: new Date().toISOString()
    });
  }
});

// Add detailed metrics endpoint for internal monitoring
app.get('/api/metrics', async (req, res) => {
  // This endpoint should be protected in production
  if (config.env === 'production' && !req.headers['x-api-key']) {
    return res.status(401).json({ error: 'Unauthorized access to metrics' });
  }

  try {
    const healthInfo = await getHealthInfo();
    res.json({
      ...healthInfo,
      detailed: true,
      // Add more detailed metrics here
    });
  } catch (error) {
    logger.error('Metrics endpoint error', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);

// Setup API documentation with Swagger
if (config.env !== 'production' || config.server.enableDocsInProduction) {
  setupSwagger(app);
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const PORT = config.server.port || 3000;

// Add graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server...');
  shutdown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing HTTP server...');
  shutdown();
});

// Graceful shutdown function
const shutdown = () => {
  server.close(() => {
    logger.info('HTTP server closed.');

    // Close database connection
    sequelize.close().then(() => {
      logger.info('Database connections closed.');
      process.exit(0);
    }).catch(err => {
      logger.error('Error during database disconnect', { error: err });
      process.exit(1);
    });
  });
};

// Unhandled rejection and exception handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, stack: reason.stack });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  // Allow the process to exit for uncaught exceptions after logging
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

const startServer = async () => {
  try {
    // Database connection is already handled in db.js

    // Sync database models with database
    await sequelize.sync({
      alter: config.database.alter || false,
      force: config.database.force || false
    });
    logger.info('Database synchronized');

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: config.env,
        nodeVersion: process.version
      });
    });

    // Return the server instance for the shutdown handler
    return server;
  } catch (error) {
    logger.error('Unable to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Start the server and store the instance
const server = startServer();