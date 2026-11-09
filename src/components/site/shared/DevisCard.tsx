import Image from 'next/image';
import Link from 'next/link';

const PROMO_IMAGE = 'https://gerrrw8pnhgmo9jz.public.blob.vercel-storage.com/services/nettoyage-apres-sinistre/maison-ruine-1774184286454.webp';

/** Carte « Devis gratuit » flottante sur le bandeau (bureau uniquement). */
export default function DevisCard() {
  return (
    <div className="absolute top-[50%] [transform:translateY(-50%)] h-[clamp(280px,38vh,340px)] right-[clamp(20px,5vw,40px)] w-[min(320px,32%)] overflow-hidden p-[24px] flex flex-col justify-center gap-[12px] shadow-[0_20px_44px_-14px_rgba(6,34,109,.4)] z-[6] max-[1040px]:hidden">
      <Image src={PROMO_IMAGE} alt="" fill sizes="320px" className="object-cover" />
      <div className="absolute inset-0 [background:linear-gradient(160deg,rgba(0,0,0,.62),rgba(0,0,0,.4))]" aria-hidden="true" />
      <span className="relative self-start bg-white text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.68rem] tracking-[.08em] uppercase p-[5px_10px]">Devis Gratuit</span>
      <p className="relative font-heading font-extrabold text-[length:1.15rem] leading-[1.25] text-white m-0">Demandez votre devis</p>
      <p className="relative text-[length:.86rem] leading-[1.5] text-[color:rgba(255,255,255,.85)] m-0">Décrivez votre besoin : devis gratuit sous 24h après la visite.</p>
      <Link href="/contact" className="relative mt-auto bg-white text-[color:var(--asp-accent-ink)] p-[12px_16px] font-heading font-bold text-[length:.86rem] flex items-center justify-center gap-[8px] no-underline hover:bg-[color:#f1f1f1]">Demander un devis <span aria-hidden="true">→</span></Link>
    </div>
  );
}

