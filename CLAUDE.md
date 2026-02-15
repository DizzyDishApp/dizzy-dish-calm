# Dizzy Dish — "Exhale" Concept

## 1. Project Overview

Dizzy Dish is a mobile recipe decision app designed for the overwhelmed parent at 6:30pm who just needs an answer. The core experience is a single "decide for me" spin button that selects a recipe (or a full weekly meal plan) based on the user's dietary preferences, time constraints, and calorie goals.

**Core user flows:**
1. **Single Spin** — Tap the spin button → animated spin sequence → recipe result with details, tags, and ingredient ordering
2. **Weekly Plan** — Toggle weekly mode → spin → 7-day meal plan with shared ingredient optimization → bulk order via Instacart
3. **Save/Unsave Recipes** — Heart toggle on any result to build a saved collection
4. **Preferences** — Set dietary filters (19 options), time constraints, calorie preferences; Pro users get persistent preferences
5. **Account** — Social auth (Google/Facebook/Apple), email auth, Instacart connection, subscription management
6. **Instacart Integration** — Connect account to one-tap order ingredients from recipe results

**Design philosophy:** Calm competence. One tap. Deep breath. Warm, organic color palette (#FAF6F1 background, #C65D3D warm accent). Serif display font (Fraunces) for character, clean sans (Plus Jakarta Sans) for readability.

---

## 2. Tech Stack

| Dependency | Version | Purpose |
|---|---|---|
| `expo` | ~52.0 | Framework — managed workflow, OTA updates |
| `expo-router` | ~4.0 | File-based navigation (replaces React Navigation manual setup) |
| `react` / `react-native` | 18.3 / 0.76 | Core UI primitives |
| `typescript` | ~5.3 | Strict mode enabled for type safety |
| `nativewind` | ^4.1 | Tailwind CSS for React Native via `className` props |
| `tailwindcss` | ^3.4 | Utility-first CSS framework (config drives NativeWind) |
| `react-native-reanimated` | ~3.16 | 60fps animations on the UI thread |
| `react-native-gesture-handler` | ~2.20 | Touch/gesture handling (wraps root) |
| `@tanstack/react-query` | ^5.60 | **Server state** — data fetching, caching, mutations |
| `@react-native-async-storage/async-storage` | ^2.0 | Persistent local storage (auth tokens, preferences) |
| `expo-haptics` | ~14.0 | Haptic feedback (iOS Taptic Engine, Android vibration) |
| `expo-image` | ~2.0 | Performant image loading with caching |
| `expo-font` | ~13.0 | Custom font loading (Fraunces, Plus Jakarta Sans) |
| `expo-splash-screen` | ~0.29 | Splash screen management during font loading |
| `expo-av` | ~14.0 | Audio/video playback (future use) |
| `@expo/vector-icons` | ^14.0 | Icon library (Ionicons primary set) |

**State management separation of concerns:**
- **React Query** owns all **server state**: recipe data, user profiles, saved recipes, subscription info, Instacart status. Any data that originates from an API belongs here.
- **React Context + useReducer** owns all **client state**: auth session, theme preference, dietary/time/calorie preferences, weekly mode, UI ephemeral state (spinning overlay, toasts). Any state that exists purely in the client belongs here.

---

## 3. Project Structure

```
app/
  _layout.tsx               ← Root layout: fonts, GestureHandlerRootView, all Providers, Toast
  index.tsx                 ← Home screen: spin button, weekly toggle, avatar, saved pill
  result.tsx                ← Single recipe result after spin
  weekly-result.tsx         ← 7-day weekly plan result after spin
  saved.tsx                 ← Saved recipes list
  (tabs)/
    _layout.tsx             ← Tab navigator (scaffolded for future expansion)
  (modal)/
    _layout.tsx             ← Modal group layout
    settings.tsx            ← Preferences: dietary, time, calorie filters
    account.tsx             ← Auth, social login, Instacart, subscription, logout
    instacart.tsx           ← Instacart account connection flow

components/
  Avatar.tsx                ← User avatar (small/large variants)
  ConfettiEmoji.tsx         ← Floating food emoji celebration animation
  FilterPill.tsx            ← On/off filter toggle pill
  GearButton.tsx            ← Settings gear icon button
  HeaderBar.tsx             ← Shared header with back button + title
  HeartButton.tsx           ← Heart/save toggle icon
  InputField.tsx            ← Styled TextInput matching design system
  MetaPill.tsx              ← Read-only info pill (time, calories, servings)
  PrimaryButton.tsx         ← Primary CTA (warm/green/instacart variants)
  RecipeCard.tsx            ← Recipe list item with emoji, name, time, heart
  SecondaryButton.tsx       ← Secondary action (cream/warmPale/ghost variants)
  SmartGroceryCard.tsx      ← Weekly plan shared ingredients callout
  SocialButton.tsx          ← Social auth button (Google/Facebook/Apple)
  SpinButton.tsx            ← Hero spin button with calmPulse animation
  SpinningOverlay.tsx       ← Full-screen spin animation overlay
  TagChip.tsx               ← Recipe tag label chip
  Toast.tsx                 ← Auto-dismissing toast notification
  Toggle.tsx                ← Toggle switch (warm/green variants)
  WeeklyDayRow.tsx          ← Single day row in weekly plan

context/
  AuthContext.tsx            ← Auth state: user, token, login/logout, session restore
  ThemeContext.tsx           ← Theme preference: light/dark
  UIContext.tsx              ← Ephemeral UI: isSpinning, toasts
  PreferencesContext.tsx     ← User preferences: dietary, time, calories, weekly, pro

providers/
  index.tsx                 ← Composes all Providers into AppProviders wrapper

hooks/
  useSpinRecipe.ts          ← Mutations: useSpinRecipe, useSpinWeeklyPlan
  useSavedRecipes.ts        ← Query: useSavedRecipes; Mutations: useSaveRecipe, useUnsaveRecipe
  useUserProfile.ts         ← Queries: useUserProfile, useSubscription
  useInstacart.ts           ← Mutation: useConnectInstacart

lib/
  api.ts                    ← All raw fetcher functions (mock data, typed returns)
  queryClient.ts            ← QueryClient instance with mobile-optimized defaults
  queryKeys.ts              ← Query key factory constants
  asyncStorage.ts           ← Typed AsyncStorage helpers with "dizzy:" key prefix
  haptics.ts                ← Haptic feedback helpers (light/medium/heavy/select/success/error)

constants/
  colors.ts                 ← Design system color palette
  typography.ts             ← Font sizes, weights, line heights, letter spacing

types/
  index.ts                  ← All shared TypeScript interfaces and types

assets/
  fonts/                    ← Custom font files (loaded via expo-font from Google Fonts)
  images/                   ← App icons, splash screen, logo

store/
  index.ts                  ← Shared business logic (placeholder)

tailwind.config.js          ← NativeWind theme: custom colors, fonts, spacing, radii
babel.config.js             ← Babel: expo preset + nativewind + reanimated plugin
metro.config.js             ← Metro bundler with NativeWind integration
nativewind-env.d.ts         ← NativeWind TypeScript types reference
tsconfig.json               ← TypeScript strict mode, path aliases
app.json                    ← Expo configuration
```

---

## 4. Architecture Decisions

### Navigation Pattern
We use **Expo Router** with file-based routing. The app has a **stack-first** navigation model:
- `index.tsx` is the home screen (spin button)
- `result.tsx` and `weekly-result.tsx` slide up from the bottom after a spin
- `saved.tsx` pushes on the stack
- `(modal)/` group presents settings, account, and instacart as modal sheets

The `(tabs)/` directory is scaffolded for future expansion but is not the primary navigation pattern. The app's core UX is a single screen with a big button — tabs would add unnecessary complexity at this stage.

### Server / Client State Split
This is the most important architectural decision:

| State Type | Owner | Examples |
|---|---|---|
| Recipe data from API | React Query | Spin results, saved recipes, recipe details |
| User profile from API | React Query | Profile data, subscription info |
| Auth session | React Context (AuthContext) | User object, JWT token, login/logout |
| Theme preference | React Context (ThemeContext) | Light/dark mode |
| Dietary/time/calorie filters | React Context (PreferencesContext) | User's filter selections |
| Weekly mode toggle | React Context (PreferencesContext) | Single vs weekly spin |
| Spinning overlay, toasts | React Context (UIContext) | Ephemeral UI state |

**Rule of thumb:** If the data comes from (or goes to) a server, it's React Query. If it's client-only UI or preference state, it's Context.

### Animation Strategy
All animations use **React Native Reanimated v3** running on the UI thread for 60fps performance:
- **calmPulse** (spin button idle): `withRepeat` + `withSequence` + `withTiming` for scale 1→1.03
- **gentleUp** (content entrance): `FadeInDown` from Reanimated layout animations with staggered delays
- **slideUp** (result cards): `SlideInDown` layout animation
- **spinWheel** (spin sequence): `withTiming` rotation 0→1080deg with cubic-bezier easing
- **confFloat** (celebration): `withTiming` for translateY/scale/opacity with staggered delays

### Styling Approach
**NativeWind v4** provides Tailwind utility classes via `className` props. Benefits:
- Consistent with the design system's spacing/color/radius tokens
- No `StyleSheet.create()` boilerplate (used only when NativeWind can't express something, e.g., complex shadows)
- Theme tokens in `tailwind.config.js` match the design system exactly
- Platform-specific styles via `ios:` / `android:` prefixes or `Platform.select()`

---

## 5. Environment Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- iOS: Xcode 15+ with iOS Simulator
- Android: Android Studio with emulator or `adb` setup
- Physical device: Expo Go app installed

### Steps

```bash
# Clone
git clone <repo-url>
cd dizzy-dish

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS Simulator
npx expo start --ios

# Run on Android Emulator
npx expo start --android

# Run on physical device
# Scan QR code in terminal with Expo Go app
```

### Font Installation
Fonts (Fraunces, Plus Jakarta Sans) are loaded via `@expo-google-fonts/*` packages at runtime in `app/_layout.tsx`. No manual font file installation needed. The app prevents rendering until fonts are loaded via `SplashScreen.preventAutoHideAsync()`.

---

## 6. React Query Guide

### How data fetching is structured

```
lib/api.ts          → Raw fetcher functions (async, typed, no React Query)
lib/queryKeys.ts    → Cache key factory constants
hooks/use*.ts       → Query/mutation hooks that compose api + keys
app/*.tsx           → Screen components that consume hooks
```

### Finding and using existing query hooks

All query hooks live in `hooks/` and are named `use[Entity][Action].ts`:
- `useSpinRecipe.ts` — `useSpinRecipe()`, `useSpinWeeklyPlan()`
- `useSavedRecipes.ts` — `useSavedRecipes()`, `useSaveRecipe()`, `useUnsaveRecipe()`
- `useUserProfile.ts` — `useUserProfile()`, `useSubscription()`
- `useInstacart.ts` — `useConnectInstacart()`

### Adding a new query (step-by-step)

1. **Add fetcher to `lib/api.ts`:**
```ts
export async function fetchMealHistory(): Promise<MealHistoryEntry[]> {
  return request<MealHistoryEntry[]>('/meals/history');
}
```

2. **Add key to `lib/queryKeys.ts`:**
```ts
meals: {
  all: ["meals"] as const,
  history: () => [...queryKeys.meals.all, "history"] as const,
},
```

3. **Create hook in `hooks/useMealHistory.ts`:**
```ts
import { useQuery } from "@tanstack/react-query";
import { fetchMealHistory } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useMealHistory() {
  return useQuery({
    queryKey: queryKeys.meals.history(),
    queryFn: fetchMealHistory,
  });
}
```

4. **Use in component:**
```tsx
const { data, isLoading, isError } = useMealHistory();
```

### Adding a new mutation

```ts
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.saved() });
    },
  });
}
```

### Optimistic updates

See `useSaveRecipe` in `hooks/useSavedRecipes.ts` for a complete example:
1. Cancel outgoing queries for the same key
2. Snapshot previous data
3. Optimistically update the cache
4. Return context with previous data
5. On error, restore from context
6. On settled, invalidate to refetch

### Cache key conventions

Keys follow a hierarchical factory pattern in `queryKeys.ts`:
- `["recipes"]` — all recipe-related queries
- `["recipes", "saved"]` — saved recipes specifically
- `["recipes", "detail", "abc123"]` — specific recipe by ID

### Pagination with `useInfiniteQuery`

Not currently used, but when needed:
```ts
export function useRecipeSearch(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.search(query),
    queryFn: ({ pageParam = 0 }) => searchRecipes(query, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}
```

---

## 7. React Context Guide

### Purpose of each context

| Context | File | Purpose |
|---|---|---|
| `AuthContext` | `context/AuthContext.tsx` | User object, JWT token, login/logout actions, session restoration from AsyncStorage |
| `ThemeContext` | `context/ThemeContext.tsx` | Light/dark mode preference, persisted to AsyncStorage |
| `UIContext` | `context/UIContext.tsx` | Ephemeral UI state: isSpinning overlay, toast messages |
| `PreferencesContext` | `context/PreferencesContext.tsx` | Dietary filters, time/calorie preferences, weekly mode, pro status, persisted to AsyncStorage |

### Consuming a context

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { state, login, logout } = useAuth();
  // state.user, state.token, state.isAuthenticated, state.isLoading
}
```

### Adding a new context (step-by-step)

1. **Define state interface:**
```ts
interface NotificationState {
  enabled: boolean;
  frequency: "daily" | "weekly";
}
```

2. **Define action union type:**
```ts
type NotificationAction =
  | { type: "SET_ENABLED"; payload: boolean }
  | { type: "SET_FREQUENCY"; payload: "daily" | "weekly" };
```

3. **Write reducer:**
```ts
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case "SET_ENABLED": return { ...state, enabled: action.payload };
    case "SET_FREQUENCY": return { ...state, frequency: action.payload };
    default: return state;
  }
}
```

4. **Create context:**
```ts
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
```

5. **Build Provider:**
```tsx
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  // AsyncStorage persistence in useEffect if needed
  return <NotificationContext.Provider value={{ state, ... }}>{children}</NotificationContext.Provider>;
}
```

6. **Export custom hook:**
```ts
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
```

7. **Add to `providers/index.tsx`**

### Persisting context state

Use `useEffect` inside the Provider to read from AsyncStorage on mount and write on state changes. See `PreferencesContext.tsx` for a complete example with serialization of `Set` types.

### What belongs where

| If the data... | It belongs in... |
|---|---|
| Comes from an API | React Query |
| Is fetched once and rarely changes (e.g., feature flags) | React Query with long `staleTime` |
| Is user input not yet submitted | Local component state (`useState`) |
| Is UI state (modal open, toast visible) | UIContext |
| Is a user preference that persists | PreferencesContext + AsyncStorage |
| Is auth session data | AuthContext + AsyncStorage |
| Is theme preference | ThemeContext + AsyncStorage |

---

## 8. NativeWind Configuration

### How it's wired up

1. `metro.config.js` — wraps default config with `withNativeWind({ input: "./global.css" })`
2. `babel.config.js` — uses `nativewind/babel` preset with `jsxImportSource: "nativewind"`
3. `global.css` — standard `@tailwind base/components/utilities` directives
4. `tailwind.config.js` — theme configuration with design system tokens
5. `nativewind-env.d.ts` — TypeScript types for `className` prop
6. `app/_layout.tsx` — imports `../global.css`

### Extending the theme

Edit `tailwind.config.js` under `theme.extend`:
```js
colors: {
  // Add new colors here
  warning: "#E5A100",
},
```

### Using dynamic classes

For conditional classes:
```tsx
<Text className={`font-body ${isActive ? "text-warm" : "text-txt-soft"}`}>
```

For platform-specific:
```tsx
<View className="p-4 ios:p-6 android:p-3">
```

---

## 9. Reanimated Patterns

### Enter/Exit Animations

```tsx
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";

