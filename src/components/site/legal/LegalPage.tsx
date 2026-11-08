import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Container } from '@/components/site/ui/primitives';
import type { PageAccessor } from '@/lib/site/page-content';

/** Gabarit des pages légales (bandeau orange de la maquette + texte Markdown). */
export default function LegalPage({ c }: { c: PageAccessor }) {
  return (
    <main>
      <section className="bg-[color:var(--asp-accent)] text-white pt-[124px]">
        <Container className="p-[clamp(40px,6vw,72px)_clamp(20px,5vw,40px)]">
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-white block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase">Informations légales</span>
          </div>
          <h1 className="font-heading font-extrabold text-[length:clamp(1.8rem,3.6vw,2.8rem)] leading-[1.1] tracking-[-.02em] m-[14px_0_0]">{c.t('title')}</h1>
        </Container>
      </section>
      <section className="p-[clamp(48px,7vw,88px)_0] bg-white">
        <Container className="grid grid-cols-[minmax(0,1fr)] [&>h2:first-child]:mt-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            h2: ({ children }) => <h2 className="font-heading font-extrabold text-[length:1.25rem] text-navy m-[34px_0_14px]">{children}</h2>,
            h3: ({ children }) => <h3 className="font-heading font-bold text-[length:1.08rem] text-navy m-[24px_0_10px]">{children}</h3>,
            p: ({ children }) => <p className="text-[length:1rem] leading-[1.85] text-[color:#42505f] m-[0_0_16px]">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-[22px] m-[0_0_16px] text-[length:1rem] leading-[1.8] text-[color:#42505f]">{children}</ul>,
            a: ({ href = '', children }) => <a href={href} className="text-[color:var(--asp-accent-ink)] font-semibold underline">{children}</a>,
          }}>{c.t('body')}</ReactMarkdown>
        </Container>
      </section>
    </main>
  );
}
