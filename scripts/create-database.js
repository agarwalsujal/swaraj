// Script to create the database
const { Pool } = require('pg');
require('dotenv').config();

const dbName = process.env.DB_NAME;

// Connect to postgres to create the database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // Connect to default postgres database
});

async function createDatabase() {
  try {
    // Drop the database if it exists
    await pool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Dropped database "${dbName}" if it existed`);

    // Create a new database
    await pool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database "${dbName}"`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error creating database:', err);
    await pool.end();
    process.exit(1);
  }
}

createDatabase();