import { Metadata } from 'next';
import Link from 'next/link';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SchemaGraph } from '@/types/jsonld';
import { stringifyJsonLd } from '@/utils/jsonld-generator';

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const cguTitle = "Conditions Générales d'Utilisation | ASPEO";
const cguDescription =
  'Consultez les CGU du site ASPEO Nettoyage : accès, collecte des données, propriété intellectuelle et responsabilités. En vigueur au 26/02/2026.';

export const metadata: Metadata = {
  title: cguTitle,
  description: cguDescription,
  alternates: {
    canonical: `${COMPANY.website}/conditions-generales-d-utilisation`,
  },
  openGraph: pageOpenGraph(
    cguTitle,
    cguDescription,
    '/conditions-generales-d-utilisation',
  ),
};

const CGUPage = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Conditions Générales d'Utilisation - ${COMPANY.name}`,
    description: metadata.description,
    url: `${COMPANY.website}/conditions-generales-d-utilisation`,
  };

  const breadcrumbItems = [{ label: "Conditions générales d'utilisation" }];

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
          id="json-ld-terms-of-use"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(graphJsonLd) }}
        />
        <h1 className="text-2xl font-bold ">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm text-gray-500">En vigueur au 26/02/2026</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            ARTICLE 1 : Les mentions légales
          </h2>
          <p className="mt-2">
            L&apos;édition du site www.aspeo.fr est assurée par la Société
            {COMPANY.legal.form} {COMPANY.legal.name}, au capital de{' '}
            {COMPANY.legal.capital}, immatriculée au RCS de
            {COMPANY.legal.rcs} sous le numéro {COMPANY.legal.siret}, dont le
            siège social est situé au {COMPANY.address.street},{' '}
            {COMPANY.address.zipCode} {COMPANY.address.city}.
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Numéro de téléphone : {COMPANY.phone}</li>
            <li>Adresse e-mail : {COMPANY.email}</li>
            <li>Numéro de TVA intracommunautaire : {COMPANY.legal.tva}</li>
            <li>
              Directeur de la publication : {COMPANY.legal.publicationDirector}
            </li>
          </ul>
          <p className="mt-2">
            L&apos;hébergeur du site www.aspeo.fr est la société Vercel, dont le
            siège social est situé au 340 S Lemon Ave #4133 Walnut, CA 91789.
          </p>
          <h3 className="text-lg font-semibold mt-4">
            ARTICLE 2 : Accès au site
          </h3>
          <p className="mt-2">
            Le site www.aspeo.fr permet à l&apos;Utilisateur un accès gratuit
            aux services suivants :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Site Vitrine</li>
          </ul>
          <p className="mt-2">
            Le site est accessible gratuitement en tout lieu à tout Utilisateur
            ayant un accès à Internet. Tous les frais supportés par
            l&apos;Utilisateur pour accéder au service (matériel informatique,
            logiciels, connexion Internet, etc.) sont à sa charge.
          </p>
          <h3 className="text-lg font-semibold mt-4">
            ARTICLE 3 : Collecte des données
          </h3>
          <p className="mt-2">
            Le site assure à l&apos;Utilisateur une collecte et un traitement
            d&apos;informations personnelles dans le respect de la vie privée
            conformément à la loi n°78-17 du 6 janvier 1978 relative à
            l&apos;informatique, aux fichiers et aux libertés.
          </p>
          <p className="mt-2">
            En vertu de la loi Informatique et Libertés, en date du 6 janvier
            1978, l&apos;Utilisateur dispose d&apos;un droit d&apos;accès, de
            rectification, de suppression et d&apos;opposition de ses données
            personnelles. L&apos;Utilisateur exerce ce droit :
          </p>
          <h3 className="text-lg font-semibold mt-4">
            ARTICLE 4 : Propriété intellectuelle
          </h3>
          <p className="mt-2">
            Les marques, logos, signes ainsi que tous les contenus du site
            (textes, images, son…) font l&apos;objet d&apos;une protection par
            le Code de la propriété intellectuelle et plus particulièrement par
            le droit d&apos;auteur.
          </p>
          <p className="mt-2">
            L&apos;Utilisateur doit solliciter l&apos;autorisation préalable du
            site pour toute reproduction, publication, copie des différents
            contenus. Il s&apos;engage à une utilisation des contenus du site
            dans un cadre strictement privé, toute utilisation à des fins
            commerciales et publicitaires est strictement interdite.
          </p>
          <p className="mt-2">
            Toute représentation totale ou partielle de ce site par quelque
            procédé que ce soit, sans l&apos;autorisation expresse de
            l&apos;exploitant du site Internet constituerait une contrefaçon
            sanctionnée par l&apos;article L 335-2 et suivants du Code de la
            propriété intellectuelle.
          </p>
          <p className="mt-2">
            Il est rappelé conformément à l&apos;article L122-5 du Code de
            propriété intellectuelle que l&apos;Utilisateur qui reproduit, copie
            ou publie le contenu protégé doit citer l&apos;auteur et sa source.
          </p>
          <h3 className="text-lg font-semibold mt-4">
            ARTICLE 5 : Responsabilité
          </h3>
          <p className="mt-2">
            Les sources des informations diffusées sur le site www.aspeo.fr sont
            réputées fiables mais le site ne garantit pas qu&apos;il soit exempt
            de défauts, d&apos;erreurs ou d&apos;omissions.
          </p>
          <p className="mt-2">
            Les informations communiquées sont présentées à titre indicatif et
            général sans valeur contractuelle. Malgré des mises à jour
            régulières, le site www.aspeo.fr ne peut être tenu responsable de la
            modification des dispositions administratives et juridiques
            survenant après la publication. De même, le site ne peut être tenu
            responsable de l&apos;utilisation et de l&apos;interprétation de
            l&apos;information contenue dans ce site.
          </p>
          <p className="mt-2">
            Le site www.aspeo.fr ne peut être tenu pour responsable
            d&apos;éventuels virus qui pourraient infecter l&apos;ordinateur ou
            tout matériel informatique de l&apos;Internaute, suite à une
            utilisation, à l&apos;accès, ou au téléchargement provenant de ce
            site.
          </p>
          <p className="mt-2">
            La responsabilité du site ne peut être engagée en cas de force
            majeure ou du fait imprévisible et insurmontable d&apos;un tiers.
          </p>
          <h3 className="text-lg font-semibold mt-4">
            ARTICLE 6 : Liens hypertextes
          </h3>
          <p className="mt-2">
            Des liens hypertextes peuvent être présents sur le site.
            L&apos;Utilisateur est informé qu&apos;en cliquant sur ces liens, il
            sortira du site www.aspeo.fr. Ce dernier n&apos;a pas de contrôle
            sur les pages web sur lesquelles aboutissent ces liens et ne
            saurait, en aucun cas, être responsable de leur contenu.
          </p>
          <h3 className="text-lg font-semibold mt-4">ARTICLE 7 : Cookies</h3>
          <p className="mt-2">
            L&apos;Utilisateur est informé que lors de ses visites sur le site,
            des cookies peuvent s&apos;installer automatiquement sur son
            appareil.
          </p>
          <p className="mt-2">
            Les cookies sont de petits fichiers stockés sur l&apos;appareil de
            l&apos;Utilisateur par son navigateur. Ils permettent
            d&apos;améliorer l&apos;expérience de navigation, de mémoriser les
            préférences et d&apos;analyser l&apos;utilisation du site.
          </p>
          <p className="mt-2">Notre site utilise notamment :</p>
          <ul className="list-disc list-inside mt-2">
            <li>Un cookie de consentement pour mémoriser vos préférences</li>
            <li>
              Des cookies d&apos;analyse (Google Analytics, Hotjar) soumis à
              votre consentement
            </li>
            <li>
              Des cookies de session pour l&apos;authentification des
              administrateurs
            </li>
          </ul>
          <p className="mt-2">
            L&apos;Utilisateur peut gérer ses préférences via la bannière de
            consentement affichée lors de sa première visite, ou en supprimant
            les cookies via les paramètres de son navigateur.
          </p>
          <p className="mt-2">
            Pour plus d&apos;informations, consultez notre{' '}
            <Link
              href="/politique-des-cookies"
              className="text-blue-700 underline"
            >
              Politique des Cookies
            </Link>
            .
          </p>
          <h3 className="text-lg font-semibold mt-4">
            ARTICLE 8 : Droit applicable et juridiction compétente
          </h3>
          <p className="mt-2">
            La législation française s&apos;applique au présent contrat. En cas
            d&apos;absence de résolution amiable d&apos;un litige né entre les
            parties, les tribunaux français seront seuls compétents pour en
            connaître.
          </p>
          <p className="mt-2">
            Pour toute question relative à l&apos;application des présentes CGU,
            vous pouvez joindre l&apos;éditeur aux coordonnées inscrites à
            l&apos;ARTICLE 1.
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Rédigé sur{' '}
          <Link
            href="https://www.legalplace.fr/"
            className="text-blue-700 underline"
          >
            https://www.legalplace.fr/
          </Link>
        </p>
      </div>
    </>
  );
};

export default CGUPage;
