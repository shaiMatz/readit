import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

/**
 * Stack navigator scoped to the Feed tab.
 * feed/index.tsx — headerShown:false (screen owns its header via SafeAreaView)
 * feed/[id].tsx  — headerShown:false (screen owns a custom drag-to-dismiss header)
 */
export default function FeedStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        // Default header style — individual screens override as needed
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.brand,
        headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
        headerShadowVisible: false,
        // Hide iOS back-button text label (show icon only)
        headerBackButtonDisplayMode: 'minimal',
        // Background between screens so no white flash during transitions
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Feed list — full-screen, manages its own header */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      {/* Article detail — slide from right on Android/iOS, custom header inside */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          // Gesture-based back is intentionally left enabled so the
          // drag-to-dismiss worklet and the swipe-back gesture co-exist;
          // the threshold in [id].tsx wins when dragging down.
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
