import { requireAdmin } from '@/lib/auth';
import { getServiceBySlugAdmin } from '@/lib/services';
import { notFound } from 'next/navigation';
import Service from '@/components/services/Service';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Slug validation regex (lowercase letters, numbers, hyphens only)
const SLUG_REGEX = /^[a-z0-9-]+$/;

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicePreviewPage({ params }: PreviewPageProps) {
  await requireAdmin();

  const { slug } = await params;

  // Validate slug format to prevent injection
  if (!SLUG_REGEX.test(slug) || slug.length > 200) {
    notFound();
  }

  const service = await getServiceBySlugAdmin(slug);

  if (!service) {
    notFound();
  }

  // Transform service to ServiceWithContentAndCategory format for the component
  const serviceWithContent = {
    ...service,
    // Flatten content
    images: service.content.images,
    descriptions: service.content.descriptions,
    expertise: service.content.expertise,
    introText: service.content.introText,
    contextText: service.content.contextText,
    targetSpaces: service.content.targetSpaces,
    prestationsCategories: service.content.prestationsCategories,
    process: service.content.process,
    guarantees: service.content.guarantees,
    applicationSectors: service.content.applicationSectors,
    faq: service.content.faq,
    whyChoose: service.content.whyChoose,
    subServices: service.content.subServices,
    // Add category as null (preview doesn't need full category)
    category: null,
  };

  return (
    <div className="min-h-screen">
      {/* Preview Banner */}
      <div className="bg-amber-500 text-white px-4 py-3 sticky top-14 sm:top-16 z-40">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-amber-600 text-white border-0">
              {service.published ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Publié
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Brouillon
                </>
              )}
            </Badge>
            <span className="font-medium text-sm sm:text-base">
              Mode prévisualisation - Cette page n&apos;est pas visible publiquement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-amber-700 hover:bg-amber-50"
              asChild
            >
              <Link href={`/gp8x2k4m/services/${service.id}`}>
                Modifier
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-amber-600"
              asChild
            >
              <Link href="/gp8x2k4m/services">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Service Preview */}
      <div className="pt-12">
        <Service service={serviceWithContent} relatedServices={[]} />
      </div>
    </div>
  );
}
