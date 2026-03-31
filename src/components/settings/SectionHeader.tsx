import React from 'react';
import { Text, StyleSheet } from 'react-native';

export function SectionHeader({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.brand, letterSpacing: 1 }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 20,
    marginLeft: 4,
  },
});
