# DizzyDish — Task Tracker

> **What is this?** A single prioritized task list for every feature area of DizzyDish.
> Tasks are ranked globally by priority: **P0** (launch-blocking) → **P3** (nice-to-have).
>
> **Legend**
> - `[x]` Done
> - `[ ]` To do
> - `[ ] 🔄` In progress

---

## P0 — Launch-Blocking

### Backend / API

- [x] Set up Supabase project and database (profiles + saved_recipes tables with RLS)
- [x] Wire saved recipes CRUD to Supabase `saved_recipes` table
- [x] Wire user profile reads to Supabase `profiles` table
- [x] Integrate Spoonacular API — pool-based recipe fetch (free: `/recipes/random`, pro: `/recipes/complexSearch`) with dietary tag mapping
- [x] Spoonacular fixture fallback — 25 hand-crafted recipes used when API key absent, quota exceeded (HTTP 402 or silent HTTP 200 empty), or network error
- [x] Guest spin limit — 3 spins/day tracked in AsyncStorage, daily reset (`hooks/useGuestSpinLimit.ts`)
- [ ] Implement `PUT /user/profile` — profile updates
- [ ] Implement `GET /user/subscription` — real subscription status
- [ ] Add proper error responses and retry/back-off in the client

### Authentication

- [x] Integrate Supabase Auth (`@supabase/supabase-js` + `react-native-url-polyfill`)
- [x] Create Supabase client with AsyncStorage session persistence (`lib/supabase.ts`)
- [x] Rewrite AuthContext to use Supabase `onAuthStateChange` listener
- [x] Wire up email/password sign-up and sign-in on account screen
- [x] Auto-create profile row on sign-up via database trigger
- [ ] Wire up Apple Sign-In
- [ ] 🔄 Wire up Google Sign-In — code wired, needs dev build to test (Expo Go can't handle redirect)
- [ ] Wire up Facebook Login
- [x] Auth UI — OAuth buttons (visual only, Google/Facebook/Apple)
- [x] Auth UI — Identifier-first flow (email → detect existing/new → password)
- [x] Auth UI — Locked Instacart & Subscription sections for unauthenticated users
- [x] Auth UI — Post-auth redirect with pending action replay (AuthRedirectContext)
- [x] Auth UI — Polish: friendly errors, loading states, double-tap prevention, AsyncStorage persistence

### Payments & Subscriptions

- [ ] Add `react-native-purchases` (RevenueCat) dependency
- [ ] Configure RevenueCat project, entitlements, and offerings
- [ ] Build paywall / upgrade screen
- [ ] Gate Pro features (weekly spin, advanced filters) behind entitlement checks
- [ ] Verify subscription status server-side
- [ ] Handle restore-purchases flow

### Error Tracking

- [ ] Add `@sentry/react-native` and initialize in `_layout.tsx`
- [ ] Configure source-map uploads for readable stack traces
- [ ] Add breadcrumbs to key user flows (spin, save, purchase)

---

## P1 — Pre-Launch / Quality

### Testing

- [x] Jest + `jest-expo` configured in `package.json`
- [x] Test infrastructure: `jest.setup.js` with global mocks (reanimated, haptics, AsyncStorage, expo-router, supabase, safe-area-context, vector-icons, NativeWind/css-interop)
- [x] Test utilities: `__tests__/test-utils.tsx` (`createTestQueryClient`, `renderWithQuery`)
- [x] `babel.config.js` conditionally disables NativeWind transform in test env
- [x] Unit tests: `authReducer` + `mapSupabaseUser` (6 tests)
- [x] Unit tests: `checkEmailExists` API helper (4 tests)
- [x] Component tests: `PrimaryButton` — rendering, loading state, press, a11y (6 tests)
- [x] Component tests: `SocialButton` — providers, press, a11y (5 tests)
- [x] Component tests: `InputField` — rendering, input, props (5 tests)
- [x] Integration tests: `AuthContext` provider — mount, signUp, signIn, signInWithGoogle, signOut (8 tests)
- [x] Integration tests: `AccountScreen` — unauth/auth views, validation, phase transitions, error mapping (16 tests)
- [x] Unit tests: Spoonacular mapper, tag builder, ingredient/time/calorie filters, emoji picker (`spoonacular.mapping.test.ts`)
- [x] Unit tests: guest spin limit hook — increment, daily reset, limit reached (`useGuestSpinLimit.test.ts`)
- [x] Integration tests: `useRecipePool` — pool fetch, cache fingerprint, tier switching (`useRecipePool.test.tsx`)
- [x] Integration tests: `useSpinRecipe` / `useSpinWeeklyPlan` mutations — success, empty pool, filter mismatch (`useSpinRecipe.test.tsx`)
- [ ] Write unit tests for utility functions (`lib/haptics.ts`, `lib/asyncStorage.ts`)
- [ ] Write component tests for more UI (`SpinButton`, `RecipeCard`, `FilterPill`)
- [ ] Write integration tests for spin → result → save flow
- [ ] Add snapshot tests for design-system components

### CI / CD

- [x] GitHub Actions workflow: `npm run test:ci` on push/PR (`.github/workflows/test.yml`)
- [ ] Create `eas.json` with development, preview, and production profiles
- [ ] Expand workflow: lint → typecheck → test
- [ ] Add EAS Build step (preview on PR, production on merge to `main`)
- [ ] Add EAS Submit step for App Store and Google Play
- [ ] Configure OTA updates via `expo-updates`

### Deep Linking

- [x] URL scheme `dizzydish://` registered in `app.json`
- [ ] Handle inbound deep links for shared recipes (`dizzydish://recipe/:id`)
- [ ] Handle Instacart OAuth callback deep link
- [ ] Add universal links / App Links for `https://dizzydish.app` domain

### Instacart Integration

- [ ] Obtain real Instacart API credentials
- [ ] Implement OAuth connect flow (replace mock `connectInstacart()`)
- [ ] Implement "Add ingredients to cart" API call
- [ ] Handle token refresh and disconnect

---

## P2 — Post-Launch Enhancements

### Analytics

- [ ] Choose provider (Segment, Mixpanel, Amplitude, or PostHog)
- [ ] Track key events: `spin`, `save_recipe`, `unsave_recipe`, `purchase`, `login`
- [ ] Track screen views via Expo Router navigation listener
- [ ] Add user properties (plan tier, dietary filters, platform)

### Push Notifications

- [ ] Add `expo-notifications` dependency
- [ ] Request notification permission with contextual prompt
- [ ] Register device push token with backend
- [ ] Implement weekly meal-plan reminder notification
- [ ] Implement "Your recipe is ready" notification (if generation is async)

### Onboarding

- [ ] Design and build first-launch onboarding carousel
- [ ] Collect dietary preferences during onboarding
- [ ] Show tutorial tooltip on first spin

### Performance & Polish

- [ ] Profile and optimize cold-start time
- [ ] Add skeleton loaders for recipe cards and result screen
- [ ] Implement image caching for recipe photos
- [ ] Audit accessibility (VoiceOver / TalkBack) on all screens

---

## P3 — Future / Nice-to-Have

### Social & Sharing

- [ ] Generate shareable recipe card image
- [ ] Add share sheet for recipes (iOS/Android native share)
- [ ] Allow sharing weekly meal plans

### Personalization

- [ ] Track spin history and surface "spin again" suggestions
- [ ] Implement cuisine-preference learning from saves/skips
- [ ] Add "surprise me" mode that ignores filters

### Content

- [ ] Add recipe detail screen with full instructions and nutrition info
- [ ] Support user-submitted recipe ratings
- [ ] Add cooking timer integration

### Infrastructure

- [ ] Set up staging environment with separate API/DB
- [ ] Add feature-flag service (LaunchDarkly, Statsig, or remote config)
- [ ] Implement rate limiting and abuse prevention on API

---

## Already Complete

- [x] Design system ("Exhale") — colors, typography, Tailwind tokens
- [x] 20 reusable UI components (`components/`)
- [x] Animation system (Reanimated v3, 6 patterns, 60 fps)
- [x] Haptic feedback system (`lib/haptics.ts`)
- [x] Settings / preferences screen with 19 dietary filters, time & calorie filters
- [x] Preferences persistence via AsyncStorage
- [x] React Query + React Context state management architecture
- [x] App icon, adaptive icon, splash screen, and favicon
- [x] `.env` and `.env.example` with Supabase + feature-flag vars
- [x] Expo Router navigation (tabs, modals, stack)
- [x] Light/dark theme support via ThemeContext
- [x] Toast notification component
- [x] CLAUDE.md and README.md documentation
- [x] Supabase Auth — email sign-up/sign-in with session persistence
- [x] Supabase DB — `profiles` and `saved_recipes` tables with RLS
- [x] AuthContext rewritten to use Supabase `onAuthStateChange`
- [x] Account screen with identifier-first auth, friendly errors, loading states, post-auth redirect
- [x] AuthRedirectContext with AsyncStorage persistence for post-auth navigation + pending actions
- [x] Result screen heart-save redirects unauthenticated users to auth with pending save action
- [x] LoadingDots component — animated bouncing dots for button loading states
- [x] PrimaryButton `loading` prop — swaps label for LoadingDots, disables press
- [x] Account screen keyboard-aware scroll — auto-scrolls to obscured inputs on focus
- [x] Google OAuth — `signInWithGoogle()` in AuthContext via Supabase OAuth + expo-web-browser, Google button wired on account screen. Supabase + Google Cloud Console configured. Blocked on Expo Go redirect handling; needs dev build (`npx expo run:android`/`run:ios`) to test end-to-end.
- [x] Test infrastructure — `jest.setup.js`, `__tests__/test-utils.tsx`, NativeWind babel disabled in test env, 111 tests across 11 suites (auth reducer, API helpers, PrimaryButton, SocialButton, InputField, AuthContext provider, AccountScreen, Spoonacular mapper, guest spin limit, useRecipePool, useSpinRecipe)
- [x] CI/CD — GitHub Actions workflow (`.github/workflows/test.yml`) runs `npm run test:ci` on push to main/feat/fix branches and PRs to main
- [x] Spoonacular API integration — pool-based recipe fetch (`lib/spoonacular.ts`) with free/pro tier strategies, dietary tag mapping, ingredient keyword filter, calorie/time client-side filter
- [x] Spoonacular fixture fallback — `lib/fixtures/spoonacularRecipes.ts` (25 recipes) used when API key absent, quota exceeded, or network fails; same mapper/filter pipeline as live data; graceful handling of Spoonacular's silent HTTP 200 empty-response quota behavior
- [x] Toast error variant — `UIContext.showToast(message, "error")` renders a warm-red toast; spin `onError` handlers surface user-friendly filter-mismatch messages
- [x] Guest spin limit — 3 free spins/day, AsyncStorage-backed, daily reset at midnight (`hooks/useGuestSpinLimit.ts`)
