import Link from 'next/link';
import type { SettingsMap } from '@/lib/site/settings-defaults';
import { FacebookIcon, InstagramIcon, LinkedinIcon } from '@/components/site/ui/icons';
import CookieSettingsButton from './CookieSettingsButton';

interface FooterProps {
  settings: Pick<SettingsMap, 'company' | 'identity' | 'navigation'>;
  services: { title: string; href: string }[];
}

const deskLink = 'text-left p-[8px_0] m-[-6px_0] text-[color:rgba(255,255,255,.62)] font-body text-[length:.9rem] no-underline [transition:color_.2s] hover:text-white';
const mobLink = 'text-left p-[10px_0] min-h-[44px] text-white font-body text-[length:1.05rem] no-underline flex items-center';
const h3Desk = 'font-heading font-extrabold text-[length:.9rem] tracking-[.08em] uppercase text-white m-[0_0_18px]';
const h3Mob = 'font-heading font-extrabold text-[length:1.3rem] tracking-[.02em] uppercase text-white m-[0_0_22px] leading-[1.2]';

export default function SiteFooter({ settings, services }: FooterProps) {
  const { company, identity, navigation } = settings;
  const year = new Date().getFullYear();
  const companyLinks = navigation.companyLinks.filter((l) => l.visible);
  const legalLinks = navigation.legalLinks.filter((l) => l.visible);
  // Pied de page mobile : ordre de la maquette (Accueil, Mentions, Contact, Cookies, Confidentialité, CGU),
  // les liens ajoutés dans l'administration se placent à la suite.
  const MOBILE_ORDER = ['/', '/mentions-legales', '/contact', '/politique-des-cookies', '/politique-de-confidentialite', '/conditions-generales-d-utilisation'];
  const rank = (href: string) => { const i = MOBILE_ORDER.indexOf(href); return i < 0 ? MOBILE_ORDER.length : i; };
  const mobileLegal = [{ label: 'Accueil', href: '/' }, ...legalLinks, { label: 'Contact', href: '/contact' }]
    .filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i)
    .map((l, i) => ({ ...l, i }))
    .sort((a, b) => rank(a.href) - rank(b.href) || a.i - b.i);
  const socials = [
    { href: company.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: company.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
    { href: company.instagram, label: 'Instagram', Icon: InstagramIcon },
  ].filter((s) => s.href);
  const address = `${company.street}, ${company.postalCode} ${company.city}`;

  return (
    <>
      {/* Bureau */}
      <footer className="bg-navy text-[color:rgba(255,255,255,.85)] max-[1040px]:hidden" data-dark="">
        <div className="max-w-[1280px] m-[0_auto] p-[clamp(48px,6vw,76px)_clamp(20px,5vw,40px)_44px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[clamp(28px,4vw,44px)]">
          <div>
            <h2 className={h3Desk}>Nous contacter</h2>
            <address className="flex flex-col gap-[12px] text-[length:.9rem] leading-[1.55] not-italic">
              <div className="text-[color:rgba(255,255,255,.8)]">{company.street}<br />{company.postalCode} {company.city}, France</div>
              <a className="text-[color:rgba(255,255,255,.62)] no-underline [transition:color_.2s] inline-block p-[8px_0] m-[-6px_0] hover:text-white" href={`tel:${company.phoneIntl}`}>Tél : {company.phone}</a>
              <a className="text-[color:rgba(255,255,255,.62)] no-underline [transition:color_.2s] inline-block p-[8px_0] m-[-6px_0] hover:text-white" href={`mailto:${company.email}`}>{company.email}</a>
              <div className="text-[color:rgba(255,255,255,.62)] mt-[2px]"><span className="text-white font-semibold">Horaires</span><br />{company.hoursShort}</div>
            </address>
            <Link href="/contact" className="mt-[22px] inline-flex items-center gap-[8px] [border:1.5px_solid_rgba(255,255,255,.35)] text-white p-[13px_22px] font-heading font-bold text-[length:.88rem] no-underline [transition:border-color_.2s,background_.2s] hover:[border-color:var(--asp-accent-ink)] hover:bg-[color:var(--asp-accent)]">
              Contacter ASPEO <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div>
            <h2 className={h3Desk}>Propreté &amp; Services</h2>
            <div className="flex flex-col gap-[11px]">
              {services.map((s) => (
                <Link key={s.href} href={s.href} className={`${deskLink} leading-[1.35] flex gap-[9px]`}>
                  <span className="flex-none" aria-hidden="true">—</span>{s.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className={h3Desk}>Entreprise</h2>
            <div className="flex flex-col gap-[11px]">
              {companyLinks.map((l) => <Link key={l.href} href={l.href} className={`${deskLink} leading-[normal]`}>{l.label}</Link>)}
            </div>
          </div>
          <div>
            <h2 className={`${h3Desk} leading-[1.35]`}>Suivez ASPEO sur les réseaux sociaux</h2>
            <div className="flex gap-[10px] items-center">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} className="w-[44px] h-[44px] flex-none bg-[color:rgba(255,255,255,.08)] flex items-center justify-center text-white no-underline [transition:background_.2s] hover:bg-[color:var(--asp-accent)]" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                  <Icon />
                </a>
              ))}
            </div>
            <img className="w-full max-w-[420px] h-auto block mt-[24px]" src={identity.logoWhite} alt="ASPEO Nettoyage" width={420} height={108} loading="lazy" />
          </div>
        </div>
        <div className="[border-top:1px_solid_rgba(255,255,255,.1)]">
          <div className="max-w-[1280px] m-[0_auto] p-[20px_clamp(20px,5vw,40px)] flex flex-wrap gap-[14px] items-center justify-between text-[length:.82rem]">
            <span className="text-[color:rgba(255,255,255,.55)]">© {year} {company.name}. Tous droits réservés.</span>
            <nav className="flex flex-wrap gap-[18px]" aria-label="Informations légales">
              {legalLinks.map((l) => (
                <Link key={l.href} href={l.href} className="p-[8px_4px] m-[-6px_-4px] text-[color:rgba(255,255,255,.55)] no-underline [transition:color_.2s] hover:text-white">{l.label}</Link>
              ))}
              <CookieSettingsButton className="p-[8px_4px] m-[-6px_-4px] text-[length:.82rem] font-body text-[color:rgba(255,255,255,.55)] [transition:color_.2s] hover:text-white" />
            </nav>
          </div>
        </div>
      </footer>

      {/* Mobile et tablette */}
      <footer className="bg-navy text-white min-[1041px]:hidden" data-ft-m="" data-dark="">
        <div className="p-[52px_22px_40px]">
          <h2 className={h3Mob}>Nous contacter</h2>
          <p className="m-[0_0_16px] text-[length:1.05rem] leading-[1.5]">Tél. : <a className="text-white underline [text-underline-offset:4px]" href={`tel:${company.phoneIntl}`}>{company.phone}</a></p>
          <p className="m-[0_0_16px] text-[length:1.05rem] leading-[1.5]"><a className="text-white underline [text-underline-offset:4px]" href={`mailto:${company.email}`}>{company.email}</a></p>
          <p className="m-0 text-[length:1.05rem] leading-[1.5]"><span className="[border-bottom:1px_dotted_rgba(255,255,255,.7)]">{address} - France</span></p>
          <p className="m-[6px_0_0] text-[length:.95rem] leading-[1.5] text-[color:rgba(255,255,255,.75)]">{company.hoursShort}</p>
          <Link href="/contact" className="mt-[28px] w-full flex items-center justify-center [border:1.5px_solid_#fff] text-white p-[16px] min-h-[54px] font-body text-[length:1.05rem] no-underline" data-ft-btn="">Contacter ASPEO</Link>
        </div>
        <div className="[border-top:1px_solid_rgba(255,255,255,.16)] p-[44px_22px_36px]">
          <h2 className={h3Mob}>ASPEO</h2>
          <div className="flex flex-col">
            {companyLinks.filter((l) => l.href !== '/medias/presse').map((l) => <Link key={l.href} href={l.href} className={mobLink}>{l.label}</Link>)}
          </div>
          <div className="mt-[22px] text-[length:1.05rem]">Nos services</div>
          <ul className="list-none m-[6px_0_0] p-[0_0_0_18px] flex flex-col">
            {services.map((s) => (
              <li key={s.href} className="flex items-center gap-[12px]">
                <span className="w-[4px] h-[4px] rounded-full bg-white flex-none" aria-hidden="true" />
                <Link href={s.href} className={`${mobLink} text-[length:1.02rem] leading-[1.35]`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="[border-top:1px_solid_rgba(255,255,255,.16)] p-[44px_22px_40px]">
          <h2 className={h3Mob}>Suivez ASPEO sur les réseaux sociaux</h2>
          <div className="flex gap-[22px]">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} className="w-[48px] h-[48px] rounded-full bg-white text-navy flex items-center justify-center no-underline" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                <Icon size={label === 'LinkedIn' ? 20 : 22} />
              </a>
            ))}
          </div>
          <img className="w-full max-w-[340px] h-auto block mt-[36px]" src={identity.logoWhite} alt="ASPEO Nettoyage" width={340} height={88} loading="lazy" />
        </div>
        <div className="[border-top:1px_solid_rgba(255,255,255,.16)] p-[26px_22px_36px] text-center">
          <nav className="flex flex-wrap justify-center gap-x-[22px]" aria-label="Informations légales">
            {mobileLegal.map((l) => (
              <Link key={l.href} href={l.href} className="p-[10px_4px] min-h-[44px] text-white font-body text-[length:.98rem] no-underline inline-flex items-center">{l.label}</Link>
            ))}
            <CookieSettingsButton className="p-[10px_4px] min-h-[44px] text-white font-body text-[length:.98rem] inline-flex items-center" />
          </nav>
          <p className="m-[18px_0_0] text-[length:.85rem] text-[color:rgba(255,255,255,.7)]">© {year} {company.name}. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}
