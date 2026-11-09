'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState, useTransition } from 'react';
import { FileText, X } from 'lucide-react';
import { updateLeadAction, deleteLeadAction } from '@/actions/admin/leads.actions';
import { ConfirmDialog, useToast } from './feedback';
import { LEAD_STATUS } from '@/lib/admin/lead-status';
import { Badge, Btn, inputCls } from './ui';

export interface LeadRow {
  id: string;
  date: string;
  name: string;
  org: string;
  email: string;
  phone: string | null;
  need: string;
  needSub: string;
  frequency: string;
  status: string;
  notes: string;
  message: string;
  details: { k: string; v: string }[];
  files: { url: string; name: string; image: boolean }[];
}

const TABS: [string, string][] = [['ALL', 'Toutes'], ['NEW', 'Nouvelles'], ['IN_PROGRESS', 'En cours'], ['QUOTED', 'Devis envoyé'], ['DONE', 'Clôturées'], ['SPAM', 'Indésirables']];

interface Props { kind: 'devis' | 'candidature'; rows: LeadRow[]; columns: { need: string; frequency?: string }; can: { update: boolean; delete: boolean }; openId?: string }

export default function LeadsBoard({ kind, rows, columns, can, openId }: Props) {
  const router = useRouter();
  const { say, node: toast } = useToast();
  const [tab, setTab] = useState('ALL');
  const initial = rows.find((r) => r.id === openId) ?? null;
  const [current, setCurrentRow] = useState<LeadRow | null>(initial);
  const [status, setStatus] = useState(initial?.status ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const setCurrent = (r: LeadRow | null) => { setCurrentRow(r); if (r) { setStatus(r.status); setNotes(r.notes); } };
  const [busy, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCurrent(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current]);

  const counts = useMemo(() => Object.fromEntries(TABS.map(([k]) => [k, k === 'ALL' ? rows.length : rows.filter((r) => r.status === k).length])), [rows]);
  const shown = tab === 'ALL' ? rows.filter((r) => r.status !== 'SPAM') : rows.filter((r) => r.status === tab);
  const label = kind === 'devis' ? 'demande' : 'candidature';

  const save = () => current && start(async () => {
    const res = await updateLeadAction(kind, current.id, status, notes);
    say(res.message, !res.ok);
    if (res.ok) { setCurrent(null); router.refresh(); }
  });
  const remove = () => current && start(async () => {
    const res = await deleteLeadAction(kind, current.id);
    say(res.message, !res.ok);
    setConfirmDelete(false);
    if (res.ok) { setCurrent(null); router.refresh(); }
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par statut">
        {TABS.filter(([k]) => k === 'ALL' || counts[k] || k !== 'SPAM').map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${tab === k ? 'border-[#06226D] bg-[#06226D] text-white' : 'border-gray-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}>
            {l} ({counts[k]})
          </button>
        ))}
      </div>

      {!shown.length ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-[14px] text-gray-500">
          {rows.length ? `Aucune ${label} dans cette catégorie.` : kind === 'devis' ? 'Aucune demande pour le moment. Les demandes envoyées depuis le formulaire du site apparaîtront ici.' : 'Aucune candidature pour le moment.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#fafafa] text-left text-[13px] text-gray-500 [&>th]:px-3.5 [&>th]:py-2.5">
                <th className="font-medium">Reçue le</th><th className="font-medium">Contact</th><th className="font-medium">{columns.need}</th>
                {columns.frequency && <th className="font-medium">{columns.frequency}</th>}
                <th className="font-medium">{kind === 'devis' ? 'Photos' : 'CV'}</th><th className="font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} onClick={() => setCurrent(r)} className="cursor-pointer border-b border-[#f0f0f1] hover:bg-[#fafafa] [&>td]:px-3.5 [&>td]:py-3">
                  <td className="whitespace-nowrap text-[13px] text-gray-500">{r.date}</td>
                  <td><button type="button" onClick={(e) => { e.stopPropagation(); setCurrent(r); }} className="border-0 bg-transparent p-0 text-left font-medium text-[#0a0a0a] hover:underline">{r.name}</button><span className="block text-[12.5px] text-gray-500">{r.org}</span></td>
                  <td className="max-w-[300px]"><span className="block text-[13.5px]">{r.need}</span><span className="block text-[12.5px] text-gray-500">{r.needSub}</span></td>
                  {columns.frequency && <td className="text-[13.5px] text-zinc-700">{r.frequency || '—'}</td>}
                  <td className="whitespace-nowrap text-[13.5px] text-zinc-700">{r.files.length ? (kind === 'devis' ? `${r.files.length} photo${r.files.length > 1 ? 's' : ''}` : 'Joint') : '—'}</td>
                  <td><Badge tone={LEAD_STATUS[r.status]?.tone}>{LEAD_STATUS[r.status]?.label ?? r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-labelledby="lead-title">
          <div className="absolute inset-0 bg-black/35" onClick={() => setCurrent(null)} aria-hidden="true" />
          <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-[500px] flex-col bg-white shadow-[-10px_0_30px_rgba(0,0,0,.12)]">
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-[18px] py-4">
              <div><h2 id="lead-title" className="m-0 text-[17px] font-semibold">{current.name}</h2><p className="m-0 mt-0.5 text-[13px] text-gray-500">{current.org} · {current.date}</p></div>
              <button type="button" onClick={() => setCurrent(null)} className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border-0 bg-transparent text-[20px] hover:bg-[#f4f4f5]" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[18px]">
              <div className="flex flex-wrap gap-2">
                {current.phone && <a href={`tel:${current.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 rounded-md bg-[#06226D] px-3.5 py-2 text-[14px] font-medium text-white no-underline">Appeler {current.phone}</a>}
                <a href={`mailto:${current.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3.5 py-2 text-[14px] font-medium text-[#0a0a0a] no-underline">Répondre par e-mail</a>
              </div>
              <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13.5px]">
                <dt className="text-gray-500">E-mail</dt><dd className="m-0 break-all">{current.email}</dd>
                {current.details.map((d) => <Fragment key={d.k}><dt className="text-gray-500">{d.k}</dt><dd className="m-0">{d.v}</dd></Fragment>)}
              </dl>
              {current.message && (<div><h3 className="m-0 mb-1.5 text-[13px] font-semibold">Message</h3><p className="m-0 whitespace-pre-line rounded-lg border border-[#f0f0f1] bg-[#fafafa] px-3.5 py-3 text-[14px] leading-[1.6] text-zinc-800">{current.message}</p></div>)}
              {current.files.length > 0 && (
                <div>
                  <h3 className="m-0 mb-1.5 text-[13px] font-semibold">{kind === 'devis' ? 'Photos jointes' : 'CV'}</h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
                    {current.files.map((f) => f.image
                      ? <a key={f.url} href={f.url} target="_blank" rel="noopener" className="block aspect-square overflow-hidden rounded-md bg-[#f4f4f5]"><img src={f.url} alt={f.name} className="h-full w-full object-cover" /></a>
                      : <a key={f.url} href={f.url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-[14px]"><FileText className="h-4 w-4" />{f.name}</a>)}
                  </div>
                </div>
              )}
              <div className="border-t border-[#f0f0f1] pt-4">
                <label htmlFor="lead-status" className="mb-1.5 block text-[14px] font-medium">Statut de la {label}</label>
                <select id="lead-status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)} disabled={!can.update}>
                  {Object.entries(LEAD_STATUS).filter(([k]) => kind === 'devis' || k !== 'QUOTED').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {kind === 'devis' && (
                  <>
                    <label htmlFor="lead-notes" className="mb-1.5 mt-4 block text-[14px] font-medium">Note interne</label>
                    <textarea id="lead-notes" rows={4} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible uniquement dans l’administration" disabled={!can.update} />
                    <p className="m-0 mt-1 text-[12.5px] text-gray-500">Ex. : visite prévue le…, devis n°…</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-[18px] py-3.5">
              {can.delete ? <Btn variant="dangerGhost" onClick={() => setConfirmDelete(true)}>Supprimer</Btn> : <span />}
              <div className="flex gap-2"><Btn onClick={() => setCurrent(null)} className="!font-normal !text-black">Fermer</Btn>{can.update && <Btn variant="primary" onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Btn>}</div>
            </div>
          </aside>
        </div>
      )}
      <ConfirmDialog open={confirmDelete} busy={busy} title={`Supprimer cette ${label} ?`} confirmLabel="Supprimer définitivement" onCancel={() => setConfirmDelete(false)} onConfirm={remove}>
        La {label} et ses fichiers joints seront effacés définitivement (droit à l’effacement). Pour la classer, préférez le statut « Clôturé ».
      </ConfirmDialog>
      {toast}
    </div>
  );
}
