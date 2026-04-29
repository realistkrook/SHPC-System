const express = require('express');
const { hashPassword } = require('../auth/passwords');
const { toPublicProfile } = require('../auth/middleware');

const STAFF_ROLES = ['teacher', 'whanau_leader', 'admin'];

function normaliseEmail(email) {
  return email.trim().toLowerCase();
}

async function getAllowedEmailRecord(pool, email) {
  const normalisedEmail = normaliseEmail(email);
  const domain = `@${normalisedEmail.split('@')[1] || ''}`;

  const result = await pool.query(
    'SELECT email, role FROM allowed_emails WHERE email = $1 OR email = $2 ORDER BY CASE WHEN email = $1 THEN 0 ELSE 1 END LIMIT 1',
    [normalisedEmail, domain]
  );

  return result.rows[0] || null;
}

function createAdminRouter({ pool, auth }) {
  const router = express.Router();

  router.use(auth.requireRole(['admin']));

  router.post('/reset', async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const deletedRequests = await client.query('DELETE FROM point_requests RETURNING id');
      await client.query(
        'UPDATE houses SET points = 0, published_points = 0, published_at = NULL'
      );
      const deletedProfiles = await client.query(
        "DELETE FROM profiles WHERE id != $1 AND role != 'student' RETURNING id",
        [req.user.id]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Project reset successfully',
        deleted_requests: deletedRequests.rowCount,
        deleted_profiles: deletedProfiles.rowCount,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error resetting project:', err.message);
      res.status(500).json({ error: 'Failed to reset project' });
    } finally {
      client.release();
    }
  });

  router.get('/allowed-emails', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT email, role, note, created_at FROM allowed_emails ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching allowed emails:', err.message);
      res.status(500).json({ error: 'Failed to fetch allowed emails' });
    }
  });

  router.post('/allowed-emails', async (req, res) => {
    try {
      const { email, role, note } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }

      const result = await pool.query(
        `INSERT INTO allowed_emails (email, role, note)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, note = EXCLUDED.note
         RETURNING email, role, note`,
        [normaliseEmail(email), role, note || null]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error upserting allowed email:', err.message);
      res.status(500).json({ error: 'Failed to save allowed email' });
    }
  });

  router.delete('/allowed-emails/:email', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM allowed_emails WHERE email = $1 RETURNING email',
        [req.params.email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Allowed email not found' });
      }

      res.json({ message: 'Allowed email deleted' });
    } catch (err) {
      console.error('Error deleting allowed email:', err.message);
      res.status(500).json({ error: 'Failed to delete allowed email' });
    }
  });

  router.get('/accounts', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role, is_active, last_login_at, created_at, updated_at
         FROM profiles
         WHERE role != 'student'
         ORDER BY created_at DESC`
      );
      res.json(result.rows.map(toPublicProfile));
    } catch (err) {
      console.error('Error fetching staff accounts:', err.message);
      res.status(500).json({ error: 'Failed to fetch staff accounts' });
    }
  });

  router.post('/accounts', async (req, res) => {
    try {
      const { full_name, email, role, password } = req.body;

      if (!full_name || !email || !role || !password) {
        return res.status(400).json({ error: 'Full name, email, role, and password are required' });
      }

      if (!STAFF_ROLES.includes(role)) {
        return res.status(400).json({ error: `Role must be one of: ${STAFF_ROLES.join(', ')}` });
      }

      const allowedEmail = await getAllowedEmailRecord(pool, email);
      if (!allowedEmail) {
        return res.status(400).json({ error: 'Email is not permitted by the allowed email rules' });
      }

      const passwordHash = await hashPassword(password);
      const result = await pool.query(
        `INSERT INTO profiles (full_name, email, role, password_hash, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         RETURNING id, full_name, email, role, is_active, last_login_at, created_at, updated_at`,
        [full_name.trim(), normaliseEmail(email), role, passwordHash]
      );

      res.status(201).json(toPublicProfile(result.rows[0]));
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'A staff account with this email already exists' });
      }

      console.error('Error creating staff account:', err.message);
      res.status(500).json({ error: 'Failed to create staff account' });
    }
  });

  router.put('/accounts/:id', async (req, res) => {
    try {
      const { full_name, email, role, is_active } = req.body;

      if (!full_name || !email || !role || typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'Full name, email, role, and active state are required' });
      }

      if (!STAFF_ROLES.includes(role)) {
        return res.status(400).json({ error: `Role must be one of: ${STAFF_ROLES.join(', ')}` });
      }

      const allowedEmail = await getAllowedEmailRecord(pool, email);
      if (!allowedEmail) {
        return res.status(400).json({ error: 'Email is not permitted by the allowed email rules' });
      }

      const result = await pool.query(
        `UPDATE profiles
         SET full_name = $1, email = $2, role = $3, is_active = $4
         WHERE id = $5
         RETURNING id, full_name, email, role, is_active, last_login_at, created_at, updated_at`,
        [full_name.trim(), normaliseEmail(email), role, is_active, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Staff account not found' });
      }

      res.json(toPublicProfile(result.rows[0]));
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'A staff account with this email already exists' });
      }

      console.error('Error updating staff account:', err.message);
      res.status(500).json({ error: 'Failed to update staff account' });
    }
  });

  router.put('/accounts/:id/password', async (req, res) => {
    try {
      const { password } = req.body;

      if (!password || password.length < 10) {
        return res.status(400).json({ error: 'Password must be at least 10 characters long' });
      }

      const passwordHash = await hashPassword(password);
      const result = await pool.query(
        `UPDATE profiles
         SET password_hash = $1
         WHERE id = $2
         RETURNING id`,
        [passwordHash, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Staff account not found' });
      }

      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error('Error resetting staff password:', err.message);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  return router;
}

module.exports = {
  createAdminRouter,
};
