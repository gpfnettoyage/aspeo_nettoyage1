import type { FieldDef, PageContentModel, PageValues } from './types';
import { homeContent } from './home';
import { servicesContent } from './services';
import { commonContent } from './common';
import { aboutContent } from './about';
import { zonesContent } from './zones';
import { realisationsContent } from './realisations';
import { mediasContent } from './medias';
import { pressContent } from './press';

/** Registre des modèles de contenu par clé de page (table Page). */
export const PAGE_CONTENT_MODELS: Record<string, PageContentModel> = Object.fromEntries(
  [homeContent, servicesContent, commonContent, aboutContent, zonesContent, realisationsContent, mediasContent, pressContent].map((m) => [m.key, m]),
);

export const allFields = (model: PageContentModel): FieldDef[] => model.sections.flatMap((s) => s.fields);

/** Accès typé aux valeurs d'une page : valeur saisie dans l'admin, sinon texte de la maquette. */
export interface PageAccessor {
  t: (key: string) => string;
  list: (key: string) => Record<string, string>[];
}

export function resolvePage(model: PageContentModel, stored: unknown): PageAccessor {
  const values = (stored && typeof stored === 'object' ? stored : {}) as PageValues;
  const defs = new Map(allFields(model).map((f) => [f.key, f]));
  return {
    t: (key) => {
      const v = values[key];
      if (typeof v === 'string' && v.trim()) return v;
      const def = defs.get(key);
      return def && def.type !== 'list' ? def.default : '';
    },
    list: (key) => {
      const v = values[key];
      if (Array.isArray(v)) return v.filter((item) => Object.values(item).some((x) => typeof x === 'string' && x.trim()));
      const def = defs.get(key);
      return def && def.type === 'list' ? def.default : [];
    },
  };
}

export type { PageContentModel } from './types';
