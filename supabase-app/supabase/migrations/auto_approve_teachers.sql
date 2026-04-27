-- Function to handle new user creation with teacher auto-approval
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  allowed_role text;
  email_domain text;
  email_local_part text;
begin
  -- Check if the user's email is in the allowed_emails table
  select role into allowed_role
  from public.allowed_emails
  where email = new.email;

  -- If found in allowed_emails, use that role
  if allowed_role is not null then
    insert into public.profiles (id, full_name, role, email)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      allowed_role::public.user_role,
      new.email
    );
  else
    -- Parse email parts
    email_domain := split_part(new.email, '@', 2);
    email_local_part := split_part(new.email, '@', 1);

    -- Check for teacher pattern: 2-3 letters @ aotea.school.nz
    if email_domain = 'aotea.school.nz' and length(email_local_part) between 2 and 3 then
      insert into public.profiles (id, full_name, role, email)
      values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        'teacher',
        new.email
      );
    else
      -- Default to student
      insert into public.profiles (id, full_name, role, email)
      values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        'student',
        new.email
      );
    end if;
  end if;

  return new;
end;
$$;
