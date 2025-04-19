const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// POST /api/signup
router.post('/signup', async (req, res) => {
  const { username, email, password, ecdhPublic, rsaPublic } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length) return res.status(400).json({ message: 'User already exists' });
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, ecdh_public, rsa_public) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, ecdhPublic, rsaPublic]
    );
    const token = jwt.sign({ id: result.insertId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: result.insertId, username, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
