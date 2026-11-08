'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { ArrowLeft, ChevronDown, ExternalLink, RefreshCw } from 'lucide-react';
import type { AdminField, AdminFieldGroup } from '@/lib/admin/fields';
import type { FormValue, FormValues } from '@/lib/admin/values';
import { slugify } from '@/lib/admin/values';
import { saveEntryAction, setEntryStatusAction, discardDraftAction, deleteEntryAction, type ActionResult, type SaveIntent } from '@/actions/admin/content.actions';
import { savePageAction, discardPageDraftAction } from '@/actions/admin/pages.actions';
import FieldInput, { ImageInput, type RelationMap } from './FieldInput';
import { ConfirmDialog, useToast } from './feedback';
import { Badge, Btn, Notice, Segmented, fmtDate, type Tone } from './ui';

export type EditorTarget =
  | { kind: 'entry'; collection: string; id: string | null; statusMode: 'content' | 'boolean' | 'none'; draftMode: boolean; slugFrom?: string }
  | { kind: 'page'; key: string };

export interface EditorProps {
  target: EditorTarget;
  backHref: string;
  backLabel: string;
  title: string;
  singular: string;
  intro?: string;
  groups: AdminFieldGroup[];
  initialValues: FormValues;
  relations?: RelationMap;
  /** État publié : 'live' en ligne, 'offline' brouillon/dépublié, 'archived'. */
  state: 'new' | 'live' | 'offline' | 'archived';
  hasPendingDraft: boolean;
  publishedAt?: string | null;
  updatedAt?: string | null;
  previewPath: string | null;
  siteUrl: string;
  can: { publish: boolean; delete: boolean };
  /** Pages : champs SEO hors modèle. */
  pageSeo?: { seoTitle: string; seoDesc: string; ogImage: string; noindex: boolean; defaultTitle: string; defaultDesc: string };
}

const SEO_NAMES = new Set(['seoTitle', 'seoDesc']);
const isImageField = (f: AdminField) => f.type === 'image' || f.type === 'gallery' || (f.type === 'list' && !!f.itemFields?.some((s) => s.type === 'image'));
const countImages = (groups: AdminFieldGroup[], v: FormValues) => groups.flatMap((g) => g.fields).reduce((n, f) => {
  const x = v[f.name];
  if (f.type === 'image') return n + (x ? 1 : 0);
  if (f.type === 'gallery') return n + (Array.isArray(x) ? x.length : 0);
  if (f.type === 'list' && Array.isArray(x)) return n + (x as Record<string, string>[]).reduce((m, it) => m + (f.itemFields ?? []).filter((s) => s.type === 'image' && it[s.name]).length, 0);
  return n;
}, 0);

function StateBadge({ state, pending }: { state: EditorProps['state']; pending: boolean }) {
  const map: Record<EditorProps['state'], [string, Tone]> = { new: ['Nouveau', 'blue'], live: ['Publié', 'green'], offline: ['Brouillon', 'gray'], archived: ['Archivé', 'gray'] };
  const [label, tone] = map[state];
  return <span className="inline-flex gap-1.5"><Badge tone={tone}>{label}</Badge>{pending && <Badge tone="orange">Modifications en attente</Badge>}</span>;
}

/** Aperçu Google (titre, adresse, description). */
function SerpPreview({ title, desc, url }: { title: string; desc: string; url: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="m-0 mb-2 text-[12px] font-medium uppercase tracking-wide text-zinc-500">Aperçu dans Google</p>
      <p className="m-0 truncate text-[13px] text-zinc-600">{url}</p>
      <p className="m-0 mt-0.5 line-clamp-1 text-[19px] leading-snug text-[#1a0dab]">{title}</p>
      <p className="m-0 mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-zinc-600">{desc}</p>
    </div>
  );
}

