const API_BASE = '/api';

export interface Movie {
  id: string;
  tmdb_id: number | null;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  runtime: number | null;
  genres: string[] | null;
  status: 'to_watch' | 'watched';
  created_at: string;
  updated_at: string;
}

export async function fetchAllMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/movies.php`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  const json = await res.json();
  return json.data || [];
}

export async function fetchMoviesByStatus(status: string): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/movies.php?status=${encodeURIComponent(status)}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  const json = await res.json();
  return json.data || [];
}

export async function checkMovieExists(tmdbId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/movies.php?tmdb_id=${tmdbId}`);
  if (!res.ok) throw new Error('Failed to check movie');
  const json = await res.json();
  return json.data !== null;
}

export async function insertMovie(movie: {
  tmdb_id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string | null;
  vote_average?: number;
  status?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/movies.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });
  if (!res.ok) throw new Error('Failed to insert movie');
}

export async function updateMovieStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/movies.php`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error('Failed to update movie');
}

export async function updateMovieStatusByTmdbId(tmdbId: number, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/movies.php`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tmdb_id: tmdbId, status }),
  });
  if (!res.ok) throw new Error('Failed to update movie');
}

export async function deleteMovieById(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/movies.php`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete movie');
}

export async function searchTMDB(query: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/search-tmdb.php?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search movies');
  const json = await res.json();
  return json.results || [];
}
