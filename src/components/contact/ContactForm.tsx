'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { submitContactForm } from './actions/contact';
import { useRouter } from 'next/navigation';

const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, {
      message: 'Votre prénom est obligatoire',
    })
    .max(20, {
      message: 'Votre prénom doit contenir au maximum 20 caractères',
    }),
  lastName: z
    .string()
    .trim()
    .min(1, {
      message: 'Votre nom est obligatoire',
    })
    .max(20, {
      message: 'Votre nom doit contenir au maximum 20 caractères',
    }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: 'Votre email est obligatoire',
    })
    .email({
      message: 'Veuillez entrer une adresse email valide',
    }),
  phone: z
    .string()
    .trim()
    .min(1, {
      message: 'Votre numéro de téléphone est obligatoire',
    })
    .refine(
      (value) => {
        const digits = value.replace(/\D/g, '');
        return (
          /^\+?[0-9\s.-]+$/.test(value) &&
          digits.length >= 10 &&
          digits.length <= 15
        );
      },
      {
        message:
          'Veuillez entrer un numéro de téléphone valide (10-15 chiffres, peut inclure "+" pour l\'indicatif)',
      },
    ),
  company: z.string().optional(),
  project: z
    .string()
    .max(300, {
      message: 'Votre projet doit contenir au maximum 300 caractères',
    })
    .optional(),
  address: z
    .string()
    .max(200, {
      message: 'Votre adresse doit contenir au maximum 200 caractères',
    })
    .optional(),
});

export default function ContactForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      project: '',
    },
    mode: 'onTouched',
  });

  const {
    formState: { errors },
  } = form;

  // Handle field touch
  const handleFieldTouch = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Only show error if field has been touched or form has been submitted
  const shouldShowError = (fieldName: string) => {
    return (
      (touchedFields[fieldName] || hasSubmitted) &&
      errors[fieldName as keyof typeof errors]
    );
  };
  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setHasSubmitted(true);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          formData.append(key, value);
        }
      });

      const response = await submitContactForm(formData);

      if (response.success) {
        toast.success('Message envoyé', {
          description:
            'Votre message a bien été envoyé, nous vous recontacterons dans les plus brefs délais.',
        });
        form.reset();
        setTouchedFields({});
        setHasSubmitted(false);
        router.push('/'); // Redirect to the homepage
      } else {
        toast.error('Erreur', {
          description:
            response.error ||
            "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Form {...form}>
        <form
          name="contact"
          autoComplete="on"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative space-y-6"
        >
          <p className="absolute right-0 text-sm font-light text-muted-foreground">
            * Champs requis
          </p>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Prénom *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="firstName"
                      name="firstName"
                      placeholder="Ex: Jean"
                      autoComplete="given-name"
                      onBlur={() => {
                        field.onBlur();
                        handleFieldTouch('firstName');
                      }}
                    />
                  </FormControl>
                  {shouldShowError('firstName') && <FormMessage />}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Nom *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="lastName"
                      name="lastName"
                      placeholder="Ex: Dupont"
                      autoComplete="family-name"
                      onBlur={() => {
                        field.onBlur();
                        handleFieldTouch('lastName');
                      }}
                    />
                  </FormControl>
                  {shouldShowError('lastName') && <FormMessage />}
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">
                    Votre adresse e-mail *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Ex: jean.dupont@exemple.com"
                      autoComplete="email"
                      onBlur={() => {
                        field.onBlur();
                        handleFieldTouch('email');
                      }}
                    />
                  </FormControl>
                  {shouldShowError('email') && <FormMessage />}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Votre téléphone *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+33 6 01 02 03 04"
                      autoComplete="tel"
                      onBlur={() => {
                        field.onBlur();
                        handleFieldTouch('phone');
                      }}
                    />
                  </FormControl>
                  {shouldShowError('phone') && <FormMessage />}
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Entreprise</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="company"
                      name="company"
                      placeholder="Ex: Boulangerie Dupont"
                      autoComplete="organization"
                      onBlur={() => {
                        field.onBlur();
                        handleFieldTouch('company');
                      }}
                    />
                  </FormControl>
                  {shouldShowError('company') && <FormMessage />}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Adresse</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="address"
                      name="address"
                      placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                      autoComplete="street-address"
                      onBlur={() => {
                        field.onBlur();
                        handleFieldTouch('address');
                      }}
                    />
                  </FormControl>
                  {shouldShowError('address') && <FormMessage />}
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Votre projet</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Dites-nous ce que vous souhaitez nettoyer (surface en m², type de locaux, etc.)"
                    className="relative min-h-[150px] bg-background"
                    {...field}
                    onBlur={() => {
                      field.onBlur();
                      handleFieldTouch('project');
                    }}
                  />
                </FormControl>
                {shouldShowError('project') && <FormMessage />}
              </FormItem>
            )}
          />
          <div className="text-xs text-muted-foreground">
            En cliquant sur &ldquo;Envoyer votre message&rdquo;, vous acceptez
            d&apos;être contacté par e-mail ou appel téléphonique. Aucun e-mail
            a des fins commerciales ne vous sera envoyé.
          </div>
          <div className="flex w-full justify-center">
            <Button
              className="bg-primary w-full rounded-lg py-6 text-xl font-bold"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer votre message'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
