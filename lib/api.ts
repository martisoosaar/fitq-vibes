const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = { ...(init.headers as any) };
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(input, { ...init, headers, credentials: 'include' });
  if (res.status !== 401) return res;
  // try refresh
  const r = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
  if (r.ok) {
    const data = await r.json().catch(() => ({}));
    if (data?.access_token && typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', data.access_token as string);
    }
    // retry original
    return fetch(input, { ...init, headers: { ...headers, Authorization: `Bearer ${data?.access_token}` }, credentials: 'include' });
  }
  return res;
}

type EmailCodeRequest = { email: string };
type EmailCodeVerify = { challenge_id: string; code: string; device_name?: string };

export async function requestEmailCode(body: EmailCodeRequest): Promise<{ challenge_id: string | null; test_mode?: boolean; test_code?: string }> {
  try {
    const res = await apiFetch(`${API_URL}/auth/email-code/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    // Always 200; may or may not include challenge_id depending on backend strategy
    const data = await res.json().catch(() => ({}));
    return { 
      challenge_id: data.challenge_id ?? null,
      test_mode: data.test_mode,
      test_code: data.test_code
    };
  } catch {
    return { challenge_id: null };
  }
}

export async function verifyEmailCode(body: EmailCodeVerify): Promise<boolean> {
  const res = await apiFetch(`${API_URL}/auth/email-code/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return false;
  // Access token in response; refresh cookie set via Set-Cookie
  const data = await res.json().catch(() => ({}));
  if (data?.access_token) {
    // store access token in sessionStorage; in SSR paths, rely on server actions/middleware
    if (typeof window !== 'undefined') sessionStorage.setItem('access_token', data.access_token as string);
  }
  return true;
}

export function oauthUrl(provider: 'google' | 'facebook' | 'stebby') {
  return `/api/auth/oauth/${provider}`;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch(`${API_URL}/auth/logout`, { method: 'POST' });
  } finally {
    if (typeof window !== 'undefined') sessionStorage.removeItem('access_token');
  }
}

export { apiFetch };
