import express from 'express';

const router = express.Router();

const OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';

function headers() {
  if (!process.env.OPENSUBTITLES_API_KEY) {
    throw new Error('OPENSUBTITLES_API_KEY lipsește din .env');
  }

  return {
    'Api-Key': process.env.OPENSUBTITLES_API_KEY,
    'Content-Type': 'application/json',
    'User-Agent': 'StreamVerse v1'
  };
}

router.get('/search', async (req, res) => {
  try {
    const query = String(req.query.q || '');
    const languages = String(req.query.languages || 'ro,en');

    if (!query) return res.json({ data: [] });

    const url = `${OPENSUBTITLES_API}/subtitles?query=${encodeURIComponent(query)}&languages=${encodeURIComponent(languages)}`;

    const response = await fetch(url, {
      headers: headers()
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'OpenSubtitles error',
        details: text
      });
    }

    res.type('json').send(text);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;
