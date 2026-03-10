const express = require('express');
const router = express.Router();
const db = require('../db/database');
const adminAuth = require('../middleware/admin');

// All routes require admin auth
router.use(adminAuth);

// ─── Platform Stats ───────────────────────────────────────
router.get('/stats', (req, res) => {
    try {
        const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const quizzes = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
        const sessions = db.prepare('SELECT COUNT(*) as count FROM game_sessions').get();
        const activeSessions = db.prepare("SELECT COUNT(*) as count FROM game_sessions WHERE status IN ('lobby', 'active')").get();
        const answers = db.prepare('SELECT COUNT(*) as count FROM answers').get();
        const players = db.prepare('SELECT COUNT(*) as count FROM session_players').get();

        const roleBreakdown = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
        const recentUsers = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5').all();

        res.json({
            totalUsers: users.count,
            totalQuizzes: quizzes.count,
            totalSessions: sessions.count,
            activeSessions: activeSessions.count,
            totalAnswers: answers.count,
            totalPlayers: players.count,
            roleBreakdown,
            recentUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── User Management ──────────────────────────────────────
router.get('/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC').all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/users/:id/role', (req, res) => {
    try {
        const { role } = req.body;
        if (!['player', 'host', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be player, host, or admin' });
        }
        // Prevent removing self from admin
        if (parseInt(req.params.id) === req.user.id && role !== 'admin') {
            return res.status(400).json({ error: 'Cannot remove your own admin role' });
        }
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/users/:id', (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        if (targetId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        const deleteTransaction = db.transaction((id) => {
            // 1. Delete user's answers
            db.prepare('DELETE FROM answers WHERE user_id = ?').run(id);

            // 2. Delete user's participation in sessions
            db.prepare('DELETE FROM session_players WHERE user_id = ?').run(id);

            // 3. Find and delete sessions hosted by this user
            const hostedSessions = db.prepare('SELECT id FROM game_sessions WHERE host_id = ?').all(id);
            for (const session of hostedSessions) {
                db.prepare('DELETE FROM answers WHERE session_id = ?').run(session.id);
                db.prepare('DELETE FROM session_players WHERE session_id = ?').run(session.id);
                db.prepare('DELETE FROM game_sessions WHERE id = ?').run(session.id);
            }

            // 4. Find and delete quizzes created by this user
            const createdQuizzes = db.prepare('SELECT id FROM quizzes WHERE created_by = ?').all(id);
            for (const quiz of createdQuizzes) {
                db.prepare('DELETE FROM questions WHERE quiz_id = ?').run(quiz.id);
                // Also delete any sessions attached to these quizzes
                const quizSessions = db.prepare('SELECT id FROM game_sessions WHERE quiz_id = ?').all(quiz.id);
                for (const qs of quizSessions) {
                    db.prepare('DELETE FROM answers WHERE session_id = ?').run(qs.id);
                    db.prepare('DELETE FROM session_players WHERE session_id = ?').run(qs.id);
                    db.prepare('DELETE FROM game_sessions WHERE id = ?').run(qs.id);
                }
                db.prepare('DELETE FROM quizzes WHERE id = ?').run(quiz.id);
            }

            // 5. Finally, delete the user
            db.prepare('DELETE FROM users WHERE id = ?').run(id);
        });

        // Execute the transaction
        deleteTransaction(targetId);

        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error('Failed to delete user:', err);
        res.status(500).json({ error: 'Failed to delete user. Please try again.' });
    }
});

// ─── Quiz Management ──────────────────────────────────────
router.get('/quizzes', (req, res) => {
    try {
        const quizzes = db.prepare(`
            SELECT q.*, u.name as creator_name, 
                   (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
                   (SELECT COUNT(*) FROM game_sessions WHERE quiz_id = q.id) as session_count
            FROM quizzes q
            JOIN users u ON q.created_by = u.id
            ORDER BY q.created_at DESC
        `).all();
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/quizzes/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM questions WHERE quiz_id = ?').run(req.params.id);
        db.prepare('DELETE FROM quizzes WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Session Management ───────────────────────────────────
router.get('/sessions', (req, res) => {
    try {
        const sessions = db.prepare(`
            SELECT gs.*, q.title as quiz_title, u.name as host_name,
                   (SELECT COUNT(*) FROM session_players WHERE session_id = gs.id) as player_count
            FROM game_sessions gs
            JOIN quizzes q ON gs.quiz_id = q.id
            JOIN users u ON gs.host_id = u.id
            ORDER BY gs.started_at DESC
        `).all();
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
