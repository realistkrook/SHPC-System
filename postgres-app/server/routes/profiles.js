const express = require('express');
const { toPublicProfile } = require('../auth/middleware');

function createProfilesRouter({ pool, auth }) {
  const router = express.Router();

  router.get('/', auth.requireRole(['admin']), async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role, is_active, last_login_at, created_at, updated_at
         FROM profiles
         ORDER BY created_at DESC`
      );
      res.json(result.rows.map(toPublicProfile));
    } catch (err) {
      console.error('Error fetching profiles:', err.message);
      res.status(500).json({ error: 'Failed to fetch profiles' });
    }
  });

  router.get('/:id', auth.requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ error: 'You can only view your own profile' });
      }

      const result = await pool.query(
        `SELECT id, full_name, email, role, is_active, last_login_at, created_at, updated_at
         FROM profiles
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(toPublicProfile(result.rows[0]));
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  return router;
}

module.exports = {
  createProfilesRouter,
};
