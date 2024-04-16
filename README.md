
# EveDB Project API
This repository was created for my hobby project as sort of poc. 

**Live Demo:**  [evedb-demo](https://evedb-demo.herokuapp.com/) 

(Demo is not working right now since Heroku disabled free tier: [Heroku Pricing](https://www.heroku.com/pricing))

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
