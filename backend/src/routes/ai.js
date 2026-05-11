import { Router } from 'express';
import Movie from '../models/Movie.js';
const router = Router();
router.get('/recommendations/:profileId', async (_req, res) => {
  const items = await Movie.aggregate([{ $sample: { size: 12 } }]);
  res.json({ model: 'local-preferences-v1', items, categories: ['Pentru tine', 'Cinematic', 'Continuă aventura'] });
});
export default router;
