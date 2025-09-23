import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Plus, Clock } from "lucide-react";
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

interface MovieDetailDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMovieAdded: () => void;
  isFromPersonalList?: boolean;
}

export default function MovieDetailDialog({ 
  movie, 
  open, 
  onOpenChange, 
  onMovieAdded,
  isFromPersonalList = false
}: MovieDetailDialogProps) {
  const { toast } = useToast();

  if (!movie) return null;

  const handleAction = async () => {
    try {
      if (isFromPersonalList) {
        // Marquer comme vu
        const { error } = await supabase
          .from('movies')
          .update({ status: 'watched' })
          .eq('tmdb_id', movie.id);

        if (error) throw error;

        toast({
          title: "Film marqué comme vu",
          description: `${movie.title} a été déplacé vers vos films vus`,
        });

        onMovieAdded();
        onOpenChange(false);
      } else {
        // Ajouter à la liste
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
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Action error:", error);
      toast({
        title: "Erreur",
        description: isFromPersonalList ? "Impossible de marquer le film comme vu" : "Impossible d'ajouter le film",
        variant: "destructive",
      });
    }
  };

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-6">{movie.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Poster */}
          <div className="md:col-span-1">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Pas d'affiche</span>
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="md:col-span-2 space-y-4">
            {/* Métadonnées */}
            <div className="flex flex-wrap gap-4 text-sm">
              {releaseYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{releaseYear}</span>
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}/10</span>
                </div>
              )}
            </div>

            {/* Note */}
            {movie.vote_average > 0 && (
              <div>
                <Badge variant="secondary" className="text-sm">
                  ⭐ {movie.vote_average.toFixed(1)}
                </Badge>
              </div>
            )}

            {/* Synopsis */}
            {movie.overview && (
              <div>
                <h3 className="font-semibold mb-2">Synopsis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Bouton d'action */}
            <div className="pt-4">
              <Button onClick={handleAction} className="w-full bg-primary text-primary-foreground hover:bg-background hover:text-foreground border-2 border-primary hover:border-primary transition-colors" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                {isFromPersonalList ? "Marquer comme vu" : "Ajouter à ma liste"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}