import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ArticleRow, ARTICLE_ROW_HEIGHT } from '@/components/ArticleRow';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { spacing, fontSizes, typography } from '@/theme';
import type { HNItem } from '@/api/hackerNewsClient';

export default function SavedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { bookmarkList, isBookmarked, toggle } = useBookmarks();

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
      <Ionicons name="bookmark-outline" size={56} color={colors.icon} />
      <Text style={[typography.headline, { color: colors.textSecondary }]}>
        No saved articles
      </Text>
      <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
        Tap the bookmark icon on any article to save it for later.
      </Text>
    </View>
  );

  return (
    <ErrorBoundary>
      <Stack.Screen
        options={{
          title: 'Saved',
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
        {bookmarkList.length > 0 ? (
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {bookmarkList.length} saved {bookmarkList.length === 1 ? 'article' : 'articles'}
            </Text>
          </View>
        ) : null}
        <FlashList
          data={bookmarkList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          drawDistance={ARTICLE_ROW_HEIGHT * 6}
          maxItemsInRecyclePool={20}
          getItemType={() => 'article'}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

