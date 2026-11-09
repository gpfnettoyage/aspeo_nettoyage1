import { jsonLdScript } from '@/lib/site/jsonld';

/** Injecte un graphe de données structurées schema.org dans la page. */
export default function JsonLd({ graph }: { graph: Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />;
}
