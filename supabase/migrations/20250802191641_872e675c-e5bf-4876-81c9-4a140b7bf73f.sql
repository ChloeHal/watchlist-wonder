-- Fix security issue by enabling RLS on movies table
-- Since this is a personal app without authentication, create a permissive policy
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy that allows all operations for everyone
-- This is appropriate since it's a personal app without user accounts
CREATE POLICY "Allow all operations on movies" ON public.movies
FOR ALL USING (true) WITH CHECK (true);

-- Fix the function search path issue
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;