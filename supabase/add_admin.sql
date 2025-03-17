-- First, create the admin user in auth.users
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@gmail.com',
  crypt('admin', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User","phone_number":"1234567890","department":"Management","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Then, create the admin profile
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
  now(),
  now()
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO NOTHING;
