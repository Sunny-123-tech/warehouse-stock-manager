const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stock ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stock WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, category, quantity, unit, location, description } = req.body;
  if (!name || !category || quantity === undefined)
    return res.status(400).json({ error: 'Name, category, and quantity are required' });
  try {
    const result = await db.query(
      'INSERT INTO stock (name, category, quantity, unit, location, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [name, category, quantity, unit || 'pcs', location || '', description || '']
    );
    res.status(201).json({ message: 'Item added successfully', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, category, quantity, unit, location, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE stock SET name=$1, category=$2, quantity=$3, unit=$4, location=$5, description=$6, updated_on=NOW() WHERE id=$7',
      [name, category, quantity, unit, location, description, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM stock WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
