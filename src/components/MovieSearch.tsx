import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { searchTMDB, discoverByGenre, checkMovieExists, insertMovie } from "@/lib/api";
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
  existingTmdbIds: number[];
}

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 99, name: 'Documentaire' },
  { id: 18, name: 'Drame' },
  { id: 10751, name: 'Famille' },
  { id: 14, name: 'Fantastique' },
  { id: 27, name: 'Horreur' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science-Fiction' },
  { id: 53, name: 'Thriller' },
];

export default function MovieSearch({ onMovieAdded, existingTmdbIds }: MovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<{ id: number; name: string } | null>(null);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [mode, setMode] = useState<'genres' | 'search' | 'genre-results'>('genres');
  const { toast } = useToast();

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMode('search');
    try {
      const results = await searchTMDB(searchQuery);
      setSearchResults(results);
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

  const selectGenre = async (genre: { id: number; name: string }) => {
    setSelectedGenre(genre);
    setLoading(true);
    setMode('genre-results');
    try {
      const [releases, rated] = await Promise.all([
        discoverByGenre(genre.id, 'date'),
        discoverByGenre(genre.id, 'rating'),
      ]);
      const idsSet = new Set(existingTmdbIds);
      setNewReleases(releases.filter((m: Movie) => !idsSet.has(m.id)).slice(0, 10));
      setTopRated(rated.filter((m: Movie) => !idsSet.has(m.id)).slice(0, 10));
    } catch (error) {
      console.error("Genre discover error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les films",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const backToGenres = () => {
    setMode('genres');
    setSearchQuery("");
    setSearchResults([]);
    setSelectedGenre(null);
    setNewReleases([]);
    setTopRated([]);
  };

  const addToWatchlist = async (movie: Movie) => {
    try {
      const exists = await checkMovieExists(movie.id);

      if (exists) {
        toast({
          title: "Film déjà ajouté",
          description: "Ce film est déjà dans votre liste",
          variant: "destructive",
        });
        return;
      }

      await insertMovie({
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date || null,
        vote_average: movie.vote_average,
        status: 'to_watch'
      });

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

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <Card className="h-full">
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
              ⭐ {Number(movie.vote_average).toFixed(1)}
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
  );

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        {mode !== 'genres' && (
          <Button variant="outline" onClick={backToGenres}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
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
          <div className="text-lg">Chargement...</div>
        </div>
      )}

      {/* Grille de genres */}
      {mode === 'genres' && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-4 main-title" style={{ color: '#04151f' }}>Explorer par genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GENRES.map((genre) => (
              <Button
                key={genre.id}
                variant="outline"
                className="h-16 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => selectGenre(genre)}
              >
                {genre.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Résultats par genre */}
      {mode === 'genre-results' && !loading && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold main-title" style={{ color: '#04151f' }}>
            {selectedGenre?.name}
          </h2>

          {newReleases.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Nouvelles sorties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newReleases.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}

          {topRated.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Les mieux notés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topRated.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Résultats de recherche par nom */}
      {mode === 'search' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {mode === 'search' && searchResults.length === 0 && searchQuery && !loading && (
        <div className="text-center py-8">
          <div className="text-lg text-muted-foreground">Aucun résultat trouvé</div>
        </div>
      )}
    </div>
  );
}
