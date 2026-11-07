'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/actions/auth/password.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  // Derive emailSent directly from state - no need for separate useState
  const emailSent = state?.success ?? false;

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Email envoye</CardTitle>
            <CardDescription className="text-base">
              {state?.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">Verifiez votre boite mail</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Le lien expire dans 1 heure</li>
                <li>Verifiez aussi vos spams</li>
                <li>Un seul lien actif a la fois</li>
              </ul>
            </div>

            <Link href="/gp8x2k4m/login">
              <Button variant="outline" className="w-full mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour a la connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <Image
            src="/img/logo/logo.webp"
            alt="Aspeo Logo"
            width={300}
            height={100}
            className="mx-auto"
            priority
          />
          <CardTitle className="text-2xl font-bold">Mot de passe oublie</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de reinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  className="pl-10"
                  disabled={isPending}
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </Button>

            <Link href="/gp8x2k4m/login" className="block mt-2">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour a la connexion
              </Button>
            </Link>
          </form>

          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <p className="font-medium">Securite</p>
            <p className="text-amber-700 mt-1">
              Pour votre protection, vous ne pouvez demander que 3 reintialisations par heure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
