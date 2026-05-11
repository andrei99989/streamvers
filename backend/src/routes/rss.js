import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser();

const feeds = {
  movies: 'https://www.comingsoon.net/feed',
  tv: 'https://www.tvinsider.com/feed/',
  anime: 'https://www.animenewsnetwork.com/all/rss.xml',
  tech: 'https://www.theverge.com/rss/index.xml'
};

router.get('/feeds', (_req, res) => {
  res.json(feeds);
});

router.get('/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const feedUrl = feeds[type];

    if (!feedUrl) {
      return res.status(404).json({ error: 'Feed necunoscut', available: Object.keys(feeds) });
    }

    const feed = await parser.parseURL(feedUrl);

    res.json({
      title: feed.title,
      link: feed.link,
      items: (feed.items || []).slice(0, 30).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        creator: item.creator,
        contentSnippet: item.contentSnippet
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
