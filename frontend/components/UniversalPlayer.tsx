'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';

type Source = { url: string; type: 'iframe' | 'mp4' | 'webm' | 'hls'; provider?: string };

function embedUrl(src: string) {
  try {
    const url = new URL(src);
    if (url.hostname.includes('youtube.com')) return src.replace('/watch?v=', '/embed/');
    if (url.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video/${url.pathname.split('/').filter(Boolean).pop()}`;
    return src;
  } catch { return src; }
}

export default function UniversalPlayer({ source, title = 'Player' }: { source: Source; title?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cinema, setCinema] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (!videoRef.current || source.type !== 'hls') return;
    const video = videoRef.current;
    if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = source.url;
    else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(source.url);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [source]);

  if (source.type === 'iframe') {
    return <div className="relative aspect-video overflow-hidden rounded-3xl bg-black card-glow">
      <iframe src={embedUrl(source.url)} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen title={title} />
    </div>;
  }

  return <div className={`${cinema ? 'fixed inset-0 z-50 bg-black p-6' : ''}`}>
    <div className="overflow-hidden rounded-3xl bg-black card-glow">
      <video ref={videoRef} className="h-full w-full aspect-video" controls playsInline preload="metadata" onLoadedMetadata={e => ((e.currentTarget.playbackRate = rate))}>
        {source.type !== 'hls' && <source src={source.url} type={`video/${source.type}`} />}
        <track label="Română" kind="subtitles" srcLang="ro" />
      </video>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-panel/80 p-3 text-sm">
        <button onClick={() => setCinema(!cinema)} className="rounded-full bg-violet px-4 py-2">Mod cinema</button>
        <button onClick={() => videoRef.current && (videoRef.current.currentTime += 85)} className="rounded-full bg-white/10 px-4 py-2">Skip intro</button>
        <button className="rounded-full bg-white/10 px-4 py-2">Next episode</button>
        <select value={rate} onChange={e => { const v = Number(e.target.value); setRate(v); if (videoRef.current) videoRef.current.playbackRate = v; }} className="rounded-full bg-white/10 px-4 py-2">
          {[0.5, 1, 1.25, 1.5, 2].map(v => <option className="bg-panel" key={v} value={v}>{v}x</option>)}
        </select>
      </div>
    </div>
  </div>;
}
