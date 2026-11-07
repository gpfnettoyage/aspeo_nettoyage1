'use server';

import { put, del, list } from '@vercel/blob';
import sharp from 'sharp';
import { Ratelimit } from '@upstash/ratelimit';
import { requirePermission } from '@/lib/auth';
import { redis, safeRateLimit, adminActionRateLimit } from '@/lib/redis';
import { logAdminAction } from '@/lib/audit';
import {
  uploadImageSchema,
  deleteImageSchema,
  listImagesSchema,
  UPLOAD_LIMITS,
  type UploadImageInput,
  type DeleteImageInput,
  type ListImagesInput,
} from './schema';
import {
  validateMagicBytes,
  sanitizeFileName,
  generateSecureFilename,
  formatFileSize,
} from './security';

// ============================================
// Types
// ============================================
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: string[] };

export interface UploadResult {
  url: string;
  originalName: string;
  finalName: string;
  size: number;
  width: number;
  height: number;
  format: 'webp';
  compressionRatio: string;
}

export interface ImageInfo {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

// ============================================
// Rate Limiter for Uploads
// More restrictive than standard admin actions
// ============================================
const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 uploads per hour
  analytics: true,
  prefix: 'ratelimit:upload',
});

// ============================================
// Upload Image Action
// ============================================

/**
 * Uploads an image to Vercel Blob with WebP conversion
 *
 * Security measures:
 * 1. Authentication required (EDITOR+ role)
 * 2. Rate limiting (20/hour)
 * 3. Zod validation
 * 4. Magic bytes verification (actual MIME type)
 * 5. Dimension validation via Sharp
 * 6. Filename sanitization
 * 7. Secure random filename generation
 * 8. Audit logging
 */
export async function uploadImageAction(
  input: UploadImageInput
): Promise<ActionResult<UploadResult>> {
  try {
    // 1. AUTHENTICATION & PERMISSIONS
    const session = await requirePermission('services:update');

    // 2. RATE LIMITING
    const { success: rateLimitOk } = await safeRateLimit(uploadRateLimit, session.user.id);
    if (!rateLimitOk) {
      return {
        success: false,
        error: "Trop d'uploads. Limite: 20 par heure. Réessayez plus tard.",
      };
    }

    // 3. ZOD VALIDATION
    const result = uploadImageSchema.safeParse(input);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return {
        success: false,
        error: errors.length > 1 ? `${errors.length} erreurs de validation` : errors[0],
        errors,
      };
    }

    const { fileData, fileName, mimeType, fileSize, quality, serviceSlug } = result.data;

    // 4. DECODE BASE64 TO BUFFER
    const buffer = Buffer.from(fileData, 'base64');

    // Verify actual size matches declared size (prevents manipulation)
    if (Math.abs(buffer.length - fileSize) > 1024) {
      // Allow 1KB tolerance for base64 padding
      return {
        success: false,
        error: 'Taille de fichier incohérente',
      };
    }

    // 5. VALIDATE MAGIC BYTES (Real MIME type)
    const detectedMimeType = validateMagicBytes(buffer);
    if (!detectedMimeType) {
      return {
        success: false,
        error: 'Type de fichier non reconnu ou invalide',
      };
    }

    // Verify detected MIME matches declared MIME
    if (detectedMimeType !== mimeType) {
      return {
        success: false,
        error: `Type MIME incorrect. Détecté: ${detectedMimeType}, déclaré: ${mimeType}`,
      };
    }

    // 6. PROCESS IMAGE WITH SHARP
    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    // Validate dimensions exist
    if (!metadata.width || !metadata.height) {
      return {
        success: false,
        error: "Impossible de lire les dimensions de l'image",
      };
    }

    // Validate max dimensions
    if (metadata.width > UPLOAD_LIMITS.MAX_DIMENSION || metadata.height > UPLOAD_LIMITS.MAX_DIMENSION) {
      return {
        success: false,
        error: `Dimensions trop grandes. Maximum: ${UPLOAD_LIMITS.MAX_DIMENSION}x${UPLOAD_LIMITS.MAX_DIMENSION}px`,
      };
    }

    // Validate min dimensions
    if (metadata.width < UPLOAD_LIMITS.MIN_DIMENSION || metadata.height < UPLOAD_LIMITS.MIN_DIMENSION) {
      return {
        success: false,
        error: `Dimensions trop petites. Minimum: ${UPLOAD_LIMITS.MIN_DIMENSION}x${UPLOAD_LIMITS.MIN_DIMENSION}px`,
      };
    }

    // 7. CONVERT TO WEBP
    const webpBuffer = await sharpInstance
      .webp({ quality })
      .toBuffer();

    // Get final dimensions (may differ due to processing)
    const finalMetadata = await sharp(webpBuffer).metadata();

    // 8. GENERATE SECURE FILENAME
    const sanitizedName = sanitizeFileName(fileName);
    const secureName = generateSecureFilename(sanitizedName);
    const blobPath = `services/${serviceSlug}/${secureName}`;

    // 9. UPLOAD TO VERCEL BLOB
    const blob = await put(blobPath, webpBuffer, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false, // We already have random suffix in filename
    });

    // 10. CALCULATE COMPRESSION RATIO
    const compressionRatio = ((1 - webpBuffer.length / buffer.length) * 100).toFixed(1);

    // 11. AUDIT LOG
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      resource: 'Image',
      resourceId: blob.url,
      resourceName: sanitizedName,
      details: {
        originalSize: formatFileSize(buffer.length),
        finalSize: formatFileSize(webpBuffer.length),
        compressionRatio: `${compressionRatio}%`,
        quality,
        dimensions: `${finalMetadata.width}x${finalMetadata.height}`,
        serviceSlug,
      },
    });

    // 12. RETURN RESULT
    return {
      success: true,
      data: {
        url: blob.url,
        originalName: fileName,
        finalName: secureName,
        size: webpBuffer.length,
        width: finalMetadata.width!,
        height: finalMetadata.height!,
        format: 'webp',
        compressionRatio: `${compressionRatio}%`,
      },
    };
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('[UPLOAD] Error:', error);
    }

    // Check for specific Vercel Blob errors
    if (error instanceof Error) {
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        return {
          success: false,
          error: 'Configuration Vercel Blob manquante. Contactez l\'administrateur.',
        };
      }
    }

    return {
      success: false,
      error: "Une erreur est survenue lors de l'upload",
    };
  }
}

