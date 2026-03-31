import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeMode } from '@/contexts/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: IoniconsName }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
];

interface ThemePickerProps {
  colors: any;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
}

export function ThemePicker({ colors, themeMode, setThemeMode }: ThemePickerProps) {
  return (
    <View
      style={[
        styles.themePicker,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
      ]}
    >
      {THEME_OPTIONS.map(({ mode, label, icon }) => {
        const active = themeMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            onPress={() => setThemeMode(mode)}
            activeOpacity={0.7}
            style={[styles.themeOption, active && { backgroundColor: colors.brand }]}
          >
            <Ionicons
              name={icon}
              size={15}
              color={active ? colors.textOnBrand : colors.textSecondary}
            />
            <Text
              style={[
                styles.themeOptionLabel,
                { color: active ? colors.textOnBrand : colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  themePicker: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  themeOptionLabel: { fontSize: 12, fontWeight: '600' },
});
