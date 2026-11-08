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
            className={`rounded-full border px-3.5 py-1.5 text-[13.5px] ${tab === k ? 'border-[#06226D] bg-[#06226D] font-medium text-white' : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
            {l} ({counts[k]})
          </button>
        ))}
      </div>

      {!shown.length ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-[14px] text-zinc-500">
          {rows.length ? `Aucune ${label} dans cette catégorie.` : kind === 'devis' ? 'Aucune demande pour le moment. Les demandes envoyées depuis le formulaire du site apparaîtront ici.' : 'Aucune candidature pour le moment.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[13px] text-zinc-500">
                <th className="px-4 py-2.5 font-medium">Reçue le</th><th className="px-3 py-2.5 font-medium">Contact</th><th className="px-3 py-2.5 font-medium">{columns.need}</th>
                {columns.frequency && <th className="px-3 py-2.5 font-medium">{columns.frequency}</th>}
                <th className="px-3 py-2.5 font-medium">{kind === 'devis' ? 'Photos' : 'CV'}</th><th className="px-4 py-2.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} onClick={() => setCurrent(r)} className="cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{r.date}</td>
                  <td className="px-3 py-3"><button type="button" onClick={(e) => { e.stopPropagation(); setCurrent(r); }} className="border-0 bg-transparent p-0 text-left font-medium text-zinc-950 hover:underline">{r.name}</button><span className="block text-[12.5px] text-zinc-500">{r.org}</span></td>
                  <td className="px-3 py-3">{r.need}<span className="block text-[12.5px] text-zinc-500">{r.needSub}</span></td>
                  {columns.frequency && <td className="px-3 py-3 text-zinc-700">{r.frequency || '—'}</td>}
                  <td className="whitespace-nowrap px-3 py-3 text-zinc-700">{r.files.length ? (kind === 'devis' ? `${r.files.length} photo${r.files.length > 1 ? 's' : ''}` : 'Joint') : '—'}</td>
                  <td className="px-4 py-3"><Badge tone={LEAD_STATUS[r.status]?.tone}>{LEAD_STATUS[r.status]?.label ?? r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-labelledby="lead-title">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCurrent(null)} aria-hidden="true" />
          <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-[500px] flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
              <div><h2 id="lead-title" className="m-0 text-[18px] font-semibold">{current.name}</h2><p className="m-0 text-[13px] text-zinc-500">{current.org} · {current.date}</p></div>
              <button type="button" onClick={() => setCurrent(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100" aria-label="Fermer"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {current.phone && <a href={`tel:${current.phone.replace(/\s/g, '')}`} className="inline-flex h-9 items-center rounded-md bg-[#06226D] px-3.5 text-[14px] font-medium text-white no-underline">Appeler {current.phone}</a>}
                <a href={`mailto:${current.email}`} className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3.5 text-[14px] font-medium text-zinc-900 no-underline">Répondre par e-mail</a>
              </div>
              <dl className="m-0 grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-[14px]">
                <dt className="text-zinc-500">E-mail</dt><dd className="m-0 break-all">{current.email}</dd>
                {current.details.map((d) => <Fragment key={d.k}><dt className="text-zinc-500">{d.k}</dt><dd className="m-0">{d.v}</dd></Fragment>)}
              </dl>
              {current.message && (<><h3 className="mb-1.5 mt-5 text-[14px] font-semibold">Message</h3><p className="m-0 whitespace-pre-line rounded-md border border-zinc-200 bg-zinc-50 p-3.5 text-[14px] leading-relaxed">{current.message}</p></>)}
              {current.files.length > 0 && (
                <>
                  <h3 className="mb-1.5 mt-5 text-[14px] font-semibold">{kind === 'devis' ? 'Photos jointes' : 'CV'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {current.files.map((f) => f.image
                      ? <a key={f.url} href={f.url} target="_blank" rel="noopener" className="block h-[110px] w-[110px] overflow-hidden rounded-md bg-zinc-100"><img src={f.url} alt={f.name} className="h-full w-full object-cover" /></a>
                      : <a key={f.url} href={f.url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-[14px]"><FileText className="h-4 w-4" />{f.name}</a>)}
                  </div>
                </>
              )}
              <div className="mt-6 border-t border-zinc-200 pt-5">
                <label htmlFor="lead-status" className="mb-1.5 block text-[14px] font-medium">Statut de la {label}</label>
                <select id="lead-status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)} disabled={!can.update}>
                  {Object.entries(LEAD_STATUS).filter(([k]) => kind === 'devis' || k !== 'QUOTED').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {kind === 'devis' && (
                  <>
                    <label htmlFor="lead-notes" className="mb-1.5 mt-4 block text-[14px] font-medium">Note interne</label>
                    <textarea id="lead-notes" rows={4} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible uniquement dans l’administration" disabled={!can.update} />
                    <p className="m-0 mt-1 text-[12.5px] text-zinc-500">Ex. : visite prévue le…, devis n°…</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-3">
              {can.delete ? <Btn variant="dangerGhost" onClick={() => setConfirmDelete(true)}>Supprimer</Btn> : <span />}
              <div className="flex gap-2"><Btn onClick={() => setCurrent(null)}>Fermer</Btn>{can.update && <Btn variant="primary" onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Btn>}</div>
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
