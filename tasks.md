# DizzyDish — Task Tracker

> **What is this?** A single prioritized task list for every feature area of DizzyDish.
> Tasks are ranked globally by priority: **P0** (launch-blocking) → **P3** (nice-to-have).
>
> **Legend**
> - `[x]` Done
> - `[ ]` To do
> - `[ ] 🔄` In progress
>
> **Project management**
> Open items link to their GitHub issue. Board: https://github.com/orgs/DizzyDishApp/projects/7
> To start a task: move the issue to **This Sprint** on the board, cut a branch `feat/issue-N-description`, and add `Closes #N` to your PR.

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
- [ ] Add proper error responses and retry/back-off in the client ([#13](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/13))

### Authentication

- [x] Integrate Supabase Auth (`@supabase/supabase-js` + `react-native-url-polyfill`)
- [x] Create Supabase client with AsyncStorage session persistence (`lib/supabase.ts`)
- [x] Rewrite AuthContext to use Supabase `onAuthStateChange` listener
- [x] Wire up email/password sign-up and sign-in on account screen
- [x] Auto-create profile row on sign-up via database trigger
- [ ] Wire up Apple Sign-In ([#10](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/10))
- [ ] 🔄 Wire up Google Sign-In — code wired, needs dev build to test (Expo Go can't handle redirect) ([#11](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/11))
- [ ] Wire up Facebook Login ([#12](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/12))
- [x] Auth UI — OAuth buttons (visual only, Google/Facebook/Apple)
- [x] Auth UI — Identifier-first flow (email → detect existing/new → password)
- [x] Auth UI — Locked Instacart & Subscription sections for unauthenticated users
- [x] Auth UI — Post-auth redirect with pending action replay (AuthRedirectContext)
- [x] Auth UI — Polish: friendly errors, loading states, double-tap prevention, AsyncStorage persistence

### Payments & Subscriptions

- [x] Add `react-native-purchases` + `react-native-purchases-ui` dependencies
- [x] Create `lib/revenueCat.ts` — SDK wrapper (init, customerInfo, offerings, purchase, restore, identity sync); safe in Expo Go via dynamic require
- [x] `updateUserProStatus(isPro)` in `lib/api.ts` — writes `profiles.is_pro` after purchase/restore
- [x] `useRevenueCatInfo()` hook — queries RC, exposes purchase + restore mutations, invalidates user profile on success
- [x] Build paywall screen (`app/(modal)/paywall.tsx`) — feature list, monthly/annual toggle, purchase CTA, restore button, static fallback pricing for Expo Go
- [x] Remove `isPro` from `PreferencesContext` — `User.isPro` from `useUserProfile()` is now the only source of truth
- [x] `useRecipePool` reads `isPro` from user profile (not preferences) — prevents self-upgrade
- [x] `AuthContext` calls `logInRevenueCat` / `logOutRevenueCat` on auth state change
- [x] Settings screen: replaced Pro toggle with live status row ("Pro Active" or "Upgrade to Pro →")
- [x] Result screen: calorie upsell (🔒 Pro pill) navigates to paywall
- [x] RevenueCat mocks added to `jest.setup.js`; `useRecipePool` tests updated for new `isPro` source
- [ ] Configure RevenueCat project in dashboard (entitlement `pro_access`, offering `default`, products) ([#14](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/14))
- [ ] Create iOS IAP products in App Store Connect (`com.dizzydish.pro.monthly`, `com.dizzydish.pro.annual`) ([#15](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/15))
- [ ] Create Android subscriptions in Google Play Console (`pro_monthly`, `pro_annual`) ([#16](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/16))
- [ ] Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in EAS Secrets ([#17](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/17))
- [ ] Test full purchase flow in sandbox (iOS StoreKit config + Android License Tester) ([#18](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/18))
- [ ] Verify subscription status server-side (RevenueCat webhook → Supabase Edge Function) ([#19](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/19))

### Error Tracking

- [ ] Add `@sentry/react-native` and initialize in `_layout.tsx` ([#20](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/20))
- [ ] Configure source-map uploads for readable stack traces ([#20](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/20))
- [ ] Add breadcrumbs to key user flows (spin, save, purchase) ([#20](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/20))

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
- [ ] Write unit tests for utility functions (`lib/haptics.ts`, `lib/asyncStorage.ts`) ([#27](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/27))
- [ ] Write component tests for more UI (`SpinButton`, `RecipeCard`, `FilterPill`) ([#27](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/27))
- [ ] Write integration tests for spin → result → save flow ([#28](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/28))
- [ ] Add snapshot tests for design-system components ([#27](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/27))

### CI / CD

- [x] GitHub Actions workflow: `npm run test:ci` on push/PR (`.github/workflows/test.yml`)
- [x] Create `eas.json` with development, preview, and production profiles
- [ ] Expand workflow: lint → typecheck → test ([#21](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/21))
- [ ] Add EAS Build step (preview on PR, production on merge to `main`) ([#22](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/22))
- [ ] Add EAS Submit step for App Store and Google Play ([#23](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/23))
- [ ] Configure OTA updates via `expo-updates` ([#24](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/24))

### Deep Linking

- [x] URL scheme `dizzydish://` registered in `app.json`
- [ ] Handle inbound deep links for shared recipes (`dizzydish://recipe/:id`)
- [ ] Handle Instacart OAuth callback deep link ([#25](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/25))
- [ ] Add universal links / App Links for `https://dizzydish.app` domain

### Instacart Integration

- [ ] Obtain real Instacart API credentials ([#25](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/25))
- [ ] Implement OAuth connect flow (replace mock `connectInstacart()`) ([#25](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/25))
- [ ] Implement "Add ingredients to cart" API call ([#26](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/26))
- [ ] Handle token refresh and disconnect ([#25](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/25))

---

## P2 — Post-Launch Enhancements

### Analytics

- [ ] Choose provider (Segment, Mixpanel, Amplitude, or PostHog) ([#31](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/31))
- [ ] Track key events: `spin`, `save_recipe`, `unsave_recipe`, `purchase`, `login` ([#31](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/31))
- [ ] Track screen views via Expo Router navigation listener ([#31](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/31))
- [ ] Add user properties (plan tier, dietary filters, platform) ([#31](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/31))

### Push Notifications

- [ ] Add `expo-notifications` dependency ([#33](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/33))
- [ ] Request notification permission with contextual prompt ([#33](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/33))
- [ ] Register device push token with backend ([#33](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/33))
- [ ] Implement weekly meal-plan reminder notification ([#33](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/33))
- [ ] Implement "Your recipe is ready" notification (if generation is async)

### Onboarding

- [ ] Design and build first-launch onboarding carousel ([#30](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/30))
- [ ] Collect dietary preferences during onboarding ([#30](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/30))
- [ ] Show tutorial tooltip on first spin

### Performance & Polish

- [ ] Profile and optimize cold-start time
- [ ] Add skeleton loaders for recipe cards and result screen ([#32](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/32))
- [ ] Implement image caching for recipe photos
- [ ] Audit accessibility (VoiceOver / TalkBack) on all screens ([#29](https://github.com/DizzyDishApp/dizzy-dish-calm/issues/29))

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
- [x] RevenueCat payments integration — `lib/revenueCat.ts` SDK wrapper, `useRevenueCatInfo()` hook, `updateUserProStatus()` Supabase sync, paywall screen, `isPro` removed from PreferencesContext, RevenueCat identity linked to Supabase auth lifecycle
