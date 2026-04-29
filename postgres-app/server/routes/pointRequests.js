const express = require('express');

function createPointRequestsRouter({ pool, auth }) {
  const router = express.Router();

  router.use(auth.requireRole(['teacher', 'whanau_leader', 'admin']));

  router.get('/', async (req, res) => {
    try {
      const { teacher_id } = req.query;
      const params = [];
      let whereClause = '';

      if (req.user.role === 'teacher') {
        params.push(req.user.id);
        whereClause = ' WHERE pr.teacher_id = $1';
      } else if (teacher_id) {
        params.push(teacher_id);
        whereClause = ' WHERE pr.teacher_id = $1';
      }

      const result = await pool.query(
        `SELECT
          pr.id,
          pr.house_id,
          h.name AS house_name,
          pr.teacher_id,
          t.full_name AS teacher_name,
          pr.points,
          pr.reason,
          pr.status,
          pr.submitted_at,
          pr.reviewed_by,
          r.full_name AS reviewed_by_name,
          pr.reviewed_at
         FROM point_requests pr
         LEFT JOIN houses h ON pr.house_id = h.id
         LEFT JOIN profiles t ON pr.teacher_id = t.id
         LEFT JOIN profiles r ON pr.reviewed_by = r.id
         ${whereClause}
         ORDER BY pr.submitted_at DESC`,
        params
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching point requests:', err.message);
      res.status(500).json({ error: 'Failed to fetch point requests' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
          pr.id,
          pr.house_id,
          h.name AS house_name,
          pr.teacher_id,
          t.full_name AS teacher_name,
          pr.points,
          pr.reason,
          pr.status,
          pr.submitted_at,
          pr.reviewed_by,
          r.full_name AS reviewed_by_name,
          pr.reviewed_at
         FROM point_requests pr
         LEFT JOIN houses h ON pr.house_id = h.id
         LEFT JOIN profiles t ON pr.teacher_id = t.id
         LEFT JOIN profiles r ON pr.reviewed_by = r.id
         WHERE pr.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Point request not found' });
      }

      const pointRequest = result.rows[0];
      if (req.user.role === 'teacher' && pointRequest.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only view your own requests' });
      }

      res.json(pointRequest);
    } catch (err) {
      console.error('Error fetching point request:', err.message);
      res.status(500).json({ error: 'Failed to fetch point request' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { house_id, points, reason } = req.body;

      if (!house_id) {
        return res.status(400).json({ error: 'house_id is required' });
      }

      if (!points || typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ error: 'Points must be a positive number' });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Reason is required' });
      }

      const houseCheck = await pool.query('SELECT id FROM houses WHERE id = $1', [house_id]);
      if (houseCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid house_id — house does not exist' });
      }

      const result = await pool.query(
        `INSERT INTO point_requests (house_id, teacher_id, points, reason, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING id, house_id, teacher_id, points, reason, status, submitted_at`,
        [house_id, req.user.id, points, reason.trim()]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error submitting point request:', err.message);
      res.status(500).json({ error: 'Failed to submit point request' });
    }
  });

  router.put('/:id/approve', auth.requireRole(['whanau_leader', 'admin']), async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const requestResult = await client.query(
        'SELECT id, house_id, points, status FROM point_requests WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );

      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Point request not found' });
      }

      const pointRequest = requestResult.rows[0];
      if (pointRequest.status !== 'pending') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Request is not pending. Current status: ${pointRequest.status}` });
      }

      await client.query(
        `UPDATE point_requests
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2`,
        [req.user.id, req.params.id]
      );

      await client.query(
        'UPDATE houses SET points = points + $1 WHERE id = $2',
        [pointRequest.points, pointRequest.house_id]
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

  router.put('/:id/reject', auth.requireRole(['whanau_leader', 'admin']), async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE point_requests
         SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2 AND status = 'pending'
         RETURNING id, status`,
        [req.user.id, req.params.id]
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

  router.delete('/:id', auth.requireRole(['admin']), async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM point_requests WHERE id = $1 RETURNING id',
        [req.params.id]
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

  return router;
}

module.exports = {
  createPointRequestsRouter,
};
