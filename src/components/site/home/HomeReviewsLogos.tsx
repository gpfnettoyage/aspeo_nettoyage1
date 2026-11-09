import Image from 'next/image';
import { Stars } from '@/components/site/ui/primitives';

interface Props {
  label: string;
  rating: number;
  reviewCount: number;
  reviewUrl: string;
  logos: Record<string, string>[];
}

/** Note Google + mur de logos clients défilant. */
export default function HomeReviewsLogos({ label, rating, reviewCount, reviewUrl, logos }: Props) {
  const cols = [0, 1, 2].map((ci) => logos.filter((_, i) => i % 3 === ci));
  const durations = ['16s', '20s', '18s'];
  const badge = (
    <>
      <span className="font-heading font-extrabold text-[length:1.4rem] text-navy">{rating.toFixed(1).replace('.', ',')}</span>
      <Stars className="text-[length:1rem]" />
      <span className="text-[length:.92rem] text-[color:#42505f]">{reviewCount} avis Google</span>
    </>
  );
  return (
    <section className="p-[clamp(48px,6vw,72px)_0] bg-white">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
        <p className="text-[length:.88rem] font-bold tracking-[.08em] uppercase text-navy m-[0_0_12px]">{label}</p>
        {reviewUrl ? (
          <a className="inline-flex items-center gap-[14px] no-underline bg-[color:#EAF1FB] p-[14px_20px] mb-[36px]" href={reviewUrl} target="_blank" rel="noopener noreferrer">{badge}</a>
        ) : (
          <div className="inline-flex items-center gap-[14px] bg-[color:#EAF1FB] p-[14px_20px] mb-[36px]">{badge}</div>
        )}
      </div>
      {logos.length > 0 && (
        <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[minmax(0,1.3fr)_minmax(min(100%,240px),0.8fr)] gap-[clamp(32px,5vw,56px)] items-center" data-r2="">
          <div className="asp-logowall flex gap-[14px] h-[260px] overflow-hidden [-webkit-mask-image:linear-gradient(180deg,transparent_0,#000_30px,#000_calc(100%_-_30px),transparent_100%)] [mask-image:linear-gradient(180deg,transparent_0,#000_30px,#000_calc(100%_-_30px),transparent_100%)]" aria-label="Ils nous font confiance">
            {cols.map((col, ci) => (
              <div key={ci} className="asp-logo-col flex-1 flex flex-col gap-[14px]" style={{ animationDuration: durations[ci] }}>
                {[...col, ...col].map((logo, i) => (
                  <div key={i} className="relative w-full h-[80px] flex-none bg-white" aria-hidden={i >= col.length || undefined}>
                    {logo.src && <Image src={logo.src} alt={i < col.length ? logo.alt ?? '' : ''} fill sizes="200px" className="object-contain" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
