-- init_supabase.sql
-- Idempotent schema + functions for Aotea College House Points
-- Run this in Supabase SQL editor (recommended) or via the Supabase CLI: `supabase db query < db/init_supabase.sql`

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Create enum for point request status if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'point_request_status') THEN
    CREATE TYPE point_request_status AS ENUM ('pending','approved','rejected');
  END IF;
END$$;

-- 2) Create enum for user roles (optional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('teacher', 'whanau_leader', 'admin', 'student');
  END IF;
END$$;

-- 3) Profiles table (linked to Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  role user_role DEFAULT 'teacher',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Houses table
CREATE TABLE IF NOT EXISTS public.houses (
  id text PRIMARY KEY,
  name text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed some default houses if they don't exist
INSERT INTO public.houses (id, name, points)
SELECT * FROM (VALUES
  ('pukeko','Pukeko',0),
  ('keruru','Kererū',0),
  ('korimako','Korimako',0),
  ('kotuku','Kotuku',0)
) AS v(id,name,points)
WHERE NOT EXISTS (SELECT 1 FROM public.houses h WHERE h.id = v.id);

-- 5) Point requests table
CREATE TABLE IF NOT EXISTS public.point_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id text NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  points integer NOT NULL,
  reason text,
  status point_request_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz
);

-- 6) Triggers to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS touch_profiles_updated_at ON public.profiles;
CREATE TRIGGER touch_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_houses_updated_at ON public.houses;
CREATE TRIGGER touch_houses_updated_at
BEFORE UPDATE ON public.houses
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- 7) Function: add_manual_points(p_house_id text, p_points int, p_reason text)
-- Adds points to a house and logs an approved point_request. Uses auth.uid() as reviewer if available.
CREATE OR REPLACE FUNCTION public.add_manual_points(p_house_id text, p_points integer, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_reviewer uuid := NULL;
BEGIN
  -- auth.uid() is available when called with a JWT (client) and returns the caller's user id
  BEGIN
    v_reviewer := auth.uid()::uuid;
  EXCEPTION WHEN INVALID_TEXT_REPRESENTATION THEN
    v_reviewer := NULL;
  END;

  -- Update house points atomically
  UPDATE public.houses
  SET points = points + p_points, updated_at = now()
  WHERE id = p_house_id;

  -- Insert a point_request record for logging with status = 'approved'
  INSERT INTO public.point_requests (house_id, teacher_id, points, reason, status, submitted_at, reviewed_by, reviewed_at)
  VALUES (p_house_id, NULL, p_points, p_reason, 'approved', now(), v_reviewer, now());
END; $$;

-- 8) Function: approve_request(request_id uuid)
-- Approves a pending point_request: updates house points and marks the request approved with reviewer = auth.uid()
CREATE OR REPLACE FUNCTION public.approve_request(request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_req RECORD;
  v_reviewer uuid := NULL;
BEGIN
  SELECT * INTO v_req FROM public.point_requests WHERE id = request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found: %', request_id;
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request is not pending (id=%). Current status: %', request_id, v_req.status;
  END IF;

  BEGIN
    v_reviewer := auth.uid()::uuid;
  EXCEPTION WHEN INVALID_TEXT_REPRESENTATION THEN
    v_reviewer := NULL;
  END;

  -- Update the house points
  UPDATE public.houses
  SET points = points + v_req.points, updated_at = now()
  WHERE id = v_req.house_id;

  -- Mark request as approved
  UPDATE public.point_requests
  SET status = 'approved', reviewed_by = v_reviewer, reviewed_at = now()
  WHERE id = request_id;
END; $$;

-- 9) Function: reject_request(request_id uuid)
CREATE OR REPLACE FUNCTION public.reject_request(request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_reviewer uuid := NULL;
BEGIN
  BEGIN
    v_reviewer := auth.uid()::uuid;
  EXCEPTION WHEN INVALID_TEXT_REPRESENTATION THEN
    v_reviewer := NULL;
  END;

  UPDATE public.point_requests
  SET status = 'rejected', reviewed_by = v_reviewer, reviewed_at = now()
  WHERE id = request_id;
END; $$;

-- 10) Function: reset_project()
-- WARNING: This will clear point_requests, reset house points, and delete all profiles except the caller.
CREATE OR REPLACE FUNCTION public.reset_project()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller uuid := NULL;
BEGIN
  BEGIN
    v_caller := auth.uid()::uuid;
  EXCEPTION WHEN INVALID_TEXT_REPRESENTATION THEN
    v_caller := NULL;
  END;

  -- Delete point requests
  DELETE FROM public.point_requests;

  -- Reset house points
  UPDATE public.houses SET points = 0, updated_at = now();

  -- Delete profiles except the caller (be careful)
  IF v_caller IS NOT NULL THEN
    DELETE FROM public.profiles WHERE id <> v_caller;
  ELSE
    -- If we don't know the caller, don't delete profiles to avoid accidental data loss
    RAISE NOTICE 'reset_project called without an authenticated caller; profiles not deleted.';
  END IF;
END; $$;

-- 11) Enable Row Level Security (RLS) and example policies
-- NOTE: Review and adapt these policies to your security needs. These are minimal examples.

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow profile owners to SELECT and UPDATE their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'profiles_select_own_or_public'
      AND p.polrelid = 'public.profiles'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "profiles_select_own_or_public" ON public.profiles
      FOR SELECT USING (true);
    $pol$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'profiles_update_own'
      AND p.polrelid = 'public.profiles'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "profiles_update_own" ON public.profiles
      FOR UPDATE USING ((auth.uid()::uuid = id) OR auth.role() = 'service_role')
      WITH CHECK ((auth.uid()::uuid = id) OR auth.role() = 'service_role');
    $pol$;
  END IF;
END$$;

-- Enable RLS on houses (allow public read)
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'houses_select_public'
      AND p.polrelid = 'public.houses'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "houses_select_public" ON public.houses
      FOR SELECT USING (true);
    $pol$;
  END IF;
END$$;

-- Only allow updates via RPC or by service_role (admins should use RPCs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'houses_update_service_or_rpc'
      AND p.polrelid = 'public.houses'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "houses_update_service_or_rpc" ON public.houses
      FOR UPDATE USING (auth.role() = 'service_role');
    $pol$;
  END IF;
END$$;

-- Enable RLS on point_requests
ALTER TABLE public.point_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'point_requests_insert_authenticated'
      AND p.polrelid = 'public.point_requests'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "point_requests_insert_authenticated" ON public.point_requests
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    $pol$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'point_requests_select_authenticated'
      AND p.polrelid = 'public.point_requests'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "point_requests_select_authenticated" ON public.point_requests
      FOR SELECT USING (auth.uid() IS NOT NULL);
    $pol$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    WHERE p.polname = 'point_requests_update_service_or_owner'
      AND p.polrelid = 'public.point_requests'::regclass
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "point_requests_update_service_or_owner" ON public.point_requests
      FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::uuid = reviewed_by);
    $pol$;
  END IF;
END$$;

-- End of migration

COMMENT ON FUNCTION public.add_manual_points IS 'Adds points to a house and inserts an approved point_request (used for manual adjustments)';
COMMENT ON FUNCTION public.approve_request IS 'Approves a pending point_request and applies points to the corresponding house';
COMMENT ON FUNCTION public.reset_project IS 'Dangerous: resets project data (point_requests, house points, and profiles except caller)';
