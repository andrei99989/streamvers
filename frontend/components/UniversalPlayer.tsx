'use client';
import { API } from '../lib/api';

import { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Gauge,
  Volume2,
  VolumeX,
  Subtitles,
} from 'lucide-react';

type Source = {
  url: string;
  type?: 'iframe' | 'mp4' | 'webm' | 'hls' | string;
  player?: {
    recommended_player?: 'native' | 'hls' | 'embed' | 'external' | string;
    capabilities?: string[];
    player_score?: number;
    player_flags?: string[];
  };
  provider?: string;
  sourceId?: string;
  contentId?: string;
  title?: string;
  poster?: string;
  startTime?: number;
};

function detectProvider(src = '') {
  const value = src.toLowerCase();

  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube';
  if (value.includes('vimeo.com')) return 'vimeo';
  if (value.includes('dailymotion.com') || value.includes('dai.ly')) return 'dailymotion';
  if (value.includes('tiktok.com') || value.includes('vm.tiktok.com')) return 'tiktok';
  if (value.includes('terabox.com') || value.includes('1024tera.com')) return 'terabox';
  if (value.includes('rumble.com')) return 'rumble';
  if (value.includes('twitch.tv')) return 'twitch';
  if (value.includes('drive.google.com')) return 'google-drive';
  if (value.endsWith('.m3u8')) return 'hls';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';

  return 'external';
}

function getYoutubeId(src: string) {
  try {
if (src.includes('youtu.be/')) {
      return src.split('youtu.be/')[1]?.split('?')[0] || '';
    }

    if (src.includes('youtube.com/watch?v=')) {
      return src.split('v=')[1]?.split('&')[0] || '';
    }

    if (src.includes('youtube.com/embed/')) {
      return src.split('/embed/')[1]?.split('?')[0] || '';
    }

    const url = new URL(src);
    return url.searchParams.get('v') || '';
  } catch {
    return '';
  }
}

function normalizeEmbed(src = '') {
  try {
    if (!src) return '';

    const value = src.trim();
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const id = getYoutubeId(value);
      if (!id) return value;

      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    }

    if (host.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : value;
    }

    if (host.includes('dailymotion.com')) {
      const id = url.pathname.split('/video/')[1]?.split(/[?_]/)[0];
      return id ? `https://www.dailymotion.com/embed/video/${id}?autoplay=1` : value;
    }

    if (host.includes('dai.ly')) {
      const id = url.pathname.replace('/', '').split('?')[0];
      return id ? `https://www.dailymotion.com/embed/video/${id}?autoplay=1` : value;
    }

    if (host.includes('vm.tiktok.com') || host === 'vm.tiktok.com') {
      return '';
    }

    if (host.includes('tiktok.com') && url.pathname.includes('/video/')) {
      const id = url.pathname.split('/video/')[1]?.split('?')[0];
      return id ? `https://www.tiktok.com/embed/v2/${id}` : value;
    }

    if (host.includes('rumble.com')) {
      return value.replace('.html', '/embed');
    }

    return value;
  } catch {
    return src;
  }
}

function normalizeType(src = '', fallback: Source['type'] = 'iframe') {
  const value = src.toLowerCase();
  const type = String(fallback || '').toLowerCase();

  if (value.endsWith('.m3u8') || type === 'hls') return 'hls';
  if (value.endsWith('.mp4') || type === 'mp4') return 'mp4';
  if (value.endsWith('.webm') || type === 'webm') return 'webm';

  return 'iframe';
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return `${m}:${String(s).padStart(2, '0')}`;
}


function resolveRuntimePlayer(source: Source) {
  const recommended = source.player?.recommended_player;
  const capabilities = source.player?.capabilities || [];
  const detected = normalizeType(source.url || '', source.type || 'iframe');

  if (recommended === 'hls' || capabilities.includes('HLS') || detected === 'hls') {
    return 'hls';
  }

  if (recommended === 'native' || capabilities.includes('MP4') || capabilities.includes('WEBM') || ['mp4', 'webm'].includes(detected)) {
    return detected === 'webm' ? 'webm' : 'mp4';
  }

  if (recommended === 'embed' || capabilities.includes('EMBED') || detected === 'iframe') {
    return 'iframe';
  }

  return detected || 'iframe';
}

