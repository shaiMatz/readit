import { useMemo, useCallback } from 'react';
import { useBookmarksStore } from '@/store/bookmarksStore';
import type { HNItem } from '@/api/hackerNewsClient';

/**
 * Ergonomic hook over the bookmarks store.
 * - `bookmarkList` is a memoised Array derived from the record — no re-sorts.
 * - `isBookmarked` is stable across renders (useCallback).
 */
export function useBookmarks() {
  const { bookmarks, toggle, remove, isBookmarked } = useBookmarksStore();

  const bookmarkList = useMemo<HNItem[]>(
    () => Object.values(bookmarks).reverse(), // newest-first
    [bookmarks],
  );

  const stableToggle = useCallback(
    (item: HNItem) => toggle(item),
    [toggle],
  );

  const stableIsBookmarked = useCallback(
    (id: number) => isBookmarked(id),
    [isBookmarked],
  );

  const stableRemove = useCallback(
    (id: number) => remove(id),
    [remove],
  );

  return {
    bookmarks,
    bookmarkList,
    toggle: stableToggle,
    isBookmarked: stableIsBookmarked,
    remove: stableRemove,
    count: bookmarkList.length,
  };
}