<Animated.View
  entering={FadeInDown.delay(200).duration(400).springify()}
  exiting={FadeOut.duration(200)}
>
```

### Looping Animations (calmPulse)

```tsx
const scale = useSharedValue(1);
scale.value = withRepeat(
  withSequence(
    withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
  ),
  -1, // infinite
  true
);
```

### Spin Animation

```tsx
rotation.value = withTiming(1080, {
  duration: 700,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
});
```

### Float-away (confFloat)

```tsx
translateY.value = withDelay(delay, withTiming(-60, { duration: 1500 }));
scale.value = withDelay(delay, withTiming(0.5, { duration: 1500 }));
opacity.value = withDelay(delay, withTiming(0, { duration: 1500 }));
```

---

## 10. Component Guidelines

### Naming
- PascalCase for component files: `SpinButton.tsx`, `RecipeCard.tsx`
- One component per file (except small helper sub-components)
- Export named functions, not default exports (except screen components)

### File Structure
```tsx
import React from "react";
import { View, Text } from "react-native";
// ... other imports

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

/**
 * JSDoc description of what this component does.
 * Include design system specs (sizes, colors, animations).
 */
export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

### Pressable vs TouchableOpacity
- Use `Pressable` for all new interactive elements (it's the modern API)
- `TouchableOpacity` is acceptable but not preferred

### Accessibility
Every interactive element must have:
- `accessibilityRole` ("button", "switch", "link", etc.)
- `accessibilityLabel` (describes what it does)
- `accessibilityState` where applicable (`{ selected: true }`, `{ checked: true }`)

---

## 11. TypeScript Conventions

### Strict mode
`strict: true` in `tsconfig.json`. No `any` types. No implicit returns.

### Where types live
- Shared types: `types/index.ts`
- Component props: inline `interface` in the component file
- Context state/actions: inline in the context file
- API response types: `types/index.ts`

### Typing navigation params
```ts
import { useLocalSearchParams } from "expo-router";
const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
```

### Typing NativeWind className
The `nativewind-env.d.ts` reference adds `className?: string` to all React Native core components. Custom components should accept it explicitly if needed:
```ts
interface Props {
  className?: string;
}
```

### Typing Context
```ts
interface AuthState { user: User | null; token: string | null; }
type AuthAction = | { type: "SET_USER"; payload: { user: User; token: string } } | { type: "LOGOUT" };
```

### Typing React Query
```ts
useQuery<Recipe[], Error>({ ... })
useMutation<void, Error, { recipeId: string }>({ ... })
```

---

## 12. Navigation Guide

### Structure
- `app/index.tsx` — Home (entry point)
- `app/result.tsx` — Single recipe result
- `app/weekly-result.tsx` — Weekly plan result
- `app/saved.tsx` — Saved recipes
- `app/(modal)/settings.tsx` — Preferences
- `app/(modal)/account.tsx` — Account/auth
- `app/(modal)/instacart.tsx` — Instacart connection

### Adding a new route
1. Create `app/my-route.tsx`
2. Export a default component
3. Navigate with `router.push("/my-route")`

### Passing and reading params
```tsx
// Navigate with params
router.push({ pathname: "/result", params: { recipeId: "123" } });

// Read params
const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
```

### Deep links
Configured via `scheme: "dizzydish"` in `app.json`. Routes map directly:
- `dizzydish:///` → Home
- `dizzydish:///result?recipeId=123` → Recipe result

---

## 13. Performance Guidelines

- Use `React.memo` for list item components (`RecipeCard`, `WeeklyDayRow`)
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive derived data
- Prefer `FlashList` over `FlatList` for long lists (not yet needed but ready)
- Use `expo-image` (not `<Image>` from react-native) for network images — it has built-in caching and blur placeholders
- Reanimated animations run on the UI thread — never access JS-thread state inside `useAnimatedStyle` worklets
- React Query `staleTime: 5 min` prevents unnecessary refetches on screen focus. Adjust per-query if needed:
  - Frequently changing data: `staleTime: 30_000` (30s)
  - Rarely changing data: `staleTime: 1000 * 60 * 30` (30min)
- `gcTime` (formerly `cacheTime`): defaults to 5 minutes. Increase for data that should survive longer in memory.

---

## 14. Testing

### Setup
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
```

### Framework
- `jest-expo` preset
- `@testing-library/react-native` for component tests

### Conventions
- Test files: `__tests__/ComponentName.test.tsx` or co-located `ComponentName.test.tsx`
- One test file per component/hook

### Mocking React Query
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function wrapper({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// renderHook(useMyHook, { wrapper });
```

### Mocking Context
```tsx
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <PreferencesProvider>{ui}</PreferencesProvider>
    </AuthProvider>
  );
}
```

---

## 15. Common Pitfalls

1. **Text not wrapped in `<Text>`** — React Native requires all text content inside `<Text>` components. Bare strings cause crashes.

2. **Fonts not loaded before render** — Always use `SplashScreen.preventAutoHideAsync()` and check `fontsLoaded` before rendering. Already handled in `app/_layout.tsx`.

3. **`StyleSheet` conflicts with NativeWind** — Avoid mixing `StyleSheet.create()` styles with NativeWind `className`. Use `style={}` only for things NativeWind can't express (shadows, platform-specific values).

4. **Reanimated worklet rules** — Functions inside `useAnimatedStyle` run on the UI thread. They cannot access regular React state or closures. Only use `SharedValue` refs created with `useSharedValue`.

5. **Storing server data in Context instead of React Query** — Never put API response data in AuthContext, PreferencesContext, etc. That data belongs in React Query for proper caching, refetching, and invalidation.

6. **Using `useEffect` for data fetching instead of React Query** — All `useEffect(() => { fetch(...).then(setData) }, [])` patterns must be replaced with `useQuery`. This gets you loading/error states, caching, deduplication, and background refetching for free.

7. **Missing `queryKey` dependencies causing stale cache** — Always use the `queryKeys.ts` factory. If your query depends on a parameter, include it in the key: `queryKeys.recipes.detail(id)`.

8. **Context causing full subtree re-renders** — Split contexts by concern (Auth, Theme, UI, Preferences). Don't put unrelated state in the same context. A theme change shouldn't re-render the preferences screen.

9. **`refetchOnWindowFocus: true` on mobile** — Disabled globally in `queryClient.ts`. On mobile there's no "window focus" event like on web. The `AppState` change event exists but is handled differently.

10. **Haptic feedback on web** — `expo-haptics` is a no-op on web. The code handles this gracefully.

---

## 16. Contributing

### Branch naming
- `feature/short-description`
- `fix/short-description`
- `refactor/short-description`

### Commit message format
```
type(scope): short description

Longer description if needed.
```
Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`

### PR checklist
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Components have accessibility props
- [ ] Server data uses React Query, not Context
- [ ] Client state uses Context, not React Query
- [ ] No `StyleSheet.create()` unless NativeWind can't express it
- [ ] Animations use Reanimated (not CSS transitions or Animated API)
- [ ] Haptic feedback added for interactive elements
- [ ] Loading, error, and empty states handled for all queries
