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
import { Loader2, Monitor, Smartphone, Tablet, Trash2, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  getActiveSessionsAction,
  revokeSessionAction,
  revokeAllOtherSessionsAction,
  type SessionInfo,
} from '@/actions/auth/session.actions';

function getDeviceIcon(os: string) {
  const osLower = os.toLowerCase();
  if (osLower.includes('android') || osLower.includes('ios')) {
    return <Smartphone className="w-5 h-5" />;
  }
  if (osLower.includes('ipad')) {
    return <Tablet className="w-5 h-5" />;
  }
  return <Monitor className="w-5 h-5" />;
}

function formatDeviceInfo(browser: string, os: string): string {
  const isUnknown = browser === 'Inconnu' || browser === 'Navigateur inconnu';
  if (isUnknown) {
    return 'Appareil local (dev)';
  }
  return `${browser} sur ${os}`;
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

export default function SessionManagement() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getActiveSessionsAction();
      if (result.error) {
        setError(result.error);
      } else {
        setSessions(result.sessions);
      }
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;

    setIsRevoking(true);
    try {
      const result = await revokeSessionAction(sessionToRevoke);
      if (result.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke));
        toast.success('Session révoquée', {
          description: 'L\'appareil a été déconnecté avec succès.',
        });
      } else {
        setError(result.error || 'Erreur lors de la revocation');
      }
    } catch {
      setError('Erreur lors de la revocation');
    } finally {
      setIsRevoking(false);
      setSessionToRevoke(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setIsRevoking(true);
    try {
      const result = await revokeAllOtherSessionsAction();
      if (result.success) {
        const revokedCount = sessions.filter((s) => !s.isCurrent).length;
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        toast.success('Sessions révoquées', {
          description: `${revokedCount} session(s) ont été déconnectées.`,
        });
      } else {
        setError(result.error || 'Erreur lors de la revocation');
      }
    } catch {
      setError('Erreur lors de la revocation');
    } finally {
      setIsRevoking(false);
      setShowRevokeAllDialog(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Sessions actives
            </CardTitle>
            <CardDescription>
              Gerez vos sessions connectees sur differents appareils
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSessions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            {otherSessionsCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowRevokeAllDialog(true)}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Deconnecter tout ({otherSessionsCount})
              </Button>
            )}
          </div>
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
        ) : sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune session active</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  session.isCurrent ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      session.isCurrent ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {getDeviceIcon(session.os)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatDeviceInfo(session.browser, session.os)}
                      </span>
                      {session.isCurrent && (
                        <Badge variant="default" className="bg-green-600">
                          Session actuelle
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>IP: {formatIP(session.ipAddress)}</span>
                      <span className="mx-2">|</span>
                      <span>Connecte le {formatDate(session.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setSessionToRevoke(session.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Revoke Single Session Dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoquer cette session ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;appareil sera immediatement deconnecte. Si ce n&apos;est pas vous,
              pensez egalement a changer votre mot de passe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeSession}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Revoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Dialog */}
      <AlertDialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deconnecter toutes les autres sessions ?</AlertDialogTitle>
            <AlertDialogDescription>
              {otherSessionsCount} session(s) seront immediatement deconnectees.
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAllOther}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Deconnecter tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
