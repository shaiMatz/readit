import { useBookmarksStore } from '../bookmarksStore';
import type { HNItem } from '../../api/hackerNewsClient';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

const makeItem = (id: number): HNItem => ({
  id,
  type: 'story',
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  score: 42,
  by: 'user',
  time: 1_700_000_000,
  descendants: 5,
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('bookmarksStore', () => {
  beforeEach(() => {
    useBookmarksStore.setState({ bookmarks: {} });
    jest.clearAllMocks();
  });

  // ── toggle ───────────────────────────────────────────────────────────────

  describe('toggle', () => {
    it('adds an item when it is not yet bookmarked', () => {
      const item = makeItem(1);

      useBookmarksStore.getState().toggle(item);

      expect(useBookmarksStore.getState().bookmarks[1]).toEqual(item);
    });

    it('removes an item on the second toggle call (toggle off)', () => {
      const item = makeItem(1);
      const { toggle } = useBookmarksStore.getState();

      toggle(item);
      toggle(item);

      expect(useBookmarksStore.getState().bookmarks[1]).toBeUndefined();
    });

    it('toggles multiple items independently', () => {
      const a = makeItem(1);
      const b = makeItem(2);
      const { toggle } = useBookmarksStore.getState();

      toggle(a);
      toggle(b);

      const { bookmarks } = useBookmarksStore.getState();
      expect(Object.keys(bookmarks)).toHaveLength(2);
      expect(bookmarks[1]).toEqual(a);
      expect(bookmarks[2]).toEqual(b);
    });

    it('removing one bookmark does not affect others', () => {
      const a = makeItem(1);
      const b = makeItem(2);
      const { toggle } = useBookmarksStore.getState();

      toggle(a);
      toggle(b);
      toggle(a); // remove a only

      const { bookmarks } = useBookmarksStore.getState();
      expect(bookmarks[1]).toBeUndefined();
      expect(bookmarks[2]).toEqual(b);
    });
  });

  // ── isBookmarked ─────────────────────────────────────────────────────────

  describe('isBookmarked', () => {
    it('returns false for an ID that has never been bookmarked', () => {
      expect(useBookmarksStore.getState().isBookmarked(999)).toBe(false);
    });

    it('returns true after an item is toggled on', () => {
      useBookmarksStore.getState().toggle(makeItem(42));

      expect(useBookmarksStore.getState().isBookmarked(42)).toBe(true);
    });

    it('returns false after an item is toggled off', () => {
      const item = makeItem(7);
      const { toggle } = useBookmarksStore.getState();

      toggle(item);
      toggle(item); // remove

      expect(useBookmarksStore.getState().isBookmarked(7)).toBe(false);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an item directly by id', () => {
      useBookmarksStore.getState().toggle(makeItem(10));
      useBookmarksStore.getState().remove(10);

      expect(useBookmarksStore.getState().bookmarks[10]).toBeUndefined();
    });

    it('is a no-op and does not throw for a non-existent id', () => {
      expect(() => useBookmarksStore.getState().remove(999)).not.toThrow();
      expect(Object.keys(useBookmarksStore.getState().bookmarks)).toHaveLength(0);
    });

    it('removes only the targeted item', () => {
      const a = makeItem(1);
      const b = makeItem(2);
      const { toggle, remove } = useBookmarksStore.getState();

      toggle(a);
      toggle(b);
      remove(1);

      const { bookmarks } = useBookmarksStore.getState();
      expect(bookmarks[1]).toBeUndefined();
      expect(bookmarks[2]).toEqual(b);
    });
  });

  // ── persistence shape ────────────────────────────────────────────────────

  describe('persistence shape', () => {
    it('stores full HNItem metadata — not just IDs', () => {
      const item = makeItem(5);

      useBookmarksStore.getState().toggle(item);

      const stored = useBookmarksStore.getState().bookmarks[5];
      expect(stored.title).toBe('Story 5');
      expect(stored.score).toBe(42);
      expect(stored.by).toBe('user');
      expect(stored.time).toBe(1_700_000_000);
      expect(stored.url).toBe('https://example.com/5');
    });

    it('bookmarks keyed by numeric ID (offline-readable without network)', () => {
      const item = makeItem(99);

      useBookmarksStore.getState().toggle(item);

      // Key is the numeric id, making record lookup O(1)
      expect(Object.prototype.hasOwnProperty.call(
        useBookmarksStore.getState().bookmarks,
        99,
      )).toBe(true);
    });
  });
});
