'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor, Smartphone, Tablet, Trash2, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  getTrustedDevicesAction,
  removeTrustedDeviceAction,
} from '@/actions/auth/device.actions';

interface TrustedDevice {
  id: string;
  name: string | null;
  browser: string | null;
  os: string | null;
  lastIp: string | null;
  lastUsedAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

function getDeviceIcon(os: string | null) {
  if (!os) return <Monitor className="w-5 h-5" />;
  const osLower = os.toLowerCase();
  if (osLower.includes('android') || osLower.includes('ios')) {
    return <Smartphone className="w-5 h-5" />;
  }
  if (osLower.includes('ipad')) {
    return <Tablet className="w-5 h-5" />;
  }
  return <Monitor className="w-5 h-5" />;
}

function formatIP(ip: string | null): string {
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return 'localhost';
  }
  return ip;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return formatDate(date);
}

export default function TrustedDevices() {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTrustedDevicesAction();
      if (result.error) {
        setError(result.error);
      } else {
        setDevices(result.devices);
      }
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleRemoveDevice = async () => {
    if (!deviceToRemove) return;

    setIsRemoving(true);
    try {
      const result = await removeTrustedDeviceAction(deviceToRemove);
      if (result.success) {
        setDevices((prev) => prev.filter((d) => d.id !== deviceToRemove));
        toast.success('Appareil supprimé', {
          description: 'L\'appareil n\'est plus reconnu comme appareil de confiance.',
        });
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setIsRemoving(false);
      setDeviceToRemove(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Appareils de confiance
            </CardTitle>
            <CardDescription>
              Appareils verifies qui peuvent se connecter sans email de confirmation
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadDevices} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun appareil de confiance</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les appareils seront ajoutes automatiquement apres verification par email
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  device.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      device.isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {getDeviceIcon(device.os)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {device.name || `${device.browser || 'Navigateur'} sur ${device.os || 'Appareil'}`}
                      </span>
                      {device.isCurrent && (
                        <Badge variant="default" className="bg-blue-600">
                          Cet appareil
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>IP: {formatIP(device.lastIp)}</span>
                      <span className="mx-2">|</span>
                      <span>Derniere utilisation : {getTimeAgo(device.lastUsedAt)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeviceToRemove(device.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Note :</strong> Si vous supprimez un appareil de confiance, vous devrez a nouveau
          verifier votre identite par email lors de la prochaine connexion depuis cet appareil.
        </div>
      </CardContent>

      {/* Remove Device Dialog */}
      <AlertDialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet appareil de confiance ?</AlertDialogTitle>
            <AlertDialogDescription>
              Lors de la prochaine connexion depuis cet appareil, vous devrez a nouveau
              verifier votre identite par email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveDevice}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
