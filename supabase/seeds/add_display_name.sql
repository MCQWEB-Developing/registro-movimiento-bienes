-- Add display_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text;

-- Optional: Update existing admin with a default name
UPDATE public.profiles 
SET display_name = 'Super Admin' 
WHERE role = 'admin' AND display_name IS NULL;
