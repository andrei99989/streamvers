import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

const router = Router();

const jobs = new Map();
const TRANSCODE_ROOT = path.resolve(process.cwd(), 'backend/storage/transcodes');

function ensureTranscodeRoot() {
  fs.mkdirSync(TRANSCODE_ROOT, { recursive: true });
}

function safeJobId() {
  return crypto.randomBytes(8).toString('hex');
}

function publicHlsUrl(req, jobId) {
  return `${req.protocol}://${req.get('host')}/stream/hls/${jobId}/master.m3u8`;
}



function detectProvider(url = '') {
  const value = String(url || '').toLowerCase();

  if (value.includes('youtube.com') || value.includes('youtu.be') || value.includes('youtube-nocookie.com')) return 'youtube';
  if (value.includes('vimeo.com')) return 'vimeo';
  if (value.includes('dailymotion.com') || value.includes('dai.ly')) return 'dailymotion';
  if (value.includes('tiktok.com') || value.includes('vm.tiktok.com')) return 'tiktok';
  if (value.includes('rumble.com')) return 'rumble';
  if (value.includes('terabox.com') || value.includes('1024tera.com')) return 'terabox';
  if (value.includes('twitch.tv')) return 'twitch';
  if (value.includes('drive.google.com')) return 'google-drive';
  if (value.endsWith('.m3u8')) return 'hls';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';

  return 'external';
}

function detectType(url = '') {
  const value = String(url || '').toLowerCase();

  if (value.endsWith('.m3u8')) return 'hls';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';

  if (
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('vimeo.com') ||
    value.includes('dailymotion.com') ||
    value.includes('dai.ly') ||
    value.includes('tiktok.com') ||
    value.includes('rumble.com') ||
    value.includes('terabox.com')
  ) {
    return 'iframe';
  }

  return 'external';
}

function detectContainer(url = '') {
  const value = String(url || '').toLowerCase();

  if (value.endsWith('.m3u8')) return 'm3u8';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';
  if (value.endsWith('.mkv')) return 'mkv';
  if (value.endsWith('.avi')) return 'avi';
  if (value.endsWith('.mov')) return 'mov';

  return 'unknown';
}

function estimateQuality(url = '') {
  const value = String(url || '').toLowerCase();

  if (value.includes('2160') || value.includes('4k') || value.includes('uhd')) return '2160p';
  if (value.includes('1440')) return '1440p';
  if (value.includes('1080')) return '1080p';
  if (value.includes('720')) return '720p';
  if (value.includes('480')) return '480p';
  if (value.includes('360')) return '360p';

  return 'auto';
}

function estimateCodec(url = '') {
  const value = String(url || '').toLowerCase();

  if (value.endsWith('.webm')) return 'vp9/opus';
  if (value.endsWith('.mp4')) return 'h264/aac';
  if (value.endsWith('.m3u8')) return 'adaptive-hls';
  if (value.endsWith('.mkv')) return 'unknown-mkv';
  if (value.endsWith('.avi')) return 'unknown-avi';
  if (value.endsWith('.mov')) return 'quicktime';

  return 'unknown';
}

router.get('/probe', async (req, res) => {
  const url = String(req.query.url || '').trim();

  if (!url) {
    return res.status(400).json({ error: 'MISSING_URL' });
  }

  const provider = detectProvider(url);
  const type = detectType(url);
  const container = detectContainer(url);
  const quality = estimateQuality(url);
  const codec = estimateCodec(url);

  return res.json({
    ok: true,
    url,
    provider,
    type,
    container,
    quality,
    codec,
    playableInBrowser: ['iframe', 'mp4', 'webm', 'hls'].includes(type),
    needsTranscoding: ['mkv', 'avi', 'mov'].includes(container),
    canUseHls: type === 'hls',
  });
});



function qualityArgs(quality = '720p') {
  const q = String(quality || '720p').toLowerCase();

  if (q === '360p') {
    return ['-vf', 'scale=-2:360', '-b:v', '800k', '-maxrate', '900k', '-bufsize', '1600k'];
  }

  if (q === '1080p') {
    return ['-vf', 'scale=-2:1080', '-b:v', '5000k', '-maxrate', '5500k', '-bufsize', '10000k'];
  }

  if (q === 'source') {
    return [];
  }

  return ['-vf', 'scale=-2:720', '-b:v', '2500k', '-maxrate', '2800k', '-bufsize', '5000k'];
}

router.post('/transcode', async (req, res) => {
  const url = String(req.body?.url || '').trim();
  const quality = String(req.body?.quality || '720p').trim();

  if (!url) {
    return res.status(400).json({ error: 'MISSING_URL' });
  }

  ensureTranscodeRoot();

  const jobId = safeJobId();
  const jobDir = path.join(TRANSCODE_ROOT, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const output = path.join(jobDir, 'master.m3u8');

  const job = {
    id: jobId,
    url,
    status: 'running',
    progress: 0,
    output,
    hlsUrl: publicHlsUrl(req, jobId),
    createdAt: new Date().toISOString(),
    error: '',
    quality,
  };

  jobs.set(jobId, job);

  const args = [
    '-y',
    '-i', url,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '23',
    ...qualityArgs(quality),
    '-c:a', 'aac',
    '-b:a', '128k',
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-hls_segment_filename', path.join(jobDir, 'segment_%03d.ts'),
    output,
  ];

  const ffmpeg = spawn('ffmpeg', args);

  ffmpeg.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    if (text.includes('time=')) {
      job.progress = Math.min(99, job.progress + 3);
    }
  });

  ffmpeg.on('error', (error) => {
    job.status = 'failed';
    job.error = error.message;
  });

  ffmpeg.on('close', (code) => {
    if (code === 0 && fs.existsSync(output)) {
      job.status = 'completed';
      job.progress = 100;
    } else {
      job.status = 'failed';
      job.error = `ffmpeg exited with code ${code}`;
    }
  });

  return res.status(202).json(job);
});

router.get('/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: 'JOB_NOT_FOUND' });
  }

  return res.json(job);
});

router.get('/hls/:jobId/:file', (req, res) => {
  const jobId = String(req.params.jobId || '');
  const file = String(req.params.file || '');

  if (!/^[a-f0-9]+$/.test(jobId) || file.includes('..')) {
    return res.status(400).json({ error: 'BAD_PATH' });
  }

  const filePath = path.join(TRANSCODE_ROOT, jobId, file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'HLS_FILE_NOT_FOUND' });
  }

  if (file.endsWith('.m3u8')) {
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  }

  if (file.endsWith('.ts')) {
    res.setHeader('Content-Type', 'video/mp2t');
  }

  return res.sendFile(filePath);
});


export default router;
