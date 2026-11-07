import { Metadata } from 'next';
import Link from 'next/link';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SchemaGraph } from '@/types/jsonld';
import { stringifyJsonLd } from '@/utils/jsonld-generator';

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const mentionsTitle = 'Mentions Légales | ASPEO Nettoyage Loire & Rhône';
const mentionsDescription =
  "Mentions légales du site ASPEO Nettoyage : informations sur l'éditeur, l'hébergement et conditions d'utilisation. Entreprise basée en Loire (42).";

export const metadata: Metadata = {
  title: mentionsTitle,
  description: mentionsDescription,
  alternates: {
    canonical: `${COMPANY.website}/mentions-legales`,
  },
  openGraph: pageOpenGraph(
    mentionsTitle,
    mentionsDescription,
    '/mentions-legales',
  ),
};

const MentionsLegalPage = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Mentions Légales - ${COMPANY.name}`,
    description: metadata.description,
    url: `${COMPANY.website}/mentions-legales`,
  };

  const breadcrumbItems = [{ label: 'Mentions légales' }];

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
          id="json-ld-legal-notice"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(graphJsonLd) }}
        />
        <h1 className="text-2xl font-bold ">Mentions Légales</h1>
        <h2 className="text-sm text-gray-500">En vigueur au 26/02/2026</h2>
        <div className="mt-6">
          <p className="mt-2">
            Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004
            pour la Confiance en l’économie numérique, il est porté à la
            connaissance des utilisateurs et visiteurs, ci-après
            l&apos;&quot;Utilisateur&quot;, du site www.aspeo.fr, ci-après le
            &quot;Site&quot;, les présentes mentions légales.
          </p>
          <p className="mt-2">
            La connexion et la navigation sur le Site par l&apos;Utilisateur
            implique acceptation intégrale et sans réserve des présentes
            mentions légales.
          </p>
          <p className="mt-2">
            Ces dernières sont accessibles sur le Site à la rubrique
            &quot;Mentions légales&quot;.
          </p>
          <h3 className="text-lg font-semibold mt-4">EDITION DU SITE</h3>
          <p className="mt-2">
            L&apos;édition du Site est assurée par la société{' '}
            {COMPANY.legal.name}, {COMPANY.legal.form}
            au capital de {COMPANY.legal.capital}, immatriculée au Registre du
            Commerce et des Sociétés de {COMPANY.legal.rcs} sous le numéro{' '}
            {COMPANY.legal.siret}, dont le siège social est situé au{' '}
            {COMPANY.address.street}, {COMPANY.address.zipCode}{' '}
            {COMPANY.address.city}.
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Numéro de téléphone : {COMPANY.phone}</li>
            <li>Adresse e-mail : {COMPANY.email}</li>
            <li>N° de TVA intracommunautaire : {COMPANY.legal.tva}</li>
            <li>
              Directeur de la publication : {COMPANY.legal.publicationDirector}
            </li>
          </ul>
          <h3 className="text-lg font-semibold mt-4">HEBERGEUR</h3>
          <p className="mt-2">
            L&apos;hébergeur du Site est la société Vercel, dont le siège social
            est situé au 340 S Lemon Ave, 91789 Walnut.
          </p>
          <h3 className="text-lg font-semibold mt-4">ACCES AU SITE</h3>
          <p className="mt-2">
            Le Site est normalement accessible, à tout moment, à
            l&apos;Utilisateur. Toutefois, l&apos;Editeur pourra, à tout moment,
            suspendre, limiter ou interrompre le Site afin de procéder,
            notamment, à des mises à jour ou des modifications de son contenu.
            L&apos;Editeur ne pourra en aucun cas être tenu responsable des
            conséquences éventuelles de cette indisponibilité sur les activités
            de l&apos;Utilisateur.
          </p>
          <p className="mt-2">
            Toute utilisation, reproduction, diffusion, commercialisation,
            modification de toute ou partie du Site, sans autorisation expresse
            de l&apos;Editeur est prohibée et pourra entraîner des actions et
            poursuites judiciaires telles que prévues par la règlementation en
            vigueur.
          </p>
          <h3 className="text-lg font-semibold mt-4">SECURITE DU SITE</h3>
          <p className="mt-2">
            Le Site met en œuvre des mesures de sécurité techniques et
            organisationnelles pour protéger les données et les systèmes :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Protection contre les attaques par force brute :</strong>{' '}
              Le nombre de tentatives de connexion est limité. Après plusieurs
              échecs, l&apos;adresse IP est temporairement bloquée.
            </li>
            <li>
              <strong>Authentification renforcée :</strong> Les comptes
              administrateur sont protégés par une authentification à deux
              facteurs (2FA) via code temporaire (TOTP).
            </li>
            <li>
              <strong>Limitation de débit :</strong> Des mécanismes de rate
              limiting protègent le Site contre les abus et les attaques par
              déni de service.
            </li>
            <li>
              <strong>Chiffrement :</strong> Toutes les communications sont
              chiffrées via HTTPS (TLS 1.3).
            </li>
            <li>
              <strong>Journalisation :</strong> Les actions administratives sont
              journalisées pour assurer la traçabilité.
            </li>
          </ul>
          <p className="mt-2">
            En cas de tentative d&apos;accès non autorisé ou d&apos;activité
            suspecte, l&apos;Editeur se réserve le droit de bloquer l&apos;accès
            au Site de manière temporaire ou permanente.
          </p>
          <p className="mt-2">
            Pour plus d&apos;informations, se reporter aux CGU du site
            www.aspeo.fr accessibles depuis la rubrique &quot;CGU&quot;.
          </p>
          <p className="mt-2">
            Pour plus d&apos;informations, se reporter à la source Politique de
            confidentialité du site www.aspeo.fr accessible à la rubrique
            &quot;Politique de confidentialité&quot;.
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

export default MentionsLegalPage;
