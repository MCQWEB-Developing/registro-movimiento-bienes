-- ==========================================
-- 1. DATABASE SCHEMA SETUP
-- ==========================================

-- Create profiles table with all columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('admin', 'director', 'docente')) not null,
  display_name text,
  email text
);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. HELPER FUNCTIONS
-- ==========================================

-- Function to check if user is admin (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to backfill emails (can be run anytime to sync)
CREATE OR REPLACE FUNCTION public.sync_emails()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can manage ALL profiles (View, Insert, Update, Delete)
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL
    USING (public.is_admin());

-- ==========================================
-- 4. EXTENSIONS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 5. INITIAL SEEDING & SYNC
-- ==========================================

-- Run email sync immediately to fix any existing users
SELECT public.sync_emails();

-- Create Admin User (admin@sistema.com / admin123)
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
    
    -- Ensure existing admin has a profile with role, name, and email
    INSERT INTO public.profiles (id, role, display_name, email)
    VALUES (check_user_id, 'admin', 'Super Admin', user_email)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'admin',
        display_name = COALESCE(public.profiles.display_name, 'Super Admin'), -- Keep existing name if set
        email = user_email;
    
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
      '{"full_name": "Super Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, role, display_name, email)
    VALUES (new_user_id, 'admin', 'Super Admin', user_email);

    RAISE NOTICE 'Created admin user % with ID %', user_email, new_user_id;
  END IF;
END $$;
