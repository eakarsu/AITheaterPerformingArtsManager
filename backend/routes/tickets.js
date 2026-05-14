const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/tickets - list with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const total = await pool.query('SELECT COUNT(*) FROM tickets');
    const result = await pool.query(`
      SELECT t.*, s.title as show_title
      FROM tickets t LEFT JOIN shows s ON t.show_id = s.id
      ORDER BY t.id DESC LIMIT $1 OFFSET $2
    `, [limit, offset]);
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total: parseInt(total.rows[0].count), pages: Math.ceil(total.rows[0].count / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tickets/checkout - Stripe checkout
router.post('/checkout', async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { show_id, ticket_type, customer_name, email, performance_date, seat_section, quantity, price } = req.body;

    if (!show_id || !customer_name || !email || !price) {
      return res.status(400).json({ success: false, error: 'show_id, customer_name, email, and price are required.' });
    }

    const qty = parseInt(quantity) || 1;
    const unitAmount = Math.round(parseFloat(price) * 100);

    const show = await pool.query('SELECT * FROM shows WHERE id = $1', [show_id]);
    const showTitle = show.rows[0]?.title || 'Theater Ticket';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${showTitle} - ${ticket_type || 'General Admission'}`,
            description: `Performance: ${performance_date || 'TBD'} | Section: ${seat_section || 'General'}`,
          },
          unit_amount: unitAmount,
        },
        quantity: qty,
      }],
      mode: 'payment',
      customer_email: email,
      metadata: {
        show_id: String(show_id),
        ticket_type: ticket_type || 'General Admission',
        customer_name,
        performance_date: performance_date || '',
        seat_section: seat_section || '',
        quantity: String(qty),
      },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3001'}/features/tickets?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3001'}/features/tickets?cancelled=true`,
    });

    res.json({ success: true, checkout_url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create checkout session: ' + err.message });
  }
});

module.exports = router;
