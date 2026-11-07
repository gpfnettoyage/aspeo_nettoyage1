'use server';

import nodemailer from 'nodemailer';

// ============================================
// Email Configuration (OVH SMTP)
// ============================================
const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.OVH_EMAIL_USER,
    pass: process.env.OVH_EMAIL_PASS,
  },
});

// ============================================
// Security Email Templates
// ============================================

/**
 * Send device verification email with a 6-digit code
 */
export async function sendDeviceVerificationEmail(
  to: string,
  code: string,
  deviceInfo: { browser?: string; os?: string; ip?: string }
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Verification de connexion requise',
      text: `Bonjour,

Une tentative de connexion a ete detectee depuis un nouvel appareil.

Details de l'appareil :
- Navigateur : ${deviceInfo.browser || 'Inconnu'}
- Systeme : ${deviceInfo.os || 'Inconnu'}
- Adresse IP : ${deviceInfo.ip || 'Inconnue'}

Votre code de verification : ${code}

Ce code expire dans 10 minutes.

Si vous n'avez pas initie cette connexion, ignorez cet email et changez votre mot de passe immediatement.

L'equipe Aspeo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Verification de connexion requise</h2>
          <p>Une tentative de connexion a ete detectee depuis un nouvel appareil.</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Navigateur :</strong> ${deviceInfo.browser || 'Inconnu'}</p>
            <p style="margin: 5px 0;"><strong>Systeme :</strong> ${deviceInfo.os || 'Inconnu'}</p>
            <p style="margin: 5px 0;"><strong>Adresse IP :</strong> ${deviceInfo.ip || 'Inconnue'}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 10px;">Votre code de verification :</p>
            <div style="background: #007bff; color: white; padding: 20px 40px; font-size: 32px; letter-spacing: 8px; border-radius: 8px; display: inline-block;">
              ${code}
            </div>
          </div>

          <p style="color: #666; font-size: 14px;">Ce code expire dans 10 minutes.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            Si vous n'avez pas initie cette connexion, ignorez cet email et changez votre mot de passe immediatement.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send device verification email:', error);
    return false;
  }
}

/**
 * Send new device trusted notification
 */
export async function sendNewDeviceTrustedEmail(
  to: string,
  deviceInfo: { browser?: string; os?: string; ip?: string }
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Nouvel appareil approuve',
      text: `Bonjour,

Un nouvel appareil a ete ajoute a votre liste d'appareils de confiance.

Details de l'appareil :
- Navigateur : ${deviceInfo.browser || 'Inconnu'}
- Systeme : ${deviceInfo.os || 'Inconnu'}
- Adresse IP : ${deviceInfo.ip || 'Inconnue'}

Si vous n'avez pas effectue cette action, connectez-vous immediatement a votre compte et revoquez cet appareil.

L'equipe Aspeo`,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send new device trusted email:', error);
    return false;
  }
}

/**
 * Send session revoked notification
 */
export async function sendSessionRevokedEmail(
  to: string,
  deviceInfo: { browser?: string; os?: string; ip?: string },
  revokedAt: Date
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Session revoquee',
      text: `Bonjour,

Une session a ete revoquee de votre compte.

Details de la session :
- Navigateur : ${deviceInfo.browser || 'Inconnu'}
- Systeme : ${deviceInfo.os || 'Inconnu'}
- Adresse IP : ${deviceInfo.ip || 'Inconnue'}
- Date de revocation : ${revokedAt.toLocaleString('fr-FR')}

Si vous n'avez pas effectue cette action, changez votre mot de passe immediatement.

L'equipe Aspeo`,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send session revoked email:', error);
    return false;
  }
}

/**
 * Send backup codes used notification
 */
