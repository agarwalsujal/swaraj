require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'swaraj_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    migrationStorageTableName: '_migrations',
    seederStorageTableName: '_seeders'
  },
  test: {
    username: process.env.TEST_DB_USER || process.env.DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'swaraj_test',
    host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || process.env.DB_PORT || 5432,
    dialect: 'postgres',
    migrationStorageTableName: '_migrations',
    seederStorageTableName: '_seeders'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    migrationStorageTableName: '_migrations',
    seederStorageTableName: '_seeders',
    logging: false
  }
};