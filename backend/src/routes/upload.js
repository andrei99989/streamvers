import { Router } from 'express';
import Movie from '../models/Movie.js';
import { detectSource } from '../services/sourceDetector.js';
const router = Router();

router.post('/', async (req, res) => {
  try {
    const { url, title = 'Untitled stream', isPrimary = true, movieId } = req.body;
    const detected = detectSource(url);
    const source = { url, ...detected, isPrimary };
    if (movieId) {
      const movie = await Movie.findByIdAndUpdate(movieId, { $push: { sources: source } }, { new: true });
      return res.status(201).json({ detected, movie });
    }
    const movie = await Movie.create({ title, sources: [source], genres: ['Uploaded'], description: 'Sursă adăugată prin URL.' });
    res.status(201).json({ detected, movie });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.post('/detect', (req, res) => {
  try { res.json(detectSource(req.body.url)); } catch (e) { res.status(400).json({ message: e.message }); }
});
export default router;
