
CREATE TABLE public.embed_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Мой виджет',
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.embed_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widgets"
  ON public.embed_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widgets"
  ON public.embed_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets"
  ON public.embed_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets"
  ON public.embed_widgets FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_embed_widgets_updated_at
  BEFORE UPDATE ON public.embed_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
