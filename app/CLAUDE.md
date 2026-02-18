# app/ — Navigation & Screen Guide

## Navigation Guide

### Structure
- `app/index.tsx` — Home (entry point, spin button)
- `app/result.tsx` — Single recipe result
- `app/weekly-result.tsx` — Weekly plan result
- `app/saved.tsx` — Saved recipes
- `app/(modal)/settings.tsx` — Preferences (dietary, time, calorie)
- `app/(modal)/account.tsx` — Account/auth
- `app/(modal)/instacart.tsx` — Instacart connection

### Navigation Pattern
Stack-first model using **Expo Router** with file-based routing:
- `result.tsx` and `weekly-result.tsx` slide up from the bottom after a spin
- `saved.tsx` pushes on the stack
- `(modal)/` group presents settings, account, instacart as modal sheets
- `(tabs)/` is scaffolded for future expansion — not the primary nav pattern

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

## Performance Guidelines

- Use `React.memo` for list item components (`RecipeCard`, `WeeklyDayRow`)
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive derived data
- Prefer `FlashList` over `FlatList` for long lists (not yet needed but ready)
- Use `expo-image` (not `<Image>` from react-native) for network images — it has built-in caching and blur placeholders
- Reanimated animations run on the UI thread — never access JS-thread state inside `useAnimatedStyle` worklets
- React Query `staleTime: 5 min` prevents unnecessary refetches on screen focus. Adjust per-query:
  - Frequently changing data: `staleTime: 30_000` (30s)
  - Rarely changing data: `staleTime: 1000 * 60 * 30` (30min)
- `gcTime` (formerly `cacheTime`): defaults to 5 minutes. Increase for data that should survive longer in memory.

---

## Screen-Specific Pitfalls

**Text not wrapped in `<Text>`** — React Native requires all text content inside `<Text>` components. Bare strings cause crashes.

**Fonts not loaded before render** — Always use `SplashScreen.preventAutoHideAsync()` and check `fontsLoaded` before rendering. Already handled in `app/_layout.tsx`.

**KeyboardAvoidingView in modals** — `KeyboardAvoidingView` doesn't work reliably in Expo Go modals. Instead, use `Keyboard` event listeners to track keyboard height, dynamically pad the ScrollView content, and `measureInWindow` + `scrollTo` to keep the focused input visible. See `account.tsx` for the pattern.
