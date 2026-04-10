require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL ✅"))
  .catch(err => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });

const createTableQuery = `
CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(255),
  category VARCHAR(255),
  quantity INTEGER,
  unit VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE stock ADD COLUMN IF NOT EXISTS user_id INTEGER;
`;

pool.query(createTableQuery)
  .then(() => console.log("Stock table ready ✅"))
  .catch(err => console.error("Table error:", err.message));

module.exports = pool;