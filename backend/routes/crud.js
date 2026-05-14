const express = require('express');
const pool = require('../db');

function createCrudRoutes(tableName, columns) {
  const router = express.Router();

  // GET / - List with pagination
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const total = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT $1 OFFSET $2`, [limit, offset]);
      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page, limit,
          total: parseInt(total.rows[0].count),
          pages: Math.ceil(total.rows[0].count / limit),
        }
      });
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err.message);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}.` });
    }
  });

  // GET /:id - Get single item
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `${tableName} item not found.` });
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(`Error fetching ${tableName} by id:`, err.message);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName} item.` });
    }
  });

  // POST / - Create item
  router.post('/', async (req, res) => {
    try {
      const values = [];
      const usedColumns = [];

      for (const col of columns) {
        if (req.body[col] !== undefined) {
          usedColumns.push(col);
          values.push(req.body[col]);
        }
      }

      if (usedColumns.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid fields provided.' });
      }

      const placeholders = usedColumns.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${tableName} (${usedColumns.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      const result = await pool.query(query, values);
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(`Error creating ${tableName}:`, err.message);
      res.status(500).json({ success: false, error: `Failed to create ${tableName} item.` });
    }
  });

  // PUT /:id - Update item
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const col of columns) {
        if (req.body[col] !== undefined) {
          setClauses.push(`${col} = $${paramIndex}`);
          values.push(req.body[col]);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid fields provided for update.' });
      }

      values.push(id);
      const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `${tableName} item not found.` });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err.message);
      res.status(500).json({ success: false, error: `Failed to update ${tableName} item.` });
    }
  });

  // DELETE /:id - Delete item
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `${tableName} item not found.` });
      }
      res.json({ success: true, data: result.rows[0], message: `${tableName} item deleted successfully.` });
    } catch (err) {
      console.error(`Error deleting ${tableName}:`, err.message);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName} item.` });
    }
  });

  return router;
}

module.exports = createCrudRoutes;
