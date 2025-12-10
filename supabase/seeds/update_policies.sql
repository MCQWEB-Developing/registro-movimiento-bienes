-- 1. Allow Admins to manage all profiles
-- We use a policy that checks if the current user has the 'admin' role.
-- To avoid infinite recursion, we assume the user can read their own profile via the existing policy.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can manage all profiles'
    ) THEN
        CREATE POLICY "Admins can manage all profiles" ON public.profiles
            FOR ALL
            USING (
                (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
            );
    END IF;
END
$$;

-- 2. Also ensure the 'Users can view their own profile' policy handles INSERT if needed? 
-- No, admins do the inserting for others. 
-- But wait, users might need to read their profile *after* creation. Existing SELECT policy covers this.

-- 3. Verify policies are active
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
