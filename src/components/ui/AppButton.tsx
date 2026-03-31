import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type AppButtonProps = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * 'dark' adapts secondary/ghost variants to glass/dark overlay surfaces.
   * 'auto' (default) reads from the active theme.
   */
  surface?: 'auto' | 'dark';
  /** When false, button shrinks to its content width. Default: true */
  fullWidth?: boolean;
};

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function AppButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  surface = 'auto',
  fullWidth = true,
}: AppButtonProps) {
  const { colors } = useTheme();
  const isGlass = surface === 'dark';

  const height       = size === 'sm' ? 34 : size === 'lg' ? 58 : 52;
  const borderRadius = size === 'sm' ? 20 : size === 'lg' ? 16 : 14;
  const paddingH     = size === 'sm' ? 14 : size === 'lg' ? 24 : 20;
  const fontSize     = size === 'sm' ? 12 : size === 'lg' ? 18 : 16;
  const fontWeight   = (size === 'sm' ? '600' : '700') as '600' | '700';

  const containerStyle: ViewStyle = (() => {
    const base: ViewStyle = {
      height,
      borderRadius,
      paddingHorizontal: paddingH,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: fullWidth ? undefined : 'flex-start',
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.brand };

      case 'secondary':
        return isGlass
          ? {
              ...base,
              backgroundColor: hexToRgba(colors.brand, 0.18),
              borderWidth: 1,
              borderColor: hexToRgba(colors.brand, 0.40),
            }
          : {
              ...base,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: colors.brand,
            };

      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };

      case 'destructive':
        return { ...base, backgroundColor: colors.error };
    }
  })();

  const textColor = (() => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#FFFFFF';
      case 'secondary':
        return colors.brand;
      case 'ghost':
        return isGlass ? 'rgba(255,255,255,0.75)' : colors.brand;
    }
  })();

  return (
    <TouchableOpacity
      style={[containerStyle, (isLoading || disabled) && styles.dimmed]}
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={{ color: textColor, fontSize, fontWeight, letterSpacing: 0.2 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dimmed: { opacity: 0.65 },
});
