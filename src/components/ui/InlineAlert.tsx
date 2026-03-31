import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  message: string;
  type?: AlertType;
};

export function InlineAlert({ message, type = 'error' }: Props) {
  const { colors } = useTheme();

  const colorMap: Record<AlertType, string> = {
    error:   colors.error,
    warning: colors.warning,
    info:    colors.brand,
    success: colors.success,
  };

  const iconMap: Record<AlertType, IoniconName> = {
    error:   'alert-circle-outline',
    warning: 'warning-outline',
    info:    'information-circle-outline',
    success: 'checkmark-circle-outline',
  };

  const accent = colorMap[type];

  return (
    <View
      style={[
        styles.box,
        {
          // 8-char hex: last two digits are alpha (hex). 22 ≈ 13%, 4D ≈ 30%
          backgroundColor: `${accent}22`,
          borderColor:     `${accent}4D`,
        },
      ]}
    >
      <Ionicons name={iconMap[type]} size={15} color={accent} />
      <Text style={[styles.text, { color: accent }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
  },
});
