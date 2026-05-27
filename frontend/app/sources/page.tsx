'use client';

import { apiFetch, apiPost } from '../../lib/apiClient';
import { API } from '../../lib/api';

import { useEffect, useMemo, useState } from 'react';
import UniversalPlayer from '../../components/UniversalPlayer';
import { Play, Trash2, Library, Database, Plus, Search } from 'lucide-react';

function detectProvider(url: string) {
  const value = String(url || '').toLowerCase();

  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube';
  if (value.includes('vimeo.com')) return 'vimeo';
  if (value.includes('dailymotion.com') || value.includes('dai.ly')) return 'dailymotion';
  if (value.includes('tiktok.com')) return 'tiktok';
  if (value.includes('terabox.com') || value.includes('1024tera.com')) return 'terabox';
  if (value.includes('rumble.com')) return 'rumble';
  if (value.includes('twitch.tv')) return 'twitch';
  if (value.includes('drive.google.com')) return 'google-drive';
  if (value.endsWith('.m3u8')) return 'hls';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';

  return 'unknown';
}

function detectType(url: string) {
  const value = url.toLowerCase();

  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'iframe';
  if (value.includes('vimeo.com')) return 'iframe';
  if (value.includes('dailymotion.com') || value.includes('dai.ly')) return 'iframe';
  if (value.includes('tiktok.com')) return 'iframe';
  if (value.includes('terabox.com') || value.includes('1024tera.com')) return 'iframe';
  if (value.includes('rumble.com')) return 'iframe';

  if (value.endsWith('.m3u8')) return 'hls';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';

  return 'external';
}

function getYoutubeId(url: string) {
  if (!url) return '';

  try {
    if (url.includes('youtube.com/watch')) {
      return new URL(url).searchParams.get('v') || '';
    }

    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    }

    if (url.includes('youtube.com/embed/')) {
      return url.split('/embed/')[1]?.split('?')[0] || '';
    }

    return '';
  } catch {
    return '';
  }
}

