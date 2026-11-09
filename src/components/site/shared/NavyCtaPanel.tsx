import Image from 'next/image';
import { ButtonLink } from '@/components/site/ui/primitives';
import { PhoneIcon } from '@/components/site/ui/icons';

/** Panneau bleu « Parlons de votre projet » (photo atténuée, CTA devis + téléphone). */
export default function NavyCtaPanel({ eyebrow, title, text, image, phone, phoneIntl, ctaLabel = 'Demander un devis', ctaHref = '/contact' }: { eyebrow: string; title: string; text: string; image: string; phone: string; phoneIntl: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <div className="relative overflow-hidden bg-navy text-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-[clamp(32px,5vw,60px)] flex flex-wrap gap-[clamp(24px,4vw,48px)] items-center justify-between" data-dark="" data-cta-band="">
      <Image src={image} alt="" fill sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover opacity-[.24]" />
      <div className="absolute inset-0 [background:linear-gradient(120deg,rgba(0,0,0,.72),rgba(0,0,0,.45))]" aria-hidden="true" />
      <div className="relative flex-[1_1_380px] min-w-[min(100%,260px)]">
        <div className="inline-flex items-center gap-[12px]">
          <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
          <span className="font-heading font-bold text-[length:.78rem] tracking-[.16em] uppercase text-[color:rgba(255,255,255,.85)]">{eyebrow}</span>
        </div>
        <h2 className="font-heading font-extrabold text-[length:clamp(1.5rem,2.8vw,2.1rem)] leading-[1.14] tracking-[-.015em] text-white m-[14px_0_10px]" data-light="">{title}</h2>
        <p className="text-[length:1rem] leading-[1.7] text-[color:rgba(255,255,255,.85)] m-0 max-w-[520px]">{text}</p>
      </div>
      <div className="relative flex flex-wrap gap-[14px] items-center">
        <ButtonLink href={ctaHref} className="p-[16px_28px] font-semibold text-[length:.96rem]">{ctaLabel}</ButtonLink>
        <a className="inline-flex items-center gap-[10px] text-white no-underline font-heading font-bold text-[length:1.02rem] whitespace-nowrap" href={`tel:${phoneIntl}`}>
          <span className="text-[color:var(--asp-accent-ink)] inline-flex"><PhoneIcon size={17} /></span>{phone}
        </a>
      </div>
    </div>
  );
}
