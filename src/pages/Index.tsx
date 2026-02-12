import { useState, useEffect } from "react";
import { fetchAllMovies } from "@/lib/api";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/Dashboard";
import MovieSearch from "@/components/MovieSearch";
import RandomMovieGenerator from "@/components/RandomMovieGenerator";
import WatchlistSection from "@/components/WatchlistSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMovies = async () => {
    try {
      const data = await fetchAllMovies();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos films",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const toWatchMovies = movies.filter((movie) => movie.status === "to_watch");
  const watchedMovies = movies.filter((movie) => movie.status === "watched");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <img src={`elocrick.webp`} className="rounded mx-auto d-block w-40" />
      <h1 className="text-4xl font-bold text-center mb-8 main-title">
        Elo & Crick's movies
      </h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="inline-flex flex-wrap items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full mb-5 h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="search">Rechercher</TabsTrigger>
          <TabsTrigger value="random">Film au hasard</TabsTrigger>
          <TabsTrigger value="to-watch">
            À Regarder ({toWatchMovies.length})
          </TabsTrigger>
          <TabsTrigger value="watched">
            Vus ({watchedMovies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard
            toWatchCount={toWatchMovies.length}
            watchedCount={watchedMovies.length}
            toWatchMovies={toWatchMovies}
            onRefresh={fetchMovies}
          />
        </TabsContent>

        <TabsContent value="search">
          <MovieSearch onMovieAdded={fetchMovies} existingTmdbIds={movies.map((m: any) => m.tmdb_id).filter(Boolean)} />
        </TabsContent>

        <TabsContent value="random">
          <RandomMovieGenerator onMovieAdded={fetchMovies} />
        </TabsContent>

        <TabsContent value="to-watch">
          <WatchlistSection
            movies={toWatchMovies}
            title="Films à Regarder"
            status="to_watch"
            onMovieUpdated={fetchMovies}
          />
        </TabsContent>

        <TabsContent value="watched">
          <WatchlistSection
            movies={watchedMovies}
            title="Films Vus"
            status="watched"
            onMovieUpdated={fetchMovies}
          />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
