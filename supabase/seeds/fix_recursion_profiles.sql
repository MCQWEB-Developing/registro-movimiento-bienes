-- Function to safe-read my role avoiding RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  _role text;
BEGIN
  -- This function is SECURITY DEFINER, so it runs with the privileges of the creator (likely postgres/admin)
  -- Bypassing RLS on the table itself.
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the policy to use the function instead of direct select
DROP POLICY IF EXISTS "Directors and Admins can view all profiles" ON public.profiles;

CREATE POLICY "Directors and Admins can view all profiles" ON public.profiles
FOR SELECT
USING (
  public.is_admin() OR 
  public.get_my_role() = 'director' OR
  public.get_my_role() = 'admin' -- Redundant if is_admin() works, but safe.
);
