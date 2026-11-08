/**
 * Définitions des formulaires d'administration (données pures, utilisables côté serveur
 * et côté navigateur). Chaque champ est repéré par un chemin (« title », « content.problem »…)
 * dans l'enregistrement Prisma.
 */
export type AdminFieldType =
  | 'text' | 'textarea' | 'markdown' | 'slug' | 'url' | 'email'
  | 'image' | 'gallery'
  | 'select' | 'relation'
  | 'number' | 'toggle' | 'date'
  | 'lines' | 'list';

export interface AdminField {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  max?: number;
  min?: number;
  rows?: number;
  help?: string;
  placeholder?: string;
  half?: boolean;
  options?: { value: string; label: string }[];
  /** Pour `relation` : liste chargée côté serveur. */
  relation?: 'categories' | 'services' | 'jobs';
  /** Valeur enregistrée pour une relation : identifiant (défaut) ou slug. */
  valueKey?: 'id' | 'slug';
  /** Pour `list` : sous-champs de chaque élément. */
  itemFields?: AdminField[];
  itemLabel?: string;
  maxItems?: number;
  /** Compteur de caractères recommandé (SEO). */
  recommended?: [number, number];
}

export interface AdminFieldGroup { title: string; description?: string; fields: AdminField[] }

export type StatusMode = 'content' | 'boolean' | 'none';

export interface ListColumn { label: string; path: string; kind?: 'text' | 'date' | 'status' | 'relation' | 'badge' }

export interface CollectionDef {
  key: string;
  label: string;
  singular: string;
  /** Article défini/indéfini pour les libellés (« un service », « une ville »). */
  gender: 'm' | 'f';
  icon: string;
  intro?: string;
  status: StatusMode;
  /** Modifications d'un contenu publié enregistrées comme brouillon (colonne `draft`). */
  draft: boolean;
  /** Champ source du slug automatique. */
  slugFrom?: string;
  /** Modèle d'URL publique, ex. « /proprete-services/{slug} ». */
  publicPath?: string;
  seo: boolean;
  groups: AdminFieldGroup[];
  list: { title: string; subtitle?: string; image?: string; columns: ListColumn[]; search: string[]; filter?: { path: string; label: string; options: { value: string; label: string }[] } };
  orderBy: Record<string, 'asc' | 'desc'>[];
}

// ------------------------------------------------------------------ Aides de construction

export const f = {
  text: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'text', ...o }),
  area: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'textarea', rows: 4, ...o }),
  md: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'markdown', rows: 14, ...o }),
  slug: (o: Partial<AdminField> = {}): AdminField => ({ name: 'slug', label: 'Adresse de la page (identifiant URL)', type: 'slug', required: true, max: 120, help: 'Minuscules, chiffres et tirets. Modifier l\'adresse d\'un contenu publié crée automatiquement une redirection 301.', ...o }),
  image: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'image', ...o }),
  gallery: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'gallery', maxItems: 8, ...o }),
  select: (name: string, label: string, options: { value: string; label: string }[], o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'select', options, ...o }),
  relation: (name: string, label: string, relation: AdminField['relation'], o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'relation', relation, ...o }),
  number: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'number', ...o }),
  toggle: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'toggle', ...o }),
  date: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'date', ...o }),
  lines: (name: string, label: string, o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'lines', rows: 5, help: 'Un élément par ligne.', ...o }),
  list: (name: string, label: string, itemLabel: string, itemFields: AdminField[], o: Partial<AdminField> = {}): AdminField => ({ name, label, type: 'list', itemLabel, itemFields, maxItems: 20, ...o }),
};

export const SEO_GROUP: AdminFieldGroup = {
  title: 'Référencement (SEO)',
  description: 'Laissés vides, le titre et la description sont générés automatiquement à partir du contenu.',
  fields: [
    f.text('seoTitle', 'Titre SEO (balise title)', { max: 70, recommended: [30, 60] }),
    f.area('seoDesc', 'Méta-description', { max: 170, rows: 3, recommended: [110, 160] }),
  ],
};

/** Champs d'une collection, groupes aplatis. */
export const allAdminFields = (def: CollectionDef) => def.groups.flatMap((g) => g.fields);
