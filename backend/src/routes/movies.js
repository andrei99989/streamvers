import { Router } from 'express';
import Movie from '../models/Movie.js';
const router = Router();
router.get('/', async (_req, res) => res.json(await Movie.find().limit(100)));
router.post('/', async (req, res) => res.status(201).json(await Movie.create(req.body)));
router.get('/:id', async (req, res) => res.json(await Movie.findById(req.params.id)));
export default router;
