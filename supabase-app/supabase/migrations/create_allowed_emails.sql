-- Create the allowed_emails table
create table if not exists public.allowed_emails (
  email text primary key,
  role text not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.allowed_emails enable row level security;

-- Policy: Allow read access to everyone (or restrict to authenticated if preferred)
-- We'll allow authenticated users to read so the Admin Dashboard can list them.
create policy "Enable read access for authenticated users"
on public.allowed_emails
for select
to authenticated
using (true);

-- Policy: Allow insert/update/delete only for Admins
-- This assumes you have a 'profiles' table with a 'role' column.
create policy "Enable write access for admins only"
on public.allowed_emails
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
