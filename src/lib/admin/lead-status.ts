import type { Tone } from '@/components/admin/ui';

/** Statuts des demandes et candidatures (libellés de la maquette). */
export const LEAD_STATUS: Record<string, { label: string; tone: Tone }> = {
  NEW: { label: 'Nouveau', tone: 'orange' },
  IN_PROGRESS: { label: 'En cours', tone: 'blue' },
  QUOTED: { label: 'Devis envoyé', tone: 'violet' },
  DONE: { label: 'Clôturé', tone: 'gray' },
  SPAM: { label: 'Indésirable', tone: 'red' },
};
