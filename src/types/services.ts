// ============================================
// Shared sub-types for service content
// ============================================
export interface ServiceExpertise {
  title: string;
  description: string;
  highlights: string[];
}

export interface ServicePrestationCategory {
  title: string;
  items: string[];
}

export interface ServiceProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceSubService {
  name: string;
  description: string;
}

export interface ServiceCTA {
  text?: string;
  anchor?: string;
}

export interface ServiceHeroBadge {
  icon: 'CheckCircle' | 'ShieldCheck' | 'Zap' | 'Clock' | 'Star' | 'Award' | 'Users' | 'MapPin' | 'Heart' | 'Sparkles';
  text: string;
}

// Default hero badges
export const DEFAULT_HERO_BADGES: ServiceHeroBadge[] = [
  { icon: 'CheckCircle', text: 'Service personnalisé' },
  { icon: 'ShieldCheck', text: 'Qualité garantie' },
  { icon: 'Zap', text: 'Intervention rapide' },
];

// CTA Section (final section at bottom of service page)
export interface ServiceCtaSection {
  title?: string;
  subtitle?: string;
  badges?: ServiceHeroBadge[];
}

// Default CTA section values
export const DEFAULT_CTA_SECTION: Required<ServiceCtaSection> = {
  title: 'Prêt à découvrir la différence ?',
  subtitle: 'Rejoignez nos clients qui nous font confiance pour maintenir leurs espaces dans un état parfait.',
  badges: [
    { icon: 'MapPin', text: 'Intervention en Loire et Rhône' },
    { icon: 'Clock', text: 'Réponse sous 24h garantie' },
    { icon: 'ShieldCheck', text: 'Devis gratuit et sans engagement' },
  ],
};

// ============================================
// Legacy JSON format (used in services.json)
// ============================================
export interface LegacyService {
  id: number;
  title: string;
  subtitle?: string;
  category?: string;
  image: string[];
  description: string[];
  expertise?: ServiceExpertise;
  introText?: string;
  contextText?: string;
  targetSpaces?: string[];
  prestationsCategories?: ServicePrestationCategory[];
  process?: ServiceProcessStep[];
  guarantees?: string[];
  applicationSectors?: string[];
  faq?: ServiceFAQ[];
  whyChoose?: string[];
  services: ServiceSubService[];
}

// ============================================
// Database Service Content (JSON field)
// ============================================
export interface ServiceContent {
  images: string[];
  descriptions: string[];
  expertise?: ServiceExpertise;
  introText?: string;
  contextText?: string;
  targetSpaces?: string[];
  prestationsCategories?: ServicePrestationCategory[];
  process?: ServiceProcessStep[];
  guarantees?: string[];
  applicationSectors?: string[];
  faq?: ServiceFAQ[];
  whyChoose?: string[];
  subServices: ServiceSubService[];
  cta?: ServiceCTA;
  heroBadges?: ServiceHeroBadge[];
  ctaSection?: ServiceCtaSection;
}

// ============================================
// Database Service Model (from Prisma)
// ============================================
export interface Service {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  categoryId: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  published: boolean;
  content: ServiceContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceWithCategory extends Service {
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

// ============================================
// Service with parsed content (for components)
// ============================================
export interface ServiceWithContent extends Omit<Service, 'content'> {
  // Flattened content for easier access in components
  images: string[];
  descriptions: string[];
  expertise?: ServiceExpertise;
  introText?: string;
  contextText?: string;
  targetSpaces?: string[];
  prestationsCategories?: ServicePrestationCategory[];
  process?: ServiceProcessStep[];
  guarantees?: string[];
  applicationSectors?: string[];
  faq?: ServiceFAQ[];
  whyChoose?: string[];
  subServices: ServiceSubService[];
  cta?: ServiceCTA;
  heroBadges?: ServiceHeroBadge[];
  ctaSection?: ServiceCtaSection;
}

// ServiceWithContent but also includes the category relation
export interface ServiceWithContentAndCategory extends ServiceWithContent {
  category: {
    id: string;
    name: string;
    slug: string;
    displayOrder: number;
  } | null;
}

export interface ServiceOption {
  value: string;
  label: string;
}

// ============================================
// Helper function to flatten service content
// ============================================
export function flattenService(service: Service): ServiceWithContent {
  const { content, ...rest } = service;
  return {
    ...rest,
    images: content.images,
    descriptions: content.descriptions,
    expertise: content.expertise,
    introText: content.introText,
    contextText: content.contextText,
    targetSpaces: content.targetSpaces,
    prestationsCategories: content.prestationsCategories,
    process: content.process,
    guarantees: content.guarantees,
    applicationSectors: content.applicationSectors,
    faq: content.faq,
    whyChoose: content.whyChoose,
    subServices: content.subServices,
    cta: content.cta,
    heroBadges: content.heroBadges,
    ctaSection: content.ctaSection,
  };
}
