import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';

type Props = {
  onFill: () => void;
  surface?: 'dark' | 'auto';
};

export function DemoHint({ onFill, surface = 'auto' }: Props) {
  const scheme = useColorScheme();
  const isDark = surface === 'dark' || scheme === 'dark';

  const hintColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  return (
    <View style={styles.row}>
      <Text style={[styles.hint, { color: hintColor }]}>Demo credentials</Text>
      <AppButton
        label="Use demo"
        onPress={onFill}
        variant="secondary"
        size="sm"
        surface={isDark ? 'dark' : 'auto'}
        fullWidth={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: 12,
  },
});
