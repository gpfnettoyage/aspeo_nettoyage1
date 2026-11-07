import Image from 'next/image';
import type { Realisation } from '@prisma/client';
import { ButtonLink, Eyebrow } from '@/components/site/ui/primitives';
import { urls } from '@/lib/site/urls';
import type { Fact } from '@/lib/site/types';

/** Réalisation à la une (accueil). */
export default function HomeFeatured({ eyebrow, r }: { eyebrow: string; r: Realisation }) {
  const facts = (Array.isArray(r.facts) ? r.facts : []) as unknown as Fact[];
  const blocks: [string, string | null][] = [['Le contexte', r.context], ['Le problème à résoudre', r.constraints], ['Notre solution', r.intervention]];
  return (
    <section className="p-[clamp(56px,8vw,104px)_0] bg-white">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)]">
        <div className="flex flex-wrap items-end justify-between gap-[16px] mb-[32px]">
          <div className="max-w-[640px]">
            <Eyebrow className="mb-[12px]">{eyebrow}</Eyebrow>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.6rem,3vw,2.4rem)] leading-[1.15] tracking-[-.015em] m-[0_0_14px] text-navy">{r.title}</h2>
            <p className="text-[length:1rem] text-[color:#42505f] m-0">{[r.client, r.city, r.serviceLabel].filter(Boolean).join(' · ')}</p>
          </div>
          <ButtonLink href={urls.realisations()} variant="ghost" className="p-[10px_0]">Toutes nos réalisations</ButtonLink>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[clamp(28px,4vw,56px)] items-start" data-r2="">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:#dfe7f2]">
              {r.image && <Image src={r.image} alt={r.imageAlt || r.title} fill sizes="(max-width: 1040px) 100vw, 50vw" className="object-cover" />}
            </div>
            {facts.length > 0 && (
              <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-[1px] bg-[color:#dbe5f4] mt-[1px]" data-sepgrid="">
                {facts.map((f, i) => (
                  <div key={i} className="bg-[color:#EAF1FB] p-[14px_16px]">
                    <dt className="text-[length:.75rem] tracking-[.06em] uppercase text-[color:#5b6878]">{f.k}</dt>
                    <dd className="m-0 font-heading font-bold text-[length:1rem] text-navy mt-[4px]">{f.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="flex flex-col gap-[22px]">
            {blocks.filter(([, v]) => v).map(([title, v]) => (
              <div key={title}>
                <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_6px]">{title}</h3>
                <p className="text-[length:.98rem] leading-[1.7] text-[color:#42505f] m-0">{v}</p>
              </div>
            ))}
            {r.result && (
              <div className="bg-[color:#EAF1FB] p-[20px_22px]">
                <h3 className="font-heading font-bold text-[length:1.05rem] text-navy m-[0_0_6px]">Le résultat</h3>
                <p className="text-[length:.98rem] leading-[1.7] text-[color:#42505f] m-0">{r.result}</p>
              </div>
            )}
            <ButtonLink href={urls.realisation(r.slug)} variant="outline" className="self-start">Lire l&apos;étude de cas</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
