-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view their own calculations" ON public.saved_calculations;
DROP POLICY IF EXISTS "Users can insert their own calculations" ON public.saved_calculations;
DROP POLICY IF EXISTS "Users can update their own calculations" ON public.saved_calculations;
DROP POLICY IF EXISTS "Users can delete their own calculations" ON public.saved_calculations;

CREATE POLICY "Users can view their own calculations" ON public.saved_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calculations" ON public.saved_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calculations" ON public.saved_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calculations" ON public.saved_calculations FOR DELETE USING (auth.uid() = user_id);

-- Fix profiles too
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);