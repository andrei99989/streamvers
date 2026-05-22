'use client';

import { useEffect, useState } from 'react';
import { apiDelete, apiFetch, apiPost, apiPatch } from '../../lib/apiClient';
import { Activity, Boxes, Download, Power, Trash2 } from 'lucide-react';

export default function AddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const [manifestUrl, setManifestUrl] = useState('');
  const [message, setMessage] = useState('');
  const [catalogView, setCatalogView] = useState<any>(null);
  const [catalogItems, setCatalogItems] = useState<any>(null);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  async function loadAddons() {
    try {
      const data = await apiFetch('/addons');
      setAddons(data.items || []);
    } catch {
      setAddons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddons();
  }, []);

  async function createAddon() {
    if (!name.trim()) return;

    try {
      const created = await apiPost('/addons', {
        name,
        url,
      });

      setAddons([created, ...addons]);
      setName('');
      setUrl('');

      showMessage('✅ Addon creat');
    } catch {
      showMessage('❌ Eroare creare addon');
    }
  }

  async function installManifest() {
    if (!manifestUrl.trim()) return;

    try {
      const created = await apiPost('/addons/install', {
        manifestUrl,
      });

      setAddons([created, ...addons]);
      setManifestUrl('');

      showMessage('✅ Manifest instalat');
    } catch {
      showMessage('❌ Manifest invalid');
    }
  }

  async function toggleAddon(id: number) {
    try {
      const updated = await apiPatch(`/addons/${id}/toggle`, {});

      setAddons(
        addons.map((addon) =>
          addon.id === id ? updated : addon
        )
      );

      showMessage('✅ Status actualizat');
    } catch {
      showMessage('❌ Toggle eșuat');
    }
  }

  async function openCatalog(type: string, catalogId: string) {
    if (!catalogView?.addon?.id) return;

    try {
      const data = await apiFetch(`/addons/${catalogView.addon.id}/catalog/${type}/${catalogId}`);
      setCatalogItems(data);
      showMessage('✅ Catalog deschis');
    } catch {
      showMessage('❌ Nu am putut deschide catalogul');
    }
  }

  async function loadCatalogs(id: number) {
    try {
      const data = await apiFetch(`/addons/${id}/catalogs`);
      setCatalogView(data);
      showMessage('✅ Cataloage încărcate');
    } catch {
      showMessage('❌ Nu am putut încărca cataloagele');
    }
  }

  async function checkHealth(id: number) {
    try {
      const result = await apiPost(`/addons/${id}/health`, {});

      setAddons(
        addons.map((addon) =>
          addon.id === id
            ? {
                ...addon,
                metadata: {
                  ...(addon.metadata || {}),
                  health: result,
                },
                last_checked_at: new Date().toISOString(),
              }
            : addon
        )
      );

      showMessage(result.ok ? '✅ Addon sănătos' : '⚠️ Addon are probleme');
    } catch {
      showMessage('❌ Health check eșuat');
    }
  }

  async function removeAddon(id: number) {
    try {
      await apiDelete(`/addons/${id}`);

      setAddons(addons.filter((x) => x.id !== id));

      showMessage('✅ Addon șters');
    } catch {
      showMessage('❌ Delete eșuat');
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10">
      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 px-6 py-4 font-black shadow-2xl backdrop-blur-xl">
          {message}
        </div>
      )}

      <div className="mb-10 flex items-center gap-4">
        <div className="rounded-3xl bg-[#6A4CFF]/20 p-4">
          <Boxes className="text-[#B8A7FF]" size={34} />
        </div>

        <div>
          <h1 className="text-5xl font-black">Addons</h1>
          <p className="mt-2 text-white/60">
            StreamVerse addon ecosystem
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="mb-5 text-2xl font-black">
            Create Addon
          </h2>

          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Addon name"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
            />

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Manifest URL"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
            />

            <button
              onClick={createAddon}
              className="rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black"
            >
              Create
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="mb-5 text-2xl font-black">
            Install Manifest
          </h2>

          <div className="space-y-4">
            <input
              value={manifestUrl}
              onChange={(e) => setManifestUrl(e.target.value)}
              placeholder="https://addon.com/manifest.json"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
            />

            <button
              onClick={installManifest}
              className="flex items-center gap-2 rounded-2xl bg-[#00E0A8] px-6 py-4 font-black text-black"
            >
              <Download size={18} />
              Install
            </button>
          </div>
        </div>
      </section>

      {catalogView && (
        <section className="mt-10 rounded-[2rem] border border-[#6A4CFF]/30 bg-[#6A4CFF]/10 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Catalog Browser</h2>
              <p className="mt-2 text-white/60">
                {catalogView.addon?.name} • {catalogView.catalogs?.length || 0} catalogs
              </p>
            </div>

            <button
              onClick={() => setCatalogView(null)}
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(catalogView.catalogs || []).map((catalog: any, index: number) => (
              <div
                key={`${catalog.type}-${catalog.id}-${index}`}
                className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5"
              >
                <div className="mb-2 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase">
                  {catalog.type}
                </div>

                <h3 className="text-xl font-black">{catalog.name}</h3>

                <div className="mt-2 text-sm text-white/50">
                  ID: {catalog.id}
                </div>

                <div className="mt-3 text-xs text-white/50">
                  Genres: {(catalog.genres || []).slice(0, 6).join(', ') || 'N/A'}
                  {(catalog.genres || []).length > 6 ? '...' : ''}
                </div>

                <div className="mt-3 text-xs text-white/50">
                  Extra: {(catalog.extraSupported || []).join(', ') || 'N/A'}
                </div>

                <button
                  onClick={() => openCatalog(catalog.type, catalog.id)}
                  className="mt-4 rounded-2xl bg-[#6A4CFF] px-5 py-3 text-sm font-black"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

{catalogItems && (
        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Catalog Items</h2>
              <p className="mt-2 text-white/60">
                {catalogItems.addon?.name} • {(catalogItems.metas || []).length} items
              </p>
            </div>

            <button
              onClick={() => setCatalogItems(null)}
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold"
            >
              Close
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
            {(catalogItems.metas || []).map((item: any) => (
              <a
                key={item.id}
                href={`/title/imdb/${item.id}`}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30"
              >
                {item.poster ? (
                  <img src={item.poster} alt={item.name} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-white/5 text-white/40">
                    No poster
                  </div>
                )}

                <div className="p-4">
                  <h3 className="line-clamp-2 font-black">{item.name}</h3>
                  <p className="mt-2 text-xs text-white/50">
                    {item.releaseInfo || 'N/A'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-5 text-3xl font-black">
          Installed Addons
        </h2>

        {loading ? (
          <div className="text-white/50">Loading addons...</div>
        ) : addons.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 p-10 text-center text-white/50">
            No addons installed
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black">
                      {addon.name}
                    </h3>

                    <div className="mt-2 text-sm text-white/50">
                      {addon.version || 'v1.0.0'}
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      addon.status === 'enabled'
                        ? 'bg-[#00E0A8]/20 text-[#00E0A8]'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {addon.status}
                  </div>
                </div>

                <div className="line-clamp-2 break-all text-sm text-white/50">
                  {addon.url || 'Local addon'}
                </div>

                {addon.manifest && Object.keys(addon.manifest).length > 0 && (
                  <div className="mt-4 rounded-2xl border border-[#6A4CFF]/30 bg-[#6A4CFF]/10 p-4 text-xs text-white/70">
                    <div className="mb-2 font-black text-white">Manifest Info</div>

                    <div>Resources: {(addon.manifest.resources || []).join(', ') || 'N/A'}</div>
                    <div>Types: {(addon.manifest.types || []).join(', ') || 'N/A'}</div>
                    <div>Catalogs: {(addon.manifest.catalogs || []).length}</div>
                    <div>ID Prefixes: {(addon.manifest.idPrefixes || []).join(', ') || 'N/A'}</div>
                  </div>
                )}

                {addon.metadata?.health && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/60">
                    <div className="font-black text-white">Health</div>
                    <div>OK: {String(addon.metadata.health.ok)}</div>
                    <div>Status: {addon.metadata.health.status || addon.metadata.health.error || 'N/A'}</div>
                    <div>Latency: {addon.metadata.health.latencyMs || 0}ms</div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => loadCatalogs(addon.id)}
                    className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF]/30 px-5 py-3 font-bold text-[#B8A7FF]"
                  >
                    Catalogs
                  </button>

                  <button
                    onClick={() => checkHealth(addon.id)}
                    className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold"
                  >
                    <Activity size={16} />
                    Health
                  </button>

                  <button
                    onClick={() => toggleAddon(addon.id)}
                    className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold"
                  >
                    <Power size={16} />
                    Toggle
                  </button>

                  <button
                    onClick={() => removeAddon(addon.id)}
                    className="flex items-center gap-2 rounded-2xl bg-red-500/20 px-5 py-3 font-bold text-red-300"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
