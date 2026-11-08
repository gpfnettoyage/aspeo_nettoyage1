'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { submitQuoteRequest, type FormState } from '@/actions/public/forms.actions';
import AntiSpamFields from './AntiSpamFields';
import SendOverlay from './SendOverlay';
import { Field, Select, TextArea, TextInput } from './fields';

export interface Direction { label: string; prestations: string[] }

interface Props {
  directions: Direction[];
  initialDirection?: string;
  initialPrestation?: string;
  phone: string;
  phoneIntl: string;
}

const FREQUENCIES = ['Ponctuelle', 'Régulière', 'À définir ensemble'] as const;
const UNDECIDED = 'À définir ensemble';
const MAX_PHOTOS = 5;

/** Réduit une photo dans le navigateur avant envoi (JPG/PNG/WebP). Les HEIC sont convertis côté serveur. */
async function downscale(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 900_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    return blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

/** Formulaire de demande de devis (page Contact) — envoi réel, photos, validation serveur. */
export default function QuoteForm({ directions, initialDirection = '', initialPrestation = '', phone, phoneIntl }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitQuoteRequest, { status: 'idle' });
  const [direction, setDirection] = useState(initialDirection);
  const [prestation, setPrestation] = useState(initialPrestation);
  const [frequency, setFrequency] = useState('');
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [clientError, setClientError] = useState('');
  const [overlay, setOverlay] = useState<'sending' | 'done' | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);

  const current = directions.find((d) => d.label === direction);
  const hasPrestations = !!current && current.prestations.length > 0;

  // L'animation d'envoi dure au moins 1,2 s pour rester lisible, puis bascule sur la confirmation.
  useEffect(() => {
    if (state.status === 'success') {
      const wait = Math.max(0, 1200 - (Date.now() - startedAt.current));
      const t = setTimeout(() => { setOverlay('done'); formRef.current?.reset(); setPhotos([]); setFrequency(''); }, wait);
      return () => clearTimeout(t);
    }
  }, [state]);
  // En cas d'erreur, l'animation d'envoi est retirée (le message d'erreur reste affiché).
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) { setLastState(state); if (state.status === 'error') setOverlay(null); }

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const addPhotos = async (list: FileList | null) => {
    const files = Array.from(list ?? []).slice(0, MAX_PHOTOS - photos.length);
    const next = await Promise.all(files.map(async (f) => { const file = await downscale(f); return { file, url: URL.createObjectURL(file) }; }));
    setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!String(fd.get('message') ?? '').trim()) return setClientError('Expliquez-nous votre besoin en quelques mots.');
    if (!direction) return setClientError('Indiquez le type de besoin, ou choisissez « Je ne sais pas / À définir ensemble ».');
    if (!frequency) return setClientError('Précisez la fréquence, ou choisissez « À définir ensemble ».');
    const total = photos.reduce((s, p) => s + p.file.size, 0);
    if (total > 14 * 1024 * 1024) return setClientError('Les photos sont trop lourdes : retirez-en une ou deux.');
    setClientError('');
    fd.delete('photos');
    photos.forEach((p) => fd.append('photos', p.file));
    fd.set('frequency', frequency);
    fd.set('sourcePage', window.location.pathname + window.location.search);
    startedAt.current = Date.now();
    setOverlay('sending');
    startTransition(() => action(fd));
  };

  const error = clientError || (state.status === 'error' ? state.message : '');
  const fe = state.status === 'error' ? state.fields ?? {} : {};

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-[20px] relative" noValidate>
        <AntiSpamFields />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[16px]">
          <Field label="Prénom" required error={fe.firstName}><TextInput name="firstName" required autoComplete="given-name" aria-invalid={!!fe.firstName} /></Field>
          <Field label="Nom" required error={fe.lastName}><TextInput name="lastName" required autoComplete="family-name" aria-invalid={!!fe.lastName} /></Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[16px]">
          <Field label="Adresse e-mail" required error={fe.email}><TextInput name="email" type="email" required autoComplete="email" aria-invalid={!!fe.email} /></Field>
          <Field label="Téléphone" required error={fe.phone}><TextInput name="phone" type="tel" required autoComplete="tel" aria-invalid={!!fe.phone} /></Field>
        </div>
        <Field label="Entreprise ou organisme" hint="(facultatif)"><TextInput name="company" autoComplete="organization" /></Field>
        <Field label="Expliquez-nous votre besoin" required error={fe.message}>
          <TextArea name="message" required rows={5} aria-invalid={!!fe.message} placeholder="Type de locaux ou de logement, commune, surface approximative, situation… Quelques mots suffisent." />
        </Field>
        <Field label="Type de besoin" required error={fe.direction}>
          <Select name="direction" required value={direction} onChange={(e) => { setDirection(e.target.value); setPrestation(''); }}>
            <option value="">Sélectionnez…</option>
            <option value={UNDECIDED}>Je ne sais pas / À définir ensemble</option>
            {directions.map((d) => <option key={d.label} value={d.label}>{d.label}</option>)}
          </Select>
        </Field>
        {hasPrestations && (
          <Field label="Type de prestation" required>
            <Select name="prestation" required value={prestation} onChange={(e) => setPrestation(e.target.value)}>
              <option value="">Sélectionnez…</option>
              <option value={UNDECIDED}>Je ne sais pas / À définir ensemble</option>
              {current!.prestations.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
        )}
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[length:.86rem] font-semibold text-navy mb-[10px] p-0">Fréquence *</legend>
          <div className="flex flex-wrap gap-[10px]" role="radiogroup">
            {FREQUENCIES.map((f) => {
              const on = frequency === f;
              return (
                <button key={f} type="button" role="radio" aria-checked={on} onClick={() => { setFrequency(f); setClientError(''); }} className="p-[12px_22px] font-heading font-bold text-[length:.9rem] cursor-pointer"
                  style={{ border: `1px solid ${on ? 'var(--asp-accent)' : '#d7dee8'}`, background: on ? 'var(--asp-accent)' : '#fff', color: on ? '#fff' : '#06226D' }}>
                  {f}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div>
          <div className="text-[length:.86rem] font-semibold text-navy mb-[10px]">Photos du site ou de la zone à traiter <span className="font-normal text-[color:#8a97a8]">(facultatif)</span></div>
          <p className="text-[length:.84rem] text-[color:#5b6878] m-[0_0_10px]">Vous pouvez envoyer votre demande sans photo.</p>
          {photos.length < MAX_PHOTOS && (
            <label className="flex flex-col items-center justify-center gap-[8px] [border:1.5px_dashed_#c9d6ea] bg-[color:#f8fafc] p-[24px] cursor-pointer text-center hover:[border-color:var(--asp-accent)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--asp-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              <span className="font-heading font-bold text-[length:.92rem] text-navy">Ajouter des photos</span>
              <span className="text-[length:.8rem] text-[color:#8a97a8]">JPG, PNG ou HEIC (iPhone) · 5 photos max · elles nous aident à chiffrer plus précisément</span>
              <input className="sr-only" type="file" accept="image/*,.heic,.heif" multiple onChange={(e) => { void addPhotos(e.target.files); e.target.value = ''; }} />
            </label>
          )}
          {photos.length > 0 && (
            <ul className="list-none p-0 flex flex-wrap gap-[8px] m-[12px_0_0]">
              {photos.map((ph, i) => (
                <li key={ph.url} className="relative w-[72px] h-[72px] [border:1px_solid_#eef2f7] bg-[color:#eef2f7]">
                  {/^image\/(jpeg|png|webp|gif)$/.test(ph.file.type) ? <img src={ph.url} alt={ph.file.name} className="w-full h-full object-cover" /> : <span className="flex w-full h-full items-center justify-center text-[length:.7rem] text-navy font-bold p-[4px] text-center break-all">{ph.file.name.slice(-12)}</span>}
                  <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} aria-label={`Retirer la photo ${ph.file.name}`} className="absolute top-[2px] right-[2px] w-[20px] h-[20px] bg-navy text-white border-0 cursor-pointer leading-none">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="m-0 p-[12px_14px] bg-[color:#fff4ed] [border:1px_solid_#ffd3b8] text-[color:#9a3412] text-[length:.9rem]" role="alert">{error}</p>}
        <p className="text-[length:.78rem] text-[color:#8a97a8] leading-[1.5] m-0">En cliquant sur « Envoyer votre message », vous acceptez d&apos;être contacté par e-mail ou appel téléphonique. Aucun e-mail à des fins commerciales ne vous sera envoyé. Voir notre <a href="/politique-de-confidentialite" className="text-[color:#5b6878] underline">politique de confidentialité</a>.</p>
        <button type="submit" disabled={pending} className="self-start inline-flex items-center gap-[10px] bg-[color:var(--asp-accent)] text-white border-0 p-[16px_28px] font-heading font-bold text-[length:.98rem] cursor-pointer disabled:opacity-70 hover:[background:color-mix(in_srgb,var(--asp-accent)_84%,#000)]">
          {pending ? 'Envoi en cours…' : 'Envoyer votre message'}{!pending && <span aria-hidden="true">→</span>}
        </button>
      </form>
      {overlay && (
        <SendOverlay phase={overlay} firstName={state.status === 'success' ? state.firstName : ''} recap={state.status === 'success' ? state.recap : []} phone={phone} phoneIntl={phoneIntl} onClose={() => setOverlay(null)} />
      )}
    </>
  );
}
