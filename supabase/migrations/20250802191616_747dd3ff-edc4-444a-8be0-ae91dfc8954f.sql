-- Create movies table for personal watchlist
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  release_date DATE,
  vote_average DECIMAL(3,1),
  runtime INTEGER,
  genres TEXT[],
  status TEXT NOT NULL DEFAULT 'to_watch' CHECK (status IN ('to_watch', 'watched')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_movies_status ON public.movies(status);
CREATE INDEX idx_movies_tmdb_id ON public.movies(tmdb_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Since this is a personal app without authentication, disable RLS
ALTER TABLE public.movies DISABLE ROW LEVEL SECURITY;