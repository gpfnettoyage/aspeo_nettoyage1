export function slugify(title: string): string {
  return title
    .toLowerCase() // Met en minuscules
    .trim() // Supprime les espaces au début et à la fin
    .normalize('NFD') // Normalise les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les marques diacritiques
    .replace(/\s*\/\s*/g, '-') // Remplace les "/" avec espaces autour par un seul tiret
    .replace(/\s*&\s*/g, '-') // Remplace les "&" avec espaces autour par un seul tiret
    .replace(/[\s:;,.!?*+%]/g, '-') // Remplace les autres espaces et caractères spéciaux par des tirets
    .replace(/-+/g, '-') // Remplace plusieurs tirets consécutifs par un seul
    .replace(/^-|-$/g, '') // Supprime les tirets en début et fin de chaîne
    .replace(/[^a-z0-9-]/g, '') // Supprime tous les autres caractères non autorisés
    .replace(/-+/g, '-') // Remplace à nouveau plusieurs tirets consécutifs par un seul
    .replace(/^-|-$/g, ''); // Supprime les tirets en début et fin de chaîne
}
