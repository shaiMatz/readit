import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function FeedStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.brand,
        headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Feed list*/}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      {/* Article detail */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
