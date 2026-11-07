'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useActionState } from 'react';
import { verifyTOTPAction, verifyBackupCodeAction } from '@/actions/auth/auth.actions';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Loader2, ShieldCheck, Key } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorVerifyProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerify({ onSuccess, onCancel }: TwoFactorVerifyProps) {
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState('');
  const [modeKey, setModeKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const [totpState, totpFormAction, totpPending] = useActionState(verifyTOTPAction, null);
  const [backupState, backupFormAction, backupPending] = useActionState(verifyBackupCodeAction, null);

  const state = useBackupCode ? backupState : totpState;
  const isPending = useBackupCode ? backupPending : totpPending;
  const formAction = useBackupCode ? backupFormAction : totpFormAction;

  // Handle success
  useEffect(() => {
    if (state?.success) {
      toast.success('Authentification réussie', {
        description: useBackupCode
          ? 'Code de secours validé. Ce code ne peut plus être utilisé.'
          : 'Vérification en deux étapes validée.',
      });
      onSuccess();
    }
  }, [state?.success, onSuccess, useBackupCode]);

  const handleSwitchMode = useCallback((toBackupCode: boolean) => {
    setUseBackupCode(toBackupCode);
    setCode('');
    setModeKey((k) => k + 1);
  }, []);

  const handleComplete = useCallback((fullCode: string) => {
    if (formRef.current) {
      const input = formRef.current.querySelector('input[name="code"]') as HTMLInputElement;
      if (input) {
        input.value = fullCode;
        formRef.current.requestSubmit();
      }
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  // Use error message as part of key to reset on new errors
  const inputKey = `${useBackupCode}-${modeKey}-${state?.error || ''}`;

  if (useBackupCode) {
    return (
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center">
            <div className="p-3 bg-amber-100 rounded-full">
              <Key className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold">Code de secours</h3>
          <p className="text-sm text-muted-foreground">
            Entrez l&apos;un de vos codes de secours a 10 caracteres.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
            {state.error}
          </div>
        )}

        <input type="hidden" name="code" value={code} />

        <CodeInput
          key={inputKey}
          length={10}
          onChange={handleCodeChange}
          onComplete={handleComplete}
          disabled={isPending}
          variant="backup"
        />

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={isPending || code.length !== 10}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verification...
              </>
            ) : (
              'Verifier'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSwitchMode(false)}
            disabled={isPending}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Utiliser le code TOTP
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onCancel}
            disabled={isPending}
          >
            Retour a la connexion
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Chaque code de secours ne peut etre utilise qu&apos;une seule fois.
        </p>
      </form>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">Verification en deux etapes</h3>
        <p className="text-sm text-muted-foreground">
          Entrez le code de securite genere par votre application d&apos;authentification.
        </p>
      </div>

      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
          {state.error}
        </div>
      )}

      <input type="hidden" name="code" value={code} />

      <CodeInput
        key={inputKey}
        length={6}
        onChange={handleCodeChange}
        onComplete={handleComplete}
        disabled={isPending}
      />

      <div className="flex flex-col gap-2 pt-2">
        <Button
          type="submit"
          className="w-full h-12 text-lg"
          disabled={isPending || code.length !== 6}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verification...
            </>
          ) : (
            'Verifier'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSwitchMode(true)}
          disabled={isPending}
        >
          <Key className="w-4 h-4 mr-2" />
          Utiliser un code de secours
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onCancel}
          disabled={isPending}
        >
          Retour a la connexion
        </Button>
      </div>
    </form>
  );
}
