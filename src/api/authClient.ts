import { SERVER_URL, SERVER_TIMEOUT_MS } from '@/config/server';

// ─── Result types ─────────────────────────────────────────────────────────────

export type LoginResult =
  | { status: 'ok'; token: string }
  | { status: 'unauthorized' }
  | { status: 'unreachable' };

export type VerifyResult = 'valid' | 'invalid' | 'unreachable';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Returns a real JWT on success, 'unauthorized' for bad credentials,
 * or 'unreachable' when the server is not running.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await fetchWithTimeout(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = (await res.json()) as { token: string };
      return { status: 'ok', token: data.token };
    }
    return { status: 'unauthorized' };
  } catch {
    return { status: 'unreachable' };
  }
}

/**
 * GET /auth/verify  (Authorization: Bearer <token>)
 * Returns 'valid', 'invalid', or 'unreachable' (server down / offline).
 */
export async function verify(token: string): Promise<VerifyResult> {
  try {
    const res = await fetchWithTimeout(`${SERVER_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { valid: boolean };
      return data.valid ? 'valid' : 'invalid';
    }
    return 'invalid';
  } catch {
    return 'unreachable';
  }
}

/**
 * POST /auth/logout  (Authorization: Bearer <token>)
 * Fire-and-forget — the server is stateless, this is a courtesy call.
 */
export async function logout(token: string): Promise<void> {
  try {
    await fetchWithTimeout(`${SERVER_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Silently ignore — token is cleared locally regardless
  }
}
