import SiteLayout from './(site)/layout';
import SiteNotFound, { metadata as siteNotFoundMetadata } from './(site)/not-found';

export const metadata = siteNotFoundMetadata;

/**
 * 404 globale (adresses qui ne correspondent à aucune route) : même page que la 404 du site public,
 * avec l'en-tête et le pied de page de la refonte.
 */
export default function NotFound() {
  return (
    <SiteLayout>
      <SiteNotFound />
    </SiteLayout>
  );
}