export default function UniversalPlayer({
  source,
  title = 'StreamVerse Player',
}: {
  source: Source;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSaveRef = useRef(0);

  const [cinema, setCinema] = useState(false);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showResume, setShowResume] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [resumeTime, setResumeTime] = useState(0);

  const finalType = useMemo(
    () => resolveRuntimePlayer(source),
    [source]
  );

  const finalUrl = useMemo(() => normalizeEmbed(source?.url || ''), [source?.url]);

  const provider = useMemo(
    () => source?.provider || detectProvider(source?.url || ''),
    [source?.provider, source?.url]
  );

  const runtimePlayer = source?.player?.recommended_player || finalType || 'external';
  const runtimeScore = source?.player?.player_score || 0;
  const runtimeFlags = source?.player?.player_flags || [];
  const runtimeCapabilities = source?.player?.capabilities || [];

  useEffect(() => {
    setError('');
    setProgress(0);
    setDuration(0);
    lastSaveRef.current = 0;

    const key = `streamverse-progress:${source.sourceId || source.url}`;
    const saved = Number(source.startTime || 0);
    setResumeTime(Number.isFinite(saved) ? saved : 0);

    if (!videoRef.current || finalType !== 'hls') return;

    const video = videoRef.current;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source.url;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(source.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, () => {
        setError('Fluxul HLS nu poate fi redat momentan.');
      });

      return () => hls.destroy();
    }

    setError('Browserul nu suportă HLS.');
  }, [source, finalType]);

  function skip(seconds: number) {
    if (!videoRef.current) return;

    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  }

  function toggleMute() {
    if (!videoRef.current) return;

    const next = !videoRef.current.muted;
    videoRef.current.muted = next;
    setMuted(next);
  }

  function changeVolume(value: number) {
    const next = Math.max(0, Math.min(1, value));
    setVolume(next);

    if (videoRef.current) {
      videoRef.current.volume = next;
      videoRef.current.muted = next === 0;
      setMuted(next === 0);
    }
  }

  async function toggleFullscreen() {
    const container = videoRef.current?.parentElement;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setCinema((value) => !value);
    }
  }

  function resumePlayback() {
    if (!videoRef.current) return;

    videoRef.current.currentTime = Math.max(0, progress || source.startTime || 0);
    videoRef.current.play();
    setShowResume(false);
  }

  async function saveIframeContinue() {
    if (!source.sourceId) return;

    try {
      await fetch(`${API}/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: String(source.sourceId),
          contentId: String(source.contentId || ''),
          title: source.title || title,
          url: source.url,
          provider,
          sourceType: finalType,
          poster: source.poster || '',
          progress: 1,
          duration: 0,
          metadata: {
            autosave: true,
            iframe: true,
            progressMode: 'opened',
          },
        }),
      });
    } catch {}
  }

  async function saveContinue(video: HTMLVideoElement) {
    if (!source.sourceId) return;
    if (!video.duration || Number.isNaN(video.duration)) return;

    try {
      await fetch(`${API}/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: String(source.sourceId),
          contentId: String(source.contentId || ''),
          title: source.title || title,
          url: source.url,
          provider,
          sourceType: finalType,
          poster: source.poster || '',
          progress: Math.floor(video.currentTime),
          duration: Math.floor(video.duration),
          metadata: {
            autosave: true,
            completed: video.duration > 60 && video.currentTime / video.duration >= 0.9,
          },
        }),
      });
    } catch (error) {
      try {
        // Progress is persisted through backend /continue endpoint.
      } catch {}

      console.error('Continue autosave failed:', error);
    }
  }

  useEffect(() => {
    if (!['mp4', 'webm', 'hls'].includes(String(finalType))) {
      saveIframeContinue();
    }
  }, [source.sourceId, source.url, finalType]);

  if (!source?.url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[2rem] bg-black text-white/50">
        Nicio sursă video disponibilă.
      </div>
    );
  }

  if (!['mp4', 'webm', 'hls'].includes(String(finalType))) {
    if (!finalUrl) {
      return (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500/30 via-black to-cyan-400/20 shadow-[0_0_80px_rgba(106,76,255,0.25)]">
          <div className="text-center">
            <div className="text-3xl font-black uppercase text-white">
              {provider}
            </div>
            <p className="mt-3 px-6 text-sm font-bold text-white/50">
              Această sursă nu permite embed direct.
            </p>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black text-white"
            >
              Deschide sursa
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_80px_rgba(106,76,255,0.25)]">
        <iframe
          src={finalUrl}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
        />

        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase text-white/80">
          {provider}
        </div>

        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-[#6A4CFF] px-5 py-3 text-sm font-black text-white shadow-2xl"
        >
          <ExternalLink size={14} />
          Deschide sursa
        </a>
      </div>
    );
  }

  const percent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className={cinema ? 'fixed inset-0 z-50 bg-black p-4 md:p-6' : ''}>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_80px_rgba(106,76,255,0.25)]">
        <video
          ref={videoRef}
          className="aspect-video h-full w-full object-cover"
          controls
          autoPlay
          playsInline
          preload="metadata"
          poster={source.poster || undefined}
          onError={() => setError('Videoclipul nu poate fi redat.')}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;

            video.playbackRate = rate;
            setDuration(video.duration || 0);

            if (source.startTime && source.startTime > 0) {
              video.currentTime = source.startTime;
            }
          }}
          onTimeUpdate={async (e) => {
            const video = e.currentTarget;
            const now = Date.now();

            setProgress(video.currentTime || 0);
            setDuration(video.duration || 0);

            if (now - lastSaveRef.current < 5000) return;
            lastSaveRef.current = now;

            await saveContinue(video);
          }}
          onPause={(e) => saveContinue(e.currentTarget)}
          onEnded={(e) => saveContinue(e.currentTarget)}
        >
          {finalType !== 'hls' && (
            <source src={source.url} type={`video/${finalType}`} />
          )}

          <track label="Română" kind="subtitles" srcLang="ro" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

        <div className="absolute left-4 top-4 z-40 flex flex-wrap gap-2">
          <div className="rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase text-white/80">
            {provider}
          </div>

          <div className="rounded-full bg-[#00E0A8]/20 px-3 py-1 text-xs font-black uppercase text-[#00E0A8]">
            Runtime: {runtimePlayer}
          </div>

          <div className="rounded-full bg-[#6A4CFF]/20 px-3 py-1 text-xs font-black uppercase text-[#B8A7FF]">
            Score: {runtimeScore}
          </div>

          {runtimeFlags.slice(0, 2).map((flag) => (
            <div
              key={flag}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/70"
            >
              {flag}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#6A4CFF]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 rounded-full bg-[#6A4CFF] px-4 py-2 font-black"
            >
              {cinema ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {cinema ? 'Ieși' : 'Cinema'}
            </button>

            <button
              onClick={() => skip(-10)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-bold"
            >
              <RotateCcw size={16} />
              10s
            </button>

            <button
              onClick={() => skip(10)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-bold"
            >
              <RotateCw size={16} />
              10s
            </button>

            <button
              onClick={() => skip(85)}
              className="rounded-full bg-white/10 px-4 py-2 font-bold"
            >
              Skip intro
            </button>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Gauge size={16} />

              <select
                value={rate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setRate(v);

                  if (videoRef.current) {
                    videoRef.current.playbackRate = v;
                  }
                }}
                className="bg-transparent outline-none"
              >
                {[0.5, 1, 1.25, 1.5, 2].map((v) => (
                  <option className="bg-black" key={v} value={v}>
                    {v}x
                  </option>
                ))}
              </select>
            </div>

            <span className="ml-auto rounded-full bg-black/60 px-3 py-2 text-xs text-white/70">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {error && (
          <div className="absolute left-4 right-4 top-14 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
