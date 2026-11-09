import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/site/shared/Breadcrumbs';
import Markdown from '@/components/site/ui/Markdown';
import { Container } from '@/components/site/ui/primitives';
import JsonLd from '@/components/site/JsonLd';
import { getPressArticle, getPressArticles } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { buildMetadata } from '@/lib/site/seo';
import { articleSchema, breadcrumb } from '@/lib/site/jsonld';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { formatDate } from '@/lib/site/format';
import { urls } from '@/lib/site/urls';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try { return (await getPressArticles()).map((p) => ({ slug: p.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPressArticle(slug);
  if (!p) return { title: 'Page introuvable | ASPEO', robots: { index: false } };
  return buildMetadata({ title: p.seoTitle || `${p.title}${p.media ? ` | ${p.media}` : ''} | ASPEO`, description: p.seoDesc || p.excerpt || '', path: urls.pressArticle(slug), image: p.image, type: 'article' });
}

export default async function PressArticlePage({ params }: Props) {
  const { slug } = await params;
  const p = await getPressArticle(slug);
  if (!p) return redirectOrNotFound(urls.pressArticle(slug));
  const [all, settings] = await Promise.all([getPressArticles(), getSettings()]);
  const others = all.filter((x) => x.slug !== p.slug).slice(0, 3);
  const date = p.dateLabel || formatDate(p.publishedAt);

  return (
    <main>
      <JsonLd graph={[
        articleSchema(settings, { title: p.title, description: p.excerpt ?? '', path: urls.pressArticle(p.slug), image: p.image, publishedAt: p.publishedAt, updatedAt: p.updatedAt }),
        breadcrumb([{ name: 'Médias', path: urls.medias() }, { name: 'Presse', path: urls.press() }, { name: p.title, path: urls.pressArticle(p.slug) }], settings.company.website),
      ]} />
      <section className="relative overflow-hidden text-white min-h-[clamp(420px,52vh,540px)] flex flex-col" data-dark="">
        <div className="absolute inset-0 bg-navy" aria-hidden="true" />
        {p.image && <Image src={p.image} alt={p.imageAlt || p.title} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 [background:linear-gradient(100deg,rgba(6,34,109,.9)_0%,rgba(6,34,109,.72)_50%,rgba(6,34,109,.45)_100%)]" aria-hidden="true" />
        <div className="relative flex-1 flex items-center w-full">
          <div className="max-w-[1280px] m-[0_auto] p-[clamp(160px,20vh,190px)_clamp(20px,5vw,40px)_clamp(48px,8vh,72px)] w-full">
            <Breadcrumbs light items={[{ name: 'Médias', href: urls.medias() }, { name: 'Presse', href: urls.press() }, { name: p.title }]} />
            <div className="inline-flex items-center gap-[12px]">
              <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
              <span className="font-heading font-bold text-[length:.82rem] tracking-[.16em] uppercase">{[p.media, p.type].filter(Boolean).join(' · ')}</span>
            </div>
            <h1 className="font-heading font-extrabold text-[length:clamp(2rem,4.2vw,3.4rem)] leading-[1.08] tracking-[-.02em] m-[16px_0_0] max-w-[860px]">{p.title}</h1>
            {date && <p className="m-[16px_0_0] text-[length:.95rem] text-[color:rgba(255,255,255,.85)]">Publié le {date}</p>}
          </div>
        </div>
      </section>

      <section className="p-[clamp(48px,7vw,88px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          <div className="max-w-[900px]">
            {p.excerpt && <p className="font-heading font-semibold text-[length:clamp(1.15rem,1.8vw,1.35rem)] leading-[1.6] text-navy m-[0_0_28px]">{p.excerpt}</p>}
            {p.body && <Markdown>{p.body}</Markdown>}
            {p.media && (
              <div className="mt-[32px] p-[20px_22px] bg-[color:#EAF1FB] text-[length:.92rem] leading-[1.6] text-[color:#42505f]">
                Source : <strong className="text-navy">{p.media}</strong>{date ? `, ${date}` : ''}.
                {p.externalUrl && <> <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[color:var(--asp-accent-ink)] font-bold">Lire la parution originale</a></>}
                {p.fileUrl && <> <a href={p.fileUrl} download className="text-[color:var(--asp-accent-ink)] font-bold">Télécharger le document</a></>}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-[12px] mt-[28px]">
            <Link href={urls.press()} className="[border:1.5px_solid_#06226D] text-navy p-[14px_22px] font-heading font-bold text-[length:.92rem] no-underline">← Retour à l&apos;espace presse</Link>
            <Link href="/contact?objet=presse#devis" className="bg-[color:var(--asp-accent)] text-white p-[14px_22px] font-heading font-bold text-[length:.92rem] no-underline">Contact presse →</Link>
          </div>
        </Container>
      </section>

      {others.length > 0 && (
        <section className="p-[clamp(48px,7vw,88px)_0] bg-[color:#EAF1FB]">
          <Container>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.6vw,2rem)] tracking-[-.015em] m-[0_0_24px] text-navy">Autres parutions</h2>
            <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[20px]">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={urls.pressArticle(o.slug)} className="h-full text-left bg-white p-0 flex flex-col no-underline">
                    <div className="relative aspect-[16/9] bg-[color:#dfe7f2]">{o.image && <Image src={o.image} alt="" fill sizes="400px" className="object-cover" />}</div>
                    <div className="p-[18px_20px_22px]">
                      <div className="text-[length:.78rem] tracking-[.08em] uppercase text-[color:var(--asp-accent-ink)] font-bold">{[o.media, o.dateLabel || formatDate(o.publishedAt)].filter(Boolean).join(' · ')}</div>
                      <h3 className="font-heading font-bold text-[length:1.05rem] text-navy leading-[1.35] m-[8px_0_0]">{o.title}</h3>
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
