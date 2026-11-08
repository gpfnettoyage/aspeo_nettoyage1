import type { Metadata } from 'next';
import LegalPage from '@/components/site/legal/LegalPage';
import { getPageContent } from '@/lib/site/content';
import { pageMetadata } from '@/lib/site/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('conditions-generales-d-utilisation');
}

export default async function Page() {
  const { c } = await getPageContent('conditions-generales-d-utilisation');
  return <LegalPage c={c} />;
}
