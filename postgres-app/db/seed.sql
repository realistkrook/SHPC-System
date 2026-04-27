-- ============================================================
-- Aotea College House Points — Seed Data
-- ============================================================
-- Run AFTER schema.sql to populate with sample data.
-- Usage: psql -U postgres -d house_points -f db/seed.sql
-- ============================================================

-- ============================================================
-- 1) HOUSES — the four school houses
-- ============================================================

INSERT INTO houses (id, name, points, published_points) VALUES
  ('pukeko',   'Pūkeko',    125, 100),
  ('kereru',   'Kererū',    98,  90),
  ('korimako', 'Kōrimako',  142, 130),
  ('kotuku',   'Kōtuku',    110, 105)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2) PROFILES — sample users with different roles
-- ============================================================

INSERT INTO profiles (id, full_name, email, role) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sarah Thompson',  'sarah.thompson@aotea.school.nz',  'admin'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'James Mitchell',  'james.mitchell@aotea.school.nz',  'whanau_leader'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Emily Chen',      'emily.chen@aotea.school.nz',      'teacher'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Michael Roberts', 'michael.roberts@aotea.school.nz', 'teacher'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Aroha Williams',  'aroha.williams@aotea.school.nz',  'student')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3) POINT REQUESTS — sample submissions in various states
-- ============================================================

INSERT INTO point_requests (house_id, teacher_id, points, reason, status, submitted_at, reviewed_by, reviewed_at) VALUES
  -- Approved request from Emily Chen for Pūkeko
  ('pukeko',   'c3d4e5f6-a7b8-9012-cdef-123456789012', 15, 'Outstanding performance in science fair',
   'approved', NOW() - INTERVAL '3 days', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NOW() - INTERVAL '2 days'),

  -- Approved request from Michael Roberts for Kōrimako
  ('korimako', 'd4e5f6a7-b8c9-0123-defa-234567890123', 10, 'Excellent teamwork during sports day',
   'approved', NOW() - INTERVAL '5 days', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NOW() - INTERVAL '4 days'),

  -- Pending request from Emily Chen for Kererū
  ('kereru',   'c3d4e5f6-a7b8-9012-cdef-123456789012', 8, 'Great community service participation',
   'pending', NOW() - INTERVAL '1 day', NULL, NULL),

  -- Pending request from Michael Roberts for Kōtuku
  ('kotuku',   'd4e5f6a7-b8c9-0123-defa-234567890123', 20, 'Champions in inter-house debate competition',
   'pending', NOW() - INTERVAL '6 hours', NULL, NULL),

  -- Rejected request
  ('pukeko',   'c3d4e5f6-a7b8-9012-cdef-123456789012', 50, 'General good behaviour',
   'rejected', NOW() - INTERVAL '7 days', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() - INTERVAL '6 days');

-- ============================================================
-- 4) ALLOWED EMAILS — domain-level and specific entries
-- ============================================================

INSERT INTO allowed_emails (email, role, note) VALUES
  ('@aotea.school.nz', 'student', 'Allow all school domain emails'),
  ('sarah.thompson@aotea.school.nz', 'admin', 'System administrator')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- End of seed data
-- ============================================================
