import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DB_FILE } from './config.js';

let connection;

export async function initDatabase() {
  if (connection) return connection;

  const dbPath = path.resolve(process.cwd(), DB_FILE);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  connection = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await connection.exec('PRAGMA foreign_keys = ON');
  await connection.exec('PRAGMA journal_mode = WAL');

  await connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS poll_options (
      poll_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      PRIMARY KEY (poll_id, option_index),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS votes (
      poll_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (poll_id, user_id),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (poll_id, option_index) REFERENCES poll_options(poll_id, option_index)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_poll_time ON messages(poll_id, timestamp);
  `);

  return connection;
}

async function getDb() {
  return connection || initDatabase();
}

function toPoll(row, options = []) {
  if (!row) return null;
  return {
    id: row.id,
    question: row.question,
    options,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    isOpen: Boolean(row.is_open),
    createdAt: row.created_at,
  };
}

export async function createUser({ id, username, passwordHash }) {
  const db = await getDb();
  await db.run(
    `INSERT INTO users (id, username, password_hash, created_at)
     VALUES (?, ?, ?, ?)`,
    id,
    username,
    passwordHash,
    Date.now(),
  );
  return { id, username };
}

export async function getUserByUsername(username) {
  const db = await getDb();
  return db.get(
    `SELECT id, username, password_hash AS passwordHash
     FROM users
     WHERE username = ?`,
    username,
  );
}

export async function getPollById(id) {
  const db = await getDb();
  const row = await db.get(
    `SELECT p.id, p.question, p.creator_id, u.username AS creator_name,
            p.is_open, p.created_at
     FROM polls p
     JOIN users u ON u.id = p.creator_id
     WHERE p.id = ?`,
    id,
  );
  if (!row) return null;

  const options = await db.all(
    `SELECT option_text
     FROM poll_options
     WHERE poll_id = ?
     ORDER BY option_index ASC`,
    id,
  );

  return toPoll(row, options.map((option) => option.option_text));
}

export async function listPolls() {
  const db = await getDb();
  const rows = await db.all(
    `SELECT p.id
     FROM polls p
     ORDER BY p.created_at DESC`,
  );

  return Promise.all(rows.map((row) => getPollById(row.id)));
}

export async function createPoll({ id, question, options, creatorId }) {
  const db = await getDb();
  const createdAt = Date.now();

  await db.run('BEGIN');
  try {
    await db.run(
      `INSERT INTO polls (id, question, creator_id, is_open, created_at)
       VALUES (?, ?, ?, 1, ?)`,
      id,
      question,
      creatorId,
      createdAt,
    );

    for (const [index, option] of options.entries()) {
      await db.run(
        `INSERT INTO poll_options (poll_id, option_index, option_text)
         VALUES (?, ?, ?)`,
        id,
        index,
        option,
      );
    }

    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  return getPollById(id);
}

export async function getPollResults(pollId) {
  const db = await getDb();
  const optionRows = await db.all(
    `SELECT option_index
     FROM poll_options
     WHERE poll_id = ?
     ORDER BY option_index ASC`,
    pollId,
  );
  if (optionRows.length === 0) return null;

  const results = new Array(optionRows.length).fill(0);
  const voteRows = await db.all(
    `SELECT option_index, COUNT(*) AS count
     FROM votes
     WHERE poll_id = ?
     GROUP BY option_index`,
    pollId,
  );

  for (const row of voteRows) {
    if (row.option_index >= 0 && row.option_index < results.length) {
      results[row.option_index] = row.count;
    }
  }

  const total = results.reduce((sum, count) => sum + count, 0);
  return { results, total };
}

export async function createVote({ pollId, userId, optionIndex }) {
  const db = await getDb();
  try {
    await db.run(
      `INSERT INTO votes (poll_id, user_id, option_index, created_at)
       VALUES (?, ?, ?, ?)`,
      pollId,
      userId,
      optionIndex,
      Date.now(),
    );
  } catch (err) {
    if (err?.code === 'SQLITE_CONSTRAINT') {
      const duplicate = await db.get(
        'SELECT 1 FROM votes WHERE poll_id = ? AND user_id = ?',
        pollId,
        userId,
      );
      if (duplicate) {
        const conflict = new Error('User already voted in this poll');
        conflict.code = 'DUPLICATE_VOTE';
        throw conflict;
      }
    }
    throw err;
  }
}

export async function closePoll({ pollId, userId }) {
  const db = await getDb();
  const result = await db.run(
    `UPDATE polls
     SET is_open = 0
     WHERE id = ? AND creator_id = ?`,
    pollId,
    userId,
  );
  return result.changes > 0;
}

export async function addMessage({ pollId, userId, message }) {
  const db = await getDb();
  const timestamp = Date.now();
  const result = await db.run(
    `INSERT INTO messages (poll_id, user_id, message, timestamp)
     VALUES (?, ?, ?, ?)`,
    pollId,
    userId,
    message,
    timestamp,
  );

  const row = await db.get(
    `SELECT m.user_id, u.username, m.message, m.timestamp
     FROM messages m
     JOIN users u ON u.id = m.user_id
     WHERE m.id = ?`,
    result.lastID,
  );

  return {
    userId: row.user_id,
    username: row.username,
    message: row.message,
    timestamp: row.timestamp,
  };
}

export async function listMessages(pollId) {
  const db = await getDb();
  const rows = await db.all(
    `SELECT m.user_id, u.username, m.message, m.timestamp
     FROM messages m
     JOIN users u ON u.id = m.user_id
     WHERE m.poll_id = ?
     ORDER BY m.timestamp ASC, m.id ASC`,
    pollId,
  );

  return rows.map((row) => ({
    userId: row.user_id,
    username: row.username,
    message: row.message,
    timestamp: row.timestamp,
  }));
}
