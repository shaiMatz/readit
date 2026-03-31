import { create } from 'zustand';
import {
  validateCredentials,
  createMockToken,
  isTokenExpired,
  getTokenSubject,
  storeToken,
  retrieveToken,
  clearToken,
} from '@/services/authService';

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
      if (token && !isTokenExpired(token)) {
        const user = getTokenSubject(token);
        set({ isAuthenticated: true, user, isLoading: false, error: null });
      } else {
        if (token) {
          // Token exists but expired — clean it up
          await clearToken();
        }
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    if (!validateCredentials(email, password)) {
      set({ isLoading: false, error: 'Invalid email or password' });
      return;
    }
    const token = createMockToken(email);
    await storeToken(token);
    set({ isAuthenticated: true, user: email, isLoading: false, error: null });
  },

  logout: async () => {
    await clearToken();
    set({ isAuthenticated: false, user: null, error: null });
  },
}));