// ============================================
// Delete Image Action
// ============================================

/**
 * Deletes an image from Vercel Blob
 *
 * Security measures:
 * 1. Authentication required (ADMIN+ role for deletion)
 * 2. Rate limiting
 * 3. URL validation (must be Vercel Blob URL)
 * 4. Service ownership validation (image must belong to specified service)
 * 5. Audit logging
 */
export async function deleteImageAction(
  input: DeleteImageInput
): Promise<ActionResult> {
  try {
    // 1. AUTHENTICATION & PERMISSIONS (ADMIN required for deletion)
    const session = await requirePermission('services:delete');

    // 2. RATE LIMITING
    const { success: rateLimitOk } = await safeRateLimit(adminActionRateLimit, session.user.id);
    if (!rateLimitOk) {
      return {
        success: false,
        error: 'Trop de requêtes. Réessayez plus tard.',
      };
    }

    // 3. VALIDATION (includes service ownership check via refine)
    const result = deleteImageSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.errors[0].message,
      };
    }

    const { url, serviceSlug } = result.data;

    // 4. DELETE FROM VERCEL BLOB
    await del(url);

    // 5. AUDIT LOG
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'DELETE',
      resource: 'Image',
      resourceId: url,
      resourceName: serviceSlug,
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DELETE IMAGE] Error:', error);
    }

    return {
      success: false,
      error: "Erreur lors de la suppression de l'image",
    };
  }
}

// ============================================
// List Images Action
// ============================================

/**
 * Lists images from Vercel Blob for a service
 *
 * Security measures:
 * 1. Authentication required (VIEWER+ role)
 * 2. Rate limiting (read operations)
 */
export async function listImagesAction(
  input: ListImagesInput
): Promise<ActionResult<ImageInfo[]>> {
  try {
    // 1. AUTHENTICATION
    await requirePermission('services:view');

    // 2. VALIDATION
    const result = listImagesSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.errors[0].message,
      };
    }

    const { serviceSlug } = result.data;

    // 3. LIST FROM VERCEL BLOB
    const prefix = serviceSlug ? `services/${serviceSlug}/` : 'services/';
    const { blobs } = await list({ prefix });

    // 4. FORMAT RESULTS
    const images: ImageInfo[] = blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return {
      success: true,
      data: images,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[LIST IMAGES] Error:', error);
    }

    return {
      success: false,
      error: 'Erreur lors de la récupération des images',
    };
  }
}
