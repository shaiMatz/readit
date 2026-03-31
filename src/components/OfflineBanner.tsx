import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from '@/hooks/useTheme';
import { spacing, fontSizes } from '@/theme';

const BANNER_HEIGHT = 40;

/**
 * Slides down from the top when the device loses connectivity.
 * Animation runs on the UI thread via Reanimated.
 */
export function OfflineBanner() {
  const { colors } = useTheme();
  const { isConnected } = useNetInfo();
  // isConnected === null means NetInfo hasn't resolved yet — treat as online
  // to avoid false-positive banners on startup, emulators, or slow networks.
  const visible = isConnected === false;

  const translateY = useSharedValue(-BANNER_HEIGHT);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -BANNER_HEIGHT, {
      duration: 300,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: colors.offline },
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLabel="No internet connection"
    >
      <Ionicons name="cloud-offline-outline" size={16} color={colors.textOnBrand} />
      <Text style={[styles.text, { color: colors.textOnBrand }]}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: BANNER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    zIndex: 100,
  },
  text: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
