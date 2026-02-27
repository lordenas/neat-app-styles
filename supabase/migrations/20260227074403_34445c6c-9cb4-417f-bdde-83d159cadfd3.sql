ALTER TABLE public.embed_widgets
  ADD COLUMN IF NOT EXISTS monthly_views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_reset_at timestamptz NOT NULL DEFAULT date_trunc('month', now());
