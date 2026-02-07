import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { updateMovieStatus, deleteMovieById } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  status: 'to_watch' | 'watched';
  created_at: string;
}

interface WatchlistSectionProps {
  movies: Movie[];
  title: string;
  status: 'to_watch' | 'watched';
  onMovieUpdated: () => void;
}

export default function WatchlistSection({ movies, title, status, onMovieUpdated }: WatchlistSectionProps) {
  const { toast } = useToast();

  const toggleWatchStatus = async (movie: Movie) => {
    try {
      const newStatus = movie.status === 'to_watch' ? 'watched' : 'to_watch';
      
      await updateMovieStatus(movie.id, newStatus);

      toast({
        title: newStatus === 'watched' ? "Film marqué comme vu" : "Film remis à regarder",
        description: movie.title,
      });

      onMovieUpdated();
    } catch (error) {
      console.error("Toggle status error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du film",
        variant: "destructive",
      });
    }
  };

  const deleteMovie = async (movie: Movie) => {
    try {
      await deleteMovieById(movie.id);

      toast({
        title: "Film supprimé",
        description: movie.title,
      });

      onMovieUpdated();
    } catch (error) {
      console.error("Delete movie error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le film",
        variant: "destructive",
      });
    }
  };

  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-muted-foreground">
          {status === 'to_watch' 
            ? "Aucun film dans votre liste à regarder" 
            : "Aucun film vu pour le moment"
          }
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold main-title" style={{ color: '#04151f' }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <Card key={movie.id} className="h-full bg-[#c44900]/15 border-[#c44900]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
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
                   <Badge variant="secondary" className="bg-[#245652] text-white hover:bg-[#245652]/80">
                     ⭐ {Number(movie.vote_average).toFixed(1)}
                   </Badge>
                 )}
              </div>
              {movie.overview && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {movie.overview}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleWatchStatus(movie)}
                  className="flex-1"
                >
                  {status === 'to_watch' ? (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Marquer vu
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      À revoir
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMovie(movie)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}