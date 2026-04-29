const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { pool: defaultPool } = require('./db');
const { createSessionStore } = require('./auth/sessions');
const { createAuthMiddleware } = require('./auth/middleware');
const { createAuthRouter } = require('./routes/auth');
const { createHousesRouter } = require('./routes/houses');
const { createProfilesRouter } = require('./routes/profiles');
const { createPointRequestsRouter } = require('./routes/pointRequests');
const { createAdminRouter } = require('./routes/admin');

const defaultSessionStore = createSessionStore();

function createApp({ pool = defaultPool, sessionStore = defaultSessionStore } = {}) {
  const app = express();
  const auth = createAuthMiddleware({ pool, sessionStore });

  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));

  app.use(express.json());

  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  app.use(auth.attachCurrentUser);

  app.use('/api/auth', createAuthRouter({ pool, sessionStore, auth }));
  app.use('/api/houses', createHousesRouter({ pool, auth }));
  app.use('/api/profiles', createProfilesRouter({ pool, auth }));
  app.use('/api/point-requests', createPointRequestsRouter({ pool, auth }));
  app.use('/api/admin', createAdminRouter({ pool, auth }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = {
  createApp,
};
