-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Policy: Allow users to read their own profile
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
);

-- Policy: Allow admins to read all profiles
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Policy: Allow users to update their own profile (optional, but good practice)
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
);
