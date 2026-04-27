const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── POST /api/admin/reset ───────────────────────────────────
// Reset all project data: clear requests, reset points, optionally remove profiles
router.post('/reset', async (req, res) => {
  const client = await pool.connect();
  try {
    const { keep_profile_id } = req.body;

    await client.query('BEGIN');

    // Delete all point requests
    const deletedRequests = await client.query('DELETE FROM point_requests RETURNING id');

    // Reset all house points to 0
    await client.query(
      'UPDATE houses SET points = 0, published_points = 0, published_at = NULL'
    );

    // Delete profiles except the caller (if specified)
    let deletedProfiles = { rowCount: 0 };
    if (keep_profile_id) {
      deletedProfiles = await client.query(
        'DELETE FROM profiles WHERE id != $1 RETURNING id',
        [keep_profile_id]
      );
    }

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

// ─── GET /api/admin/allowed-emails ───────────────────────────
// List all allowed emails
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

// ─── POST /api/admin/allowed-emails ──────────────────────────
// Add or update an allowed email entry (upsert)
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
      [email.toLowerCase().trim(), role, note || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error upserting allowed email:', err.message);
    res.status(500).json({ error: 'Failed to save allowed email' });
  }
});

// ─── DELETE /api/admin/allowed-emails/:email ─────────────────
// Delete an allowed email entry
router.delete('/allowed-emails/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      'DELETE FROM allowed_emails WHERE email = $1 RETURNING email',
      [email]
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

module.exports = router;
