import type { Metadata } from 'next';
import PageHero from '@/components/site/shared/PageHero';
import { ButtonLink, Container, Stars } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getPageContent, getTestimonials } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb, localBusiness } from '@/lib/site/jsonld';
import { initialsOf } from '@/lib/site/text';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('avis');
}

export default async function ReviewsPage() {
  const [{ c }, testimonials, settings] = await Promise.all([getPageContent('avis'), getTestimonials(), getSettings()]);
  const { stats, company } = settings;
  const rating = Number.isInteger(stats.googleRating) ? String(stats.googleRating) : stats.googleRating.toFixed(1).replace('.', ',');
  return (
    <main>
      <JsonLd graph={[localBusiness(settings), breadcrumb([{ name: 'Avis clients', path: '/avis' }], company.website)]} />
      <PageHero
        eyebrow={c.t('hero.eyebrow')}
        title={c.t('hero.title')}
        image={c.t('hero.image')}
        imageAlt="Client ASPEO satisfait"
        actions={<div className="flex items-center gap-[16px] flex-wrap">
          <span className="font-heading font-extrabold text-[length:2rem]">{rating}/5</span>
          <Stars className="text-[length:1.1rem]" />
          <span className="text-[color:rgba(255,255,255,.85)]">Basé sur {stats.googleReviewCount} avis clients Google</span>
          {company.googleReviewUrl && <ButtonLink href={company.googleReviewUrl} external target="_blank" rel="noopener noreferrer" className="ml-[8px] p-[12px_20px] text-[length:.9rem]">Laissez-nous un avis</ButtonLink>}
        </div>}
      />
      <section className="p-[clamp(48px,7vw,88px)_0] bg-[color:#f5f7fa]">
        <Container>
          <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[20px]">
            {testimonials.map((t) => (
              <li key={t.id}>
                <figure className="m-0 h-full bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[28px_26px] flex flex-col gap-[16px] relative">
                  <span className="absolute top-[16px] right-[22px] [font-family:Georgia,serif] text-[length:2.8rem] text-[color:var(--asp-accent-ink)] opacity-[.14] leading-none" aria-hidden="true">”</span>
                  <Stars className="text-[length:.95rem]" />
                  <blockquote className="text-[length:.98rem] leading-[1.7] text-[color:#334155] m-0 flex-1">“{t.quote}”</blockquote>
                  <figcaption className="flex items-center gap-[12px] pt-[6px] [border-top:1px_solid_#eef1f5]">
                    <span className="w-[42px] h-[42px] bg-navy text-white flex items-center justify-center font-heading font-bold text-[length:.9rem]" aria-hidden="true">{t.initials || initialsOf(t.author)}</span>
                    <span>
                      <span className="block font-heading font-bold text-[length:.98rem] text-navy">{t.author}</span>
                      {t.dateLabel && <span className="block text-[length:.8rem] text-[color:#94a3b8]">{t.dateLabel}</span>}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
