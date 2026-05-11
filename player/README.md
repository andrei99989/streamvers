# Player Universal

Implementarea principală este în `frontend/components/UniversalPlayer.tsx`.

Suport:
- iframe responsive pentru YouTube, Vimeo, Dailymotion, TikTok, Terabox, Rumble și fallback
- `<video>` pentru MP4/WebM
- `hls.js` pentru `.m3u8`
- controale: playback speed, cinema mode, skip intro, next episode placeholder
- subtitrări VTT/SRT: schema există în backend; conversia SRT→VTT se poate adăuga ca serviciu separat
