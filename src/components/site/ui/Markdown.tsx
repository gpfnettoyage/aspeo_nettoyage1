import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

/**
 * Rendu Markdown (GFM) des articles et pages éditées dans l'administration.
 * Le HTML brut n'est pas interprété (protection XSS) ; les liens internes passent par <Link>.
 */
const components: Components = {
  h1: ({ children }) => <h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.4vw,1.9rem)] tracking-[-.015em] text-navy m-[36px_0_14px]">{children}</h2>,
  h2: ({ children }) => <h2 className="font-heading font-extrabold text-[length:clamp(1.35rem,2.3vw,1.75rem)] tracking-[-.015em] text-navy m-[36px_0_14px]">{children}</h2>,
  h3: ({ children }) => <h3 className="font-heading font-bold text-[length:1.2rem] text-navy m-[28px_0_10px]">{children}</h3>,
  h4: ({ children }) => <h4 className="font-heading font-bold text-[length:1.05rem] text-navy m-[22px_0_8px]">{children}</h4>,
  p: ({ children }) => <p className="text-[length:1.08rem] leading-[1.85] text-[color:#42505f] m-[0_0_20px]">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-[22px] m-[0_0_20px] text-[length:1.04rem] leading-[1.8] text-[color:#42505f] [&_li]:mb-[6px] marker:text-[color:var(--asp-accent)]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-[22px] m-[0_0_20px] text-[length:1.04rem] leading-[1.8] text-[color:#42505f] [&_li]:mb-[6px]">{children}</ol>,
  strong: ({ children }) => <strong className="text-navy">{children}</strong>,
  blockquote: ({ children }) => <blockquote className="m-[0_0_20px] [border-left:3px_solid_var(--asp-accent)] bg-[color:#f8fafc] p-[16px_20px] [&_p]:m-0">{children}</blockquote>,
  hr: () => <hr className="border-0 [border-top:1px_solid_#eef2f7] m-[32px_0]" />,
  a: ({ href = '', children }) => href.startsWith('/')
    ? <Link href={href} className="text-[color:var(--asp-accent-ink)] font-semibold underline [text-underline-offset:3px]">{children}</Link>
    : <a href={href} target="_blank" rel="noopener noreferrer" className="text-[color:var(--asp-accent-ink)] font-semibold underline [text-underline-offset:3px]">{children}</a>,
  img: ({ src, alt }) => <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} loading="lazy" decoding="async" className="block w-full h-auto m-[8px_0_24px]" />,
  table: ({ children }) => <div className="overflow-x-auto m-[0_0_24px]"><table className="w-full border-collapse text-[length:.95rem] text-[color:#334155]">{children}</table></div>,
  th: ({ children }) => <th className="text-left bg-navy text-white font-heading font-bold p-[10px_12px] [border:1px_solid_#06226D]">{children}</th>,
  td: ({ children }) => <td className="p-[10px_12px] [border:1px_solid_#e2e8f0] align-top">{children}</td>,
};

export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown>;
}
