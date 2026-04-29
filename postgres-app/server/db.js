const { Pool } = require('pg');

require('dotenv').config();

function createPool(connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/house_points') {
  return new Pool({ connectionString });
}

async function logConnectionHealth(pool) {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  }
}

const pool = createPool();

module.exports = {
  pool,
  createPool,
  logConnectionHealth,
};
