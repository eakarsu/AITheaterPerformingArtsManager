const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/dashboard/box-office
router.get('/box-office', async (req, res) => {
  try {
    const showRevenue = await pool.query(`
      SELECT s.id, s.title, s.status, s.opening_date,
        COUNT(t.id) as tickets_sold,
        COALESCE(SUM(t.price), 0) as total_revenue,
        COALESCE(AVG(t.price), 0) as avg_ticket_price
      FROM shows s
      LEFT JOIN tickets t ON s.id = t.show_id
      GROUP BY s.id, s.title, s.status, s.opening_date
      ORDER BY total_revenue DESC
    `);

    const overallStats = await pool.query(`
      SELECT
        COUNT(*) as total_tickets,
        COALESCE(SUM(price), 0) as total_revenue,
        COALESCE(AVG(price), 0) as avg_price,
        COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_tickets,
        COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_tickets
      FROM tickets
    `);

    const byTicketType = await pool.query(`
      SELECT ticket_type, COUNT(*) as count, COALESCE(SUM(price), 0) as revenue
      FROM tickets
      GROUP BY ticket_type
      ORDER BY revenue DESC
    `);

    const recentSales = await pool.query(`
      SELECT t.*, s.title as show_title
      FROM tickets t
      LEFT JOIN shows s ON t.show_id = s.id
      ORDER BY t.purchase_date DESC NULLS LAST
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        shows: showRevenue.rows,
        overall: overallStats.rows[0],
        by_ticket_type: byTicketType.rows,
        recent_sales: recentSales.rows,
      }
    });
  } catch (err) {
    console.error('Box office dashboard error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load box office data.' });
  }
});

module.exports = router;
