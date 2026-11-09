'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface SectionProgressProps {
  progress: number;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SectionProgress({
  progress,
  label,
  showIcon = true,
  size = 'md',
}: SectionProgressProps) {
  const isComplete = progress === 100;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div className="flex-shrink-0">
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-[60px]">
        <Progress
          value={progress}
          className={cn(sizeClasses[size], 'bg-muted')}
        />
      </div>

      {label && (
        <span
          className={cn(
            'text-xs font-medium',
            isComplete ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Calculate section progress based on filled fields
 * @param fields - Object with field names as keys and their values
 * @param requiredFields - Array of required field names
 * @returns Progress percentage (0-100)
 */
export function calculateSectionProgress(
  fields: Record<string, unknown>,
  requiredFields: string[]
): number {
  if (requiredFields.length === 0) return 100;

  const filledCount = requiredFields.filter((fieldName) => {
    const value = fields[fieldName];

    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    if (typeof value === 'boolean') return true; // Booleans are always "filled"
    if (typeof value === 'number') return true; // Numbers are always "filled"

    return Boolean(value);
  }).length;

  return Math.round((filledCount / requiredFields.length) * 100);
}

/**
 * Calculate progress for nested content fields
 */
export function calculateContentProgress(content: Record<string, unknown>): number {
  const importantFields = [
    'descriptions',
    'images',
    'introText',
  ];

  const optionalFields = [
    'contextText',
    'expertise',
    'targetSpaces',
    'prestationsCategories',
    'process',
    'guarantees',
    'applicationSectors',
    'faq',
    'whyChoose',
    'subServices',
  ];

  // Required fields weight: 70%, optional fields weight: 30%
  const requiredProgress = calculateSectionProgress(content, importantFields);
  const optionalProgress = calculateSectionProgress(content, optionalFields);

  return Math.round(requiredProgress * 0.7 + optionalProgress * 0.3);
}
