const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');

const router = express.Router();
const hostOrAdmin = requireRole(['host', 'admin']);

// Get all quizzes for current user
router.get('/', authMiddleware, hostOrAdmin, (req, res) => {
    const quizzes = db.prepare(`
    SELECT q.*, u.name as creator_name,
    (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
    FROM quizzes q
    JOIN users u ON q.created_by = u.id
    WHERE q.created_by = ?
    ORDER BY q.created_at DESC
  `).all(req.user.id);
    res.json(quizzes);
});

// Get quiz by ID (with questions)
router.get('/:id', authMiddleware, hostOrAdmin, (req, res) => {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index').all(req.params.id);
    res.json({ ...quiz, questions });
});

// Create quiz
router.post('/', authMiddleware, hostOrAdmin, (req, res) => {
    const { title, description, time_per_question, questions } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const result = db.prepare(
        'INSERT INTO quizzes (title, description, created_by, time_per_question) VALUES (?, ?, ?, ?)'
    ).run(title, description || '', req.user.id, time_per_question || 20);

    const quizId = result.lastInsertRowid;

    if (questions && questions.length > 0) {
        const insertQ = db.prepare(
            'INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        questions.forEach((q, i) => {
            insertQ.run(quizId, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, i);
        });
    }

    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
    const savedQuestions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index').all(quizId);
    res.status(201).json({ ...quiz, questions: savedQuestions });
});

// Update quiz
router.put('/:id', authMiddleware, hostOrAdmin, (req, res) => {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const { title, description, time_per_question, questions } = req.body;
    db.prepare('UPDATE quizzes SET title = ?, description = ?, time_per_question = ? WHERE id = ?')
        .run(title || quiz.title, description ?? quiz.description, time_per_question || quiz.time_per_question, quiz.id);

    if (questions) {
        db.prepare('DELETE FROM questions WHERE quiz_id = ?').run(quiz.id);
        const insertQ = db.prepare(
            'INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        questions.forEach((q, i) => {
            insertQ.run(quiz.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, i);
        });
    }

    const updated = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quiz.id);
    const savedQ = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index').all(quiz.id);
    res.json({ ...updated, questions: savedQ });
});

// Delete quiz
router.delete('/:id', authMiddleware, hostOrAdmin, (req, res) => {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Quiz deleted' });
});

// Get quiz analytics
router.get('/:id/analytics', authMiddleware, hostOrAdmin, (req, res) => {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND created_by = ?').get(req.params.id, req.user.id);
    if (!quiz) return res.status(404).json({ error: 'Not found' });

    const sessions = db.prepare('SELECT * FROM game_sessions WHERE quiz_id = ?').all(req.params.id);
    const totalParticipants = sessions.reduce((acc, s) => {
        const count = db.prepare('SELECT COUNT(*) as c FROM session_players WHERE session_id = ?').get(s.id);
        return acc + count.c;
    }, 0);

    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index').all(req.params.id);
    const questionStats = questions.map(q => {
        const totalAnswers = db.prepare('SELECT COUNT(*) as c FROM answers WHERE question_id = ?').get(q.id);
        const correctAnswers = db.prepare('SELECT COUNT(*) as c FROM answers WHERE question_id = ? AND is_correct = 1').get(q.id);
        const rate = totalAnswers.c > 0 ? Math.round((correctAnswers.c / totalAnswers.c) * 100) : 0;
        return { question: q.question, totalAnswers: totalAnswers.c, correctAnswers: correctAnswers.c, correctRate: rate };
    });

    res.json({ quiz, totalSessions: sessions.length, totalParticipants, questionStats });
});

module.exports = router;
