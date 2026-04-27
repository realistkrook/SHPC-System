-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  allowed_role text;
begin
  -- Check if the user's email is in the allowed_emails table
  select role into allowed_role
  from public.allowed_emails
  where email = new.email;

  -- If found, insert into profiles with the assigned role
  if allowed_role is not null then
    insert into public.profiles (id, full_name, role, email)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      allowed_role,
      new.email
    );
  else
    -- Optional: If not in allowed_emails, create as 'student' or block?
    -- For now, we'll create them as 'student' (default access).
    insert into public.profiles (id, full_name, role, email)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      'student',
      new.email
    );
  end if;

  return new;
end;
$$;

-- Trigger to call the function on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
