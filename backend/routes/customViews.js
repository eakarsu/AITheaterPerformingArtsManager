const express = require('express');
const router = express.Router();
const pool = require('../db');
const PDFDocument = require('pdfkit');

// Ensure casting_rules table exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS casting_rules (
        id SERIAL PRIMARY KEY,
        show_id INTEGER REFERENCES shows(id) ON DELETE SET NULL,
        role_name VARCHAR(255) NOT NULL,
        eligibility TEXT,
        min_age INTEGER,
        max_age INTEGER,
        gender_pref VARCHAR(50),
        required_skills TEXT,
        union_required VARCHAR(10) DEFAULT 'No',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    const count = await pool.query('SELECT COUNT(*) FROM casting_rules');
    if (parseInt(count.rows[0].count) === 0) {
      const shows = await pool.query('SELECT id FROM shows ORDER BY id LIMIT 3');
      const sIds = shows.rows.map(r => r.id);
      const seedRows = [
        [sIds[0] || null, 'Lead Actor', 'Strong vocal range', 25, 45, 'Any', 'Singing, Dancing', 'Yes', 'Must read for full run'],
        [sIds[1] || null, 'Supporting Role', 'Stage combat experience', 20, 60, 'Any', 'Combat, Improv', 'No', 'Open auditions'],
        [sIds[2] || null, 'Ensemble', 'Movement training preferred', 18, 70, 'Any', 'Dance, Singing', 'No', 'Group call back'],
      ];
      for (const r of seedRows) {
        await pool.query(
          `INSERT INTO casting_rules (show_id, role_name, eligibility, min_age, max_age, gender_pref, required_skills, union_required, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          r
        );
      }
    }
  } catch (e) {
    console.error('customViews init error:', e.message);
  }
})();

// VIZ 1: GET /api/custom-views/ticket-sales-chart - ticket sales aggregated by performance date
router.get('/ticket-sales-chart', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(t.performance_date, 'YYYY-MM-DD') AS date,
        COALESCE(s.title, 'Unscheduled') AS show_title,
        COUNT(t.id)::int AS tickets_sold,
        COALESCE(SUM(t.price), 0)::float AS revenue
      FROM tickets t
      LEFT JOIN shows s ON t.show_id = s.id
      WHERE t.performance_date IS NOT NULL
      GROUP BY t.performance_date, s.title
      ORDER BY t.performance_date ASC
      LIMIT 200
    `);
    const totals = result.rows.reduce(
      (acc, r) => ({ tickets: acc.tickets + r.tickets_sold, revenue: acc.revenue + Number(r.revenue) }),
      { tickets: 0, revenue: 0 }
    );
    res.json({ success: true, data: result.rows, totals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// VIZ 2: GET /api/custom-views/show-schedule-heatmap - show x date heatmap (rehearsals + performances)
router.get('/show-schedule-heatmap', async (req, res) => {
  try {
    const rehearsals = await pool.query(`
      SELECT s.id AS show_id, COALESCE(s.title, 'Unknown') AS show_title,
        TO_CHAR(r.rehearsal_date, 'YYYY-MM-DD') AS date, COUNT(r.id)::int AS count
      FROM rehearsals r LEFT JOIN shows s ON r.show_id = s.id
      WHERE r.rehearsal_date IS NOT NULL
      GROUP BY s.id, s.title, r.rehearsal_date
    `);
    const performances = await pool.query(`
      SELECT s.id AS show_id, COALESCE(s.title, 'Unknown') AS show_title,
        TO_CHAR(t.performance_date, 'YYYY-MM-DD') AS date, COUNT(t.id)::int AS count
      FROM tickets t LEFT JOIN shows s ON t.show_id = s.id
      WHERE t.performance_date IS NOT NULL
      GROUP BY s.id, s.title, t.performance_date
    `);
    // Build matrix
    const showsMap = new Map();
    const datesSet = new Set();
    const addEntry = (row, kind) => {
      if (!row.show_title) return;
      datesSet.add(row.date);
      if (!showsMap.has(row.show_title)) showsMap.set(row.show_title, {});
      const cell = showsMap.get(row.show_title)[row.date] || { rehearsals: 0, performances: 0 };
      cell[kind] = (cell[kind] || 0) + row.count;
      showsMap.get(row.show_title)[row.date] = cell;
    };
    rehearsals.rows.forEach(r => addEntry(r, 'rehearsals'));
    performances.rows.forEach(r => addEntry(r, 'performances'));
    const dates = Array.from(datesSet).sort();
    const matrix = Array.from(showsMap.entries()).map(([show_title, cells]) => ({
      show_title,
      cells: dates.map(d => ({
        date: d,
        rehearsals: cells[d]?.rehearsals || 0,
        performances: cells[d]?.performances || 0,
        intensity: (cells[d]?.rehearsals || 0) + (cells[d]?.performances || 0) * 2,
      })),
    }));
    res.json({ success: true, dates, matrix });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NON-VIZ 1: GET /api/custom-views/program-playbill - PDF program/playbill
router.get('/program-playbill', async (req, res) => {
  try {
    const showId = req.query.show_id ? parseInt(req.query.show_id) : null;
    let show;
    if (showId) {
      const r = await pool.query('SELECT * FROM shows WHERE id=$1', [showId]);
      show = r.rows[0];
    } else {
      const r = await pool.query('SELECT * FROM shows ORDER BY id DESC LIMIT 1');
      show = r.rows[0];
    }
    if (!show) {
      return res.status(404).json({ success: false, error: 'No show found.' });
    }
    const castRes = await pool.query('SELECT * FROM cast_crew WHERE show_id=$1 ORDER BY department, person_name', [show.id]);

    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="playbill_show_${show.id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(28).font('Helvetica-Bold').text('PLAYBILL', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(20).font('Helvetica').text(show.title || 'Untitled Show', { align: 'center' });
    doc.moveDown(0.3);
    if (show.playwright) doc.fontSize(12).text(`by ${show.playwright}`, { align: 'center' });
    if (show.director) doc.fontSize(12).text(`Directed by ${show.director}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Genre: ${show.genre || 'N/A'}   Season: ${show.season || 'N/A'} ${show.year || ''}`, { align: 'center' });
    doc.text(`Venue: ${show.venue || 'TBD'}`, { align: 'center' });
    if (show.opening_date) doc.text(`Opening: ${new Date(show.opening_date).toDateString()}`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('Synopsis');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').text(show.description || 'No description available.', { align: 'left' });

    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('Cast & Crew');
    doc.moveDown(0.3);
    if (castRes.rows.length === 0) {
      doc.fontSize(11).font('Helvetica').text('Cast information forthcoming.');
    } else {
      castRes.rows.forEach(c => {
        doc.fontSize(11).font('Helvetica-Bold').text(c.person_name || 'Unknown', { continued: true });
        doc.font('Helvetica').text(`  -  ${c.role || c.position || ''} (${c.department || 'Cast'})`);
      });
    }

    doc.moveDown(1);
    doc.fontSize(9).fillColor('gray').text('Generated by AI Theater & Performing Arts Manager', { align: 'center' });
    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, error: err.message });
  }
});

// NON-VIZ 2: Casting Rules Editor CRUD
router.get('/casting-rules', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, s.title AS show_title
      FROM casting_rules cr LEFT JOIN shows s ON cr.show_id = s.id
      ORDER BY cr.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/casting-rules', async (req, res) => {
  try {
    const { show_id, role_name, eligibility, min_age, max_age, gender_pref, required_skills, union_required, notes } = req.body;
    if (!role_name) return res.status(400).json({ success: false, error: 'role_name is required' });
    const result = await pool.query(
      `INSERT INTO casting_rules (show_id, role_name, eligibility, min_age, max_age, gender_pref, required_skills, union_required, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [show_id || null, role_name, eligibility || null, min_age || null, max_age || null, gender_pref || null, required_skills || null, union_required || 'No', notes || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/casting-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { show_id, role_name, eligibility, min_age, max_age, gender_pref, required_skills, union_required, notes } = req.body;
    const result = await pool.query(
      `UPDATE casting_rules SET show_id=$1, role_name=$2, eligibility=$3, min_age=$4, max_age=$5,
       gender_pref=$6, required_skills=$7, union_required=$8, notes=$9 WHERE id=$10 RETURNING *`,
      [show_id || null, role_name, eligibility || null, min_age || null, max_age || null, gender_pref || null, required_skills || null, union_required || 'No', notes || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/casting-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM casting_rules WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
