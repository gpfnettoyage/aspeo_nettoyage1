'use client';

import { useActionState, useEffect, Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/actions/auth/auth.actions';
import { Button } from '@/components/ui/button';
import TwoFactorVerify from '@/components/admin/TwoFactorVerify';
import DeviceVerification from '@/components/admin/DeviceVerification';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { ADMIN_BASE_PATH, getSafeCallbackUrl } from '@/lib/constants/admin';

// Type for the login action state
interface LoginState {
  success?: boolean;
  error?: string;
  twoFactorRequired?: boolean;
  twoFactorSetupRequired?: boolean;
  deviceVerificationRequired?: boolean;
  deviceVerificationSent?: boolean;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));

  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  // Track if user has manually cancelled verification to force return to form
  const [forcedFormReturn, setForcedFormReturn] = useState(false);

  // Track if 2FA is required after device verification
  const [twoFactorAfterDevice, setTwoFactorAfterDevice] = useState(false);

  // Track if redirect has been initiated to prevent duplicate redirects
  const redirectInitiated = useRef(false);

  // Type-safe access to state
  const typedState = state as LoginState | null;

  // Reset states when form state changes (user submits form again)
  useEffect(() => {
    setForcedFormReturn(false);
    setTwoFactorAfterDevice(false);
  }, [typedState]);

  // Handle redirects in effect (side effects that should happen once)
  useEffect(() => {
    if (redirectInitiated.current) return;

    if (typedState?.success) {
      redirectInitiated.current = true;
      router.push(callbackUrl);
      router.refresh();
    } else if (typedState?.twoFactorSetupRequired) {
      redirectInitiated.current = true;
      router.push(`${ADMIN_BASE_PATH}/security?setup2fa=required`);
      router.refresh();
    }
  }, [typedState?.success, typedState?.twoFactorSetupRequired, router, callbackUrl]);

  // Derive verification step from state (non-redirect cases)
  const currentStep = (() => {
    if (forcedFormReturn) return 'form';
    // 2FA after device verification (new flow: device → 2FA)
    if (twoFactorAfterDevice) return '2fa';
    // Direct 2FA (trusted device, just needs 2FA)
    if (typedState?.twoFactorRequired) return '2fa';
    // Device verification (untrusted device)
    if (typedState?.deviceVerificationRequired) return 'device';
    return 'form';
  })();

  const handleCancelVerification = () => {
    setForcedFormReturn(true);
    setTwoFactorAfterDevice(false);
  };

  const handle2FASuccess = () => {
    router.push(callbackUrl);
    router.refresh();
  };

  // Handle 2FA required after device verification
  const handleTwoFactorRequiredAfterDevice = () => {
    setTwoFactorAfterDevice(true);
  };

  const handleDeviceSuccess = () => {
    router.push(callbackUrl);
    router.refresh();
  };

  // Device verification (new flow: device BEFORE 2FA)
  if (currentStep === 'device') {
    return (
      <DeviceVerification
        emailSent={typedState?.deviceVerificationSent ?? false}
        onSuccess={handleDeviceSuccess}
        onCancel={handleCancelVerification}
        onTwoFactorRequired={handleTwoFactorRequiredAfterDevice}
      />
    );
  }

  if (currentStep === '2fa') {
    return (
      <TwoFactorVerify
        onSuccess={handle2FASuccess}
        onCancel={handleCancelVerification}
      />
    );
  }

  return (
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
            placeholder="admin@aspeo.fr"
            required
            autoComplete="email"
            className="pl-10"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            required
            autoComplete="current-password"
            className="pl-10 pr-10"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
            title={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connexion...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>

      <div className="text-center">
        <Link
          href={`${ADMIN_BASE_PATH}/forgot-password`}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Mot de passe oublié ?
        </Link>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
            <Image
              src="/img/brand/logo-aspeo-couleur.svg"
              unoptimized
              alt="ASPEO"
              width={200}
              height={44}
              className="mx-auto"
              priority
            />
          <CardTitle className="text-2xl font-bold">Administration</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder au panneau d&apos;administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
