import { redirect } from 'next/navigation';
import { ADMIN_BASE_PATH } from '@/lib/constants/admin';

/** Ancienne adresse : la gestion se fait désormais dans l'éditeur générique. */
export default function LegacyList() {
  redirect(`${ADMIN_BASE_PATH}/contenus/categories`);
}
