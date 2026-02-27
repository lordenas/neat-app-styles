
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Мой ключ',
  key text NOT NULL UNIQUE DEFAULT 'chk_' || replace(gen_random_uuid()::text, '-', ''),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  requests_count integer NOT NULL DEFAULT 0,
  requests_limit integer NOT NULL DEFAULT 1000,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own api_keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own api_keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own api_keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own api_keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
