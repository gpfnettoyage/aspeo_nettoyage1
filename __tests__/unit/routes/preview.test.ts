import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, enable } = vi.hoisted(() => ({ getSession: vi.fn(), enable: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getSession }));
vi.mock('next/headers', () => ({ draftMode: async () => ({ enable }) }));
import { GET } from '@/app/api/preview/route';

const request = (path: string) => new Request(`https://aspeo.fr/api/preview?${new URLSearchParams({ path })}`);

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue({ user: { role: 'ADMIN' } });
});

describe('prévisualisation : redirections limitées au site', () => {
  it.each([
    '/\t/evil.example', '/\n/evil.example', '/\r/evil.example',
    '/\n/[invalid-host',
    '//evil.example', '/\\evil.example', 'https://evil.example', 'javascript:alert(1)',
  ])('refuse une destination externe : %j', async (path) => {
    const response = await GET(request(path));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://aspeo.fr/');
    expect(enable).toHaveBeenCalledOnce();
  });

  it('conserve le chemin, les paramètres et l’ancre internes', async () => {
    const path = '/medias/actualites?draft=1#article';
    const response = await GET(request(path));
    expect(response.headers.get('location')).toBe(`https://aspeo.fr${path}`);
  });

  it.each([null, { user: { role: 'USER' } }])('refuse un visiteur sans accès admin : %j', async (session) => {
    getSession.mockResolvedValue(session);
    const response = await GET(request('/'));
    expect(response.status).toBe(401);
    expect(enable).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toBeNull();
  });
});
