import { redirect } from 'next/navigation';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';

export default async function LegacyEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`${ADMIN_BASE_PATH}/contenus/categories/${encodeURIComponent(id)}`);
}
