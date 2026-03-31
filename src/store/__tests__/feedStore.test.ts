import { useFeedStore } from '../feedStore';
import * as hnClient from '../../api/hackerNewsClient';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../../api/hackerNewsClient', () => ({
  fetchTopStoryIds: jest.fn(),
  fetchPage: jest.fn(),
  PAGE_SIZE: 20,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

const mockFetchTopStoryIds = hnClient.fetchTopStoryIds as jest.Mock;
const mockFetchPage = hnClient.fetchPage as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────

const makeItem = (id: number): hnClient.HNItem => ({
  id,
  type: 'story',
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  score: 100,
  by: 'author',
  time: 1_700_000_000,
  descendants: 10,
});

const INITIAL_STATE = {
  ids: [],
  items: [],
  page: 0,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  lastFetchedAt: null,
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('feedStore', () => {
  beforeEach(() => {
    useFeedStore.setState(INITIAL_STATE);
    jest.clearAllMocks();
  });

  // ── fetchFeed ────────────────────────────────────────────────────────────

  describe('fetchFeed', () => {
    it('populates items and IDs on success', async () => {
      const ids = Array.from({ length: 30 }, (_, i) => i + 1);
      const items = ids.slice(0, 20).map(makeItem);
      mockFetchTopStoryIds.mockResolvedValue(ids);
      mockFetchPage.mockResolvedValue(items);

      await useFeedStore.getState().fetchFeed();

      const state = useFeedStore.getState();
      expect(state.items).toHaveLength(20);
      expect(state.ids).toEqual(ids);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetchedAt).not.toBeNull();
    });

    it('sets hasMore=true when more pages exist', async () => {
      const ids = Array.from({ length: 40 }, (_, i) => i + 1);
      mockFetchTopStoryIds.mockResolvedValue(ids);
      mockFetchPage.mockResolvedValue(ids.slice(0, 20).map(makeItem));

      await useFeedStore.getState().fetchFeed();

      expect(useFeedStore.getState().hasMore).toBe(true);
    });

    it('sets hasMore=false when results fit in one page', async () => {
      const ids = [1, 2, 3];
      mockFetchTopStoryIds.mockResolvedValue(ids);
      mockFetchPage.mockResolvedValue(ids.map(makeItem));

      await useFeedStore.getState().fetchFeed();

      expect(useFeedStore.getState().hasMore).toBe(false);
    });

    it('records error message on API failure', async () => {
      mockFetchTopStoryIds.mockRejectedValue(new Error('Network error'));

      await useFeedStore.getState().fetchFeed();

      const state = useFeedStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
      expect(state.items).toHaveLength(0);
    });

    it('is a no-op when already loading', async () => {
      useFeedStore.setState({ isLoading: true });

      await useFeedStore.getState().fetchFeed();

      expect(mockFetchTopStoryIds).not.toHaveBeenCalled();
    });

    it('calls fetchPage with page=0', async () => {
      const ids = [1, 2, 3];
      mockFetchTopStoryIds.mockResolvedValue(ids);
      mockFetchPage.mockResolvedValue(ids.map(makeItem));

      await useFeedStore.getState().fetchFeed();

      expect(mockFetchPage).toHaveBeenCalledWith(ids, 0);
    });
  });

  // ── loadMore ─────────────────────────────────────────────────────────────

  describe('loadMore', () => {
    it('appends next page of items and increments page counter', async () => {
      const ids = Array.from({ length: 40 }, (_, i) => i + 1);
      const firstPage = ids.slice(0, 20).map(makeItem);
      const secondPage = ids.slice(20, 40).map(makeItem);

      useFeedStore.setState({ ids, items: firstPage, page: 0, hasMore: true });
      mockFetchPage.mockResolvedValue(secondPage);

      await useFeedStore.getState().loadMore();

      const state = useFeedStore.getState();
      expect(state.items).toHaveLength(40);
      expect(state.page).toBe(1);
      expect(state.isLoadingMore).toBe(false);
      expect(mockFetchPage).toHaveBeenCalledWith(ids, 1);
    });

    it('sets hasMore=false when IDs are exhausted', async () => {
      const ids = Array.from({ length: 15 }, (_, i) => i + 1);
      useFeedStore.setState({ ids, items: ids.map(makeItem), page: 0, hasMore: true });

      // nextStart = 1 * 20 = 20, which is >= ids.length (15)
      await useFeedStore.getState().loadMore();

      expect(useFeedStore.getState().hasMore).toBe(false);
      expect(mockFetchPage).not.toHaveBeenCalled();
    });

    it('is a no-op when hasMore=false', async () => {
      useFeedStore.setState({ hasMore: false });

      await useFeedStore.getState().loadMore();

      expect(mockFetchPage).not.toHaveBeenCalled();
    });

    it('is a no-op when already loading more', async () => {
      useFeedStore.setState({ hasMore: true, isLoadingMore: true });

      await useFeedStore.getState().loadMore();

      expect(mockFetchPage).not.toHaveBeenCalled();
    });
  });

  // ── hydrateCache ──────────────────────────────────────────────────────────

  describe('hydrateCache', () => {
    it('performs a blocking fetch when cache is empty', async () => {
      const ids = [1, 2, 3];
      mockFetchTopStoryIds.mockResolvedValue(ids);
      mockFetchPage.mockResolvedValue(ids.map(makeItem));

      await useFeedStore.getState().hydrateCache();

      expect(mockFetchTopStoryIds).toHaveBeenCalledTimes(1);
      expect(useFeedStore.getState().items).toHaveLength(3);
    });

    it('returns immediately when cache is fresh (no background refresh)', async () => {
      useFeedStore.setState({
        items: [makeItem(1)],
        ids: [1],
        lastFetchedAt: Date.now() - 60_000, // 1 minute ago — within 5m threshold
      });

      await useFeedStore.getState().hydrateCache();

      expect(mockFetchTopStoryIds).not.toHaveBeenCalled();
    });

    it('triggers a background refresh when cache is stale (> 5 min)', async () => {
      useFeedStore.setState({
        items: [makeItem(1)],
        ids: [1],
        lastFetchedAt: Date.now() - 10 * 60_000, // 10 minutes ago — stale
      });
      mockFetchTopStoryIds.mockResolvedValue([2]);
      mockFetchPage.mockResolvedValue([makeItem(2)]);

      await useFeedStore.getState().hydrateCache();

      // Flush microtasks so the fire-and-forget refresh() promise settles
      await new Promise<void>((resolve) => setImmediate(resolve));

      expect(mockFetchTopStoryIds).toHaveBeenCalledTimes(1);
    });
  });

  // ── clearError ───────────────────────────────────────────────────────────

  describe('clearError', () => {
    it('resets error to null', () => {
      useFeedStore.setState({ error: 'Something went wrong' });

      useFeedStore.getState().clearError();

      expect(useFeedStore.getState().error).toBeNull();
    });
  });
});
