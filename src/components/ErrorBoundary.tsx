import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSizes, radius } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

interface ClassProps extends Props {
  themeColors: AppColors;
}

/**
 * Inner class component — must be a class to use componentDidCatch.
 * Receives themeColors as a prop from the functional wrapper below.
 */
class ErrorBoundaryClass extends React.Component<ClassProps, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // In production you'd send this to Sentry / Crashlytics.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private retry = () => this.setState({ hasError: false, errorMessage: '' });

  render() {
    if (!this.state.hasError) return this.props.children;
    const { themeColors: c } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Ionicons name="warning-outline" size={48} color={c.error} />
        <Text style={[styles.title, { color: c.textPrimary }]}>Something went wrong</Text>
        <Text style={[styles.message, { color: c.textSecondary }]} numberOfLines={4}>
          {this.state.errorMessage}
        </Text>
        <Pressable style={[styles.retryBtn, { backgroundColor: c.brand }]} onPress={this.retry}>
          <Text style={[styles.retryText, { color: c.textOnBrand }]}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
}

/**
 * Public functional wrapper — reads the theme hook and forwards colors
 * to the class component. Use this everywhere in the app.
 */
export function ErrorBoundary({ children }: Props) {
  const { colors } = useTheme();
  return (
    <ErrorBoundaryClass themeColors={colors}>{children}</ErrorBoundaryClass>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
