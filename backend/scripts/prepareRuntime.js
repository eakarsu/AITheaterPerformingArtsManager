'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../db');
const deriveKey = promisify(crypto.scrypt);

async function prepare() {
  if (!['1', 'true'].includes(String(process.env.ALLOW_SCHEMA_MIGRATION || '').toLowerCase())) {
    throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS shows (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      playwright VARCHAR(255),
      genre VARCHAR(100),
      season VARCHAR(50),
      year INTEGER,
      director VARCHAR(255),
      status VARCHAR(100) DEFAULT 'Planning',
      budget DECIMAL(12,2),
      opening_date DATE,
      closing_date DATE,
      description TEXT,
      venue VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
      ticket_type VARCHAR(100),
      customer_name VARCHAR(255),
      email VARCHAR(255),
      performance_date DATE,
      seat_section VARCHAR(50),
      seat_number VARCHAR(20),
      price DECIMAL(10,2),
      payment_status VARCHAR(100) DEFAULT 'Pending',
      purchase_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      endpoint VARCHAR(100) NOT NULL,
      input_data JSONB NOT NULL,
      result JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_results_user_endpoint ON ai_results(user_id, endpoint);
  `);
  const migration = fs.readFileSync(
    path.resolve(__dirname, '../migrations/001_governed_theater_release.sql'),
    'utf8',
  );
  await pool.query(migration);

  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Admin';
  if (!email || String(password || '').length < 12) throw new Error('Provisioned admin credentials are required');
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64);
  const encodedPassword = `scrypt$${salt}$${key.toString('hex')}`;
  await pool.query(
    `INSERT INTO users(email,password,name,role) VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin'`,
    [email, encodedPassword, name],
  );
}

prepare()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Runtime preparation failed:', error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });
