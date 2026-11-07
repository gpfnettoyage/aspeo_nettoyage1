'use client';

import { cn } from '@/lib/utils';
import { COMPANY } from '@/constants/company';

interface SERPPreviewProps {
  title: string;
  slug: string;
  description: string;
}

/**
 * Google SERP (Search Engine Results Page) Preview
 * Shows how the page would appear in Google search results
 */
export default function SERPPreview({
  title,
  slug,
  description,
}: SERPPreviewProps) {
  const displayTitle = title || 'Titre du service';
  const displayDesc = description || 'Description du service...';
  const displayUrl = `${COMPANY.website}/proprete-services/${slug || 'slug'}`;

  // Truncate title at 60 chars (Google's typical limit)
  const truncatedTitle =
    displayTitle.length > 60
      ? displayTitle.substring(0, 57) + '...'
      : displayTitle;

  // Truncate description at 160 chars
  const truncatedDesc =
    displayDesc.length > 160
      ? displayDesc.substring(0, 157) + '...'
      : displayDesc;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded-full" />
        <span className="text-xs text-muted-foreground font-medium">
          Aperçu Google
        </span>
      </div>

      <div className="font-sans">
        {/* Favicon + URL line */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-700">{COMPANY.name}</span>
            <span className="text-xs text-gray-500 truncate max-w-[300px]">
              {displayUrl}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            'text-xl leading-tight cursor-pointer hover:underline mb-1',
            'text-[#1a0dab]'
          )}
        >
          {truncatedTitle}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#4d5156] leading-relaxed">{truncatedDesc}</p>
      </div>

      {/* Character counts */}
      <div className="mt-4 pt-3 border-t flex gap-4 text-xs text-muted-foreground">
        <div
          className={cn(
            'flex items-center gap-1',
            displayTitle.length > 60 ? 'text-red-500' : 'text-green-600'
          )}
        >
          <span>Titre:</span>
          <span className="font-medium">{displayTitle.length}/60</span>
          {displayTitle.length > 60 && (
            <span className="text-red-500">(tronqué)</span>
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-1',
            displayDesc.length > 160 ? 'text-red-500' : 'text-green-600'
          )}
        >
          <span>Description:</span>
          <span className="font-medium">{displayDesc.length}/160</span>
          {displayDesc.length > 160 && (
            <span className="text-red-500">(tronqué)</span>
          )}
        </div>
      </div>
    </div>
  );
}
