const express = require('express');
const router = express.Router();
const pool = require('../db');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : ipKeyGenerator(req),
  message: { success: false, error: 'Rate limit exceeded.' },
});

// Standard CRUD
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const total = await pool.query('SELECT COUNT(*) FROM donors');
    const result = await pool.query('SELECT * FROM donors ORDER BY donation_date DESC NULLS LAST LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total: parseInt(total.rows[0].count), pages: Math.ceil(total.rows[0].count / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Donor not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, email, phone, address, donation_amount, donation_date, campaign, recognition_level, tax_receipt_sent, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO donors (name, type, email, phone, address, donation_amount, donation_date, campaign, recognition_level, tax_receipt_sent, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, type, email, phone, address, donation_amount, donation_date, campaign, recognition_level, tax_receipt_sent, notes]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, email, phone, address, donation_amount, donation_date, campaign, recognition_level, tax_receipt_sent, notes } = req.body;
    const result = await pool.query(
      `UPDATE donors SET name=$1, type=$2, email=$3, phone=$4, address=$5, donation_amount=$6, donation_date=$7, campaign=$8, recognition_level=$9, tax_receipt_sent=$10, notes=$11 WHERE id=$12 RETURNING *`,
      [name, type, email, phone, address, donation_amount, donation_date, campaign, recognition_level, tax_receipt_sent, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Donor not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM donors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Donor not found.' });
    res.json({ success: true, message: 'Donor deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/donors/segments - Donor segmentation
router.get('/segments', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const segments = await pool.query(`
      SELECT
        CASE
          WHEN EXTRACT(YEAR FROM donation_date) = $1 THEN 'current_year'
          WHEN EXTRACT(YEAR FROM donation_date) = $1 - 1 THEN 'LYBUNT'
          WHEN EXTRACT(YEAR FROM donation_date) < $1 - 1 THEN 'SYBUNT'
          ELSE 'unknown'
        END as segment,
        COUNT(*) as count,
        COALESCE(SUM(donation_amount), 0) as total_donations,
        COALESCE(AVG(donation_amount), 0) as avg_donation,
        COALESCE(MAX(donation_amount), 0) as max_donation
      FROM donors
      GROUP BY segment
      ORDER BY total_donations DESC
    `, [currentYear]);

    const topDonors = await pool.query(`
      SELECT * FROM donors ORDER BY donation_amount DESC LIMIT 10
    `);

    const lapsed = await pool.query(`
      SELECT * FROM donors
      WHERE donation_date < NOW() - INTERVAL '2 years'
      ORDER BY donation_amount DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: {
        segments: segments.rows,
        top_donors: topDonors.rows,
        lapsed_donors: lapsed.rows,
      }
    });
  } catch (err) {
    console.error('Donor segments error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load donor segments.' });
  }
});

module.exports = router;
