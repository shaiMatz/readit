import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useFeed } from '@/hooks/useFeed';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ArticleRow, ARTICLE_ROW_HEIGHT } from '@/components/ArticleRow';
import { FeaturedCard } from '@/components/FeaturedCard';
import { SkeletonRow } from '@/components/SkeletonRow';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Image } from 'react-native';
import { spacing, fontSizes, radius } from '@/theme';
import type { HNItem } from '@/api/hackerNewsClient';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'all' | 'ask' | 'show' | 'jobs' | 'launch';
type SortKey = 'top' | 'newest' | 'points';

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ask', label: 'Ask HN' },
  { key: 'show', label: 'Show HN' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'launch', label: 'Launch' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'top', label: 'Trending' },
  { key: 'newest', label: 'Newest' },
  { key: 'points', label: 'Top Rated' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterItems(items: HNItem[], category: Category): HNItem[] {
  if (category === 'all') return items;
  if (category === 'ask') return items.filter(i => i.title?.startsWith('Ask HN'));
  if (category === 'show') return items.filter(i => i.title?.startsWith('Show HN'));
  if (category === 'jobs') return items.filter(i => i.type === 'job');
  if (category === 'launch') return items.filter(i => i.title?.startsWith('Launch HN'));
  return items;
}

function sortItems(items: HNItem[], sort: SortKey): HNItem[] {
  if (sort === 'top') return items;
  const copy = [...items];
  if (sort === 'newest') copy.sort((a, b) => (b.time ?? 0) - (a.time ?? 0));
  if (sort === 'points') copy.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return copy;
}

// ─── Feed screen ─────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    items,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    fetchFeed,
    clearError,
  } = useFeed();
  const { isBookmarked, toggle, bookmarks } = useBookmarks();

  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortKey>('top');

  const filteredItems = useMemo(() => filterItems(items, category), [items, category]);
  const sortedItems = useMemo(() => sortItems(filteredItems, sortBy), [filteredItems, sortBy]);
  const featuredItem = sortedItems[0] ?? null;
  const listItems = sortedItems.slice(1);

  const firstRender = useRef(true);
  const shouldAnimate = firstRender.current && listItems.length > 0 && !isLoading;
  if (shouldAnimate) firstRender.current = false;

  const listRef = useRef<FlashListRef<HNItem>>(null);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [sortBy, category]);

  const handlePress = useCallback(
    (item: HNItem) => router.push(`/(app)/feed/${item.id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: HNItem; index: number }) => (
      <ArticleRow
        item={item}
        index={index}
        isBookmarked={isBookmarked(item.id)}
        onPress={handlePress}
        onBookmarkToggle={toggle}
        animate={shouldAnimate}
      />
    ),
    [isBookmarked, toggle, handlePress, shouldAnimate, bookmarks],
  );

  const keyExtractor = useCallback((item: HNItem) => String(item.id), []);

  // ── Header component (scrolls with list) ──────────────────────────────────
  const Header = useMemo(
    () => (
      <View style={{ backgroundColor: colors.background }}>
             {/* Offline / error banners */}
        <OfflineBanner />
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '18' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <Pressable onPress={clearError}>
              <Text style={[styles.retryLink, { color: colors.brand }]}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
       
        {/* App bar */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.headerBrand}>
            <Image
              source={require('../../../assets/ReadIt_No_Bg_and_txt.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={[styles.headerAppName, { color: colors.textPrimary }]}>
              Read<Text style={{ color: colors.brand }}>It</Text>
            </Text>
          </View>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              style={[
                styles.categoryChip,
                category === cat.key
                  ? { backgroundColor: colors.brand }
                  : { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: category === cat.key ? colors.textOnBrand : colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

  

        {/* Featured card or skeleton */}
        {isLoading ? (
          <View
            style={[
              styles.featuredSkeleton,
              { backgroundColor: isDark ? colors.surface : colors.skeletonBase },
            ]}
          />
        ) : featuredItem ? (
          <FeaturedCard
            item={featuredItem}
            isBookmarked={isBookmarked(featuredItem.id)}
            onPress={handlePress}
            onBookmarkToggle={toggle}
          />
        ) : null}

        {/* Browse By section */}
        {listItems.length > 0 || isLoading ? (
          <View style={styles.browseSection}>
            <Text style={[styles.browseTitle, { color: colors.textPrimary }]}>Browse By</Text>
            <View style={[styles.sortTabs, { borderBottomColor: colors.divider }]}>
              {SORT_OPTIONS.map(opt => (
                <Pressable
                  key={opt.key}
                  onPress={() => setSortBy(opt.key)}
                  style={[
                    styles.sortTab,
                    sortBy === opt.key && {
                      borderBottomColor: colors.brand,
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortTabText,
                      { color: sortBy === opt.key ? colors.brand : colors.textSecondary },
                      sortBy === opt.key && { fontWeight: '700' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    ),
    [
      insets.top, colors, isDark, category, sortBy, isLoading,
      featuredItem, listItems.length, error,
      isBookmarked, toggle, handlePress, clearError, bookmarks,
    ],
  );

  // ── Footer / Empty ────────────────────────────────────────────────────────
  const ListFooter = isLoadingMore ? (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={colors.brand} />
    </View>
  ) : null;

  const ListEmpty = isLoading ? (
    <View>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  ) : featuredItem ? null : (
    <View style={[styles.empty, { backgroundColor: colors.background }]}>
      <Ionicons name="newspaper-outline" size={52} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        {error ? 'Could not load articles' : 'No articles found'}
      </Text>
      <Pressable
        style={[styles.retryBtn, { backgroundColor: colors.brand }]}
        onPress={fetchFeed}
      >
        <Text style={[styles.retryBtnText, { color: colors.textOnBrand }]}>Reload</Text>
      </Pressable>
    </View>
  );

  return (
    <ErrorBoundary>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlashList
          ref={listRef}
          data={isLoading ? [] : listItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          drawDistance={ARTICLE_ROW_HEIGHT * 8}
          maxItemsInRecyclePool={20}
          getItemType={() => 'article'}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
          ListHeaderComponent={Header}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.huge }}
        />
      </View>
    </ErrorBoundary>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ── App header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerAppName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Category tabs ──
  categories: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  // ── Featured skeleton ──
  featuredSkeleton: {
    height: 280,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
  },
  // ── Browse By ──
  browseSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  browseTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sortTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xl,
  },
  sortTab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sortTabText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  // ── Error banner ──
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: fontSizes.sm,
    flex: 1,
  },
  retryLink: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  // ── Footer / Empty ──
  footerLoader: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingTop: spacing.huge * 2,
  },
  emptyTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  retryBtn: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
  },
  retryBtnText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
});

