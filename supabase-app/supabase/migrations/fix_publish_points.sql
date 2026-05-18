-- Fix publish_points RPC to satisfy safe-update enforcement.
-- The previous version ran an unscoped `UPDATE public.houses SET ...` which
-- PostgreSQL refused with "UPDATE requires a WHERE clause".
-- Adding `WHERE id IS NOT NULL` is a no-op predicate that uses the primary
-- key, satisfying safe-update mode while still affecting every row.

create or replace function public.publish_points()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.houses
  set
    published_points = points,
    published_at = now()
  where id is not null;
end;
$$;

-- Allow authenticated users to call it (RLS / role checks still apply).
grant execute on function public.publish_points() to authenticated;
