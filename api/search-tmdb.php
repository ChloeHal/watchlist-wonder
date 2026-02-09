<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$query = $_GET['query'] ?? '';
$genre = $_GET['genre'] ?? '';
$sort = $_GET['sort'] ?? '';

if (!empty(trim($query))) {
    // Mode recherche par nom
    $tmdbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=' . TMDB_API_KEY
        . '&query=' . urlencode($query)
        . '&language=fr-FR';
} elseif (!empty($genre)) {
    // Mode discover par genre
    $tmdbUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=' . TMDB_API_KEY
        . '&with_genres=' . urlencode($genre)
        . '&language=fr-FR';

    if ($sort === 'rating') {
        $tmdbUrl .= '&sort_by=vote_average.desc&vote_count.gte=200';
    } else {
        $tmdbUrl .= '&sort_by=release_date.desc&vote_average.gte=1';
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Query or genre is required']);
    exit();
}

$ch = curl_init($tmdbUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to reach TMDB API']);
    exit();
}

$data = json_decode($response, true);
echo json_encode(['results' => $data['results'] ?? []]);
