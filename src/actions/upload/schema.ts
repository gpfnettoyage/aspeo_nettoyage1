import { z } from 'zod';

// ============================================
// Upload Security Constants
// ============================================
export const UPLOAD_LIMITS = {
  /** Maximum file size in bytes (5 MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Maximum image dimension in pixels */
  MAX_DIMENSION: 4096,
  /** Minimum image dimension in pixels */
  MIN_DIMENSION: 50,
  /** Allowed MIME types for upload */
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  /** Default WebP compression quality */
  DEFAULT_QUALITY: 80,
  /** Minimum compression quality */
  MIN_QUALITY: 1,
  /** Maximum compression quality */
  MAX_QUALITY: 100,
} as const;

// ============================================
// Magic Bytes for MIME Validation
// ============================================
// Used to verify actual file type, not just extension
export const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP verification done separately)
};

// ============================================
// Zod Schemas
// ============================================

/**
 * Schema for image upload validation
 * All fields are validated both client and server-side
 */
export const uploadImageSchema = z.object({
  /** Base64 encoded file data */
  fileData: z.string().min(1, 'Fichier requis'),

  /** Original filename (will be sanitized) */
  fileName: z
    .string()
    .min(1, 'Nom de fichier requis')
    .max(255, 'Nom de fichier trop long')
    .refine(
      (name) => !name.includes('..') && !name.includes('/') && !name.includes('\\'),
      'Caractères interdits dans le nom de fichier'
    ),

  /** Declared MIME type (verified against magic bytes server-side) */
  mimeType: z.enum(UPLOAD_LIMITS.ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: 'Type de fichier non autorisé. Acceptés: JPEG, PNG, WebP' }),
  }),

  /** File size in bytes */
  fileSize: z
    .number()
    .positive('Taille invalide')
    .max(
      UPLOAD_LIMITS.MAX_FILE_SIZE,
      `Fichier trop volumineux (max ${UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024} MB)`
    ),

  /** WebP compression quality (1-100) */
  quality: z
    .number()
    .int('La qualité doit être un entier')
    .min(UPLOAD_LIMITS.MIN_QUALITY, `Qualité minimum: ${UPLOAD_LIMITS.MIN_QUALITY}`)
    .max(UPLOAD_LIMITS.MAX_QUALITY, `Qualité maximum: ${UPLOAD_LIMITS.MAX_QUALITY}`)
    .default(UPLOAD_LIMITS.DEFAULT_QUALITY),

  /** Service slug for folder organization (services/{slug}/) */
  serviceSlug: z
    .string()
    .min(1, 'Slug du service requis')
    .max(100, 'Slug trop long')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets'),
});

/**
 * Schema for image deletion validation
 */
export const deleteImageSchema = z.object({
  /** Full URL of the image to delete */
  url: z
    .string()
    .url('URL invalide')
    .refine(
      (url) => url.includes('blob.vercel-storage.com'),
      'Seules les images Vercel Blob peuvent être supprimées via cette action'
    ),
  /** Service slug - image must belong to this service */
  serviceSlug: z
    .string()
    .min(1, 'Slug du service requis')
    .regex(/^[a-z0-9-]+$/, 'Slug invalide'),
}).refine(
  (data) => data.url.includes(`/services/${data.serviceSlug}/`),
  { message: 'Cette image n\'appartient pas à ce service' }
);

/**
 * Schema for listing images
 */
export const listImagesSchema = z.object({
  /** Service slug to filter images */
  serviceSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug invalide')
    .optional(),
});

// ============================================
// Type Exports
// ============================================
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type DeleteImageInput = z.infer<typeof deleteImageSchema>;
export type ListImagesInput = z.infer<typeof listImagesSchema>;
export type AllowedMimeType = (typeof UPLOAD_LIMITS.ALLOWED_MIME_TYPES)[number];
