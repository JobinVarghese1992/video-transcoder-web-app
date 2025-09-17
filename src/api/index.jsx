export const BASE_URL = (import.meta.env.VITE_BASE_URL) || '';

let _token = null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('jwt', t);
  else localStorage.removeItem('jwt');
}

export function getToken() {
  return _token ?? localStorage.getItem('jwt');
}

async function req(path, init = {}) {
  const headers = {
    'content-type': 'application/json',
    ...(init.headers || {}),
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
      } catch { }
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    throw new Error('401 Unauthorized');
  }

  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r;
}

export async function login(username, password) {
  const r = await req('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const j = await r.json();
  setToken(j.token);
  return j;
}

export async function logout() {
  setToken(null);
}

// q = { limit, sort, createdBy, filter, q, cursor }
export async function listVideos(q = {}) {
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

export async function getVideo(videoId) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`);
  return r.json();
}

export async function updateVideo(videoId, patch) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.json();
}

export async function deleteVideo(videoId) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`, { method: 'DELETE' });
  return r.json();
}

export async function startTranscode(videoId) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}/transcode`, {
    method: 'POST',
    body: JSON.stringify({ force: true }),
  });
  return r.json();
}

export async function createUploadUrl(fileName, sizeBytes) {
  const r = await req('/api/v1/videos/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, sizeBytes, contentType: 'video/mp4' }),
  });
  return r.json();
}

export async function completeUpload(body) {
  const r = await req('/api/v1/videos/complete-upload', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return r.json();
}