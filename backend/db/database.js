const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'quiz.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'player',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    time_per_question INTEGER DEFAULT 20,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_code TEXT UNIQUE NOT NULL,
    quiz_id INTEGER NOT NULL,
    host_id INTEGER NOT NULL,
    status TEXT DEFAULT 'lobby',
    current_question INTEGER DEFAULT 0,
    started_at DATETIME,
    ended_at DATETIME,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    FOREIGN KEY (host_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS session_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    nickname TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    response_time_ms INTEGER DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );
`);

module.exports = db;
