'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveRedirectAction, toggleRedirectAction, deleteRedirectAction } from '@/actions/admin/redirects.actions';
import { ConfirmDialog, useToast } from './feedback';
import { Badge, Btn, inputCls } from './ui';

export interface RedirectRow { id: string; source: string; destination: string; permanent: boolean; enabled: boolean; hits: number; note: string; updatedAt: string }
const EMPTY = { source: '', destination: '', permanent: true, note: '' };

export default function RedirectsManager({ rows, canEdit }: { rows: RedirectRow[]; canEdit: boolean }) {
  const router = useRouter();
  const { say, node: toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState<{ field?: string; message: string } | null>(null);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<RedirectRow | null>(null);
  const [busy, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await saveRedirectAction(editing, form);
      if (!res.ok) { setErr({ field: res.field, message: res.message }); return; }
      setErr(null); setForm(EMPTY); setEditing(null); say(res.message); router.refresh();
    });
  };
  const act = (fn: () => Promise<{ ok: boolean; message: string }>) => start(async () => { const r = await fn(); say(r.message, !r.ok); router.refresh(); });
  const shown = rows.filter((r) => !q.trim() || `${r.source} ${r.destination} ${r.note}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div>
      {canEdit && (
        <form onSubmit={submit} className="mb-6 rounded-lg border border-gray-200 bg-white p-4" noValidate>
          <h2 className="m-0 mb-3 text-[15px] font-semibold">{editing ? 'Modifier la redirection' : 'Ajouter une redirection'}</h2>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div><label htmlFor="r-source" className="mb-1 block text-[13.5px] font-medium">Ancienne adresse</label>
              <input id="r-source" className={inputCls} placeholder="/services/ancien-nom" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} aria-invalid={err?.field === 'source' || undefined} required /></div>
            <div><label htmlFor="r-dest" className="mb-1 block text-[13.5px] font-medium">Nouvelle adresse</label>
              <input id="r-dest" className={inputCls} placeholder="/proprete-services/nouveau-nom" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} aria-invalid={err?.field === 'destination' || undefined} required /></div>
            <div><label htmlFor="r-type" className="mb-1 block text-[13.5px] font-medium">Type</label>
              <select id="r-type" className={inputCls} value={form.permanent ? '301' : '302'} onChange={(e) => setForm({ ...form, permanent: e.target.value === '301' })}><option value="301">Définitive (301)</option><option value="302">Temporaire (302)</option></select></div>
          </div>
          <div className="mt-3"><label htmlFor="r-note" className="mb-1 block text-[13.5px] font-medium">Note (facultatif)</label><input id="r-note" className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={200} /></div>
          {err && <p className="m-0 mt-2 text-[13.5px] text-red-600" role="alert">{err.message}</p>}
          <div className="mt-3 flex gap-2">
            <Btn type="submit" variant="primary" disabled={busy}>{editing ? 'Enregistrer' : 'Ajouter'}</Btn>
            {editing && <Btn onClick={() => { setEditing(null); setForm(EMPTY); setErr(null); }}>Annuler</Btn>}
          </div>
        </form>
      )}
      <div className="mb-3 flex items-center gap-3"><input type="search" className={`${inputCls} max-w-xs`} placeholder="Rechercher une adresse…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" /><span className="ml-auto text-[13.5px] text-gray-500">{shown.length} sur {rows.length}</span></div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] border-collapse text-[14px]">
          <thead><tr className="border-b border-gray-200 text-left text-[13px] text-gray-500"><th className="px-4 py-2.5 font-medium">Ancienne adresse</th><th className="px-3 py-2.5 font-medium">Nouvelle adresse</th><th className="px-3 py-2.5 font-medium">Type</th><th className="px-3 py-2.5 font-medium">Utilisations</th><th className="px-4"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className={`border-b border-zinc-100 last:border-0 ${r.enabled ? '' : 'opacity-60'}`}>
                <td className="px-4 py-2.5"><span className="block break-all font-mono text-[12.5px]">{r.source}</span>{r.note && <span className="block text-[12px] text-gray-500">{r.note}</span>}</td>
                <td className="px-3 py-2.5"><span className="block break-all font-mono text-[12.5px]">{r.destination}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5">{r.enabled ? <Badge tone={r.permanent ? 'green' : 'blue'}>{r.permanent ? '301' : '302'}</Badge> : <Badge>Désactivée</Badge>}</td>
                <td className="px-3 py-2.5 text-zinc-600">{r.hits}</td>
                <td className="px-4 py-2.5">{canEdit && (
                  <div className="flex justify-end gap-1.5">
                    <Btn size="sm" onClick={() => { setEditing(r.id); setForm({ source: r.source, destination: r.destination, permanent: r.permanent, note: r.note }); setErr(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Modifier</Btn>
                    <Btn size="sm" disabled={busy} onClick={() => act(() => toggleRedirectAction(r.id, !r.enabled))}>{r.enabled ? 'Désactiver' : 'Activer'}</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setToDelete(r)}>Supprimer</Btn>
                  </div>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={!!toDelete} busy={busy} title="Supprimer cette redirection ?" confirmLabel="Supprimer" onCancel={() => setToDelete(null)} onConfirm={() => { const r = toDelete!; setToDelete(null); act(() => deleteRedirectAction(r.id)); }}>
        L’ancienne adresse <code>{toDelete?.source}</code> renverra une erreur 404 si aucune page ne lui correspond. Pour la suspendre, préférez « Désactiver ».
      </ConfirmDialog>
      {toast}
    </div>
  );
}
