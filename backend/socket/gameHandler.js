const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// In-memory game state
const rooms = {}; // roomCode -> { sessionId, quizId, hostId, hostSocketId, players, questions, currentQ, timer, status }

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getLeaderboard(roomCode) {
    const room = rooms[roomCode];
    if (!room) return [];
    return Object.values(room.players)
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({ rank: i + 1, userId: p.userId, nickname: p.nickname, score: p.score, lastPoints: p.lastPoints || 0 }));
}

module.exports = (io) => {
    // Auth middleware for socket
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                socket.user = jwt.verify(token, JWT_SECRET);
            } catch {
                socket.user = null;
            }
        }
        next();
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // HOST: Create room
        socket.on('create-room', ({ quizId }, callback) => {
            if (!socket.user) return callback({ error: 'Unauthorized' });
            const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND created_by = ?').get(quizId, socket.user.id);
            if (!quiz) return callback({ error: 'Quiz not found' });

            const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index').all(quizId);
            if (questions.length === 0) return callback({ error: 'Quiz has no questions' });

            const roomCode = generateRoomCode();
            const sessionResult = db.prepare(
                'INSERT INTO game_sessions (room_code, quiz_id, host_id, status) VALUES (?, ?, ?, ?)'
            ).run(roomCode, quizId, socket.user.id, 'lobby');

            rooms[roomCode] = {
                sessionId: sessionResult.lastInsertRowid,
                quizId,
                quizTitle: quiz.title,
                timePerQuestion: quiz.time_per_question,
                hostId: socket.user.id,
                hostSocketId: socket.id,
                players: {},
                questions: shuffle(questions),
                currentQ: -1,
                answersThisRound: {},
                status: 'lobby'
            };

            socket.join(roomCode);
            socket.roomCode = roomCode;
            console.log(`[Room] Created: ${roomCode} by ${socket.user.name}`);
            callback({ roomCode, quiz });
        });

        // PLAYER: Join room
        socket.on('join-room', ({ roomCode, nickname }, callback) => {
            const room = rooms[roomCode];
            if (!room) return callback({ error: 'Room not found' });
            if (room.status !== 'lobby') return callback({ error: 'Game already started' });

            const userId = socket.user?.id || `guest_${socket.id}`;
            const displayName = nickname || socket.user?.name || 'Anonymous';

            room.players[socket.id] = {
                socketId: socket.id,
                userId,
                nickname: displayName,
                score: 0,
                lastPoints: 0
            };

            // Save to DB if user is authenticated
            if (socket.user) {
                const existing = db.prepare('SELECT id FROM session_players WHERE session_id = ? AND user_id = ?')
                    .get(room.sessionId, socket.user.id);
                if (!existing) {
                    db.prepare('INSERT INTO session_players (session_id, user_id, nickname) VALUES (?, ?, ?)')
                        .run(room.sessionId, socket.user.id, displayName);
                }
            }

            socket.join(roomCode);
            socket.roomCode = roomCode;

            const players = Object.values(room.players).map(p => ({ nickname: p.nickname, userId: p.userId }));
            io.to(roomCode).emit('player-joined', { players, newPlayer: { nickname: displayName } });
            callback({ success: true, quizTitle: room.quizTitle, players });
        });

        // HOST: Start quiz
        socket.on('start-quiz', ({ roomCode }, callback) => {
            const room = rooms[roomCode];
            if (!room) return callback?.({ error: 'Room not found' });
            if (room.hostSocketId !== socket.id) return callback?.({ error: 'Only host can start' });
            if (room.status !== 'lobby') return callback?.({ error: 'Already started' });

            room.status = 'active';
            db.prepare('UPDATE game_sessions SET status = ?, started_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run('active', room.sessionId);

            io.to(roomCode).emit('quiz-starting', { countdown: 3 });
            setTimeout(() => sendNextQuestion(io, roomCode), 3000);
            callback?.({ success: true });
        });

        // PLAYER: Submit answer
        socket.on('submit-answer', ({ roomCode, answer, questionId }) => {
            const room = rooms[roomCode];
            if (!room || room.status !== 'active') return;
            if (room.answersThisRound[socket.id]) return; // Already answered

            const now = Date.now();
            const questionStartTime = room.questionStartTime || now;
            const responseTimeMs = now - questionStartTime;

            room.answersThisRound[socket.id] = { answer, responseTimeMs, socketId: socket.id };

            const answered = Object.keys(room.answersThisRound).length;
            const total = Object.keys(room.players).length;

            io.to(roomCode).emit('answer-count', { answered, total });

            // If all players answered, end question early
            if (answered >= total) {
                clearTimeout(room.questionTimer);
                processQuestionEnd(io, roomCode, questionId);
            }
        });

        // HOST: Advance to next question manually
        socket.on('next-question', ({ roomCode }) => {
            const room = rooms[roomCode];
            if (!room || room.hostSocketId !== socket.id) return;
            clearTimeout(room.questionTimer);
            sendNextQuestion(io, roomCode);
        });

        // Disconnect
        socket.on('disconnect', () => {
            const roomCode = socket.roomCode;
            if (!roomCode || !rooms[roomCode]) return;
            const room = rooms[roomCode];

            if (room.hostSocketId === socket.id) {
                // Host left — end game
                io.to(roomCode).emit('host-left');
                clearTimeout(room.questionTimer);
                delete rooms[roomCode];
            } else {
                delete room.players[socket.id];
                const players = Object.values(room.players).map(p => ({ nickname: p.nickname, userId: p.userId }));
                io.to(roomCode).emit('player-left', { players });
            }
        });
    });

    function sendNextQuestion(io, roomCode) {
        const room = rooms[roomCode];
        if (!room) return;

        room.currentQ++;
        room.answersThisRound = {};

        if (room.currentQ >= room.questions.length) {
            endQuiz(io, roomCode);
            return;
        }

        const q = room.questions[room.currentQ];
        room.questionStartTime = Date.now();

        // Send question WITHOUT correct answer
        io.to(roomCode).emit('question', {
            questionNumber: room.currentQ + 1,
            totalQuestions: room.questions.length,
            questionId: q.id,
            question: q.question,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            timeLimit: room.timePerQuestion
        });

        // Auto-end question after timer
        room.questionTimer = setTimeout(() => {
            processQuestionEnd(io, roomCode, q.id);
        }, room.timePerQuestion * 1000);
    }

    function processQuestionEnd(io, roomCode, questionId) {
        const room = rooms[roomCode];
        if (!room) return;

        const q = room.questions[room.currentQ];
        if (!q) return;

        const correctAnswer = q.correct_answer;
        const playerCount = Object.keys(room.players).length;
        const playerResults = [];

        // Score each player
        Object.values(room.players).forEach(player => {
            const submission = room.answersThisRound[player.socketId];
            const answered = !!submission;
            const isCorrect = answered && submission.answer === correctAnswer;
            let points = 0;

            if (isCorrect) {
                points = 10;
                // Speed bonus: up to 5 extra points (faster = more)
                const speedFactor = Math.max(0, 1 - submission.responseTimeMs / (room.timePerQuestion * 1000));
                points += Math.round(speedFactor * 5);
            }

            player.score += points;
            player.lastPoints = points;

            // Save to DB
            if (player.userId && !String(player.userId).startsWith('guest_')) {
                db.prepare(
                    'INSERT INTO answers (session_id, user_id, question_id, answer, is_correct, points_earned, response_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?)'
                ).run(
                    room.sessionId,
                    player.userId,
                    questionId,
                    submission?.answer || '',
                    isCorrect ? 1 : 0,
                    points,
                    submission?.responseTimeMs || 0
                );
            }

            playerResults.push({ socketId: player.socketId, isCorrect, points, totalScore: player.score });
        });

        const leaderboard = getLeaderboard(roomCode);

        io.to(roomCode).emit('question-result', {
            correctAnswer,
            playerResults,
            leaderboard
        });

        setTimeout(() => {
            io.to(roomCode).emit('leaderboard', { leaderboard, isIntermediate: true });
        }, 3000);
    }

    function endQuiz(io, roomCode) {
        const room = rooms[roomCode];
        if (!room) return;

        room.status = 'ended';
        db.prepare('UPDATE game_sessions SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run('ended', room.sessionId);

        // Update scores in DB
        Object.values(room.players).forEach(player => {
            if (player.userId && !String(player.userId).startsWith('guest_')) {
                db.prepare('UPDATE session_players SET score = ? WHERE session_id = ? AND user_id = ?')
                    .run(player.score, room.sessionId, player.userId);
            }
        });

        const leaderboard = getLeaderboard(roomCode);
        io.to(roomCode).emit('quiz-end', { leaderboard });
    }
};
