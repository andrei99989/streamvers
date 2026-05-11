import { Router } from 'express';
import Movie from '../models/Movie.js';
const router = Router();
router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Movie.find({ $or: [{ title: rx }, { description: rx }, { genres: rx }, { cast: rx }, { director: rx }] }).limit(40));
});
export default router;
