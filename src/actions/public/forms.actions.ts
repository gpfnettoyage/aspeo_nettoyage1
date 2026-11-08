'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { extractClientIP } from '@/lib/utils/ip';
import { hashIP } from '@/lib/utils/security';
import { checkSpam, formRateLimit } from '@/lib/forms/antispam';
import { sendMail } from '@/lib/mail/mailer';
import { applicationAcknowledgement, applicationNotification, quoteAcknowledgement, quoteNotification } from '@/lib/mail/templates';
import { getSettings } from '@/lib/site/settings';
import { absoluteUrl } from '@/lib/site/urls';
import { detectType, isImageType, processImage } from '@/lib/storage/images';
import { storePrivate } from '@/lib/storage/files';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';

export type FormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fields?: Record<string, string> }
  | { status: 'success'; recap: { k: string; v: string }[]; firstName: string };

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const MAX_CV_BYTES = 6 * 1024 * 1024;

const phone = z.string().trim().min(1, 'Indiquez votre numéro de téléphone.').refine((v) => {
  const digits = v.replace(/\D/g, '');
  return /^\+?[0-9\s.()-]+$/.test(v) && digits.length >= 10 && digits.length <= 15;
}, 'Numéro de téléphone invalide.');
const optional = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

const quoteSchema = z.object({
  firstName: z.string().trim().min(1, 'Indiquez votre prénom.').max(60),
  lastName: z.string().trim().min(1, 'Indiquez votre nom.').max(60),
  email: z.string().trim().email('Adresse e-mail invalide.').max(160),
  phone,
  company: optional(120),
  message: z.string().trim().min(5, 'Expliquez-nous votre besoin en quelques mots.').max(4000),
  direction: z.string().trim().min(1, 'Indiquez le type de besoin, ou choisissez « Je ne sais pas / À définir ensemble ».').max(80),
  prestation: optional(160),
  frequency: z.enum(['Ponctuelle', 'Régulière', 'À définir ensemble'], { errorMap: () => ({ message: 'Précisez la fréquence, ou choisissez « À définir ensemble ».' }) }),
  city: optional(120),
  sourcePage: optional(300),
});

const str = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === 'string' ? v : ''; };
const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? 'Veuillez vérifier le formulaire.';
const fieldErrors = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]));

async function clientContext() {
  const h = await headers();
  const ip = extractClientIP(h);
  return { ip, ipHash: hashIP(ip), userAgent: (h.get('user-agent') ?? '').slice(0, 300) };
}

