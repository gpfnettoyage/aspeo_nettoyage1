'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationMeta } from '@/types/pagination';

interface ClientPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

export default function ClientPagination({
  meta,
  onPageChange,
  onPageSizeChange,
  showPageSize = false,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
}: ClientPaginationProps) {
  const { page, pageSize, total, totalPages } = meta;

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const getVisiblePages = () => {
    const delta = 1;
    const range: (number | 'ellipsis')[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== 'ellipsis') {
        range.push('ellipsis');
      }
    }

    return range;
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {startItem}-{endItem} sur {total}
        </span>
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2 ml-4">
            <span className="hidden sm:inline">par page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || disabled}
          aria-label="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getVisiblePages().map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(p)}
                disabled={disabled}
              >
                {p}
              </Button>
            )
          )}
        </div>

        <span className="sm:hidden text-sm text-muted-foreground px-2">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || disabled}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || disabled}
          aria-label="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
