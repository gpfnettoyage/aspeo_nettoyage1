'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { listMediaAction, uploadMediaAction, type MediaItem } from '@/actions/admin/media.actions';
import { Btn, inputCls } from './ui';

/**
 * Sélecteur d'images : bibliothèque (recherche) et téléversement (HEIC accepté, converti en WebP).
 * Une URL externe peut aussi être saisie (images déjà en ligne sur le stockage existant).
 */
export default function MediaPicker({ open, onClose, onSelect, folder = 'medias' }: { open: boolean; onClose: () => void; onSelect: (url: string, alt: string | null) => void; folder?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [message, setMessage] = useState('');
  const [loading, startLoading] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [manual, setManual] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => startLoading(async () => { try { setItems(await listMediaAction(query)); } catch { setMessage('Bibliothèque indisponible.'); } }), query ? 250 : 0);
    return () => clearTimeout(t);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    fd.set('folder', folder);
    setMessage('');
    startUpload(async () => {
      const res = await uploadMediaAction(fd);
      if (!res.ok) { setMessage(res.message); return; }
      setItems((prev) => [...res.items, ...prev]);
      if (res.items[0]) setSelected(res.items[0]);
      setMessage(res.errors.length ? res.errors.join(' ') : `${res.items.length} image(s) ajoutée(s).`);
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Choisir une image">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="m-0 text-[16px] font-semibold">Bibliothèque d’images</h2>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100" aria-label="Fermer"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-3">
          <input className={`${inputCls} max-w-xs`} placeholder="Rechercher une image…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher une image" />
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.heic,.heif" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
          <Btn onClick={() => fileRef.current?.click()} disabled={uploading}><Upload className="h-4 w-4" />{uploading ? 'Envoi…' : 'Téléverser'}</Btn>
          <span className="text-[12.5px] text-zinc-500">JPG, PNG, WebP, AVIF ou HEIC (iPhone) · 15 Mo max · converties en WebP, localisation GPS supprimée</span>
        </div>
        {message && <p className="m-0 px-4 pt-3 text-[13.5px] text-zinc-700" role="status">{message}</p>}
        <div className="min-h-[240px] flex-1 overflow-y-auto p-4">
          {loading && !items.length ? <p className="text-[14px] text-zinc-500">Chargement…</p> : !items.length ? <p className="text-[14px] text-zinc-500">Aucune image. Téléversez la première.</p> : (
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4 lg:grid-cols-5">
              {items.map((m) => {
                const on = selected?.id === m.id;
                return (
                  <li key={m.id}>
                    <button type="button" onClick={() => setSelected(m)} onDoubleClick={() => { onSelect(m.url, m.alt); onClose(); }} aria-pressed={on}
                      className={`group relative block w-full overflow-hidden rounded-md border-2 bg-zinc-50 text-left ${on ? 'border-[#06226D]' : 'border-transparent hover:border-zinc-300'}`}>
                      <img src={m.url} alt={m.alt ?? ''} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      {on && <span className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#06226D] text-white"><Check className="h-3.5 w-3.5" /></span>}
                      <span className="block truncate px-1.5 py-1 text-[12px] text-zinc-600">{m.filename}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-4 py-3">
          <input className={`${inputCls} min-w-0 flex-1`} placeholder="…ou coller l’adresse d’une image déjà en ligne (https://… ou /img/…)" value={manual} onChange={(e) => setManual(e.target.value)} aria-label="Adresse d’une image" />
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" disabled={!selected && !/^(https:\/\/|\/)/.test(manual.trim())}
            onClick={() => { if (selected) onSelect(selected.url, selected.alt); else onSelect(manual.trim(), null); onClose(); }}>Choisir</Btn>
        </div>
      </div>
    </div>
  );
}
