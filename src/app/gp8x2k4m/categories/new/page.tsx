import { redirect } from 'next/navigation';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';

export default function LegacyNew() {
  redirect(`${ADMIN_BASE_PATH}/contenus/categories/nouveau`);
}
