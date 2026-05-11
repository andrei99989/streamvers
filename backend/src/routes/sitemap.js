import express from 'express';
import { XMLParser } from 'fast-xml-parser';

const router = express.Router();

const parser = new XMLParser({
  ignoreAttributes: false
});

router.get('/scan', async (req, res) => {
  try {
    const url = String(req.query.url || '');

    if (!url) {
      return res.status(400).json({ error: 'url lipsește' });
    }

    const response = await fetch(url);
    const xml = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Nu pot citi sitemap',
        details: xml.slice(0, 500)
      });
    }

    const parsed = parser.parse(xml);

    const urls =
      parsed?.urlset?.url
        ? Array.isArray(parsed.urlset.url)
          ? parsed.urlset.url
          : [parsed.urlset.url]
        : [];

    const sitemaps =
      parsed?.sitemapindex?.sitemap
        ? Array.isArray(parsed.sitemapindex.sitemap)
          ? parsed.sitemapindex.sitemap
          : [parsed.sitemapindex.sitemap]
        : [];

    res.json({
      source: url,
      type: urls.length ? 'urlset' : 'sitemapindex',
      count: urls.length || sitemaps.length,
      urls: urls.slice(0, 100).map((x) => ({
        loc: x.loc,
        lastmod: x.lastmod || null
      })),
      sitemaps: sitemaps.slice(0, 100).map((x) => ({
        loc: x.loc,
        lastmod: x.lastmod || null
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
