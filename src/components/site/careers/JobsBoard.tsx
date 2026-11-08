'use client';

import { useMemo, useState } from 'react';
import ApplicationForm from './ApplicationForm';

export interface JobView { id: string; slug: string; title: string; contractType: string | null; location: string | null; hours: string | null; summary: string | null; missions: string | null; profile: string | null; conditions: string | null }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Liste des offres (recherche, détail dépliable, candidature en ligne). */
export default function JobsBoard({ jobs, email }: { jobs: JobView[]; email: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const list = useMemo(() => {
    const q = norm(query.trim());
    return q ? jobs.filter((j) => norm(`${j.title} ${j.location ?? ''} ${j.contractType ?? ''} ${j.summary ?? ''}`).includes(q)) : jobs;
  }, [jobs, query]);

  return (
    <>
      <label className="flex items-center gap-[10px] bg-white [border:1px_solid_#c9d6ea] p-[6px_6px_6px_16px] mb-[22px]">
        <svg className="flex-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a97a8" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <span className="sr-only">Rechercher une offre</span>
        <input type="search" className="flex-1 min-w-0 border-0 outline-none text-[length:1rem] text-navy p-[12px_0] bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Poste, ville…" />
      </label>
      <ul className="list-none p-0 m-0 flex flex-col gap-[12px]">
        {list.map((j) => {
          const isOpen = open === j.id;
          return (
            <li key={j.id} id={j.slug} className="[border:1px_solid_#dbe5f4] bg-white">
              <h3 className="m-0">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : j.id)} className="w-full text-left bg-transparent border-0 p-[20px_22px] cursor-pointer flex items-center justify-between gap-[16px]">
                  <span className="flex flex-col gap-[6px] min-w-0">
                    <span className="font-heading font-bold text-[length:1.12rem] text-navy">{j.title}</span>
                    <span className="flex flex-wrap gap-[8px] text-[length:.84rem] text-[color:#5b6878] font-normal">
                      {j.contractType && <span className="bg-[color:#EAF1FB] text-navy font-bold p-[4px_9px]">{j.contractType}</span>}
                      {j.location && <span className="p-[4px_0]">{j.location}</span>}
                      {j.hours && <span className="p-[4px_0]">· {j.hours}</span>}
                    </span>
                  </span>
                  <span className="flex-none w-[36px] h-[36px] [border:1.5px_solid_#06226D] text-navy flex items-center justify-center text-[length:1.2rem]" aria-hidden="true">{isOpen ? '–' : '+'}</span>
                </button>
              </h3>
              {isOpen && (
                <div className="p-[0_22px_24px] flex flex-col gap-[16px] [border-top:1px_solid_#eef2f7]">
                  {j.summary && <p className="text-[length:.98rem] leading-[1.7] text-[color:#42505f] m-[18px_0_0]">{j.summary}</p>}
                  {([['Vos missions', j.missions], ['Votre profil', j.profile], ['Conditions', j.conditions]] as const).filter(([, v]) => v).map(([t, v]) => (
                    <div key={t}>
                      <h4 className="font-heading font-bold text-[length:.98rem] text-navy m-[0_0_4px]">{t}</h4>
                      <p className="text-[length:.95rem] leading-[1.7] text-[color:#42505f] m-0">{v}</p>
                    </div>
                  ))}
                  {applying === j.id ? (
                    <div className="[border-top:1px_solid_#eef2f7] pt-[18px]"><ApplicationForm jobId={j.id} jobTitle={j.title} /></div>
                  ) : (
                    <button type="button" onClick={() => setApplying(j.id)} className="self-start inline-flex items-center gap-[10px] bg-[color:var(--asp-accent)] text-white border-0 p-[14px_24px] min-h-[48px] font-heading font-bold text-[length:.95rem] cursor-pointer">Postuler à cette offre →</button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {list.length === 0 && (
        <p className="text-[length:.96rem] text-[color:#42505f] m-[8px_0_0]" role="status">Aucune offre ne correspond. Envoyez-nous une candidature spontanée ci-dessous ou à <a className="text-[color:var(--asp-accent-ink)] font-bold" href={`mailto:${email}`}>{email}</a>.</p>
      )}
    </>
  );
}
