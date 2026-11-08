/** Gabarits d'e-mails (HTML sobre aux couleurs ASPEO + version texte). */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function layout(title: string, body: string, footer: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
<tr><td style="background:#06226D;padding:20px 28px;color:#fff;font-weight:bold;font-size:20px;letter-spacing:.5px">ASPEO <span style="display:inline-block;width:18px;height:4px;background:#FF5C00;vertical-align:middle;margin-left:6px"></span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;color:#06226D">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 28px;background:#EAF1FB;font-size:12px;color:#42505f">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

const rows = (pairs: [string, string | null | undefined][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:14px">${pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:8px 10px;border-bottom:1px solid #eef2f7;color:#5b6878;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:8px 10px;border-bottom:1px solid #eef2f7;color:#06226D;font-weight:bold;white-space:pre-wrap">${esc(v!)}</td></tr>`)
    .join('')}</table>`;
const textRows = (pairs: [string, string | null | undefined][]) => pairs.filter(([, v]) => v).map(([k, v]) => `${k} : ${v}`).join('\n');

export interface CompanyInfo { name: string; phone: string; email: string; address: string; website: string }

/** Notification interne : nouvelle demande de devis / contact. */
export function quoteNotification(d: { fields: [string, string | null | undefined][]; message: string; adminUrl: string; photos: string[] }) {
  const pairs = [...d.fields, ['Photos jointes', d.photos.length ? String(d.photos.length) : null] as [string, string | null]];
  const html = layout('Nouvelle demande de devis',
    `${rows(pairs)}<h2 style="font-size:15px;color:#06226D;margin:22px 0 8px">Besoin exprimé</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${esc(d.message)}</p>
     ${d.photos.length ? `<p style="font-size:13px;margin:18px 0 0">${d.photos.map((p, i) => `<a href="${esc(p)}" style="color:#FF5C00">Photo ${i + 1}</a>`).join(' · ')}</p>` : ''}
     <p style="margin:24px 0 0"><a href="${esc(d.adminUrl)}" style="display:inline-block;background:#FF5C00;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px">Ouvrir la demande dans l'administration</a></p>`,
    'Demande reçue via le formulaire du site. Répondre à cet e-mail écrit directement au demandeur.');
  const text = `Nouvelle demande de devis\n\n${textRows(pairs)}\n\nBesoin exprimé :\n${d.message}\n${d.photos.length ? `\nPhotos :\n${d.photos.join('\n')}\n` : ''}\nAdministration : ${d.adminUrl}`;
  return { html, text };
}

/** Accusé de réception envoyé au demandeur. */
export function quoteAcknowledgement(d: { firstName: string; recap: [string, string | null | undefined][]; company: CompanyInfo }) {
  const c = d.company;
  const html = layout(`Merci ${d.firstName}, votre demande est bien enregistrée`,
    `<p style="font-size:14px;line-height:1.6;margin:0 0 16px">Un conseiller ASPEO vous recontacte rapidement, par téléphone ou par e-mail, pour préciser votre besoin et organiser une visite si nécessaire. Votre devis est gratuit et sans engagement.</p>
     ${rows(d.recap)}
     <h2 style="font-size:15px;color:#06226D;margin:22px 0 8px">Et maintenant ?</h2>
     <ol style="font-size:14px;line-height:1.6;margin:0;padding-left:20px"><li>Étude de votre demande</li><li>Prise de contact rapide</li><li>Votre devis personnalisé, gratuit et sans engagement</li></ol>
     <p style="font-size:14px;margin:20px 0 0">Une question d'ici là ? <a href="tel:${esc(c.phone.replace(/\s/g, ''))}" style="color:#FF5C00;font-weight:bold">${esc(c.phone)}</a></p>`,
    `${esc(c.name)} · ${esc(c.address)} · <a href="${esc(c.website)}" style="color:#06226D">${esc(c.website.replace(/^https?:\/\//, ''))}</a><br>Cet e-mail confirme la réception de votre demande ; aucun message commercial ne vous sera envoyé.`);
  const text = `Merci ${d.firstName}, votre demande est bien enregistrée.\n\nUn conseiller ASPEO vous recontacte rapidement.\n\n${textRows(d.recap)}\n\nUne question ? ${c.phone}\n\n${c.name} — ${c.address}`;
  return { html, text };
}

/** Notification interne : candidature. */
export function applicationNotification(d: { fields: [string, string | null | undefined][]; message: string | null; adminUrl: string; cvUrl: string | null }) {
  const html = layout('Nouvelle candidature',
    `${rows(d.fields)}${d.message ? `<h2 style="font-size:15px;color:#06226D;margin:22px 0 8px">Message</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${esc(d.message)}</p>` : ''}
     ${d.cvUrl ? `<p style="font-size:14px;margin:18px 0 0"><a href="${esc(d.cvUrl)}" style="color:#FF5C00;font-weight:bold">Télécharger le CV</a></p>` : ''}
     <p style="margin:24px 0 0"><a href="${esc(d.adminUrl)}" style="display:inline-block;background:#FF5C00;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px">Voir la candidature</a></p>`,
    'Candidature reçue via la page « Nous rejoindre ».');
  return { html, text: `Nouvelle candidature\n\n${textRows(d.fields)}\n\n${d.message ?? ''}\n${d.cvUrl ? `CV : ${d.cvUrl}\n` : ''}Administration : ${d.adminUrl}` };
}

/** Accusé de réception candidat. */
export function applicationAcknowledgement(d: { firstName: string; jobTitle: string | null; company: CompanyInfo }) {
  const c = d.company;
  const what = d.jobTitle ? `votre candidature au poste « ${d.jobTitle} »` : 'votre candidature spontanée';
  const html = layout(`Merci ${d.firstName}`, `<p style="font-size:14px;line-height:1.6;margin:0">Nous avons bien reçu ${esc(what)}. Notre équipe l'étudie avec attention et revient vers vous si votre profil correspond à nos besoins.</p>`, `${esc(c.name)} · ${esc(c.address)}`);
  return { html, text: `Merci ${d.firstName}, nous avons bien reçu ${what}.\n\n${c.name}` };
}
