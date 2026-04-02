const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all items
router.get('/', (req, res) => {
  db.query('SELECT * FROM stock ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single item
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM stock WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(results[0]);
  });
});

// POST - Add new item
router.post('/', (req, res) => {
  const { name, category, quantity, unit, location, description } = req.body;

  if (!name || !category || quantity === undefined) {
    return res.status(400).json({ error: 'Name, category, and quantity are required' });
  }

  const sql = 'INSERT INTO stock (name, category, quantity, unit, location, description) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, category, quantity, unit || 'pcs', location || '', description || ''];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Item added successfully', id: result.insertId });
  });
});

// PUT - Update item
router.put('/:id', (req, res) => {
  const { name, category, quantity, unit, location, description } = req.body;

  const sql = `UPDATE stock SET name=?, category=?, quantity=?, unit=?, location=?, description=?, updated_on=NOW() WHERE id=?`;
  const values = [name, category, quantity, unit, location, description, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item updated successfully' });
  });
});

// DELETE - Remove item
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM stock WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  });
});

module.exports = router;