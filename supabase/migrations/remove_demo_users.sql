-- Remove demo users
-- Run this in your Supabase SQL Editor to delete the demo accounts.

-- 1. Delete profiles associated with the demo emails
DELETE FROM public.profiles 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('teacher@aotea.school.nz', 'leader@aotea.school.nz', 'admin@aotea.school.nz')
);

-- 2. Delete the users from the auth system
DELETE FROM auth.users 
WHERE email IN ('teacher@aotea.school.nz', 'leader@aotea.school.nz', 'admin@aotea.school.nz');
