import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Envoi d'e-mails transactionnels (notifications de devis, accusés de réception, candidatures).
 *
 * Paramètres (variables d'environnement) :
 * - SMTP_HOST (défaut : ssl0.ovh.net, serveur du site actuel), SMTP_PORT (défaut 465), SMTP_SECURE (défaut true)
 * - SMTP_USER / SMTP_PASS (à défaut : OVH_EMAIL_USER / OVH_EMAIL_PASS, déjà utilisés par le site actuel)
 * - MAIL_FROM (défaut : l'adresse SMTP_USER)
 * Sans identifiants, aucun e-mail n'est envoyé : la demande reste enregistrée en base et
 * visible dans l'administration, et la raison est consignée.
 */
interface MailInput {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}
export type MailResult = { sent: true } | { sent: false; reason: string };

const user = () => process.env.SMTP_USER || process.env.OVH_EMAIL_USER || '';
const pass = () => process.env.SMTP_PASS || process.env.OVH_EMAIL_PASS || '';

let transporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!user() || !pass()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'ssl0.ovh.net',
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user: user(), pass: pass() },
    });
  }
  return transporter;
}

export const isMailConfigured = () => !!getTransporter();

export async function sendMail({ to, subject, text, html, replyTo, fromName = 'ASPEO Nettoyage', attachments }: MailInput): Promise<MailResult> {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mail] SMTP non configuré : e-mail « ${subject} » non envoyé.`);
    return { sent: false, reason: 'smtp-non-configure' };
  }
  try {
    await t.sendMail({ from: { name: fromName, address: process.env.MAIL_FROM || user() }, to, subject, text, html, replyTo, attachments });
    return { sent: true };
  } catch (error) {
    console.error(`[mail] échec d'envoi « ${subject} »`, error);
    return { sent: false, reason: 'echec-envoi' };
  }
}
