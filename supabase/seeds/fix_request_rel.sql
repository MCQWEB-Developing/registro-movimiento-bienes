-- Drop the existing constraint if it references auth.users (optional, but cleaner)
-- It's often safer to keep the constraint to auth.users for strict integrity, 
-- but PostgREST needs a FK to the PUBLIC table "profiles" to allow embedding.
-- We can add a second constraint or replace it. Let's add a new one explicitly for the relation.

ALTER TABLE public.product_requests
ADD CONSTRAINT product_requests_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id);

-- Check: This assumes profiles.id is the same as users.id (which it is)
