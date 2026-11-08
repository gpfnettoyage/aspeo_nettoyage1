import type { Metadata } from 'next';
import LegalPage from '@/components/site/legal/LegalPage';
import { getPageContent } from '@/lib/site/content';
import { pageMetadata } from '@/lib/site/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('politique-des-cookies');
}

export default async function Page() {
  const { c } = await getPageContent('politique-des-cookies');
  return <LegalPage c={c} />;
}
