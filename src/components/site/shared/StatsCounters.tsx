'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat { value: number; suffix: string; label: string }

/** Bandeau de chiffres clés animés à l'apparition (valeurs administrables dans Réglages). */
export default function StatsCounters({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); return; }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1400);
        setProgress(1 - Math.pow(1 - p, 3));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={ref} className="p-[clamp(48px,7vw,80px)_0] bg-[color:var(--asp-accent)] text-white" aria-label="Chiffres clés">
      <div className="max-w-[1280px] m-[0_auto] p-[0_clamp(20px,5vw,40px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[clamp(24px,4vw,48px)] text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-heading font-extrabold text-[length:clamp(3rem,7vw,5rem)] leading-none tracking-[-.02em]" data-big-number="">
              <span aria-hidden="true">{Math.round(s.value * progress)}{s.suffix}</span>
              <span className="sr-only">{s.value}{s.suffix}</span>
            </div>
            <div className="mt-[10px] font-heading font-bold text-[length:.9rem] tracking-[.12em] uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
