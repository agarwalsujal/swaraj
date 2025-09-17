const os = require('os');
const { sequelize } = require('../models');
const logger = require('./logger');

/**
 * Collects system metrics for monitoring
 * @returns {Object} Object containing system metrics
 */
const getSystemMetrics = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    memory: {
      total: bytesToMB(totalMemory),
      free: bytesToMB(freeMemory),
      used: bytesToMB(usedMemory),
      percentUsed: Math.round((usedMemory / totalMemory) * 100)
    },
    cpu: {
      loadAvg: os.loadavg(),
      cpus: os.cpus().length
    },
    uptime: {
      system: os.uptime(),
      process: process.uptime()
    },
    platform: {
      type: os.type(),
      release: os.release(),
      arch: os.arch()
    },
    process: {
      memory: bytesToMB(process.memoryUsage().heapUsed),
      memoryTotal: bytesToMB(process.memoryUsage().heapTotal),
      pid: process.pid,
      version: process.version
    }
  };
};

/**
 * Converts bytes to megabytes
 * @param {Number} bytes 
 * @returns {Number} Megabytes (rounded to 2 decimal places)
 */
const bytesToMB = (bytes) => {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
};

/**
 * Checks database connection health
 * @returns {Promise<Object>} Object with connection status
 */
const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const responseTime = Date.now() - startTime;

    return {
      status: 'connected',
      responseTime: `${responseTime}ms`
    };
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Get application health information
 * @returns {Promise<Object>} Health check data
 */
const getHealthInfo = async () => {
  const metrics = getSystemMetrics();
  const dbHealth = await checkDatabaseHealth();

  // Determine overall health based on criteria
  const isMemoryOk = metrics.memory.percentUsed < 90; // Less than 90% memory used
  const isDbOk = dbHealth.status === 'connected';

  const status = isMemoryOk && isDbOk ? 'healthy' : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    database: dbHealth,
    metrics
  };
};

module.exports = {
  getSystemMetrics,
  checkDatabaseHealth,
  getHealthInfo
};