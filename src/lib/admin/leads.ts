import 'server-only';
import type { JobApplication, Job, QuoteRequest } from '@prisma/client';
import type { LeadRow } from '@/components/admin/LeadsBoard';

const when = (d: Date) => d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(' à ', ' · ');
const CLIENT: Record<string, string> = { particulier: 'Particulier', professionnel: 'Professionnel', entreprise: 'Entreprise', collectivite: 'Collectivité', bailleur: 'Bailleur', syndic: 'Syndic' };
const isImage = (name: string) => /\.(webp|jpe?g|png|gif|avif)$/i.test(name);

export function quoteRows(rows: QuoteRequest[]): LeadRow[] {
  return rows.map((r) => {
    const files = Array.isArray(r.attachments) ? (r.attachments as { url?: string; name?: string }[]).filter((f) => f?.url) : [];
    const client = r.clientType ? CLIENT[r.clientType] ?? r.clientType : '';
    return {
      id: r.id, date: when(r.createdAt), name: [r.firstName, r.lastName].filter(Boolean).join(' '), org: r.company || client || (r.kind === 'contact' ? 'Message' : 'Particulier'),
      email: r.email, phone: r.phone, need: r.serviceLabel || (r.kind === 'contact' ? 'Message de contact' : 'À définir ensemble'), needSub: [r.city, r.postalCode].filter(Boolean).join(' '),
      frequency: r.frequency ?? '', status: r.status, notes: r.notes ?? '', message: r.message,
      details: [
        ...(client ? [{ k: 'Type de client', v: client }] : []),
        ...(r.serviceLabel ? [{ k: 'Prestation', v: r.serviceLabel }] : []),
        ...(r.frequency ? [{ k: 'Fréquence', v: r.frequency }] : []),
        ...(r.surface ? [{ k: 'Surface', v: r.surface }] : []),
        ...(r.city || r.postalCode ? [{ k: 'Lieu', v: [r.postalCode, r.city].filter(Boolean).join(' ') }] : []),
        ...(r.sourcePage ? [{ k: 'Envoyée depuis', v: r.sourcePage }] : []),
        { k: 'Notification', v: r.emailSent ? 'E-mail envoyé' : 'E-mail non envoyé (SMTP)' },
        { k: 'Consentement', v: when(r.consentAt) },
      ],
      files: files.map((f) => ({ url: f.url!, name: f.name ?? 'photo', image: true })),
    };
  });
}

export function applicationRows(rows: (JobApplication & { job: Pick<Job, 'title'> | null })[]): LeadRow[] {
  return rows.map((r) => ({
    id: r.id, date: when(r.createdAt), name: `${r.firstName} ${r.lastName}`, org: r.city ?? '', email: r.email, phone: r.phone,
    need: r.job?.title ?? 'Candidature spontanée', needSub: '', frequency: '', status: r.status, notes: '', message: r.message ?? '',
    details: [{ k: 'Poste', v: r.job?.title ?? 'Candidature spontanée' }, ...(r.city ? [{ k: 'Ville', v: r.city }] : []), { k: 'Consentement', v: when(r.consentAt) }],
    files: r.cvUrl ? [{ url: r.cvUrl, name: r.cvName ?? 'CV', image: isImage(r.cvUrl) }] : [],
  }));
}
