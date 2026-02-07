<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$query = $_GET['query'] ?? '';
if (empty(trim($query))) {
    http_response_code(400);
    echo json_encode(['error' => 'Query is required']);
    exit();
}

$tmdbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=' . TMDB_API_KEY
    . '&query=' . urlencode($query)
    . '&language=fr-FR';

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
