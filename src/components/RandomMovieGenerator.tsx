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
      const { data, error } = await supabase.functions.invoke('random-movie');
      
      if (error) throw error;
      
      const movies = data?.results || [];
      if (movies.length > 0) {
        // Sélectionner un film au hasard dans les résultats
        const randomIndex = Math.floor(Math.random() * movies.length);
        const randomMovie = movies[randomIndex];
        
        setSelectedMovie(randomMovie);
        setDialogOpen(true);
      } else {
        toast({
          title: "Aucun film trouvé",
          description: "Impossible de générer un film aléatoire",
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
          Découvrez un film choisi aléatoirement pour vous !
        </p>
        <Button 
          onClick={generateRandomMovie} 
          disabled={loading}
          size="lg"
          className="w-full max-w-sm"
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
      />
    </div>
  );
}