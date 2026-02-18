# Dizzy Dish — "Exhale" Concept

## 1. Project Overview

Dizzy Dish is a mobile recipe decision app designed for the overwhelmed parent at 6:30pm who just needs an answer. The core experience is a single "decide for me" spin button that selects a recipe (or a full weekly meal plan) based on the user's dietary preferences, time constraints, and calorie goals.

**Core user flows:**
1. **Single Spin** — Tap spin → animated sequence → recipe result with details, tags, ingredient ordering
2. **Weekly Plan** — Toggle weekly mode → spin → 7-day plan with shared ingredient optimization → Instacart
3. **Save/Unsave Recipes** — Heart toggle on any result
4. **Preferences** — Dietary filters (19 options), time, calories; Pro users get persistent preferences
5. **Account** — Identifier-first email auth via Supabase, Google OAuth, post-auth redirect
6. **Instacart Integration** — One-tap ingredient ordering from recipe results

**Design philosophy:** Calm competence. One tap. Deep breath. Warm, organic color palette (`#FAF6F1` bg, `#C65D3D` warm accent). Serif display font (Fraunces) for character, clean sans (Plus Jakarta Sans) for readability.

---

## 2. Tech Stack

| Dependency | Version | Purpose |
|---|---|---|
| `expo` | ~52.0 | Framework — managed workflow, OTA updates |
| `expo-router` | ~4.0 | File-based navigation |
| `react` / `react-native` | 18.3 / 0.76 | Core UI primitives |
| `typescript` | ~5.3 | Strict mode |
| `@supabase/supabase-js` | ^2.x | Auth + database (Postgres + RLS) |
| `react-native-url-polyfill` | ^2.x | **do NOT import** — Hermes has native URL support |
| `nativewind` | ^4.1 | Tailwind CSS for React Native via `className` props |
| `tailwindcss` | ^3.4 | Utility-first CSS (config drives NativeWind) |
| `react-native-reanimated` | ~3.16 | 60fps animations on the UI thread |
| `react-native-gesture-handler` | ~2.20 | Touch/gesture handling |
| `@tanstack/react-query` | ^5.60 | Server state — data fetching, caching, mutations |
| `@react-native-async-storage/async-storage` | ^2.0 | Persistent local storage |
| `expo-haptics` | ~14.0 | Haptic feedback |
| `expo-image` | ~2.0 | Performant image loading with caching |
| `expo-font` | ~13.0 | Custom font loading |
| `expo-splash-screen` | ~0.29 | Splash screen during font loading |
| `expo-web-browser` | latest | In-app browser for OAuth |
| `@expo/vector-icons` | ^14.0 | Ionicons icon set |

**State management:**
- **React Query** — all server state (recipe data, profiles, saved recipes, subscription)
- **Supabase** — auth + database backend (`lib/supabase.ts`, session via AsyncStorage)
- **React Context + useReducer** — all client state (auth session, theme, dietary preferences, UI overlays)

---

## 3. Project Structure

```
app/              ← Screens (Expo Router file-based routing) → see app/CLAUDE.md
components/       ← UI components, NativeWind, Reanimated → see components/CLAUDE.md
context/          ← React Context providers → see context/CLAUDE.md
hooks/            ← React Query hooks → see hooks/CLAUDE.md
lib/              ← Supabase + Spoonacular API clients → see lib/CLAUDE.md
constants/        ← Color + typography tokens → see constants/CLAUDE.md
__tests__/        ← Jest tests → see __tests__/CLAUDE.md
providers/        ← AppProviders wrapper (composes all Providers)
types/            ← Shared TypeScript interfaces (types/index.ts)
assets/           ← Fonts, images
tailwind.config.js ← NativeWind theme (single source of truth for tokens)
```

---

## 4. Architecture Decisions

### Navigation
Stack-first with Expo Router. `index.tsx` home → result screens slide up → `(modal)/` for settings/account/instacart. See `app/CLAUDE.md` for full navigation guide.

### Server / Client State Split
**Most important architectural rule:**

| State Type | Owner |
|---|---|
| Recipe data, profiles, saved recipes from API | React Query |
| Auth session | AuthContext + Supabase `onAuthStateChange` |
| Theme, dietary filters, weekly mode | React Context + AsyncStorage |
| Spinning overlay, toasts | UIContext |

**Rule of thumb:** If data comes from (or goes to) a server → React Query. Client-only UI or preferences → Context.

---

## 5. Environment Setup

```bash
npm install
npx expo start          # Dev server
npx expo start --ios    # iOS Simulator
npx expo start --android  # Android Emulator
```

**Environment variables:**
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_SPOONACULAR_API_KEY=your_key_here   # Optional — falls back to fixture pool
```

**Tests:** `npm test` / `npm run test:ci`

---

## 6. TypeScript Conventions

- `strict: true` — no `any` types, no implicit returns
- Shared types: `types/index.ts`
- Component props: inline `interface` in the component file
- Context state/actions: inline in the context file

---

## 7. Cross-Cutting Pitfalls

**Fonts not loaded before render** — Use `SplashScreen.preventAutoHideAsync()`. Already handled in `app/_layout.tsx`.

**Storing server data in Context** — Never put API response data in AuthContext, PreferencesContext, etc. Use React Query.

**`useEffect` for data fetching** — All `useEffect(() => fetch(...))` patterns must be `useQuery`. Free caching, deduplication, background refetch.

**`react-native-url-polyfill/auto`** — Do NOT import it. Hermes has native URL support. Importing causes silent crash (app stuck on splash).

**OAuth in Expo Go** — Google/Apple/Facebook OAuth requires a dev build (`npx expo run:ios`). Expo Go can't intercept `exp://` redirects.

---

## 8. Contributing

### Branch naming
`<type>/<kebab-case-description>` — enforced by CI.

| Prefix | Purpose |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code refactoring |
| `chore/` | Build, deps, config |
| `docs/` | Documentation only |
| `test/` | Tests |
| `style/` | Formatting only |
| `hotfix/` | Urgent production fix |
| `release/` | Release preparation |

### Commit format
```
type(scope): short description
```

### PR checklist
- [ ] `npx tsc --noEmit` — no TypeScript errors
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Components have accessibility props (`accessibilityRole`, `accessibilityLabel`)
- [ ] Server data uses React Query, not Context
- [ ] No `StyleSheet.create()` unless NativeWind can't express it
- [ ] Animations use Reanimated (not Animated API)
- [ ] Haptic feedback added for interactive elements
- [ ] Loading, error, and empty states handled for all queries

---

## Detailed Guides

| Directory | Topics covered |
|---|---|
| `app/CLAUDE.md` | Navigation guide, screen patterns, performance, keyboard handling |
| `components/CLAUDE.md` | Component guidelines, NativeWind, Reanimated patterns, **Figma design system** |
| `context/CLAUDE.md` | React Context guide, adding contexts, what belongs where |
| `hooks/CLAUDE.md` | React Query guide, adding queries/mutations, optimistic updates |
| `lib/CLAUDE.md` | Supabase guide, Spoonacular integration, fixture fallback |
| `__tests__/CLAUDE.md` | Testing guide, jest setup, mocking patterns, CI |
| `constants/CLAUDE.md` | Token reference (colors, typography, spacing, radii) |
