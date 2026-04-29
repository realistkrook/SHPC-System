const express = require('express');
const { verifyPassword } = require('../auth/passwords');
const { toPublicProfile } = require('../auth/middleware');

function createAuthRouter({ pool, sessionStore, auth }) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await pool.query(
        `SELECT id, full_name, email, role, password_hash, is_active, last_login_at, created_at, updated_at
         FROM profiles
         WHERE LOWER(email) = LOWER($1)`,
        [email.trim()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const profile = result.rows[0];
      if (!profile.is_active || !profile.password_hash) {
        return res.status(403).json({ error: 'This account is not active for staff login' });
      }

      const isValidPassword = await verifyPassword(password, profile.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      await pool.query(
        'UPDATE profiles SET last_login_at = NOW() WHERE id = $1',
        [profile.id]
      );

      const { token } = sessionStore.createSession(profile.id);
      auth.setSessionCookie(res, token);

      const refreshedProfile = await pool.query(
        `SELECT id, full_name, email, role, is_active, last_login_at, created_at, updated_at
         FROM profiles
         WHERE id = $1`,
        [profile.id]
      );

      return res.json({ profile: toPublicProfile(refreshedProfile.rows[0]) });
    } catch (err) {
      console.error('Error logging in:', err.message);
      return res.status(500).json({ error: 'Failed to log in' });
    }
  });

  router.post('/logout', (req, res) => {
    if (req.sessionToken) {
      sessionStore.deleteSession(req.sessionToken);
    }

    auth.clearSessionCookie(res);
    res.json({ message: 'Signed out successfully' });
  });

  router.get('/me', auth.requireAuth, (req, res) => {
    res.json({ profile: req.user });
  });

  return router;
}

module.exports = {
  createAuthRouter,
};
