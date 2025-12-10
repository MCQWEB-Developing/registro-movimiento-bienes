-- Add status columns to request items
ALTER TABLE public.product_request_items
ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid references auth.users(id);

-- Policy to allow Director to update these columns
CREATE POLICY "Directors can update request items" ON public.product_request_items
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'director'
  );
