'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, RefreshCw, Shield, Smartphone } from 'lucide-react';
import { verifyDeviceAction, resendDeviceVerificationAction } from '@/actions/auth/auth.actions';
import { toast } from 'sonner';

interface DeviceVerificationProps {
  emailSent: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onTwoFactorRequired?: () => void;
}

export default function DeviceVerification({
  emailSent,
  onSuccess,
  onCancel,
  onTwoFactorRequired,
}: DeviceVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [inputKey, setInputKey] = useState(0);

  // Start cooldown timer for resend
  useEffect(() => {
    if (emailSent) {
      setResendCooldown(60);
    }
  }, [emailSent]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const resetInput = useCallback(() => {
    setCode('');
    setInputKey((k) => k + 1);
  }, []);

  const handleVerify = useCallback(async (fullCode: string) => {
    if (fullCode.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyDeviceAction(fullCode);

      if (result.success) {
        // Check if 2FA is required after device verification
        if (result.twoFactorRequired && onTwoFactorRequired) {
          toast.success('Appareil vérifié', {
            description: 'Vérification en deux étapes requise.',
          });
          onTwoFactorRequired();
        } else {
          toast.success('Appareil vérifié', {
            description: 'Cet appareil est maintenant reconnu comme appareil de confiance.',
          });
          onSuccess();
        }
      } else {
        setError(result.error || 'Code invalide');
        resetInput();
      }
    } catch {
      setError('Erreur de verification');
      resetInput();
    } finally {
      setIsVerifying(false);
    }
  }, [onSuccess, onTwoFactorRequired, resetInput]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const result = await resendDeviceVerificationAction();

      if (result.success) {
        toast.success('Code renvoyé', {
          description: 'Un nouveau code de vérification a été envoyé à votre email.',
        });
        setResendCooldown(60);
        resetInput();
      } else {
        setError(result.error || 'Erreur lors de l\'envoi');
      }
    } catch {
      setError('Erreur lors de l\'envoi');
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, resetInput]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    if (error) {
      setError(null);
    }
  }, [error]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Nouvel appareil detecte</CardTitle>
        <CardDescription className="text-sm">
          Pour votre securite, nous devons verifier cet appareil.
          {emailSent && (
            <span className="block mt-2 text-green-600 flex items-center justify-center gap-1">
              <Mail className="w-4 h-4" />
              Un code a ete envoye a votre email
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Code de verification
          </p>
          <CodeInput
            key={inputKey}
            length={6}
            onChange={handleCodeChange}
            onComplete={handleVerify}
            disabled={isVerifying}
          />
        </div>

        <Button
          onClick={() => handleVerify(code)}
          disabled={isVerifying || code.length !== 6}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verification...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Verifier cet appareil
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Annuler
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Le code expire dans 10 minutes. Verifiez vos spams si vous ne le recevez pas.
        </p>
      </CardContent>
    </Card>
  );
}
