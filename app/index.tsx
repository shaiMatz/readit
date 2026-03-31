import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

/**
 * Root entry point for Expo Router.
 * Responsible for the initial auth hydration + redirect decision.
 * AuthGate in _layout.tsx handles subsequent runtime changes (logout, expiry).
 */
export default function Index() {
  const { isAuthenticated, isLoading, hydrateAuth } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    hydrateAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(app)/feed' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
