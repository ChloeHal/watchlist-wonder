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
    const { query } = await req.json();
    
    if (!query || !query.trim()) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=fr-FR`;
    
    console.log('Searching TMDB for:', query);
    
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
    console.error('Error in search-movies function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to search movies',
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});