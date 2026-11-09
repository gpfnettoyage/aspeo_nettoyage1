import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/site/shared/Breadcrumbs';
import Disclosure from '@/components/site/ui/Disclosure';
import { ButtonLink, Container, Stars } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getArticles, getCatalog, getCities, getCity, getPageContent, getTestimonials } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { buildMetadata } from '@/lib/site/seo';
import { breadcrumb, faqPage, localBusiness } from '@/lib/site/jsonld';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { firstSentence, initialsOf } from '@/lib/site/text';
import { urls } from '@/lib/site/urls';

type Props = { params: Promise<{ slug: string }> };

const Bar = () => <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />;
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="font-heading font-extrabold text-[length:clamp(1.35rem,2.4vw,1.85rem)] tracking-[-.015em] text-navy m-0">{children}</h2>;
type Faq = { question: string; answer: string };
const cityFaq = (v: { faq: unknown }): Faq[] => (Array.isArray(v.faq) ? (v.faq as Faq[]).filter((f) => f?.question && f?.answer) : []);

export async function generateStaticParams() {
  try { return (await getCities()).filter((c) => c.intro).map((c) => ({ slug: c.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await getCity(slug);
  if (!v) return { title: 'Page introuvable | ASPEO', robots: { index: false } };
  return buildMetadata({
    title: v.seoTitle || `Nettoyage Professionnel à ${v.name} | ASPEO`,
    description: v.seoDesc || `ASPEO intervient à ${v.name}${v.sector ? ` (${v.sector})` : ''} pour le nettoyage professionnel, l'insalubrité et la remise en état. ${v.distance ? `${v.distance}. ` : ''}Devis gratuit sous 24h après la visite.`,
    path: urls.city(slug),
    image: v.image,
  });
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const v = await getCity(slug);
  if (!v || !v.intro) return redirectOrNotFound(urls.city(slug));

  const [cities, catalog, testimonials, articles, settings, { c }] = await Promise.all([getCities(), getCatalog(), getTestimonials(), getArticles(), getSettings(), getPageContent('zones-intervention')]);
  const neighbours = cities.filter((x) => x.slug !== v.slug && x.intro && x.sector === v.sector).slice(0, 3);
  const local = testimonials.filter((t) => t.context?.includes(v.name));
  const shown = (local.length ? local : testimonials.filter((_, i) => i % 3 === v.slug.length % 3)).slice(0, 2);
  const faq = cityFaq(v);
  const insalubre = catalog.services.find((s) => s.slug === 'nettoyage-de-logements-insalubres');
  const base = settings.company.website;

  return (
    <main>
      <JsonLd graph={[
        localBusiness(settings, { '@id': `${base}${urls.city(v.slug)}#local`, name: `${settings.company.name} — ${v.name}`, areaServed: { '@type': 'City', name: v.name } }),
        breadcrumb([{ name: "Zones d'intervention", path: urls.zones() }, { name: v.name, path: urls.city(v.slug) }], base),
        ...(faq.length ? [faqPage(faq)] : []),
      ]} />
      <section className="relative overflow-hidden text-white min-h-[clamp(420px,52vh,540px)] flex flex-col" data-dark="">
        <div className="absolute inset-0 bg-navy" aria-hidden="true" />
        {v.image && <Image src={v.image} alt={v.imageAlt || `Nettoyage professionnel à ${v.name}`} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 [background:linear-gradient(100deg,rgba(6,34,109,.88)_0%,rgba(6,34,109,.7)_50%,rgba(6,34,109,.45)_100%)]" aria-hidden="true" />
        <div className="relative flex-1 flex items-center w-full">
          <div className="max-w-[1280px] m-[0_auto] p-[clamp(160px,20vh,190px)_clamp(20px,5vw,40px)_clamp(48px,8vh,72px)] w-full">
            <Breadcrumbs light className="m-[0_0_16px] [&_ol]:text-[length:.82rem] [&_ol]:text-[color:rgba(255,255,255,.65)]" items={[{ name: "Zones d'intervention", href: urls.zones() }, { name: v.name }]} />
            <h1 className="font-heading font-extrabold text-[length:clamp(2.6rem,5.2vw,4.8rem)] leading-[1.02] tracking-[-.02em] m-0 max-w-[820px]">Nettoyage professionnel à {v.name}</h1>
            <p className="m-[18px_0_0] text-[length:clamp(1.02rem,1.4vw,1.18rem)] leading-[1.6] text-[color:rgba(255,255,255,.92)] max-w-[680px]">{firstSentence(v.intro)}</p>
            {v.distance && <p className="m-[10px_0_0] text-[length:.92rem] text-[color:rgba(255,255,255,.75)]">{v.distance} · équipe basée à Panissières</p>}
            <div className="flex flex-wrap gap-[14px] m-[28px_0_0]"><ButtonLink href="/contact" className="p-[16px_28px] text-[length:.98rem]">Demander un devis</ButtonLink></div>
          </div>
        </div>
      </section>

      {v.caseText && (
        <section className="p-[clamp(48px,7vw,80px)_0] bg-[color:#EAF1FB]">
          <Container className="grid grid-cols-[minmax(0,1fr)]">
            <div className="flex items-center gap-[14px] mb-[14px]"><Bar /><H2>Exemple d&apos;intervention à {v.name}</H2></div>
            <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-0">{v.caseText}</p>
          </Container>
        </section>
      )}

      <section className="p-[clamp(48px,7vw,80px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          {[v.intro, v.sectorText, v.whyText, v.practicalText].filter(Boolean).map((p, i, arr) => (
            <p key={i} className={`text-[length:1.05rem] leading-[1.85] text-[color:#42505f] ${i < arr.length - 1 ? 'm-[0_0_20px]' : 'm-0'}`}>{p}</p>
          ))}
        </Container>
      </section>

      {v.insalubreText && (
        <section className="p-[clamp(48px,7vw,80px)_0] bg-[color:#f8fafc]">
          <Container className="grid grid-cols-[minmax(0,1fr)]">
            <div className="flex items-center gap-[14px] mb-[14px]"><Bar /><H2>Une autre situation fréquente à {v.name} : logements insalubres &amp; Diogène</H2></div>
            <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-[0_0_18px]">{v.insalubreText}</p>
            {insalubre && <Link href={insalubre.href} className="inline-flex items-center gap-[8px] text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.94rem] no-underline">Voir le nettoyage de logements insalubres <span aria-hidden="true">→</span></Link>}
          </Container>
        </section>
      )}

      <section className="p-[clamp(56px,8vw,88px)_0] bg-navy" data-dark="">
        <Container>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.4vw,1.9rem)] tracking-[-.015em] text-white m-[0_0_8px]" data-light="">Tous nos services à {v.name}</h2>
          <p className="text-[length:.98rem] text-[color:rgba(255,255,255,.65)] m-[0_0_36px] max-w-[600px]">{c.t('city.servicesText')}</p>
          <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[2px]">
            {catalog.categories.flatMap((cat) => cat.services).map((sv) => (
              <li key={sv.href}>
                <Link href={sv.href} className="text-left [border-top:1px_solid_rgba(255,255,255,.12)] text-[color:rgba(255,255,255,.85)] p-[14px_16px_14px_0] font-heading font-semibold text-[length:.92rem] flex items-center justify-between gap-[10px] no-underline hover:text-[color:var(--asp-accent-ink)]">{sv.title}<span aria-hidden="true">→</span></Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {shown.length > 0 && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
          <Container>
            <div className="flex items-center gap-[14px] mb-[8px]"><Bar /><H2>Ce qu&apos;en disent nos clients</H2></div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[20px] mt-[24px]">
              {shown.map((t) => (
                <figure key={t.id} className="m-0 bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[26px_24px] flex flex-col gap-[14px] relative">
                  <span className="absolute top-[14px] right-[20px] [font-family:Georgia,serif] text-[length:2.6rem] text-[color:var(--asp-accent-ink)] opacity-[.14] leading-none" aria-hidden="true">”</span>
                  <Stars className="text-[length:.95rem]" />
                  <blockquote className="text-[length:.96rem] leading-[1.65] text-[color:#334155] m-0">“{t.quote}”</blockquote>
                  <figcaption className="flex items-center gap-[12px] pt-[12px] [border-top:1px_solid_#eef1f5]">
                    <span className="w-[42px] h-[42px] flex-none bg-navy text-white flex items-center justify-center font-heading font-bold text-[length:.9rem]" aria-hidden="true">{t.initials || initialsOf(t.author)}</span>
                    <span><span className="block font-heading font-bold text-[length:.96rem] text-navy">{t.author}</span>{t.context && <span className="block text-[length:.8rem] text-[color:#94a3b8]">{t.context}</span>}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {neighbours.length > 0 && (
        <section className="p-[clamp(48px,7vw,80px)_0] bg-[color:#f8fafc]">
          <Container>
            <div className="flex items-center gap-[14px] mb-[8px]"><Bar /><H2>Communes voisines</H2></div>
            <p className="text-[length:.98rem] text-[color:#4a5568] m-[14px_0_0_18px] max-w-[600px]">Nous intervenons aussi dans les communes proches de {v.name}.</p>
            <ul className="list-none p-0 m-[20px_0_0] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[16px]">
              {neighbours.map((n) => (
                <li key={n.slug}>
                  <Link href={urls.city(n.slug)} className="text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[20px_22px] flex flex-col gap-[4px] no-underline [transition:box-shadow_.2s] hover:shadow-[var(--shadow-card)]">
                    <h3 className="font-heading font-bold text-[length:.98rem] text-navy m-0">{n.name}</h3>
                    {n.distance && <span className="text-[length:.82rem] text-[color:#8a97a8]">{n.distance}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {faq.length > 0 && (
        <section className="p-[clamp(48px,7vw,80px)_0] bg-white">
          <Container className="grid grid-cols-[minmax(0,1fr)]">
            <div className="flex items-center gap-[14px] mb-[24px]"><Bar /><H2>Questions fréquentes à {v.name}</H2></div>
            <Disclosure variant="list" items={faq.map((f) => ({ title: f.question, content: <p className="m-0">{f.answer}</p> }))} />
          </Container>
        </section>
      )}

      {articles.length > 0 && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
          <Container>
            <div className="flex flex-wrap gap-[20px] items-center justify-between mb-[32px]">
              <div className="flex items-center gap-[14px]"><Bar /><H2>Nos dernières actualités</H2></div>
              <Link href={urls.medias()} className="font-heading font-bold text-[length:.9rem] text-[color:var(--asp-accent-ink)] inline-flex items-center gap-[8px] no-underline">Toutes les actualités <span aria-hidden="true">→</span></Link>
            </div>
            <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[20px]">
              {articles.slice(0, 2).map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="h-full text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] overflow-hidden flex flex-col no-underline">
                    <div className="relative w-full h-[170px] bg-[color:#dfe7f2]">{a.image && <Image src={a.image} alt="" fill sizes="400px" className="object-cover" />}</div>
                    <div className="p-[20px_22px] flex flex-col gap-[8px]">
                      <span className="font-heading font-bold text-[length:.72rem] tracking-[.06em] uppercase text-navy">{a.category}</span>
                      <h3 className="font-heading font-bold text-[length:1.02rem] leading-[1.4] text-navy m-0">{a.title}</h3>
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
