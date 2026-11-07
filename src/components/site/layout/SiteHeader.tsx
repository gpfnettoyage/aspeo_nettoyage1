'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, PhoneIcon, SearchIcon } from '@/components/site/ui/icons';
import type { HeaderData, MenuGroup } from './header-types';
import MobileMenu from './MobileMenu';

type Panel = 'services' | 'media' | null;

const navItem =
  'relative font-body font-semibold text-[length:.97rem] text-navy px-[14px] flex items-center whitespace-nowrap no-underline hover:text-[color:var(--asp-accent-ink)] focus-visible:text-[color:var(--asp-accent-ink)]';
const ActiveBar = () => <span className="absolute left-[15px] right-[15px] bottom-0 h-[3px] bg-[color:var(--asp-accent)]" aria-hidden="true" />;

function MegaItem({ title, short, href }: { title: string; short: string; href: string }) {
  return (
    <Link href={href} className="text-left p-0 flex flex-col gap-[2px] no-underline hover:opacity-[.75]">
      <span className="font-heading font-bold text-[length:.9rem] leading-[1.3] text-navy">{title}</span>
      {short && <span className="text-[length:.78rem] text-[color:#8a97a8] leading-[1.3]">{short}</span>}
    </Link>
  );
}

function SeeAll({ href, className = 'pt-[2px]' }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`text-left text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.82rem] flex items-center gap-[6px] no-underline ${className}`}>
      Voir tout <span aria-hidden="true">→</span>
    </Link>
  );
}

function PoleTitle({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <div className={`flex items-center gap-[10px] ${wide ? 'mb-[16px]' : 'm-[0_0_18px]'}`}>
      <span className={`${wide ? 'w-[22px]' : 'w-[16px]'} h-[2px] bg-[color:var(--asp-accent)] flex-none`} />
      <span className={`font-heading font-extrabold text-[length:.7rem] ${wide ? 'tracking-[.12em]' : 'tracking-[.1em]'} uppercase text-navy`}>{label}</span>
    </div>
  );
}

function GroupColumn({ group }: { group: MenuGroup }) {
  return (
    <div>
      <h3 className="font-heading font-bold text-[length:.7rem] tracking-[.08em] uppercase text-[color:#8a97a8] m-[0_0_14px]">{group.label}</h3>
      <div className="flex flex-col gap-[16px]">
        {group.items.map((sv) => <MegaItem key={sv.href} {...sv} />)}
        <SeeAll href={group.href} />
      </div>
    </div>
  );
}

