# API documentat

## Auth
`POST /auth/register`
```json
{"email":"user@example.com","password":"secret123","name":"Robert"}
```

`POST /auth/login`
```json
{"email":"user@example.com","password":"secret123"}
```

## Upload
`POST /upload/detect`
```json
{"url":"https://example.com/video.m3u8"}
```

`POST /upload`
```json
{"title":"Film demo","url":"https://example.com/video.mp4","isPrimary":true}
```

## Stream
`GET /stream/:id` returnează filmul și sursa principală.

## Search
`GET /search?q=matrix`

## AI
`GET /ai/recommendations/:profileId`
