'use client';

/* eslint-disable @next/next/no-img-element -- bibliothèque d'images (URL variables) */
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
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
  const [current, setCurrent] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState('');
  const [usedBy, setUsedBy] = useState<string[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [drag, setDrag] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('medias');
  const [busy, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setItems(initial), [initial]);
  useEffect(() => {
    if (!current) return;
    setAlt(current.alt ?? '');
    setUsedBy(null);
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
    setCurrent(null);
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
    <div>
      {can.upload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          className={`mb-5 rounded-lg border border-dashed px-4 py-6 text-center ${drag ? 'border-[#06226D] bg-blue-50/50' : 'border-zinc-300 bg-white'}`}>
          <input ref={fileRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.heic,.heif" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="border-0 bg-transparent text-[15px] font-semibold text-zinc-800 hover:underline">
            {busy ? 'Traitement en cours…' : 'Glissez vos images ici ou cliquez pour importer'}
          </button>
          <p className="m-0 mt-1 text-[13px] text-zinc-500">JPG, PNG, WebP, AVIF ou HEIC (iPhone) · 15 Mo maximum · converties en WebP, rotation corrigée, localisation GPS supprimée</p>
          <label className="mt-2 inline-flex items-center gap-2 text-[13px] text-zinc-600">Dossier
            <select className={`${inputCls} w-auto py-1`} value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}>{FOLDERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <button key={f} type="button" onClick={() => setFolder(f)} aria-pressed={folder === f}
            className={`rounded-full border px-3.5 py-1.5 text-[13.5px] ${folder === f ? 'border-[#06226D] bg-[#06226D] font-medium text-white' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>{f === 'Tous' ? 'Tous' : folderLabel(f)}</button>
        ))}
        <label className="ml-2 inline-flex items-center gap-1.5 text-[13.5px] text-zinc-700"><input type="checkbox" className="accent-[#06226D]" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />Sans texte alternatif ({missing})</label>
        <input type="search" className={`${inputCls} ml-auto max-w-[240px]`} placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher une image" />
        {can.upload && <Btn size="sm" onClick={sync} disabled={busy}>Recenser les images du site</Btn>}
      </div>

      {!shown.length ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-[14px] text-zinc-500">
          {items.length ? 'Aucune image pour ces filtres.' : 'La bibliothèque est vide. Importez des images ou cliquez sur « Recenser les images du site » pour ajouter celles déjà utilisées.'}
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {shown.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setCurrent(m)} className="block w-full overflow-hidden rounded-lg border border-zinc-200 bg-white p-0 text-left hover:border-zinc-400">
                <span className="block aspect-[4/3] bg-zinc-100"><img src={m.url} alt={m.alt ?? ''} className={`h-full w-full ${m.url.endsWith('.svg') ? 'object-contain p-4' : 'object-cover'}`} loading="lazy" /></span>
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-[13.5px] font-medium">{m.filename}</span>
                  {m.alt ? <span className="inline-flex items-center gap-1 text-[12.5px] text-green-700">Texte alternatif <Check className="h-3 w-3" /></span> : <span className="text-[12.5px] text-[#C74700]">Texte alternatif manquant</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {current && (
        <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-labelledby="media-title">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCurrent(null)} aria-hidden="true" />
          <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-[460px] flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
              <div className="min-w-0"><h2 id="media-title" className="m-0 truncate text-[17px] font-semibold">{current.filename}</h2>
                <p className="m-0 text-[13px] text-zinc-500">{[current.width && current.height ? `${current.width} × ${current.height}` : null, current.size ? `${Math.round(current.size / 1024)} Ko` : null, folderLabel(current.folder ?? 'medias')].filter(Boolean).join(' · ')}</p></div>
              <button type="button" onClick={() => setCurrent(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100" aria-label="Fermer"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 overflow-hidden rounded-md bg-zinc-100"><img src={current.url} alt={current.alt ?? ''} className="max-h-[260px] w-full object-contain" /></div>
              <label htmlFor="media-alt" className="mb-1.5 block text-[14px] font-medium">Texte alternatif</label>
              <textarea id="media-alt" rows={3} maxLength={200} className={inputCls} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Décrivez l’image en une phrase (ex. : Agent ASPEO nettoyant une vitre de bureau)" disabled={!can.upload} />
              <p className="m-0 mt-1 text-[12.5px] text-zinc-500">Lu par les lecteurs d’écran et par Google. Ne commencez pas par « image de ».</p>
              <label htmlFor="media-url" className="mb-1.5 mt-4 block text-[14px] font-medium">Adresse</label>
              <input id="media-url" readOnly className={`${inputCls} font-mono text-[12px]`} value={current.url} onFocus={(e) => e.target.select()} />
              <h3 className="mb-1.5 mt-5 text-[14px] font-semibold">Utilisée par</h3>
              {usedBy === null ? <p className="m-0 text-[13.5px] text-zinc-500">Recherche…</p> : usedBy.length ? <ul className="m-0 pl-5 text-[14px]">{usedBy.map((u) => <li key={u}>{u}</li>)}</ul> : <p className="m-0 text-[13.5px] text-zinc-500">Aucun contenu n’utilise cette image.</p>}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-3">
              {can.delete ? <Btn variant="dangerGhost" onClick={() => remove(false)} disabled={busy}>Supprimer</Btn> : <span />}
              <div className="flex gap-2"><Btn onClick={() => setCurrent(null)}>Fermer</Btn>{can.upload && <Btn variant="primary" onClick={saveAlt} disabled={busy}>Enregistrer</Btn>}</div>
            </div>
          </aside>
        </div>
      )}
      <ConfirmDialog open={confirm} busy={busy} title="Cette image est utilisée" confirmLabel="Supprimer quand même" onCancel={() => setConfirm(false)} onConfirm={() => remove(true)}>
        <p className="m-0">Elle apparaît dans : {usedBy?.join(', ')}. Si vous la supprimez, elle disparaîtra de ces contenus.</p>
      </ConfirmDialog>
      {toast}
    </div>
  );
}
