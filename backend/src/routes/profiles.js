import { Router } from 'express';
import Profile from '../models/Profile.js';
import { auth } from '../middleware/auth.js';
const router = Router();
router.use(auth);
router.get('/', async (req, res) => res.json(await Profile.find({ userId: req.user.id })));
router.post('/', async (req, res) => res.status(201).json(await Profile.create({ userId: req.user.id, ...req.body })));
export default router;
