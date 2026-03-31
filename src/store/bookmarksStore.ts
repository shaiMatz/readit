import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HNItem } from '@/api/hackerNewsClient';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Store full HNItem objects (not just IDs) so bookmarked articles are readable
 * offline without any network request.
 */
interface BookmarksState {
  bookmarks: Record<number, HNItem>;
}

interface BookmarksActions {
  toggle: (item: HNItem) => void;
  isBookmarked: (id: number) => boolean;
  remove: (id: number) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBookmarksStore = create<BookmarksState & BookmarksActions>()(
  persist(
    (set, get) => ({
      bookmarks: {},

      toggle: (item: HNItem) => {
        const { bookmarks } = get();
        if (bookmarks[item.id]) {
          const next = { ...bookmarks };
          delete next[item.id];
          set({ bookmarks: next });
        } else {
          set({ bookmarks: { ...bookmarks, [item.id]: item } });
        }
      },

      isBookmarked: (id: number) => id in get().bookmarks,

      remove: (id: number) => {
        const next = { ...get().bookmarks };
        delete next[id];
        set({ bookmarks: next });
      },
    }),
    {
      name: 'readit_bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

