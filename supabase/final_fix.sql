-- First, disable RLS temporarily
alter table profiles disable row level security;

-- Drop all existing policies
drop policy if exists "Anyone can create their own profile" on profiles;
drop policy if exists "Authenticated users can read profiles" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Profiles are viewable by authenticated users" on profiles;
drop policy if exists "Users can create their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Create simplified policies
create policy "Enable insert access" on profiles
  for insert with check (true);

create policy "Enable read access" on profiles
  for select using (true);

create policy "Enable update for users based on id" on profiles
  for update using (auth.uid() = id);

-- Create admin user if not exists
DO $$
BEGIN
  -- Insert admin user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'admin@gmail.com',
      crypt('admin', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User","phone_number":"1234567890","department":"Management","role":"admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Insert admin profile if not exists
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    INNER JOIN auth.users u ON u.id = p.id 
    WHERE u.email = 'admin@gmail.com'
  ) THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      phone_number,
      department,
      role,
      created_at,
      updated_at
    )
    SELECT 
      id,
      email,
      'Admin User',
      '1234567890',
      'Management',
      'admin',
      NOW(),
      NOW()
    FROM auth.users
    WHERE email = 'admin@gmail.com';
  END IF;
END $$;

-- Re-enable RLS
alter table profiles enable row level security;
