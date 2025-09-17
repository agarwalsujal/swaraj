const winston = require('winston');
const path = require('path');
const config = require('../config');

// Define log directory
const logDir = 'logs';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ level, message, timestamp, ...meta }) =>
      `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`
  )
);

// Create transports
const transports = [];

// Add console transport if enabled in config
if (config.logging.console) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Add file transport if enabled in config
if (config.logging.file) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'swaraj-api' },
  transports
});

// Export the logger
module.exports = logger;