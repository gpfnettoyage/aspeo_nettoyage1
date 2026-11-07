import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/site/shared/PageHero';
import { Container } from '@/components/site/ui/primitives';
import { Multiline } from '@/components/site/ui/Multiline';
import JsonLd from '@/components/site/JsonLd';
import { getCities, getPageContent } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { absoluteUrl, urls } from '@/lib/site/urls';
import { firstSentence } from '@/lib/site/text';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('zones-intervention');
}

export default async function ZonesPage() {
  const [{ c }, cities, settings] = await Promise.all([getPageContent('zones-intervention'), getCities(), getSettings()]);
  // Seules les fiches rédigées sont listées (une ville sans texte reste un brouillon à compléter).
  const listed = cities.filter((v) => v.intro);
  const intros = new Map(c.list('sectors').map((s) => [s.name, s.intro]));
  const groups: { sector: string; items: typeof listed }[] = [];
  for (const v of listed) {
    const key = v.sector || 'Autres communes';
    const g = groups.find((x) => x.sector === key);
    if (g) g.items.push(v); else groups.push({ sector: key, items: [v] });
  }

  return (
    <main>
      <JsonLd graph={[
        breadcrumb([{ name: "Zones d'intervention", path: urls.zones() }], settings.company.website),
        { '@type': 'ItemList', name: "Communes d'intervention ASPEO", itemListElement: listed.map((v, i) => ({ '@type': 'ListItem', position: i + 1, name: v.name, url: absoluteUrl(urls.city(v.slug), settings.company.website) })) },
      ]} />
      <PageHero eyebrow={c.t('hero.eyebrow')} title={<Multiline text={c.t('hero.title')} />} text={c.t('hero.text')} image={c.t('hero.image')} imageAlt="Équipe ASPEO en intervention" />

      <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
        <Container className="flex flex-col gap-[clamp(48px,7vw,80px)]">
          {groups.map((grp) => (
            <div key={grp.sector}>
              <div className="flex flex-wrap items-end justify-between gap-[10px_24px] mb-[24px] pb-[18px] [border-bottom:1px_solid_#dbe5f4]">
                <div className="max-w-[680px]">
                  <div className="flex items-center gap-[14px] mb-[10px]">
                    <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
                    <h2 className="font-heading font-extrabold text-[length:clamp(1.45rem,2.6vw,2rem)] leading-[1.15] m-0 text-navy">{grp.sector}</h2>
                    <span className="text-[length:.84rem] font-bold text-[color:#5b6878] whitespace-nowrap">{grp.items.length} commune{grp.items.length > 1 ? 's' : ''}</span>
                  </div>
                  {intros.get(grp.sector) && <p className="text-[length:.98rem] leading-[1.65] text-[color:#42505f] m-[0_0_0_18px]">{intros.get(grp.sector)}</p>}
                </div>
              </div>
              <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] [grid-auto-rows:minmax(260px,auto)] gap-[16px]">
                {grp.items.map((v) => (
                  <li key={v.slug} className="h-full">
                    <Link href={urls.city(v.slug)} className="group text-left relative min-h-[260px] h-full w-full p-0 overflow-hidden bg-navy block no-underline">
                      {v.image && <Image src={v.image} alt={v.imageAlt || `Nettoyage professionnel à ${v.name}`} fill sizes="(max-width: 600px) 100vw, 25vw" className="object-cover [transition:transform_.6s_ease] group-hover:[transform:scale(1.05)]" />}
                      <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(6,34,109,.15)_0%,rgba(6,34,109,.55)_55%,rgba(6,34,109,.94)_100%)] pointer-events-none" aria-hidden="true" />
                      <span className="absolute top-0 left-0 w-[14px] h-[14px] bg-[color:var(--asp-accent)]" aria-hidden="true" />
                      {v.distance && <span className="absolute top-[16px] right-[16px] bg-white text-navy font-heading font-bold text-[length:.74rem] tracking-[.04em] p-[5px_9px]">{v.distance}</span>}
                      <div className="absolute left-0 right-0 bottom-0 p-[22px_22px_24px]">
                        <h3 className="font-heading font-extrabold text-[length:1.2rem] leading-[1.2] text-white m-[0_0_8px]">{v.name}</h3>
                        <p className="text-[length:.86rem] leading-[1.5] text-[color:rgba(255,255,255,.88)] m-[0_0_14px] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">{firstSentence(v.intro)}</p>
                        <span className="inline-flex items-center gap-[8px] font-heading font-bold text-[length:.8rem] tracking-[.06em] uppercase text-white">Voir la commune <span className="text-[color:var(--asp-accent)]" aria-hidden="true">→</span></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-[16px_28px] bg-[color:#EAF1FB] p-[clamp(22px,3vw,32px)]">
            <div className="max-w-[640px]">
              <h2 className="font-heading font-extrabold text-[length:1.3rem] text-navy m-[0_0_6px]">{c.t('other.title')}</h2>
              <p className="text-[length:.98rem] leading-[1.6] text-[color:#42505f] m-0">{c.t('other.text')}</p>
            </div>
            <Link href="/contact" className="bg-[color:var(--asp-accent)] text-white p-[15px_26px] min-h-[48px] font-heading font-bold text-[length:.95rem] no-underline inline-flex items-center">Demander un devis →</Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
