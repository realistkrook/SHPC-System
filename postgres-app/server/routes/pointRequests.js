const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── GET /api/point-requests ─────────────────────────────────
// Fetch all point requests with joined teacher/house/reviewer names
router.get('/', async (req, res) => {
  try {
    const { teacher_id } = req.query;

    let query = `
      SELECT
        pr.id,
        pr.house_id,
        h.name       AS house_name,
        pr.teacher_id,
        t.full_name  AS teacher_name,
        pr.points,
        pr.reason,
        pr.status,
        pr.submitted_at,
        pr.reviewed_by,
        r.full_name  AS reviewed_by_name,
        pr.reviewed_at
      FROM point_requests pr
      LEFT JOIN houses   h ON pr.house_id    = h.id
      LEFT JOIN profiles t ON pr.teacher_id  = t.id
      LEFT JOIN profiles r ON pr.reviewed_by = r.id
    `;
    const params = [];

    // Optionally filter by teacher
    if (teacher_id) {
      query += ' WHERE pr.teacher_id = $1';
      params.push(teacher_id);
    }

    query += ' ORDER BY pr.submitted_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching point requests:', err.message);
    res.status(500).json({ error: 'Failed to fetch point requests' });
  }
});

// ─── GET /api/point-requests/:id ─────────────────────────────
// Fetch a single point request by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        pr.*, h.name AS house_name, t.full_name AS teacher_name, r.full_name AS reviewed_by_name
       FROM point_requests pr
       LEFT JOIN houses   h ON pr.house_id    = h.id
       LEFT JOIN profiles t ON pr.teacher_id  = t.id
       LEFT JOIN profiles r ON pr.reviewed_by = r.id
       WHERE pr.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Point request not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching point request:', err.message);
    res.status(500).json({ error: 'Failed to fetch point request' });
  }
});

// ─── POST /api/point-requests ────────────────────────────────
// Submit a new point request
router.post('/', async (req, res) => {
  try {
    const { house_id, teacher_id, points, reason } = req.body;

    // Validation
    if (!house_id) {
      return res.status(400).json({ error: 'house_id is required' });
    }
    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ error: 'Points must be a positive number' });
    }
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    // Verify the house exists
    const houseCheck = await pool.query('SELECT id FROM houses WHERE id = $1', [house_id]);
    if (houseCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid house_id — house does not exist' });
    }

    const result = await pool.query(
      `INSERT INTO point_requests (house_id, teacher_id, points, reason, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, house_id, teacher_id, points, reason, status, submitted_at`,
      [house_id, teacher_id || null, points, reason.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error submitting point request:', err.message);
    res.status(500).json({ error: 'Failed to submit point request' });
  }
});

// ─── PUT /api/point-requests/:id/approve ─────────────────────
// Approve a pending request: update status AND add points to house (transaction)
router.put('/:id/approve', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { reviewer_id } = req.body;

    await client.query('BEGIN');

    // Lock and fetch the request
    const reqResult = await client.query(
      'SELECT id, house_id, points, status FROM point_requests WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Point request not found' });
    }

    const request = reqResult.rows[0];

    if (request.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Request is not pending. Current status: ${request.status}` });
    }

    // Update the request status
    await client.query(
      `UPDATE point_requests
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
       WHERE id = $2`,
      [reviewer_id || null, id]
    );

    // Add points to the house
    await client.query(
      'UPDATE houses SET points = points + $1 WHERE id = $2',
      [request.points, request.house_id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Request approved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error approving request:', err.message);
    res.status(500).json({ error: 'Failed to approve request' });
  } finally {
    client.release();
  }
});

// ─── PUT /api/point-requests/:id/reject ──────────────────────
// Reject a pending request (no point changes)
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_id } = req.body;

    const result = await pool.query(
      `UPDATE point_requests
       SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING id, status`,
      [reviewer_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or not in pending status' });
    }

    res.json({ message: 'Request rejected successfully', request: result.rows[0] });
  } catch (err) {
    console.error('Error rejecting request:', err.message);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// ─── DELETE /api/point-requests/:id ──────────────────────────
// Delete a point request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM point_requests WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Point request not found' });
    }
    res.json({ message: 'Point request deleted' });
  } catch (err) {
    console.error('Error deleting point request:', err.message);
    res.status(500).json({ error: 'Failed to delete point request' });
  }
});

module.exports = router;
