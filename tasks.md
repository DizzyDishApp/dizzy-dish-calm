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

- [ ] Stand up real API server (replace mock endpoints in `lib/api.ts`)
- [ ] Implement `POST /spin` — single-recipe generation with preference params
- [ ] Implement `POST /spin/weekly` — 7-day meal-plan generation
- [ ] Implement `GET /recipes/saved`, `POST /recipes/save`, `DELETE /recipes/unsave`
- [ ] Implement `GET /user/profile` and `PUT /user/profile`
- [ ] Implement `GET /user/subscription`
- [ ] Add proper error responses and retry/back-off in the client

### Authentication

- [ ] Integrate real auth provider (Supabase Auth, Firebase Auth, or Auth0)
- [ ] Wire up email/password sign-up and login (currently commented out)
- [ ] Wire up Apple Sign-In
- [ ] Wire up Google Sign-In
- [ ] Wire up Facebook Login
- [ ] Store and refresh real JWT tokens (replace mock `loginWithSocial()`)
- [ ] Add auth-gated screens and redirect unauthenticated users

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
- [ ] Write unit tests for utility functions (`lib/haptics.ts`, `lib/asyncStorage.ts`)
- [ ] Write unit tests for React Query hooks (`hooks/`)
- [ ] Write component tests for core UI (`SpinButton`, `RecipeCard`, `FilterPill`)
- [ ] Write integration tests for auth flow
- [ ] Write integration tests for spin → result → save flow
- [ ] Add snapshot tests for design-system components

### CI / CD

- [ ] Create `eas.json` with development, preview, and production profiles
- [ ] Set up GitHub Actions workflow: lint → typecheck → test
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
- [x] 19 reusable UI components (`components/`)
- [x] Animation system (Reanimated v3, 5 patterns, 60 fps)
- [x] Haptic feedback system (`lib/haptics.ts`)
- [x] Settings / preferences screen with 19 dietary filters, time & calorie filters
- [x] Preferences persistence via AsyncStorage
- [x] React Query + React Context state management architecture
- [x] App icon, adaptive icon, splash screen, and favicon
- [x] `.env` and `.env.example` with feature-flag placeholders
- [x] Expo Router navigation (tabs, modals, stack)
- [x] Light/dark theme support via ThemeContext
- [x] Toast notification component
- [x] CLAUDE.md and README.md documentation
