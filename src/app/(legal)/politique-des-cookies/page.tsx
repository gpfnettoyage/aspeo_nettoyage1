import { Metadata } from 'next';
import Link from 'next/link';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SchemaGraph } from '@/types/jsonld';
import { stringifyJsonLd } from '@/utils/jsonld-generator';

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const cookiesTitle = 'Politique des Cookies | ASPEO';
const cookiesDescription =
  'Politique de cookies ASPEO Nettoyage Loire & Rhône : gestion transparente des cookies pour améliorer votre expérience en respectant votre vie privée.';

export const metadata: Metadata = {
  title: cookiesTitle,
  description: cookiesDescription,
  alternates: {
    canonical: `${COMPANY.website}/politique-des-cookies`,
  },
  openGraph: pageOpenGraph(
    cookiesTitle,
    cookiesDescription,
    '/politique-des-cookies',
  ),
};

const CookiePolicyPage = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Politique des Cookies - ${COMPANY.name}`,
    description: metadata.description,
    url: `${COMPANY.website}/politique-des-cookies`,
  };

  const breadcrumbItems = [{ label: 'Politique des cookies' }];

  const graphJsonLd: SchemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [jsonLd as JsonLdObject].map(
      ({ '@context': _context, ...rest }) => rest,
    ),
  };

  return (
    <>
      <div className="pt-20 px-4">
        <PageBreadcrumb items={breadcrumbItems} />
      </div>
      <div className="container pt-6 pb-12">
        <script
          id="json-ld-cookie-policy"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(graphJsonLd) }}
        />
        <h1 className="text-2xl font-bold">
          Politique d&apos;utilisation des cookies
        </h1>
        <p className="text-sm text-gray-500">En vigueur au 26/02/2026</p>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mt-4">1. Introduction</h2>
          <p className="mt-2">
            Nous utilisons des cookies sur notre site web pour améliorer votre
            expérience de navigation et analyser l&apos;utilisation de notre
            site. Cette politique explique comment et pourquoi nous utilisons
            ces technologies.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            2. Qu&apos;est-ce qu&apos;un cookie ?
          </h2>
          <p className="mt-2">
            Les cookies sont de petits fichiers texte placés sur votre appareil
            pour stocker des informations. Ils sont largement utilisés pour
            faire fonctionner les sites web, ou pour les rendre plus efficaces,
            ainsi que pour fournir des informations aux propriétaires du site.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            3. Comment nous utilisons les cookies
          </h2>
          <p className="mt-2">
            Nous utilisons les cookies pour les raisons suivantes :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Pour mémoriser votre consentement concernant l&apos;utilisation
              des cookies et éviter de vous redemander à chaque visite.
            </li>
            <li>
              Pour analyser l&apos;utilisation de notre site via des outils
              comme Google Analytics et Hotjar, afin de mieux comprendre comment
              vous interagissez avec notre contenu et d&apos;optimiser le site
              en conséquence.
            </li>
            <li>
              Pour améliorer les performances et la sécurité de notre site web.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4">
            4. Types de cookies que nous utilisons
          </h2>
          <p className="mt-2">
            Nous utilisons différents types de cookies sur notre site :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Cookies de consentement :</strong> Ces cookies mémorisent
              votre choix concernant l&apos;acceptation ou le refus des cookies.
              Ils sont stockés pendant 1 an et nous permettent de respecter vos
              préférences.
            </li>
            <li>
              <strong>Cookies de performance et d&apos;analyse :</strong> Ces
              cookies recueillent des informations sur la manière dont vous
              utilisez notre site web, nous permettant ainsi d&apos;améliorer
              son fonctionnement. Ils ne sont activés qu&apos;après votre
              consentement.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4">
            5. Outils d&apos;analyse utilisés
          </h2>
          <p className="mt-2">
            Nous utilisons les outils d&apos;analyse suivants :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Google Analytics :</strong> Pour mesurer le trafic et
              comprendre comment les visiteurs utilisent notre site.
            </li>
            <li>
              <strong>Google Tag Manager :</strong> Pour gérer efficacement nos
              outils d&apos;analyse.
            </li>
            <li>
              <strong>Hotjar :</strong> Pour enregistrer et analyser les
              sessions de navigation afin d&apos;optimiser l&apos;expérience
              utilisateur et identifier les points d&apos;amélioration de notre
              site.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4">
            6. Vos choix concernant les cookies
          </h2>
          <p className="mt-2">
            Vous avez le droit de décider d&apos;accepter ou de refuser les
            cookies. Lors de votre première visite, une bannière vous informe de
            l&apos;utilisation des cookies et vous permet de faire votre choix.
          </p>
          <p className="mt-2">
            Si vous choisissez de refuser les cookies, vous pouvez continuer à
            utiliser notre site web, bien que votre accès à certaines
            fonctionnalités d&apos;analyse puisse être restreint.
          </p>
          <p className="mt-2">
            Vous pouvez à tout moment modifier vos préférences en supprimant le
            cookie de consentement dans les paramètres de votre navigateur.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            7. Durée de conservation des cookies
          </h2>
          <p className="mt-2">
            <strong>Cookie de consentement :</strong> 1 an
          </p>
          <p className="mt-2">
            <strong>Cookies d&apos;analyse :</strong> La durée varie selon les
            outils utilisés (généralement entre 30 jours et 2 ans).
          </p>

          <h2 className="text-lg font-semibold mt-4">
            8. Mises à jour de cette politique
          </h2>
          <p className="mt-2">
            Nous pouvons mettre à jour cette politique de temps en temps afin de
            refléter, par exemple, des changements apportés à nos pratiques ou
            pour d&apos;autres raisons opérationnelles, légales ou
            réglementaires. Veuillez donc revenir régulièrement pour vous tenir
            informé de nos pratiques en matière de cookies.
          </p>

          <h2 className="text-lg font-semibold mt-4">9. Contact</h2>
          <p className="mt-2">
            Si vous avez des questions ou des préoccupations concernant notre
            utilisation des cookies, n&apos;hésitez pas à nous{' '}
            <Link
              href="/contact#contact-form"
              className="text-blue-700 underline"
            >
              contacter
            </Link>
            .
          </p>

          <p className="text-sm text-gray-500 mt-6">
            {COMPANY.legal.name}, domicilié au {COMPANY.address.street},{' '}
            {COMPANY.address.zipCode} {COMPANY.address.city};{' '}
            {COMPANY.legal.form} au Capital de {COMPANY.legal.capital};{' '}
            {COMPANY.legal.siret} RCS
            {COMPANY.legal.rcs}.
          </p>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;
