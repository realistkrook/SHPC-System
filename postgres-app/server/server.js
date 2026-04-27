const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ──────────────────────────────────────────────

// Enable CORS for the React dev server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging (simple middleware)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── ROUTES ─────────────────────────────────────────────────

const housesRouter = require('./routes/houses');
const profilesRouter = require('./routes/profiles');
const pointRequestsRouter = require('./routes/pointRequests');
const adminRouter = require('./routes/admin');

app.use('/api/houses', housesRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/point-requests', pointRequestsRouter);
app.use('/api/admin', adminRouter);

// ─── HEALTH CHECK ───────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── ERROR HANDLING ─────────────────────────────────────────

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START SERVER ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   API endpoints available at http://localhost:${PORT}/api`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
