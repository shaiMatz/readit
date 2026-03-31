import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFeedStore } from '@/store/feedStore';
import { useSettingsStore } from '@/store/settingsStore';
import { BookmarkButton } from '@/components/BookmarkButton';
import { spacing, fontSizes, radius } from '@/theme';

const DISMISS_THRESHOLD = 130;

export default function ArticleDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: screenHeight } = useWindowDimensions();
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);

  // Find item from feed store first, then bookmarks store as fallback
  const item = useFeedStore((s) => s.items.find((i) => String(i.id) === id));
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarked = item ? isBookmarked(item.id) : false;
  const openInBrowser = useSettingsStore((s) => s.openInBrowser);

  // Auto-open in system browser if the setting is enabled
  useEffect(() => {
    if (openInBrowser && item?.url) {
      WebBrowser.openBrowserAsync(item.url);
    }
  }, [openInBrowser, item?.url]);

  const handleBookmark = useCallback(() => {
    if (item) toggle(item);
  }, [item, toggle]);

  const handleOpenInBrowser = useCallback(async () => {
    if (item?.url) {
      await WebBrowser.openBrowserAsync(item.url);
    }
  }, [item]);

  // ── Drag-to-dismiss gesture (runs on the UI thread via Reanimated worklets) ──
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const goBack = useCallback(() => router.back(), [router]);

  const gesture = Gesture.Pan()
    .activeOffsetY([0, 12]) // must move down ≥12px before activating
    .failOffsetX([-20, 20]) // cancel if horizontal
    .onStart(() => {
      'worklet';
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      // Only drag downward
      translateY.value = Math.max(0, startY.value + e.translationY);
    })
    .onEnd(() => {
      'worklet';
      if (translateY.value > DISMISS_THRESHOLD) {
        runOnJS(goBack)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(
        translateY.value,
        [0, screenHeight * 0.5],
        [1, 0.4],
        Extrapolation.CLAMP,
      ),
    };
  });

  if (!item) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background }, animatedContainerStyle]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header — drag gesture lives here only so WebView scroll is unaffected */}
      <GestureDetector gesture={gesture}>
        <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {/* Drag handle */}
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

          <View style={styles.headerRow}>
            <Pressable
              onPress={goBack}
              hitSlop={12}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color={colors.brand} />
            </Pressable>

            <Text
              style={[styles.headerTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {item.by ? `by ${item.by}` : 'Article'}
            </Text>

            <View style={styles.headerActions}>
              <BookmarkButton isBookmarked={bookmarked} onPress={handleBookmark} size={22} />
              {item.url ? (
                <Pressable
                  onPress={handleOpenInBrowser}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Open in browser"
                >
                  <Ionicons name="open-outline" size={20} color={colors.icon} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Article title */}
          <Text
            style={[styles.articleTitle, { color: colors.textPrimary }]}
            numberOfLines={3}
          >
            {item.title}
          </Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.score ?? 0} pts
            </Text>
            <Text style={[styles.metaDot, { color: colors.textTertiary }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.descendants ?? 0} comments
            </Text>
          </View>
        </SafeAreaView>
      </GestureDetector>

      {/* Content */}
        {openInBrowser ? (
          /* ── System browser mode ── */
          <View style={styles.fallbackContainer}>
            <Ionicons name="globe-outline" size={56} color={colors.brand} />
            <Text style={[styles.fallbackTitle, { color: colors.textPrimary }]}>
              Opening in browser…
            </Text>
            <Text style={[styles.fallbackSub, { color: colors.textSecondary }]}>
              Articles open in your system browser.{'\n'}Change this in Settings.
            </Text>
            {item.url ? (
              <Pressable
                style={[styles.openBtn, { backgroundColor: colors.brand }]}
                onPress={handleOpenInBrowser}
              >
                <Text style={[styles.openBtnText, { color: colors.textOnBrand }]}>
                  Open in Browser
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : item.url && !webViewError ? (
          /* ── In-app WebView ── */
          <View style={styles.webviewContainer}>
            {webViewLoading ? (
              <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.brand} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading article…
                </Text>
              </View>
            ) : null}
            <WebView
              source={{ uri: item.url }}
              style={styles.webview}
              onLoadStart={() => setWebViewLoading(true)}
              onLoad={() => setWebViewLoading(false)}
              onError={() => {
                setWebViewLoading(false);
                setWebViewError(true);
              }}
              startInLoadingState={false}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction
            />
          </View>
        ) : (
          /* ── Fallback: no URL or WebView error ── */
          <View style={styles.fallbackContainer}>
            <Ionicons name="newspaper-outline" size={56} color={colors.icon} />
            <Text style={[styles.fallbackTitle, { color: colors.textPrimary }]}>
              {webViewError ? 'Could not load article' : 'No URL available'}
            </Text>
            <Text style={[styles.fallbackSub, { color: colors.textSecondary }]}>
              {item.text
                ? 'This is a text post — content below.'
                : 'Tap the icon above to open in your browser.'}
            </Text>
            {item.url ? (
              <Pressable
                style={[styles.openBtn, { backgroundColor: colors.brand }]}
                onPress={handleOpenInBrowser}
              >
                <Text style={[styles.openBtnText, { color: colors.textOnBrand }]}>
                  Open in Browser
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  articleTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: fontSizes.xs,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    zIndex: 10,
  },
  loadingText: {
    fontSize: fontSizes.sm,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  fallbackTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  fallbackSub: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  openBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  openBtnText: {
    fontWeight: '600',
    fontSize: fontSizes.md,
  },
});

