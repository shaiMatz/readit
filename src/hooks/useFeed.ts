import { useEffect } from 'react';
import { useFeedStore } from '@/store/feedStore';

/**
 * Primary data hook for the Feed screen.
 *
 * Responsibilities:
 * - Initialise the NetInfo subscription (cleaned up on unmount).
 * - Trigger stale-while-revalidate hydration once on mount.
 * - Expose all store state + actions under a single ergonomic API.
 */
export function useFeed() {
  const store = useFeedStore();

  useEffect(() => {
    store.hydrateCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items: store.items,
    isLoading: store.isLoading,
    isRefreshing: store.isRefreshing,
    isLoadingMore: store.isLoadingMore,
    hasMore: store.hasMore,
    error: store.error,
    lastFetchedAt: store.lastFetchedAt,
    fetchFeed: store.fetchFeed,
    loadMore: store.loadMore,
    refresh: store.refresh,
    clearError: store.clearError,
  };
}
