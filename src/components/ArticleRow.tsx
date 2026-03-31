import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { getDomain, getRelativeTime, formatCount } from '@/utils/formatters';
import { BookmarkButton } from './BookmarkButton';
import { spacing, radius, shadows } from '@/theme';
import type { HNItem } from '@/api/hackerNewsClient';

//  Avatar palette (deterministic, seed = domain) 

const PALETTES: Array<readonly [string, string]> = [
  ['#4776E6', '#8E54E9'],
  ['#11998e', '#38ef7d'],
  ['#cb2d3e', '#ef473a'],
  ['#3494E6', '#EC6EAD'],
  ['#f953c6', '#b91d73'],
  ['#43C6AC', '#191654'],
  ['#F7971E', '#FFD200'],
  ['#6441A5', '#2a0845'],
  ['#0575E6', '#021B79'],
  ['#ee9ca7', '#ffdde1'],
];

function getPalette(seed: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i);
  return PALETTES[hash % PALETTES.length];
}

//  Constants 

/**
 * Approximate rendered slot height (card + margins)  used for drawDistance
 * in FlashList v2. Not a strict constraint since FlashList v2 auto-measures.
 */
export const ARTICLE_ROW_HEIGHT = 118;

//  Props 

interface ArticleRowProps {
  item: HNItem;
  index: number;
  isBookmarked: boolean;
  onPress: (item: HNItem) => void;
  onBookmarkToggle: (item: HNItem) => void;
  animate?: boolean;
}

//  Component 

function ArticleRowComponent({
  item,
  index,
  isBookmarked,
  onPress,
  onBookmarkToggle,
  animate = true,
}: ArticleRowProps) {
  const { colors, isDark } = useTheme();

  const handlePress = useCallback(() => onPress(item), [item, onPress]);
  const handleBookmark = useCallback(() => onBookmarkToggle(item), [item, onBookmarkToggle]);

  const domain = getDomain(item.url);
  const relativeTime = getRelativeTime(item.time ?? 0);
  const score = formatCount(item.score ?? 0);
  const comments = formatCount(item.descendants ?? 0);
  const letter = domain ? domain[0].toUpperCase() : 'H';
  const [gradFrom, gradTo] = getPalette(domain || 'hn');

  const content = (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: isDark ? 'transparent' : '#000',
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.title ?? 'Article'}
      accessibilityHint="Opens article detail"
    >
      {/*  Left: text content  */}
      <View style={styles.left}>
        {domain ? (
          <View style={[styles.sourcePill, { backgroundColor: colors.brand + '15' }]}>
            <Text style={[styles.sourceText, { color: colors.brand }]}>{domain}</Text>
          </View>
        ) : null}

        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {item.title ?? 'Untitled'}
        </Text>

        <View style={styles.meta}>
          <Ionicons name="arrow-up-outline" size={11} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>{score}</Text>
          <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
          <Ionicons name="chatbubble-outline" size={11} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>{comments}</Text>
          <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>{relativeTime}</Text>
        </View>
      </View>

      {/*  Right: avatar + bookmark  */}
      <View style={styles.right}>
        <BookmarkButton isBookmarked={isBookmarked} onPress={handleBookmark} size={18} />
      </View>
    </Pressable>
  );

  if (!animate) return content;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 12) * 50).springify().damping(18)}
    >
      {content}
    </Animated.View>
  );
}

export const ArticleRow = memo(ArticleRowComponent);

//  Styles 

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    ...shadows.small,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
  },
  sourcePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  dot: {
    fontSize: 11,
  },
  right: {
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
  },
});
