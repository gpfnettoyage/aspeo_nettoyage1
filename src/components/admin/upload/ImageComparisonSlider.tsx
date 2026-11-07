'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface ImageComparisonSliderProps {
  /** Original image URL (left side) */
  originalSrc: string;
  /** Compressed/WebP image URL (right side) */
  compressedSrc: string;
  /** Alt text for images */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
  /** Original label */
  originalLabel?: string;
  /** Compressed label */
  compressedLabel?: string;
}

/**
 * Squoosh-style image comparison slider
 * Drag the divider to compare before/after images
 */
export default function ImageComparisonSlider({
  originalSrc,
  compressedSrc,
  alt = 'Image comparison',
  className,
  originalLabel = 'Original',
  compressedLabel = 'WebP',
}: ImageComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // Percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Track container width with ResizeObserver (not during render)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial width
    setContainerWidth(container.offsetWidth);

    // Watch for resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  }, [updateSliderPosition]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      updateSliderPosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      updateSliderPosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateSliderPosition]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-lg border bg-muted cursor-ew-resize select-none',
        'aspect-[4/3] sm:aspect-[16/9]',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Compressed image (background, full width) */}
      <div className="absolute inset-0">
        <Image
          src={compressedSrc}
          alt={`${alt} - ${compressedLabel}`}
          fill
          className="object-contain"
          draggable={false}
        />
        {/* Label */}
        <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {compressedLabel}
        </span>
      </div>

      {/* Original image (clipped by slider position) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div
          className="relative h-full"
          style={{ width: containerWidth ? `${containerWidth}px` : '100vw' }}
        >
          <Image
            src={originalSrc}
            alt={`${alt} - ${originalLabel}`}
            fill
            className="object-contain"
            draggable={false}
          />
        </div>
        {/* Label */}
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {originalLabel}
        </span>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        {/* Handle grip */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-5 h-5 rounded-full bg-white shadow-md border border-primary/50',
            'flex items-center justify-center',
            'transition-transform',
            isDragging && 'scale-110'
          )}
        >
          <GripVertical className="w-3 h-3 text-primary/70" />
        </div>
      </div>

      {/* Instructions overlay (fades out after first interaction) */}
      {!isDragging && sliderPosition === 50 && (
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center pointer-events-none">
          <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
            ← Glissez →
          </span>
        </div>
      )}
    </div>
  );
}
