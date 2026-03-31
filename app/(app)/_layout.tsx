import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarksStore } from '@/store/bookmarksStore';

export default function AppLayout() {
  const { colors } = useTheme();
  const bookmarkCount = useBookmarksStore((s) => Object.keys(s.bookmarks).length);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          borderTopWidth: StyleSheet.hairlineWidth,
          // Android elevation
          elevation: 12,
          // iOS shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarBadge: bookmarkCount > 0 ? bookmarkCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.brand,
            color: colors.textOnBrand,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
            lineHeight: Platform.OS === 'android' ? 15 : 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
