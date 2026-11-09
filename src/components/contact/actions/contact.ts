'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';
import { headers } from 'next/headers';
import { contactRateLimit, safeRateLimit } from '@/lib/redis';
import { hashIP } from '@/lib/utils/security';
import { extractClientIP } from '@/lib/utils/ip';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(20),
  lastName: z.string().trim().min(1).max(20),
  email: z.string().trim().email(),
  phone: z
    .string()
    .trim()
    .min(1)
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return (
        /^\+?[0-9\s.-]+$/.test(value) &&
        digits.length >= 10 &&
        digits.length <= 15
      );
    }),
  company: optionalText(100),
  project: optionalText(300),
  address: optionalText(200),
});

export async function submitContactForm(formData: FormData) {
  // Rate limiting to prevent spam
  const headersList = await headers();
  const clientIP = extractClientIP(headersList);
  const ipHash = hashIP(clientIP);

  const { success: rateLimitSuccess } = await safeRateLimit(
    contactRateLimit,
    ipHash,
  );
  if (!rateLimitSuccess) {
    return {
      success: false,
      error: 'Trop de demandes. Veuillez réessayer dans une heure.',
    };
  }

  const getString = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };

  const data = {
    firstName: getString('firstName'),
    lastName: getString('lastName'),
    email: getString('email'),
    phone: getString('phone'),
    company: getString('company'),
    project: getString('project'),
    address: getString('address'),
  };

  // Validate the data using Zod
  const validation = contactSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: 'Veuillez vérifier les champs obligatoires du formulaire.',
    };
  }

  const validatedData = validation.data;

  // Configure the transporter using OVH SMTP
  const transporter = nodemailer.createTransport({
    host: 'ssl0.ovh.net', // OVH SMTP server
    port: 465, // Secure port for SMTP
    secure: true, // Use SSL
    auth: {
      user: process.env.OVH_EMAIL_USER, // Your OVH email address
      pass: process.env.OVH_EMAIL_PASS, // Your OVH email password
    },
  });

  const projectText = validatedData.project || 'Aucun message complémentaire';

  // Send a thank you email to the user
  await transporter.sendMail({
    from: process.env.OVH_EMAIL_USER,
    to: validatedData.email,
    subject: 'Merci de nous avoir contactés !',
    text: `Bonjour ${validatedData.firstName} ${validatedData.lastName},

Nous vous remercions d'avoir pris contact avec Aspeo. 

Nous avons bien reçu votre demande.
${validatedData.project ? `Votre message : "${validatedData.project}"` : ''}

Nous vous répondrons dans les plus brefs délais.

Si vous avez des informations supplémentaires à partager, n'hésitez pas à nous contacter à nouveau.

Cordialement,

L'équipe Aspeo`,
  });

  // Send an email to yourself with the form data
  await transporter.sendMail({
    from: process.env.OVH_EMAIL_USER,
    to: process.env.RECEIVER_EMAIL, // Your email address to receive the form data
    subject: 'Nouvelle soumission de formulaire de contact',
    text: `Vous avez reçu un nouveau message via le formulaire de contact :

Prénom : ${validatedData.firstName}
Nom : ${validatedData.lastName}
Email : ${validatedData.email}
Téléphone : ${validatedData.phone}
Société : ${validatedData.company || 'Non renseignée'}
Adresse : ${validatedData.address || 'Non renseignée'}

Message : 
${projectText}

Merci de répondre à ce message dans les plus brefs délais.`,
  });

  return { success: true };
}
