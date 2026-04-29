const express = require('express');

function createHousesRouter({ pool, auth }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, points, published_points, published_at, created_at, updated_at FROM houses ORDER BY points DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching houses:', err.message);
      res.status(500).json({ error: 'Failed to fetch houses' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, name, points, published_points, published_at, created_at, updated_at FROM houses WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'House not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching house:', err.message);
      res.status(500).json({ error: 'Failed to fetch house' });
    }
  });

  router.put('/:id/points', auth.requireRole(['admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { points } = req.body;

      if (points === undefined || typeof points !== 'number') {
        return res.status(400).json({ error: 'Points must be a number' });
      }

      const result = await pool.query(
        'UPDATE houses SET points = $1 WHERE id = $2 RETURNING id, name, points, published_points, published_at',
        [points, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'House not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating house points:', err.message);
      res.status(500).json({ error: 'Failed to update house points' });
    }
  });

  router.post('/:id/manual-points', auth.requireRole(['admin']), async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;
      const { points, reason } = req.body;

      if (!points || !reason) {
        return res.status(400).json({ error: 'Points and reason are required' });
      }

      if (typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ error: 'Points must be a positive number' });
      }

      await client.query('BEGIN');

      const houseResult = await client.query(
        'UPDATE houses SET points = points + $1 WHERE id = $2 RETURNING id, name, points, published_points, published_at',
        [points, id]
      );

      if (houseResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'House not found' });
      }

      await client.query(
        `INSERT INTO point_requests (house_id, teacher_id, points, reason, status, reviewed_by, reviewed_at)
         VALUES ($1, NULL, $2, $3, 'approved', $4, NOW())`,
        [id, points, reason.trim(), req.user.id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Points added successfully', house: houseResult.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error adding manual points:', err.message);
      res.status(500).json({ error: 'Failed to add manual points' });
    } finally {
      client.release();
    }
  });

  router.post('/publish', auth.requireRole(['admin']), async (req, res) => {
    try {
      const result = await pool.query(
        'UPDATE houses SET published_points = points, published_at = NOW() RETURNING id, name, points, published_points, published_at'
      );

      res.json({ message: 'Points published successfully', houses: result.rows });
    } catch (err) {
      console.error('Error publishing points:', err.message);
      res.status(500).json({ error: 'Failed to publish points' });
    }
  });

  return router;
}

module.exports = {
  createHousesRouter,
};