export async function sendBackupCodeUsedEmail(
  to: string,
  remainingCodes: number,
  ip?: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Code de secours utilise',
      text: `Bonjour,

Un code de secours a ete utilise pour acceder a votre compte.

${ip ? `Adresse IP : ${ip}` : ''}

Il vous reste ${remainingCodes} code(s) de secours.

${remainingCodes <= 2 ? 'IMPORTANT : Vous avez peu de codes restants. Pensez a regenerer de nouveaux codes de secours depuis les parametres de securite.' : ''}

Si vous n'avez pas utilise ce code, changez votre mot de passe immediatement.

L'equipe Aspeo`,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send backup code used email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName?: string,
  ip?: string
): Promise<boolean> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aspeo.fr';

    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Reinitialisation de votre mot de passe',
      text: `Bonjour${userName ? ` ${userName}` : ''},

Une demande de reinitialisation de mot de passe a ete effectuee pour votre compte.

${ip ? `Adresse IP de la demande : ${ip}` : ''}

Cliquez sur le lien ci-dessous pour reinitialiser votre mot de passe :
${resetUrl}

Ce lien expire dans 1 heure.

IMPORTANT : Si vous n'avez pas demande cette reinitialisation, ignorez cet email.
Votre mot de passe actuel restera inchange.

Pour votre securite :
- Ne partagez jamais ce lien
- Assurez-vous que l'URL commence par ${appUrl}
- Choisissez un mot de passe fort (min. 8 caracteres, majuscules, chiffres)

L'equipe Aspeo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Reinitialisation de mot de passe
          </h2>

          <p>Bonjour${userName ? ` ${userName}` : ''},</p>

          <p>Une demande de reinitialisation de mot de passe a ete effectuee pour votre compte.</p>

          ${ip ? `<p style="color: #666; font-size: 14px;">Adresse IP de la demande : <code>${ip}</code></p>` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reinitialiser mon mot de passe
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Ou copiez ce lien dans votre navigateur :<br>
            <code style="background: #f5f5f5; padding: 5px; display: block; margin-top: 5px; word-break: break-all;">
              ${resetUrl}
            </code>
          </p>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #856404;">Ce lien expire dans 1 heure</strong>
          </div>

          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #721c24;">Si vous n'avez pas demande cette reinitialisation :</strong>
            <p style="color: #721c24; margin: 10px 0 0 0;">
              Ignorez simplement cet email. Votre mot de passe actuel restera inchange.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            Pour votre securite, ne partagez jamais ce lien et assurez-vous que l'URL
            commence par <code>${appUrl}</code>
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send password changed notification
 */
export async function sendPasswordChangedEmail(
  to: string,
  ip?: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Votre mot de passe a ete modifie',
      text: `Bonjour,

Votre mot de passe a ete modifie avec succes.

${ip ? `Adresse IP : ${ip}` : ''}
Date : ${new Date().toLocaleString('fr-FR')}

Si vous n'avez pas effectue cette modification, contactez immediatement un administrateur
et changez votre mot de passe.

