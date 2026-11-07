'use client';
import { Facebook, InstagramIcon, LinkedinIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../../Logo';
import { COMPANY } from '@/constants/company';
import { ServiceWithContent } from '@/types/services';

interface FooterProps {
  services: ServiceWithContent[];
}

const Footer = ({ services }: FooterProps) => {
  const pathname = usePathname();

  // Sort services by title length (shorter first)
  const sortedServices = [...services].sort((a, b) => {
    const lengthA = a.title.replace(/[/&\s]+/g, ' ').trim().length;
    const lengthB = b.title.replace(/[/&\s]+/g, ' ').trim().length;
    if (lengthA === lengthB) {
      return a.title.localeCompare(b.title, 'fr', {
        numeric: true,
        sensitivity: 'base',
      });
    }
    return lengthA - lengthB;
  });

  const getLinkClass = (href: string) => {
    const isActive =
      href === '/' ? pathname === href : pathname.startsWith(href);
    return `text-base transition-colors ${
      isActive
        ? 'text-primary font-semibold'
        : 'text-gray-700 hover:text-primary'
    }`;
  };
  return (
    <footer className="py-8">
      <div className="container">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link
              href={COMPANY.socials.facebook}
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              className="text-gray-700 hover:text-gray-900"
            >
              <Facebook className="size-4 md:size-6" />
            </Link>
            <Link
              href={COMPANY.socials.instagram}
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="text-gray-700 hover:text-gray-900"
            >
              <InstagramIcon className="size-4 md:size-6" />
            </Link>
            <Link
              href={COMPANY.socials.linkedin}
              target="_blank"
              rel="noopener"
              aria-label="Linkedin"
              className="text-gray-700 hover:text-gray-900"
            >
              <LinkedinIcon className="size-4 md:size-6" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
          <div>
            <h3 className="font-bold">
              <Link
                href="/proprete-services"
                className={`${getLinkClass('/proprete-services')} transition-all duration-200 hover:underline hover:underline-offset-2`}
              >
                Propreté & Services
              </Link>
            </h3>
            <ul className="mt-4 space-y-2">
              {sortedServices.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/proprete-services/${service.slug}`}
                    className={getLinkClass(
                      `/proprete-services/${service.slug}`,
                    )}
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Entreprise</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className={getLinkClass('/')}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className={getLinkClass('/a-propos')}>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/avis" className={getLinkClass('/avis')}>
                  Avis
                </Link>
              </li>
            </ul>
            <h3 className="font-bold mt-4">Siège Social</h3>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>{COMPANY.address.street}</li>
              <li>
                {COMPANY.address.zipCode} {COMPANY.address.city}
              </li>
            </ul>
            <h3 className="font-bold mt-4">Nos Horaires</h3>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-200">
                <span className="text-gray-700 text-sm mb-1 sm:mb-0">
                  Lundi - Jeudi
                </span>
                <span className="text-gray-700 text-xs">
                  {COMPANY.hours.week}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-200">
                <span className="text-gray-700 text-sm mb-1 sm:mb-0">
                  Vendredi
                </span>
                <span className="text-gray-700 text-xs">
                  {COMPANY.hours.friday}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-200">
                <span className="text-gray-700 text-sm mb-1 sm:mb-0">
                  Samedi - Dimanche
                </span>
                <span className="text-red-600 font-medium text-xs">
                  {COMPANY.hours.weekend}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold">Aide</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/contact#contact-form"
                  className={getLinkClass('/contact#contact-form')}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#faq" className={getLinkClass('/#faq')}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/proprete-services"
                  className={getLinkClass('/proprete-services')}
                >
                  Nos services
                </Link>
              </li>
            </ul>
            <h3 className="font-bold mt-4">Nous Contacter</h3>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>
                Téléphone :{' '}
                <Link href={`tel:${COMPANY.phoneValue}`}>{COMPANY.phone}</Link>
              </li>
              <li>
                Mail :{' '}
                <Link
                  href={`mailto:${COMPANY.email}`}
                  className="text-sm font-semibold underline"
                >
                  {COMPANY.email}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Légal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/mentions-legales"
                  className={getLinkClass('/mentions-legales')}
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-de-confidentialite"
                  className={getLinkClass('/politique-de-confidentialite')}
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions-generales-d-utilisation"
                  className={getLinkClass(
                    '/conditions-generales-d-utilisation',
                  )}
                >
                  Conditions générales d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-des-cookies"
                  className={getLinkClass('/politique-des-cookies')}
                >
                  Politique de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-gray-500 text-nowrap">
          <div>
            © {new Date().getFullYear()} {COMPANY.name}. Tous droits réservés.
          </div>
          <Link
            href="https://www.edeveloppe.com/"
            target="_blank"
            rel="noopener"
            aria-label="Coded by eDeveloppe"
            className="flex gap-1 items-center"
          >
            <span>
              Codé par <span className="font-semibold">eDeveloppe</span>
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
