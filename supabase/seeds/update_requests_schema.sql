-- Add request_code column
ALTER TABLE public.product_requests 
ADD COLUMN IF NOT EXISTS request_code text UNIQUE;

-- Create Sequence
CREATE SEQUENCE IF NOT EXISTS public.request_code_seq;

-- Create Function to Generate Code
CREATE OR REPLACE FUNCTION public.generate_request_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_code := 'SOL-' || lpad(nextval('public.request_code_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS set_request_code ON public.product_requests;

CREATE TRIGGER set_request_code
BEFORE INSERT ON public.product_requests
FOR EACH ROW
EXECUTE FUNCTION public.generate_request_code();
