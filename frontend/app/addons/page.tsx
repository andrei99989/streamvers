'use client';

import { useEffect, useState } from 'react';
import { apiDelete, apiFetch, apiPatch, apiPost } from '../../lib/apiClient';
import {
  Activity,
  Boxes,
  Download,
  Eye,
  FileJson,
  Power,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';

export default function AddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [manifestUrl, setManifestUrl] = useState('http://localhost:4000/stremio-addon/manifest.json');

  const [message, setMessage] = useState('');
  const [catalogView, setCatalogView] = useState<any>(null);
  const [catalogItems, setCatalogItems] = useState<any>(null);
  const [metaView, setMetaView] = useState<any>(null);

  const [testType, setTestType] = useState('movie');
  const [testMetaId, setTestMetaId] = useState('tt0468569');

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
      const created = await apiPost('/addons', { name, url });
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
      const created = await apiPost('/addons/install', { manifestUrl });
      setAddons([created, ...addons]);
      showMessage('✅ Manifest instalat');
    } catch (error: any) {
      showMessage(`❌ Manifest invalid: ${error?.message || 'unknown error'}`);
      console.error('Install manifest failed:', error);
    }
  }

  async function toggleAddon(id: number) {
    try {
      const updated = await apiPatch(`/addons/${id}/toggle`, {});
      setAddons(addons.map((addon) => (addon.id === id ? updated : addon)));
      showMessage('✅ Status actualizat');
    } catch {
      showMessage('❌ Toggle eșuat');
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
              }
            : addon
        )
      );
      showMessage(result.ok ? '✅ Addon sănătos' : '⚠️ Addon are probleme');
    } catch {
      showMessage('❌ Health check eșuat');
    }
  }

  async function loadCatalogs(id: number) {
    try {
      const data = await apiFetch(`/addons/${id}/catalogs`);
      setCatalogView(data);
      setCatalogItems(null);
      setMetaView(null);
      showMessage('✅ Cataloage încărcate');
    } catch {
      showMessage('❌ Nu am putut încărca cataloagele');
    }
  }

  async function openCatalog(type: string, catalogId: string) {
    if (!catalogView?.addon?.id) return;

    try {
      const data = await apiFetch(`/addons/${catalogView.addon.id}/catalog/${type}/${catalogId}`);
      setCatalogItems(data);
      setMetaView(null);
      showMessage('✅ Catalog deschis');
    } catch {
      showMessage('❌ Nu am putut deschide catalogul');
    }
  }

  async function openMeta(addonId: number, type = testType, metaId = testMetaId) {
    if (!metaId.trim()) return;

    try {
      const data = await apiFetch(`/addons/${addonId}/meta/${type}/${metaId}`);
      setMetaView(data);
      showMessage('✅ Meta încărcat');
    } catch {
      showMessage('❌ Meta fetch eșuat');
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
            Install, test and browse Stremio-like addon manifests.
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="mb-5 text-2xl font-black">Create Addon</h2>

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

        <div className="rounded-[2rem] border border-[#00E0A8]/20 bg-[#00E0A8]/10 p-6">
          <h2 className="mb-5 text-2xl font-black">Install Manifest</h2>

          <div className="space-y-4">
            <input
              value={manifestUrl}
              onChange={(e) => setManifestUrl(e.target.value)}
              placeholder="http://localhost:4000/stremio-addon/manifest.json"
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

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">Installed Addons</h2>
            <p className="mt-2 text-white/60">
              {loading ? 'Loading...' : `${addons.length} addons installed`}
            </p>
          </div>

          <button
            onClick={loadAddons}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid gap-5">
          {addons.map((addon) => {
            const health = addon.metadata?.health;

            return (
              <div
                key={addon.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black">{addon.name}</h3>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/60">
                        {addon.version || 'v?'}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                          addon.status === 'enabled'
                            ? 'bg-[#00E0A8]/20 text-[#00E0A8]'
                            : 'bg-red-500/20 text-red-200'
                        }`}
                      >
                        {addon.status}
                      </span>
                    </div>

                    <div className="mt-2 break-all text-sm text-white/50">
                      {addon.url || 'No manifest URL'}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/50">
                      <span>{addon.manifest?.resources?.length || 0} resources</span>
                      <span>•</span>
                      <span>{addon.manifest?.catalogs?.length || 0} catalogs</span>
                      <span>•</span>
                      <span>{addon.manifest?.types?.join(', ') || 'no types'}</span>
                      {health && (
                        <>
                          <span>•</span>
                          <span>{health.ok ? 'healthy' : 'unhealthy'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => loadCatalogs(addon.id)}
                      className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-4 py-3 text-sm font-black"
                    >
                      <Eye size={15} />
                      Catalogs
                    </button>

                    <button
                      onClick={() => checkHealth(addon.id)}
                      className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black"
                    >
                      <Activity size={15} />
                      Health
                    </button>

                    <button
                      onClick={() => toggleAddon(addon.id)}
                      className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black"
                    >
                      <Power size={15} />
                      Toggle
                    </button>

                    <button
                      onClick={() => removeAddon(addon.id)}
                      className="flex items-center gap-2 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-black text-red-100"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              onClick={() => {
                setCatalogView(null);
                setCatalogItems(null);
              }}
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

                <button
                  onClick={() => openCatalog(catalog.type, catalog.id)}
                  className="mt-4 rounded-2xl bg-[#6A4CFF] px-5 py-3 text-sm font-black"
                >
                  Open Catalog
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-[2rem] border border-[#00E0A8]/20 bg-[#00E0A8]/10 p-6">
        <h2 className="mb-5 text-3xl font-black">
          Meta Tester
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            placeholder="movie"
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
          />

          <input
            value={testMetaId}
            onChange={(e) => setTestMetaId(e.target.value)}
            placeholder="tt0468569"
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
          />

          <button
            onClick={() => {
              if (addons[0]) {
                openMeta(addons[0].id);
              }
            }}
            className="rounded-2xl bg-[#00E0A8] px-6 py-4 font-black text-black"
          >
            Fetch Meta
          </button>
        </div>
      </section>

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
            {(catalogItems.metas || []).map((item: any, index: number) => (
              <button
                key={`${item.id}-${index}`}
                onClick={() => openMeta(catalogItems.addon?.id, item.type || 'movie', item.id)}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30 text-left transition hover:border-[#6A4CFF]"
              >
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.name}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-white/5 text-white/40">
                    No poster
                  </div>
                )}

                <div className="p-4">
                  <h3 className="line-clamp-2 font-black">{item.name}</h3>
                  <p className="mt-2 text-xs text-white/50">
                    {item.releaseInfo || item.type || 'N/A'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {metaView && (
        <section className="mt-10 rounded-[2rem] border border-[#6A4CFF]/20 bg-[#6A4CFF]/10 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Meta Result</h2>
              <p className="mt-2 text-white/60">
                {metaView.addon?.name} • {metaView.meta?.id}
              </p>
            </div>

            <button
              onClick={() => setMetaView(null)}
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold"
            >
              Close
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            {metaView.meta?.poster ? (
              <img
                src={metaView.meta.poster}
                alt={metaView.meta.name}
                className="w-full rounded-[1.5rem]"
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-[1.5rem] bg-black/40 text-white/40">
                No poster
              </div>
            )}

            <div>
              <h3 className="text-4xl font-black">{metaView.meta?.name}</h3>

              <p className="mt-4 text-white/60">
                {metaView.meta?.description || 'No description'}
              </p>

              <pre className="mt-6 max-h-96 overflow-auto rounded-2xl bg-black/50 p-4 text-xs text-white/60">
                {JSON.stringify(metaView.meta, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
