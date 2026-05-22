import validator from 'validator';

const iframeDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'tiktok.com', 'terabox.com', 'rumble.com'];
const blockedProtocols = ['javascript:', 'data:', 'file:', 'ftp:'];

export function detectSource(inputUrl) {
  if (!inputUrl || !validator.isURL(inputUrl, { require_protocol: true })) {
    throw new Error('URL invalid. Include http:// or https://');
  }

  const url = new URL(inputUrl);
  if (blockedProtocols.includes(url.protocol)) throw new Error('Protocol blocat');

  const lower = inputUrl.toLowerCase().split('?')[0];
  const host = url.hostname.toLowerCase();

  if (iframeDomains.some(domain => host.includes(domain))) return { type: 'iframe', provider: iframeDomains.find(d => host.includes(d)) };
  if (lower.endsWith('.m3u8')) return { type: 'hls', provider: 'hls' };
  if (lower.endsWith('.mp4')) return { type: 'mp4', provider: 'direct' };
  if (lower.endsWith('.webm')) return { type: 'webm', provider: 'direct' };
  return { type: 'external', provider: 'external' };
}
