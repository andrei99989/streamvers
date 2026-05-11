import { Router } from 'express';
import { searchMetadata } from '../services/metadataService.js';

const router = Router();

router.get('/search', async (req, res) => {
  const q = req.query.q;
  const data = await searchMetadata(q);
  res.json(data);
});

export default router;
