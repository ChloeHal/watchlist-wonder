import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieSearchProps {
  onMovieAdded: () => void;
}


export default function MovieSearch({ onMovieAdded }: MovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-movies', {
        body: { query: searchQuery }
      });
      
      if (error) throw error;
      
      setSearchResults(data?.results || []);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher des films",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (movie: Movie) => {
    try {
      // Vérifier si le film existe déjà
      const { data: existing } = await supabase
        .from('movies')
        .select('id')
        .eq('tmdb_id', movie.id)
        .single();

      if (existing) {
        toast({
          title: "Film déjà ajouté",
          description: "Ce film est déjà dans votre liste",
          variant: "destructive",
        });
        return;
      }

      // Ajouter le film
      const { error } = await supabase
        .from('movies')
        .insert({
          tmdb_id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date || null,
          vote_average: movie.vote_average,
          status: 'to_watch'
        });

      if (error) throw error;

      toast({
        title: "Film ajouté",
        description: `${movie.title} a été ajouté à votre liste`,
      });

      onMovieAdded();
    } catch (error) {
      console.error("Add movie error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le film",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Rechercher un film..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
          className="flex-1"
        />
        <Button onClick={searchMovies} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Recherche en cours...</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((movie) => (
          <Card key={movie.id} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
                <Button
                  size="sm"
                  onClick={() => addToWatchlist(movie)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                {movie.vote_average > 0 && (
                  <Badge variant="secondary">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </Badge>
                )}
              </div>
              {movie.overview && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {movie.overview}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {searchResults.length === 0 && searchQuery && !loading && (
        <div className="text-center py-8">
          <div className="text-lg text-muted-foreground">Aucun résultat trouvé</div>
        </div>
      )}
    </div>
  );
}