import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

import { COMPANY } from '@/constants/company';
import { stringifyJsonLd } from '@/utils/jsonld-generator';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: 'default' | 'hero';
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  className,
  variant = 'default',
}) => {
  const allItems = [
    { label: '', href: '/' }, // Only icon for home
    ...items,
  ];

  const generateBreadcrumbStructuredData = () => {
    const itemListElement = allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: index === 0 ? 'Accueil' : item.label, // Use "Accueil" for structured data even if label is empty
      ...(item.href && { item: `${COMPANY.website}${item.href}` }),
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(generateBreadcrumbStructuredData()),
        }}
      />
      <Breadcrumb className={`${className}`}>
        <BreadcrumbList>
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage
                      className={cn(
                        variant === 'hero' ? 'text-gray-900 font-medium' : '',
                        index === 0 && 'flex items-center gap-1.5',
                      )}
                      {...(index === 0 && { 'aria-label': 'Accueil' })}
                    >
                      {index === 0 ? <Home className="h-4 w-4" /> : item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href!}
                        className={cn(
                          variant === 'hero'
                            ? 'text-gray-700 hover:text-gray-900 transition-colors'
                            : 'hover:text-foreground',
                          index === 0 && 'flex items-center gap-1.5',
                        )}
                        {...(index === 0 && { 'aria-label': 'Accueil' })}
                      >
                        {index === 0 ? (
                          <Home className="h-4 w-4" />
                        ) : (
                          item.label
                        )}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator
                    className={
                      variant === 'hero' ? '[&>svg]:text-gray-600' : ''
                    }
                  />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default PageBreadcrumb;
