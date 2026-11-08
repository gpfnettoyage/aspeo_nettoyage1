import { describe, it, expect } from 'vitest';
import { PAGE_CONTENT_MODELS } from '@/lib/site/page-content';
import { pageToValues, valuesToPageContent, pageGroups } from '@/lib/admin/page-forms';
import { settingsToValues, valuesToSettings } from '@/lib/admin/settings-forms';
import { DEFAULT_SETTINGS } from '@/lib/site/settings-defaults';

const home = PAGE_CONTENT_MODELS.accueil!;

describe('formulaires des pages fixes', () => {
  it('affiche les textes de la maquette par défaut', () => {
    const v = pageToValues(home, null);
    expect(v['hero.eyebrow']).toBe('Propreté & services aux entreprises');
    expect(pageGroups(home).length).toBe(home.sections.length);
  });
  it('n’enregistre que les valeurs modifiées', () => {
    const v = pageToValues(home, null);
    expect(valuesToPageContent(home, v).content).toEqual({});
    v['hero.eyebrow'] = 'Nouveau surtitre';
    expect(valuesToPageContent(home, v).content).toEqual({ 'hero.eyebrow': 'Nouveau surtitre' });
  });
  it('un champ vidé revient au texte d’origine ; une liste vidée est enregistrée vide', () => {
    const v = pageToValues(home, { 'hero.eyebrow': 'Autre' });
    v['hero.eyebrow'] = '';
    v['hero.images'] = [];
    const { content } = valuesToPageContent(home, v);
    expect(content['hero.eyebrow']).toBeUndefined();
    expect(content['hero.images']).toEqual([]);
  });
  it('contrôle les longueurs maximales', () => {
    const v = pageToValues(home, null);
    v['hero.title'] = 'x'.repeat(130);
    expect(valuesToPageContent(home, v).errors['hero.title']).toMatch(/120 caractères/);
  });
});

describe('formulaires des réglages', () => {
  const company = DEFAULT_SETTINGS.company as unknown as Record<string, unknown>;
  it('aller-retour sans perte', () => {
    const res = valuesToSettings('company', settingsToValues('company', company), company);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data).toEqual(company);
  });
  it('refuse une adresse e-mail invalide avec un message en français', () => {
    const v = settingsToValues('company', company);
    v.email = 'pas-une-adresse';
    const res = valuesToSettings('company', v, company);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.email).toBe('Adresse e-mail invalide.');
  });
  it('convertit les destinataires (une adresse par ligne) et exige au moins une adresse', () => {
    const n = DEFAULT_SETTINGS.notifications as unknown as Record<string, unknown>;
    const v = settingsToValues('notifications', n);
    v.quoteRecipients = 'a@aspeo.fr\n\n b@aspeo.fr ';
    const ok = valuesToSettings('notifications', v, n);
    expect(ok.ok && ok.data.quoteRecipients).toEqual(['a@aspeo.fr', 'b@aspeo.fr']);
    v.quoteRecipients = '';
    const ko = valuesToSettings('notifications', v, n);
    expect(ko.ok).toBe(false);
  });
  it('gère la case « Affiché » des liens de navigation', () => {
    const nav = DEFAULT_SETTINGS.navigation as unknown as Record<string, unknown>;
    const v = settingsToValues('navigation', nav);
    (v.topbar as Record<string, string>[])[0]!.visible = 'false';
    const res = valuesToSettings('navigation', v, nav);
    expect(res.ok && (res.data.topbar as { visible: boolean }[])[0]!.visible).toBe(false);
  });
});
