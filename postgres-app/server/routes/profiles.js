const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── GET /api/profiles ───────────────────────────────────────
// Fetch all profiles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, created_at, updated_at FROM profiles ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching profiles:', err.message);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// ─── GET /api/profiles/:id ───────────────────────────────────
// Fetch a single profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, full_name, email, role, created_at, updated_at FROM profiles WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── POST /api/profiles ─────────────────────────────────────
// Create a new profile
router.post('/', async (req, res) => {
  try {
    const { full_name, email, role } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'full_name is required' });
    }

    const validRoles = ['teacher', 'whanau_leader', 'admin', 'student'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const result = await pool.query(
      'INSERT INTO profiles (full_name, email, role) VALUES ($1, $2, $3) RETURNING id, full_name, email, role, created_at',
      [full_name, email || null, role || 'student']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A profile with this email already exists' });
    }
    console.error('Error creating profile:', err.message);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// ─── PUT /api/profiles/:id/role ──────────────────────────────
// Update a profile's role
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['teacher', 'whanau_leader', 'admin', 'student'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE profiles SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating profile role:', err.message);
    res.status(500).json({ error: 'Failed to update profile role' });
  }
});

// ─── DELETE /api/profiles/:id ────────────────────────────────
// Delete a profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM profiles WHERE id = $1 RETURNING id, full_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ message: 'Profile deleted', profile: result.rows[0] });
  } catch (err) {
    console.error('Error deleting profile:', err.message);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

module.exports = router;
