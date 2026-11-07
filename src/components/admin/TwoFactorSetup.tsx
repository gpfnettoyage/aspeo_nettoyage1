'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CodeInput } from '@/components/ui/code-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, ShieldCheck, QrCode, Loader2, ShieldOff, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { enable2FAAction, requestDisable2FAAction, confirmDisable2FAAction } from '@/actions/auth/auth.actions';

interface TwoFactorSetupProps {
  initialEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export default function TwoFactorSetup({ initialEnabled, onStatusChange }: TwoFactorSetupProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isOpen, setIsOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [step, setStep] = useState<'password' | 'qrcode' | 'verify'>('password');
  const [disableStep, setDisableStep] = useState<'password' | 'confirm'>('password');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resetState = () => {
    setStep('password');
    setQrCodeUrl(null);
    setBackupCodes([]);
    setPassword('');
    setVerificationCode('');
    setShowPassword(false);
  };

  const resetDisableState = () => {
    setDisableStep('password');
    setDisablePassword('');
    setDisableCode('');
    setShowDisablePassword(false);
  };

  const handleDisableOpenChange = (open: boolean) => {
    if (!open) {
      resetDisableState();
    }
    setIsDisableOpen(open);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  };

  const handleStartSetup = () => {
    if (!password) {
      toast.error('Mot de passe requis', { description: 'Veuillez entrer votre mot de passe pour continuer.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
          body: JSON.stringify({ password }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (data.qrCode) {
          setQrCodeUrl(data.qrCode);
          setBackupCodes(data.backupCodes || []);
          setStep('qrcode');
        } else {
          toast.error('Erreur', {
            description: data.error || 'Impossible d\'initialiser la configuration 2FA',
          });
        }
      } catch {
        toast.error('Erreur', {
          description: 'Une erreur est survenue lors du chargement de la configuration',
        });
      }
    });
  };

  const handleVerifyAndEnable = (code?: string) => {
    const codeToVerify = code || verificationCode;
    if (codeToVerify.length !== 6) return;

    startTransition(async () => {
      const result = await enable2FAAction(codeToVerify);
      if (result.success) {
        setIsEnabled(true);
        setIsOpen(false);
        resetState();
        onStatusChange?.(true);
        toast.success('Sécurité activée', {
          description: 'L\'authentification à deux facteurs est maintenant active sur votre compte.',
        });
      } else {
        toast.error('Code invalide', {
          description: result.error || 'Le code de vérification est incorrect.',
        });
      }
    });
  };

  const handleRequestDisable = () => {
    if (!disablePassword) return;

    startTransition(async () => {
      const result = await requestDisable2FAAction(disablePassword);
      if (result.success && result.emailSent) {
        setDisableStep('confirm');
        toast.success('Code envoyé', {
          description: 'Un code de confirmation a été envoyé à votre adresse email.',
        });
      } else {
        toast.error('Erreur', {
          description: result.error || 'Impossible de demander la désactivation.',
        });
      }
    });
  };

  const handleConfirmDisable = (code?: string) => {
    const codeToVerify = code || disableCode;
    if (!codeToVerify || codeToVerify.length !== 6) return;

    startTransition(async () => {
      const result = await confirmDisable2FAAction(codeToVerify);
      if (result.success) {
        setIsEnabled(false);
        setIsDisableOpen(false);
        resetDisableState();
        onStatusChange?.(false);
        toast.success('Protection désactivée', {
          description: 'L\'authentification à deux facteurs a été retirée de votre compte.',
        });
      } else {
        toast.error('Erreur', {
          description: result.error || 'Code incorrect.',
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        {isEnabled ? (
          <ShieldCheck className="h-5 w-5 text-green-600" />
        ) : (
          <Shield className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">Authentification a deux facteurs (2FA)</p>
          <p className="text-sm text-muted-foreground">
            {isEnabled
              ? 'Votre compte est protege par Google Authenticator'
              : 'Ajoutez une couche de securite supplementaire'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={isEnabled ? 'default' : 'secondary'} className={isEnabled ? 'bg-green-100 text-green-700' : ''}>
          {isEnabled ? 'Active' : 'Desactive'}
        </Badge>

        {isEnabled ? (
          <Dialog open={isDisableOpen} onOpenChange={handleDisableOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <ShieldOff className="h-4 w-4 mr-2" />
                Desactiver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              {disableStep === 'password' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <ShieldOff className="h-5 w-5" />
                      Desactiver la 2FA
                    </DialogTitle>
                    <DialogDescription>
                      Votre compte sera moins securise. Un code de confirmation sera envoye a votre email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Attention :</strong> Desactiver la 2FA rend votre compte vulnerable aux attaques.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disable-password">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="disable-password"
                          type={showDisablePassword ? 'text' : 'password'}
                          placeholder="********"
                          autoComplete="current-password"
                          value={disablePassword}
                          onChange={(e) => setDisablePassword(e.target.value)}
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowDisablePassword(!showDisablePassword)}
                        >
                          {showDisablePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleDisableOpenChange(false)}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleRequestDisable}
                      disabled={isPending || !disablePassword}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Envoyer le code
                    </Button>
                  </DialogFooter>
                </>
              )}

              {disableStep === 'confirm' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <ShieldOff className="h-5 w-5" />
                      Confirmer la desactivation
                    </DialogTitle>
                    <DialogDescription>
                      Entrez le code a 6 chiffres envoye a votre adresse email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <CodeInput
                      key={`disable-${disableStep}`}
                      length={6}
                      onChange={setDisableCode}
                      onComplete={handleConfirmDisable}
                      disabled={isPending}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Le code expire dans 10 minutes.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDisableStep('password')}>
                      Retour
                    </Button>
                    <Button
                      onClick={() => handleConfirmDisable()}
                      disabled={isPending || disableCode.length !== 6}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirmer
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              {step === 'password' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Configurer la 2FA
                    </DialogTitle>
                    <DialogDescription>
                      Confirmez votre identite pour commencer la configuration.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Recommande :</strong> La 2FA empeche l&apos;acces a votre compte meme si votre mot de passe est compromis.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setup-password">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="setup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="********"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleStartSetup} disabled={isPending || !password}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Continuer
                    </Button>
                  </DialogFooter>
                </>
              )}

              {step === 'qrcode' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      Scanner le QR Code
                    </DialogTitle>
                    <DialogDescription>
                      Scannez ce code avec Google Authenticator ou une autre application TOTP.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {qrCodeUrl && (
                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-xl border shadow-sm">
                          <Image src={qrCodeUrl} alt="QR Code 2FA" width={180} height={180} />
                        </div>
                      </div>
                    )}

                    {backupCodes.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                        <p className="font-bold text-amber-900 mb-2">Codes de secours (Sauvegardez-les !)</p>
                        <div className="grid grid-cols-2 gap-1 font-mono text-amber-800">
                          {backupCodes.map(code => <div key={code}>{code}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('password')}>
                      Retour
                    </Button>
                    <Button onClick={() => setStep('verify')}>
                      J&apos;ai scanne le code
                    </Button>
                  </DialogFooter>
                </>
              )}

              {step === 'verify' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      Verification
                    </DialogTitle>
                    <DialogDescription>
                      Entrez le code a 6 chiffres affiche dans votre application.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <CodeInput
                      key={`verify-${step}`}
                      length={6}
                      onChange={setVerificationCode}
                      onComplete={handleVerifyAndEnable}
                      disabled={isPending}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('qrcode')}>
                      Retour
                    </Button>
                    <Button
                      onClick={() => handleVerifyAndEnable()}
                      disabled={isPending || verificationCode.length !== 6}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Activer la 2FA
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
