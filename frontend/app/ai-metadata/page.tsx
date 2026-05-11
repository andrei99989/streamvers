'use client';

import { useEffect, useState } from 'react';
import { Brain, Database, Wand2 } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function AIMetadataPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/db/contents`)
      .then((r) => r.json())
      .then(setContents)
      .catch(() => setContents([]));
  }, []);

  async function loadMetadata(id: number) {
    setSelected(id);
    const res = await fetch(`${API}/ai-metadata/${id}`);
    const json = await res.json();
    setMetadata(json);
  }

  async function enrichMetadata() {
    if (!metadata?.id) return;

    const res = await fetch(`${API}/enrich/content/${metadata.id}`, {
      method: 'POST'
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error || 'Nu am putut face enrichment');
      return;
    }

    await fetch(`${API}/algolia/sync`, { method: 'POST' }).catch(() => null);
    alert('Auto-Enrich salvat în Neon + Algolia actualizat');
    loadMetadata(metadata.id);
  }


  async function saveMetadata() {
    if (!metadata?.id) return;

    const res = await fetch(`${API}/db/contents/${metadata.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: metadata.description,
        poster: metadata.poster,
        backdrop: metadata.backdrop,
        year: metadata.year,
        country: metadata.country,
        language: metadata.language,
        genres: metadata.genres,
        metadata: {
          ...(metadata.metadata || {}),
          aiSaved: true,
          aiReadyText: metadata.aiReadyText,
          enrichment: metadata.enrichment
        }
      })
    });

    if (!res.ok) {
      alert('Eroare la salvare metadata');
      return;
    }

    await fetch(`${API}/algolia/sync`, { method: 'POST' }).catch(() => null);
    alert('AI Metadata salvată în Neon + Algolia actualizat');
    loadMetadata(metadata.id);
  }

  return (
    <main className="min-h-screen bg-black p-3 text-white sm:p-6 md:p-10">
      <section className="mb-5 rounded-3xl border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-5 sm:p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          AI METADATA ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-3xl font-black sm:text-5xl">
          <Brain />
          AI Metadata
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-white/60 sm:text-base">
          Generează metadata AI-ready din Neon, surse URL/iframe și enrichment Wikipedia.
        </p>
      </section>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black sm:text-2xl">
            <Database />
            Content Neon
          </h2>

          <div className="space-y-3">
            {contents.map((item) => (
              <button
                key={item.id}
                onClick={() => loadMetadata(item.id)}
                className={`w-full rounded-2xl p-3 text-left sm:p-4 ${
                  selected === item.id ? 'bg-[#6A4CFF]' : 'bg-white/10'
                }`}
              >
                <div className="font-black">{item.title}</div>
                <div className="text-xs text-white/50">
                  ID {item.id} • {item.type} • {item.sources?.length || 0} surse
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black sm:text-2xl">
            <Wand2 />
            Metadata AI-ready
          </h2>

          {!metadata ? (
            <div className="text-white/50">Selectează un content din stânga.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm text-white/40">Title</div>
                  <div className="text-2xl font-black sm:text-3xl">{metadata.title}</div>
                </div>

                <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                  <button
                    onClick={enrichMetadata}
                    className="rounded-2xl bg-[#6A4CFF] px-5 py-4 font-black text-white text-lg sm:w-auto"
                  >
                    ✨ Auto-Enrich
                  </button>

                  <button
                    onClick={saveMetadata}
                    className="rounded-2xl bg-[#00E0A8] px-5 py-4 font-black text-black text-lg sm:w-auto"
                  >
                    💾 Save în Neon
                  </button>
                </div>
              </div>

              {metadata.poster && (
                <img src={metadata.poster} className="max-h-72 w-40 rounded-3xl object-cover sm:w-64" />
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <Box label="Type" value={metadata.type} />
                <Box label="Sources" value={metadata.sources?.length || 0} />
                <Box label="Language" value={metadata.language || 'N/A'} />
              </div>

              <div>
                <div className="mb-2 text-sm text-white/40">Description</div>
                <p className="rounded-2xl bg-black/40 p-4 text-white/70">
                  {metadata.description || 'Fără descriere'}
                </p>
              </div>

              <div>
                <div className="mb-2 text-sm text-white/40">AI Ready Text</div>
                <pre className="overflow-auto rounded-2xl bg-black/60 p-4 text-sm text-[#00E0A8]">
                  {metadata.aiReadyText}
                </pre>
              </div>

              <div>
                <div className="mb-2 text-sm text-white/40">JSON</div>
                <pre className="max-h-[420px] overflow-auto rounded-2xl bg-black/60 p-4 text-xs text-white/70">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Box({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-black/40 p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-base font-black sm:text-xl">{value}</div>
    </div>
  );
}
