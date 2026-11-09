'use server';

import { Prisma } from '@prisma/client';
import { requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PAGE_CONTENT_MODELS } from '@/lib/site/page-content';
import { getPageDefinition } from '@/lib/site/pages-registry';
import { valuesToPageContent } from '@/lib/admin/page-forms';
import type { FormValues } from '@/lib/admin/values';
import { recordAudit } from '@/lib/admin/audit-log';
import { invalidatePublicSite } from '@/lib/site/cache';
import type { ActionResult } from './content.actions';

export interface PageSeoInput { seoTitle: string; seoDesc: string; ogImage: string; noindex: boolean }

const clean = (s: string, max: number) => s.trim().slice(0, max) || null;

/**
 * Enregistre une page fixe. « draft » : modifications en attente (le site ne change pas) ;
 * « publish » : mises en ligne immédiatement. Les pages fixes restent toujours en ligne.
 */
export async function savePageAction(key: string, values: FormValues, seo: PageSeoInput, intent: 'draft' | 'publish'): Promise<ActionResult> {
  const def = getPageDefinition(key);
  const model = PAGE_CONTENT_MODELS[key];
  if (!def) return { ok: false, message: 'Page inconnue.' };
  const session = await requirePermission('content:update');
  if (intent === 'publish') await requirePermission('content:publish');

  const { content, errors } = model ? valuesToPageContent(model, values) : { content: {}, errors: {} };
  if (seo.seoTitle.trim().length > 70) errors.seoTitle = '70 caractères maximum.';
  if (seo.seoDesc.trim().length > 170) errors.seoDesc = '170 caractères maximum.';
  if (Object.keys(errors).length) return { ok: false, message: 'Certains champs sont à corriger.', errors };

  const data = { content: content as Prisma.InputJsonValue, seoTitle: clean(seo.seoTitle, 70), seoDesc: clean(seo.seoDesc, 170), ogImage: clean(seo.ogImage, 500), noindex: !!seo.noindex || !!def.noindex };
  try {
    if (intent === 'draft') {
      await prisma.page.upsert({
        where: { key },
        update: { draft: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue },
        create: { key, title: def.title, path: def.path, status: 'PUBLISHED', draft: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue },
      });
      await recordAudit(session, 'draft', 'pages', key, def.title);
      invalidatePublicSite();
      return { ok: true, id: key, message: 'Brouillon enregistré (non visible sur le site).' };
    }
    await prisma.page.upsert({
      where: { key },
      update: { ...data, draft: Prisma.DbNull, status: 'PUBLISHED', publishedAt: new Date() },
      create: { key, title: def.title, path: def.path, ...data, status: 'PUBLISHED', publishedAt: new Date() },
    });
    await recordAudit(session, 'publish', 'pages', key, def.title);
    invalidatePublicSite();
    return { ok: true, id: key, message: 'Publié : les modifications sont en ligne.' };
  } catch (error) {
    console.error('[admin] page', error);
    return { ok: false, message: 'Enregistrement impossible. Réessayez.' };
  }
}

export async function discardPageDraftAction(key: string): Promise<ActionResult> {
  const session = await requirePermission('content:update');
  await prisma.page.updateMany({ where: { key }, data: { draft: Prisma.DbNull } });
  await recordAudit(session, 'update', 'pages', key, 'Brouillon abandonné');
  invalidatePublicSite();
  return { ok: true, id: key, message: 'Modifications en attente abandonnées.' };
}

