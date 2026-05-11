import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const router = Router();
const sign = user => jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'email, password, name required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already exists' });
  const user = await User.create({ email, name, passwordHash: await bcrypt.hash(password, 12) });
  await Profile.create({ userId: user._id, name: 'Principal', avatar: '🍿' });
  res.status(201).json({ token: sign(user), user: { id: user._id, email, name } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: sign(user), user: { id: user._id, email: user.email, name: user.name } });
});

router.post('/oauth-placeholder', (_req, res) => res.json({ message: 'Configurează Google/Apple OAuth cu NextAuth/Auth.js sau Passport.' }));
export default router;
