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

INSERT INTO profiles (id, full_name, email, role, password_hash, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sarah Thompson',  'sarah.thompson@aotea.school.nz',  'admin',         'scrypt$ec37bf9a3f7a2adeeaa86c691a951584$a7d52be4535a10bbc374fdc7ff1a6e63451dffedf02a1a5787c46d4a6e32fe67ada7c21efbd1c4a4e90a83ebd3ed5f83d2053ac4791633ff9667fb55bc044925', TRUE),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'James Mitchell',  'james.mitchell@aotea.school.nz',  'whanau_leader', 'scrypt$621119e4456ace5eeb291bfd2e6ea16e$9cd2928aaff4c3ea9309bbe2721e2999a64574b0eff4e3a502fcd05e78d793e0d0d4c04f3aa98a9caae980d9a0d9c0470b1e16a650d7ff8563173947af762f1f', TRUE),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Emily Chen',      'emily.chen@aotea.school.nz',      'teacher',       'scrypt$2f5e99bdad701cb7fbb08b1be5962c64$4b12f5ee00aed1440490d8894f5a5ee3bf4ec9f3cd926acdaac912d061252c92e1bc8b50f5306c9297e1e7ba9d2276aa74faeec666cc115bc006a64a3514d06b', TRUE),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Michael Roberts', 'michael.roberts@aotea.school.nz', 'teacher',       NULL, FALSE),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Aroha Williams',  'aroha.williams@aotea.school.nz',  'student',       NULL, FALSE)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active;

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
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  note = EXCLUDED.note;

-- ============================================================
-- End of seed data
-- ============================================================
