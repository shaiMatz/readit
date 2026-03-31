import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/theme';

import { ARTICLE_ROW_HEIGHT } from './ArticleRow';

// ─── Shimmer block ────────────────────────────────────────────────────────────

interface ShimmerBlockProps {
  width: number | `${number}%`;
  height: number;
  progress: SharedValue<number>;
}

function ShimmerBlock({ width, height, progress }: ShimmerBlockProps) {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(progress.value, [0, 1], [0.45, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius: radius.sm, backgroundColor: colors.skeletonBase },
        animatedStyle,
      ]}
    />
  );
}

// ─── SkeletonRow ─────────────────────────────────────────────────────────────

/**
 * Placeholder row rendered while articles are loading.
 * The shimmer animation runs entirely on the UI thread via a Reanimated worklet.
 */
export function SkeletonRow() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  return (
    <View style={styles.card}>
      {/* Left: text content */}
      <View style={styles.left}>
        {/* Source pill */}
        <ShimmerBlock width={72} height={16} progress={progress} />
        {/* Title line 1 */}
        <ShimmerBlock width="90%" height={14} progress={progress} />
        {/* Title line 2 (shorter) */}
        <ShimmerBlock width="65%" height={14} progress={progress} />
        {/* Meta row */}
        <View style={styles.metaRow}>
          <ShimmerBlock width={32} height={10} progress={progress} />
          <ShimmerBlock width={28} height={10} progress={progress} />
          <ShimmerBlock width={44} height={10} progress={progress} />
        </View>
      </View>

      {/* Right: avatar placeholder */}
      <View style={styles.right}>
        <ShimmerBlock width={72} height={72} progress={progress} />
        <ShimmerBlock width={20} height={20} progress={progress} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.md,
    height: ARTICLE_ROW_HEIGHT,
  },
  left: {
    flex: 1,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  right: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  block: {},
});
