import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchTopStoryIds,
  fetchPage,
  type HNItem,
  PAGE_SIZE,
} from '@/api/hackerNewsClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedState {
  ids: number[];
  items: HNItem[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

interface FeedActions {
  fetchFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Stale-while-revalidate: show cache immediately, refresh in background. */
  hydrateCache: () => Promise<void>;
  clearCache: () => void;
  clearError: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 5 * 60 * 1_000; // 5 minutes

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFeedStore = create<FeedState & FeedActions>()(
  persist(
    (set, get) => ({
      // State
      ids: [],
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: null,
      lastFetchedAt: null,

      // ── Actions ────────────────────────────────────────────────────────────

      fetchFeed: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
          const ids = await fetchTopStoryIds();
          const items = await fetchPage(ids, 0);
          set({
            ids,
            items,
            page: 0,
            hasMore: ids.length > PAGE_SIZE,
            isLoading: false,
            lastFetchedAt: Date.now(),
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to load feed';
          set({ isLoading: false, error: msg });
        }
      },

      loadMore: async () => {
        const { ids, items, page, hasMore, isLoadingMore, isLoading } = get();
        if (!hasMore || isLoadingMore || isLoading) return;

        const nextPage = page + 1;
        const nextStart = nextPage * PAGE_SIZE;
        if (nextStart >= ids.length) {
          set({ hasMore: false });
          return;
        }

        set({ isLoadingMore: true });
        try {
          const newItems = await fetchPage(ids, nextPage);
          set({
            items: [...items, ...newItems],
            page: nextPage,
            isLoadingMore: false,
            hasMore: nextStart + PAGE_SIZE < ids.length && newItems.length > 0,
          });
        } catch {
          set({ isLoadingMore: false });
        }
      },

      refresh: async () => {
        if (get().isRefreshing) return;
        set({ isRefreshing: true, error: null });
        try {
          const ids = await fetchTopStoryIds();
          const items = await fetchPage(ids, 0);
          set({
            ids,
            items,
            page: 0,
            hasMore: ids.length > PAGE_SIZE,
            isRefreshing: false,
            lastFetchedAt: Date.now(),
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to refresh';
          set({ isRefreshing: false, error: msg });
        }
      },

      hydrateCache: async () => {
        const { items, lastFetchedAt } = get();
        const isStale =
          !lastFetchedAt ||
          Date.now() - lastFetchedAt > STALE_THRESHOLD_MS;

        if (items.length > 0) {
          // Show cached data immediately; refresh in background if stale
          if (isStale) {
            get().refresh();
          }
          return;
        }
        // No cache — do a full blocking load
        await get().fetchFeed();
      },

      clearCache: () =>
        set({
          ids: [],
          items: [],
          page: 0,
          hasMore: true,
          lastFetchedAt: null,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'readit_feed_cache',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist data, not transient UI state
      partialize: (state) => ({
        ids: state.ids,
        items: state.items,
        page: state.page,
        hasMore: state.hasMore,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
);

