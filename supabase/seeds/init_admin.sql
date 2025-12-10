-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('admin', 'director', 'docente')) not null
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy (if not exists - simple check to avoid errors if repeated)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
END
$$;


-- 4. Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 5. Create Admin User
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  check_user_id uuid;
  user_email text := 'admin@sistema.com';
  user_password text := 'admin123';
BEGIN
  -- Check if user already exists
  SELECT id INTO check_user_id FROM auth.users WHERE email = user_email;

  IF check_user_id IS NOT NULL THEN
    RAISE NOTICE 'User % already exists with ID %', user_email, check_user_id;
    -- Optional: Update role if user exists but has no profile
    INSERT INTO public.profiles (id, role)
    VALUES (check_user_id, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    -- Insert into auth.users
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
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, role)
    VALUES (new_user_id, 'admin');

    RAISE NOTICE 'Created admin user % with ID %', user_email, new_user_id;
  END IF;
END $$;
