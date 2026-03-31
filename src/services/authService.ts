import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_KEY = 'readit_auth_token';

const VALID_CREDENTIALS = {
  email: 'user@readit.dev',
  password: 'password123',
} as const;

// ─── Token payload shapes ─────────────────────────────────────────────────────

/** Mock token: exp is Unix ms (Date.now() + 86_400_000) */
interface MockTokenPayload {
  sub: string;
  iat: number; // ms
  exp: number; // ms
}

/** Real JWT payload from server: exp is Unix seconds */
interface JwtPayload {
  sub: string;
  email?: string;
  iat: number; // s
  exp: number; // s
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if `token` looks like a 3-part JWT (header.payload.signature). */
export function isRealJwt(token: string): boolean {
  return token.split('.').length === 3;
}

/** Decodes the payload of a real JWT without verifying the signature. */
function decodeJwtPayload(token: string): JwtPayload {
  const base64url = token.split('.')[1];
  // base64url → standard base64
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)) as JwtPayload;
}

// ─── Credential validation (client-side fallback) ────────────────────────────

export function validateCredentials(email: string, password: string): boolean {
  return (
    email === VALID_CREDENTIALS.email &&
    password === VALID_CREDENTIALS.password
  );
}

// ─── Mock token (used when server is unreachable) ────────────────────────────

export function createMockToken(email: string): string {
  const now = Date.now();
  const payload: MockTokenPayload = {
    sub: email,
    iat: now,
    exp: now + 86_400_000, // 24 hours in ms
  };
  return btoa(JSON.stringify(payload));
}

// ─── Token inspection ─────────────────────────────────────────────────────────

export function isTokenExpired(token: string): boolean {
  try {
    if (isRealJwt(token)) {
      // Real JWT — exp is in Unix seconds
      const { exp } = decodeJwtPayload(token);
      return Math.floor(Date.now() / 1000) >= exp;
    }
    // Mock token — exp is in Unix ms
    const payload = JSON.parse(atob(token)) as MockTokenPayload;
    return Date.now() >= payload.exp;
  } catch {
    return true;
  }
}

export function getTokenSubject(token: string): string | null {
  try {
    if (isRealJwt(token)) {
      return decodeJwtPayload(token).sub ?? null;
    }
    const payload = JSON.parse(atob(token)) as MockTokenPayload;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_KEY, token);
}

export async function retrieveToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_STORE_KEY);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
}