/** Demande de devis / message de contact (page Contact). */
export async function submitQuoteRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  const ctx = await clientContext();
  const spam = await checkSpam(fd, ctx.ip);
  if (!spam.ok) {
    if (spam.reason === 'honeypot' || spam.reason === 'too-fast') return { status: 'success', recap: [], firstName: '' }; // robot : réponse neutre
    return { status: 'error', message: spam.reason === 'captcha' ? 'La vérification anti-robot a échoué. Merci de réessayer.' : 'Le formulaire a expiré : rechargez la page puis renvoyez votre demande.' };
  }
  if (!(await formRateLimit('devis', ctx.ipHash, 5, 3600))) {
    return { status: 'error', message: 'Trop de demandes envoyées depuis cette connexion. Merci de réessayer dans une heure ou de nous appeler.' };
  }

  const parsed = quoteSchema.safeParse({
    firstName: str(fd, 'firstName'), lastName: str(fd, 'lastName'), email: str(fd, 'email'), phone: str(fd, 'phone'),
    company: str(fd, 'company'), message: str(fd, 'message'), direction: str(fd, 'direction'), prestation: str(fd, 'prestation'),
    frequency: str(fd, 'frequency'), city: str(fd, 'city'), sourcePage: str(fd, 'sourcePage'),
  });
  if (!parsed.success) return { status: 'error', message: firstIssue(parsed.error), fields: fieldErrors(parsed.error) };
  const d = parsed.data;

  // Photos (facultatives) : contrôle du type réel, conversion HEIC, réduction, stockage privé
  const files = fd.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_PHOTOS);
  const photos: { url: string; pathname: string; name: string; size: number }[] = [];
  for (const file of files) {
    if (file.size > MAX_PHOTO_BYTES) return { status: 'error', message: `La photo « ${file.name} » dépasse 12 Mo.` };
    const buf = Buffer.from(await file.arrayBuffer());
    const type = detectType(buf);
    if (!isImageType(type)) return { status: 'error', message: `« ${file.name} » n'est pas une image acceptée (JPG, PNG, WebP ou HEIC).` };
    try {
      const img = await processImage(buf, type!, 2000, 80);
      const stored = await storePrivate(img.buffer, file.name.replace(/\.[^.]+$/, '') + img.extension, img.contentType, 'devis');
      photos.push({ url: stored.url, pathname: stored.pathname, name: file.name, size: stored.size });
    } catch (error) {
      console.error('[devis] photo illisible', error);
      return { status: 'error', message: `La photo « ${file.name} » n'a pas pu être lue. Essayez une autre image ou envoyez votre demande sans photo.` };
    }
  }

  const serviceLabel = d.prestation && d.prestation !== 'À définir ensemble' ? d.prestation : d.direction;
  const service = d.prestation ? await prisma.service.findFirst({ where: { title: d.prestation }, select: { slug: true } }) : null;
  const request = await prisma.quoteRequest.create({
    data: {
      kind: d.direction === 'Presse' ? 'presse' : 'devis',
      firstName: d.firstName, lastName: d.lastName, company: d.company, email: d.email, phone: d.phone, city: d.city,
      serviceSlug: service?.slug, serviceLabel, frequency: d.frequency, message: d.message,
      attachments: photos.length ? photos : undefined, sourcePage: d.sourcePage,
      consentAt: new Date(), ipHash: ctx.ipHash, userAgent: ctx.userAgent,
    },
  });

  const settings = await getSettings();
  const { company, notifications } = settings;
  const recap = [
    { k: 'Prestation', v: serviceLabel },
    { k: 'Fréquence', v: d.frequency },
    { k: 'Réponse envoyée à', v: d.email },
    ...(photos.length ? [{ k: 'Photos jointes', v: String(photos.length) }] : []),
  ];
  const adminUrl = absoluteUrl(`${ADMIN_BASE_PATH}/demandes/${request.id}`, company.website);
  const photoLinks = photos.map((p) => absoluteUrl(p.url, company.website));
  const notif = quoteNotification({
    fields: [['Nom', `${d.firstName} ${d.lastName}`], ['Entreprise', d.company], ['E-mail', d.email], ['Téléphone', d.phone], ['Type de besoin', d.direction], ['Prestation', d.prestation], ['Fréquence', d.frequency], ['Page d\'origine', d.sourcePage]],
    message: d.message, adminUrl, photos: photoLinks,
  });
  const sent = await sendMail({ to: notifications.quoteRecipients, subject: `Demande de devis — ${d.firstName} ${d.lastName}${serviceLabel ? ` · ${serviceLabel}` : ''}`, ...notif, replyTo: d.email, fromName: notifications.senderName });
  let ack = false;
  if (notifications.sendAcknowledgement) {
    const a = quoteAcknowledgement({ firstName: d.firstName, recap: recap.map((r) => [r.k, r.v] as [string, string]), company: { name: company.name, phone: company.phone, email: company.email, address: `${company.street}, ${company.postalCode} ${company.city}`, website: company.website } });
    ack = (await sendMail({ to: d.email, subject: 'Votre demande de devis ASPEO a bien été reçue', ...a, replyTo: company.email, fromName: notifications.senderName })).sent;
  }
  await prisma.quoteRequest.update({ where: { id: request.id }, data: { emailSent: sent.sent, ackSent: ack } });

  return { status: 'success', recap, firstName: d.firstName };
}

const applicationSchema = z.object({
  firstName: z.string().trim().min(1, 'Indiquez votre prénom.').max(60),
  lastName: z.string().trim().min(1, 'Indiquez votre nom.').max(60),
  email: z.string().trim().email('Adresse e-mail invalide.').max(160),
  phone,
  city: optional(120),
  message: optional(3000),
  jobId: optional(60),
  consent: z.literal('on', { errorMap: () => ({ message: 'Merci d\'accepter le traitement de votre candidature.' }) }),
});

