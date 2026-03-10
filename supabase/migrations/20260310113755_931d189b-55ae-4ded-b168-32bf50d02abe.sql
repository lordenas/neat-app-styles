
-- Create calc_leads table for lead capture from custom calculators
CREATE TABLE public.calc_leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_id   text NOT NULL,
  calculator_title text,
  owner_user_id   uuid NOT NULL,
  email           text NOT NULL,
  name            text,
  phone           text,
  form_values     jsonb DEFAULT '{}',
  result_values   jsonb DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calc_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their calc leads"
  ON public.calc_leads FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Anyone can insert leads"
  ON public.calc_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can delete their calc leads"
  ON public.calc_leads FOR DELETE
  USING (auth.uid() = owner_user_id);

CREATE INDEX idx_calc_leads_owner ON public.calc_leads (owner_user_id);
CREATE INDEX idx_calc_leads_calculator ON public.calc_leads (calculator_id);
CREATE INDEX idx_calc_leads_email ON public.calc_leads (email);
