import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

/**
 * Watches runtime auth state changes (logout, token expiry) and redirects
 * accordingly. Initial hydration + first-load redirect is handled by
 * app/index.tsx.
 */
function AuthGate() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    if (!isAuthenticated && inAppGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/feed');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function RootLayoutInner() {
  const { isDark, colors } = useTheme();
  const { isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <SafeAreaProvider>
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          // Fills the gap between screens during transitions — prevents white flash
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
