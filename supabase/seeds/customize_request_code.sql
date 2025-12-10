CREATE OR REPLACE FUNCTION public.generate_request_code()
RETURNS TRIGGER AS $$
DECLARE
  user_identifier text;
BEGIN
  -- Get display name, default to 'DOC' if null or empty
  -- We take the first 3 characters uppercased
  SELECT COALESCE(NULLIF(UPPER(SUBSTRING(display_name FROM 1 FOR 3)), ''), 'DOC')
  INTO user_identifier
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Fallback if select returns nothing (shouldn't happen with FK)
  IF user_identifier IS NULL THEN
    user_identifier := 'DOC';
  END IF;

  -- Generate code: MEL-SOL-0001
  NEW.request_code := user_identifier || '-SOL-' || lpad(nextval('public.request_code_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
