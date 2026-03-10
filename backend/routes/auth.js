const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        return res.status(400).json({ error: 'Password does not meet security requirements.' });
    }
    try {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const result = db.prepare(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
        ).run(name, email, hashed, role || 'player');

        const token = jwt.sign({ id: result.lastInsertRowid, name, email, role: role || 'player' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: role || 'player' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return res.status(401).json({ error: 'User does not exist' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user
router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
});

module.exports = router;
