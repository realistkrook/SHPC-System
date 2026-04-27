-- ============================================================
-- Aotea College House Points — Example SQL Queries
-- ============================================================
-- This file demonstrates the SQL operations used by the app.
-- These are reference examples — the actual queries run in
-- the Express server routes using node-postgres (pg).
-- ============================================================


-- ============================================================
-- SELECT QUERIES
-- ============================================================

-- Get all houses sorted by points (descending)
SELECT id, name, points, published_points, published_at
FROM houses
ORDER BY points DESC;

-- Get a single house by ID
SELECT id, name, points, published_points, published_at
FROM houses
WHERE id = 'pukeko';

-- Get all profiles
SELECT id, full_name, email, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Get a single profile by ID
SELECT id, full_name, email, role
FROM profiles
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Get all point requests with teacher and house names (JOIN)
SELECT
  pr.id,
  pr.house_id,
  h.name     AS house_name,
  pr.teacher_id,
  t.full_name AS teacher_name,
  pr.points,
  pr.reason,
  pr.status,
  pr.submitted_at,
  pr.reviewed_by,
  r.full_name AS reviewer_name,
  pr.reviewed_at
FROM point_requests pr
LEFT JOIN houses   h ON pr.house_id   = h.id
LEFT JOIN profiles t ON pr.teacher_id = t.id
LEFT JOIN profiles r ON pr.reviewed_by = r.id
ORDER BY pr.submitted_at DESC;

-- Get only pending requests (for the approval queue)
SELECT
  pr.id, pr.house_id, h.name AS house_name,
  pr.teacher_id, t.full_name AS teacher_name,
  pr.points, pr.reason, pr.submitted_at
FROM point_requests pr
LEFT JOIN houses   h ON pr.house_id   = h.id
LEFT JOIN profiles t ON pr.teacher_id = t.id
WHERE pr.status = 'pending'
ORDER BY pr.submitted_at ASC;

-- Get requests for a specific teacher
SELECT pr.*, h.name AS house_name
FROM point_requests pr
LEFT JOIN houses h ON pr.house_id = h.id
WHERE pr.teacher_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
ORDER BY pr.submitted_at DESC;


-- ============================================================
-- INSERT QUERIES
-- ============================================================

-- Add a new profile
INSERT INTO profiles (full_name, email, role)
VALUES ('New Teacher', 'new.teacher@aotea.school.nz', 'teacher')
RETURNING id, full_name, email, role;

-- Submit a new point request
INSERT INTO point_requests (house_id, teacher_id, points, reason, status)
VALUES ('kereru', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 12, 'Won the quiz competition', 'pending')
RETURNING id, house_id, points, reason, status, submitted_at;

-- Add a new allowed email entry
INSERT INTO allowed_emails (email, role, note)
VALUES ('specific.user@aotea.school.nz', 'teacher', 'Manually added')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, note = EXCLUDED.note;


-- ============================================================
-- UPDATE QUERIES
-- ============================================================

-- Update a user's role
UPDATE profiles
SET role = 'whanau_leader'
WHERE id = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
RETURNING id, full_name, role;

-- Set house points directly (admin override)
UPDATE houses
SET points = 200
WHERE id = 'pukeko'
RETURNING id, name, points;

-- Approve a point request (requires a transaction — see below)

-- Publish points: copy current points to published_points
UPDATE houses
SET published_points = points,
    published_at = NOW()
RETURNING id, name, points, published_points, published_at;


-- ============================================================
-- DELETE QUERIES
-- ============================================================

-- Delete a specific point request
DELETE FROM point_requests
WHERE id = '...'
RETURNING id;

-- Delete an allowed email entry
DELETE FROM allowed_emails
WHERE email = 'specific.user@aotea.school.nz'
RETURNING email;

-- Delete a profile
DELETE FROM profiles
WHERE id = 'e5f6a7b8-c9d0-1234-efab-345678901234'
RETURNING id, full_name;


-- ============================================================
-- TRANSACTION EXAMPLES
-- ============================================================

-- Approve a request: update request status AND add points to house
-- This must be atomic to prevent partial updates.
BEGIN;

  -- Mark the request as approved
  UPDATE point_requests
  SET status = 'approved',
      reviewed_by = 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      reviewed_at = NOW()
  WHERE id = '...' AND status = 'pending';

  -- Add the points to the house (uses a subquery for the point value)
  UPDATE houses
  SET points = points + (
    SELECT points FROM point_requests WHERE id = '...'
  )
  WHERE id = (
    SELECT house_id FROM point_requests WHERE id = '...'
  );

COMMIT;

-- Reject a request (simpler — no points change)
UPDATE point_requests
SET status = 'rejected',
    reviewed_by = 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    reviewed_at = NOW()
WHERE id = '...' AND status = 'pending'
RETURNING id, status;

-- Add manual points: insert an approved record + update house
BEGIN;

  UPDATE houses
  SET points = points + 25
  WHERE id = 'korimako';

  INSERT INTO point_requests (house_id, teacher_id, points, reason, status, reviewed_by, reviewed_at)
  VALUES ('korimako', NULL, 25, 'Sports Day Winner', 'approved',
          'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW());

COMMIT;

-- Reset project: clear all data
BEGIN;
  DELETE FROM point_requests;
  UPDATE houses SET points = 0, published_points = 0, published_at = NULL;
  -- Optionally delete profiles except admin
  DELETE FROM profiles WHERE role != 'admin';
COMMIT;

-- ============================================================
-- End of example queries
-- ============================================================
