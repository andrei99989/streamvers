import { Router } from 'express';
import Movie from '../models/Movie.js';
const router = Router();
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ message: 'Not found' });
  const primary = movie.sources.find(s => s.isPrimary) || movie.sources[0];
  res.json({ movie, primary });
});
export default router;
