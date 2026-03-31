import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

export function useAuth() {
  const { isAuthenticated, isLoading, user, error, login, logout, hydrateAuth } =
    useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout: handleLogout,
    hydrateAuth,
  };
}
