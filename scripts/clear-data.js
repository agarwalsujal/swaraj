// Script to clear all data from tables
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function clearData() {
  try {
    console.log('Clearing all data from tables...');

    // Clear in reverse order due to foreign key constraints
    await pool.query('TRUNCATE TABLE "Logs" CASCADE');
    console.log('✓ Logs table cleared');

    await pool.query('TRUNCATE TABLE "Subscriptions" CASCADE');
    console.log('✓ Subscriptions table cleared');

    await pool.query('TRUNCATE TABLE "Users" CASCADE');
    console.log('✓ Users table cleared');

    console.log('All tables cleared successfully!');
  } catch (err) {
    console.error('Error clearing tables:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearData();