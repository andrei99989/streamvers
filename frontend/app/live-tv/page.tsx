'use client';

import { useState } from 'react';
import { Tv, Radio, Play, Search } from 'lucide-react';

const channels = [
  { name: 'Live News', group: 'News', logo: '📰', url: 'https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw' },
  { name: 'Cinema Live', group: 'Movies', logo: '🎬', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { name: 'Anime Live', group: 'Anime', logo: '🇯🇵', url: '' },
  { name: 'Sports Live', group: 'Sports', logo: '⚽', url: 'https://www.youtube.com/embed/aqz-KE-bpKQ' },
  { name: 'Music Live', group: 'Music', logo: '🎵', url: 'https://www.youtube.com/embed/tgbNymZ7vqY' },
  { name: 'Kids Live', group: 'Kids', logo: '🧸', url: 'https://www.youtube.com/embed/ysz5S6PUM-U' },
];

const groups = ['All', 'News', 'Movies', 'Anime', 'Sports', 'Music', 'Kids'];

export default function LiveTVPage() {
  const [active, setActive] = useState(channels[0]);
  const [group, setGroup] = useState('All');
  const [q, setQ] = useState('');

  const filtered = channels.filter((c) => {
    const byGroup = group === 'All' || c.group === group;
    const byQuery = c.name.toLowerCase().includes(q.toLowerCase());
    return byGroup && byQuery;
  });

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          LIVE ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Tv />
          Live TV
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Hub pentru canale live, playlisturi M3U, iframe-uri externe și surse HLS.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="aspect-video bg-black">
              <iframe
                src={active.url}
                title={active.name}
                className="h-full w-full"
                allowFullScreen
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-3xl font-black">{active.name}</h2>
                <p className="text-white/50">{active.group}</p>
              </div>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black">
                <Play size={18} />
                Watching
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Radio />
            <h2 className="text-2xl font-black">Channels</h2>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Caută canal..."
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`rounded-full px-3 py-2 text-xs font-black ${
                  group === g ? 'bg-[#00E0A8] text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((channel) => (
              <button
                key={channel.name}
                onClick={() => setActive(channel)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  active.name === channel.name ? 'bg-[#6A4CFF]' : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <span className="text-2xl">{channel.logo}</span>
                <span>
                  <span className="block font-black">{channel.name}</span>
                  <span className="text-xs text-white/50">{channel.group}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
