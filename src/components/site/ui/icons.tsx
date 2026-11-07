/** Icônes SVG de la maquette (traits 24×24, couleur héritée). */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, sw: number | string, rest: SVGProps<SVGSVGElement>) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...rest,
});

export const PhoneIcon = ({ size = 16, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.74a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const SearchIcon = ({ size = 17, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const ChevronDownIcon = ({ size = 14, strokeWidth = 2.5, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><polyline points="6 9 12 15 18 9" /></svg>
);
export const ChevronRightIcon = ({ size = 14, strokeWidth = 2.5, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><polyline points="9 6 15 12 9 18" /></svg>
);
export const MenuIcon = ({ size = 19, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CheckIcon = ({ size = 16, strokeWidth = 2.5, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><polyline points="20 6 9 17 4 12" /></svg>
);
export const MailIcon = ({ size = 16, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const PinIcon = ({ size = 16, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const ClockIcon = ({ size = 16, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const StarIcon = ({ size = 16, ...r }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...r}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
export const FacebookIcon = ({ size = 18, ...r }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...r}><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6 4.39 10.97 10.13 11.87v-8.4H7.08v-3.47h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.47h-2.8v8.4C19.61 23.04 24 18.07 24 12.07z" /></svg>
);
export const InstagramIcon = ({ size = 18, strokeWidth = 2, ...r }: P) => (
  <svg {...base(size, strokeWidth, r)}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" /></svg>
);
export const LinkedinIcon = ({ size = 18, ...r }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...r}><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
);
