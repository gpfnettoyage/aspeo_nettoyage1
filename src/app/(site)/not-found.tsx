import Link from 'next/link';
import { ButtonLink, Container } from '@/components/site/ui/primitives';
import { SearchIcon } from '@/components/site/ui/icons';

export const metadata = { title: 'Page introuvable | ASPEO', robots: { index: false, follow: true } };

const LINKS = [
  { href: '/proprete-services', label: 'Propreté & Services' },
  { href: '/zones-intervention', label: "Zones d'intervention" },
  { href: '/realisations', label: 'Nos réalisations' },
  { href: '/medias', label: 'Actualités' },
  { href: '/a-propos', label: 'Notre Histoire' },
];

/** Page 404 du site public. */
export default function NotFound() {
  return (
    <main>
      <section className="relative overflow-hidden bg-navy text-white" data-dark="">
        <Container className="p-[clamp(170px,22vh,210px)_clamp(20px,5vw,40px)_clamp(56px,8vh,88px)]">
          <div className="inline-flex items-center gap-[12px]">
            <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
            <span className="font-heading font-bold text-[length:.82rem] tracking-[.16em] uppercase">Erreur 404</span>
          </div>
          <h1 className="font-heading font-extrabold text-[length:clamp(2.2rem,4.6vw,3.8rem)] leading-[1.05] tracking-[-.02em] m-[16px_0_0] max-w-[760px]">Cette page n&apos;existe pas ou a été déplacée</h1>
          <p className="m-[20px_0_0] text-[length:clamp(1.02rem,1.4vw,1.18rem)] leading-[1.6] text-[color:rgba(255,255,255,.9)] max-w-[620px]">Le lien que vous avez suivi est peut-être ancien. Recherchez une prestation ou une ville, ou repartez de l&apos;une de nos rubriques.</p>
          <form action="/recherche" role="search" className="flex items-center gap-[10px] m-[28px_0_0] bg-white p-[6px_6px_6px_18px] max-w-[560px]">
            <span className="text-[color:#8a97a8] inline-flex"><SearchIcon size={18} /></span>
            <label htmlFor="nf-q" className="sr-only">Rechercher sur le site</label>
            <input id="nf-q" name="q" className="flex-1 min-w-0 border-none outline-none text-[length:1rem] text-navy p-[12px_0] bg-transparent" placeholder="Un service, une ville, une réalisation…" />
            <button type="submit" aria-label="Rechercher" data-search-btn="" className="flex-none bg-[color:var(--asp-accent)] text-white border-none p-[14px_24px] font-heading font-bold text-[length:.94rem] cursor-pointer"><span data-xs-hide="">Rechercher</span><span className="hidden" data-xs-only="" aria-hidden="true">→</span></button>
          </form>
        </Container>
      </section>
      <section className="p-[clamp(48px,7vw,80px)_0] bg-white">
        <Container>
          <ul className="list-none p-0 m-0 flex flex-wrap gap-[10px]">
            {LINKS.map((l) => <li key={l.href}><Link href={l.href} className="inline-block bg-white [border:1px_solid_#e2e8f0] text-navy font-semibold text-[length:.92rem] p-[11px_18px] no-underline hover:[border-color:#06226D]">{l.label}</Link></li>)}
          </ul>
          <div className="mt-[32px] flex flex-wrap gap-[14px]">
            <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
            <ButtonLink href="/contact" variant="outline">Nous contacter</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
