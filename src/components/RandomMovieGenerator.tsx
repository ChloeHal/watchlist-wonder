import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MovieDetailDialog from "./MovieDetailDialog";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface RandomMovieGeneratorProps {
  onMovieAdded: () => void;
}

export default function RandomMovieGenerator({ onMovieAdded }: RandomMovieGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const generateRandomMovie = async () => {
    setLoading(true);
    try {
      // Récupérer tous les films à regarder depuis votre liste
      const { data: movies, error } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'to_watch');
      
      if (error) throw error;
      
      if (movies && movies.length > 0) {
        // Sélectionner un film au hasard dans votre liste
        const randomIndex = Math.floor(Math.random() * movies.length);
        const randomMovie = movies[randomIndex];
        
        // Adapter le format pour le popup
        const formattedMovie = {
          id: randomMovie.tmdb_id,
          title: randomMovie.title,
          overview: randomMovie.overview,
          poster_path: randomMovie.poster_path,
          release_date: randomMovie.release_date,
          vote_average: randomMovie.vote_average,
          genre_ids: []
        };
        
        setSelectedMovie(formattedMovie);
        setDialogOpen(true);
      } else {
        toast({
          title: "Aucun film dans votre liste",
          description: "Ajoutez des films à votre liste pour utiliser cette fonctionnalité",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Random movie error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer un film aléatoire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Film au hasard</h2>
        <p className="text-muted-foreground mb-6">
          Découvrez un film choisi aléatoirement dans votre liste à regarder !
        </p>
        <Button 
          onClick={generateRandomMovie} 
          disabled={loading}
          size="lg"
          className="w-full max-w-sm bg-primary text-primary-foreground hover:bg-background hover:text-foreground border-2 border-primary hover:border-primary transition-colors"
        >
          <Shuffle className="h-5 w-5 mr-2" />
          {loading ? "Génération..." : "Générer un film au hasard"}
        </Button>
      </div>

      <MovieDetailDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onMovieAdded={onMovieAdded}
        isFromPersonalList={true}
      />
    </div>
  );
}