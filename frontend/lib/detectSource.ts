const iframeDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'tiktok.com', 'terabox.com', 'rumble.com'];
export type SourceType = 'iframe' | 'mp4' | 'webm' | 'hls' | 'external';
export function detectSource(url: string): { type: SourceType; provider: string } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const clean = url.toLowerCase().split('?')[0];
    const domain = iframeDomains.find(d => host.includes(d));
    if (domain) return { type: 'iframe', provider: domain };
    if (clean.endsWith('.m3u8')) return { type: 'hls', provider: 'hls' };
    if (clean.endsWith('.mp4')) return { type: 'mp4', provider: 'direct' };
    if (clean.endsWith('.webm')) return { type: 'webm', provider: 'direct' };
  } catch {
    return { type: 'external', provider: 'invalid' };
  }
  return { type: 'external', provider: 'external' };
}
