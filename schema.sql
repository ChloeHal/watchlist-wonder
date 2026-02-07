-- Schéma MySQL pour Watchlist Wonder
-- À exécuter dans phpMyAdmin sur Hostinger

CREATE TABLE movies (
    id CHAR(36) NOT NULL,
    tmdb_id INT UNIQUE DEFAULT NULL,
    title VARCHAR(500) NOT NULL,
    overview TEXT DEFAULT NULL,
    poster_path VARCHAR(500) DEFAULT NULL,
    release_date DATE DEFAULT NULL,
    vote_average DECIMAL(3,1) DEFAULT NULL,
    runtime INT DEFAULT NULL,
    genres JSON DEFAULT NULL,
    status ENUM('to_watch', 'watched') NOT NULL DEFAULT 'to_watch',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tmdb_id (tmdb_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
