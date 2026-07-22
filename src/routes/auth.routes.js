import { randomUUID } from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { createUser, getUserByUsername } from '../db.js';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config.js';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';

    if (!normalizedUsername || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    if (typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({ error: 'password must be at least 4 characters' });
    }
    if (await getUserByUsername(normalizedUsername)) {
      return res.status(409).json({ error: 'username already exists' });
    }

    const user = await createUser({
      id: randomUUID(),
      username: normalizedUsername,
      passwordHash: await bcrypt.hash(password, 10),
    });

    return res.status(201).json(user);
  } catch (err) {
    if (err?.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'username already exists' });
    }
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';

    if (!normalizedUsername || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const user = await getUserByUsername(normalizedUsername);
    if (!user) {
      return res.status(401).json({ error: 'invalid username or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'invalid username or password' });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    return next(err);
  }
});

export default router;
