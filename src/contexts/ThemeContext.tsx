import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type AppColors } from '@/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_MODE_KEY = 'readit_theme_mode';

export interface ThemeContextValue {
  colors: AppColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  themeMode: 'system',
  setThemeMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Hydrate persisted theme preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  }, []);

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      themeMode,
      setThemeMode,
    }),
    [isDark, themeMode, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
