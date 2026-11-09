import { JsonLdObject } from '@/types/jsonld';
import { generateJsonLdString } from '@/utils/jsonld-generator';

interface JsonLdScriptProps {
  /**
   * Schémas spécifiques à la page (WebPage, Service, Article, FAQ, etc.)
   * Le LocalBusiness et WebSite sont automatiquement inclus
   */
  pageSchemas: JsonLdObject[];
  /**
   * ID unique pour le script (pour éviter les conflits)
   */
  id?: string;
}

/**
 * Composant Server Component qui génère un bloc JSON-LD consolidé
 * Inclut automatiquement LocalBusiness + WebSite + les schémas de la page
 */
export default function JsonLdScript({
  pageSchemas,
  id = 'json-ld',
}: JsonLdScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: generateJsonLdString(pageSchemas) }}
    />
  );
}
