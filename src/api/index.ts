export const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || '';

export type LoginResponse = { token: string };

export type VideoVariant = {
  variantId: string;
  format: string;
  resolution: string;
  url: string;
  transcode_status: 'queued' | 'processing' | 'completed' | 'failed';
  size?: number;
};

export type VideoItem = {
  videoId: string;
  fileName: string;
  title: string | null;
  description: string | null;
  createdAt?: string;
  createdBy?: string;
  variants?: VideoVariant[];
};

let _token: string | null = null;

export function setToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem('jwt', t);
  else localStorage.removeItem('jwt');
}

export function getToken() {
  return _token ?? localStorage.getItem('jwt');
}

async function req(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers['authorization'] = `Bearer ${token}`;

  const r = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Optional: auto-logout on 401 so the app can recover gracefully
  if (r.status === 401) {
    setToken(null);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {}
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    throw new Error('401 Unauthorized');
  }

  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r;
}

export async function login(username: string, password: string) {
  const r = await req('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const j = (await r.json()) as LoginResponse;
  setToken(j.token);
  return j;
}

export async function logout() {
  setToken(null);
}

export type ListQuery = {
  limit?: number;
  sort?: string; // e.g. createdAt:desc
  createdBy?: 'me' | string;
  filter?: string; // e.g. transcode_status:completed
  q?: string; // optional free text (if server supports it)
  cursor?: string; // JSON string from previous response.pagination.cursor
};

export async function listVideos(
  q: ListQuery
): Promise<{ videos: VideoItem[]; total?: number; pagination?: { cursor?: any } }> {
  const qp = new URLSearchParams();
  if (q.limit != null) qp.set('limit', String(q.limit));
  if (q.sort) qp.set('sort', q.sort);
  if (q.createdBy) qp.set('createdBy', q.createdBy);
  if (q.filter) qp.set('filter', q.filter);
  if (q.q) qp.set('q', q.q);
  if (q.cursor) qp.set('cursor', q.cursor); // raw JSON string; URLSearchParams will encode

  const r = await req(`/api/v1/videos?${qp.toString()}`);
  return r.json();
}

export async function getVideo(videoId: string): Promise<VideoItem> {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`);
  return r.json();
}

export async function updateVideo(
  videoId: string,
  patch: Partial<Pick<VideoItem, 'title' | 'description'>>
): Promise<VideoItem> {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.json();
}

export async function deleteVideo(videoId: string): Promise<{ ok: true }> {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`, { method: 'DELETE' });
  return r.json();
}

export async function startTranscode(videoId: string) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}/transcode`, {
    method: 'POST',
    body: JSON.stringify({ force: true }),
  });
  return r.json();
}

// Upload flow based on your client-upload.js
export type PresignSingle = {
  strategy: 'single';
  url: string;
  key: string;
  videoId: string;
};
export type PresignPart = { partNumber: number; url: string };
export type PresignMultipart = {
  strategy: 'multipart';
  key: string;
  uploadId: string;
  videoId: string;
  parts: PresignPart[];
  partSizeBytes: number;
};
export type Presign = PresignSingle | PresignMultipart;

export async function createUploadUrl(fileName: string, sizeBytes: number): Promise<Presign> {
  const r = await req('/api/v1/videos/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, sizeBytes, contentType: 'video/mp4' }),
  });
  return r.json();
}

export async function completeUpload(body: any) {
  const r = await req('/api/v1/videos/complete-upload', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return r.json();
}
