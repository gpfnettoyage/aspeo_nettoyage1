import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { deleteMany } = vi.hoisted(() => ({ deleteMany: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: {
  deviceVerification: { deleteMany },
  session: { deleteMany },
  trustedDevice: { deleteMany },
} }));
import { GET } from '@/app/api/cron/cleanup/route';

beforeEach(() => {
  vi.clearAllMocks();
  deleteMany.mockResolvedValue({ count: 0 });
});
afterEach(() => vi.unstubAllEnvs());
const request = (authorization: string) => new NextRequest('http://localhost/api/cron/cleanup', { headers: { authorization } });

describe('nettoyage : authentification obligatoire avant toute suppression', () => {
  it.each([undefined, ''])('refuse un secret non configuré : %j', async (secret) => {
    vi.stubEnv('CRON_SECRET', secret);
    const response = await GET(request(`Bearer ${secret}`));
    expect(response.status).toBe(401);
    expect(deleteMany).not.toHaveBeenCalled();
  });
  it('refuse un jeton incorrect', async () => {
    vi.stubEnv('CRON_SECRET', 'test-only-cron-secret-at-least-32-characters');
    expect((await GET(request('Bearer wrong'))).status).toBe(401);
    expect(deleteMany).not.toHaveBeenCalled();
  });
  it('autorise le nettoyage avec le secret configuré (base simulée)', async () => {
    const secret = 'test-only-cron-secret-at-least-32-characters';
    vi.stubEnv('CRON_SECRET', secret);
    expect((await GET(request(`Bearer ${secret}`))).status).toBe(200);
    expect(deleteMany).toHaveBeenCalledTimes(3);
  });
});
