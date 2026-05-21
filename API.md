# API documentat

## Auth
`POST /auth/register`
```json
{"email":"user@domain.com","password":"secret123","name":"Robert"}
```

`POST /auth/login`
```json
{"email":"user@domain.com","password":"secret123"}
```

## Upload
`POST /upload/detect`
```json
{"url":"https://your-source-domain.com/video.m3u8"}
```

`POST /upload`
```json
{"title":"Film real","url":"https://your-source-domain.com/video.mp4","isPrimary":true}
```

## Stream
`GET /stream/:id` returnează filmul și sursa principală.

## Search
`GET /search?q=matrix`

## AI
`GET /ai/recommendations/:profileId`
