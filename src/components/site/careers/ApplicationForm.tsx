'use client';

import { startTransition, useActionState } from 'react';
import { submitApplication, type FormState } from '@/actions/public/forms.actions';
import AntiSpamFields from '@/components/site/forms/AntiSpamFields';
import { Field, TextArea, TextInput } from '@/components/site/forms/fields';

/** Formulaire de candidature (offre précise ou spontanée), CV en pièce jointe. */
export default function ApplicationForm({ jobId, jobTitle }: { jobId?: string; jobTitle?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitApplication, { status: 'idle' });
  const fe = state.status === 'error' ? state.fields ?? {} : {};

  if (state.status === 'success') {
    return (
      <div className="bg-[color:#eef7f1] [border:1px_solid_#bfe3cc] [border-left:3px_solid_#0a7d3c] p-[22px] flex gap-[14px] items-start" role="status">
        <span className="flex-none w-[32px] h-[32px] bg-[color:#0a7d3c] text-white flex items-center justify-center" aria-hidden="true">✓</span>
        <div>
          <p className="font-heading font-bold text-navy m-[0_0_4px]">Candidature envoyée</p>
          <p className="m-0 text-[length:.95rem] text-[color:#4a5568]">Merci{state.firstName ? ` ${state.firstName}` : ''} ! Nous étudions votre candidature et revenons vers vous rapidement.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="flex flex-col gap-[16px] relative" noValidate aria-label={jobTitle ? `Postuler : ${jobTitle}` : 'Candidature spontanée'}>
      <AntiSpamFields />
      {jobId && <input type="hidden" name="jobId" value={jobId} />}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
        <Field label="Prénom" required error={fe.firstName}><TextInput name="firstName" required autoComplete="given-name" aria-invalid={!!fe.firstName} /></Field>
        <Field label="Nom" required error={fe.lastName}><TextInput name="lastName" required autoComplete="family-name" aria-invalid={!!fe.lastName} /></Field>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
        <Field label="E-mail" required error={fe.email}><TextInput name="email" type="email" required autoComplete="email" aria-invalid={!!fe.email} /></Field>
        <Field label="Téléphone" required error={fe.phone}><TextInput name="phone" type="tel" required autoComplete="tel" aria-invalid={!!fe.phone} /></Field>
      </div>
      <Field label="Commune de résidence" hint="(facultatif)"><TextInput name="city" autoComplete="address-level2" /></Field>
      <Field label="Quelques mots sur vous" hint="(facultatif)"><TextArea name="message" rows={4} placeholder="Expérience, disponibilités, secteur souhaité…" /></Field>
      <Field label="CV" hint="(PDF, Word, JPG, PNG ou photo iPhone · 6 Mo max · facultatif)">
        <input type="file" name="cv" accept=".pdf,.doc,.docx,image/*,.heic,.heif" className="text-[length:.9rem] text-navy file:mr-[12px] file:border-0 file:bg-navy file:text-white file:p-[10px_16px] file:font-heading file:font-bold file:cursor-pointer" />
      </Field>
      <label className="flex gap-[10px] items-start text-[length:.84rem] text-[color:#42505f] leading-[1.5]">
        <input type="checkbox" name="consent" required className="mt-[3px]" />
        <span>J&apos;accepte qu&apos;ASPEO utilise ces informations pour étudier ma candidature et me recontacter (voir la <a href="/politique-de-confidentialite" className="underline text-[color:#42505f]">politique de confidentialité</a>).</span>
      </label>
      {fe.consent && <p className="m-0 text-[length:.82rem] text-[color:#c2410c]">{fe.consent}</p>}
      {state.status === 'error' && !fe.consent && <p className="m-0 p-[12px_14px] bg-[color:#fff4ed] [border:1px_solid_#ffd3b8] text-[color:#9a3412] text-[length:.9rem]" role="alert">{state.message}</p>}
      <button type="submit" disabled={pending} className="self-start inline-flex items-center gap-[10px] bg-[color:var(--asp-accent)] text-white border-0 p-[14px_24px] min-h-[48px] font-heading font-bold text-[length:.95rem] cursor-pointer disabled:opacity-70">
        {pending ? 'Envoi en cours…' : jobTitle ? 'Envoyer ma candidature →' : 'Envoyer ma candidature spontanée →'}
      </button>
    </form>
  );
}
