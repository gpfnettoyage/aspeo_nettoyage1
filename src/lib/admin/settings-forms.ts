/**
 * Formulaires des réglages (module pur) : définitions des champs par réglage et conversion
 * entre l'objet validé par zod (settings-defaults) et les valeurs de formulaire.
 */
import type { AdminField, AdminFieldGroup } from './fields';
import { f } from './fields';
import type { FormValues } from './values';
import { SETTINGS_SCHEMAS, type SettingKey } from '@/lib/site/settings-defaults';

const linkItem = [f.text('label', 'Libellé', { required: true }), f.text('href', 'Adresse (ex. /contact)', { required: true }), f.toggle('visible', 'Affiché')];

export const SETTINGS_FORMS: Record<SettingKey, AdminFieldGroup[]> = {
  company: [
    { title: 'Entreprise & coordonnées', fields: [
      f.text('name', 'Nom de l’entreprise', { required: true, max: 120 }),
      f.text('street', 'Adresse', { required: true }), f.text('postalCode', 'Code postal', { required: true, half: true }), f.text('city', 'Ville', { required: true, half: true }),
      f.text('department', 'Département', { half: true }), f.text('region', 'Région', { half: true }),
      f.text('phone', 'Téléphone (affiché)', { required: true, half: true, help: 'Repris dans l’en-tête, les boutons « Appeler », le pied de page et les données Google.' }),
      f.text('phoneIntl', 'Téléphone international (lien tel:)', { required: true, half: true, placeholder: '+33428530002' }),
      { ...f.text('email', 'E-mail de contact', { required: true }), type: 'email' },
      { ...f.text('website', 'Adresse du site', { required: true }), type: 'url' },
      f.number('latitude', 'Latitude (carte)', { half: true }), f.number('longitude', 'Longitude (carte)', { half: true }),
    ] },
    { title: 'Horaires', fields: [
      f.text('hoursShort', 'Horaires (version courte)', { max: 120, help: 'Affichée dans le pied de page et la page Contact.' }),
      f.list('hours', 'Horaires détaillés', 'Ligne', [f.text('days', 'Jours', { required: true }), f.text('value', 'Horaires', { required: true })], { maxItems: 10 }),
    ] },
    { title: 'Réseaux & avis Google', fields: [
      { ...f.text('facebook', 'Facebook'), type: 'url' }, { ...f.text('instagram', 'Instagram'), type: 'url' }, { ...f.text('linkedin', 'LinkedIn'), type: 'url' },
      { ...f.text('googleBusiness', 'Fiche Google Business'), type: 'url' },
      { ...f.text('googleReviewUrl', 'Lien « Laisser un avis Google »'), type: 'url' },
    ] },
    { title: 'Mentions légales', description: 'Reprises dans les pages légales.', fields: [
      f.text('legalName', 'Raison sociale', { half: true }), f.text('legalForm', 'Forme juridique', { half: true }), f.text('capital', 'Capital social', { half: true }),
      f.text('rcs', 'RCS', { half: true }), f.text('siret', 'SIRET / SIREN', { half: true }), f.text('vat', 'N° TVA intracommunautaire', { half: true }),
      f.text('publicationDirector', 'Directeur de la publication'), f.text('host', 'Hébergeur'),
    ] },
  ],
  identity: [
    { title: 'Logo & identité', description: 'Les logos officiels ne sont jamais redessinés : remplacez-les uniquement par un fichier fourni par ASPEO.', fields: [
      f.image('logo', 'Logo couleur (en-tête)'), f.image('logoWhite', 'Logo blanc (pied de page, fonds sombres)'), f.image('icon', 'Icône (onglet du navigateur)'),
      f.image('ogImage', 'Image de partage par défaut (réseaux sociaux)'),
      f.text('accent', 'Couleur d’accent', { half: true, help: 'Format #RRGGBB. Valeur de la charte : #FF5C00.' }),
    ] },
  ],
  stats: [
    { title: 'Chiffres clés', description: 'Affichés sur l’accueil et la page Notre Histoire. N’affichez que des chiffres vérifiables.', fields: [
      f.toggle('showCounters', 'Afficher les compteurs'),
      f.number('clients', 'Clients', { half: true, min: 0 }), f.text('clientsLabel', 'Libellé', { half: true }),
      f.number('satisfaction', 'Satisfaction (%)', { half: true, min: 0, max: 100 }), f.text('satisfactionLabel', 'Libellé', { half: true }),
      f.number('years', 'Années d’expérience', { half: true, min: 0 }), f.text('yearsLabel', 'Libellé', { half: true }),
      f.number('googleRating', 'Note Google (sur 5)', { half: true, min: 0, max: 5 }), f.number('googleReviewCount', 'Nombre d’avis Google', { half: true, min: 0 }),
    ] },
  ],
  notifications: [
    { title: 'Notifications par e-mail', description: 'Destinataires des formulaires du site.', fields: [
      f.lines('quoteRecipients', 'Destinataires des demandes de devis', { help: 'Une adresse par ligne (10 maximum).' }),
      f.lines('jobRecipients', 'Destinataires des candidatures', { help: 'Une adresse par ligne (10 maximum).' }),
      f.toggle('sendAcknowledgement', 'Envoyer un accusé de réception à la personne qui écrit'),
      f.text('senderName', 'Nom de l’expéditeur', { required: true }),
    ] },
  ],
  seo: [
    { title: 'Référencement : réglages généraux', fields: [
      f.text('siteName', 'Nom du site', { required: true, half: true }), f.text('titleSuffix', 'Suffixe des titres', { half: true }),
      f.text('defaultTitle', 'Titre par défaut', { required: true, max: 70, recommended: [30, 60] }),
      f.area('defaultDescription', 'Description par défaut', { required: true, max: 170, rows: 3, recommended: [110, 160] }),
      f.text('googleSiteVerification', 'Code de validation Google Search Console', { help: 'Contenu de la balise meta google-site-verification.' }),
    ] },
  ],
  navigation: [
    { title: 'Barre du haut', description: 'Petite barre au-dessus du menu principal. Le menu principal et ses sous-menus sont générés depuis les activités et services publiés.', fields: [
      f.list('topbar', 'Liens', 'Lien', linkItem, { maxItems: 6, addLabel: 'Ajouter un lien' }),
      f.text('ctaLabel', 'Bouton d’appel à l’action', { required: true, max: 40, help: 'Le bouton « Demander un devis » est toujours affiché.' }),
    ] },
    { title: 'Pied de page', description: 'La colonne « Nos services » est générée automatiquement depuis les services publiés.', fields: [
      f.list('companyLinks', 'Liens « ASPEO »', 'Lien', linkItem, { maxItems: 12, addLabel: 'Ajouter un lien' }),
      f.list('legalLinks', 'Liens légaux', 'Lien', linkItem, { maxItems: 8, addLabel: 'Ajouter un lien' }),
    ] },
  ],
};

