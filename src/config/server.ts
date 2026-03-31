import { Platform } from 'react-native';

/**
 * Base URL for the optional JWT stub server (server/index.js).
 *
 * - Android emulator routes 10.0.2.2 → host machine localhost
 * - iOS simulator and Expo Go on the same machine use localhost directly
 *
 * To use a physical device, replace with your machine's LAN IP, e.g.:
 *   http://192.168.1.42:3001
 */
export const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001';

/** Milliseconds before a server request is considered unreachable. */
export const SERVER_TIMEOUT_MS = 4_000;
