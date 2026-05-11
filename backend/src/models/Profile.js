import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '✨' },
  parentalLevel: { type: Number, default: 18 },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  history: [{ movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, progress: Number, updatedAt: Date }]
}, { timestamps: true });

export default mongoose.model('Profile', ProfileSchema);
