import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BookmarkButton } from './BookmarkButton';
import { getDomain, getRelativeTime, formatCount } from '@/utils/formatters';
import { spacing, radius, shadows } from '@/theme';
import type { HNItem } from '@/api/hackerNewsClient';

// ─── Avatar palette ────────────────────────────────────────────────────────────

const PALETTES: Array<readonly [string, string]> = [
  ['#4776E6', '#8E54E9'],
  ['#11998e', '#38ef7d'],
  ['#cb2d3e', '#ef473a'],
  ['#3494E6', '#EC6EAD'],
  ['#f953c6', '#b91d73'],
  ['#43C6AC', '#191654'],
  ['#F7971E', '#FFD200'],
  ['#6441A5', '#2a0845'],
];

function getPalette(seed: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i);
  return PALETTES[hash % PALETTES.length];
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FeaturedCardProps {
  item: HNItem;
  isBookmarked: boolean;
  onPress: (item: HNItem) => void;
  onBookmarkToggle: (item: HNItem) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function FeaturedCard({
  item,
  isBookmarked,
  onPress,
  onBookmarkToggle,
}: FeaturedCardProps) {
  const { colors, isDark } = useTheme();

  const handlePress = useCallback(() => onPress(item), [item, onPress]);
  const handleBookmark = useCallback(() => onBookmarkToggle(item), [item, onBookmarkToggle]);

  const domain = getDomain(item.url);
  const time = getRelativeTime(item.time ?? 0);
  const score = formatCount(item.score ?? 0);
  const comments = formatCount(item.descendants ?? 0);
  const letter = domain ? domain[0].toUpperCase() : 'H';
  const [gradFrom, gradTo] = getPalette(domain || 'hn');

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: isDark ? colors.brand : '#000',
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={item.title ?? 'Featured article'}
      >
        {/* ── Gradient image area ── */}
        <View style={styles.imageArea}>
          <LinearGradient
            colors={[gradFrom, gradTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Watermark letter */}
          <Text style={styles.watermark}>{letter}</Text>

          {/* Score chip — bottom left */}
          <View style={[styles.scoreBadge, { backgroundColor: 'rgba(0,0,0,0.40)' }]}>
            <Ionicons name="arrow-up" size={11} color="#fff" />
            <Text style={styles.scoreBadgeText}>{score}</Text>
          </View>

          {/* Bookmark — top right */}
          <View style={styles.bookmarkOverlay}>
            <BookmarkButton isBookmarked={isBookmarked} onPress={handleBookmark} size={20} />
          </View>
        </View>

        {/* ── Text content ── */}
        <View style={styles.content}>
          {domain ? (
            <View style={[styles.sourcePill, { backgroundColor: colors.brand + '18' }]}>
              <Text style={[styles.sourceText, { color: colors.brand }]}>{domain}</Text>
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.title ?? 'Untitled'}
          </Text>

          <View style={styles.meta}>
            <Ionicons name="chatbubble-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>{comments}</Text>
            <Text style={[styles.metaDot, { color: colors.textTertiary }]}>·</Text>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>{time}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...shadows.medium,
  },
  imageArea: {
    height: 176,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermark: {
    fontSize: 100,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: -4,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  scoreBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  bookmarkOverlay: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: radius.full,
    padding: 4,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sourcePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: spacing.xxs,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xxs,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
});