export default function SiteHeader({ data }: { data: HeaderData }) {
  const pathname = usePathname() || '/';
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHome = pathname === '/';
  const isAbout = pathname.startsWith('/a-propos');
  const isServicesArea = pathname.startsWith('/proprete-services');
  const isMediaArea = pathname.startsWith('/medias') || pathname.startsWith('/realisations');

  const open = useCallback((p: Panel) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanel(p);
  }, []);
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanel(null), 160);
  }, []);

  // Fermeture des menus à chaque navigation
  useEffect(() => {
    setPanel(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPanel(null); setMobileOpen(false); } };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[50] bg-white [border-bottom:1px_solid_#e2e7ee] [transition:box-shadow_.3s_ease,background_.25s_ease,border-color_.25s_ease]"
        style={{ boxShadow: scrolled ? '0 4px 16px rgba(6,34,109,.08)' : 'none' }}
        onMouseLeave={scheduleClose}
      >
        <div className="bg-white text-navy" data-topbar="">
          <div className="max-w-[1600px] m-[0_auto] p-[0_clamp(6px,3vw,42px)] h-[36px] flex items-center justify-end">
            {data.topbar.map((l) => (
              <Link key={l.href} href={l.href} className="p-[0_14px] text-navy font-body font-medium text-[length:.86rem] inline-flex items-center min-h-[32px] opacity-[.85] no-underline hover:opacity-100">
                {l.label}
              </Link>
            ))}
            <span className="w-[1px] h-[14px] [background:currentColor] opacity-[.25]" aria-hidden="true" />
            <Link href="/recherche" className="text-navy font-body font-medium inline-flex items-center min-h-[32px] opacity-[.85] p-[0_4px_0_14px] min-w-[44px] justify-center hover:opacity-100" aria-label="Rechercher sur le site">
              <SearchIcon />
            </Link>
          </div>
        </div>

        <div className="max-w-[1600px] m-[0_auto] p-[0_clamp(20px,4vw,56px)] h-[88px] flex items-center gap-[20px]">
          <Link href="/" className="p-0 flex items-center flex-none" data-hdr-logo="" aria-label="ASPEO Nettoyage — accueil">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG officiel, servi tel quel */}
            <img className="h-[52px] w-auto block" src={data.logo} alt="ASPEO Nettoyage" width={202} height={52} />
          </Link>

          {/* Navigation bureau */}
          <nav className="flex items-stretch h-[88px] ml-[14px] max-[1040px]:hidden" aria-label="Navigation principale">
            <Link href="/" className={navItem} onMouseEnter={() => setPanel(null)} aria-current={isHome ? 'page' : undefined}>
              Accueil{isHome && <ActiveBar />}
            </Link>
            <Link href="/a-propos" className={navItem} onMouseEnter={() => setPanel(null)} aria-current={isAbout ? 'page' : undefined}>
              Notre Histoire{isAbout && <ActiveBar />}
            </Link>
            <Link
              href="/proprete-services"
              className={`${navItem} ${panel === 'services' ? 'text-[color:var(--asp-accent-ink)]' : ''}`}
              onMouseEnter={() => open('services')}
              onFocus={() => open('services')}
              aria-expanded={panel === 'services'}
              aria-haspopup="true"
            >
              Propreté &amp; Services
              <ChevronDownIcon className="ml-[6px] flex-none" />
              {isServicesArea && <ActiveBar />}
            </Link>
            <Link
              href="/medias"
              className={`${navItem} ${panel === 'media' ? 'text-[color:var(--asp-accent-ink)]' : ''}`}
              onMouseEnter={() => open('media')}
              onFocus={() => open('media')}
              aria-expanded={panel === 'media'}
              aria-haspopup="true"
            >
              Médias
              <ChevronDownIcon className="ml-[6px] flex-none" />
              {isMediaArea && <ActiveBar />}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-[16px] flex-none max-[1040px]:hidden">
            <a className="font-heading font-bold text-navy no-underline text-[length:.96rem] flex items-center gap-[8px] whitespace-nowrap flex-none p-[12px_0] max-[1240px]:hidden" href={`tel:${data.phoneIntl}`}>
              <span className="text-navy inline-flex"><PhoneIcon /></span>
              {data.phone}
            </a>
            <Link href="/contact" className="border-none p-[14px_24px] font-heading font-bold text-[length:.92rem] whitespace-nowrap flex-none bg-[color:var(--asp-accent)] text-white no-underline [transition:background_.18s] hover:opacity-[.88]">
              {data.ctaLabel}
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <div className="ml-auto flex items-center gap-[8px] min-[1041px]:hidden" data-hdr-tools="">
            <button
              type="button"
              className="bg-transparent [border:1px_solid_#e2e7ee] cursor-pointer p-[12px_11px] flex flex-col gap-[4px]"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
            >
              <span className="w-[20px] h-[2px] bg-navy block" />
              <span className="w-[20px] h-[2px] bg-navy block" />
              <span className="w-[20px] h-[2px] bg-navy block" />
            </button>
          </div>
        </div>

        {/* Méga-menu Propreté & Services */}
        {panel === 'services' && (
          <div className="fixed top-[124px] left-0 right-0 bg-white [border-top:1px_solid_#eef2f7] shadow-[0_24px_48px_-24px_rgba(6,34,109,.2)] z-[49] max-[1040px]:hidden [animation:aspPanel_.18s_ease]" onMouseEnter={() => open('services')} onMouseLeave={scheduleClose}>
            <div className="max-w-[1400px] m-[0_auto] p-[32px_clamp(20px,5vw,40px)] grid grid-cols-[1.4fr_1fr_1fr_280px] gap-[36px]">
              {data.poles.map((pole) => (
                <div key={pole.key}>
                  <PoleTitle label={pole.label} />
                  <div className="grid gap-[28px]" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                    {pole.groups.map((g) => <GroupColumn key={g.href} group={g} />)}
                  </div>
                </div>
              ))}
              {data.others && (
                <div>
                  <PoleTitle label="Autres Services" />
                  <div className="flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[16px]">
                      {data.others.items.map((sv) => <MegaItem key={sv.href} {...sv} />)}
                    </div>
                    <SeeAll href={data.others.href} className="pt-[10px]" />
                  </div>
                </div>
              )}
              <div className="relative rounded-[10px] overflow-hidden p-[22px] flex flex-col gap-[12px] self-stretch">
                {/* eslint-disable-next-line @next/next/no-img-element -- image décorative du panneau */}
                <img className="absolute inset-0 w-full h-full object-cover" src={data.promoImage} alt="" loading="lazy" decoding="async" />
                <div className="absolute inset-0 [background:linear-gradient(100deg,rgba(6,34,109,.88)_0%,rgba(6,34,109,.72)_45%,rgba(6,34,109,.5)_100%)]" aria-hidden="true" />
                <div className="absolute inset-0 bg-[color:rgba(10,14,26,.25)]" aria-hidden="true" />
                <span className="relative self-start bg-white text-[color:var(--asp-accent-ink)] font-heading font-bold text-[length:.68rem] tracking-[.08em] uppercase p-[5px_10px] rounded-[4px]">Devis Gratuit</span>
                <p className="relative font-heading font-extrabold text-[length:1.15rem] leading-[1.25] text-white m-0">Demandez votre devis</p>
                <p className="relative text-[length:.86rem] leading-[1.5] text-[color:rgba(255,255,255,.85)] m-0">Décrivez votre besoin : devis gratuit sous 24h après la visite.</p>
                <Link href="/contact" className="relative mt-auto bg-white text-[color:var(--asp-accent-ink)] p-[12px_16px] font-heading font-bold text-[length:.86rem] flex items-center justify-center gap-[8px] no-underline hover:bg-[color:#f1f1f1]">
                  Demander un devis <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Menu Médias */}
        {panel === 'media' && (
          <div className="fixed top-[124px] left-0 right-0 bg-white [border-top:2px_solid_var(--asp-accent)] shadow-[0_24px_48px_-24px_rgba(6,34,109,.2)] z-[49] max-[1040px]:hidden [animation:aspPanel_.18s_ease]" onMouseEnter={() => open('media')} onMouseLeave={scheduleClose}>
            <div className="max-w-[1400px] m-[0_auto] p-[36px_clamp(20px,5vw,40px)] grid grid-cols-[260px_1fr] gap-[36px] min-h-[240px]">
              <div>
                <PoleTitle label="Catégories" wide />
                <Link href="/medias/actualites" className="block w-full text-left bg-[color:var(--asp-tint)] [border-left:3px_solid_var(--asp-accent)] p-[14px_16px] font-heading font-bold text-[length:.96rem] text-navy no-underline">Actualités</Link>
                <Link href="/realisations" className="block w-full text-left bg-white [border-left:3px_solid_transparent] p-[14px_16px] mt-[6px] font-heading font-bold text-[length:.96rem] text-navy no-underline hover:bg-[color:var(--asp-tint)] hover:[border-left-color:var(--asp-accent-ink)]">Nos réalisations</Link>
                <Link href="/medias/presse" className="block w-full text-left bg-white [border-left:3px_solid_transparent] p-[14px_16px] mt-[6px] font-heading font-bold text-[length:.96rem] text-navy no-underline hover:bg-[color:var(--asp-tint)] hover:[border-left-color:var(--asp-accent-ink)]">Presse</Link>
              </div>
              <div>
                <div className="flex items-center gap-[10px] mb-[18px]">
                  <span className="w-[22px] h-[2px] bg-[color:var(--asp-accent)] block" />
                  <span className="font-heading font-extrabold text-[length:.7rem] tracking-[.12em] uppercase text-navy">Derniers articles</span>
                </div>
                <div className="grid grid-cols-[repeat(2,1fr)] gap-[20px]">
                  {data.articles.map((a) => (
                    <Link key={a.href} href={a.href} className="flex gap-[14px] text-left w-full [border:1px_solid_#eef2f7] p-[12px] no-underline hover:bg-[color:var(--asp-tint)]">
                      <span className="flex-none w-[84px] h-[84px] overflow-hidden [background-size:cover] [background-position:center] bg-[color:#eef2f7]" aria-hidden="true" style={a.image ? { backgroundImage: `url('${a.image}')` } : undefined} />
                      <span className="flex flex-col gap-[5px] min-w-0">
                        <span className="font-heading font-extrabold text-[length:.68rem] tracking-[.06em] uppercase text-[color:var(--asp-accent-ink)]">{a.category}</span>
                        <span className="font-heading font-bold text-[length:.92rem] text-navy leading-[1.32]">{a.title}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="mt-[20px]">
                  <Link href="/medias" className="text-left text-[color:var(--asp-accent-ink)] p-0 font-heading font-bold text-[length:.82rem] flex items-center gap-[6px] no-underline">
                    Voir tous les médias <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      {mobileOpen && <MobileMenu data={data} onClose={() => setMobileOpen(false)} />}
    </>
  );
}
