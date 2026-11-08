import { describe, it, expect } from 'vitest';
import { slugify, getPath, setPath, deepMerge, recordToValues, valuesToData } from '@/lib/admin/values';
import { getCollection } from '@/lib/admin/collections';
import type { CollectionDef } from '@/lib/admin/fields';

const realisations = getCollection('realisations') as CollectionDef;
const services = getCollection('services') as CollectionDef;

describe('slugify', () => {
  it('supprime accents, apostrophes et ponctuation', () => {
    expect(slugify('Nettoyage à Saint-Étienne : l’après-chantier !')).toBe('nettoyage-a-saint-etienne-l-apres-chantier');
    expect(slugify('  L\'Arbresle  ')).toBe('l-arbresle');
  });
  it('limite la longueur à 120 caractères', () => {
    expect(slugify('a'.repeat(300))).toHaveLength(120);
  });
});

describe('chemins et fusion', () => {
  it('lit et écrit des chemins imbriqués', () => {
    const o: Record<string, unknown> = {};
    setPath(o, 'content.gallery.before', 'x.webp');
    expect(getPath(o, 'content.gallery.before')).toBe('x.webp');
    expect(getPath(o, 'content.absent.deep')).toBeUndefined();
  });
  it('fusionne les objets en profondeur et remplace les tableaux', () => {
    expect(deepMerge({ a: { b: 1, c: 2 }, l: [1, 2] }, { a: { b: 3 }, l: [9] })).toEqual({ a: { b: 3, c: 2 }, l: [9] });
  });
});

describe('valuesToData', () => {
  it('exige les champs obligatoires et génère le slug depuis le titre', () => {
    const empty = valuesToData(realisations, {}, null);
    expect(empty.errors.title).toBe('Champ obligatoire.');
    const ok = valuesToData(realisations, { title: 'Chantier à Feurs' }, null);
    expect(ok.errors).toEqual({});
    expect(ok.data.slug).toBe('chantier-a-feurs');
  });

  it('convertit lignes, nombres, cases et dates', () => {
    const { data, errors } = valuesToData(realisations, { title: 'T', displayOrder: '3', featured: true }, null);
    expect(errors).toEqual({});
    expect(data.displayOrder).toBe(3);
    expect(data.featured).toBe(true);
    const bad = valuesToData(realisations, { title: 'T', displayOrder: 'abc' }, null);
    expect(bad.errors.displayOrder).toBe('Nombre invalide.');
  });

  it('valide les sous-champs obligatoires des listes et ignore les lignes vides', () => {
    const { data, errors } = valuesToData(realisations, { title: 'T', facts: [{ k: 'Surface', v: '' }, { k: '', v: '' }] }, null);
    expect(errors.facts).toContain('« Valeur » est obligatoire');
    expect(data.facts).toHaveLength(1);
  });

  it('conserve les clés JSON historiques absentes du formulaire', () => {
    const existing = { id: '1', title: 'S', slug: 's', content: { legacyKey: 'ancien texte', problem: 'avant' } };
    const values = recordToValues(services, existing);
    values['content.problem'] = 'après';
    const { data } = valuesToData(services, values, existing);
    expect(data.content).toMatchObject({ legacyKey: 'ancien texte', problem: 'après' });
  });

  it('signale les textes trop longs', () => {
    const { errors } = valuesToData(realisations, { title: 'x'.repeat(200) }, null);
    expect(errors.title).toMatch(/140 caractères maximum/);
  });
});
