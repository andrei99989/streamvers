'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:4000';

type SourceGroup = {
  source: string;
  items: any[];
};

const demoGroups: SourceGroup[] = [
  {
    source: 'demo',
    items: [
      {
        id: 'demo-iron-man',
        title: 'Iron Man',
        subtitle: 'Demo Movie • 2008',
        image: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
      },
      {
        id: 'demo-naruto',
        title: 'Naruto',
        subtitle: 'Demo Anime • Series',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
      },
      {
        id: 'demo-youtube',
        title: 'Universal Player Demo',
        subtitle: 'Demo Stream • YouTube',
        image: null,
      },
    ],
  },
];

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [groups, setGroups] = useState<SourceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  const totalResults = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  async function searchWithQuery(value: string) {
    const query = value.trim();
    if (!query) return;

    setLoading(true);
    setOffline(false);

    try {
      const [metadataRes, algoliaRes, deezerRes, wikipediaRes] = await Promise.allSettled([
        fetch(`${API}/metadata/search?q=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch(`${API}/algolia/search?q=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch(`${API}/deezer/search?q=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch(`${API}/wikipedia/search?q=${encodeURIComponent(query)}`).then((r) => r.json()),
      ]);

      const nextGroups: SourceGroup[] = [];

      if (algoliaRes.status === 'fulfilled' && algoliaRes.value?.hits?.length) {
        nextGroups.push({ source: 'algolia', items: algoliaRes.value.hits });
      }

      if (deezerRes.status === 'fulfilled' && deezerRes.value?.data?.length) {
        nextGroups.push({ source: 'deezer', items: deezerRes.value.data });
      }

      if (wikipediaRes.status === 'fulfilled' && wikipediaRes.value?.results?.length) {
        nextGroups.push({ source: 'wikipedia', items: wikipediaRes.value.results });
      }

      if (metadataRes.status === 'fulfilled' && metadataRes.value) {
        Object.entries(metadataRes.value)
          .filter(([, items]) => Array.isArray(items) && items.length > 0)
          .forEach(([source, items]) => {
            nextGroups.push({ source, items: items as any[] });
          });
      }

      const uniqueGroups = Array.from(
        new Map(nextGroups.map((group) => [group.source, group])).values()
      );

      if (uniqueGroups.length) {
        setGroups(uniqueGroups);
      } else {
        setGroups(demoGroups);
      }
    } catch (error) {
      console.error(error);
      setOffline(true);
      setGroups(demoGroups);
    }

    setLoading(false);
  }

  function search() {
    searchWithQuery(q);
  }

  useEffect(() => {
    const initialQ = searchParams.get('q');
    if (initialQ) {
      setQ(initialQ);
      searchWithQuery(initialQ);
    }
  }, [searchParams]);

  return (
    <section className="min-h-screen bg-black p-6 text-white md:p-8">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 md:p-8">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex rounded-full bg-[#6A4CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.25em]">
            StreamVerse Search
          </div>

          <h1 className="text-4xl font-black md:text-6xl">Căutare Universală</h1>

          <p className="mt-4 text-white/60">
            Caută filme, seriale, anime, muzică, YouTube, Wikipedia și surse metadata într-un singur loc.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Ex: Naruto, Iron Man, Arsenal, YouTube..."
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none focus:border-[#6A4CFF]"
          />

          <button
            onClick={search}
            disabled={loading}
            className="rounded-2xl bg-[#6A4CFF] px-8 py-4 font-black disabled:opacity-60"
          >
            {loading ? 'Caută...' : 'Caută'}
          </button>
        </div>

        {offline && (
          <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            Backend-ul nu răspunde. Afișez rezultate demo până pornește API-ul.
          </div>
        )}

        {totalResults > 0 && (
          <div className="mt-5 text-sm text-white/50">
            {totalResults} rezultate găsite în {groups.length} surse.
          </div>
        )}
      </div>

      {groups.length === 0 && !loading && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Caută ceva pentru a vedea rezultate.
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-10 space-y-12">
          {groups.map((group) => (
            <Block
              key={group.source}
              title={group.source.toUpperCase()}
              items={group.items}
              source={group.source}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Block({ title, items, source }: any) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
          {items.length} rezultate
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item: any, i: number) => {
          const card = normalizeItem(item, source);
          const href =
            source === 'demo-youtube'
              ? '/watch/demo'
              : `/title/${source}/${encodeURIComponent(card.id || i)}`;

          return (
            <div
              key={card.id || i}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02] hover:border-[#6A4CFF]"
            >
              <Link href={href}>
                {card.image ? (
                  <img src={card.image} alt={card.title} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-white/5 text-4xl">
                    🎬
                  </div>
                )}
              </Link>

              <div className="p-4">
                <Link href={href}>
                  <div className="line-clamp-2 font-bold hover:text-[#00E0A8]">
                    {card.title}
                  </div>
                </Link>

                <div className="mt-1 text-xs text-white/50">{card.subtitle}</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-black/30 px-3 py-1 text-xs">{source}</span>

                  <button
                    onClick={() => {
                      const saved = JSON.parse(localStorage.getItem('streamverse_library') || '[]');
                      localStorage.setItem(
                        'streamverse_library',
                        JSON.stringify([card, ...saved.filter((x: any) => x.id !== card.id)])
                      );
                      alert('Adăugat în Library');
                    }}
                    className="rounded-full bg-[#6A4CFF] px-3 py-1 text-xs font-bold"
                  >
                    + Library
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function normalizeItem(item: any, source: string) {
  if (source === 'demo') {
    return item;
  }

  if (source === 'algolia') {
    return {
      id: item.id || item.objectID,
      title: item.title || 'Algolia result',
      subtitle: `${item.type || 'custom'} • ${item.sourcesCount || 0} surse`,
      image: item.poster || null,
    };
  }

  if (source === 'omdb') {
    return {
      id: item.imdbID,
      title: item.Title,
      subtitle: `${item.Year || ''} • ${item.Type || ''}`,
      image: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
    };
  }

  if (source === 'tmdb') {
    return {
      id: item.id,
      title: item.title || item.name || item.original_title || item.original_name,
      subtitle: `${item.media_type || ''} • ${item.release_date || item.first_air_date || ''}`,
      image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    };
  }

  if (source === 'youtube') {
    return {
      id: item.id?.videoId,
      title: item.snippet?.title,
      subtitle: item.snippet?.channelTitle,
      image: item.snippet?.thumbnails?.medium?.url,
    };
  }

  if (source === 'tvmaze') {
    const show = item.show || item;
    return {
      id: show.id,
      title: show.name,
      subtitle: `${show.type || ''} • ${show.premiered || ''}`,
      image: show.image?.medium || show.image?.original,
    };
  }

  if (source === 'jikan') {
    return {
      id: item.mal_id,
      title: item.title_english || item.title,
      subtitle: `${item.type || ''} • ${item.year || item.aired?.string || ''}`,
      image: item.images?.jpg?.image_url || item.images?.webp?.image_url,
    };
  }

  if (source === 'kitsu') {
    return {
      id: item.id,
      title: item.attributes?.canonicalTitle,
      subtitle: `${item.attributes?.subtype || ''} • ${item.attributes?.startDate || ''}`,
      image: item.attributes?.posterImage?.medium || item.attributes?.posterImage?.large,
    };
  }

  if (source === 'wikipedia') {
    return {
      id: item.pageid,
      title: item.title || 'Wikipedia result',
      subtitle: item.snippet ? item.snippet.replace(/<[^>]+>/g, '') : 'Wikipedia',
      image: null,
    };
  }

  if (source === 'deezer') {
    return {
      id: item.id,
      title: item.title || 'Deezer track',
      subtitle: `${item.artist?.name || ''} • ${item.album?.title || ''}`,
      image: item.album?.cover_medium || item.album?.cover_big || item.artist?.picture_medium || null,
    };
  }

  return {
    id: item.id || item.objectID || Math.random(),
    title: item.title || item.name || item.Title || 'Rezultat',
    subtitle: item.type || source,
    image: item.image || item.poster || item.thumbnail || null,
  };
}