function getCardThumbnail(item: any) {
  const url = item.url || item.embedUrl || item.embed_url || '';
  const metadata = item.metadata || {};

  if (item.poster) return item.poster;
  if (item.thumbnail) return item.thumbnail;
  if (metadata.thumbnail) return metadata.thumbnail;

  const youtubeId = getYoutubeId(url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  return '';
}

function getHeroBackground(item: any) {
  return (
    item.backdrop ||
    item.metadata?.tmdb?.backdrop ||
    item.poster ||
    item.metadata?.tmdb?.poster ||
    item.thumbnail ||
    item.metadata?.thumbnail ||
    getCardThumbnail(item)
  );
}

function getItemProvider(item: any) {
  return item.provider || item.source_type || item.type || detectProvider(item.url || '');
}

function getItemType(item: any) {
  const type = String(item.type || item.source_type || detectType(item.url || '')).toLowerCase();

  if (['mp4', 'webm', 'hls'].includes(type)) return type;
  return detectType(item.url || '');
}


function getPlayerCapabilities(item: any) {
  return item.player?.capabilities || [];
}

function getPlayerScore(item: any) {
  return item.player?.player_score || 0;
}

function getRecommendedPlayer(item: any) {
  return item.player?.recommended_player || 'external';
}

function playerScoreClass(score: number) {
  if (score >= 85) return 'bg-[#00E0A8]/20 text-[#00E0A8]';
  if (score >= 65) return 'bg-yellow-500/20 text-yellow-200';
  return 'bg-red-500/20 text-red-200';
}

function getPreviewEmbed(item: any) {
  const url = item.url || item.embedUrl || item.embed_url || '';

  const yt = getYoutubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}`;

  if (url.includes('vimeo.com')) {
    const id = url.split('/').pop()?.split('?')[0];
    return id ? `https://player.vimeo.com/video/${id}` : '';
  }

  return '';
}
export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [lastOptimizedAt, setLastOptimizedAt] = useState('');
  const [smartEngineHealth, setSmartEngineHealth] = useState<any>(null);
  const [showEngineLogs, setShowEngineLogs] = useState(false);
  const [engineLogs, setEngineLogs] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('custom');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);


  async function loadSmartEngineHealth() {
    const data = await apiFetch('/health').catch(() => null);
    setSmartEngineHealth(data?.smartEngine || null);
  }

  async function loadSources() {
    try {
      const res = await fetch(`${API}/sources`);
      const data = await res.json();
      setSources(data.items || []);
    } catch {
      setSources([]);
    }
  }

  useEffect(() => {
    loadSources();
    loadSmartEngineHealth();
  }, []);




  async function clearEngineLogs() {
    await apiFetch('/sources/optimization-logs', { method: 'DELETE' }).catch(() => null);
    setEngineLogs([]);
    setMessage('✅ Smart Engine logs cleared');
  }

  async function loadEngineLogs() {
    const data = await apiFetch('/sources/optimization-logs').catch(() => ({ items: [] }));
    setEngineLogs(data.items || []);
    setShowEngineLogs((value) => !value);
  }

  async function autoOptimize() {
    try {
      setOptimizing(true);
      setMessage('⏳ Auto optimize rulează...');

      await apiFetch('/sources/normalize', { method: 'POST' });
      const result = await apiFetch('/sources/auto-optimize', { method: 'POST' });

      setLastOptimizedAt(new Date().toLocaleTimeString());
      setMessage(
        `✅ Auto optimize complet · providers: ${result.steps?.[0]?.updated || 0} · keys: ${result.steps?.[1]?.updated || 0} · thumbs: ${result.steps?.[2]?.updated || 0}`
      );

      await loadSources();
    } catch (error) {
      console.error(error);
      setMessage('❌ Auto optimize failed');
    } finally {
      setOptimizing(false);
    }
  }

  async function normalizeProviders() {
    try {
      const data = await apiPost('/sources/normalize', {});
      setMessage(`✅ Providers normalizați: ${data.updated || 0}`);
      await loadSources();
    } catch {
      setMessage('❌ Normalizare provider eșuată');
    }
  }

  async function normalizeThumbnails() {
    try {
      const data = await apiPost('/sources/normalize-thumbnails', {});
      setMessage(`✅ Thumbnails generate: ${data.updated || 0}`);
      await apiFetch('/sources/auto-optimize', { method: 'POST' }).catch(() => null);
      await loadSources();
    } catch {
      setMessage('❌ Generare thumbnails eșuată');
    }
  }


  async function backfillContentKeys() {
    try {
      setMessage('⏳ Generez content keys...');
      const data = await apiPost('/sources/backfill-content-keys', {});
      setMessage(`✅ Content keys generate: ${data.updated || 0}/${data.scanned || 0}`);
      await apiFetch('/sources/auto-optimize', { method: 'POST' }).catch(() => null);
      await loadSources();
    } catch {
      setMessage('❌ Backfill content keys eșuat');
    }
  }

  async function mergeDuplicates() {
    try {
      setMessage('⏳ Curăț duplicate...');
      const data = await apiPost('/sources/merge-duplicates', {});
      setMessage(`✅ Duplicate șterse: ${data.removed || 0}, grupuri: ${data.groups || 0}`);
      await apiFetch('/sources/auto-optimize', { method: 'POST' }).catch(() => null);
      await loadSources();
    } catch {
      setMessage('❌ Merge duplicates eșuat');
    }
  }

  async function enrichMetadata() {
    try {
      setMessage('⏳ Enrich metadata rulează...');

      const data = await apiFetch('/metadata/enrich-all', {
        method: 'POST',
        timeoutMs: 120000,
        retries: 0,
      });

      setMessage(`✅ Metadata îmbogățită: ${data.updated || 0}/${data.total || 0}, eșuate: ${data.failed || 0}`);
      await apiFetch('/sources/auto-optimize', { method: 'POST' }).catch(() => null);
      await loadSources();
    } catch (error: any) {
      setMessage(`❌ Enrich metadata eșuat: ${error?.message || 'unknown error'}`);
    }
  }

  const filteredSources = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return sources;

    return sources.filter((item) =>
      [
        item.title,
        item.url,
        getItemProvider(item),
        item.category,
        item.content_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [sources, search]);

  function saveLocal(next: any[]) {
    setSources(next);
  }

  async function addSource() {
    if (!url.trim()) return;

    const item = {
      title: title.trim() || 'Untitled source',
      url: url.trim(),
      embedUrl: url.trim(),
      provider: detectProvider(url),
      type: detectType(url),
      category,
    };

    setLoading(true);

    try {
      const res = await fetch(`${API}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const created = await res.json();
      setSources([created, ...sources]);
      setActive(created);

      await apiFetch('/sources/auto-optimize', { method: 'POST' }).catch(() => null);
      await loadSources();
    } catch {
      const created = {
        id: crypto.randomUUID(),
        ...item,
        createdAt: new Date().toISOString(),
      };

      saveLocal([created, ...sources]);
      setActive(created);
    }

    setTitle('');
    setUrl('');
    setLoading(false);
  }

  async function remove(id: string) {
    try {
      await fetch(`${API}/sources/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Sources action failed:', error);
    }

    const next = sources.filter((x) => String(x.id) !== String(id));
    saveLocal(next);

    if (String(active?.id) === String(id)) setActive(null);

    await apiFetch('/sources/auto-optimize', { method: 'POST' }).catch(() => null);
    await loadSources();
  }

  async function addToLibrary(item: any) {
    await fetch(`${API}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: String(item.id),
        contentId: String(item.content_id || ''),
        title: item.title || 'Untitled source',
        url: item.url,
        provider: getItemProvider(item),
        sourceType: getItemType(item),
        poster: getCardThumbnail(item),
        metadata: {
          category: item.category || item.content_type || 'custom',
        },
      }),
    });
  }

  async function playItem(item: any) {
    setActive(item);

    try {
      await fetch(`${API}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: String(item.id),
          contentId: String(item.content_id || ''),
          title: item.title || 'Untitled source',
          url: item.url,
          provider: getItemProvider(item),
          sourceType: getItemType(item),
          poster: getCardThumbnail(item),
          progress: 1,
          metadata: {
            category: item.category || item.content_type || 'custom',
          },
        }),
      });
    } catch (error) {
      console.error('Sources action failed:', error);
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          CUSTOM SOURCES
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Database />
          Sources
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Salvează URL-uri, iframe-uri, MP4, WebM, HLS, YouTube, Vimeo, Dailymotion, TikTok, TeraBox și alte surse.
        </p>

        <div className="mt-6 rounded-[2rem] border border-[#00E0A8]/20 bg-[#00E0A8]/10 p-5">
          <div className="text-sm font-black uppercase text-[#00E0A8]">Smart Library Engine</div>
          <div className="mt-2 text-2xl font-black">
            Status: {smartEngineHealth?.enabled ? 'Active' : 'Checking...'}
          </div>
          <div className="mt-1 text-sm text-white/50">
            Auto normalizează providers, keys, duplicates, thumbnails și metadata.
          </div>
          <div className="mt-2 text-xs font-bold text-[#00E0A8]">
            Schedule: every {smartEngineHealth?.intervalMinutes || 30} min
          </div>
          <div className="mt-2 text-xs font-bold text-white/40">
            Last optimization: {lastOptimizedAt || 'not yet in this session'}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={autoOptimize}
              disabled={optimizing}
              className="rounded-2xl bg-[#00E0A8] px-6 py-3 font-black text-black disabled:opacity-50"
            >
              {optimizing ? 'Optimizing...' : 'Run Smart Optimize'}
            </button>

            <button
              onClick={() => setShowAdvancedTools((value) => !value)}
              className="rounded-2xl bg-white/10 px-6 py-3 font-black"
            >
              {showAdvancedTools ? 'Hide Advanced Tools' : 'Advanced Tools'}
            </button>

            <button
              onClick={loadEngineLogs}
              className="rounded-2xl bg-white/10 px-6 py-3 font-black"
            >
              {showEngineLogs ? 'Hide Logs' : 'View Logs'}
            </button>
          </div>
        </div>

        {showEngineLogs && (
          <div className="mt-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-lg font-black">Smart Engine Logs</div>
              <button onClick={clearEngineLogs} className="rounded-xl bg-red-500/20 px-4 py-2 text-xs font-black text-red-200">
                Clear Logs
              </button>
            </div>
            {engineLogs.length === 0 ? (
              <div className="text-sm text-white/50">Nu există loguri încă.</div>
            ) : (
              <div className="grid gap-3">
                {engineLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="rounded-2xl bg-black/30 p-4 text-sm text-white/70">
                    <div className="font-black text-white">#{log.id} · {new Date(log.createdAt).toLocaleString()}</div>
                    <div className="mt-2 text-white/50">
                      Total updated: {log.summary?.totalUpdated || 0}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(log.steps || []).map((step: any) => (
                        <span key={step.step} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                          {step.step}: {step.updated}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showAdvancedTools && (
          <div className="mt-4 flex flex-wrap gap-3 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4">
            <button onClick={normalizeProviders} className="rounded-2xl bg-white/10 px-5 py-3 font-black">
              Normalize Providers
            </button>
            <button onClick={backfillContentKeys} className="rounded-2xl bg-white/10 px-5 py-3 font-black">
              Backfill Keys
            </button>
            <button onClick={mergeDuplicates} className="rounded-2xl bg-red-500/20 px-5 py-3 font-black text-red-200">
              Merge Duplicates
            </button>
            <button onClick={normalizeThumbnails} className="rounded-2xl bg-white/10 px-5 py-3 font-black">
              Normalize Thumbnails
            </button>
            <button onClick={enrichMetadata} className="rounded-2xl bg-[#00E0A8] px-5 py-3 font-black text-black">
              Enrich Metadata
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titlu sursă"
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-[#6A4CFF]"
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL / iframe / mp4 / m3u8..."
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-[#6A4CFF]"
          />

          <button
            onClick={addSource}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black disabled:opacity-60"
          >
            <Plus size={18} />
            {loading ? 'Salvez...' : 'Adaugă'}
          </button>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[320px_1fr]">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Categorie"
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-[#6A4CFF]"
          />

          <div className="relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută în sursele salvate..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-5 outline-none focus:border-[#6A4CFF]"
            />
          </div>
        </div>
      </section>

      {active && (
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#6A4CFF]/30 bg-gradient-to-br from-[#120f24] to-black p-5 shadow-[0_0_60px_rgba(106,76,255,0.25)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase">
                {getItemProvider(active)}
              </div>

              <h2 className="text-4xl font-black">{active.title}</h2>

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/50">
                {active.description ||
                  active.metadata?.tmdb?.overview ||
                  active.metadata?.wikipedia?.extract ||
                  `${getItemProvider(active).toUpperCase()} source`}
              </p>
            </div>
          </div>

          <UniversalPlayer
            source={{
              url: active.embedUrl || active.embed_url || active.url,
              type: getItemType(active),
              provider: getItemProvider(active),
              sourceId: String(active.id),
              contentId: String(active.content_id || ''),
              title: active.title,
              poster: getCardThumbnail(active),
            }}
            title={active.title}
          />
        </section>
      )}

      {filteredSources.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu ai surse salvate încă.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSources.map((item) => {
            const provider = getItemProvider(item);
            const previewEmbed = getPreviewEmbed(item);
            const thumbnail = getCardThumbnail(item);
            const playerCapabilities = getPlayerCapabilities(item);
            const playerScore = getPlayerScore(item);
            const recommendedPlayer = getRecommendedPlayer(item);

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-[#6A4CFF] hover:shadow-[0_0_40px_rgba(106,76,255,0.35)]"
              >
                <div className="relative aspect-video overflow-hidden bg-black" style={{ minHeight: 260 }}><div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  {previewEmbed && false ? (
                    <iframe
                      src={previewEmbed}
                      className="h-full w-full scale-[1.02]"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5">
                      <Play size={70} className="text-white/40" />
                    </div>
                  )}

                  <button
                    onClick={() => playItem(item)}
                    className="absolute inset-0 z-30 flex items-center justify-center bg-black/10"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl backdrop-blur-xl transition group-hover:scale-110">
                      <Play size={46} fill="currentColor" />
                    </div>
                  </button>

                  <div className="absolute left-4 top-4 z-40 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase text-white">
                      {provider}
                    </span>

                    <span className="rounded-full bg-[#00E0A8]/20 px-3 py-1 text-xs font-black uppercase text-[#00E0A8]">
                      {item.status || 'active'}
                    </span>
                  </div>
                </div>

                <div className="relative z-40 p-6">
                  <h2 className="relative z-40 mt-2 line-clamp-2 text-2xl font-black leading-tight tracking-tight text-white">
                    {item.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
                    {item.description || item.metadata?.tmdb?.overview || item.metadata?.wikipedia?.extract || `${provider.toUpperCase()} source`}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase text-white/50">
                    <span className={`rounded-full px-3 py-1 ${playerScoreClass(playerScore)}`}>
                      Player {playerScore}%
                    </span>

                    <span className="rounded-full bg-[#6A4CFF]/20 px-3 py-1 text-[#C7BAFF]">
                      {recommendedPlayer}
                    </span>

                    {playerCapabilities.length > 0 ? (
                      playerCapabilities.map((capability: string) => (
                        <span key={capability} className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                          {capability}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-red-500/20 px-3 py-1 text-red-200">
                        External
                      </span>
                    )}

                    <span className="rounded-full bg-white/10 px-3 py-1">
                      {item.quality || 'auto'}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1">
                      {item.language || 'ro'}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'recent'}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-[1fr_1fr_auto] gap-3">
                    <button
                      onClick={() => playItem(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-black"
                    >
                      <Play size={16} />
                      Play
                    </button>

                    <button
                      onClick={() => addToLibrary(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6A4CFF] px-4 py-3 font-black"
                    >
                      <Library size={16} />
                      Library
                    </button>

                    <button
                      onClick={() => remove(item.id)}
                      className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-3 font-black"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
