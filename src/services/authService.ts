import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const SECURE_STORE_KEY = 'readit_auth_token';

const VALID_CREDENTIALS = {
  email: 'user@readit.dev',
  password: 'password123',
} as const;

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function validateCredentials(email: string, password: string): boolean {
  return (
    email === VALID_CREDENTIALS.email &&
    password === VALID_CREDENTIALS.password
  );
}

export function createMockToken(email: string): string {
  const now = Date.now();
  const payload: TokenPayload = {
    sub: email,
    iat: now,
    exp: now + 86_400_000, // 24 hours
  };
  return btoa(JSON.stringify(payload));
}

export function isTokenExpired(token: string): boolean {
  try {
    // Our mock tokens are base64 JSON, not real JWTs — parse directly
    const raw = atob(token);
    const payload = JSON.parse(raw) as TokenPayload;
    return Date.now() >= payload.exp;
  } catch {
    return true;
  }
}

export function getTokenSubject(token: string): string | null {
  try {
    const raw = atob(token);
    const payload = JSON.parse(raw) as TokenPayload;
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

