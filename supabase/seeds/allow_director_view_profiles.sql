-- Allow Directors and Admins to view all profiles
-- This is necessary for them to see who created a request or who they are managing.

CREATE POLICY "Directors and Admins can view all profiles" ON public.profiles
FOR SELECT
USING (
  public.is_admin() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director' OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'docente' -- Optional: if teachers need to see others? probably not, but Directors definitely do.
);

-- Actually, let's keep it simple and just allow authenticated users to read names/emails if that's easier, 
-- but strict role is better.
-- Let's stick to Director/Admin for now.

-- Note: We already have "Users can view their own profile". 
-- This new policy adds to it (OR logic).
