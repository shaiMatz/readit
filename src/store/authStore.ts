import { create } from 'zustand';
import {
  validateCredentials,
  createMockToken,
  isTokenExpired,
  isRealJwt,
  getTokenSubject,
  storeToken,
  retrieveToken,
  clearToken,
} from '@/services/authService';
import * as authClient from '@/api/authClient';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: string | null;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  hydrateAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await retrieveToken();
      if (!token) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }

      if (isRealJwt(token)) {
        // Token came from the stub server — verify it there first
        const result = await authClient.verify(token);
        if (result === 'valid') {
          const user = getTokenSubject(token);
          set({ isAuthenticated: true, user, isLoading: false, error: null });
          return;
        }
        if (result === 'invalid') {
          await clearToken();
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }
        // result === 'unreachable': server is down — fall through to local expiry check
      }

      // Mock token, or server unreachable: check expiry locally
      if (!isTokenExpired(token)) {
        const user = getTokenSubject(token);
        set({ isAuthenticated: true, user, isLoading: false, error: null });
      } else {
        await clearToken();
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    // Try the stub server first
    const result = await authClient.login(email, password);

    if (result.status === 'ok') {
      // Real JWT from server
      await storeToken(result.token);
      set({ isAuthenticated: true, user: email, isLoading: false, error: null });
      return;
    }

    if (result.status === 'unauthorized') {
      // Server is running but credentials are wrong — don't fall through
      set({ isLoading: false, error: 'Invalid email or password' });
      return;
    }

    // result.status === 'unreachable': server not running — fall back to local mock auth
    if (!validateCredentials(email, password)) {
      set({ isLoading: false, error: 'Invalid email or password' });
      return;
    }
    const token = createMockToken(email);
    await storeToken(token);
    set({ isAuthenticated: true, user: email, isLoading: false, error: null });
  },

  logout: async () => {
    const token = await retrieveToken();
    if (token) {
      // Fire-and-forget — clears session on the server if it's running
      void authClient.logout(token);
    }
    await clearToken();
    set({ isAuthenticated: false, user: null, error: null });
  },
}));

