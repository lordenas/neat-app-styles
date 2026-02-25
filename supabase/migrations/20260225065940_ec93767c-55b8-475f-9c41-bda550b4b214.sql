
ALTER TABLE public.saved_calculations ADD COLUMN share_token text UNIQUE;

CREATE POLICY "Public shared calculations"
  ON public.saved_calculations FOR SELECT
  USING (share_token IS NOT NULL);
