'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

function detectSource(url: string) {
  const clean = url.toLowerCase();

  if (
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
    clean.includes('dailymotion.com') ||
    clean.includes('rumble.com') ||
    clean.includes('tiktok.com') ||
    clean.includes('terabox.com')
  ) return 'iframe';

  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';

  return 'iframe';
}

function toEmbed(url: string) {
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes('youtube.com/watch')) {
    const id = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${id}`;
  }

  return url;
}

export default function UniversalPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const type = detectSource(url);

  useEffect(() => {
    if (type !== 'hls' || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    }

    videoRef.current.src = url;
  }, [url, type]);

  if (type === 'iframe') {
    return (
      <iframe
        src={toEmbed(url)}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={type === 'hls' ? undefined : url}
      controls
      className="h-full w-full bg-black"
    />
  );
}
