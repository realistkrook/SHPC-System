const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/house_points',
});

// Test the connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err.message));

module.exports = pool;
