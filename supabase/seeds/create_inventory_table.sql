-- Create inventory_entries table
CREATE TABLE IF NOT EXISTS public.inventory_entries (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  entry_date date not null,
  document_type text not null,
  provider text,
  description text not null,
  unit text not null,
  quantity integer not null,
  deliverer text not null,
  receiver text not null,
  entry_type text not null,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- Enable RLS
ALTER TABLE public.inventory_entries ENABLE ROW LEVEL SECURITY;

-- Create helper function for director check if needed, or just use inline
-- Re-using is_admin() for admin access.

CREATE POLICY "Directors and Admins can manage inventory" ON public.inventory_entries
  FOR ALL
  USING (
    public.is_admin() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director'
  );
