-- Add new values to the existing credential_type enum
ALTER TYPE credential_type ADD VALUE IF NOT EXISTS 'openai_api';
ALTER TYPE credential_type ADD VALUE IF NOT EXISTS 'google_api';
ALTER TYPE credential_type ADD VALUE IF NOT EXISTS 'slack_api';
ALTER TYPE credential_type ADD VALUE IF NOT EXISTS 'github_api';
ALTER TYPE credential_type ADD VALUE IF NOT EXISTS 'stripe_api';
ALTER TYPE credential_type ADD VALUE IF NOT EXISTS 'custom';

-- Update existing records to use new enum values
UPDATE public.credentials 
SET type = CASE 
  WHEN type = 'openai' THEN 'openai_api'::credential_type
  WHEN type = 'api_key' THEN 'custom'::credential_type
  WHEN type = 'oauth' THEN 'custom'::credential_type
  WHEN type = 'database' THEN 'custom'::credential_type
  ELSE type
END;

-- Add unique constraint to prevent duplicate credentials per user
ALTER TABLE public.credentials 
ADD CONSTRAINT IF NOT EXISTS unique_user_credential 
UNIQUE (user_id, type, name);

-- Create a credentials helper function for secure access in edge functions
CREATE OR REPLACE FUNCTION public.get_credential_value(
  credential_type_param credential_type,
  credential_name_param text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  credential_value text;
BEGIN
  -- This function can only be called from edge functions with service role
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized access to credentials';
  END IF;

  SELECT encrypted_value INTO credential_value
  FROM public.credentials
  WHERE type = credential_type_param
    AND (credential_name_param IS NULL OR name = credential_name_param)
    AND user_id = auth.uid()
  LIMIT 1;

  RETURN credential_value;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_credential_value IS 'Securely retrieves encrypted credential values for use in edge functions';

-- Create an index for better performance on credential lookups
CREATE INDEX IF NOT EXISTS idx_credentials_user_type_name 
ON public.credentials(user_id, type, name);