L'equipe Aspeo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            Mot de passe modifie
          </h2>

          <p>Bonjour,</p>

          <p>Votre mot de passe a ete modifie avec succes.</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${ip ? `<p style="margin: 5px 0;"><strong>Adresse IP :</strong> ${ip}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>

          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #721c24;">Si vous n'avez pas effectue cette modification :</strong>
            <p style="color: #721c24; margin: 10px 0 0 0;">
              Contactez immediatement un administrateur et securisez votre compte.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            Cet email a ete envoye automatiquement pour votre securite.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send password changed email:', error);
    return false;
  }
}

/**
 * Send 2FA disable confirmation email with a 6-digit code
 */
export async function send2FADisableConfirmationEmail(
  to: string,
  code: string,
  ip?: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Confirmation de desactivation 2FA',
      text: `Bonjour,

Une demande de desactivation de l'authentification a deux facteurs (2FA) a ete effectuee pour votre compte.

${ip ? `Adresse IP de la demande : ${ip}` : ''}

Votre code de confirmation : ${code}

Ce code expire dans 10 minutes.

ATTENTION : Si vous n'avez pas demande cette desactivation, ignorez cet email et changez votre mot de passe immediatement. Quelqu'un pourrait avoir acces a votre compte.

L'equipe Aspeo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            Confirmation de desactivation 2FA
          </h2>

          <p>Bonjour,</p>

          <p>Une demande de desactivation de l'authentification a deux facteurs (2FA) a ete effectuee pour votre compte.</p>

          ${ip ? `<p style="color: #666; font-size: 14px;">Adresse IP de la demande : <code>${ip}</code></p>` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 10px;">Votre code de confirmation :</p>
            <div style="background: #dc3545; color: white; padding: 20px 40px; font-size: 32px; letter-spacing: 8px; border-radius: 8px; display: inline-block;">
              ${code}
            </div>
          </div>

          <p style="color: #666; font-size: 14px;">Ce code expire dans 10 minutes.</p>

          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #721c24;">ATTENTION :</strong>
            <p style="color: #721c24; margin: 10px 0 0 0;">
              Si vous n'avez pas demande cette desactivation, ignorez cet email et changez votre mot de passe immediatement.
              Quelqu'un pourrait avoir acces a votre compte.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            Cet email a ete envoye automatiquement pour votre securite.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send 2FA disable confirmation email:', error);
    return false;
  }
}

/**
 * Send 2FA disabled notification
 */
export async function send2FADisabledEmail(
  to: string,
  ip?: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] 2FA desactivee sur votre compte',
      text: `Bonjour,

L'authentification a deux facteurs (2FA) a ete desactivee sur votre compte.

${ip ? `Adresse IP : ${ip}` : ''}
Date : ${new Date().toLocaleString('fr-FR')}

IMPORTANT : Si vous n'avez pas effectue cette action, votre compte a peut-etre ete compromis.
Connectez-vous immediatement et reactivez la 2FA, puis changez votre mot de passe.

L'equipe Aspeo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            2FA desactivee
          </h2>

          <p>Bonjour,</p>

          <p>L'authentification a deux facteurs (2FA) a ete desactivee sur votre compte.</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${ip ? `<p style="margin: 5px 0;"><strong>Adresse IP :</strong> ${ip}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>

          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #721c24;">IMPORTANT :</strong>
            <p style="color: #721c24; margin: 10px 0 0 0;">
              Si vous n'avez pas effectue cette action, votre compte a peut-etre ete compromis.
              Connectez-vous immediatement et reactivez la 2FA, puis changez votre mot de passe.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            Cet email a ete envoye automatiquement pour votre securite.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send 2FA disabled email:', error);
    return false;
  }
}

/**
 * Send notification when an admin triggers a password reset for a user
 */
export async function sendAdminPasswordResetEmail(
  to: string,
  adminEmail: string,
  userName?: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.OVH_EMAIL_USER,
      to,
      subject: '[Aspeo Admin] Un administrateur a demande la reinitialisation de votre mot de passe',
      text: `Bonjour${userName ? ` ${userName}` : ''},

Un administrateur (${adminEmail}) a demande la reinitialisation de votre mot de passe.

Vous allez recevoir un second email avec un lien pour definir un nouveau mot de passe.

Si vous n'attendiez pas cette demande, contactez votre administrateur.

L'equipe Aspeo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Reinitialisation de mot de passe demandee
          </h2>

          <p>Bonjour${userName ? ` ${userName}` : ''},</p>

          <p>Un administrateur (<strong>${adminEmail}</strong>) a demande la reinitialisation de votre mot de passe.</p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #155724; margin: 0;">
              Vous allez recevoir un second email avec un lien pour definir un nouveau mot de passe.
            </p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              Si vous n'attendiez pas cette demande, contactez votre administrateur.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            Cet email a ete envoye automatiquement pour votre securite.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send admin password reset notification:', error);
    return false;
  }
}
