import { MetadataRoute } from 'next';
import { COMPANY } from '@/constants/company';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/'],
    },
    sitemap: `${COMPANY.website}/sitemap.xml`,
  };
}
