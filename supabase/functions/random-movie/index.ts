import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY');
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Générer une page aléatoire entre 1 et 500
    const randomPage = Math.floor(Math.random() * 500) + 1;
    
    const tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=fr-FR&page=${randomPage}`;
    
    console.log('Fetching random movies from page:', randomPage);
    
    const response = await fetch(tmdbUrl);
    
    if (!response.ok) {
      console.error('TMDB API error:', response.status, response.statusText);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('TMDB response received, results count:', data.results?.length || 0);
    
    return new Response(
      JSON.stringify({ results: data.results || [] }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in random-movie function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get random movies',
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});