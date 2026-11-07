'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeInput } from '@/components/ui/code-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { changeOwnPasswordAction } from '@/actions/users/users.actions';

interface ChangePasswordProps {
  has2FAEnabled: boolean;
}

export default function ChangePassword({ has2FAEnabled }: ChangePasswordProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const isValidCode = totpCode.length === 6;

  const canSubmit = currentPassword && isValidPassword && passwordsMatch && isValidCode && has2FAEnabled;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTotpCode('');
    setError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    setError(null);

    startTransition(async () => {
      const result = await changeOwnPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
        totpCode,
      });

      if (result.success) {
        resetForm();
        setOpen(false);
        toast.success('Mot de passe changé', {
          description: 'Votre mot de passe a été mis à jour avec succès. Vos autres sessions ont été déconnectées.',
        });
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  if (!has2FAEnabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        <KeyRound className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Changer le mot de passe</span>
        <span className="sm:hidden">Mot de passe</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Changer le mot de passe</span>
          <span className="sm:hidden">Mot de passe</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Changer le mot de passe
          </DialogTitle>
          <DialogDescription>
            Modifiez votre mot de passe de connexion. Vous devrez confirmer avec votre code 2FA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                autoComplete="current-password"
                disabled={isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                autoComplete="new-password"
                disabled={isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Password requirements */}
            <div className="text-xs space-y-1 mt-2">
              <div className={`flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                {hasMinLength ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                Au moins 8 caractères
              </div>
              <div className={`flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                {hasUppercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                Au moins une majuscule
              </div>
              <div className={`flex items-center gap-1 ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                {hasLowercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                Au moins une minuscule
              </div>
              <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                {hasNumber ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                Au moins un chiffre
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                autoComplete="new-password"
                disabled={isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Code 2FA (Google Authenticator)</Label>
            <CodeInput
              length={6}
              onChange={setTotpCode}
              disabled={isPending}
              autoFocus={false}
            />
            <p className="text-xs text-gray-500 text-center">
              Entrez le code à 6 chiffres de votre application d&apos;authentification
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="w-full"
          >
            {isPending ? 'Modification en cours...' : 'Changer le mot de passe'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
