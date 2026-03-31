import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useBookmarksStore } from '@/store/bookmarksStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SectionHeader } from '@/components/settings/SectionHeader';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { Card } from '@/components/settings/Card';
import { ThemePicker } from '@/components/settings/ThemePicker';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const clearCache = useFeedStore((s) => s.clearCache);
  const bookmarkCount = useBookmarksStore((s) => Object.keys(s.bookmarks).length);
  const { openInBrowser, setOpenInBrowser } = useSettingsStore();

  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear feed cache',
      'The cached articles will be removed. Your bookmarks are unaffected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearingCache(true);
            clearCache();
            // Small delay so user sees the state change
            setTimeout(() => setClearingCache(false), 600);
          },
        },
      ]
    );
  }, [clearCache]);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Account ──────────────────────────────────────────────────── */}
        <SectionHeader label="ACCOUNT" colors={colors} />
        <Card colors={colors}>
          <SettingsRow
            icon="person-circle-outline"
            label={user ?? 'Unknown'}
            sublabel="Signed in"
            colors={colors}
            isLast
          />
        </Card>

        {/* ── Appearance ───────────────────────────────────────────────── */}
        <SectionHeader label="APPEARANCE" colors={colors} />
        <Card colors={colors}>
          <SettingsRow
            icon="contrast-outline"
            label="Theme"
            colors={colors}
            right={
              <ThemePicker
                colors={colors}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
              />
            }
            isLast
          />
        </Card>

        {/* ── Reading ──────────────────────────────────────────────────── */}
        <SectionHeader label="READING" colors={colors} />
        <Card colors={colors}>
          <SettingsRow
            icon="open-outline"
            label="Open in system browser"
            sublabel="Use Safari / Chrome instead of in-app WebView"
            colors={colors}
            right={
              <Switch
                value={openInBrowser}
                onValueChange={setOpenInBrowser}
                trackColor={{ false: colors.border, true: colors.brand }}
                thumbColor={Platform.OS === 'android' ? colors.textOnBrand : undefined}
              />
            }
            isLast
          />
        </Card>

        {/* ── Data ─────────────────────────────────────────────────────── */}
        <SectionHeader label="DATA" colors={colors} />
        <Card colors={colors}>
          <SettingsRow
            icon="bookmark-outline"
            label="Saved articles"
            sublabel={`${bookmarkCount} bookmark${bookmarkCount !== 1 ? 's' : ''} stored locally`}
            colors={colors}
          />
          <SettingsRow
            icon={clearingCache ? 'checkmark-circle-outline' : 'trash-outline'}
            label={clearingCache ? 'Cache cleared' : 'Clear feed cache'}
            sublabel="Remove cached articles (bookmarks kept)"
            colors={colors}
            onPress={handleClearCache}
            isLast
          />
        </Card>

        {/* ── About ────────────────────────────────────────────────────── */}
        <SectionHeader label="ABOUT" colors={colors} />
        <Card colors={colors}>
          <SettingsRow
            icon="information-circle-outline"
            label="Version"
            colors={colors}
            right={
              <Text style={[styles.valueText, { color: colors.textTertiary }]}>
                1.0.0
              </Text>
            }
          />
          <SettingsRow
            icon="server-outline"
            label="Data source"
            sublabel="HackerNews Firebase REST API"
            colors={colors}
            isLast
          />
        </Card>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <SectionHeader label="SESSION" colors={colors} />
        <Card colors={colors}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            colors={colors}
            destructive
            onPress={handleLogout}
            isLast
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            ReadIt
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  valueText: { fontSize: 14 },
  footer: { alignItems: 'center', marginTop: 32 },
  footerText: { fontSize: 12 },
});
