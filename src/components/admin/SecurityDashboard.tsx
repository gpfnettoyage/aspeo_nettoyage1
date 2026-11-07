'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Shield, ShieldAlert, ShieldOff, Ban, Unlock, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  getSecurityStatsAction,
  getBannedIPsPaginatedAction,
  getRecentFailedAttemptsPaginatedAction,
  banIPAction,
  unbanIPAction,
} from '@/actions/security/security.actions';
import type { BannedIP, FailedAttempt, PaginatedBannedIPs, PaginatedFailedAttempts } from '@/lib/security';
import TwoFactorSetup from './TwoFactorSetup';
import ChangePassword from './ChangePassword';
import SessionManagement from './SessionManagement';
import TrustedDevices from './TrustedDevices';
import ClientPagination from './ClientPagination';
import { DEFAULT_PAGE_SIZES } from '@/types/pagination';

interface SecurityStatsBasic {
  failedAttemptsLast24h: number;
  bannedIPsCount: number;
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStatsBasic | null>(null);
  const [bannedIPsData, setBannedIPsData] = useState<PaginatedBannedIPs | null>(null);
  const [failedAttemptsData, setFailedAttemptsData] = useState<PaginatedFailedAttempts | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [banIP, setBanIP] = useState('');
  const [banReason, setBanReason] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const [bannedIPsPage, setBannedIPsPage] = useState(1);
  const [bannedIPsPageSize, setBannedIPsPageSize] = useState<number>(DEFAULT_PAGE_SIZES.bannedIPs);
  const [failedAttemptsPage, setFailedAttemptsPage] = useState(1);
  const [failedAttemptsPageSize, setFailedAttemptsPageSize] = useState<number>(DEFAULT_PAGE_SIZES.securityLogs);

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, session] = await Promise.all([
        getSecurityStatsAction(),
        fetch('/api/auth/get-session').then(res => res.json()).catch(() => null)
      ]);

      setStats({
        failedAttemptsLast24h: statsData.failedAttemptsLast24h,
        bannedIPsCount: statsData.bannedIPsCount,
      });
      setIs2FAEnabled(!!session?.user?.twoFactorEnabled);
    } catch (error) {
      console.error('Failed to fetch security stats:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les statistiques de sécurité',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBannedIPs = useCallback(async (page: number, pageSize: number) => {
    try {
      const data = await getBannedIPsPaginatedAction(page, pageSize);
      setBannedIPsData(data);
    } catch (error) {
      console.error('Failed to fetch banned IPs:', error);
    }
  }, []);

  const fetchFailedAttempts = useCallback(async (page: number, pageSize: number) => {
    try {
      const data = await getRecentFailedAttemptsPaginatedAction(page, pageSize);
      setFailedAttemptsData(data);
    } catch (error) {
      console.error('Failed to fetch failed attempts:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBannedIPs(1, bannedIPsPageSize);
    fetchFailedAttempts(1, failedAttemptsPageSize);
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchBannedIPs, fetchFailedAttempts, bannedIPsPageSize, failedAttemptsPageSize]);

  const handleBannedIPsPageChange = (page: number) => {
    setBannedIPsPage(page);
    fetchBannedIPs(page, bannedIPsPageSize);
  };

  const handleBannedIPsPageSizeChange = (pageSize: number) => {
    setBannedIPsPageSize(pageSize);
    setBannedIPsPage(1);
    fetchBannedIPs(1, pageSize);
  };

  const handleFailedAttemptsPageChange = (page: number) => {
    setFailedAttemptsPage(page);
    fetchFailedAttempts(page, failedAttemptsPageSize);
  };

  const handleFailedAttemptsPageSizeChange = (pageSize: number) => {
    setFailedAttemptsPageSize(pageSize);
    setFailedAttemptsPage(1);
    fetchFailedAttempts(1, pageSize);
  };

  const handleBanIP = () => {
    if (!banIP.trim()) return;

    startTransition(async () => {
      const result = await banIPAction(banIP, banReason || 'Ban manuel', 1);
      if (result.success) {
        toast.success('IP bannie', { description: `${banIP} a été bannie pour 1 heure` });
        setBanIP('');
        setBanReason('');
        fetchStats();
        fetchBannedIPs(bannedIPsPage, bannedIPsPageSize);
      } else {
        toast.error('Erreur', { description: result.error });
      }
    });
  };

  const handleUnbanIP = (ip: string) => {
    startTransition(async () => {
      const result = await unbanIPAction(ip);
      if (result.success) {
        toast.success('IP débannie', { description: `${ip} a été débannie` });
        fetchStats();
        fetchBannedIPs(bannedIPsPage, bannedIPsPageSize);
      } else {
        toast.error('Erreur', { description: result.error });
      }
    });
  };

  const handleRefresh = () => {
    fetchStats();
    fetchBannedIPs(bannedIPsPage, bannedIPsPageSize);
    fetchFailedAttempts(failedAttemptsPage, failedAttemptsPageSize);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tentatives échouées (24h)</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failedAttemptsLast24h || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(stats?.failedAttemptsLast24h || 0) > 10 ? 'Activité suspecte détectée' : 'Niveau normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">IPs bannies</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bannedIPsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Auto-ban après 10 tentatives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={(stats?.failedAttemptsLast24h || 0) > 20 ? 'destructive' : 'default'}>
                {(stats?.failedAttemptsLast24h || 0) > 20 ? 'Alerte' : 'Normal'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Protection active</p>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Management & Password */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Protection du compte
            </CardTitle>
            <CardDescription>
              Gérez la sécurité de votre compte administrateur
            </CardDescription>
          </div>
          <ChangePassword has2FAEnabled={is2FAEnabled} />
        </CardHeader>
        <CardContent>
          <TwoFactorSetup
            initialEnabled={is2FAEnabled}
            onStatusChange={(enabled) => setIs2FAEnabled(enabled)}
          />
        </CardContent>
      </Card>

      {/* Session Management */}
      <SessionManagement />

      {/* Trusted Devices */}
      <TrustedDevices />

      {/* Manual Ban */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5" />
            Bannir une IP manuellement
          </CardTitle>
          <CardDescription>
            Ban une IP pour 1 heure. Utile pour bloquer des attaques en cours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Adresse IP (ex: 192.168.1.1)"
              value={banIP}
              onChange={(e) => setBanIP(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Raison (optionnel)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleBanIP} disabled={isPending || !banIP.trim()}>
              <Ban className="h-4 w-4 mr-2" />
              Bannir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Banned IPs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>IPs bannies</CardTitle>
            <CardDescription>
              Liste des IPs actuellement bloquées
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {bannedIPsData && bannedIPsData.data.length > 0 ? (
            <>
              <div className="space-y-3">
                {bannedIPsData.data.map((ban: BannedIP) => (
                  <div
                    key={ban.ip}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="font-mono text-sm font-bold">{ban.ip}</code>
                      <p className="text-sm text-gray-600 mt-1">{ban.reason}</p>
                      <p className="text-xs text-gray-500">
                        Expire: {formatDate(ban.expiresAt)} | Tentatives: {ban.attemptCount}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2 shrink-0">
                          <Unlock className="h-4 w-4 mr-2" />
                          Débannir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Débannir cette IP ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            L&apos;IP {ban.ip} pourra à nouveau tenter de se connecter.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUnbanIP(ban.ip)}>
                            Confirmer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
              <ClientPagination
                meta={bannedIPsData.meta}
                onPageChange={handleBannedIPsPageChange}
                onPageSizeChange={handleBannedIPsPageSizeChange}
                showPageSize
                disabled={isPending}
              />
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune IP bannie actuellement</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Failed Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Tentatives échouées récentes
          </CardTitle>
          <CardDescription>
            Dernières tentatives de connexion échouées (IP en clair pour traçabilité)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {failedAttemptsData && failedAttemptsData.data.length > 0 ? (
            <>
              <div className="space-y-2">
                {failedAttemptsData.data.map((attempt: FailedAttempt, index: number) => (
                  <div
                    key={`${attempt.ip}-${attempt.timestamp}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded shrink-0">
                          {attempt.ip}
                        </code>
                        <span
                          className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px]"
                          title={attempt.email}
                        >
                          {attempt.email}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(attempt.timestamp)}
                        {attempt.userAgent && (
                          <span className="block truncate max-w-md" title={attempt.userAgent}>
                            {attempt.userAgent.substring(0, 50)}...
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setBanIP(attempt.ip);
                        setBanReason(`Tentatives multiples avec ${attempt.email}`);
                      }}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <ClientPagination
                meta={failedAttemptsData.meta}
                onPageChange={handleFailedAttemptsPageChange}
                onPageSizeChange={handleFailedAttemptsPageSizeChange}
                showPageSize
                disabled={isPending}
              />
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune tentative échouée récente</p>
          )}
        </CardContent>
      </Card>

      {/* RGPD Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Note RGPD :</strong> Les adresses IP sont stockées en clair pour des raisons de sécurité
            (intérêt légitime - article 6.1.f du RGPD). Les données sont conservées 24h pour les tentatives
            échouées et 1h pour les bans. Cette conservation est nécessaire pour protéger le système contre
            les attaques par force brute.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
