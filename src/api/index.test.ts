import { describe, it, expect, vi } from 'vitest';
import * as API from '@/api';

function mockFetchOnce(handler: (url: string, init?: RequestInit) => any) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
    const r = await handler(String(url), init);
    return new Response(JSON.stringify(r ?? {}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
}

describe('API client', () => {
  it('login stores token and sends Authorization next time', async () => {
    // first call: login
    mockFetchOnce((url, init) => {
      expect(url).toContain('/api/v1/auth/login');
      const body = JSON.parse(String(init?.body || '{}'));
      expect(body).toMatchObject({ username: 'u', password: 'p' });
      return { token: 'abc' };
    });
    const res = await API.login('u', 'p');
    expect(res.token).toBe('abc');
    expect(localStorage.getItem('jwt')).toBe('abc');

    // second call: listVideos includes bearer
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
      expect(url).toContain('/api/v1/videos');
      expect(init?.headers?.authorization || init?.headers?.Authorization).toBe('Bearer abc');
      return new Response(JSON.stringify({ videos: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const list = await API.listVideos({ page: 2, limit: 10, sort: 'createdAt:desc', createdBy: 'me', filter: 'transcode_status:completed' });
    expect(Array.isArray(list.videos)).toBe(true);
  });

  it('listVideos builds query string correctly (createdBy & filter included)', async () => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const s = String(url);
      expect(s).toContain('page=3');
      expect(s).toContain('limit=50');
      expect(s).toContain(encodeURIComponent('createdAt:asc'));
      expect(s).toContain('createdBy=me');
      expect(s).toContain(encodeURIComponent('transcode_status:completed'));
      return new Response(JSON.stringify({ videos: [], total: 42 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const res = await API.listVideos({ page: 3, limit: 50, sort: 'createdAt:asc', createdBy: 'me', filter: 'transcode_status:completed' });
    expect(res.total).toBe(42);
  });
});