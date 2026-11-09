'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { deleteMediaAction, mediaUsagesAction, syncMediaFromContentAction, updateMediaAltAction, uploadMediaAction, type MediaItem } from '@/actions/admin/media.actions';
import { ConfirmDialog, useToast } from './feedback';
import { Btn, inputCls } from './ui';

const FOLDERS: [string, string][] = [['medias', 'Médias'], ['pages', 'Pages'], ['services', 'Services'], ['villes', 'Villes'], ['realisations', 'Réalisations'], ['articles', 'Articles'], ['presse', 'Presse'], ['equipe', 'Équipe'], ['logos', 'Logos']];

export default function MediaLibrary({ items: initial, can }: { items: MediaItem[]; can: { upload: boolean; delete: boolean } }) {
  const router = useRouter();
  const { say, node: toast } = useToast();
  const [items, setItems] = useState(initial);
  const [folder, setFolder] = useState('Tous');
  const [query, setQuery] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [current, setCurrentItem] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState('');
  const [usedBy, setUsedBy] = useState<string[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [drag, setDrag] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('medias');
  const [busy, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  // Colonne de détail à droite à partir de 960 px (maquette), dessous sur écran étroit.
  const wide = useSyncExternalStore(
    (cb) => { const m = window.matchMedia('(min-width: 960px)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia('(min-width: 960px)').matches,
    () => true,
  );
  useEffect(() => { if (current && !wide) asideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [current, wide]);
  const copyUrl = async () => {
    if (!current) return;
    const abs = new URL(current.url, window.location.origin).href;
    try { await navigator.clipboard.writeText(abs); say('Adresse de l’image copiée.'); } catch { say('Copie impossible : sélectionnez l’adresse affichée et copiez-la.', true); }
  };

  // Liste rechargée par le serveur (router.refresh) : on repart des données reçues.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) { setLastInitial(initial); setItems(initial); }
  const setCurrent = (m: MediaItem | null) => { setCurrentItem(m); if (m) { setAlt(m.alt ?? ''); setUsedBy(null); } };
  useEffect(() => {
    if (!current) return;
    let alive = true;
    mediaUsagesAction(current.id).then((u) => alive && setUsedBy(u)).catch(() => alive && setUsedBy([]));
    return () => { alive = false; };
  }, [current]);

  const folders = useMemo(() => ['Tous', ...Array.from(new Set(items.map((i) => i.folder ?? 'medias')))], [items]);
  const missing = items.filter((i) => !i.alt).length;
  const shown = items.filter((i) => (folder === 'Tous' || (i.folder ?? 'medias') === folder) && (!onlyMissing || !i.alt)
    && (!query.trim() || `${i.filename} ${i.alt ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())));
  const folderLabel = (f: string) => FOLDERS.find(([k]) => k === f)?.[1] ?? f;

  const upload = (files: FileList | null) => {
    if (!files?.length || !can.upload) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    fd.set('folder', uploadFolder);
    start(async () => {
      const res = await uploadMediaAction(fd);
      if (!res.ok) { say(res.message, true); return; }
      setItems((prev) => [...res.items, ...prev]);
      say(res.errors.length ? `${res.items.length} image(s) ajoutée(s). ${res.errors.join(' ')}` : `${res.items.length} image(s) ajoutée(s).`, res.errors.length > 0);
      router.refresh();
    });
  };

  const saveAlt = () => current && start(async () => {
    const m = await updateMediaAltAction(current.id, alt);
    setItems((prev) => prev.map((i) => (i.id === m.id ? m : i)));
    setCurrentItem(m);
    say('Texte alternatif enregistré.');
  });
  const remove = (force: boolean) => current && start(async () => {
    const res = await deleteMediaAction(current.id, force);
    if (!res.ok && res.usedBy) { setUsedBy(res.usedBy); setConfirm(true); return; }
    say(res.message, !res.ok);
    setConfirm(false);
    if (res.ok) { setItems((prev) => prev.filter((i) => i.id !== current.id)); setCurrent(null); }
  });
  const sync = () => start(async () => {
    const res = await syncMediaFromContentAction();
    say(res.added ? `${res.added} image(s) du site ajoutée(s) à la bibliothèque.` : 'Toutes les images du site sont déjà recensées.');
    router.refresh();
  });

  return (
    <div className="grid items-start gap-6" style={{ gridTemplateColumns: wide && current ? 'minmax(0,1fr) 320px' : 'minmax(0,1fr)' }}>
      <div className="min-w-0">
      {can.upload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          className={`mb-4 rounded-lg border-[1.5px] border-dashed px-4 py-[26px] text-center text-zinc-700 transition-colors hover:border-[#06226D] hover:bg-[#f5f8fd] ${drag ? 'border-[#06226D] bg-[#f5f8fd]' : 'border-zinc-300 bg-[#fafafa]'}`}>
          <input ref={fileRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.heic,.heif" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="border-0 bg-transparent text-[15px] font-semibold text-zinc-700 hover:underline">
            {busy ? 'Traitement en cours…' : 'Glissez vos images ici ou cliquez pour importer'}
          </button>
          <p className="m-0 mt-1 text-[13px] text-gray-500">JPG, PNG, WebP, AVIF ou HEIC (iPhone) · 15 Mo maximum · converties en WebP, rotation corrigée, localisation GPS supprimée</p>
          <label className="mt-2 inline-flex items-center gap-2 text-[13px] text-zinc-600">Dossier
            <select className={`${inputCls} w-auto py-1`} value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}>{FOLDERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <button key={f} type="button" onClick={() => setFolder(f)} aria-pressed={folder === f}
            className={`rounded-full border px-3 py-[5px] text-[13px] ${folder === f ? 'border-[#06226D] bg-[#06226D] text-white' : 'border-gray-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}>{f === 'Tous' ? 'Tous' : folderLabel(f)}</button>
        ))}
        <label className="ml-2 inline-flex items-center gap-1.5 text-[13px] text-zinc-700"><input type="checkbox" className="accent-[#06226D]" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />Sans texte alternatif ({missing})</label>
        <input type="search" className={`${inputCls} ml-auto max-w-[240px]`} placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher une image" />
        {can.upload && <Btn size="sm" onClick={sync} disabled={busy}>Recenser les images du site</Btn>}
      </div>

      {!shown.length ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-[14px] text-gray-500">
          {items.length ? 'Aucune image pour ces filtres.' : 'La bibliothèque est vide. Importez des images ou cliquez sur « Recenser les images du site » pour ajouter celles déjà utilisées.'}
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 p-0">
          {shown.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setCurrent(m)} aria-pressed={current?.id === m.id} className={`block w-full overflow-hidden rounded-lg border bg-white p-0 text-left text-black ${current?.id === m.id ? 'border-[#06226D] shadow-[0_0_0_2px_#06226D]' : 'border-gray-200 hover:border-zinc-400'}`}>
                <span className="block aspect-[4/3] bg-[#f4f4f5]"><img src={m.url} alt={m.alt ?? ''} className={`h-full w-full ${m.url.endsWith('.svg') ? 'object-contain p-4' : 'object-cover'}`} loading="lazy" /></span>
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-[13px] font-medium">{m.filename}</span>
                  {m.alt ? <span className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[#15803d]">Texte alternatif <Check className="h-3 w-3" /></span> : <span className="mt-0.5 block text-[12px] text-[#c2410c]">Texte alternatif manquant</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      </div>

      {current && (
        <aside ref={asideRef} aria-labelledby="media-title" className={`flex min-w-0 flex-col gap-3.5 rounded-lg border border-gray-200 bg-white p-4 ${wide ? 'sticky top-[132px]' : ''}`}>
          <div className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-md bg-[#f4f4f5]">
            <img src={current.url} alt={current.alt ?? ''} className={`h-full w-full ${current.url.endsWith('.svg') ? 'object-contain p-6' : 'object-cover'}`} />
            <button type="button" onClick={() => setCurrent(null)} className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-white/90 text-zinc-700 hover:bg-white" aria-label="Fermer le détail"><X className="h-4 w-4" /></button>
          </div>
          <div>
            <h2 id="media-title" className="m-0 break-all text-[14px] font-semibold">{current.filename}</h2>
            <p className="m-0 mt-0.5 text-[12.5px] text-gray-500">Dossier : {folderLabel(current.folder ?? 'medias')}{current.width && current.height ? ` · ${current.width} × ${current.height}` : ''}{current.size ? ` · ${Math.round(current.size / 1024)} Ko` : ''}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="media-alt" className="text-[14px] font-medium leading-[1.35]">Texte alternatif</label>
            <textarea id="media-alt" rows={3} maxLength={200} className={inputCls} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Décrivez l’image en une phrase (ex. : Agent ASPEO nettoyant une vitre de bureau)" disabled={!can.upload} />
            <p className="m-0 text-[12.5px] leading-[1.45] text-gray-500">Lu par les lecteurs d’écran et par Google. Ne commencez pas par « image de ».</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="media-url" className="text-[14px] font-medium leading-[1.35]">Adresse</label>
            <input id="media-url" readOnly className={`${inputCls} font-mono text-[12px]`} value={current.url} onFocus={(e) => e.target.select()} />
          </div>
          <div>
            <div className="mb-1.5 text-[13px] font-medium">Utilisée sur</div>
            {usedBy === null ? <p className="m-0 text-[12.5px] text-gray-500">Recherche…</p>
              : usedBy.length ? <div className="flex flex-wrap gap-1.5">{usedBy.map((u) => <span key={u} className="rounded-full bg-[#f4f4f5] px-2.5 py-[3px] text-[12.5px] text-zinc-700">{u}</span>)}</div>
              : <p className="m-0 text-[12.5px] text-gray-500">Aucun contenu n’utilise cette image.</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {can.upload && <button type="button" onClick={saveAlt} disabled={busy} className="rounded-md border border-[#06226D] bg-[#06226D] px-3.5 py-2 text-[13.5px] font-medium text-white hover:bg-[#0a2f8f] disabled:opacity-60">Enregistrer</button>}
            <button type="button" onClick={copyUrl} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[13.5px] text-black hover:bg-[#f4f4f5]">Copier l’URL</button>
            {can.delete && <Btn variant="dangerGhost" size="sm" onClick={() => remove(false)} disabled={busy} className="ml-auto">Supprimer</Btn>}
          </div>
        </aside>
      )}
      <ConfirmDialog open={confirm} busy={busy} title="Cette image est utilisée" confirmLabel="Supprimer quand même" onCancel={() => setConfirm(false)} onConfirm={() => remove(true)}>
        <p className="m-0">Elle apparaît dans : {usedBy?.join(', ')}. Si vous la supprimez, elle disparaîtra de ces contenus.</p>
      </ConfirmDialog>
      {toast}
    </div>
  );
}
