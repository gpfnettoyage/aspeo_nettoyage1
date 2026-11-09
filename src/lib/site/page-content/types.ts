/**
 * Modèle des contenus éditables des pages fixes.
 * Chaque page déclare ses sections et ses champs ; la valeur par défaut est le texte
 * de la maquette. L'administration génère ses formulaires à partir de ces déclarations
 * et n'enregistre en base (Page.content) que les valeurs saisies.
 */
export type ScalarFieldType = 'text' | 'textarea' | 'image' | 'url';

export interface ScalarField {
  key: string;
  label: string;
  type: ScalarFieldType;
  default: string;
  help?: string;
  maxLength?: number;
}

export interface ListField {
  key: string;
  label: string;
  type: 'list';
  itemLabel: string;
  itemFields: ScalarField[];
  default: Record<string, string>[];
  max?: number;
  help?: string;
}

export type FieldDef = ScalarField | ListField;

export interface PageSection {
  id: string;
  title: string;
  fields: FieldDef[];
}

export interface PageContentModel {
  key: string;
  sections: PageSection[];
}

export type PageValues = Record<string, string | Record<string, string>[]>;

export const text = (key: string, label: string, def: string, extra: Partial<ScalarField> = {}): ScalarField => ({ key, label, type: 'text', default: def, ...extra });
export const area = (key: string, label: string, def: string, extra: Partial<ScalarField> = {}): ScalarField => ({ key, label, type: 'textarea', default: def, ...extra });
export const image = (key: string, label: string, def: string, extra: Partial<ScalarField> = {}): ScalarField => ({ key, label, type: 'image', default: def, ...extra });
export const list = (key: string, label: string, itemLabel: string, itemFields: ScalarField[], def: Record<string, string>[], extra: Partial<ListField> = {}): ListField => ({ key, label, type: 'list', itemLabel, itemFields, default: def, ...extra });
