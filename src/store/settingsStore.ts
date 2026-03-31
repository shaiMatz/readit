import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  /** Open article links inside the app (WebView) vs system browser */
  openInBrowser: boolean;
  /** Font scale for article reading — 'sm' | 'md' | 'lg' */
  fontSize: 'sm' | 'md' | 'lg';
  /** Show score & comment count on feed rows */
  showStats: boolean;
}

interface SettingsActions {
  setOpenInBrowser: (value: boolean) => void;
  setFontSize: (value: 'sm' | 'md' | 'lg') => void;
  setShowStats: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      openInBrowser: false,
      fontSize: 'md',
      showStats: true,

      setOpenInBrowser: (value) => set({ openInBrowser: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setShowStats: (value) => set({ showStats: value }),
    }),
    {
      name: 'readit_settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
