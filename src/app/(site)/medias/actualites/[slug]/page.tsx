import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/site/shared/Breadcrumbs';
import Disclosure from '@/components/site/ui/Disclosure';
import Markdown from '@/components/site/ui/Markdown';
import { Container } from '@/components/site/ui/primitives';
import { FacebookIcon, LinkedinIcon } from '@/components/site/ui/icons';
import JsonLd from '@/components/site/JsonLd';
import { getArticle, getArticles, getCatalog } from '@/lib/site/content';
import { getSettings } from '@/lib/site/settings';
import { buildMetadata } from '@/lib/site/seo';
import { articleSchema, breadcrumb, faqPage } from '@/lib/site/jsonld';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { normalize } from '@/lib/site/search';
import { formatDate, formatDateLong } from '@/lib/site/format';
import { absoluteUrl, urls } from '@/lib/site/urls';

type Props = { params: Promise<{ slug: string }> };
type Faq = { question: string; answer: string };

export async function generateStaticParams() {
  try { return (await getArticles()).map((a) => ({ slug: a.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: 'Page introuvable | ASPEO', robots: { index: false } };
  return buildMetadata({ title: a.seoTitle || `${a.title} | Blog ASPEO`, description: a.seoDesc || a.excerpt || '', path: urls.article(slug), image: a.image, type: 'article', publishedTime: a.publishedAt?.toISOString() });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return redirectOrNotFound(urls.article(slug));
  const [articles, catalog, settings] = await Promise.all([getArticles(), getCatalog(), getSettings()]);
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const faq = (Array.isArray(a.faq) ? (a.faq as Faq[]) : []).filter((f) => f?.question && f?.answer);
  // Services liés : prestations dont le titre partage des mots significatifs avec l'article
  const hay = normalize(`${a.title} ${a.excerpt ?? ''} ${a.tags.join(' ')} ${a.body.slice(0, 4000)}`);
  const linked = catalog.services
    .map((s) => ({ s, n: normalize(s.title).split(/[^a-z0-9]+/).filter((w) => w.length > 4 && !['nettoyage', 'traitement'].includes(w) && hay.includes(w)).length }))
    .filter((x) => x.n > 0).sort((x, y) => y.n - x.n).slice(0, 3).map((x) => x.s);
  const url = absoluteUrl(urls.article(a.slug), settings.company.website);

  return (
    <main>
      <JsonLd graph={[
        articleSchema(settings, { title: a.title, description: a.excerpt ?? '', path: urls.article(a.slug), image: a.image, publishedAt: a.publishedAt, updatedAt: a.updatedAt }),
        breadcrumb([{ name: 'Médias', path: urls.medias() }, { name: a.title, path: urls.article(a.slug) }], settings.company.website),
        ...(faq.length ? [faqPage(faq)] : []),
      ]} />
      <section className="relative overflow-hidden text-white min-h-[clamp(420px,52vh,540px)] flex flex-col" data-dark="">
        <div className="absolute inset-0 bg-navy" aria-hidden="true" />
        {a.image && <Image src={a.image} alt={a.imageAlt || a.title} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 [background:linear-gradient(100deg,rgba(6,34,109,.88)_0%,rgba(6,34,109,.7)_50%,rgba(6,34,109,.45)_100%)]" aria-hidden="true" />
        <div className="relative flex-1 flex items-center w-full">
          <div className="max-w-[1280px] m-[0_auto] p-[clamp(160px,20vh,190px)_clamp(20px,5vw,40px)_clamp(48px,8vh,72px)] w-full">
            <h1 className="font-heading font-extrabold text-[length:clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-.02em] m-0 max-w-[700px] [text-shadow:0_2px_30px_rgba(0,0,0,.3)]">{a.title}</h1>
            {(a.category || a.publishedAt) && <p className="m-[16px_0_0] text-[length:.92rem] text-[color:rgba(255,255,255,.8)]">{[a.category, a.publishedAt ? `Publié le ${formatDateLong(a.publishedAt)}` : null].filter(Boolean).join(' · ')}</p>}
          </div>
        </div>
      </section>
      <Container className="pt-[14px]">
        <Breadcrumbs items={[{ name: 'Actualités', href: urls.medias() }, { name: a.title }]} />
      </Container>

      <section className="p-[clamp(48px,7vw,80px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)]">
          <article className="max-w-[900px]">
            <Markdown>{a.body}</Markdown>
          </article>

          {faq.length > 0 && (
            <div className="max-w-[900px] m-[12px_0_28px]">
              <h2 className="font-heading font-extrabold text-[length:clamp(1.35rem,2.3vw,1.75rem)] tracking-[-.015em] text-navy m-[0_0_18px]">Questions fréquentes</h2>
              <Disclosure items={faq.map((f) => ({ title: f.question, content: <p className="m-0">{f.answer}</p> }))} />
            </div>
          )}

          {linked.length > 0 && (
            <div className="m-[8px_0_0] bg-[color:#f8fafc] [border:1px_solid_#eef2f7] [border-left:3px_solid_var(--asp-accent)] p-[20px_22px]">
              <h2 className="font-heading font-bold text-[length:.82rem] tracking-[.1em] uppercase text-navy m-[0_0_10px]">Nos services liés</h2>
              <div className="flex flex-wrap gap-[10px]">
                {linked.map((s) => <Link key={s.href} href={s.href} className="bg-white [border:1px_solid_#dce3ec] text-navy p-[11px_16px] font-heading font-semibold text-[length:.88rem] text-left no-underline hover:[border-color:var(--asp-accent-ink)] hover:text-[color:var(--asp-accent-ink)]">{s.title} →</Link>)}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-[14px] m-[20px_0_0] [border-top:1px_solid_#eef2f7] pt-[24px]">
            <span className="font-heading font-bold text-[length:.88rem] tracking-[.08em] uppercase text-navy">Partager</span>
            <a className="inline-flex items-center justify-center w-[46px] h-[46px] bg-navy text-white no-underline [transition:background_.2s] hover:bg-[color:var(--asp-accent)]" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook"><FacebookIcon size={19} /></a>
            <a className="inline-flex items-center justify-center w-[46px] h-[46px] bg-navy text-white no-underline [transition:background_.2s] hover:bg-[color:var(--asp-accent)]" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur LinkedIn"><LinkedinIcon /></a>
            <Link href={urls.medias()} className="ml-auto inline-flex items-center gap-[10px] [border:1px_solid_#d7dee8] text-navy p-[14px_24px] font-heading font-bold text-[length:.92rem] no-underline hover:[border-color:var(--asp-accent-ink)] hover:text-[color:var(--asp-accent-ink)]">← Tous les médias</Link>
          </div>
        </Container>

        {related.length > 0 && (
          <Container className="m-[clamp(48px,7vw,72px)_auto_0]">
            <h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.4vw,1.9rem)] tracking-[-.015em] m-[0_0_24px] text-navy">À lire également</h2>
            <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[20px]">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="h-full text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] overflow-hidden flex flex-col no-underline [transition:transform_.2s_ease,box-shadow_.2s_ease] hover:[transform:translateY(-5px)] hover:shadow-[0_22px_46px_-22px_rgba(6,34,109,.3)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-navy">{r.image && <Image src={r.image} alt="" fill sizes="400px" className="object-cover" />}</div>
                    <div className="p-[20px] flex flex-col gap-[8px]">
                      <div className="flex items-center gap-[10px]">
                        {r.category && <span className="text-[length:.72rem] font-bold tracking-[.06em] uppercase text-navy">{r.category}</span>}
                        <span className="text-[length:.78rem] text-[color:#94a3b8]">{formatDate(r.publishedAt)}</span>
                      </div>
                      <h3 className="font-heading font-bold text-[length:1.05rem] leading-[1.25] text-navy m-0">{r.title}</h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        )}
      </section>
    </main>
  );
}
