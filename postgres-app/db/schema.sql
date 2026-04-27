-- ============================================================
-- Aotea College House Points — PostgreSQL Schema
-- ============================================================
-- Run this file to create all tables, enums, and triggers.
-- Usage: psql -U postgres -d house_points -f db/schema.sql
-- ============================================================

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1) ENUMS
-- ============================================================

-- User roles within the system
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('teacher', 'whanau_leader', 'admin', 'student');
  END IF;
END$$;

-- Status of a point request through its lifecycle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'point_request_status') THEN
    CREATE TYPE point_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

-- ============================================================
-- 2) TABLES
-- ============================================================

-- Profiles: represents users within the system
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  email      TEXT UNIQUE,
  role       user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Houses: the four school houses competing for points
CREATE TABLE IF NOT EXISTS houses (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  points           INTEGER NOT NULL DEFAULT 0,
  published_points INTEGER NOT NULL DEFAULT 0,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Point Requests: teachers submit these; leaders approve/reject
CREATE TABLE IF NOT EXISTS point_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id     TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  teacher_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  points       INTEGER NOT NULL,
  reason       TEXT,
  status       point_request_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ
);

-- Allowed Emails: admin-managed whitelist for access control
CREATE TABLE IF NOT EXISTS allowed_emails (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'student',
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3) INDEXES (for common query patterns)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_point_requests_house_id    ON point_requests(house_id);
CREATE INDEX IF NOT EXISTS idx_point_requests_teacher_id  ON point_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_point_requests_status      ON point_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email             ON profiles(email);

-- ============================================================
-- 4) TRIGGERS — auto-update updated_at on row changes
-- ============================================================

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_houses_updated_at ON houses;
CREATE TRIGGER trg_houses_updated_at
  BEFORE UPDATE ON houses
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- End of schema
-- ============================================================
