import {
  createServiceSchema,
  serviceSlugSchema,
} from '@/actions/services/schema';

describe('service schema safety', () => {
  it('normalizes title whitespace and slug special characters', () => {
    const result = createServiceSchema.safeParse({
      title: '  Bases   de Vie & Autoroutes  ',
      slug: 'Bases de Vie & Autoroutes',
      published: true,
      content: {},
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.title).toBe('Bases de Vie & Autoroutes');
    expect(result.data.slug).toBe('bases-de-vie-autoroutes');
  });

  it('rejects punctuation-only titles', () => {
    const result = createServiceSchema.safeParse({
      title: '***',
      slug: 'service-test',
      published: true,
      content: {},
    });

    expect(result.success).toBe(false);
  });

  it('rejects unsafe title characters', () => {
    const result = createServiceSchema.safeParse({
      title: 'Nettoyage <script>',
      slug: 'nettoyage-test',
      published: true,
      content: {},
    });

    expect(result.success).toBe(false);
  });

  it('rejects slugs that normalize to an empty value', () => {
    const result = serviceSlugSchema.safeParse('🚧 & /');

    expect(result.success).toBe(false);
  });
});
