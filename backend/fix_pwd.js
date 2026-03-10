const bcrypt = require('bcryptjs');
const db = require('./db/database');

async function fix() {
  const hash = await bcrypt.hash('srithan', 10);
  db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hash, 'srithan06@gmail.com');
  console.log('Password reset to: srithan');
}
fix();
