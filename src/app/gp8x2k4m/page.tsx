import { requireAdmin } from '@/lib/auth';
import { getServicesCount } from '@/lib/services';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import SecurityWidget from '@/components/admin/SecurityWidget';

async function StatsGrid() {
  const servicesCount = await getServicesCount();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Services Stats */}
      <Link href="/gp8x2k4m/services">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCount.total}</div>
            <p className="text-xs text-muted-foreground">
              services enregistrés
            </p>
          </CardContent>
        </Card>
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Publiés</CardTitle>
          <Eye className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{servicesCount.published}</div>
          <p className="text-xs text-muted-foreground">
            services visibles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          <EyeOff className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-500">{servicesCount.draft}</div>
          <p className="text-xs text-muted-foreground">
            services non publiés
          </p>
        </CardContent>
      </Card>

      {/* Security Widget */}
      <SecurityWidget />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Dashboard"
      description="Vue d'ensemble de votre site"
    >
      <Suspense fallback={<StatsSkeleton />}>
        <StatsGrid />
      </Suspense>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/gp8x2k4m/services/new"
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Nouveau service</h3>
              <p className="text-sm text-gray-500">Ajouter un service</p>
            </div>
          </Link>

          <Link
            href="/gp8x2k4m/services"
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Gérer les services</h3>
              <p className="text-sm text-gray-500">Voir tous les services</p>
            </div>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Voir le site</h3>
              <p className="text-sm text-gray-500">Ouvrir dans un nouvel onglet</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
