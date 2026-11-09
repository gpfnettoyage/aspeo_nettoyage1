import { Fragment } from 'react';

/** Affiche un texte en conservant les retours à la ligne saisis dans l'administration. */
export function Multiline({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return <>{lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{l}</Fragment>)}</>;
}
