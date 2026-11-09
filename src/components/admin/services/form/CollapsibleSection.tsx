'use client';

import React, { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  progress: number; // 0-100
  defaultOpen?: boolean;
  children: React.ReactNode;
  description?: string;
}

export default function CollapsibleSection({
  title,
  icon: Icon,
  progress,
  defaultOpen = false,
  children,
  description,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getProgressColor = (value: number) => {
    if (value === 0) return 'bg-gray-200';
    if (value < 50) return 'bg-orange-500';
    if (value < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="rounded-lg border bg-card shadow-sm">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress indicator */}
              <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                <Progress
                  value={progress}
                  className={cn('h-2 w-20', getProgressColor(progress))}
                />
                <span
                  className={cn(
                    'text-xs font-medium min-w-[36px]',
                    progress === 100 ? 'text-green-600' : 'text-muted-foreground'
                  )}
                >
                  {progress}%
                </span>
              </div>

              {/* Mobile progress badge */}
              <div
                className={cn(
                  'sm:hidden px-2 py-1 rounded-full text-xs font-medium',
                  progress === 100
                    ? 'bg-green-100 text-green-700'
                    : progress > 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {progress}%
              </div>

              {/* Chevron */}
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
