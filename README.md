# Watchlist Wonder

Application web de gestion de watchlist de films pour Elo & Crick. Recherchez des films via l'API TMDB, ajoutez-les à votre liste et suivez ceux que vous avez vus.

## Technologies

**Frontend :** React, TypeScript, Vite, Tailwind CSS, shadcn-ui

**Backend :** PHP, MySQL

**API externe :** TMDB (The Movie Database)

## Installation locale

```sh
git clone https://github.com/chlohal/watchlist-wonder.git
cd watchlist-wonder
npm install
```

### Configuration du backend PHP

1. Copier le fichier de config exemple et le remplir avec vos identifiants :

```sh
cp api/config.example.php api/config.php
```

2. Modifier `api/config.php` avec vos identifiants MySQL et votre clé API TMDB.

3. Créer la base de données MySQL en exécutant le contenu de `schema.sql`.

4. Lancer le serveur PHP local :

```sh
php -S localhost:8000 -t api/
```

### Lancer le frontend

```sh
npm run dev
```

L'application sera accessible sur `http://localhost:8080`.

## Deploiement sur Hostinger

1. Creer une base de donnees MySQL dans hPanel
2. Executer `schema.sql` dans phpMyAdmin
3. Uploader le dossier `api/` dans `public_html/api/`
4. Modifier `api/config.php` sur le serveur avec les vrais identifiants
5. Executer `npm run build` localement
6. Uploader le contenu de `dist/` dans `public_html/`

## Structure du projet

```
src/                  # Code source React
  components/         # Composants (MovieSearch, WatchlistSection, etc.)
  lib/api.ts          # Client API (fetch vers le backend PHP)
  pages/              # Pages de l'application
api/                  # Backend PHP
  movies.php          # API REST CRUD pour les films
  search-tmdb.php     # Proxy vers l'API TMDB
  config.php          # Configuration DB + cle TMDB (non versionne)
schema.sql            # Schema MySQL
```