const fieldsOf = (key: SettingKey): AdminField[] => SETTINGS_FORMS[key].flatMap((g) => g.fields);

export function settingsToValues(key: SettingKey, value: Record<string, unknown>): FormValues {
  const out: FormValues = {};
  for (const field of fieldsOf(key)) {
    const v = value[field.name];
    if (field.type === 'toggle') out[field.name] = v === true;
    else if (field.type === 'lines') out[field.name] = Array.isArray(v) ? v.join('\n') : '';
    else if (field.type === 'list') out[field.name] = Array.isArray(v) ? v.map((it) => Object.fromEntries((field.itemFields ?? []).map((s) => [s.name, s.type === 'toggle' ? String(it?.[s.name] !== false) : String(it?.[s.name] ?? '')]))) : [];
    else out[field.name] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

/** Valide les valeurs d'un réglage : objet complet (défauts conservés) ou erreurs par champ. */
export function valuesToSettings(key: SettingKey, values: FormValues, current: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; errors: Record<string, string> } {
  const obj: Record<string, unknown> = { ...current };
  for (const field of fieldsOf(key)) {
    const v = values[field.name];
    const str = typeof v === 'string' ? v.trim() : '';
    if (field.type === 'toggle') obj[field.name] = v === true;
    else if (field.type === 'number') obj[field.name] = str === '' ? (field.name === 'latitude' || field.name === 'longitude' ? null : 0) : Number(str.replace(',', '.'));
    else if (field.type === 'lines') obj[field.name] = str ? str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
    else if (field.type === 'list') obj[field.name] = (Array.isArray(v) ? (v as Record<string, string>[]) : [])
      .map((it) => Object.fromEntries((field.itemFields ?? []).map((s) => [s.name, s.type === 'toggle' ? it[s.name] !== 'false' : String(it[s.name] ?? '').trim()])))
      .filter((it) => Object.entries(it).some(([k, x]) => k !== 'visible' && x));
    else obj[field.name] = str;
  }
  const parsed = SETTINGS_SCHEMAS[key].safeParse(obj);
  if (parsed.success) return { ok: true, data: parsed.data as Record<string, unknown> };
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const name = String(issue.path[0] ?? '');
    if (errors[name]) continue;
    const field = fieldsOf(key).find((x) => x.name === name);
    errors[name] = issue.code === 'invalid_string' && issue.validation === 'email' ? 'Adresse e-mail invalide.'
      : issue.code === 'invalid_string' && issue.validation === 'url' ? 'Adresse invalide (commencez par https://).'
      : issue.code === 'too_small' ? (field?.type === 'list' || field?.type === 'lines' ? 'Au moins un élément.' : field?.type === 'number' ? 'Valeur trop petite.' : 'Champ obligatoire.')
      : issue.code === 'too_big' ? 'Valeur trop grande ou trop longue.'
      : issue.code === 'invalid_string' ? 'Format invalide.'
      : 'Valeur invalide.';
  }
  return { ok: false, errors };
}
