#!/usr/bin/env node
/**
 * Promote a user to admin by email.
 * Usage: node scripts/make-admin.js <email>
 * Example: node scripts/make-admin.js srithan06@gmail.com
 */
const db = require('../db/database');

const email = process.argv[2];
if (!email) {
    console.log('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
}

const user = db.prepare('SELECT id, name, email, role FROM users WHERE email = ?').get(email);
if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
}

if (user.role === 'admin') {
    console.log(`⚡ ${user.name} (${user.email}) is already an admin.`);
    process.exit(0);
}

db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);
console.log(`✅ ${user.name} (${user.email}) has been promoted to admin!`);
