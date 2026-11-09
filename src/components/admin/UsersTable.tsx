'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@prisma/client';

// Admin roles (excludes USER which is for public users)
type AdminRole = Exclude<Role, 'USER'>;
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  updateUserRoleAction,
  deleteUserAction,
  sendPasswordResetAction,
  type UserListItem,
} from '@/actions/users/users.actions';
import { getRoleDisplayName, ROLE_HIERARCHY } from '@/lib/permissions';
import {
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Trash2,
  KeyRound,
  UserCog,
} from 'lucide-react';

interface UsersTableProps {
  users: UserListItem[];
  currentUserId: string;
  currentUserRole: Role;
}

const ROLE_ICONS: Record<Role, typeof Shield> = {
  SUPER_ADMIN: ShieldAlert,
  ADMIN: ShieldCheck,
  EDITOR: Shield,
  VIEWER: User,
  USER: User,
};

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  ADMIN: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  EDITOR: 'bg-green-100 text-green-700 hover:bg-green-100',
  VIEWER: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  USER: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
};

export default function UsersTable({
  users,
  currentUserId,
  currentUserRole,
}: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Delete dialog state
  const [deleteUser, setDeleteUser] = useState<UserListItem | null>(null);

  // Role change dialog state
  const [roleChangeUser, setRoleChangeUser] = useState<UserListItem | null>(null);
  const [newRole, setNewRole] = useState<AdminRole | ''>('');

  // Password reset confirmation dialog state
  const [passwordResetUser, setPasswordResetUser] = useState<UserListItem | null>(null);

  // Check if current user can modify target user
  const canModifyUser = (targetUser: UserListItem): boolean => {
    // Cannot modify self (except password)
    if (targetUser.id === currentUserId) return false;
    // Cannot modify users with higher or equal role
    return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUser.role];
  };

  // Check if current user can send password reset to target user
  // SECURITY: Cannot send reset to self (use security settings) or users with higher/equal role
  const canSendPasswordReset = (targetUser: UserListItem): boolean => {
    // Cannot send reset link to self - use security settings page instead
    if (targetUser.id === currentUserId) return false;
    // Cannot reset password of users with higher or equal role
    return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUser.role];
  };

  // Get available roles for assignment (cannot assign higher than own role)
  const getAssignableRoles = (): AdminRole[] => {
    const roles: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];
    return roles.filter((role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole]);
  };

  const handleRoleChange = () => {
    if (!roleChangeUser || !newRole) return;

    startTransition(async () => {
      const result = await updateUserRoleAction({
        userId: roleChangeUser.id,
        role: newRole,
      });

      if (result.success) {
        toast.success('Rôle mis à jour', {
          description: `${roleChangeUser.email} est maintenant ${getRoleDisplayName(newRole as Role)}`,
        });
        router.refresh();
      } else {
        toast.error('Erreur', {
          description: result.error,
        });
      }

      setRoleChangeUser(null);
      setNewRole('');
    });
  };

  const handleDelete = () => {
    if (!deleteUser) return;

    startTransition(async () => {
      const result = await deleteUserAction({ userId: deleteUser.id });

      if (result.success) {
        toast.success('Utilisateur supprimé', {
          description: `${deleteUser.email} a été supprimé`,
        });
        router.refresh();
      } else {
        toast.error('Erreur', {
          description: result.error,
        });
      }

      setDeleteUser(null);
    });
  };

  const handlePasswordReset = () => {
    if (!passwordResetUser) return;

    startTransition(async () => {
      const result = await sendPasswordResetAction({
        userId: passwordResetUser.id,
      });

      if (result.success) {
        toast.success('Lien de réinitialisation envoyé', {
          description: `Un email a été envoyé à ${passwordResetUser.email}`,
        });
      } else {
        toast.error('Erreur', {
          description: result.error,
        });
      }

      setPasswordResetUser(null);
    });
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Aucun utilisateur.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Sessions</TableHead>
              <TableHead className="hidden md:table-cell">Cree le</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const RoleIcon = ROLE_ICONS[user.role];
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <TableRow key={user.id} className={isCurrentUser ? 'bg-blue-50/50' : ''}>
                      <TableCell className="max-w-[140px] sm:max-w-none">
                        <div className="truncate">
                          <div className="font-medium flex items-center gap-2 truncate">
                            <span className="truncate">{user.email}</span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                                Vous
                              </Badge>
                            )}
                          </div>
                          {user.name && (
                            <div className="text-sm text-gray-500 truncate">{user.name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${ROLE_COLORS[user.role]} whitespace-nowrap text-[10px] sm:text-xs`}>
                          <RoleIcon className="w-3 h-3 mr-1 hidden xs:inline" />
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-gray-500">
                          {user._count.sessions} active{user._count.sessions > 1 ? 's' : ''}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        {/* Only show actions menu if at least one action is available */}
                        {(canModifyUser(user) || canSendPasswordReset(user)) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isPending}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canModifyUser(user) && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRoleChangeUser(user);
                                      // USER role shouldn't appear in admin panel, safe to cast
                                      setNewRole(user.role as AdminRole);
                                    }}
                                  >
                                    <UserCog className="w-4 h-4 mr-2" />
                                    Changer le role
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {canSendPasswordReset(user) && (
                                <DropdownMenuItem
                                  onClick={() => setPasswordResetUser(user)}
                                >
                                  <KeyRound className="w-4 h-4 mr-2" />
                                  Envoyer lien de reset
                                </DropdownMenuItem>
                              )}
                              {canModifyUser(user) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => setDeleteUser(user)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le role</DialogTitle>
            <DialogDescription>
              Modifier le role de {roleChangeUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={newRole}
              onValueChange={(value) => setNewRole(value as AdminRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectionnez un role" />
              </SelectTrigger>
              <SelectContent>
                {getAssignableRoles().map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeUser(null)}>
              Annuler
            </Button>
            <Button onClick={handleRoleChange} disabled={isPending || !newRole}>
              {isPending ? 'Mise a jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. L&apos;utilisateur {deleteUser?.email} sera
              definitivement supprime ainsi que toutes ses sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Confirmation Dialog */}
      <AlertDialog open={!!passwordResetUser} onOpenChange={() => setPasswordResetUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer un lien de reinitialisation</AlertDialogTitle>
            <AlertDialogDescription>
              Un email sera envoye a <strong>{passwordResetUser?.email}</strong> avec un lien
              pour reinitialiser son mot de passe. L&apos;utilisateur definira lui-meme son nouveau mot de passe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              disabled={isPending}
            >
              {isPending ? 'Envoi...' : 'Envoyer le lien'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
