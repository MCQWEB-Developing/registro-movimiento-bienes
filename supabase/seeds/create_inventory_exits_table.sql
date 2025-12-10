-- Create inventory_exits table
CREATE TABLE IF NOT EXISTS public.inventory_exits (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  exit_date date not null,
  document_type text not null,
  requesting_area text not null,
  description text not null,
  unit text not null,
  quantity integer not null,
  authorizer text not null,
  receiver text not null,
  reason text not null,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- Enable RLS
ALTER TABLE public.inventory_exits ENABLE ROW LEVEL SECURITY;

-- Create Policy
CREATE POLICY "Directors and Admins can manage inventory exits" ON public.inventory_exits
  FOR ALL
  USING (
    public.is_admin() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director'
  );
