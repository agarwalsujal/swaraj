const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

// Custom SQL query logger
const sqlLogger = (query) => {
  logger.debug('SQL Query', {
    sql: query.sql,
    dialect: query.dialect,
    duration: query.time,
    ...(config.database.logParameters && { parameters: query.bind })
  });
};

const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    // Only log SQL in development mode or if explicitly enabled
    logging: config.database.logQueries ? sqlLogger : false,
    pool: {
      max: config.database.pool?.max || 5,
      min: config.database.pool?.min || 0,
      acquire: config.database.pool?.acquire || 30000,
      idle: config.database.pool?.idle || 10000
    }
  }
);

// Log database connection events
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established successfully', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name
    });
  })
  .catch(err => {
    logger.error('Unable to connect to the database', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      error: err.message,
      stack: err.stack
    });
  });

module.exports = sequelize;