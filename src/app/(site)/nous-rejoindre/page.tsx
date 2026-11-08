import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/site/shared/PageHero';
import JobsBoard from '@/components/site/careers/JobsBoard';
import ApplicationForm from '@/components/site/careers/ApplicationForm';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getJobs, getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { toParagraphs } from '@/lib/site/text';
import { absoluteUrl, urls } from '@/lib/site/urls';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('nous-rejoindre');
}

export default async function CareersPage() {
  const [{ c }, jobs, settings] = await Promise.all([getPageContent('nous-rejoindre'), getJobs(), getSettings()]);
  const { company } = settings;
  // Offres publiées : données structurées JobPosting (Google for Jobs)
  const postings = jobs.map((j) => ({
    '@type': 'JobPosting',
    title: j.title,
    description: [j.summary, j.missions, j.profile, j.conditions].filter(Boolean).join('\n\n'),
    datePosted: (j.publishedAt ?? j.createdAt).toISOString().slice(0, 10),
    employmentType: /cdi/i.test(j.contractType ?? '') ? 'FULL_TIME' : /cdd/i.test(j.contractType ?? '') ? 'TEMPORARY' : undefined,
    hiringOrganization: { '@type': 'Organization', name: company.name, sameAs: company.website },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: j.city ?? company.city, addressCountry: 'FR' } },
    url: absoluteUrl(`${urls.careers()}#${j.slug}`, company.website),
  }));

  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Nous rejoindre', path: urls.careers() }], company.website), ...postings]} />
      <PageHero
        eyebrow={c.t('hero.eyebrow')}
        title={c.t('hero.title')}
        titleClassName="font-heading font-extrabold text-[length:clamp(2.6rem,5.2vw,4.8rem)] leading-[1.02] tracking-[-.02em] m-[16px_0_0] max-w-[860px]"
        text={c.t('hero.text')}
        image={c.t('hero.image')}
        imageAlt="Les équipes ASPEO"
        actions={<ButtonLink href="#offres" arrow={false} className="p-[16px_28px] text-[length:.98rem]">Voir nos offres d&apos;emploi →</ButtonLink>}
      />

      <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[clamp(32px,5vw,72px)] items-center" data-r2="">
          <div>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('work.title')}</h2>
            {toParagraphs(c.t('work.text')).map((p, i, a) => <p key={i} className={`text-[length:1.04rem] leading-[1.8] text-[color:#42505f] ${i < a.length - 1 ? 'm-[0_0_16px]' : 'm-0'}`}>{p}</p>)}
          </div>
          <div className="relative aspect-[4/3] bg-[color:#dfe7f2] overflow-hidden"><Image src={c.t('work.image')} alt="Agents ASPEO en intervention" fill sizes="(max-width: 1040px) 100vw, 50vw" className="object-cover" /></div>
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#EAF1FB]">
        <Container>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('offer.title')}</h2>
          <ul className="list-none p-0 m-[24px_0_0] grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[1px] bg-[color:#c9d6ea] [border:1px_solid_#c9d6ea]">
            {c.list('offer.items').map((o) => (
              <li key={o.title} className="bg-white p-[24px_22px]">
                <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_6px]">{o.title}</h3>
                <p className="text-[length:.94rem] leading-[1.6] text-[color:#42505f] m-0">{o.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,96px)_0] bg-white scroll-mt-[140px]" id="offres">
        <div className="max-w-[960px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
          <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('jobs.title')}</h2>
          <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-[0_0_24px]">{c.t('jobs.text')}</p>
          <JobsBoard email={company.email} jobs={jobs.map((j) => ({ id: j.id, slug: j.slug, title: j.title, contractType: j.contractType, location: j.location, hours: j.hours, summary: j.summary, missions: j.missions, profile: j.profile, conditions: j.conditions }))} />
          <div className="mt-[48px] bg-[color:#f8fafc] [border:1px_solid_#eef2f7] p-[clamp(22px,3vw,32px)]" id="candidature-spontanee">
            <h2 className="font-heading font-extrabold text-[length:1.3rem] text-navy m-[0_0_8px]">{c.t('spontaneous.title')}</h2>
            <p className="text-[length:.98rem] leading-[1.6] text-[color:#42505f] m-[0_0_20px]">{c.t('spontaneous.text')}</p>
            <ApplicationForm />
          </div>
        </div>
      </section>
    </main>
  );
}
