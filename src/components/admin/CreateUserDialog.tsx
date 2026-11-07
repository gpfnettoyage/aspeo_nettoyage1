'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@prisma/client';

// Admin roles (excludes USER which is for public users)
type AdminRole = Exclude<Role, 'USER'>;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createUserAction } from '@/actions/users/users.actions';
import { getRoleDisplayName, getRoleDescription, ROLE_HIERARCHY } from '@/lib/permissions';
import { Plus, UserPlus } from 'lucide-react';

interface CreateUserDialogProps {
  currentUserRole: Role;
}

export default function CreateUserDialog({ currentUserRole }: CreateUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('VIEWER');

  // Get available roles for assignment (cannot assign higher than own role)
  const getAssignableRoles = (): AdminRole[] => {
    const roles: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];
    return roles.filter((r) => ROLE_HIERARCHY[r] <= ROLE_HIERARCHY[currentUserRole]);
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setRole('VIEWER');
  };

  const handleSubmit = () => {
    // Validation
    if (!email || !password) {
      toast.error('Erreur', {
        description: 'Email et mot de passe requis',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Erreur', {
        description: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    startTransition(async () => {
      const result = await createUserAction({
        email,
        name: name || null,
        password,
        role,
      });

      if (result.success) {
        toast.success('Utilisateur créé', {
          description: `${email} a été créé avec le rôle ${getRoleDisplayName(role)}`,
        });
        resetForm();
        setOpen(false);
        router.refresh();
      } else {
        toast.error('Erreur', {
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Creer un utilisateur
          </DialogTitle>
          <DialogDescription>
            L&apos;utilisateur recevra ses identifiants pour se connecter au back-office.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="utilisateur@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom (optionnel)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(value) => setRole(value as AdminRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAssignableRoles().map((r) => (
                  <SelectItem key={r} value={r}>
                    <div>
                      <div className="font-medium">{getRoleDisplayName(r)}</div>
                      <div className="text-xs text-gray-500">{getRoleDescription(r)}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 caracteres"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-500">
            Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule et un chiffre.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !email || !password || !confirmPassword}
          >
            {isPending ? 'Creation...' : 'Creer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