/** Candidature (offre précise ou spontanée), CV en pièce jointe. */
export async function submitApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  const ctx = await clientContext();
  const spam = await checkSpam(fd, ctx.ip);
  if (!spam.ok) {
    if (spam.reason === 'honeypot' || spam.reason === 'too-fast') return { status: 'success', recap: [], firstName: '' };
    return { status: 'error', message: 'Le formulaire a expiré : rechargez la page puis renvoyez votre candidature.' };
  }
  if (!(await formRateLimit('candidature', ctx.ipHash, 5, 3600))) return { status: 'error', message: 'Trop de candidatures envoyées depuis cette connexion. Merci de réessayer plus tard.' };

  const parsed = applicationSchema.safeParse({ firstName: str(fd, 'firstName'), lastName: str(fd, 'lastName'), email: str(fd, 'email'), phone: str(fd, 'phone'), city: str(fd, 'city'), message: str(fd, 'message'), jobId: str(fd, 'jobId'), consent: str(fd, 'consent') });
  if (!parsed.success) return { status: 'error', message: firstIssue(parsed.error), fields: fieldErrors(parsed.error) };
  const d = parsed.data;

  const job = d.jobId ? await prisma.job.findFirst({ where: { id: d.jobId, status: 'PUBLISHED' } }) : null;
  const cv = fd.get('cv');
  let cvUrl: string | null = null;
  let cvName: string | null = null;
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_CV_BYTES) return { status: 'error', message: 'Le CV dépasse 6 Mo.' };
    const buf = Buffer.from(await cv.arrayBuffer());
    const type = detectType(buf);
    if (!type || type === 'image/gif') return { status: 'error', message: 'Format de CV non accepté (PDF, Word, JPG, PNG ou HEIC).' };
    let content: Buffer = buf; let name = cv.name; let contentType: string = type;
    if (isImageType(type)) {
      const img = await processImage(buf, type, 2400, 85);
      content = img.buffer; name = cv.name.replace(/\.[^.]+$/, '') + img.extension; contentType = img.contentType;
    }
    const stored = await storePrivate(content, name, contentType, 'candidatures');
    cvUrl = stored.url; cvName = cv.name;
  }

  const application = await prisma.jobApplication.create({
    data: { jobId: job?.id, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, city: d.city, message: d.message, cvUrl, cvName, consentAt: new Date(), ipHash: ctx.ipHash },
  });

  const { company, notifications } = await getSettings();
  const notif = applicationNotification({
    fields: [['Candidat', `${d.firstName} ${d.lastName}`], ['Poste', job ? `${job.title}${job.location ? ` (${job.location})` : ''}` : 'Candidature spontanée'], ['E-mail', d.email], ['Téléphone', d.phone], ['Ville', d.city], ['CV', cvName]],
    message: d.message ?? null, adminUrl: absoluteUrl(`${ADMIN_BASE_PATH}/candidatures`, company.website), cvUrl: cvUrl ? absoluteUrl(cvUrl, company.website) : null,
  });
  const sent = await sendMail({ to: notifications.jobRecipients, subject: `Candidature — ${d.firstName} ${d.lastName}${job ? ` · ${job.title}` : ''}`, ...notif, replyTo: d.email, fromName: notifications.senderName });
  if (notifications.sendAcknowledgement) {
    const a = applicationAcknowledgement({ firstName: d.firstName, jobTitle: job?.title ?? null, company: { name: company.name, phone: company.phone, email: company.email, address: `${company.street}, ${company.postalCode} ${company.city}`, website: company.website } });
    await sendMail({ to: d.email, subject: 'Votre candidature chez ASPEO', ...a, fromName: notifications.senderName });
  }
  await prisma.jobApplication.update({ where: { id: application.id }, data: { emailSent: sent.sent } });
  return { status: 'success', recap: [{ k: 'Poste', v: job?.title ?? 'Candidature spontanée' }], firstName: d.firstName };
}
