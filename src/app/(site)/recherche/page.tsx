import type { Metadata } from 'next';
import SearchView from '@/components/site/search/SearchView';
import { search } from '@/lib/site/search';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('recherche'); // noindex
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 120);
  const [results, settings] = await Promise.all([search(q), getSettings()]);
  return <SearchView key={q} query={q} results={results} phone={settings.company.phone} phoneIntl={settings.company.phoneIntl} />;
}
