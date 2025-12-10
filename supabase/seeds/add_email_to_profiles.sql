-- 1. Add email column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Create a function to backfill emails (Security Definer to read auth.users)
CREATE OR REPLACE FUNCTION public.sync_emails()
RETURNS void AS $$
BEGIN
  -- Update profiles with emails from auth.users matching by ID
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Run the backfill
SELECT public.sync_emails();

-- 4. Clean up function (optional, or keep it for manual syncs)
-- DROP FUNCTION public.sync_emails();
