/**
 * Composants de base du site public, repris à l'identique de la maquette
 * (dimensions, couleurs, typographies). Les pages les composent plutôt que de
 * répéter les classes.
 */
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Conteneur centré 1280 px avec gouttières fluides. */
export function Container({ children, className, wide = false, ...rest }: { children: ReactNode; className?: string; wide?: boolean } & ComponentProps<'div'>) {
  return <div className={cx(wide ? 'max-w-[1400px]' : 'max-w-[1280px]', 'm-[0_auto] p-[0_clamp(20px,5vw,40px)]', className)} {...rest}>{children}</div>;
}

/** Surtitre orange en capitales. */
export function Eyebrow({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'p' | 'span' }) {
  return <Tag className={cx('font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase text-[color:var(--asp-accent-ink)]', className)}>{children}</Tag>;
}

/** Titre de section avec barre verticale orange (« Ce que disent nos clients »…). */
export function BarHeading({ children, className, as: Tag = 'h2', size = 'lg' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2'; size?: 'lg' | 'md' }) {
  return (
    <div className={cx('flex items-center gap-[14px]', className)}>
      <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
      <Tag className={cx('font-heading font-extrabold leading-[1.12] tracking-[-.015em] m-0 text-navy', size === 'lg' ? 'text-[length:clamp(1.7rem,3.2vw,2.6rem)]' : 'text-[length:clamp(1.5rem,2.6vw,2.05rem)]')}>{children}</Tag>
    </div>
  );
}

/** Petit libellé « Actualités » précédé d'une barre. */
export function BarLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-center gap-[14px]', className)}>
      <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
      <span className="font-heading font-extrabold text-[length:.78rem] tracking-[.1em] uppercase text-[color:var(--asp-accent-ink)]">{children}</span>
    </div>
  );
}

/** Titre H2 standard des sections (1.6 → 2.4rem). */
export function H2({ children, className, light = false, id }: { children: ReactNode; className?: string; light?: boolean; id?: string }) {
  return (
    <h2 id={id} data-light={light ? '' : undefined} className={cx('font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_16px]', light ? 'text-white' : 'text-navy', className)}>
      {children}
    </h2>
  );
}

type Variant = 'primary' | 'outline' | 'outlineLight' | 'navy' | 'ghost' | 'white' | 'link';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[color:var(--asp-accent)] text-white p-[15px_26px] text-[length:.95rem] hover:[background:color-mix(in_srgb,var(--asp-accent)_84%,#000)]',
  outline: '[border:1.5px_solid_#06226D] text-navy p-[14px_22px] text-[length:.92rem]',
  outlineLight: '[border:1.5px_solid_rgba(255,255,255,.6)] text-white p-[16px_24px] text-[length:.98rem]',
  navy: 'bg-navy text-white p-[16px_28px] text-[length:.95rem] hover:[background:color-mix(in_srgb,#06226D_84%,#000)]',
  ghost: 'text-navy p-[15px_4px] text-[length:.82rem] tracking-[.08em] uppercase',
  white: 'bg-white [border:1px_solid_#9fb6dc] text-navy p-[13px_22px] font-semibold text-[length:.92rem] hover:[border-color:#06226D]',
  link: 'text-[color:var(--asp-accent-ink)] p-0 text-[length:.96rem] hover:text-[color:color-mix(in_srgb,var(--asp-accent)_84%,#000)]',
};

/** Bouton-lien (navigation réelle via <a>/<Link>). */
export function ButtonLink({ href, children, variant = 'primary', arrow = true, className, external = false, ...rest }: { href: string; children: ReactNode; variant?: Variant; arrow?: boolean; className?: string; external?: boolean } & Omit<ComponentProps<'a'>, 'href'>) {
  const cls = cx('inline-flex items-center gap-[10px] leading-[normal] font-heading font-bold no-underline cursor-pointer [transition:background_.18s,color_.18s,border-color_.18s]', VARIANTS[variant], className);
  const inner = (
    <>
      {children}
      {arrow && <span className={variant === 'ghost' ? 'text-[color:var(--asp-accent)]' : undefined} aria-hidden="true">→</span>}
    </>
  );
  if (external || /^(tel:|mailto:|https?:)/.test(href)) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <Link href={href} className={cls} {...rest}>{inner}</Link>;
}

/** Image de couverture optimisée (remplace les arrière-plans CSS de la maquette, avec texte alternatif). */
export function Cover({ src, alt, className, sizes = '(max-width: 1040px) 100vw, 50vw', priority = false, children, position = 'center', fallback = '#dfe7f2', ...rest }: { src: string | null | undefined; alt: string; className?: string; sizes?: string; priority?: boolean; children?: ReactNode; position?: string; fallback?: string } & ComponentProps<'div'>) {
  return (
    <div className={cx('relative overflow-hidden', className)} style={{ background: fallback }} {...rest}>
      {src && <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />}
      {children}
    </div>
  );
}

/** Carré orange décoratif. */
export function AccentBlock({ className }: { className: string }) {
  return <span className={cx('absolute bg-[color:var(--asp-accent)]', className)} aria-hidden="true" />;
}

/** Grande bande d'appel à l'action sur photo (« Un besoin de propreté ? On s'en occupe. »). */
export function CtaBand({ title, text, image, phone, phoneIntl, ctaLabel = 'Demander un devis gratuit', ctaHref = '/contact' }: { title: string; text: string; image: string; phone: string; phoneIntl: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <div className="relative overflow-hidden text-white flex flex-wrap items-center justify-between gap-[28px] p-[clamp(32px,5vw,56px)_clamp(24px,5vw,56px)]" data-cta-band="">
      <Image src={image} alt="" fill sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" />
      <div className="absolute inset-0 [background:linear-gradient(90deg,rgba(0,0,0,.78)_0%,rgba(0,0,0,.6)_55%,rgba(0,0,0,.45)_100%)]" aria-hidden="true" />
      <div className="relative flex-[1_1_420px] max-w-[620px]">
        <h2 className="font-heading font-extrabold tracking-[-.015em] text-[length:clamp(1.6rem,2.8vw,2.2rem)] leading-[1.15] m-[0_0_12px] text-white" data-light="">{title}</h2>
        <p className="text-[length:1.02rem] leading-[1.65] text-[color:rgba(255,255,255,.88)] m-0">{text}</p>
      </div>
      <div className="relative flex flex-wrap gap-[12px]">
        <ButtonLink href={ctaHref} className="p-[16px_28px] text-[length:.98rem]">{ctaLabel}</ButtonLink>
        <ButtonLink href={`tel:${phoneIntl}`} variant="outlineLight" arrow={false}>{phone}</ButtonLink>
      </div>
    </div>
  );
}

/** Note en étoiles. */
export function Stars({ className }: { className?: string }) {
  return <span className={cx('text-[color:#f6b400] tracking-[2px]', className)} aria-label="5 étoiles sur 5">★★★★★</span>;
}

export { cx };
