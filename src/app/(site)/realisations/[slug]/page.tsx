import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/site/shared/Breadcrumbs';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getCatalog, getPageContent, getRealisation, getRealisations } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { buildMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { urls } from '@/lib/site/urls';
import type { Fact } from '@/lib/site/types';

type Props = { params: Promise<{ slug: string }> };
type Gallery = { before?: string; during?: string; after?: string };

export async function generateStaticParams() {
  try { return (await getRealisations()).map((r) => ({ slug: r.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRealisation(slug);
  if (!r) return { title: 'Page introuvable | ASPEO', robots: { index: false } };
  return buildMetadata({ title: r.seoTitle || `${r.title}${r.city ? ` — ${r.city}` : ''} | ASPEO`, description: r.seoDesc || (r.context ?? '').slice(0, 155), path: urls.realisation(slug), image: r.image });
}

const Block = ({ title, text }: { title: string; text: string | null }) => text ? (
  <div>
    <div className="flex items-center gap-[14px] mb-[14px]">
      <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
      <h2 className="font-heading font-extrabold text-[length:clamp(1.25rem,2.2vw,1.6rem)] text-navy m-0">{title}</h2>
    </div>
    <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-0">{text}</p>
  </div>
) : null;

export default async function RealisationPage({ params }: Props) {
  const { slug } = await params;
  const r = await getRealisation(slug);
  if (!r) return redirectOrNotFound(urls.realisation(slug));
  const [all, catalog, { c }, settings] = await Promise.all([getRealisations(), getCatalog(), getPageContent('realisations'), getSettings()]);
  const facts = (Array.isArray(r.facts) ? r.facts : []) as unknown as Fact[];
  const gallery = (r.gallery && typeof r.gallery === 'object' ? r.gallery : {}) as Gallery;
  const photos = ([['Avant', gallery.before], ['Pendant', gallery.during], ['Après', gallery.after]] as const).filter(([, src]) => !!src);
  const service = catalog.services.find((s) => s.slug === r.serviceSlug);
  const others = all.filter((x) => x.slug !== r.slug).slice(0, 3);

  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Nos réalisations', path: urls.realisations() }, { name: r.title, path: urls.realisation(r.slug) }], settings.company.website)]} />
      <section className="relative overflow-hidden text-white min-h-[clamp(420px,52vh,540px)] flex flex-col" data-dark="">
        <div className="absolute inset-0 bg-navy" aria-hidden="true" />
        {r.image && <Image src={r.image} alt={r.imageAlt || r.title} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 [background:linear-gradient(100deg,rgba(6,34,109,.88)_0%,rgba(6,34,109,.7)_50%,rgba(6,34,109,.45)_100%)]" aria-hidden="true" />
        <div className="relative flex-1 flex items-center w-full">
          <div className="max-w-[1280px] m-[0_auto] p-[clamp(160px,20vh,190px)_clamp(20px,5vw,40px)_clamp(48px,8vh,72px)] w-full">
            <Breadcrumbs light items={[{ name: 'Nos réalisations', href: urls.realisations() }, { name: r.city || r.title }]} />
            <div className="inline-flex items-center gap-[12px]">
              <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
              <span className="font-heading font-bold text-[length:.82rem] tracking-[.16em] uppercase">{[r.serviceLabel, r.city].filter(Boolean).join(' · ')}</span>
            </div>
            <h1 className="font-heading font-extrabold text-[length:clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-.02em] m-[16px_0_0] max-w-[820px]">{r.title}</h1>
            <p className="m-[16px_0_0] text-[length:clamp(1rem,1.4vw,1.15rem)] leading-[1.6] text-[color:rgba(255,255,255,.9)]">{[r.client, r.dateLabel].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
      </section>

      {facts.length > 0 && (
        <section className="bg-white p-[0_0_clamp(8px,2vw,16px)]">
          <Container>
            <dl className="m-[-36px_0_0] grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[1px] bg-[color:#eef2f7] [border:1px_solid_#eef2f7] relative shadow-[0_20px_44px_-24px_rgba(6,34,109,.35)]" data-sepgrid="">
              {facts.map((f) => (
                <div key={f.k} className="bg-white p-[20px_22px]">
                  <dt className="text-[length:.72rem] text-[color:#8a97a8] uppercase tracking-[.08em]">{f.k}</dt>
                  <dd className="m-0 font-heading font-extrabold text-[length:1.15rem] text-navy mt-[4px]">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      <section className="p-[clamp(48px,7vw,80px)_0] bg-white">
        <Container className="flex flex-wrap gap-[clamp(32px,5vw,64px)] items-start">
          <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-[40px]">
            <Block title="Le contexte" text={r.context} />
            <Block title="Les contraintes du site" text={r.constraints} />
            <Block title="Notre intervention" text={r.intervention} />
            {r.result && (
              <div className="bg-[color:#f5f7fa] p-[26px_28px]">
                <h2 className="font-heading font-extrabold text-[length:.76rem] tracking-[.1em] uppercase text-[color:var(--asp-accent-ink)] m-[0_0_10px]">Résultat</h2>
                <p className="font-heading font-semibold text-[length:1.08rem] leading-[1.6] text-navy m-0">{r.result}</p>
              </div>
            )}
          </div>
          <aside className="flex-[0_1_340px] min-w-[min(100%,280px)] flex flex-col gap-[16px] sticky top-[140px]">
            {r.serviceLabel && (
              <div className="[border:1px_solid_#eef2f7] p-[24px]">
                <div className="text-[length:.72rem] text-[color:#8a97a8] uppercase tracking-[.08em]">Prestation réalisée</div>
                <div className="font-heading font-extrabold text-[length:1.1rem] text-navy m-[6px_0_16px]">{r.serviceLabel}</div>
                <Link href={service ? service.href : urls.services()} className="text-navy font-heading font-bold text-[length:.9rem] inline-flex gap-[8px] no-underline">Découvrir la prestation <span className="text-[color:var(--asp-accent-ink)]" aria-hidden="true">→</span></Link>
              </div>
            )}
            <div className="bg-navy text-white p-[26px_24px]" data-dark="">
              <p className="font-heading font-extrabold text-[length:1.15rem] leading-[1.3] m-0">{c.t('detail.ctaTitle')}</p>
              <p className="text-[length:.92rem] leading-[1.6] text-[color:rgba(255,255,255,.8)] m-[10px_0_18px]">{c.t('detail.ctaText')}</p>
              <ButtonLink href={urls.contact(r.serviceSlug ?? undefined)} arrow={false} className="p-[14px_22px] text-[length:.92rem]">Demander un devis</ButtonLink>
            </div>
          </aside>
        </Container>
      </section>

      {photos.length > 0 && (
        <section className="p-[0_0_clamp(56px,8vw,96px)] bg-white">
          <Container>
            <div className="flex items-center gap-[14px] mb-[24px]">
              <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
              <h2 className="font-heading font-extrabold text-[length:clamp(1.25rem,2.2vw,1.6rem)] text-navy m-0">Le chantier en images</h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[16px]">
              {photos.map(([label, src]) => (
                <figure key={label} className="m-0">
                  <div className="relative aspect-[4/3] bg-[color:#f5f7fa] overflow-hidden"><Image src={src!} alt={`${r.title} — ${label.toLowerCase()}`} fill sizes="(max-width: 900px) 100vw, 33vw" className="object-cover" /></div>
                  <figcaption className="font-heading font-bold text-[length:.86rem] text-navy mt-[10px]">{label}</figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {others.length > 0 && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#f5f7fa]">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
              <div className="flex items-center gap-[14px]">
                <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
                <h2 className="font-heading font-extrabold text-[length:clamp(1.25rem,2.2vw,1.6rem)] text-navy m-0">Autres chantiers</h2>
              </div>
              <Link href={urls.realisations()} className="text-navy font-heading font-bold text-[length:.9rem] inline-flex gap-[8px] no-underline">Toutes nos réalisations <span className="text-[color:var(--asp-accent-ink)]" aria-hidden="true">→</span></Link>
            </div>
            <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[20px]">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={urls.realisation(o.slug)} className="h-full text-left bg-white flex flex-col no-underline hover:shadow-[0_22px_46px_-22px_rgba(6,34,109,.3)]">
                    <div className="relative aspect-[16/10] bg-navy">{o.image && <Image src={o.image} alt="" fill sizes="400px" className="object-cover" />}</div>
                    <div className="p-[18px_20px_20px] flex flex-col gap-[6px]">
                      {o.city && <span className="text-[length:.74rem] font-bold tracking-[.06em] uppercase text-navy">{o.city}</span>}
                      <span className="font-heading font-bold text-[length:1rem] leading-[1.3] text-navy">{o.title}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </main>
  );
}
