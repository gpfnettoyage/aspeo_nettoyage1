import { MetadataRoute } from 'next';
import { getActualites } from '@/lib/actualites';
import { getServices } from '@/lib/services';
import { COMPANY } from '@/constants/company';

const baseUrl = COMPANY.website;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  const lastModified = currentDate.toISOString();

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/proprete-services`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/medias`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/medias/actualites`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // {
    //   url: `${baseUrl}/medias/presse`,
    //   lastModified,
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/avis`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Pages de services générées dynamiquement (only published services)
  const services = await getServices();
  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/proprete-services/${service.slug}`,
    lastModified: service.updatedAt.toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Pages d'actualités générées dynamiquement
  const actualites = await getActualites();
  const actualitesPages: MetadataRoute.Sitemap = actualites.map((actualite) => ({
    url: `${baseUrl}/medias/actualites/${actualite.slug}`,
    lastModified: new Date(actualite.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Note: Les documents de presse sont des PDFs téléchargeables,
  // ils n'ont pas de pages individuelles, seulement la page principale /medias/presse

  // Pages légales
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-de-confidentialite`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/conditions-generales-d-utilisation`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-des-cookies`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Combine toutes les pages
  return [...staticPages, ...servicePages, ...actualitesPages, ...legalPages];
}
