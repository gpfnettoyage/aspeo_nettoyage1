/** Types « vue » des contenus publics (indépendants des modèles Prisma). */

export interface ServiceLongformSection { title: string; text: string }
export interface ServiceFaq { question: string; answer: string }

/** Champs de contenu d'un service (Service.content, JSON). Les champs « legacy » du site actuel sont conservés. */
export interface ServiceContentV2 {
  images?: string[];
  imageAlts?: string[];
  descriptions?: string[];
  tagline?: string;
  problem?: string;
  risks?: string;
  intervention?: string;
  benefits?: string;
  firstSteps?: string[];
  whyFast?: string;
  audience?: string[];
  delay?: string | null;
  notIncluded?: string[];
  testimonialAuthor?: string | null;
  includes?: string[];
  longform?: ServiceLongformSection[];
  tiers?: Record<string, string> | null;
  faq?: ServiceFaq[];
  // Champs du site actuel (conservés)
  introText?: string;
  contextText?: string;
  subServices?: { name: string; description: string }[];
  [key: string]: unknown;
}

export interface ServiceSummary {
  id: string;
  slug: string;
  href: string;
  title: string;
  short: string;
  tagline: string;
  image: string | null;
  pole: 'professionnel' | 'specialise';
  categorySlug: string | null;
  published: boolean;
}

export interface ServiceDetail extends ServiceSummary {
  seoTitle: string | null;
  seoDesc: string | null;
  categoryName: string | null;
  content: ServiceContentV2;
  updatedAt: Date;
}

export interface CategoryMethod { title: string; intro: string; steps: string[]; calloutTitle: string; calloutText: string }
export interface CategoryContent {
  menuLabel?: string;
  heroTitle?: string;
  heroText?: string;
  image?: string;
  method?: CategoryMethod | null;
  cta?: { title: string; text: string } | null;
  [key: string]: unknown;
}

export interface CategoryWithServices {
  id: string;
  slug: string;
  href: string;
  name: string;
  description: string | null;
  pole: 'professionnel' | 'specialise';
  content: CategoryContent;
  seoTitle: string | null;
  seoDesc: string | null;
  published: boolean;
  services: ServiceSummary[];
}

export interface Catalog {
  categories: CategoryWithServices[];
  services: ServiceSummary[];
}

export interface ArticleSummary {
  slug: string;
  href: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  image: string | null;
  imageAlt: string | null;
  publishedAt: Date | null;
}

export interface Fact { k: string; v: string }
