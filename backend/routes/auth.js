const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const pool = require('../db');

const router = express.Router();
const deriveKey = promisify(crypto.scrypt);

async function verifyScryptPassword(password, encoded) {
  const parts = String(encoded || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return null;
  const expected = Buffer.from(parts[2], 'hex');
  if (!parts[1] || expected.length !== 64) return null;
  const actual = await deriveKey(password, parts[1], expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const validPassword = await verifyScryptPassword(password, user.password);
    if (validPassword === null) {
      return res.status(503).json({
        success: false,
        error: 'PASSWORD_MIGRATION_REQUIRED',
        message: 'This account must be migrated to the scrypt credential format before login.',
      });
    }
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role FROM users WHERE id=$1 LIMIT 1', [req.user.id]);
    if (!result.rows.length) return res.status(401).json({ success: false, error: 'Session user no longer exists.' });
    res.json({ success: true, user: result.rows[0] });
  } catch (_) {
    res.status(500).json({ success: false, error: 'Unable to verify persisted session.' });
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { router, authenticateToken };
