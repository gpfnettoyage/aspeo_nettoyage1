import { redirectOrNotFound } from '@/lib/site/redirects';

type Props = { params: Promise<{ path: string[] }> };

/**
 * Toute URL sans page correspondante : redirection enregistrée dans l'admin (anciennes URL)
 * ou page 404. Les routes existantes restent toujours prioritaires sur cette route.
 */
export default async function CatchAll({ params }: Props) {
  const { path } = await params;
  return redirectOrNotFound(`/${path.map(decodeURIComponent).join('/')}`);
}
