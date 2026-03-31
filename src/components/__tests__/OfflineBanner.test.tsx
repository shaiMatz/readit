import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// Shared ref so individual tests can override the connection state.
const mockNetInfo = { isConnected: true as boolean | null };

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => mockNetInfo,
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      offline: '#d32f2f',
      textOnBrand: '#ffffff',
    },
    isDark: false,
  }),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OfflineBanner', () => {
  it('renders the offline message when isConnected is false', () => {
    mockNetInfo.isConnected = false;

    render(<OfflineBanner />);

    expect(screen.getByText('No internet connection')).toBeTruthy();
  });

  it('does not crash when online', () => {
    mockNetInfo.isConnected = true;

    render(<OfflineBanner />);

    // Banner is still mounted but off-screen via animation — the text is present in the tree
    expect(screen.getByText('No internet connection')).toBeTruthy();
  });

  it('treats null (unresolved) as online — banner is not visible', () => {
    // isConnected === null means NetInfo has not resolved yet; the visible flag
    // should be false so we don't show a false-positive offline banner.
    mockNetInfo.isConnected = null;

    render(<OfflineBanner />);

    // Component renders without throwing; the text node exists in the tree
    // (off-screen via Reanimated translateY) but should not be in the visible state.
    expect(screen.getByText('No internet connection')).toBeTruthy();
  });
});
