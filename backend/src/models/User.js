import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  refreshTokens: [String]
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
