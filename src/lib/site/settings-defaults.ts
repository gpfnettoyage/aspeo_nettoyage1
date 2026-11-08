/**
 * Réglages globaux du site (table SiteSetting) — types, schémas de validation et valeurs par défaut.
 * Les valeurs par défaut reprennent les informations confirmées du site actuel (src/data/company.json)
 * et de la maquette. Elles servent de repli tant qu'un réglage n'a pas été enregistré depuis l'admin.
 */
import { z } from 'zod';

const link = z.object({ label: z.string().min(1).max(80), href: z.string().min(1).max(300), visible: z.boolean().default(true) });

export const companySchema = z.object({
  name: z.string().min(1).max(120),
  legalName: z.string().max(120),
  legalForm: z.string().max(40),
  capital: z.string().max(60),
  rcs: z.string().max(80),
  siret: z.string().max(40),
  vat: z.string().max(40),
  publicationDirector: z.string().max(120),
  street: z.string().min(1).max(160),
  postalCode: z.string().min(1).max(10),
  city: z.string().min(1).max(80),
  department: z.string().max(80),
  region: z.string().max(80),
  phone: z.string().min(1).max(30),
  phoneIntl: z.string().min(1).max(20),
  email: z.string().email(),
  website: z.string().url(),
  hoursShort: z.string().max(120),
  hours: z.array(z.object({ days: z.string().max(40), value: z.string().max(80) })).max(10),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  facebook: z.string().url().or(z.literal('')),
  instagram: z.string().url().or(z.literal('')),
  linkedin: z.string().url().or(z.literal('')),
  googleBusiness: z.string().url().or(z.literal('')),
  googleReviewUrl: z.string().url().or(z.literal('')),
  host: z.string().max(300),
});
export type CompanySettings = z.infer<typeof companySchema>;

