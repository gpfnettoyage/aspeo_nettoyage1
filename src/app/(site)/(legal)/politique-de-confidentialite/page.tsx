import type { Metadata } from 'next';
import LegalPage from '@/components/site/legal/LegalPage';
import { getPageContent } from '@/lib/site/content';
import { pageMetadata } from '@/lib/site/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('politique-de-confidentialite');
}

export default async function Page() {
  const { c } = await getPageContent('politique-de-confidentialite');
  return <LegalPage c={c} />;
}
