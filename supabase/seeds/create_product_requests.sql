-- Create Stock View
CREATE OR REPLACE VIEW public.view_inventory_stock AS
WITH entries_sum AS (
    SELECT code, MAX(description) as description, MAX(unit) as unit, SUM(quantity) as total_in
    FROM public.inventory_entries
    GROUP BY code
),
exits_sum AS (
    SELECT code, SUM(quantity) as total_out
    FROM public.inventory_exits
    GROUP BY code
)
SELECT
    e.code,
    e.description,
    e.unit,
    (e.total_in - COALESCE(x.total_out, 0)) as stock
FROM
    entries_sum e
LEFT JOIN
    exits_sum x ON e.code = x.code;

-- Create Requests Table
CREATE TABLE IF NOT EXISTS public.product_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  status text not null default 'PENDING', -- PENDING, APPROVED, REJECTED
  created_at timestamp with time zone default now()
);

-- Create Request Items Table
CREATE TABLE IF NOT EXISTS public.product_request_items (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.product_requests(id) on delete cascade not null,
  product_code text, -- Nullable if new product
  product_name text not null,
  quantity_requested integer not null,
  is_new_product boolean default false,
  description text -- For details on new products
);

-- Enable RLS
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_request_items ENABLE ROW LEVEL SECURITY;

-- Policies for Requests
CREATE POLICY "Users can create their own requests" ON public.product_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests" ON public.product_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Directors and Admins can view all requests" ON public.product_requests
  FOR SELECT USING (
    public.is_admin() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director'
  );

CREATE POLICY "Directors and Admins can update requests" ON public.product_requests
  FOR UPDATE USING (
    public.is_admin() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director'
  );

-- Policies for Items
CREATE POLICY "Users can insert items for their requests" ON public.product_request_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_requests 
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items of their requests" ON public.product_request_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_requests 
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Directors and Admins can view all request items" ON public.product_request_items
  FOR SELECT USING (
    public.is_admin() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director'
  );
