'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'readit-dev-secret-change-in-prod';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Request logger ───────────────────────────────────────────────────────────

app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  const ip = req.ip || req.socket?.remoteAddress || '-';
  console.log(`[${ts}] ${req.method} ${req.path} — ${ip}`);
  next();
});

// ─── Credentials (mock store) ─────────────────────────────────────────────────

const VALID_CREDENTIALS = {
  email: 'user@readit.dev',
  password: 'password123',
};

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 * Returns: { token: string }  — JWT with 24h expiry
 */
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  if (
    email !== VALID_CREDENTIALS.email ||
    password !== VALID_CREDENTIALS.password
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: email, email },
    JWT_SECRET,
    { expiresIn: '24h' },
  );

  return res.json({ token });
});

/**
 * GET /auth/verify
 * Header: Authorization: Bearer <token>
 * Returns: { valid: true, payload } or 401 { valid: false }
 */
app.get('/auth/verify', (req, res) => {
  const header = req.headers.authorization ?? '';
  const token = header.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, payload });
  } catch {
    return res.status(401).json({ valid: false });
  }
});

/**
 * POST /auth/logout
 * Stateless stub — client discards the token; server acknowledges.
 */
app.post('/auth/logout', (_req, res) => {
  res.json({ success: true });
});

/**
 * GET /health
 * Liveness check.
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`ReadIt auth server running on http://localhost:${PORT}`);
  console.log(`  POST /auth/login   — get JWT token`);
  console.log(`  GET  /auth/verify  — verify JWT token`);
  console.log(`  POST /auth/logout  — logout stub`);
  console.log(`  GET  /health       — liveness check`);
});
