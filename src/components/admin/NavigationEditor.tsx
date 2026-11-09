'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { NavigationSettings } from '@/lib/site/settings-defaults';
import { saveNavigationAction } from '@/actions/admin/settings.actions';
import { useToast } from './feedback';

type Link = { label: string; href: string; visible: boolean; key?: 'services' | 'medias' };
type ListKey = 'main' | 'topbar' | 'companyLinks' | 'legalLinks';
export interface PageOption { label: string; href: string }
export interface PreviewInfo { logo: string; logoWhite: string; phone: string; email: string; address: string; hours: { label: string; value: string }[]; socials: string[] }

const SUBMENU_HINT: Record<NonNullable<Link['key']>, string> = {
  services: 'Sous-menu généré depuis les catégories et services publiés',
  medias: 'Sous-menu : Articles, Presse, Réalisations',
};

/** Largeur d'écran (aperçu à droite à partir de 1280 px, comme la maquette). */
function useWide() {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia('(min-width: 1280px)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia('(min-width: 1280px)').matches,
    () => true,
  );
}

function Switch({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onChange} disabled={disabled} className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[13px] text-zinc-700 disabled:opacity-50">
      <span className={`relative h-5 w-[34px] flex-none rounded-full transition-colors ${on ? 'bg-[#06226D]' : 'bg-zinc-300'}`} aria-hidden="true">
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)] transition-[left] ${on ? 'left-4' : 'left-0.5'}`} />
      </span>
      {on ? 'Affiché' : 'Masqué'}
    </button>
  );
}

function Rows({ list, items, options, canEdit, onChange, labelName }: { list: ListKey; items: Link[]; options: PageOption[]; canEdit: boolean; onChange: (next: Link[]) => void; labelName: string }) {
  const set = (i: number, patch: Partial<Link>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  const arrow = 'h-7 w-7 rounded-md border border-gray-200 bg-white text-[13.333px] text-black disabled:opacity-35';
  return (
    <div className="overflow-x-auto">
      {items.map((it, i) => {
        const opts = options.some((o) => o.href === it.href) ? options : [...options, { label: it.label || 'Lien actuel', href: it.href }];
        return (
          <div key={`${list}-${i}`} className="grid min-w-[640px] grid-cols-[64px_minmax(140px,1fr)_minmax(160px,1.2fr)_118px_34px] items-center gap-2.5 border-b border-[#f4f4f5] px-4 py-2.5">
            <div className="flex gap-0.5">
              <button type="button" className={arrow} onClick={() => move(i, -1)} disabled={!canEdit || i === 0} aria-label={`Monter « ${it.label} »`}>↑</button>
              <button type="button" className={arrow} onClick={() => move(i, 1)} disabled={!canEdit || i === items.length - 1} aria-label={`Descendre « ${it.label} »`}>↓</button>
            </div>
            <input type="text" value={it.label} maxLength={80} onChange={(e) => set(i, { label: e.target.value })} disabled={!canEdit} aria-label={`${labelName} ${i + 1} — libellé`}
              aria-invalid={!it.label.trim() || undefined}
              className="w-full rounded-md border border-gray-200 px-2.5 py-[7px] text-[14px] outline-none focus:border-[#06226D] aria-[invalid=true]:border-red-400" />
            <div className="min-w-0">
              <select value={it.href} onChange={(e) => set(i, { href: e.target.value })} disabled={!canEdit || !!it.key} aria-label={`${labelName} ${i + 1} — page`}
                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[7px] text-[14px] disabled:text-[#0a0a0a] disabled:opacity-100">
                {opts.map((o) => <option key={o.href} value={o.href}>{`${o.label} (${o.href})`}</option>)}
              </select>
              {it.key && <div className="mt-[3px] text-[12px] text-gray-500">{SUBMENU_HINT[it.key]}</div>}
            </div>
            <Switch on={it.visible} onChange={() => set(i, { visible: !it.visible })} disabled={!canEdit} />
            {it.key ? <span /> : (
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} disabled={!canEdit} aria-label={`Supprimer le lien « ${it.label} »`}
                className="h-[34px] w-[34px] rounded-md border-0 bg-transparent text-[18px] text-gray-500 hover:bg-[#fef2f2] hover:text-[#dc2626] disabled:opacity-40">×</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Écran « Menu & pied de page » (maquette ASPEO Admin) : liens éditables et aperçu en direct. */
export default function NavigationEditor({ initial, options, preview, canEdit }: { initial: NavigationSettings; options: PageOption[]; preview: PreviewInfo; canEdit: boolean }) {
  const router = useRouter();
  const wide = useWide();
  const { say, node: toast } = useToast();
  const [nav, setNav] = useState<NavigationSettings>(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (k: ListKey) => (next: Link[]) => { setNav((n) => ({ ...n, [k]: next })); setDirty(true); };
  const add = (k: ListKey) => () => {
    const used = new Set(nav[k].map((l) => l.href));
    const o = options.find((p) => !used.has(p.href)) ?? options[0]!;
    update(k)([...nav[k], { label: o.label, href: o.href, visible: true }]);
  };
  const max: Record<ListKey, number> = { main: 8, topbar: 6, companyLinks: 12, legalLinks: 8 };

  const save = async () => {
    const all = [...nav.main, ...nav.topbar, ...nav.companyLinks, ...nav.legalLinks];
    if (all.some((l) => !l.label.trim())) { say('Chaque lien doit avoir un libellé.', true); return; }
    if (!nav.ctaLabel.trim()) { say('Le libellé du bouton « Demander un devis » est obligatoire.', true); return; }
    setBusy(true);
    const res = await saveNavigationAction({ ...nav, main: nav.main.map((l) => ({ ...l, label: l.label.trim() })) });
    setBusy(false);
    if (!res.ok) { say(res.message, true); return; }
    setDirty(false); say(res.message); router.refresh();
  };

  const block = (k: ListKey, title: string, hint: string, labelName: string, extra?: React.ReactNode) => (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-[#f0f0f1] px-4 py-3.5">
        <h2 className="m-0 text-[15px] font-semibold">{title}</h2>
        <p className="m-[3px_0_0] text-[13px] text-gray-500">{hint}</p>
      </div>
      <Rows list={k} items={nav[k]} options={options} canEdit={canEdit} onChange={update(k)} labelName={labelName} />
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        {canEdit && nav[k].length < max[k] && (
          <button type="button" onClick={add(k)} className="rounded-md border border-dashed border-zinc-300 bg-white px-3 py-1.5 text-[13px] text-zinc-700 hover:border-[#06226D] hover:text-[#06226D]">+ Ajouter un lien</button>
        )}
        {extra}
      </div>
    </section>
  );

  const shown = (k: ListKey) => nav[k].filter((l) => l.visible);
  const pv = (
    <div className="min-w-0" style={wide ? { position: 'sticky', top: 132 } : undefined}>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-[#eef0f3]">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden="true" />
          <span className="text-[12.5px] font-semibold">Aperçu en direct</span>
          <span className="ml-auto text-[12px] text-gray-500">En-tête et pied de page</span>
        </div>
        <div className="p-3.5" aria-hidden="true">
          <div className="bg-white text-[#06226D] shadow-[0_1px_4px_rgba(0,0,0,.1)]">
            <div className="flex flex-wrap gap-3 bg-[#06226D] px-3.5 py-1.5 text-[10.5px] font-semibold text-white">
              {shown('topbar').map((l, i) => <span key={i}>{l.label}</span>)}
              <span>{preview.phone}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-b border-[#eef2f7] px-3.5 py-2.5">
              <img src={preview.logo} alt="" className="h-[26px] w-auto" />
              <div className="ml-auto flex flex-wrap items-center gap-2.5">
                {shown('main').map((l, i) => <span key={i} className="text-[10.5px] font-semibold">{l.label}</span>)}
                <span className="bg-[#FF5C00] px-[9px] py-[5px] text-[10px] font-bold text-white">{nav.ctaLabel || 'Demander un devis'}</span>
              </div>
            </div>
            <div className="bg-[#f5f8fd] px-4 py-[34px] text-center text-[11.5px] text-[#9aa5b1]">Contenu de la page</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3.5 bg-[#06226D] px-4 py-[18px] text-[10.5px] leading-[1.55] text-white">
              <div>
                <img src={preview.logoWhite} alt="" className="mb-2 h-[22px] w-auto" />
                <div className="opacity-85">{preview.address}</div>
                <div className="mt-1 font-bold">{preview.phone}</div>
                <div className="opacity-85">{preview.email}</div>
              </div>
              <div>
                <div className="mb-1 font-bold">Horaires</div>
                {preview.hours.map((h) => <div key={h.label} className="opacity-85">{h.label} : {h.value}</div>)}
              </div>
              <div>
                <div className="mb-1 font-bold">Liens</div>
                {shown('companyLinks').map((l, i) => <div key={i} className="opacity-85">{l.label}</div>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 bg-[#051c5b] px-4 py-2 text-[10px] text-white/75">
              {shown('legalLinks').map((l, i) => <span key={i}>{l.label}</span>)}
              {preview.socials.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid items-start gap-6" style={{ gridTemplateColumns: wide ? 'minmax(0,1fr) minmax(320px,440px)' : 'minmax(0,1fr)' }}>
      <div className="min-w-0">
        <div className="flex max-w-[980px] flex-col gap-4">
          {block('main', 'Menu principal', 'Liens affichés dans la barre de navigation. Le bouton « Demander un devis » est toujours affiché.', 'Lien du menu',
            <label className="ml-auto inline-flex items-center gap-2 text-[13px] text-zinc-700">Libellé du bouton
              <input type="text" value={nav.ctaLabel} maxLength={40} disabled={!canEdit} onChange={(e) => { setNav((n) => ({ ...n, ctaLabel: e.target.value })); setDirty(true); }}
                className="w-[180px] rounded-md border border-gray-200 px-2.5 py-[5px] text-[13.5px] text-[#0a0a0a] outline-none focus:border-[#06226D]" />
            </label>)}
          {block('topbar', 'Barre du haut', 'Petite barre au-dessus du menu principal.', 'Lien de la barre du haut')}
          {block('companyLinks', 'Pied de page', 'Colonne « ASPEO » du pied de page. La colonne « Nos services » est générée automatiquement depuis les services publiés.', 'Lien du pied de page')}
          {block('legalLinks', 'Liens légaux', 'Ligne du bas du pied de page (mentions légales, confidentialité, cookies…).', 'Lien légal')}
          {canEdit && (
            <div>
              <button type="button" onClick={save} disabled={busy} className="rounded-md border border-[#06226D] bg-[#06226D] px-4 py-[9px] text-[14px] font-medium text-white hover:bg-[#0a2f8f] disabled:opacity-60">
                {busy ? 'Enregistrement…' : 'Enregistrer et publier'}
              </button>
              {dirty && <span className="ml-3 text-[12.5px] text-[#c2410c]">Modifications non enregistrées</span>}
            </div>
          )}
        </div>
        {!wide && <div className="mt-6">{pv}</div>}
      </div>
      {wide && pv}
      {toast}
    </div>
  );
}
