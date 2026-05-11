import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['iframe', 'mp4', 'webm', 'hls'], required: true },
  provider: String,
  isPrimary: { type: Boolean, default: true }
});

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  poster: String,
  backdrop: String,
  genres: [String],
  cast: [String],
  director: String,
  releaseYear: Number,
  rating: Number,
  sources: [SourceSchema],
  subtitles: [{ label: String, lang: String, url: String, format: { type: String, enum: ['vtt', 'srt'] } }]
}, { timestamps: true });

export default mongoose.model('Movie', MovieSchema);
