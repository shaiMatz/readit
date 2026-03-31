import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ArticleRow, ARTICLE_ROW_HEIGHT } from '@/components/ArticleRow';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { spacing, fontSizes, typography, radius } from '@/theme';
import type { HNItem } from '@/api/hackerNewsClient';

export default function SavedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { bookmarkList, isBookmarked, toggle } = useBookmarks();
  const [query, setQuery] = useState('');

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookmarkList;
    return bookmarkList.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.url?.toLowerCase().includes(q),
    );
  }, [bookmarkList, query]);

  const handlePress = useCallback(
    (item: HNItem) => {
      router.push(`/(app)/feed/${item.id}`);
    },
    [router],
  );

  const keyExtractor = useCallback((item: HNItem) => String(item.id), []);

  const renderItem = useCallback(
    ({ item, index }: { item: HNItem; index: number }) => (
      <ArticleRow
        item={item}
        index={index}
        isBookmarked={isBookmarked(item.id)}
        onPress={handlePress}
        onBookmarkToggle={toggle}
        animate={false}
      />
    ),
    [isBookmarked, toggle, handlePress],
  );

  const ListEmpty = (
    <View style={styles.empty}>
      {query.trim() ? (
        <>
          <Ionicons name="search-outline" size={56} color={colors.icon} />
          <Text style={[typography.headline, { color: colors.textSecondary }]}>
            No results for "{query.trim()}"
          </Text>
          <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
            Try a different title or URL keyword.
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="bookmark-outline" size={56} color={colors.icon} />
          <Text style={[typography.headline, { color: colors.textSecondary }]}>
            No saved articles
          </Text>
          <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
            Tap the bookmark icon on any article to save it for later.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <ErrorBoundary>
      <Stack.Screen
        options={{
          title: 'Saved' + (bookmarkList.length > 0 ? ` (${bookmarkList.length})` : ''),
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: {
            color: colors.textPrimary,
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* Search bar */}
        <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="search" size={16} color={colors.icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search saved articles…"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.icon} />
              </Pressable>
            ) : null}
          </View>
        </View>

       

        <FlashList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          drawDistance={ARTICLE_ROW_HEIGHT * 6}
          maxItemsInRecyclePool={20}
          getItemType={() => 'article'}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 38,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.sm,
    paddingVertical: 0,
  },
  list: {
    paddingBottom: spacing.huge,
  },
  countBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  countText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
    paddingTop: spacing.huge * 2,
  },
  emptySub: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

