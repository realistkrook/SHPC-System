-- diagnostics_triggers.sql
-- Lists triggers on auth.users and any functions referencing auth.users

-- 1) Triggers on auth.users with function name and owner
SELECT t.tgname AS trigger_name,
       t.tgrelid::regclass::text AS table_name,
       p.proname AS function_name,
       pg_get_userbyid(p.proowner) AS function_owner,
       pg_get_functiondef(p.oid) AS function_definition
FROM pg_trigger t
LEFT JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'auth.users'::regclass;

-- 2) Functions that reference auth.users (by name) or common auth trigger function names
SELECT n.nspname AS schema,
       p.proname AS function_name,
       pg_get_userbyid(p.proowner) AS owner,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%auth.users%' OR pg_get_functiondef(p.oid) ILIKE '%handle_auth%' OR p.proname ILIKE '%auth_user%';
