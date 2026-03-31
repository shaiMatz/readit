# ReadIt

A Hacker News reader built with React Native (Expo) as a technical take-home project.

---

## Setup – fresh machine

**Prerequisites**

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ (bundled with Node 20) |
| Android Studio / Xcode | For device/emulator |
| Expo Go app | Optional — for quick testing |

```bash
git clone <https://github.com/shaiMatz/readit.git>
cd readit
npm install
```

### Run on Android

```bash
npm run android
# or, for Expo Go:
npx expo start
```

### Run on iOS (macOS only)

```bash
npm run ios
```

### Run unit tests

```bash
npm test
```

---

## Demo credentials

| Field | Value |
|-------|-------|
| Email | `user@readit.dev` |
| Password | `password123` |

---

## Architecture

```
app/                    Expo Router screens (file-based routing)
  (auth)/login          Login screen
  (app)/feed/           Feed tab (index + [id] detail)
  (app)/saved           Saved articles tab
  (app)/settings        Settings tab
src/
  api/                  HackerNews API client (axios + retry logic)
  components/           Presentational UI components
  contexts/             ThemeContext (system + manual override)
  hooks/                Thin wrappers over stores (useFeed, useBookmarks, useTheme)
  services/             authService – token creation, storage, validation
  store/                Zustand slices (auth, feed, bookmarks, settings, network)
  theme/                Design tokens (colors, spacing, typography)
  utils/                Pure helpers (formatters)
```

### Data flow

```
Screen → Hook → Store → Service / API client
```

Screens never call the API or `SecureStore` directly. All side-effects live in stores or services, keeping components thin and easy to test.

---

## State management – Zustand

Why Zustand over Redux?

- **Zero boilerplate** — no actions/reducers/selectors ceremony. Each store file is self-contained.
- **Fine-grained subscriptions** — components subscribe to exact slices, which eliminates unnecessary re-renders.
- **`persist` middleware** — one-liner to back a slice with AsyncStorage (feed cache, bookmarks, settings).
- **No Context thrashing** — global state doesn't wrap the tree, so there are no extra provider layers.

Each concern gets its own store file:

| Store | Responsibility |
|-------|---------------|
| `authStore` | Session state, login/logout, token hydration |
| `feedStore` | HN top stories, pagination, stale-while-revalidate cache |
| `bookmarksStore` | Saved articles (full objects, not IDs — enables offline reading) |
| `settingsStore` | User preferences (theme, open-in-browser, font size, show stats) |
| `networkStore` | Online/offline flag, driven by `@react-native-community/netinfo` |

---

## Key decisions

### Auth — expo-secure-store, not AsyncStorage

Tokens are stored with `expo-secure-store` which uses the OS keychain (Keychain on iOS, Keystore on Android). Plain `AsyncStorage` is unencrypted and visible to anyone with file-system access on a rooted device. The mock tokens encode a 24-hour expiry and are validated on every app launch.

### Feed list — FlashList, not FlatList

`@shopify/flash-list` recycles cells without measuring every item upfront. `getItemLayout` is not needed because FlashList v2 auto-measures. `keyExtractor` uses the stable HN item ID (never array index).

### Offline support — stale-while-revalidate

On launch, if cached feed data exists it is shown immediately (zero loading flash). A background refresh runs if the cache is older than 5 minutes. If the device is offline, the banner slides in (Reanimated UI thread animation) and the cached data remains visible.

Bookmarks store **full `HNItem` objects**, so saved articles are completely readable offline without any network request.

### Animations — Reanimated worklets

All animations run on the **UI thread** via Reanimated worklets, not the JS thread:

- **Skeleton loader shimmer** — `withRepeat` + `withTiming` on the UI thread.
- **Feed list items** — staggered `FadeInDown` entering animation on first render.
- **Drag-to-dismiss on detail screen** — pan gesture via `react-native-gesture-handler`, translate + opacity interpolation, `withSpring` snap-back.
- **Login entrance** — logo scale + card slide/fade on mount.
- **Offline banner** — `withTiming` translate on the UI thread.

### Navigation — Expo Router (file-based)

Screens map 1-to-1 to file paths. Deep links (`readit://feed/12345`) work automatically. No hand-written navigator configuration.

### API client — axios with retry

`hackerNewsClient` wraps axios with an interceptor that retries network errors and 5xx responses up to 3 times with exponential back-off (500 ms → 1 s → 2 s). Individual item fetches that 404 return `null` rather than throwing so `Promise.all` can keep fetching the rest of the page.

---

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Mock token (base64 JSON, not real JWT) | Simple to implement; `jwt-decode` stays in deps but is unused at runtime — the import was removed to keep the bundle clean |
| Feed cached in AsyncStorage | AsyncStorage is unencrypted; feed data is public HN content so there is no privacy risk here. Auth tokens use SecureStore |
| `FlashList` over `FlatList` | FlashList v2 API differs slightly from FlatList; `getItemLayout` is not supported — the auto-measurement is a fair trade |
| No infinite-scroll for bookmarks | Bookmarks list is user-managed and expected to stay short; a FlatList with no pagination is simpler and correct |
| No server | HN's Firebase API is used directly; a BFF would be needed for features like search or comment threading |

---

## What I'd improve with more time

1. **Search** — full-text search over cached items (client-side) with a debounced input.
2. **Comment thread** — nested comment tree view on the detail screen using the `kids` field.
3. **Notification** — background fetch to badge the Saved tab when a bookmarked story gets new comments.
4. **E2E tests** — Maestro flows covering login → feed scroll → bookmark → saved → logout.
5. **Error telemetry** — Sentry integration with the existing `ErrorBoundary`.

---

## Time spent

| Phase | Time |
|-------|------|
| Project setup & folder structure | ~0.5 h |
| Auth flow (token, SecureStore, redirect) | ~0.5 h |
| HN API client + feed store + pagination | ~0.5 h |
| Feed screen (FlashList, filters, sort, skeleton) | ~1 h |
| Article detail screen (WebView, gesture, animation) | ~0.5 h |
| Saved screen + bookmark persistence | ~0.5 h |
| Offline support (cache, banner, SWR) | ~1 h |
| Theme system (dark/light + manual override) | ~0.5 h |
| Settings screen | ~0.5 h |
| Unit tests + bug fixes | ~0.5 h |
| README | ~0.5 h |
| **Total** | **~5 h** |

---

## AI assistance disclosure

GitHub Copilot was used during the development of this project to assist with code generation, test writing, and debugging.

---

## Notes for reviewer

- The "mock JWT" is base64-encoded JSON with `sub`, `iat`, `exp` fields — structurally identical to a real JWT payload but without a signature. Switching to a real auth backend requires only changing `authService.ts`.
- `expo-secure-store` is unavailable in Expo Go on Android — use `expo run:android` or the iOS simulator for full auth behaviour.
- `react-native-webview` requires a native build (`expo run:android` / `expo run:ios`); Expo Go does not include it.
- All stores are in `src/store/` with a consistent `zustand` + `persist` + `createJSONStorage(AsyncStorage)` pattern. The `authStore` intentionally does **not** persist to storage — token retrieval goes through `SecureStore` only.
