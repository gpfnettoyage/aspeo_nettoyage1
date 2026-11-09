'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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

interface PaginationProps {
  meta: PaginationMeta;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}

export default function Pagination({
  meta,
  showPageSize = true,
  pageSizeOptions = [10, 15, 25, 50],
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, pageSize, total, totalPages } = meta;

  const createPageURL = (newPage: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    if (newPageSize) {
      params.set('pageSize', newPageSize.toString());
    }
    return `${pathname}?${params.toString()}`;
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newPageSize);
    params.set('page', '1');
    window.location.href = `${pathname}?${params.toString()}`;
  };

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
        {showPageSize && (
          <div className="flex items-center gap-2 ml-4">
            <span className="hidden sm:inline">par page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
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
          asChild
          disabled={page <= 1}
        >
          {page > 1 ? (
            <Link href={createPageURL(1)} aria-label="Première page">
              <ChevronsLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <ChevronsLeft className="h-4 w-4" />
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          asChild
          disabled={page <= 1}
        >
          {page > 1 ? (
            <Link href={createPageURL(page - 1)} aria-label="Page précédente">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
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
                asChild={p !== page}
              >
                {p !== page ? (
                  <Link href={createPageURL(p)}>{p}</Link>
                ) : (
                  <span>{p}</span>
                )}
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
          asChild
          disabled={page >= totalPages}
        >
          {page < totalPages ? (
            <Link href={createPageURL(page + 1)} aria-label="Page suivante">
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          asChild
          disabled={page >= totalPages}
        >
          {page < totalPages ? (
            <Link href={createPageURL(totalPages)} aria-label="Dernière page">
              <ChevronsRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <ChevronsRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
