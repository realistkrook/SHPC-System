-- Function to sync roles for ALL existing users
-- This is useful if you updated allowed_emails but the user already exists in profiles.

create or replace function public.sync_all_user_roles()
returns void
language plpgsql
security definer
as $$
begin
  -- Ensure the enum has the value 'whanau_leader'
  -- Note: ALTER TYPE cannot be run inside a PL/pgSQL block in some contexts, 
  -- so we might need to run it separately. But let's try to just handle the sync here.
  -- If the enum is missing the value, the user needs to run:
  -- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'whanau_leader';
  
  -- Update profiles where the email matches an entry in allowed_emails
  -- We cast allowed_emails.role (text) to user_role enum to avoid type mismatch errors
  update public.profiles
  set role = allowed_emails.role::public.user_role
  from public.allowed_emails
  where profiles.email = allowed_emails.email
  and profiles.role <> allowed_emails.role::public.user_role;
end;
$$;

-- Run it immediately
select public.sync_all_user_roles();

-- Also, let's update the trigger to handle UPDATES on allowed_emails too?
-- That's complex because we need to find the user by email.
-- For now, let's just make sure the trigger on auth.users handles updates too (e.g. if email changes).

create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
as $$
declare
  allowed_role text;
begin
  -- Check if the user's email is in the allowed_emails table
  select role into allowed_role
  from public.allowed_emails
  where email = new.email;

  if allowed_role is not null then
    update public.profiles
    set role = allowed_role::public.user_role
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();
