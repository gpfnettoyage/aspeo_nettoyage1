import Image from 'next/image';
import Link from 'next/link';

/** Tuile photo d'un service (catalogue, pages activités, services liés). */
export default function ServiceTile({ href, title, text, image, headingLevel = 'h3' }: { href: string; title: string; text: string; image: string | null; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <Link href={href} className="group text-left relative min-h-[280px] h-full w-full p-0 overflow-hidden bg-navy no-underline block">
      {image && <Image src={image} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw" className="object-cover [transition:transform_.6s_ease] group-hover:[transform:scale(1.05)]" />}
      <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(6,34,109,0)_30%,rgba(6,34,109,.55)_62%,rgba(6,34,109,.92)_100%)] pointer-events-none" aria-hidden="true" />
      <span className="absolute top-0 left-0 w-[14px] h-[14px] bg-[color:var(--asp-accent)]" aria-hidden="true" />
      <div className="absolute left-0 right-0 bottom-0 p-[22px_22px_24px] pointer-events-none">
        <H className="font-heading font-extrabold text-[length:1.12rem] leading-[1.2] text-white m-[0_0_8px]">{title}</H>
        {text && <p className="text-[length:.86rem] leading-[1.5] text-[color:rgba(255,255,255,.88)] m-[0_0_14px] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">{text}</p>}
        <span className="inline-flex items-center gap-[8px] font-heading font-bold text-[length:.8rem] tracking-[.06em] uppercase text-white">Découvrir <span className="text-[color:var(--asp-accent)]" aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