/** Page affichée à sa largeur réelle (ordinateur 1280 px, mobile 390 px), réduite pour tenir dans le panneau. */
function ScaledFrame({ src, width }: { src: string; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = box ? Math.min(1, box / width) : 1;
  const height = typeof window === 'undefined' ? 700 : Math.round(window.innerHeight * 0.72);
  return (
    <div ref={ref} className="overflow-hidden bg-zinc-100" style={{ height }}>
      <iframe src={src} title="Aperçu de la page" className="block origin-top-left border-0 bg-white"
        style={{ width, height: height / scale, transform: `scale(${scale})`, marginLeft: width * scale < box ? (box - width * scale) / 2 : 0 }} />
    </div>
  );
}

export default function ContentEditor(props: EditorProps) {
  const { target, groups, can } = props;
  const router = useRouter();
  const { say, node: toast } = useToast();
  const [values, setValues] = useState<FormValues>(props.initialValues);
  const [seo, setSeo] = useState(props.pageSeo ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, start] = useTransition();
  const [tab, setTab] = useState<'content' | 'images' | 'seo'>('content');
  const [layout, setLayout] = useState<'form' | 'split' | 'preview'>('form');
  // Maquette : « Côte à côte » par défaut sur grand écran.
  useEffect(() => { if (props.previewPath && window.innerWidth >= 1280) setLayout('split'); }, [props.previewPath]);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  const [confirm, setConfirm] = useState<null | 'delete' | 'unpublish' | 'discard'>(null);
  const [frameKey, setFrameKey] = useState(0);
  const slugTouched = useRef(target.kind === 'entry' && !!target.id);

  const contentGroups = useMemo(() => groups.filter((g) => !g.fields.every((f) => SEO_NAMES.has(f.name))), [groups]);
  const seoGroup = useMemo(() => groups.find((g) => g.fields.some((f) => SEO_NAMES.has(f.name))), [groups]);
  const imageFields = useMemo(() => groups.flatMap((g) => g.fields).filter(isImageField), [groups]);
  const imageCount = countImages(groups, values);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Le mode côte à côte n'a pas de sens sur petit écran.
  useEffect(() => { if (layout === 'split' && window.innerWidth < 1100) setLayout('preview'); }, [layout]);

  const set = useCallback((name: string, v: FormValue) => {
    setDirty(true);
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      if (target.kind === 'entry' && target.slugFrom === name && !slugTouched.current && typeof v === 'string') next.slug = slugify(v);
      return next;
    });
    if (name === 'slug') slugTouched.current = true;
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  }, [target]);

  const handle = (res: ActionResult, after?: () => void) => {
    if (!res.ok) {
      setErrors(res.errors ?? {});
      say(res.message, true);
      const first = res.errors && Object.keys(res.errors)[0];
      if (first) {
        const gi = groups.findIndex((g) => g.fields.some((f) => f.name === first));
        if (gi >= 0) { setTab(SEO_NAMES.has(first) ? 'seo' : 'content'); setOpen((o) => ({ ...o, [contentGroups.indexOf(groups[gi]!)]: true })); }
      }
      return;
    }
    setErrors({});
    setDirty(false);
    say(res.message);
    setFrameKey((k) => k + 1);
    after?.();
    router.refresh();
  };

  const save = (intent: SaveIntent) => start(async () => {
    if (target.kind === 'page') {
      handle(await savePageAction(target.key, values, seo ?? { seoTitle: '', seoDesc: '', ogImage: '', noindex: false }, intent === 'publish' ? 'publish' : 'draft'));
      return;
    }
    const res = await saveEntryAction(target.collection, target.id, values, intent);
    handle(res, () => { if (!target.id && res.ok) router.replace(`${props.backHref}/${res.id}`); });
  });

  const runConfirm = () => start(async () => {
    if (confirm === 'discard') {
      const res = target.kind === 'page' ? await discardPageDraftAction(target.key) : await discardDraftAction(target.collection, target.id!);
      handle(res, () => window.location.reload());
    } else if (confirm === 'unpublish' && target.kind === 'entry') {
      handle(await setEntryStatusAction(target.collection, target.id!, 'unpublish'));
    } else if (confirm === 'delete' && target.kind === 'entry') {
      const res = await deleteEntryAction(target.collection, target.id!);
      if (res.ok) { setDirty(false); router.push(props.backHref); router.refresh(); } else say(res.message, true);
    }
    setConfirm(null);
  });

  const isEntry = target.kind === 'entry';
  const isNew = props.state === 'new';
  const live = props.state === 'live';
  const usesDraft = target.kind === 'page' || (isEntry && target.draftMode);
  const statusNone = isEntry && target.statusMode === 'none';

  // Boutons d'action (maquette : Supprimer · Enregistrer le brouillon · Publier)
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {isEntry && !isNew && can.delete && <Btn variant="dangerGhost" onClick={() => setConfirm('delete')} disabled={busy}>Supprimer</Btn>}
      {statusNone ? <Btn variant="primary" onClick={() => save('save')} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Btn> : (
        <>
          {(usesDraft || !live) && <Btn onClick={() => save(live || target.kind === 'page' ? 'draft' : isNew ? 'draft' : 'save')} disabled={busy}>Enregistrer le brouillon</Btn>}
          {!usesDraft && live && <Btn onClick={() => save('save')} disabled={busy}>Enregistrer</Btn>}
          {can.publish && <Btn variant="primary" onClick={() => save('publish')} disabled={busy}>{busy ? 'Patientez…' : 'Publier'}</Btn>}
        </>
      )}
    </div>
  );

  const seoTitle = String(target.kind === 'page' ? seo?.seoTitle ?? '' : values.seoTitle ?? '');
  const seoDesc = String(target.kind === 'page' ? seo?.seoDesc ?? '' : values.seoDesc ?? '');
  const autoTitle = target.kind === 'page' ? props.pageSeo!.defaultTitle : `${String(values.title ?? values.name ?? props.title)} | ASPEO`;
  const autoDesc = target.kind === 'page' ? props.pageSeo!.defaultDesc : 'Générée automatiquement à partir du contenu.';
  const host = props.siteUrl.replace(/^https?:\/\//, '');

  const renderGroup = (g: AdminFieldGroup, i: number, numbered: boolean) => {
    const isOpen = open[i] ?? false;
    const fields = g.fields;
    const hasError = fields.some((f) => errors[f.name]);
    return (
      <section key={g.title} className={`rounded-lg border bg-white ${hasError ? 'border-red-300' : 'border-zinc-200'}`}>
        <button type="button" onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen }))} aria-expanded={isOpen}
          className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3.5 text-left">
          {numbered && <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-md bg-zinc-100 text-[12px] font-medium text-zinc-600">{i + 1}</span>}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">{g.title}</span>
            {g.description && <span className="block text-[13px] text-zinc-500">{g.description}</span>}
          </span>
          <ChevronDown className={`h-4 w-4 flex-none text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {isOpen && (
          <div className="grid gap-5 border-t border-zinc-200 px-4 py-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} error={errors[f.name]} relations={props.relations} />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const previewSrc = props.previewPath ? `/api/preview?path=${encodeURIComponent(props.previewPath)}` : null;
  const preview = previewSrc && (
    <div className="lg:sticky lg:top-[132px]">
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 text-[12.5px]">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          <span className="font-medium">Aperçu</span>
          <span className="min-w-0 flex-1 truncate text-zinc-500">{host}{props.previewPath}</span>
          <button type="button" onClick={() => setFrameKey((k) => k + 1)} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100" aria-label="Actualiser l’aperçu"><RefreshCw className="h-3.5 w-3.5" /></button>
          <a href={previewSrc} target="_blank" rel="noopener" className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100" aria-label="Ouvrir l’aperçu dans un nouvel onglet"><ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
        <ScaledFrame key={frameKey} src={previewSrc} width={device === 'mobile' ? 390 : 1280} />
      </div>
      <p className="m-0 mt-2 text-[12.5px] text-zinc-500">L’aperçu affiche la dernière version enregistrée (brouillon compris), avec la maquette du site. {dirty && <strong className="text-[#C74700]">Enregistrez le brouillon pour voir vos dernières modifications.</strong>}</p>
    </div>
  );

  return (
    <div>
      {/* En-tête collant : retour, titre, statut, actions */}
      <div className="sticky top-14 z-20 -mx-4 -mt-6 mb-6 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:-mt-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link href={props.backHref} className="inline-flex items-center gap-1 text-[13px] text-zinc-500 no-underline hover:text-zinc-900"><ArrowLeft className="h-3.5 w-3.5" />{props.backLabel}</Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="m-0 truncate text-[19px] font-semibold tracking-tight">{props.title}</h1>
              {!statusNone && <StateBadge state={props.state} pending={props.hasPendingDraft} />}
              {dirty && <span className="text-[12.5px] text-[#C74700]">Non enregistré</span>}
            </div>
            {!isNew && (
              <p className="m-0 mt-0.5 text-[13px] text-zinc-500">
                {props.publishedAt ? `Dernière publication : ${fmtDate(props.publishedAt)}` : props.updatedAt ? `Mis à jour : ${fmtDate(props.updatedAt)}` : ''}
                {isEntry && live && !statusNone && can.publish && <> · <button type="button" onClick={() => setConfirm('unpublish')} className="border-0 bg-transparent p-0 text-[13px] text-zinc-600 underline hover:text-zinc-950">Dépublier</button></>}
                {live && props.previewPath && <> · <a href={props.previewPath} target="_blank" rel="noopener" className="text-zinc-600">Voir sur le site</a></>}
              </p>
            )}
          </div>
          {actions}
        </div>
      </div>

      {/* Onglets et affichage */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200">
        <div role="tablist" aria-label="Sections de l’éditeur" className="flex gap-1">
          {([['content', 'Contenu'], ['images', 'Images'], ['seo', 'Référencement Google']] as const).filter(([k]) => k !== 'images' || imageFields.length).filter(([k]) => k !== 'seo' || seoGroup || seo).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`-mb-px border-0 border-b-2 bg-transparent px-3 py-2.5 text-[14.5px] ${tab === k ? 'border-[#06226D] font-medium text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>
              {label}{k === 'images' && <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 text-[11.5px] text-zinc-600">{imageCount}</span>}
            </button>
          ))}
        </div>
        {previewSrc && (
          <div className="mb-2 flex flex-wrap gap-2">
            <Segmented label="Disposition" value={layout} onChange={setLayout} options={[{ value: 'form', label: 'Formulaire' }, { value: 'split', label: 'Côte à côte' }, { value: 'preview', label: 'Aperçu' }]} />
            {layout !== 'form' && <Segmented label="Appareil" value={device} onChange={setDevice} options={[{ value: 'desktop', label: 'Ordinateur' }, { value: 'mobile', label: 'Mobile' }]} />}
          </div>
        )}
      </div>

      {props.hasPendingDraft && (
        <div className="mb-4"><Notice tone="orange">
          Des modifications enregistrées en brouillon ne sont pas encore en ligne. Elles sont chargées ci-dessous ; cliquez sur « Publier » pour les mettre en ligne{' '}
          ou <button type="button" className="border-0 bg-transparent p-0 font-medium text-[#8a3300] underline" onClick={() => setConfirm('discard')}>abandonner ces modifications</button>.
        </Notice></div>
      )}
      {props.intro && tab === 'content' && <div className="mb-4"><Notice>{props.intro}</Notice></div>}

      <div className={layout === 'split' && previewSrc ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''}>
        {layout !== 'preview' || !previewSrc ? (
          <div className="space-y-4">
            {tab === 'content' && contentGroups.map((g, i) => renderGroup(g, i, true))}
            {tab === 'images' && (
              <section className="rounded-lg border border-zinc-200 bg-white p-4">
                <p className="m-0 mb-4 text-[13.5px] text-zinc-500">Toutes les images de {target.kind === 'page' ? 'la page' : `ce${props.singular.match(/^[aeéiou]/i) ? 't' : ''} ${props.singular}`}. Pensez au texte alternatif dans la bibliothèque d’images.</p>
                <div className="grid gap-6">{imageFields.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} error={errors[f.name]} idPrefix="img" />)}</div>
              </section>
            )}
            {tab === 'seo' && (
              <div className="space-y-4">
                <SerpPreview title={seoTitle || autoTitle} desc={seoDesc || autoDesc} url={`${host}${props.previewPath ?? ''}`} />
                <section className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-4">
                  <Notice>Laissés vides, le titre et la description sont générés automatiquement. Titre : 30 à 60 caractères ; description : 110 à 160.</Notice>
                  {target.kind === 'page' && seo ? (
                    <>
                      <FieldInput field={{ name: 'seoTitle', label: 'Titre SEO (balise title)', type: 'text', max: 70, recommended: [30, 60], placeholder: props.pageSeo!.defaultTitle }} value={seo.seoTitle} onChange={(v) => { setDirty(true); setSeo({ ...seo, seoTitle: String(v) }); }} error={errors.seoTitle} />
                      <FieldInput field={{ name: 'seoDesc', label: 'Méta-description', type: 'textarea', rows: 3, max: 170, recommended: [110, 160], placeholder: props.pageSeo!.defaultDesc }} value={seo.seoDesc} onChange={(v) => { setDirty(true); setSeo({ ...seo, seoDesc: String(v) }); }} error={errors.seoDesc} />
                      <div><p className="m-0 mb-1.5 text-[14px] font-medium">Image de partage (réseaux sociaux)</p><ImageInput id="og-image" value={seo.ogImage} onChange={(v) => { setDirty(true); setSeo({ ...seo, ogImage: v }); }} /></div>
                      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" className="h-4 w-4 accent-[#06226D]" checked={seo.noindex} onChange={(e) => { setDirty(true); setSeo({ ...seo, noindex: e.target.checked }); }} />Ne pas indexer cette page dans Google (noindex)</label>
                    </>
                  ) : seoGroup?.fields.map((f) => <FieldInput key={f.name} field={{ ...f, placeholder: f.name === 'seoTitle' ? autoTitle : undefined }} value={values[f.name]} onChange={(v) => set(f.name, v)} error={errors[f.name]} />)}
                  {isEntry && 'slug' in values && <p className="m-0 text-[13px] text-zinc-500">Adresse : <span className="font-mono">{host}{props.previewPath}</span> — modifiable dans l’onglet Contenu.</p>}
                </section>
              </div>
            )}
          </div>
        ) : null}
        {layout !== 'form' && preview}
      </div>

      {Object.values(errors).some(Boolean) && <p className="sr-only" role="alert">Certains champs sont à corriger.</p>}
      <ConfirmDialog open={confirm !== null} busy={busy} onCancel={() => setConfirm(null)} onConfirm={runConfirm}
        title={confirm === 'delete' ? `Supprimer « ${props.title} » ?` : confirm === 'unpublish' ? 'Dépublier ce contenu ?' : 'Abandonner les modifications en attente ?'}
        confirmLabel={confirm === 'delete' ? 'Supprimer définitivement' : confirm === 'unpublish' ? 'Dépublier' : 'Abandonner'}>
        {confirm === 'delete' ? 'Cette action est irréversible. Si le contenu était en ligne, son adresse sera redirigée vers la rubrique.' : confirm === 'unpublish' ? 'Le contenu ne sera plus visible sur le site. Vous pourrez le republier à tout moment.' : 'La version en ligne est conservée ; les modifications non publiées sont perdues.'}
      </ConfirmDialog>
      {toast}
    </div>
  );
}
