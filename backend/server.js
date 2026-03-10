const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quizzes', require('./routes/quiz'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Socket.io game handler
require('./socket/gameHandler')(io);

const PORT = process.env.PORT || 4000;

function startServer(port) {
    server.listen(port, () => {
        console.log(`Quiz Platform Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} in use, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

startServer(PORT);

// Graceful shutdown — prevents orphan processes
process.on('SIGINT', () => { server.close(); process.exit(0); });
process.on('SIGTERM', () => { server.close(); process.exit(0); });
