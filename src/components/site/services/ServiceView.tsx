import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/site/shared/PageHero';
import Breadcrumbs from '@/components/site/shared/Breadcrumbs';
import DevisCard from '@/components/site/shared/DevisCard';
import Disclosure from '@/components/site/ui/Disclosure';
import PlusCarousel from './PlusCarousel';
import { ButtonLink, Container, Stars } from '@/components/site/ui/primitives';
import { urls } from '@/lib/site/urls';
import type { ArticleSummary, ServiceDetail, ServiceSummary } from '@/lib/site/types';

interface Props {
  service: ServiceDetail;
  related: ServiceSummary[];
  articles: ArticleSummary[];
  testimonial: { quote: string; author: string; context: string | null } | null;
  commitments: { t: string; d: string }[];
}

const lowerFirst = (x: string) => (/^[A-ZÉ][a-zéèêàâîôûç]/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x);
const joinList = (l: string[], last: string) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ${last} ${l[l.length - 1]}` : l[0] ?? '');
const pad = (n: number) => String(n).padStart(2, '0');

const H2Bar = ({ children, className = 'mb-[18px]', size = 'md' }: { children: React.ReactNode; className?: string; size?: 'sm' | 'md' }) => (
  <div className={`flex items-center gap-[14px] ${className}`}>
    <span className="w-[4px] self-stretch bg-[color:var(--asp-accent)] flex-none min-h-[24px]" aria-hidden="true" />
    <h2 className={`font-heading font-extrabold tracking-[-.015em] text-navy m-0 ${size === 'sm' ? 'text-[length:clamp(1.3rem,2.4vw,1.8rem)]' : 'text-[length:clamp(1.45rem,2.6vw,2.05rem)]'}`}>{children}</h2>
  </div>
);
const Kicker = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-[12px] mb-[14px]">
    <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
    <span className="font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase text-navy">{children}</span>
  </div>
);
const Check = ({ round = true }: { round?: boolean }) => (
  <span className={`flex-none w-[28px] h-[28px] ${round ? 'rounded-full' : ''} bg-[color:var(--asp-accent)] text-white flex items-center justify-center text-[length:.9rem]`} aria-hidden="true">✓</span>
);
const Chip = ({ children }: { children: string }) => <li className="[border:1px_solid_#dfe5ec] p-[8px_13px] text-[length:.86rem] text-[color:#334155] whitespace-nowrap">{children}</li>;

/** Fiche service, fidèle à la maquette « Service ». */
export default function ServiceView({ service, related, articles, testimonial, commitments }: Props) {
  const c = service.content;
  const showTiers = !!c.showPricing && (c.pricingTiers?.length ?? 0) > 0;
  const isPro = service.pole === 'professionnel';
  const [heroImg, expImg, whyImg] = [c.images?.[0] ?? null, c.images?.[1] ?? c.images?.[0] ?? null, c.images?.[2] ?? c.images?.[0] ?? null];
  const includes = c.includes ?? [];
  const audience = (c.audience ?? []).map(lowerFirst);
  const notIncluded = (c.notIncluded ?? []).map(lowerFirst);
  const zone = 'Loire, Rhône et Monts du Lyonnais';
  const expertiseGroups = [
    { label: 'Compétences & normes appliquées', items: [includes[0], "Personnel formé aux protocoles d'hygiène et de sécurité en vigueur", 'Habilitations et équipements de protection individuelle adaptés', includes[1]] },
    { label: 'Matériel & équipements adaptés', items: [includes[2], 'Matériel professionnel entretenu et renouvelé régulièrement', 'Produits sélectionnés selon la nature des surfaces traitées', includes[3]] },
    { label: "Couverture de l'intervention", items: [includes[4], `Intervention sur l'ensemble de nos zones : ${zone}`, 'Équipe dimensionnée selon la taille et la complexité du site', includes[5]] },
    { label: 'Reporting & suivi', items: ['Compte-rendu détaillé remis après chaque intervention', 'Photos avant/après disponibles sur demande', 'Interlocuteur dédié du devis à la restitution', 'Ajustement du contrat selon vos retours'] },
  ].map((g) => ({ ...g, items: g.items.filter((x): x is string => !!x) }));
  const short = service.short || service.title;
  const tagline = c.tagline || service.short;
  const intro = [c.problem, c.risks].filter(Boolean).join(' ') || c.introText || c.descriptions?.[0] || '';
  const beforeImage = typeof c.beforeImage === 'string' ? c.beforeImage : null;
  const afterImage = typeof c.afterImage === 'string' ? c.afterImage : null;

  return (
    <main>
      <PageHero
        eyebrow={isPro ? 'Nettoyage Professionnel' : 'Interventions Spécialisées'}
        title={service.title}
        titleClassName="font-heading font-extrabold text-[length:clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-.02em] m-[16px_0_0] max-w-[600px] [text-shadow:0_2px_30px_rgba(0,0,0,.3)]"
        text={tagline ? <span className="block font-heading font-bold text-[length:clamp(1.02rem,1.5vw,1.2rem)] leading-[1.4] text-white max-w-[520px]">{tagline}</span> : undefined}
        image={heroImg}
        imageAlt={service.title}
        actions={<ButtonLink href={urls.contact(service.slug)} arrow={false} className="p-[15px_26px] text-[length:.94rem]">Une question, un projet ? Contactez-nous !</ButtonLink>}
        aside={<DevisCard />}
      />
      <Container className="pt-[14px]">
        {/* Maquette : trois niveaux (l'activité reste dans le fil d'Ariane des données structurées). */}
        <Breadcrumbs items={[{ name: 'Propreté & services', href: urls.services() }, { name: service.title }]} />
      </Container>

      {(audience.length > 0 || notIncluded.length > 0 || c.delay) && (
        <section className="p-[clamp(36px,5vw,56px)_0_0] bg-white">
          <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[1px] bg-[color:#dbe5f4] [border:1px_solid_#dbe5f4]" data-sepgrid="">
            {audience.length > 0 && (
              <div className="bg-white p-[26px_24px]">
                <h2 className="font-heading font-bold text-[length:.78rem] tracking-[.14em] uppercase text-[color:var(--asp-accent-ink)] m-[0_0_12px]">Pour qui ?</h2>
                <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-0">Ce service s&apos;adresse principalement aux {joinList(audience, 'et')}. Chaque intervention est ensuite adaptée à vos locaux, à votre activité et à vos horaires.</p>
              </div>
            )}
            {notIncluded.length > 0 && (
              <div className="bg-white p-[26px_24px]">
                <h2 className="font-heading font-bold text-[length:.78rem] tracking-[.14em] uppercase text-[color:var(--asp-accent-ink)] m-[0_0_12px]">Non inclus</h2>
                <p className="text-[length:1rem] leading-[1.7] text-[color:#42505f] m-0">Pour que le devis soit clair dès le départ, certaines prestations n&apos;en font pas partie : {joinList(notIncluded, 'ou')}. Si vous en avez besoin, nous vous orientons vers un partenaire ou les chiffrons à part.</p>
                <p className="text-[length:.86rem] text-[color:#5b6878] m-[14px_0_0]">Ce qui est inclus est détaillé plus bas, dans « Détails des services ».</p>
              </div>
            )}
            {c.delay && (
              <div className="bg-[color:#EAF1FB] p-[26px_24px] flex flex-col gap-[18px]">
                <div>
                  <h2 className="font-heading font-bold text-[length:.78rem] tracking-[.14em] uppercase text-[color:var(--asp-accent-ink)] m-[0_0_12px]">Délais</h2>
                  <p className="font-heading font-bold text-[length:1.05rem] leading-[1.45] text-navy m-0">{c.delay}</p>
                </div>
                {testimonial && (
                  <figure className="m-0 [border-top:1px_solid_#c9d6ea] pt-[16px]">
                    <Stars className="text-[length:.9rem]" />
                    <blockquote className="m-[6px_0_8px] text-[length:.95rem] leading-[1.55] text-navy italic">« {testimonial.quote} »</blockquote>
                    <figcaption className="text-[length:.84rem] text-[color:#5b6878]">{testimonial.author}{testimonial.context ? ` · ${testimonial.context}` : ''}</figcaption>
                  </figure>
                )}
              </div>
            )}
          </Container>
        </section>
      )}

      <section className="p-[clamp(40px,6vw,64px)_0_clamp(48px,7vw,72px)] bg-white">
        <Container>
          <div className="max-w-[900px]">
            {intro && <p className="text-[length:1.02rem] leading-[1.8] text-[color:#42505f] m-[0_0_34px]">{intro}</p>}
            <h2 className="font-heading font-extrabold text-[length:clamp(1.3rem,2.4vw,1.8rem)] tracking-[-.015em] text-navy m-[0_0_16px]">Notre expertise en {lowerFirst(short)}</h2>
            {c.intervention && <p className="text-[length:1.02rem] leading-[1.8] text-[color:#42505f] m-[0_0_36px]">{c.intervention}</p>}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[0_40px]">
            {expertiseGroups.map((g, i) => (
              <div key={g.label} className="p-[24px_0_8px] [border-top:1px_solid_#eef2f7]">
                <div className="flex items-start gap-[14px] mb-[14px]">
                  <span className="flex-none font-heading font-extrabold text-[length:1.3rem] text-[color:#dfe4ea] leading-none mt-[2px]" aria-hidden="true">{pad(i + 1)}</span>
                  <h3 className="font-heading font-extrabold text-[length:1.02rem] leading-[1.35] text-navy m-0 pt-[2px]">{g.label}</h3>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col">
                  {g.items.map((it) => <li key={it} className="text-[length:.92rem] leading-[1.5] text-navy font-semibold m-0 p-[12px_0] [border-top:1px_solid_#f1f4f8]">{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          {expImg && (
            <div className="relative w-full aspect-[21/9] m-[56px_0_8px] overflow-hidden bg-[color:#dfe7f2]">
              <Image src={expImg} alt={`${service.title} — intervention ASPEO`} fill sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" />
            </div>
          )}
        </Container>
      </section>

      {(c.longform?.length ?? 0) > 0 && (
        <section className="p-[clamp(24px,4vw,40px)_0_clamp(56px,8vw,88px)] bg-white">
          <Container>
            <div className="max-w-[900px] flex flex-col gap-[40px]">
              {c.longform!.map((b) => (
                <div key={b.title}>
                  <H2Bar className="mb-[14px]"><span data-h2-inherit="" className="text-[length:clamp(1.25rem,2.2vw,1.6rem)]">{b.title}</span></H2Bar>
                  <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-0">{b.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {!isPro && (c.firstSteps?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] min-h-[520px]" data-split-min="">
            <div className="p-[clamp(40px,6vw,72px)_clamp(24px,5vw,56px)] flex flex-col justify-center">
              <Kicker>Avant notre intervention</Kicker>
              <h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.6vw,2rem)] tracking-[-.015em] text-navy m-[0_0_22px] max-w-[460px]">Ce qu&apos;il faut prévoir</h2>
              <ol className="list-none p-0 m-0 flex flex-col gap-[18px]">
                {c.firstSteps!.map((step, i) => (
                  <li key={i} className="flex gap-[14px] items-start">
                    <span className="flex-none w-[28px] h-[28px] rounded-full bg-[color:var(--asp-accent)] text-white flex items-center justify-center font-heading font-extrabold text-[length:.85rem]" aria-hidden="true">{i + 1}</span>
                    <p className="text-[length:.98rem] leading-[1.6] text-[color:#42505f] m-[4px_0_0]">{step}</p>
                  </li>
                ))}
              </ol>
              {c.whyFast && (
                <div className="mt-[26px] bg-navy p-[20px_22px] [border-left:3px_solid_var(--asp-accent)]">
                  <p className="text-[length:.9rem] leading-[1.65] text-[color:rgba(255,255,255,.9)] m-0"><strong className="text-white">Ce qu&apos;il faut prendre en compte :</strong> {c.whyFast}</p>
                </div>
              )}
            </div>
            <div className="relative min-h-[320px] bg-[color:#dfe7f2]">{heroImg && <Image src={heroImg} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" />}</div>
          </div>
        </section>
      )}
      {!isPro && (c.approach?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] min-h-[520px]" data-split-min="">
            <div className="relative [order:-1] min-h-[320px] bg-[color:#dfe7f2]">{whyImg && <Image src={whyImg} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" />}</div>
            <div className="p-[clamp(40px,6vw,72px)_clamp(24px,5vw,56px)] flex flex-col justify-center">
              <Kicker>Notre réponse</Kicker>
              <h2 className="font-heading font-extrabold text-[length:clamp(1.4rem,2.6vw,2rem)] tracking-[-.015em] text-navy m-[0_0_22px] max-w-[460px]">Comment ASPEO règle le problème</h2>
              <ul className="list-none p-0 m-0 flex flex-col gap-[18px]">
                {c.approach!.map((m) => (
                  <li key={m.title} className="flex gap-[14px] items-start"><Check /><p className="text-[length:.98rem] leading-[1.6] text-[color:#42505f] m-[4px_0_0]"><strong className="text-navy">{m.title}</strong> — {m.text}</p></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#f8fafc] [border-top:1px_solid_#eef2f7] [border-bottom:1px_solid_#eef2f7]">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,64px)] items-start justify-start [justify-items:start]">
          <div className="w-full">
            {isPro ? (
              <>
                <H2Bar>Pourquoi choisir ASPEO</H2Bar>
                <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-[0_0_24px]">Une équipe formée, un interlocuteur unique et un engagement de résultat à chaque intervention.</p>
                <ul className="list-none p-0 m-0 flex flex-col gap-[20px]">
                  {commitments.map((it) => <li key={it.t} className="flex gap-[14px] items-start"><Check round={false} /><p className="text-[length:.98rem] leading-[1.65] text-[color:#42505f] m-[2px_0_0]"><strong className="text-navy">{it.t}</strong> — {it.d}</p></li>)}
                </ul>
                {(c.spaces?.length ?? 0) > 0 && (
                  <div className="mt-[34px] [border:1px_solid_#eef2f7] p-[22px_24px] bg-white">
                    <h3 className="font-heading font-extrabold text-[length:1.05rem] text-navy m-[0_0_16px]">Espaces concernés</h3>
                    <ul className="list-none p-0 m-0 flex flex-wrap gap-[9px]">{c.spaces!.map((x) => <Chip key={x}>{x}</Chip>)}</ul>
                  </div>
                )}
                {(c.sectors?.length ?? 0) > 0 && (
                  <div className="mt-[20px] [border:1px_solid_#eef2f7] p-[22px_24px] bg-white">
                    <h3 className="font-heading font-extrabold text-[length:1.05rem] text-navy m-[0_0_16px]">Secteurs d&apos;application</h3>
                    <ul className="list-none p-0 m-0 flex flex-wrap gap-[9px]">{c.sectors!.map((x) => <Chip key={x}>{x}</Chip>)}</ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <H2Bar>Pourquoi cette situation demande une expertise</H2Bar>
                {c.problem && <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-[0_0_16px]">{c.problem}</p>}
                {c.risks && <p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-[0_0_24px]">{c.risks}</p>}
                {c.intervention && (<><h3 className="font-heading font-bold text-[length:1.14rem] text-navy m-[0_0_10px]">Notre intervention</h3><p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-[0_0_24px]">{c.intervention}</p></>)}
                {c.benefits && (<><h3 className="font-heading font-bold text-[length:1.14rem] text-navy m-[0_0_10px]">Ce que vous y gagnez</h3><p className="text-[length:1.02rem] leading-[1.85] text-[color:#42505f] m-0">{c.benefits}</p></>)}
              </>
            )}
          </div>
          <div className="max-w-[500px] w-full [justify-self:end]">
            <h2 className="font-heading font-extrabold text-[length:clamp(1.3rem,2.2vw,1.7rem)] tracking-[-.015em] m-[0_0_18px] text-center">
              <span className="text-navy">Les </span><span className="text-[color:var(--asp-accent-ink)]">+</span><span className="text-[color:#9aa6b5] font-semibold"> ASPEO</span>
            </h2>
            <PlusCarousel items={c.plus ?? []} image={expImg} />
            {includes.length > 0 && (
              <div className="mt-[32px]">
                <h3 className="font-heading font-extrabold text-[length:.86rem] tracking-[.12em] uppercase text-navy m-[0_0_14px]">Nos services</h3>
                <ul className="list-none p-0 m-0 flex flex-col gap-[1px] bg-[color:#eef2f7] [border:1px_solid_#eef2f7] overflow-hidden">
                  {includes.map((it) => (
                    <li key={it} className="bg-white p-[14px_18px] flex items-center gap-[12px]">
                      <span className="flex-none w-[18px] h-[18px] rounded-full bg-[color:var(--asp-accent)] text-white flex items-center justify-center text-[length:.65rem] font-bold" aria-hidden="true">✓</span>
                      <span className="text-[length:.92rem] leading-[1.5] text-[color:#334155]">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </section>

      {(c.process?.length ?? 0) > 0 && (
        <section className="p-[clamp(56px,8vw,104px)_0] bg-navy text-white" data-dark="">
          <Container>
            <div className="inline-flex items-center gap-[12px]">
              <span className="w-[30px] h-[3px] bg-[color:var(--asp-accent)] block" aria-hidden="true" />
              {/* Maquette : libellé non visible (bleu sur bleu) ; la barre orange et l'espacement sont conservés. */}
              <span className="font-heading font-bold text-[length:.8rem] tracking-[.16em] uppercase invisible" aria-hidden="true">Notre méthode</span>
            </div>
            <h2 className="font-heading font-extrabold text-[length:clamp(1.45rem,2.6vw,2.05rem)] tracking-[-.015em] m-[14px_0_32px]" data-light="">Notre méthode d&apos;intervention</h2>
            <ol className="list-none p-0 m-0 flex flex-col">
              {c.process!.map((st, i) => (
                <li key={i} className="[border-top:1px_solid_rgba(255,255,255,.12)] p-[22px_0] flex gap-[clamp(16px,3vw,32px)] items-start flex-wrap">
                  <div className="flex-none w-[42px] h-[42px] bg-[color:var(--asp-accent)] text-white flex items-center justify-center font-heading font-extrabold text-[length:.95rem]" aria-hidden="true">{pad(i + 1)}</div>
                  <div className="flex-[1_1_300px] min-w-[min(100%,240px)]">
                    <h3 className="font-heading font-bold text-[length:1.12rem] m-[2px_0_6px]">{st.title}</h3>
                    <p className="text-[length:.97rem] leading-[1.65] text-[color:rgba(255,255,255,.8)] m-0">{st.text ?? (st as { description?: string }).description}</p>
                  </div>
                  {st.duration && <div className="flex-none bg-[color:rgba(255,255,255,.08)] [border:1px_solid_rgba(255,255,255,.16)] p-[8px_14px] font-heading font-bold text-[length:.8rem] tracking-[.05em]">{st.duration}</div>}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {includes.length > 0 && (
        <section className="p-[clamp(40px,6vw,64px)_0_0] bg-white">
          <Container>
            <div className="max-w-[900px]">
              <H2Bar size="sm">Détails des services</H2Bar>
              <Disclosure variant="list" items={includes.map((t) => ({ title: t, content: <p className="m-0">Prestation incluse dans notre intervention standard pour {service.title}, sans supplément, réalisée par nos équipes formées et équipées pour ce type de mission.</p> }))} />
            </div>
          </Container>
        </section>
      )}

      {(c.guarantees?.length ?? 0) > 0 && (
        <section className="p-[clamp(40px,6vw,64px)_0_clamp(48px,7vw,72px)] bg-white">
          <Container>
            <H2Bar size="sm" className="mb-[22px]">Vos Garanties</H2Bar>
            <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]">
              {c.guarantees!.map((g, i) => (
                <li key={g} className="p-[22px_24px_22px_0] [border-top:1px_solid_#eef2f7] flex items-start gap-[14px]">
                  <span className="flex-none font-heading font-extrabold text-[length:1.3rem] text-[color:#dfe4ea] leading-none mt-[2px]" aria-hidden="true">{pad(i + 1)}</span>
                  <p className="text-[length:.92rem] leading-[1.5] text-navy font-semibold m-0 pt-[4px]">{g}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {beforeImage && afterImage && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
          <Container>
            <H2Bar className="mb-[28px]">Avant / après une intervention ASPEO</H2Bar>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[20px]">
              {[['Avant', beforeImage, 'bg-navy'], ['Après', afterImage, 'bg-[color:var(--asp-accent)]']].map(([label, src, bg]) => (
                <div key={label} className="relative overflow-hidden h-[320px] bg-[color:#dfe7f2]">
                  <Image src={src} alt={`${service.title} — ${label.toLowerCase()} intervention`} fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" />
                  <span className={`absolute top-[16px] left-[16px] ${bg} text-white font-heading font-bold text-[length:.78rem] tracking-[.06em] uppercase p-[6px_14px]`}>{label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Maquette : section toujours présente ; les fourchettes n'apparaissent qu'une fois validées (showPricing). */}
      {(
        <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#f8fafc] [border-top:1px_solid_#eef2f7] [border-bottom:1px_solid_#eef2f7]">
          <Container>
            <div className="flex flex-wrap justify-between items-end gap-[20px] m-[0_0_28px]">
              <H2Bar className="max-w-[600px]">Combien coûte {service.title} ?</H2Bar>
              <ButtonLink href={urls.contact(service.slug)} className="flex-none text-[length:.92rem]">Estimer mon devis</ButtonLink>
            </div>
            {showTiers && <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[1px] bg-[color:#eef2f7] [border:1px_solid_#eef2f7] overflow-hidden" data-sepgrid="">
              {c.pricingTiers!.map((t) => (
                <div key={t.name} className="bg-white p-[28px_26px] flex flex-col gap-[10px]">
                  <span className="font-heading font-bold text-[length:.85rem] tracking-[.06em] uppercase text-navy">{t.name}</span>
                  <span className="font-heading font-extrabold text-[length:1.5rem] text-navy">{t.min.toLocaleString('fr-FR')}–{t.max.toLocaleString('fr-FR')} €{t.unit}</span>
                  <p className="text-[length:.9rem] leading-[1.6] text-[color:#42505f] m-0">{t.text}</p>
                </div>
              ))}
            </div>}
            <p className="text-[length:.85rem] text-[color:#8a97a8] m-[16px_0_0]">{(showTiers && c.priceNote) || 'Fourchettes indicatives, hors dossier spécifique. Un devis précis est établi après diagnostic.'}</p>
          </Container>
        </section>
      )}

      {(related.length > 0 || articles.length > 0) && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-white">
          <Container>
            {related.length > 0 && (
              <>
                <H2Bar className="mb-[24px]">Services complémentaires</H2Bar>
                <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[20px]">
                  {related.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="group h-full text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-0 flex flex-col overflow-hidden no-underline [transition:transform_.2s_ease,box-shadow_.2s_ease] hover:[transform:translateY(-4px)] hover:shadow-[var(--shadow-card)]">
                        <div className="relative w-full h-[170px] overflow-hidden flex-none bg-navy">
                          {it.image && <Image src={it.image} alt="" fill sizes="300px" className="object-cover [transition:transform_.5s_ease] group-hover:[transform:scale(1.06)]" />}
                        </div>
                        <div className="p-[22px_22px_24px] flex flex-col gap-[8px] flex-1 [border-top:3px_solid_var(--asp-accent)]">
                          <h3 className="font-heading font-bold text-[length:1.08rem] leading-[1.3] text-navy m-0">{it.title}</h3>
                          <p className="text-[length:.9rem] leading-[1.6] text-[color:#42505f] m-0 flex-1">{it.tagline}</p>
                          <span className="inline-flex items-center gap-[8px] font-heading font-semibold text-[length:.85rem] text-[color:var(--asp-accent-ink)]">Découvrir ce service <span aria-hidden="true">→</span></span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {articles.length > 0 && (
              <div className="mt-[36px]">
                <h2 className="font-heading font-extrabold text-[length:.86rem] tracking-[.12em] uppercase text-navy m-[0_0_14px]">À lire sur ce sujet</h2>
                <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[14px]">
                  {articles.map((a) => (
                    <li key={a.href}>
                      <Link href={a.href} className="h-full text-left bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,.14)] p-0 flex items-stretch overflow-hidden no-underline [transition:transform_.2s_ease,box-shadow_.2s_ease] hover:[transform:translateY(-3px)] hover:shadow-[var(--shadow-card)]">
                        <div className="relative flex-none w-[104px] bg-[color:#dfe7f2]">{a.image && <Image src={a.image} alt="" fill sizes="104px" className="object-cover" />}</div>
                        <div className="p-[16px_18px] flex flex-col gap-[6px] flex-1 min-w-0">
                          <span className="self-start text-[length:.68rem] font-bold tracking-[.06em] uppercase text-white bg-[color:var(--asp-accent)] p-[3px_8px]">{a.category ?? 'Article'}</span>
                          <span className="font-heading font-bold text-[length:.94rem] leading-[1.35] text-navy">{a.title.length > 76 ? `${a.title.slice(0, 73)}…` : a.title}</span>
                          <span className="inline-flex items-center gap-[6px] font-heading font-semibold text-[length:.8rem] text-[color:var(--asp-accent-ink)] mt-auto">Lire l&apos;article <span aria-hidden="true">→</span></span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </section>
      )}

      {(c.faq?.length ?? 0) > 0 && (
        <section className="p-[clamp(56px,8vw,96px)_0] bg-[color:#f8fafc] [border-top:1px_solid_#eef2f7]">
          <Container className="grid grid-cols-[minmax(0,1fr)]">
            <H2Bar className="mb-[24px]">FAQ — {service.title}</H2Bar>
            <Disclosure items={c.faq!.map((f) => ({ title: f.question, content: <p className="m-0">{f.answer}</p> }))} defaultOpen={0} />
            <p className="text-[length:.98rem] leading-[1.7] text-[color:#42505f] m-[24px_0_0]">
              Une autre question ? <Link href={urls.contact(service.slug)} className="text-[color:var(--asp-accent-ink)] font-bold underline [text-underline-offset:3px]">Contactez notre équipe</Link> ou rapprochez-vous de <Link href={urls.zones()} className="text-[color:var(--asp-accent-ink)] font-bold underline [text-underline-offset:3px]">l&apos;agence ASPEO la plus proche</Link>.
            </p>
          </Container>
        </section>
      )}
    </main>
  );
}
