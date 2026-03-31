import { StyleSheet } from 'react-native';

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const typography = StyleSheet.create({
  headline: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * 1.3,
  },
  subheadline: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * 1.4,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * 1.5,
  },
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * 1.4,
  },
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
});
