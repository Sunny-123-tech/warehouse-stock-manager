const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'warehouse_secret_key';

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET all stock for logged-in user only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM stock WHERE user_id = $1 ORDER BY id DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM stock WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - save with user_id
router.post('/', authMiddleware, async (req, res) => {
  const { name, category, quantity, unit, location, description } = req.body;
  if (!name || !category || quantity === undefined)
    return res.status(400).json({ error: 'Name, category, and quantity are required' });
  try {
    const result = await db.query(
      'INSERT INTO stock (user_id, name, category, quantity, unit, location, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [req.userId, name, category, quantity, unit || 'pcs', location || '', description || '']
    );
    res.status(201).json({ message: 'Item added successfully', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { name, category, quantity, unit, location, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE stock SET name=$1, category=$2, quantity=$3, unit=$4, location=$5, description=$6, updated_on=NOW() WHERE id=$7 AND user_id=$8',
      [name, category, quantity, unit, location, description, req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM stock WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;