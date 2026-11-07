import { COMPANY } from '@/constants/company';
import { getServices } from '@/lib/services';

export async function GET() {
  const dbServices = await getServices();

  // Transform services for llms.txt format
  const services = dbServices.map((s) => ({
    title: s.title,
    slug: s.slug,
    subtitle: s.subtitle || undefined,
    description: s.descriptions[0] || '',
  }));

  const content = generateLlmsTxt(services);

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

function generateLlmsTxt(
  services: Array<{
    title: string;
    slug: string;
    subtitle?: string;
    description: string;
  }>,
): string {
  const servicesList = services
    .map((s) => {
      const desc = s.subtitle ? `: ${s.subtitle}` : '';
      return `- [${s.title}](${COMPANY.website}/proprete-services/${s.slug})${desc}`;
    })
    .join('\n');

  const servicesDescriptions = services
    .map((s) => {
      return `### ${s.title}\n${s.description}`;
    })
    .join('\n\n');

  const socialLinks = [
    { label: 'Facebook', url: COMPANY.socials.facebook },
    { label: 'Instagram', url: COMPANY.socials.instagram },
    { label: 'LinkedIn', url: COMPANY.socials.linkedin },
    { label: 'TikTok', url: COMPANY.socials.tiktok },
    { label: 'X/Twitter', url: COMPANY.socials.x },
  ]
    .filter((social): social is { label: string; url: string } =>
      Boolean(social.url),
    )
    .map((social) => `- [${social.label}](${social.url})`)
    .join('\n');

  return `# ${COMPANY.name}

> ${COMPANY.fullName} est une entreprise de nettoyage professionnel basée en ${COMPANY.address.region} (France). Spécialisée dans le nettoyage de locaux professionnels, véhicules, façades et interventions techniques, ${COMPANY.name} intervient principalement dans la Loire (42) et le Rhône (69).

## Informations générales

- Nom commercial : ${COMPANY.name} / ${COMPANY.fullName}
- Raison sociale : ${COMPANY.legal.name} ${COMPANY.legal.form}
- Siège social : ${COMPANY.address.full}, France
- Téléphone : ${COMPANY.phone}
- Email : ${COMPANY.email}
- Site web : ${COMPANY.website}

## Zone d'intervention

${COMPANY.name} intervient dans toute la région ${COMPANY.address.region} :
- Loire (42) : Saint-Étienne et environs
- Rhône (69) : Lyon et environs
- Isère (38) : Grenoble, Vienne
- Savoie (73) : Chambéry
- Haute-Savoie (74) : Annecy
- Drôme (26) : Valence
- Puy-de-Dôme (63) : Clermont-Ferrand

## Services proposés (${services.length} services)

${COMPANY.name} propose une gamme complète de services de nettoyage professionnel :

${servicesDescriptions}

## Engagements

- Produits écologiques et biodégradables
- Équipes formées et certifiées
- Interventions d'urgence 24h/24 et 7j/7
- Devis gratuit et personnalisé
- Garantie satisfaction client

## Horaires

- Lundi à Jeudi : ${COMPANY.hours.week}
- Vendredi : ${COMPANY.hours.friday}
- Week-end : ${COMPANY.hours.weekend} (sauf urgences)

## Pages principales

- [Accueil](${COMPANY.website}/): Présentation de l'entreprise et des services
- [À propos](${COMPANY.website}/a-propos): Histoire et valeurs d'${COMPANY.name}
- [Services](${COMPANY.website}/proprete-services): Catalogue complet des ${services.length} prestations
- [Avis clients](${COMPANY.website}/avis): Témoignages et évaluations
- [Contact](${COMPANY.website}/contact): Formulaire de contact et coordonnées
- [Médias](${COMPANY.website}/medias): Actualités et apparitions presse

## Services détaillés

${servicesList}

## Optional

### Réseaux sociaux

${socialLinks}

### Informations légales

- SIRET : ${COMPANY.legal.siret}
- TVA : ${COMPANY.legal.tva}
- RCS : ${COMPANY.legal.rcs}
- Capital : ${COMPANY.legal.capital}
- Directeur de publication : ${COMPANY.legal.publicationDirector}
`;
}
