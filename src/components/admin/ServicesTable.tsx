'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Service } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Service with optional category for admin table
type ServiceWithOptionalCategory = Service & { category: { id: string; name: string } | null };
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
import { toast } from 'sonner';
import { deleteServiceAction, toggleServicePublishedAction } from '@/actions/services/services.actions';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

interface ServicesTableProps {
  services: ServiceWithOptionalCategory[];
}

export default function ServicesTable({ services }: ServicesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublished = async (id: string) => {
    const result = await toggleServicePublishedAction({ id });

    if (result.success) {
      toast.success(result.data.published ? 'Service publié' : 'Service dépublié', {
        description: result.data.published
          ? 'Le service est maintenant visible sur le site.'
          : 'Le service n\'est plus visible sur le site.',
      });
      router.refresh();
    } else {
      toast.error('Erreur', {
        description: result.error,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const result = await deleteServiceAction({ id: deleteId });

    if (result.success) {
      toast.success('Service supprimé', {
        description: 'Le service a été supprimé avec succès.',
      });
      router.refresh();
    } else {
      toast.error('Erreur', {
        description: result.error,
      });
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-4">Aucun service pour le moment.</p>
        <Button asChild>
          <Link href="/gp8x2k4m/services/new">Créer votre premier service</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden lg:table-cell">Mis à jour</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium max-w-[150px] sm:max-w-none truncate sm:whitespace-normal">
                      {service.title}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm hidden md:table-cell">
                      {service.slug}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {service.category && (
                        <Badge variant="outline">{service.category.name}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.published ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 whitespace-nowrap text-[10px] sm:text-xs">
                          <Eye className="w-3 h-3 mr-1 hidden xs:inline" />
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="whitespace-nowrap text-[10px] sm:text-xs">
                          <EyeOff className="w-3 h-3 mr-1 hidden xs:inline" />
                          Brouillon
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm hidden lg:table-cell">
                      {new Date(service.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/gp8x2k4m/services/${service.id}`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/gp8x2k4m/preview/${service.slug}`}
                              target="_blank"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Prévisualiser
                            </Link>
                          </DropdownMenuItem>
                          {service.published && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/proprete-services/${service.slug}`}
                                target="_blank"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Voir sur le site
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleTogglePublished(service.id)}
                          >
                            {service.published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Dépublier
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Publier
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteId(service.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le service sera définitivement
              supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
