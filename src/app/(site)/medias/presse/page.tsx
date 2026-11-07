import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/site/shared/PageHero';
import PressGrid from '@/components/site/press/PressGrid';
import { Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getPageContent, getPressArticles } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { pageMetadata } from '@/lib/site/seo';
import { breadcrumb } from '@/lib/site/jsonld';
import { formatDate } from '@/lib/site/format';
import { toParagraphs } from '@/lib/site/text';
import { urls } from '@/lib/site/urls';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('presse');
}

export default async function PressPage() {
  const [{ c }, press, settings] = await Promise.all([getPageContent('presse'), getPressArticles(), getSettings()]);
  const { company } = settings;
  return (
    <main>
      <JsonLd graph={[breadcrumb([{ name: 'Médias', path: urls.medias() }, { name: 'Presse', path: urls.press() }], company.website)]} />
      <PageHero eyebrow={c.t('hero.eyebrow')} title={c.t('hero.title')} text={c.t('hero.text')} image={c.t('hero.image')} imageAlt="Équipe ASPEO" crumbs={[{ name: 'Médias', href: urls.medias() }, { name: 'Presse' }]} />

      <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-[clamp(32px,5vw,72px)] items-start" data-r2="">
          <div>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('about.title')}</h2>
            {toParagraphs(c.t('about.text')).map((p, i, arr) => <p key={i} className={`text-[length:1.04rem] leading-[1.8] text-[color:#42505f] ${i < arr.length - 1 ? 'm-[0_0_16px]' : 'm-0'}`}>{p}</p>)}
          </div>
          <aside className="bg-[color:#EAF1FB] p-[clamp(24px,3vw,34px)]">
            <h2 className="font-heading font-bold text-[length:.78rem] tracking-[.14em] uppercase text-[color:var(--asp-accent-ink)] m-[0_0_14px]">Contact presse</h2>
            <p className="font-heading font-bold text-[length:1.15rem] text-navy m-[0_0_6px]">{c.t('contact.name')}</p>
            <p className="text-[length:.95rem] leading-[1.6] text-[color:#42505f] m-[0_0_18px]">{c.t('contact.text')}</p>
            <div className="flex flex-col gap-[10px]">
              <a className="text-navy font-bold no-underline text-[length:.98rem]" href={`mailto:${company.email}`}>{company.email}</a>
              <a className="text-navy font-bold no-underline text-[length:.98rem]" href={`tel:${company.phoneIntl}`}>{company.phone}</a>
            </div>
          </aside>
        </Container>
      </section>

      <section className="p-[0_0_clamp(56px,8vw,96px)] bg-white">
        <Container>
          <PressGrid title={c.t('list.title')} text={c.t('list.text')} items={press.map((p) => ({ href: urls.pressArticle(p.slug), title: p.title, media: p.media, type: p.type, date: p.dateLabel || formatDate(p.publishedAt), excerpt: p.excerpt, image: p.image }))} />
        </Container>
      </section>

      <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#EAF1FB]">
        <Container>
          <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{c.t('kit.title')}</h2>
          <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-[0_0_26px] max-w-[640px]">{c.t('kit.text')}</p>
          <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[1px] bg-[color:#c9d6ea] [border:1px_solid_#c9d6ea]">
            {c.list('kit.items').map((k) => (
              <li key={k.title} className="bg-white p-[24px_22px] flex flex-col gap-[10px]">
                <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-0">{k.title}</h3>
                <p className="text-[length:.93rem] leading-[1.6] text-[color:#42505f] m-0 flex-1">{k.text}</p>
                {k.file
                  ? <a href={k.file} download className="self-start p-[8px_0] text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.88rem] no-underline">{(k.cta || 'Télécharger').replace(/^Demander/, 'Télécharger')} →</a>
                  : <Link href={`/contact?objet=presse#devis`} className="self-start p-[8px_0] text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.88rem] no-underline">{k.cta || 'Nous contacter'} →</Link>}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
