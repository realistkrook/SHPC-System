const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createApp } = require('./app');
const { pool, logConnectionHealth } = require('./db');

const app = createApp({ pool });
const PORT = process.env.PORT || 3001;

// ─── START SERVER ───────────────────────────────────────────

app.listen(PORT, () => {
  logConnectionHealth(pool);
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   API endpoints available at http://localhost:${PORT}/api`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
