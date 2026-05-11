'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import UniversalPlayer from '../../../components/UniversalPlayer';
import { API } from '../../../lib/api';

const demoSource = { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'iframe' as const, provider: 'youtube.com' };

export default function WatchPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (!params.id.startsWith('demo')) fetch(`${API}/stream/${params.id}`).then(r => r.json()).then(setData).catch(() => null); }, [params.id]);
  const source = data?.primary || demoSource;
  const movie = data?.movie || { title: 'Demo Stream', description: 'Preview player universal.' };
  return <main className="min-h-screen bg-ink pl-0 md:pl-20"><Sidebar />
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <UniversalPlayer source={source} title={movie.title} />
      <div><h1 className="text-4xl font-black">{movie.title}</h1><p className="mt-3 max-w-3xl text-white/60">{movie.description}</p></div>
    </section>
  </main>;
}
