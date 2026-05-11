# StreamVerse Premium

Platformă unificată de streaming premium cu player universal pentru surse autorizate: MP4, WebM, HLS `.m3u8` și embed iframe pentru platforme externe.

> Folosește numai conținut pentru care ai drepturi, licență sau permisiune de redare. Proiectul nu ocolește DRM, paywall-uri sau restricții ale platformelor.

## Stack
- Frontend: Next.js, React, TailwindCSS, Framer Motion, Zustand
- Backend: Node.js, Express, MongoDB/Mongoose, JWT
- Player: video.js, hls.js, iframe responsive
- AI: recomandări locale mock, extensibil către API-uri AI

## Instalare PC / server
```bash
cd streamverse-premium
cp backend/.env.example backend/.env
npm install
npm run dev
```
Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

## Instalare Termux
```bash
pkg update && pkg upgrade
pkg install nodejs git
cd streamverse-premium
cp backend/.env.example backend/.env
npm install
npm run dev
```
Pentru MongoDB pe Android folosește MongoDB Atlas și setează `MONGO_URI` în `backend/.env`.

## Rute API
- `POST /auth/register`
- `POST /auth/login`
- `GET /profiles`
- `POST /profiles`
- `GET /movies`
- `POST /movies`
- `GET /search?q=`
- `POST /upload`
- `GET /stream/:id`
- `GET /ai/recommendations/:profileId`

## Detectare surse
1. youtube.com / youtu.be / vimeo.com / dailymotion.com / tiktok.com / terabox.com / rumble.com → iframe
2. `.mp4` / `.webm` → video direct
3. `.m3u8` → HLS
4. fallback → iframe

## Producție
- Configurează `JWT_SECRET`, `MONGO_URI`, CORS și HTTPS.
- Rulează backend-ul în PM2/Docker.
- Rulează frontend-ul cu `npm run build --workspace frontend` și `npm run start --workspace frontend`.
