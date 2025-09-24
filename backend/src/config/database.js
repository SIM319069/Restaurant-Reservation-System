const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://restaurant_user:restaurant_password@localhost:5432/restaurant_reservation',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};