import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onPress: () => void;
  size?: number;
}

/**
 * Animated bookmark icon. On press:
 *  - Scales down to 0.8 then springs back to 1.0 (UI-thread spring worklet).
 *  - Icon and colour update to reflect the new state.
 */
export function BookmarkButton({ isBookmarked, onPress, size = 22 }: BookmarkButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.75, { damping: 10, stiffness: 400 }),
      withSpring(1.0, { damping: 12, stiffness: 300 }),
    );
    onPress();
  }, [onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      style={styles.btn}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={size}
          color={isBookmarked ? colors.brand : colors.icon}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
});
