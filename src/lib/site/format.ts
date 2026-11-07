/** Formats d'affichage (français). */
const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });
const LONG = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

/** « 12 janv. 2026 » (format de la maquette). */
export const formatDate = (d: Date | string | null | undefined) => (d ? DATE.format(new Date(d)) : '');
/** « 12 janvier 2026 ». */
export const formatDateLong = (d: Date | string | null | undefined) => (d ? LONG.format(new Date(d)) : '');
