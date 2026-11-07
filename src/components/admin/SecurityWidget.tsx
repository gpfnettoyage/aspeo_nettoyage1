'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, Ban, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getSecurityStatsAction } from '@/actions/security/security.actions';

interface QuickStats {
  failedAttemptsLast24h: number;
  bannedIPsCount: number;
}

export default function SecurityWidget() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSecurityStatsAction();
        setStats({
          failedAttemptsLast24h: data.failedAttemptsLast24h,
          bannedIPsCount: data.bannedIPsCount,
        });
      } catch (error) {
        console.error('Failed to fetch security stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const isAlert = (stats?.failedAttemptsLast24h || 0) > 10 || (stats?.bannedIPsCount || 0) > 0;

  if (loading) {
    return (
      <Link href="/gp8x2k4m/security">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href="/gp8x2k4m/security">
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isAlert ? 'border-orange-300 bg-orange-50/50' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
          {isAlert ? (
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          ) : (
            <Shield className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isAlert ? 'destructive' : 'default'} className="mb-2">
                {isAlert ? 'Attention requise' : 'Normal'}
              </Badge>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  {stats?.failedAttemptsLast24h || 0} tentatives
                </span>
                <span className="flex items-center gap-1">
                  <Ban className="h-3 w-3" />
                  {stats?.bannedIPsCount || 0} IPs bannies
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
