import { z } from 'zod';
import { slugify } from '@/utils/slugify';

const UNSAFE_SINGLE_LINE_CHARS =
  /[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/u;
const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

export function normalizeSingleLineText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function addSafeSingleLineIssues(
  value: string,
  ctx: z.RefinementCtx,
  options: {
    requiredMessage?: string;
    max: number;
    maxMessage: string;
    requireLetterOrNumber?: boolean;
  },
) {
  if (options.requiredMessage && value.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: options.requiredMessage,
    });
  }

  if (value.length > options.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: options.max,
      type: 'string',
      inclusive: true,
      message: options.maxMessage,
    });
  }

  if (UNSAFE_SINGLE_LINE_CHARS.test(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Le texte contient des caractères non autorisés',
    });
  }

  if (
    options.requireLetterOrNumber &&
    value.length > 0 &&
    !LETTER_OR_NUMBER.test(value)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Le texte doit contenir au moins une lettre ou un chiffre',
    });
  }
}

function requiredSafeSingleLineTextSchema(
  max: number,
  requiredMessage: string,
  maxMessage: string,
) {
  return z
    .string()
    .transform(normalizeSingleLineText)
    .superRefine((value, ctx) => {
      addSafeSingleLineIssues(value, ctx, {
        requiredMessage,
        max,
        maxMessage,
        requireLetterOrNumber: true,
      });
    });
}

function optionalSafeSingleLineTextSchema(max: number, maxMessage: string) {
  return z
    .string()
    .transform(normalizeSingleLineText)
    .superRefine((value, ctx) => {
      addSafeSingleLineIssues(value, ctx, {
        max,
        maxMessage,
        requireLetterOrNumber: false,
      });
    })
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional();
}

export const serviceSlugSchema = z
  .string()
  .transform((value) => slugify(value))
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Slug requis',
      });
    }

    if (value.length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 100,
        type: 'string',
        inclusive: true,
        message: 'Slug trop long',
      });
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets',
      });
    }
  });

export const serviceTitleSchema = requiredSafeSingleLineTextSchema(
  200,
  'Titre requis',
  'Titre trop long',
);
export const serviceSubtitleSchema = optionalSafeSingleLineTextSchema(
  300,
  'Sous-titre trop long',
);
export const serviceSeoTitleSchema = optionalSafeSingleLineTextSchema(
  70,
  'Titre SEO trop long (max 70 caractères)',
);
export const serviceSeoDescSchema = optionalSafeSingleLineTextSchema(
  160,
  'Description SEO trop longue (max 160 caractères)',
);

// ============================================
// Sub-schemas for service content
// ============================================
export const serviceExpertiseSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().min(1, 'Description requise'),
  highlights: z.array(z.string()),
});

export const servicePrestationCategorySchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  items: z.array(z.string()),
});

export const serviceProcessStepSchema = z.object({
  step: z.number().int().positive(),
  title: z.string().min(1, 'Titre requis'),
  description: z.string().min(1, 'Description requise'),
  duration: z.string().min(1, 'Durée requise'),
});

export const serviceFAQSchema = z.object({
  question: z.string().min(1, 'Question requise'),
  answer: z.string().min(1, 'Réponse requise'),
});

export const serviceSubServiceSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().min(1, 'Description requise'),
});

// ============================================
// CTA (Call-to-Action) schema
// ============================================
export const serviceCTASchema = z.object({
  text: z.string().default('Demander un devis gratuit'),
  color: z.enum(['primary', 'secondary', 'custom']).default('primary'),
  customColor: z.string().optional(),
  position: z.enum(['hero', 'floating', 'both']).default('hero'),
  anchor: z.string().default('/contact#contact-form'),
});

// ============================================
// Hero Badge schema (3 badges displayed in hero section)
// ============================================
export const serviceHeroBadgeSchema = z.object({
  icon: z
    .enum([
      'CheckCircle',
      'ShieldCheck',
      'Zap',
      'Clock',
      'Star',
      'Award',
      'Users',
      'MapPin',
      'Heart',
      'Sparkles',
    ])
    .default('CheckCircle'),
  text: z.string().min(1, 'Texte requis'),
});

export const serviceHeroBadgesSchema = z
  .array(serviceHeroBadgeSchema)
  .max(3)
  .default([
    { icon: 'CheckCircle', text: 'Service personnalisé' },
    { icon: 'ShieldCheck', text: 'Qualité garantie' },
    { icon: 'Zap', text: 'Intervention rapide' },
  ]);

// ============================================
// CTA Section schema (final CTA section at bottom of service page)
// ============================================
export const serviceCtaSectionSchema = z.object({
  title: z.string().default('Prêt à découvrir la différence ?'),
  subtitle: z
    .string()
    .default(
      'Rejoignez nos clients qui nous font confiance pour maintenir leurs espaces dans un état parfait.',
    ),
  badges: z
    .array(serviceHeroBadgeSchema)
    .max(3)
    .default([
      { icon: 'MapPin', text: 'Intervention en Loire et Rhône' },
      { icon: 'Clock', text: 'Réponse sous 24h garantie' },
      { icon: 'ShieldCheck', text: 'Devis gratuit et sans engagement' },
    ]),
});

// ============================================
// Safe URL validation - Local images and Vercel Blob allowed
// ============================================
const safeImageUrlSchema = z.string().refine(
  (url) => {
    // Allow relative paths starting with /
    if (url.startsWith('/')) return true;
    // Allow Vercel Blob URLs
    if (url.includes('blob.vercel-storage.com')) return true;
    return false;
  },
  {
    message:
      'URL invalide - doit être un chemin relatif ou une URL Vercel Blob',
  },
);

// ============================================
// Service content schema (JSON field)
// ============================================
export const serviceContentSchema = z.object({
  images: z.array(safeImageUrlSchema).default([]),
  descriptions: z.array(z.string()).default([]),
  expertise: serviceExpertiseSchema.optional(),
  introText: z.string().optional(),
  contextText: z.string().optional(),
  targetSpaces: z.array(z.string()).optional(),
  prestationsCategories: z.array(servicePrestationCategorySchema).optional(),
  process: z.array(serviceProcessStepSchema).optional(),
  guarantees: z.array(z.string()).optional(),
  applicationSectors: z.array(z.string()).optional(),
  faq: z.array(serviceFAQSchema).optional(),
  whyChoose: z.array(z.string()).optional(),
  subServices: z.array(serviceSubServiceSchema).default([]),
  // CTA & Conversion optimization
  cta: serviceCTASchema.optional(),
  // Hero badges (3 badges displayed in hero section)
  heroBadges: serviceHeroBadgesSchema.optional(),
  // CTA section (final section at bottom of page)
  ctaSection: serviceCtaSectionSchema.optional(),
});

// ============================================
// Full service schema for create/update
// ============================================
export const createServiceSchema = z.object({
  slug: serviceSlugSchema,
  title: serviceTitleSchema,
  subtitle: serviceSubtitleSchema,
  categoryId: z.string().uuid('ID de catégorie invalide').optional().nullable(),
  seoTitle: serviceSeoTitleSchema,
  seoDesc: serviceSeoDescSchema,
  published: z.boolean().default(true),
  content: serviceContentSchema,
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string().uuid('ID invalide'),
  // For conflict detection: the updatedAt timestamp when the user started editing
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const deleteServiceSchema = z.object({
  id: z.string().uuid('ID invalide'),
});

// ============================================
// Types inferred from schemas
// ============================================
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceContentInput = z.infer<typeof serviceContentSchema>;
export type ServiceHeroBadge = z.infer<typeof serviceHeroBadgeSchema>;
