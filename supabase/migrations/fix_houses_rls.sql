-- Enable RLS on houses table if not already enabled
alter table public.houses enable row level security;

-- Policy: Allow read access to everyone (anon and authenticated)
create policy "Enable read access for all users"
on public.houses
for select
using (true);

-- Policy: Allow update access only for Admins
create policy "Enable update access for admins only"
on public.houses
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
