/** Petits utilitaires de texte partagés (serveur et client). */

/** Première phrase d'un texte (accroches des cartes). */
export const firstSentence = (t: string | null | undefined) => {
  const s = (t ?? '').trim();
  const m = s.match(/^[^.!?]+[.!?]/);
  return m ? m[0] : s;
};

/** Découpe un texte en paragraphes (ligne vide = nouveau paragraphe). */
export const toParagraphs = (t: string | null | undefined) => (t ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Initiales d'un nom (avatars des avis). */
export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
