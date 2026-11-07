import crypto from 'crypto';
import { MAGIC_BYTES, type AllowedMimeType } from './schema';

// ============================================
// Magic Bytes Validation
// ============================================

/**
 * Validates the actual MIME type of a file by checking its magic bytes
 * This prevents attacks where a malicious file is renamed with an image extension
 *
 * @param buffer - The file buffer to validate
 * @returns The detected MIME type or null if not recognized
 */
export function validateMagicBytes(buffer: Buffer): AllowedMimeType | null {
  for (const [mimeType, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const signature of signatures) {
      if (buffer.length < signature.length) continue;

      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        // Special handling for WebP: verify WEBP signature after RIFF header
        if (mimeType === 'image/webp') {
          // RIFF____WEBP format - "WEBP" starts at offset 8
          if (buffer.length >= 12) {
            const webpSignature = buffer.slice(8, 12).toString('ascii');
            if (webpSignature !== 'WEBP') {
              continue; // It's a RIFF file but not WebP
            }
          } else {
            continue; // Too short to be WebP
          }
        }
        return mimeType as AllowedMimeType;
      }
    }
  }
  return null;
}

// ============================================
// Filename Sanitization
// ============================================

/**
 * Sanitizes a filename to prevent security issues
 * - Removes path traversal attempts
 * - Removes dangerous characters
 * - Converts to lowercase
 * - Limits length
 *
 * @param fileName - The original filename
 * @returns Sanitized filename (without extension)
 */
export function sanitizeFileName(fileName: string): string {
  // Extract only the base name (no path)
  const baseName = fileName.split(/[\\/]/).pop() || 'image';

  // Remove extension (we'll add .webp later)
  const parts = baseName.split('.');
  if (parts.length > 1) {
    parts.pop(); // Remove last part (extension)
  }
  const nameWithoutExt = parts.join('.');

  // Sanitize the name
  const sanitized = nameWithoutExt
    // Keep only alphanumeric, hyphens, and underscores
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Limit length
    .slice(0, 80);

  // Return sanitized name or default
  return sanitized || 'image';
}

/**
 * Generates a secure, unique filename
 * Format: {sanitized-name}-{timestamp}-{random}.webp
 *
 * @param sanitizedName - Pre-sanitized base filename
 * @returns Secure unique filename with .webp extension
 */
export function generateSecureFilename(sanitizedName: string): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${sanitizedName}-${timestamp}-${randomSuffix}.webp`;
}

// ============================================
// Path Safety Validation
// ============================================

/**
 * Validates that a path is safe (no traversal attacks)
 *
 * @param path - The path to validate
 * @returns true if path is safe
 */
export function isPathSafe(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');
  return (
    !normalized.includes('..') && // No parent directory traversal
    !normalized.startsWith('/') && // No absolute paths
    !normalized.includes('://') && // No URLs
    !/^[a-zA-Z]:/.test(normalized) // No Windows drive letters
  );
}

/**
 * Validates a service slug for use in blob paths
 *
 * @param slug - The service slug
 * @returns true if slug is valid for blob paths
 */
export function isValidServiceSlug(slug: string): boolean {
  // Must be lowercase letters, numbers, and hyphens only
  // Must not start or end with hyphen
  // Must be between 1 and 100 characters
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length >= 1 && slug.length <= 100 && slugRegex.test(slug);
}

// ============================================
// Size Formatting
// ============================================

/**
 * Formats bytes to human-readable size
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
