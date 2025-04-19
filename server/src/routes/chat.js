const express = require('express');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Ensure publicKey column exists in the messages table (for migration)
db.query(`ALTER TABLE messages ADD COLUMN publicKey TEXT NULL`).catch(() => {});

// GET /api/users
router.get('/users', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, ecdh_public, rsa_public FROM users WHERE id != ?', [req.user.id]);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ensure id column exists (for migration)
db.query(`ALTER TABLE messages ADD COLUMN id INT PRIMARY KEY AUTO_INCREMENT NOT NULL`).catch(() => {});

// GET /api/messages/:userId
router.get('/messages/:userId', verifyToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  try {
    const [messages] = await db.query(
      `SELECT id, sender_id, receiver_id, iv, ciphertext, algorithm, publicKey, created_at FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`,
      [req.user.id, userId, userId, req.user.id]
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages
const { generateKey, encryptText } = require('../utils/encryption');

router.post('/messages', verifyToken, async (req, res) => {
  // Accept: { to, text, algorithm }
  let { to, text, algorithm } = req.body;
    // Force algorithm to 'aes' regardless of client input
    algorithm = 'aes';
  try {
    // Generate key for this message
    let keyObj;
    try {
      keyObj = generateKey(algorithm);
    } catch (e) {
      console.error('Unsupported algorithm:', algorithm);
      return res.status(400).json({ message: 'Unsupported algorithm' });
    }
    // Validate input
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }
    // Encrypt the text
    const enc = encryptText(algorithm, text, keyObj);
    // Store everything, including plaintext (for demo/testing)
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, iv, ciphertext, algorithm, publicKey, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [req.user.id, to, enc.iv, enc.ciphertext, algorithm, enc.key]
    );
    res.json({ message: 'Message sent', algorithm, key: enc.key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/messages/:id
router.delete('/messages/:id', verifyToken, async (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  if (isNaN(messageId)) {
    return res.status(400).json({ message: 'Invalid message ID' });
  }
  try {
    // Only allow deleting if sender is the user
    const [result] = await db.query('DELETE FROM messages WHERE id = ? AND sender_id = ?', [messageId, req.user.id]);
    if (result.affectedRows === 0) return res.status(403).json({ message: 'Not allowed' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
