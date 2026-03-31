import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export interface SettingsRowProps {
  icon: IoniconsName;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  colors: any;
  destructive?: boolean;
  isLast?: boolean;
}

export function SettingsRow({
  icon,
  label,
  sublabel,
  right,
  onPress,
  colors,
  destructive = false,
  isLast = false,
}: SettingsRowProps) {
  const labelColor = destructive ? colors.error : colors.textPrimary;
  const iconColor = destructive ? colors.error : colors.brand;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderBottomColor: isLast ? 'transparent' : colors.divider,
        },
      ]}
      disabled={!onPress}
    >
      <View
        style={[
          styles.iconBubble,
          { backgroundColor: destructive ? `${colors.error}18` : `${colors.brand}18` },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.labelBlock}>
        <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.rowSublabel, { color: colors.textTertiary }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>

      <View style={styles.rowRight}>
        {right}
        {onPress && !right && (
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelBlock: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSublabel: { fontSize: 12, marginTop: 2 },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
});
