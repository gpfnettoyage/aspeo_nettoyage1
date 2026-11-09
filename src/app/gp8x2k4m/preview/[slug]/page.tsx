import { redirect } from 'next/navigation';

/** Ancienne prévisualisation d'un service : remplacée par l'aperçu du site (mode brouillon). */
export default async function LegacyPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/api/preview?path=${encodeURIComponent(`/proprete-services/${slug}`)}`);
}
