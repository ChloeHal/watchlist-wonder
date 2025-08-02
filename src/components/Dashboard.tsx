import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Play, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  toWatchCount: number;
  watchedCount: number;
  toWatchMovies: any[];
  onRefresh: () => void;
}

export default function Dashboard({ toWatchCount, watchedCount, toWatchMovies, onRefresh }: DashboardProps) {
  const { toast } = useToast();

  const getRandomMovie = () => {
    if (toWatchMovies.length === 0) {
      toast({
        title: "Aucun film à suggérer",
        description: "Ajoutez des films à votre liste pour utiliser cette fonction",
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * toWatchMovies.length);
    const randomMovie = toWatchMovies[randomIndex];
    
    toast({
      title: "Film suggéré",
      description: `${randomMovie.title} (${randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 'Date inconnue'})`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Films à Regarder</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toWatchCount}</div>
            <p className="text-xs text-muted-foreground">dans votre liste</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Films Vus</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchedCount}</div>
            <p className="text-xs text-muted-foreground">terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toWatchCount + watchedCount}</div>
            <p className="text-xs text-muted-foreground">films au total</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={getRandomMovie} variant="default" size="lg">
          <Shuffle className="mr-2 h-4 w-4" />
          Film au Hasard
        </Button>
        <Button onClick={onRefresh} variant="outline" size="lg">
          Actualiser
        </Button>
      </div>
    </div>
  );
}