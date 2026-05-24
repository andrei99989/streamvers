import { Router } from 'express';

const router = Router();

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

export default router;
