import { extractClientIP } from '@/lib/utils/ip';

describe('extractClientIP', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.100',
    });

    expect(extractClientIP(headers)).toBe('192.168.1.100');
  });

  it('extracts first IP from x-forwarded-for with multiple IPs', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.50, 70.41.3.18, 150.172.238.178',
    });

    expect(extractClientIP(headers)).toBe('203.0.113.50');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = new Headers({
      'x-real-ip': '10.0.0.1',
    });

    expect(extractClientIP(headers)).toBe('10.0.0.1');
  });

  it('falls back to cf-connecting-ip (Cloudflare) when other headers are absent', () => {
    const headers = new Headers({
      'cf-connecting-ip': '172.16.0.1',
    });

    expect(extractClientIP(headers)).toBe('172.16.0.1');
  });

  it('returns "unknown" when no IP headers are present', () => {
    const headers = new Headers();

    expect(extractClientIP(headers)).toBe('unknown');
  });

  it('handles empty x-forwarded-for header', () => {
    const headers = new Headers({
      'x-forwarded-for': '',
      'x-real-ip': '192.168.0.1',
    });

    expect(extractClientIP(headers)).toBe('192.168.0.1');
  });

  it('handles x-forwarded-for with only whitespace', () => {
    const headers = new Headers({
      'x-forwarded-for': '   ',
      'cf-connecting-ip': '8.8.8.8',
    });

    expect(extractClientIP(headers)).toBe('8.8.8.8');
  });

  it('prioritizes x-forwarded-for over other headers', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.1.1.1',
      'x-real-ip': '2.2.2.2',
      'cf-connecting-ip': '3.3.3.3',
    });

    expect(extractClientIP(headers)).toBe('1.1.1.1');
  });
});
