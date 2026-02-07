<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

function generateUUID(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['tmdb_id'])) {
                $stmt = $db->prepare('SELECT id FROM movies WHERE tmdb_id = ?');
                $stmt->execute([(int)$_GET['tmdb_id']]);
                $movie = $stmt->fetch();
                echo json_encode(['data' => $movie ?: null]);
            } elseif (isset($_GET['status'])) {
                $stmt = $db->prepare('SELECT * FROM movies WHERE status = ? ORDER BY created_at DESC');
                $stmt->execute([$_GET['status']]);
                echo json_encode(['data' => $stmt->fetchAll()]);
            } else {
                $stmt = $db->query('SELECT * FROM movies ORDER BY created_at DESC');
                echo json_encode(['data' => $stmt->fetchAll()]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = generateUUID();
            $stmt = $db->prepare(
                'INSERT INTO movies (id, tmdb_id, title, overview, poster_path, release_date, vote_average, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $id,
                $input['tmdb_id'] ?? null,
                $input['title'],
                $input['overview'] ?? null,
                $input['poster_path'] ?? null,
                $input['release_date'] ?? null,
                $input['vote_average'] ?? null,
                $input['status'] ?? 'to_watch',
            ]);
            echo json_encode(['data' => ['id' => $id], 'success' => true]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['id'])) {
                $stmt = $db->prepare('UPDATE movies SET status = ? WHERE id = ?');
                $stmt->execute([$input['status'], $input['id']]);
            } elseif (isset($input['tmdb_id'])) {
                $stmt = $db->prepare('UPDATE movies SET status = ? WHERE tmdb_id = ?');
                $stmt->execute([$input['status'], (int)$input['tmdb_id']]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare('DELETE FROM movies WHERE id = ?');
            $stmt->execute([$input['id']]);
            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
