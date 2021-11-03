
# EveDB Project API
This project was created for my hobby project called EveDB. The purpose is making an application like MyAnimeList but for almost everything like: movies, tv-series, books, games, anime, manga, comics etc.

To achive this I'm gonna need to web scrap data from other web sites like MyAnimeList, IMDB etc.

**Live Demo:**  [evedb-demo](https://evedb-demo.herokuapp.com/) 
(hosted on free Heroku app, so it may take a while to see the app)

## Features
- MyAnimeList Search
- MyAnimeList Detail
 - IMDB Search
 - IMDB Detail


## API

**MyAnimeList Search**

    GET /api/myanimelist/search

**Parameters:**
Search: `?s=search+text`
**Example:** `/api/myanimelist/search?s=Hunter x Hunter`

---

**MyAnimeList Detail**

    GET /api/myanimelist/detail/:type/:id

**Types:** `anime`, `manga`
**Example:** `/api/myanimelist/detail/anime/136`

---

**IMDB Search**

    GET /api/imdb/search

**Parameters:**
Search: `?s=search+text`
**Example:** `/api/imdb/search?s=Godfather`

---

**IMDB Detail**

    GET /api/imdb/detail/:type/:id

**Types:** `title`
**Example:** `/api/imdb/detail/title/tt0068646`
