const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('./auth');

module.exports = function adminAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
        if (!user) return res.status(401).json({ error: 'User not found' });
        if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