export const identitySchema = z.object({
  logo: z.string().min(1),
  logoWhite: z.string().min(1),
  icon: z.string().min(1),
  ogImage: z.string(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export type IdentitySettings = z.infer<typeof identitySchema>;

export const statsSchema = z.object({
  showCounters: z.boolean(),
  clients: z.number().int().min(0),
  clientsLabel: z.string().max(60),
  satisfaction: z.number().int().min(0).max(100),
  satisfactionLabel: z.string().max(60),
  years: z.number().int().min(0),
  yearsLabel: z.string().max(60),
  googleRating: z.number().min(0).max(5),
  googleReviewCount: z.number().int().min(0),
});
export type StatsSettings = z.infer<typeof statsSchema>;

export const notificationsSchema = z.object({
  quoteRecipients: z.array(z.string().email()).min(1).max(10),
  jobRecipients: z.array(z.string().email()).min(1).max(10),
  sendAcknowledgement: z.boolean(),
  senderName: z.string().min(1).max(80),
});
export type NotificationSettings = z.infer<typeof notificationsSchema>;

export const seoSchema = z.object({
  siteName: z.string().min(1).max(60),
  defaultTitle: z.string().min(1).max(70),
  defaultDescription: z.string().min(1).max(170),
  titleSuffix: z.string().max(30),
  googleSiteVerification: z.string().max(120),
});
export type SeoSettings = z.infer<typeof seoSchema>;

export const navigationSchema = z.object({
  topbar: z.array(link).max(6),
  companyLinks: z.array(link).max(12),
  legalLinks: z.array(link).max(8),
  ctaLabel: z.string().min(1).max(40),
});
export type NavigationSettings = z.infer<typeof navigationSchema>;

export const SETTINGS_SCHEMAS = {
  company: companySchema,
  identity: identitySchema,
  stats: statsSchema,
  notifications: notificationsSchema,
  seo: seoSchema,
  navigation: navigationSchema,
} as const;
export type SettingKey = keyof typeof SETTINGS_SCHEMAS;
export type SettingsMap = { [K in SettingKey]: z.infer<(typeof SETTINGS_SCHEMAS)[K]> };

export const DEFAULT_SETTINGS: SettingsMap = {
  company: {
    name: 'ASPEO Nettoyage',
    legalName: 'ASPEO',
    legalForm: 'SAS',
    capital: '1000 euros',
    rcs: 'Saint-Etienne',
    siret: '930990965',
    vat: 'FR12930990965',
    publicationDirector: 'Hamon Théo',
    street: '43 Rue de la République',
    postalCode: '42360',
    city: 'Panissières',
    department: 'Loire',
    region: 'Auvergne-Rhône-Alpes',
    phone: '04 28 53 00 02',
    phoneIntl: '+33428530002',
    email: 'contact@aspeo.fr',
    website: 'https://www.aspeo.fr',
    hoursShort: 'Lun–Jeu 7h30-18h30 · Ven 8h-16h',
    hours: [
      { days: 'Lundi – Jeudi', value: '7h30 – 12h00 · 13h00 – 18h30' },
      { days: 'Vendredi', value: '8h00 – 16h00' },
      { days: 'Samedi – Dimanche', value: 'Fermé' },
    ],
    latitude: 45.70634633777296,
    longitude: 4.343792836277721,
    facebook: 'https://www.facebook.com/aspeonettoyage',
    instagram: 'https://www.instagram.com/aspeo_nettoyage',
    linkedin: 'https://www.linkedin.com/company/aspeo_nettoyage/',
    googleBusiness: 'https://maps.app.goo.gl/ZxZqwfi7CzU3zBnB6',
    // Lien de dépôt d'avis Google repris de la maquette.
    googleReviewUrl: 'https://share.google/V4g9mDrTE3zthSV6b',
    host: 'Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis',
  },
  identity: {
    logo: '/img/brand/logo-aspeo-couleur.svg',
    logoWhite: '/img/brand/logo-aspeo-blanc.svg',
    icon: '/img/brand/aspeo-icone.svg',
    ogImage: '/img/brand/og-aspeo.jpg',
    accent: '#FF5C00',
  },
  stats: {
    // Valeurs de la maquette, marquées « à confirmer » par ASPEO.
    showCounters: true,
    clients: 150,
    clientsLabel: 'Clients satisfaits',
    satisfaction: 100,
    satisfactionLabel: 'Taux de satisfaction',
    years: 2,
    yearsLabel: "Années d'expérience",
    googleRating: 5,
    googleReviewCount: 22,
  },
  notifications: {
    quoteRecipients: ['contact@aspeo.fr'],
    jobRecipients: ['contact@aspeo.fr'],
    sendAcknowledgement: true,
    senderName: 'ASPEO Nettoyage',
  },
  seo: {
    siteName: 'ASPEO',
    defaultTitle: 'Nettoyage professionnel Loire & Rhône | ASPEO',
    defaultDescription:
      'Nettoyage de bureaux, commerces, sites industriels et chantiers, interventions Diogène et logements insalubres en Loire et Rhône. Devis gratuit après visite.',
    titleSuffix: ' | ASPEO',
    googleSiteVerification: '',
  },
  navigation: {
    topbar: [{ label: 'Nous rejoindre', href: '/nous-rejoindre', visible: true }],
    companyLinks: [
      { label: 'Accueil', href: '/', visible: true },
      { label: 'Notre Histoire', href: '/a-propos', visible: true },
      { label: 'Grands Comptes & Marchés Publics', href: '/grands-comptes', visible: true },
      { label: 'Médias', href: '/medias', visible: true },
      { label: 'Presse', href: '/medias/presse', visible: true },
      { label: "Zones d'intervention", href: '/zones-intervention', visible: true },
      { label: 'Demander un devis', href: '/contact', visible: true },
    ],
    legalLinks: [
      { label: 'Mentions légales', href: '/mentions-legales', visible: true },
      { label: 'Confidentialité', href: '/politique-de-confidentialite', visible: true },
      { label: 'CGU', href: '/conditions-generales-d-utilisation', visible: true },
      { label: 'Cookies', href: '/politique-des-cookies', visible: true },
    ],
    ctaLabel: 'Demander un devis',
  },
};
