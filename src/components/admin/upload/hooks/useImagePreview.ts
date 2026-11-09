'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================
// Types
// ============================================
interface UseImagePreviewOptions {
  /** Maximum size for preview canvas (avoids performance issues) */
  maxPreviewSize?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImagePreviewResult {
  /** Original image preview as data URL */
  originalPreview: string | null;
  /** WebP preview as data URL */
  webpPreview: string | null;
  /** Original file size in bytes */
  originalSize: number;
  /** Estimated WebP size in bytes */
  estimatedWebPSize: number;
  /** Image dimensions */
  dimensions: ImageDimensions | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Generate WebP preview with specified quality */
  generateWebPPreview: (quality: number) => Promise<void>;
  /** Reset all state */
  reset: () => void;
}

// ============================================
// Hook
// ============================================

/**
 * Hook for generating image previews with WebP compression estimation
 * Uses Canvas API for client-side image processing
 *
 * @param file - The file to preview
 * @param options - Preview options
 * @returns Preview data and control functions
 */
export function useImagePreview(
  file: File | null,
  options: UseImagePreviewOptions = {}
): ImagePreviewResult {
  const { maxPreviewSize = 2048 } = options;

  // State
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [webpPreview, setWebpPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [estimatedWebPSize, setEstimatedWebPSize] = useState(0);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const originalPreviewRef = useRef<string | null>(null);
  const webpPreviewRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (originalPreviewRef.current && originalPreviewRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(originalPreviewRef.current);
    }
    if (webpPreviewRef.current && webpPreviewRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(webpPreviewRef.current);
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    cleanup();
    setOriginalPreview(null);
    setWebpPreview(null);
    setOriginalSize(0);
    setEstimatedWebPSize(0);
    setDimensions(null);
    setError(null);
    setIsLoading(false);
    originalPreviewRef.current = null;
    webpPreviewRef.current = null;
  }, [cleanup]);

  // Generate original preview when file changes
  useEffect(() => {
    if (!file) {
      reset();
      return;
    }

    setIsLoading(true);
    setError(null);
    setOriginalSize(file.size);

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Create image to get dimensions
      const img = new Image();

      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setOriginalPreview(dataUrl);
        originalPreviewRef.current = dataUrl;
        setIsLoading(false);
      };

      img.onerror = () => {
        setError("Impossible de charger l'image");
        setIsLoading(false);
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      setError('Erreur de lecture du fichier');
      setIsLoading(false);
    };

    reader.readAsDataURL(file);

    // Cleanup on unmount or file change
    return () => {
      cleanup();
    };
  }, [file, reset, cleanup]);

  // Generate WebP preview with specified quality
  const generateWebPPreview = useCallback(
    async (quality: number) => {
      if (!originalPreview || !dimensions) return;

      setIsLoading(true);

      try {
        // Load image
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
          img.src = originalPreview;
        });

        // Calculate canvas dimensions (respect maxPreviewSize)
        let { width, height } = dimensions;
        if (width > maxPreviewSize || height > maxPreviewSize) {
          const ratio = Math.min(maxPreviewSize / width, maxPreviewSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas non supporté');
        }

        // Use high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality / 100);

        // Cleanup previous preview
        if (webpPreviewRef.current && webpPreviewRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(webpPreviewRef.current);
        }

        setWebpPreview(webpDataUrl);
        webpPreviewRef.current = webpDataUrl;

        // Estimate size from base64 (base64 is ~33% larger than binary)
        // Formula: actual_bytes = base64_length * 3/4
        const base64Data = webpDataUrl.split(',')[1];
        const base64Length = base64Data?.length || 0;
        const estimatedBytes = Math.round(base64Length * 0.75);

        // If we scaled down for preview, estimate full-res size proportionally
        // Image file size roughly scales linearly with pixel count at same quality
        const previewPixels = width * height;
        const originalPixels = dimensions.width * dimensions.height;

        // Only apply scaling if we actually scaled down
        const scaledEstimate = previewPixels < originalPixels
          ? Math.round(estimatedBytes * (originalPixels / previewPixels))
          : estimatedBytes;

        setEstimatedWebPSize(scaledEstimate);
      } catch (err) {
        setError('Erreur lors de la génération du preview WebP');
        console.error('[useImagePreview] WebP generation error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [originalPreview, dimensions, maxPreviewSize]
  );

  return {
    originalPreview,
    webpPreview,
    originalSize,
    estimatedWebPSize,
    dimensions,
    isLoading,
    error,
    generateWebPPreview,
    reset,
  };
}
