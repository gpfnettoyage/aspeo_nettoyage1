import Image from 'next/image';
import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';

interface Props {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  image?: string | null;
  imageAlt?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  crumbs?: Crumb[];
  titleClassName?: string;
  /** Classes du texte d'introduction (la page Contact de la maquette utilise une taille légèrement inférieure). */
  textClassName?: string;
}

/** Bandeau de page sur photo avec dégradé bleu (pages Services, activités, fiches…). */
export default function PageHero({ eyebrow, title, text, image, imageAlt = '', actions, aside, crumbs, titleClassName, textClassName }: Props) {
  return (
    <section className="relative overflow-hidden text-white min-h-[clamp(420px,52vh,540px)] flex flex-col" data-dark="">
      <div className="absolute inset-0 bg-navy" aria-hidden="true" />
      {image && <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />}
      <div className="absolute inset-0 [background:linear-gradient(100deg,rgba(6,34,109,.88)_0%,rgba(6,34,109,.7)_50%,rgba(6,34,109,.45)_100%)]" aria-hidden="true" />
      <div className="relative flex-1 flex items-center w-full">
        <div className="max-w-[1280px] m-[0_auto] p-[clamp(160px,20vh,190px)_clamp(20px,5vw,40px)_clamp(48px,8vh,72px)] w-full">
          {crumbs && <Breadcrumbs items={crumbs} light />}
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.82rem] tracking-[.16em] uppercase">{eyebrow}</span>
          </div>
          <h1 className={titleClassName ?? 'font-heading font-extrabold text-[length:clamp(2.6rem,5.2vw,4.8rem)] leading-[1.02] tracking-[-.02em] m-[16px_0_0] max-w-[820px]'}>{title}</h1>
          {text && <p className={textClassName ?? 'm-[20px_0_0] text-[length:clamp(1.05rem,1.5vw,1.24rem)] leading-[1.6] text-[color:rgba(255,255,255,.9)] max-w-[640px]'}>{text}</p>}
          {actions && <div className="flex flex-wrap gap-[14px] m-[28px_0_0]">{actions}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}
