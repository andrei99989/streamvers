'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API = 'http://127.0.0.1:4000';

type SourceGroup = {
  source: string;
  items: any[];
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [groups, setGroups] = useState<SourceGroup[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchWithQuery(value: string) {
    if (!value.trim()) return;

    setLoading(true);

    try {
      const [metadataRes, algoliaRes, deezerRes, wikipediaRes] = await Promise.allSettled([
        fetch(`${API}/metadata/search?q=${encodeURIComponent(value)}`).then((r) => r.json()),
        fetch(`${API}/algolia/search?q=${encodeURIComponent(value)}`).then((r) => r.json()),
        fetch(`${API}/deezer/search?q=${encodeURIComponent(value)}`).then((r) => r.json()),
        fetch(`${API}/wikipedia/search?q=${encodeURIComponent(value)}`).then((r) => r.json())
      ]);

      const nextGroups: SourceGroup[] = [];

      if (algoliaRes.status === 'fulfilled' && algoliaRes.value?.hits?.length) {
        nextGroups.push({
          source: 'algolia',
          items: algoliaRes.value.hits
        });
      }

      if (deezerRes?.status === 'fulfilled' && deezerRes.value?.data?.length) {
        nextGroups.push({
          source: 'deezer',
          items: deezerRes.value.data
        });
      }

      if (wikipediaRes?.status === 'fulfilled' && wikipediaRes.value?.results?.length) {
        nextGroups.push({
          source: 'wikipedia',
          items: wikipediaRes.value.results
        });
      }

      if (wikipediaRes?.status === 'fulfilled' && wikipediaRes.value?.results?.length) {
        nextGroups.push({
          source: 'wikipedia',
          items: wikipediaRes.value.results
        });
      }

      if (metadataRes.status === 'fulfilled') {
        Object.entries(metadataRes.value)
          .filter(([, items]) => Array.isArray(items) && items.length > 0)
          .forEach(([source, items]) => {
            nextGroups.push({
              source,
              items: items as any[]
            });
          });
      }

      const uniqueGroups = Array.from(
        new Map(nextGroups.map((group) => [group.source, group])).values()
      );

      setGroups(uniqueGroups);
    } catch (error) {
      console.error(error);
      alert('Backend-ul nu răspunde. Verifică dacă API-ul rulează pe portul 4000.');
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
    <section className="p-6 md:p-8">
      <h1 className="text-4xl font-black md:text-5xl">Căutare Universală</h1>

      <p className="mt-3 text-white/60">
        Caută în Algolia, Neon/PostgreSQL, OMDb, TMDB, YouTube, TVMaze, Jikan,
        Kitsu, iTunes, OpenLibrary, TheAudioDB, TheSportsDB și alte surse.
      </p>

      <div className="mt-6 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Ex: YouTube, Naruto, Iron Man, Arsenal..."
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 outline-none focus:border-[#6A4CFF]"
        />

        <button onClick={search} className="rounded-2xl bg-[#6A4CFF] px-6 font-bold">
          {loading ? '...' : 'Caută'}
        </button>
      </div>

      {groups.length === 0 && !loading && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
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
          const href = `/title/${source}/${encodeURIComponent(card.id || i)}`;

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

                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-black/30 px-3 py-1 text-xs">
                    {source}
                  </span>

                  <button
                    onClick={() => {
                      const saved = JSON.parse(localStorage.getItem('streamverse_library') || '[]');
                      localStorage.setItem('streamverse_library', JSON.stringify([...saved, card]));
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
  if (source === 'algolia') {
    return {
      id: item.id || item.objectID,
      title: item.title || 'Algolia result',
      subtitle: `${item.type || 'custom'} • ${item.sourcesCount || 0} surse`,
      image: item.poster || null
    };
  }

  if (source === 'omdb') {
    return {
      id: item.imdbID,
      title: item.Title,
      subtitle: `${item.Year || ''} • ${item.Type || ''}`,
      image: item.Poster && item.Poster !== 'N/A' ? item.Poster : null
    };
  }

  if (source === 'tmdb') {
    return {
      id: item.id,
      title: item.title || item.name || item.original_title || item.original_name,
      subtitle: `${item.media_type || ''} • ${item.release_date || item.first_air_date || ''}`,
      image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null
    };
  }

  if (source === 'youtube') {
    return {
      id: item.id?.videoId,
      title: item.snippet?.title,
      subtitle: item.snippet?.channelTitle,
      image: item.snippet?.thumbnails?.medium?.url
    };
  }

  if (source === 'tvmaze') {
    const show = item.show || item;
    return {
      id: show.id,
      title: show.name,
      subtitle: `${show.type || ''} • ${show.premiered || ''}`,
      image: show.image?.medium || show.image?.original
    };
  }

  if (source === 'jikan') {
    return {
      id: item.mal_id,
      title: item.title_english || item.title,
      subtitle: `${item.type || ''} • ${item.year || item.aired?.string || ''}`,
      image: item.images?.jpg?.image_url || item.images?.webp?.image_url
    };
  }

  if (source === 'kitsu') {
    return {
      id: item.id,
      title: item.attributes?.canonicalTitle,
      subtitle: `${item.attributes?.subtype || ''} • ${item.attributes?.startDate || ''}`,
      image: item.attributes?.posterImage?.medium || item.attributes?.posterImage?.large
    };
  }

  if (source === 'wikipedia') {
    return {
      id: item.pageid,
      title: item.title || 'Wikipedia result',
      subtitle: item.snippet ? item.snippet.replace(/<[^>]+>/g, '') : 'Wikipedia',
      image: null
    };
  }

  if (source === 'deezer') {
    return {
      id: item.id,
      title: item.title || 'Deezer track',
      subtitle: `${item.artist?.name || ''} • ${item.album?.title || ''}`,
      image: item.album?.cover_medium || item.album?.cover_big || item.artist?.picture_medium || null
    };
  }

  return {
    id: item.id || item.objectID || Math.random(),
    title: item.title || item.name || item.Title || 'Rezultat',
    subtitle: item.type || source,
    image: item.image || item.poster || item.thumbnail || null
  };
}
