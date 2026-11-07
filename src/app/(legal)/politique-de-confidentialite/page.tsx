import { Metadata } from 'next';
import Link from 'next/link';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { pageOpenGraph } from '@/utils/seo';
import { COMPANY } from '@/constants/company';
import { JsonLdObject, SchemaGraph } from '@/types/jsonld';
import { stringifyJsonLd } from '@/utils/jsonld-generator';

// Descriptions optimisées pour le SEO (max 60 chars titre, 158 chars description)
const privacyTitle = 'Politique de Confidentialité | ASPEO';
const privacyDescription =
  'Politique de confidentialité ASPEO Nettoyage : collecte, utilisation et protection de vos données personnelles. Conformité RGPD en Loire et Rhône.';

export const metadata: Metadata = {
  title: privacyTitle,
  description: privacyDescription,
  alternates: {
    canonical: `${COMPANY.website}/politique-de-confidentialite`,
  },
  openGraph: pageOpenGraph(
    privacyTitle,
    privacyDescription,
    '/politique-de-confidentialite',
  ),
};

const PrivacyPolicyPage = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Politique de Confidentialité - ${COMPANY.name}`,
    description: metadata.description,
    url: `${COMPANY.website}/politique-de-confidentialite`,
  };

  const breadcrumbItems = [{ label: 'Politique de confidentialité' }];

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
          id="json-ld-privacy-policy"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(graphJsonLd) }}
        />
        <h1 className="text-2xl font-bold">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500">En vigueur au 26/02/2026</p>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mt-4">ARTICLE 1 : PRÉAMBULE</h2>
          <p className="mt-2">
            La présente politique de confidentialité a pour but d’informer les
            utilisateurs du site :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Sur la manière dont sont collectées leurs données personnelles.
            </li>
            <li>Sur les droits dont ils disposent concernant ces données.</li>
            <li>
              Sur la personne responsable du traitement des données à caractère
              personnel collectées et traitées.
            </li>
            <li>Sur les destinataires de ces données personnelles.</li>
            <li>Sur la politique du site en matière de cookies.</li>
          </ul>
          <p className="mt-2">
            Cette politique complète les mentions légales et les Conditions
            Générales d’Utilisation consultables par les utilisateurs à
            l’adresse suivante :
          </p>
          <Link href="/mentions-legales" className="text-blue-700 underline">
            {COMPANY.website}/mentions-legales
          </Link>
          <br />
          <Link
            href="/conditions-generales-d-utilisation"
            className="text-blue-700 underline"
          >
            {COMPANY.website}/conditions-generales-d-utilisation
          </Link>

          <h2 className="text-lg font-semibold mt-4">
            ARTICLE 2 : PRINCIPES RELATIFS À LA COLLECTE ET AU TRAITEMENT DES
            DONNÉES PERSONNELLES
          </h2>
          <p className="mt-2">
            Conformément à l’article 5 du Règlement européen 2016/679, les
            données à caractère personnel sont :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Traitées de manière licite, loyale et transparente au regard de la
              personne concernée.
            </li>
            <li>
              Collectées pour des finalités déterminées, explicites et
              légitimes.
            </li>
            <li>
              Adéquates, pertinentes et limitées à ce qui est nécessaire au
              regard des finalités pour lesquelles elles sont traitées.
            </li>
            <li>Exactes et, si nécessaire, tenues à jour.</li>
            <li>
              Conservées sous une forme permettant l&apos;identification des
              personnes concernées pendant une durée n&apos;excédant pas celle
              nécessaire.
            </li>
            <li>
              Traitées de façon à garantir une sécurité appropriée des données
              collectées.
            </li>
          </ul>
          <p className="mt-2">
            Le traitement n&apos;est licite que si, et dans la mesure où, au
            moins une des conditions suivantes est remplie :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              La personne concernée a consenti au traitement de ses données pour
              une ou plusieurs finalités spécifiques.
            </li>
            <li>
              Le traitement est nécessaire à l&apos;exécution d&apos;un contrat
              ou à l&apos;exécution de mesures précontractuelles prises à la
              demande de celle-ci.
            </li>
            <li>
              Le traitement est nécessaire au respect d&apos;une obligation
              légale.
            </li>
            <li>
              Le traitement est nécessaire à la sauvegarde des intérêts vitaux
              de la personne concernée ou d&apos;une autre personne physique.
            </li>
            <li>
              Le traitement est nécessaire à l&apos;exécution d&apos;une mission
              d&apos;intérêt public.
            </li>
            <li>
              Le traitement est nécessaire aux fins des intérêts légitimes
              poursuivis par le responsable du traitement ou par un tiers.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4">
            ARTICLE 3 : DONNÉES À CARACTÈRE PERSONNEL COLLECTÉES ET TRAITÉES
            DANS LE CADRE DE LA NAVIGATION SUR LE SITE
          </h2>
          <h3 className="text-md font-semibold mt-4">
            Article 3.1 : Données collectées
          </h3>
          <p className="mt-2">
            Les données personnelles collectées dans le cadre de notre activité
            sont les suivantes : Aucune, certaines données sont collectées
            uniquement si l’utilisateur remplit le formulaire de contact.
          </p>
          <p className="mt-2">
            La collecte et le traitement de ces données répond à la finalité
            suivante : Pour pouvoir traiter leur devis et répondre au mieux à
            leurs questions.
          </p>
          <p className="mt-2">Gestion de devis ; Suivi de demande.</p>

          <h3 className="text-md font-semibold mt-4">
            Article 3.2 : Mode de collecte des données
          </h3>
          <p className="mt-2">
            Lorsque vous utilisez notre site, aucune donnée n&apos;est
            automatiquement collectée. Certaines données sont collectées
            uniquement si l’utilisateur remplit le formulaire de contact.
          </p>
          <p className="mt-2">
            D’autres données personnelles sont collectées lorsque vous effectuez
            les opérations suivantes sur la plateforme :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Formulaire de contact : Prénom ; Nom ; Adresse e-mail ; Numéro de
              téléphone ; Entreprise (optionnel) ; Adresse complète (optionnel)
              ; Description du projet (optionnel)
            </li>
          </ul>
          <p className="mt-2">
            Elles sont conservées par le responsable du traitement dans des
            conditions raisonnables de sécurité, pour une durée nécessaire à la
            réalisation de la finalité du traitement.
          </p>

          <h3 className="text-md font-semibold mt-4">
            Article 3.3 : Hébergement des données
          </h3>
          <p className="mt-2">
            Le site www.aspeo.fr est hébergé par Vercel App, 340 S Lemon Ave
            #4133 Walnut, CA 91789 ; support@vercel.com
          </p>

          <h3 className="text-md font-semibold mt-4">
            Article 3.4 : Données de sécurité collectées
          </h3>
          <p className="mt-2">
            Dans le cadre de la protection de notre site et de nos utilisateurs,
            nous collectons automatiquement les données suivantes :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Adresse IP :</strong> Collectée lors de chaque requête
              pour des raisons de sécurité (détection de tentatives
              d&apos;intrusion, protection contre les attaques par force brute).
            </li>
            <li>
              <strong>Tentatives de connexion échouées :</strong> L&apos;adresse
              IP, l&apos;email utilisé et l&apos;horodatage sont enregistrés
              pendant 24 heures pour détecter les activités suspectes.
            </li>
            <li>
              <strong>Empreinte de l&apos;appareil :</strong> Nous utilisons des
              techniques de device fingerprinting pour sécuriser les connexions
              administrateur et détecter les accès non autorisés.
            </li>
            <li>
              <strong>User-Agent :</strong> Informations sur votre navigateur
              collectées à des fins de sécurité et d&apos;analyse.
            </li>
          </ul>
          <p className="mt-2">
            Base légale : Article 6.1.f du RGPD (intérêt légitime - sécurité du
            système d&apos;information).
          </p>

          <h3 className="text-md font-semibold mt-4">
            Article 3.5 : Mesures de sécurité automatisées
          </h3>
          <p className="mt-2">
            Notre site met en œuvre les mesures de sécurité suivantes qui
            impliquent un traitement automatisé de données :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Limitation de débit (Rate limiting) :</strong> Le nombre
              de requêtes par IP est limité pour prévenir les abus. Les IP
              dépassant ces limites peuvent être temporairement bloquées.
            </li>
            <li>
              <strong>Bannissement automatique :</strong> Après plusieurs
              tentatives de connexion échouées (10 en 15 minutes par défaut),
              l&apos;adresse IP est automatiquement bannie pendant 1 heure.
            </li>
            <li>
              <strong>Authentification à deux facteurs (2FA) :</strong> Les
              comptes administrateur bénéficient d&apos;une authentification
              renforcée via code temporaire (TOTP).
            </li>
            <li>
              <strong>Journalisation des actions :</strong> Les actions
              administratives sont enregistrées dans un journal d&apos;audit
              pour assurer la traçabilité et la sécurité.
            </li>
          </ul>
          <p className="mt-2">
            Durée de conservation des données de sécurité :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Tentatives de connexion échouées : 24 heures</li>
            <li>
              IP bannies : durée du bannissement (1 heure par défaut, extensible
              manuellement)
            </li>
            <li>Journal d&apos;audit des actions administratives : 90 jours</li>
          </ul>

          <h3 className="text-md font-semibold mt-4">
            Article 3.6 : Données des utilisateurs administrateurs
          </h3>
          <p className="mt-2">
            Pour les utilisateurs disposant d&apos;un accès administrateur au
            site, les données suivantes sont collectées et traitées :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Compte utilisateur :</strong> Nom, adresse e-mail, rôle,
              statut de vérification, date de création.
            </li>
            <li>
              <strong>Sessions de connexion :</strong> Adresse IP, User-Agent
              (navigateur), date de création et d&apos;expiration.
            </li>
            <li>
              <strong>Appareils de confiance :</strong> Empreinte de
              l&apos;appareil (hash), navigateur, système d&apos;exploitation,
              adresse IP de la dernière connexion, nom de l&apos;appareil.
            </li>
            <li>
              <strong>Authentification à deux facteurs :</strong> Secret TOTP
              (chiffré), codes de secours (chiffrés).
            </li>
          </ul>
          <p className="mt-2">
            <strong>Vérification des nouveaux appareils :</strong> Lors
            d&apos;une connexion depuis un appareil non reconnu, un code de
            vérification à 6 chiffres est envoyé par e-mail. Ce code expire
            après 10 minutes.
          </p>
          <p className="mt-2">
            <strong>Notifications par e-mail :</strong> Les administrateurs
            reçoivent des e-mails de sécurité pour :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Vérification d&apos;un nouvel appareil (avec IP, navigateur, OS)
            </li>
            <li>Confirmation d&apos;ajout d&apos;un appareil de confiance</li>
            <li>Réinitialisation de mot de passe</li>
          </ul>
          <p className="mt-2">
            Durée de conservation des données administrateur :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Compte utilisateur : jusqu&apos;à suppression du compte</li>
            <li>Sessions : jusqu&apos;à expiration ou déconnexion</li>
            <li>
              Appareils de confiance : jusqu&apos;à suppression manuelle ou
              suppression du compte
            </li>
            <li>Codes de vérification d&apos;appareil : 10 minutes</li>
          </ul>
          <p className="mt-2">
            Base légale : Article 6.1.b du RGPD (exécution d&apos;un contrat) et
            Article 6.1.f (intérêt légitime - sécurité).
          </p>

          <h3 className="text-md font-semibold mt-4">
            Article 3.7 : Politique en matière de &quot;cookies&quot;
          </h3>
          <p className="mt-2">
            Notre site utilise des cookies et technologies similaires. Pour plus
            d&apos;informations, veuillez consulter notre{' '}
            <Link
              href="/politique-des-cookies"
              className="text-blue-700 underline"
            >
              Politique des Cookies
            </Link>
            .
          </p>
          <p className="mt-2">Les cookies utilisés comprennent notamment :</p>
          <ul className="list-disc list-inside mt-2">
            <li>Cookie de consentement (conservation de vos préférences)</li>
            <li>
              Cookies d&apos;analyse (Google Analytics, Hotjar) - soumis à votre
              consentement
            </li>
            <li>
              Cookies de session pour l&apos;authentification des
              administrateurs
            </li>
          </ul>

          <h3 className="text-md font-semibold mt-4">
            Article 3.8 : Sous-traitants et destinataires des données
          </h3>
          <p className="mt-2">
            Vos données peuvent être transmises aux sous-traitants suivants :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Vercel Inc.</strong> (hébergement et base de données
              PostgreSQL) - États-Unis - Clauses contractuelles types UE
            </li>
            <li>
              <strong>Upstash Inc.</strong> (base de données Redis pour la
              sécurité et le rate limiting) - États-Unis/UE - Données stockées
              en région UE
            </li>
            <li>
              <strong>OVH SAS</strong> (service email SMTP pour les
              notifications de sécurité) - France (UE)
            </li>
            <li>
              <strong>Google LLC</strong> (Google Analytics) - États-Unis -
              Soumis à votre consentement
            </li>
            <li>
              <strong>Hotjar Ltd</strong> (analyse comportementale) - Malte (UE)
              - Soumis à votre consentement
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4">
            ARTICLE 4 : RESPONSABLE DU TRAITEMENT DES DONNÉES ET DÉLÉGUÉ À LA
            PROTECTION DES DONNÉES
          </h2>
          <h3 className="text-md font-semibold mt-4">
            Article 4.1 : Le responsable du traitement des données
          </h3>
          <p className="mt-2">
            Les données à caractère personnelles sont collectées par{' '}
            {COMPANY.legal.name}, {COMPANY.legal.form} au capital de{' '}
            {COMPANY.legal.capital}, dont le numéro d’immatriculation est le{' '}
            {COMPANY.legal.siret}.
          </p>
          <p className="mt-2">
            Le responsable du traitement des données à caractère personnel peut
            être contacté de la manière suivante :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Par courrier à l’adresse : {COMPANY.address.street},{' '}
              {COMPANY.address.zipCode} {COMPANY.address.city}
            </li>
            <li>Par téléphone, au {COMPANY.phone}</li>
            <li>Par mail : {COMPANY.email}</li>
          </ul>

          <h3 className="text-md font-semibold mt-4">
            Article 4.2 : Le délégué à la protection des données
          </h3>
          <p className="mt-2">
            Le délégué à la protection des données de l’entreprise ou du
            responsable est : Mr {COMPANY.legal.publicationDirector} Président
            de {COMPANY.legal.name}, {COMPANY.address.street},{' '}
            {COMPANY.address.zipCode} {COMPANY.address.city}.
          </p>
          <p className="mt-2">
            Si vous estimez, après nous avoir contactés, que vos droits
            “Informatique et Libertés” ne sont pas respectés, vous pouvez
            adresser une information à la CNIL.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            ARTICLE 5 : LES DROITS DE L’UTILISATEUR EN MATIÈRE DE COLLECTE ET DE
            TRAITEMENT DES DONNÉES
          </h2>
          <p className="mt-2">
            Tout utilisateur concerné par le traitement de ses données
            personnelles peut se prévaloir des droits suivants, en application
            du règlement européen 2016/679 et de la Loi Informatique et Liberté
            (Loi 78-17 du 6 janvier 1978) :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Droit d’accès, de rectification et droit à l’effacement des
              données.
            </li>
            <li>Droit à la portabilité des données.</li>
            <li>
              Droit à la limitation et à l’opposition du traitement des données.
            </li>
            <li>
              Droit de ne pas faire l’objet d’une décision fondée exclusivement
              sur un procédé automatisé.
            </li>
            <li>Droit de déterminer le sort des données après la mort.</li>
            <li>Droit de saisir l’autorité de contrôle compétente.</li>
          </ul>
          <p className="mt-2">
            Pour exercer vos droits, veuillez adresser votre courrier par mail à
            {COMPANY.email}.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            ARTICLE 6 : CONDITIONS DE MODIFICATION DE LA POLITIQUE DE
            CONFIDENTIALITÉ
          </h2>
          <p className="mt-2">
            L'éditeur du site ASPEO Nettoyage se réserve le droit de pouvoir
            modifier la présente Politique à tout moment afin d’assurer aux
            utilisateurs du site sa conformité avec le droit en vigueur.
          </p>
          <p className="mt-2">
            Les éventuelles modifications ne sauraient avoir d’incidence sur les
            achats antérieurement effectués sur le site, lesquels restent soumis
            à la Politique en vigueur au moment de l’achat et telle qu’acceptée
            par l’utilisateur lors de la validation de l’achat.
          </p>
          <p className="mt-2">
            L’utilisateur est invité à prendre connaissance de cette Politique à
            chaque fois qu’il utilise nos services, sans qu’il soit nécessaire
            de l’en prévenir formellement.
          </p>
          <p className="mt-2">
            La présente politique, éditée le 18/08/2024, a été mise à jour le
            26/02/2026.
          </p>

          <h2 className="text-lg font-semibold mt-4">
            ARTICLE 7 : TRANSFERT DE DONNEES EN DEHORS DE L&apos;ESPACE
            ECONOMIQUE EUROPEEN
          </h2>
          <p className="mt-2">
            Certaines de vos données peuvent être transférées vers des pays
            situés en dehors de l&apos;Espace Économique Européen (EEE),
            notamment les États-Unis, dans le cadre de l&apos;utilisation de nos
            sous-traitants techniques (voir Article 3.8).
          </p>
          <p className="mt-2">
            Ces transferts sont encadrés par des garanties appropriées
            conformément au RGPD :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Clauses contractuelles types (CCT) :</strong> Nos
              sous-traitants américains (Vercel, Google, Upstash) ont signé les
              clauses contractuelles types approuvées par la Commission
              européenne.
            </li>
            <li>
              <strong>Data Privacy Framework (DPF) :</strong> Certains de nos
              sous-traitants sont certifiés dans le cadre du EU-U.S. Data
              Privacy Framework.
            </li>
          </ul>
          <p className="mt-2">
            Nous nous engageons à ce que tout transfert soit effectué dans la
            stricte limite nécessaire aux finalités du traitement et dans le
            respect des exigences du Règlement.
          </p>

          <p className="text-sm text-gray-500 mt-6">
            {COMPANY.legal.name}, domicilié au {COMPANY.address.street},{' '}
            {COMPANY.address.zipCode} {COMPANY.address.city};{' '}
            {COMPANY.legal.form} au Capital de {COMPANY.legal.capital};{' '}
            {COMPANY.legal.siret} RCS
            {COMPANY.legal.rcs}.
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

export default PrivacyPolicyPage;
