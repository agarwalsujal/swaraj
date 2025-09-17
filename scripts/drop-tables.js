// Script to drop all tables
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function dropAllTables() {
  try {
    console.log('Dropping all tables...');
    
    await pool.query('DROP TABLE IF EXISTS "Logs" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "Subscriptions" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "Users" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "SequelizeMeta" CASCADE');
    
    console.log('All tables dropped successfully!');
  } catch (err) {
    console.error('Error dropping tables:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropAllTables();