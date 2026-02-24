# Dizzy Dish

A recipe decision app for the parent at 6:30pm who just needs an answer.

One button. One answer. No noise.

---

## What is Dizzy Dish?

Dizzy Dish removes the daily "what's for dinner?" paralysis. You set your dietary preferences once, hit the **"decide for me"** spin button, and get a fully curated recipe — or an entire 7-day meal plan — in under two seconds.

Results come with cook time, calories, dietary tags, and a one-tap path to ordering ingredients through Instacart.

### Core Features

- **Single Spin** — One tap to get a recipe that matches your filters
- **Weekly Plan** — Toggle weekly mode for 7 meals with a shared grocery list that deduplicates ingredients (42 items down to 28)
- **Dietary Filters** — 19 options including Vegetarian, Vegan, Gluten Free, Keto, Paleo, Pescatarian, allergen-specific (No Peanuts, No Shellfish, etc.)
- **Save Collection** — Heart any result to build your personal recipe book
- **Instacart Integration** — Connect your account to order ingredients directly from a result
- **Haptic Feedback** — Every interaction has purpose-matched haptics (heavy for the spin, light for navigation, success buzz when a result lands)
- **Offline-ready fixture pool** — The app works without a Spoonacular API key using a curated set of 25 hand-crafted recipes

### Who it's for

Parents. Busy people. Anyone who has decision fatigue about food. The entire UX is built around the idea that by 6:30pm you're exhausted and you need calm competence, not a wall of options.

---

## Design System — "Exhale" Concept

The visual language is called **Exhale**. It's warm, organic, and deliberately minimal.

### Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#FAF6F1` | App background — warm off-white |
| Card | `#FFFFFF` | Card surfaces |
| Cream | `#F5EDE5` | Secondary surfaces, input backgrounds |
| Warm | `#C65D3D` | Primary accent — terracotta |
| Warm Light | `#E8BBA8` | Soft accent, avatar gradient |
| Warm Pale | `#FDF0EB` | Secondary button backgrounds |
| Green | `#5B8C6A` | Action color (order, success) |
| Green Light | `#E4EFE7` | Green surface tint |
| Instacart | `#108910` | Instacart brand green |
| Text | `#2D2A26` | Primary text — near-black warm |
| Text Soft | `#8C857D` | Secondary text |
| Text Light | `#B8B2AA` | Tertiary text, placeholders |
| Border | `#E8E3DD` | Dividers, input borders |

### Typography

- **Display:** Fraunces (serif) — warm and characterful. Used for headings, the spin button label, and section titles.
- **Body:** Plus Jakarta Sans (sans-serif) — clean and modern. Used for everything else.

Both are Google Fonts loaded at runtime via `expo-font`.

### Animations

All animations use React Native Reanimated v3 (UI thread, 60fps):

| Name | Behavior | Where |
|---|---|---|
| calmPulse | Scale 1 to 1.03, 3s infinite loop | Spin button idle state |
| gentleUp | Fade in + translate Y 20px to 0, staggered | Page content entrance |
| slideUp | Translate Y 100% to 0, cubic-bezier | Result card entrance |
| spinWheel | Rotate 0 to 1080deg, 0.7s | Spin sequence |
| confFloat | Translate Y up 60px, scale down, fade out | Food emoji celebration |

### Haptics

| Intensity | Trigger |
|---|---|
| Heavy | Spin button press |
| Success | Result appears |
| Medium | Save/unsave heart |
| Select | Toggle, filter pills |
| Light | Navigation (back, gear, avatar) |

### Design System Source

The full design system spec is defined in an SVG file that documents every color, typography scale, spacing value, border radius, component variant, shadow level, animation, and haptic pattern. It lives alongside this repo as the source of truth for the visual language.

---

## Recipe Data

Recipes come from the [Spoonacular API](https://spoonacular.com/food-api) and are fetched as a pool once per session, then drawn from locally at spin time — no API call happens when you tap the button.

### Tier strategy

| User tier | Endpoint | Calorie data |
|---|---|---|
| Guest / Free | `/recipes/random` | Not available (shows "—") |
| Pro | `/recipes/complexSearch` | Full nutrition included |

### Fixture fallback

The app ships with **25 hand-crafted fallback recipes** (`lib/fixtures/spoonacularRecipes.ts`) that run through the exact same mapper, ingredient filter, and tag-builder pipeline as live API data. They are used automatically when:

- `EXPO_PUBLIC_SPOONACULAR_API_KEY` is not set
- The API returns HTTP 402 (quota exceeded)
- The API returns HTTP 200 with 0 results (Spoonacular's silent quota behaviour — it doesn't always send a proper 402)
- A network error prevents reaching the API

This means the spin button always works during development, even without a key or when the daily free quota (50 points) is exhausted.

### Setting up the API key

1. Create a free account at [spoonacular.com](https://spoonacular.com/food-api)
2. Copy your API key from the dashboard
3. Add it to your `.env`:
   ```
   EXPO_PUBLIC_SPOONACULAR_API_KEY=your_key_here
   ```
4. Set IP/referer restrictions in the Spoonacular dashboard — the key is visible in the JS bundle

---

## Payments & Subscriptions

DizzyDish uses **RevenueCat** for in-app purchases (iOS StoreKit + Google Play Billing).

### Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| Free / Guest | $0 | Unlimited spins, no nutrition, preferences reset each spin |
| Pro Monthly | $2.99/month | Calorie + nutrition info, persistent preferences, Pro recipe pool |
| Pro Annual | $14.99/year | Same as monthly, ~58% savings |

### How it works in the code

- `lib/revenueCat.ts` — SDK wrapper (init, purchase, restore, identity sync)
- `hooks/useUserProfile.ts` → `useRevenueCatInfo()` — queries RC, exposes `purchase` + `restore` mutations
- On purchase/restore: writes to `profiles.is_pro` in Supabase, invalidates the user profile React Query cache
- `User.isPro` from `useUserProfile()` is the **only** source of truth for Pro feature gating — never in context
- `app/(modal)/paywall.tsx` — paywall screen (navigated to from calorie upsell in result screen and from settings)

### Environment variables

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

Leave unset during development — the paywall will show static pricing and the SDK silently no-ops. The fixture pool still serves Pro recipes when a user's profile has `is_pro = true` in Supabase.

### Important: requires a dev build

`react-native-purchases` has native code and cannot run in Expo Go. Use `npx expo run:ios` or `npx expo run:android` to test real purchase flows.

### Sandbox testing

- **iOS:** Create a StoreKit Configuration file (`.storekit`) in Xcode and point your scheme at it — the simulator processes purchases instantly
- **Android:** Add your Google account as a License Tester in Play Console
- RevenueCat dashboard → **Sandbox** tab shows all test transactions

See `lib/CLAUDE.md` → RevenueCat Integration for full setup instructions including App Store Connect and Google Play Console product IDs.

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Comes with Node |
| Expo CLI | Latest | Installed via npx (no global install needed) |
| Xcode | 15+ | iOS Simulator — macOS only |
| Android Studio | Latest | Android Emulator — any OS |
| Expo Go | Latest | Physical device testing — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |

### Install and Run

```bash
# Clone the repo
git clone <your-repo-url>
cd DizzyDish

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

Once the dev server is running, you'll see a QR code and menu in the terminal.

### Running on iOS Simulator

```bash
# Option 1: Press 'i' in the Expo dev server terminal

# Option 2: Direct launch
npx expo start --ios

# Option 3: If you need a specific simulator
npx expo start --ios --device "iPhone 16 Pro"
```

Requires Xcode with at least one iOS Simulator installed. Open Xcode > Settings > Platforms to install simulator runtimes.

### Running on Android Emulator

```bash
# Option 1: Press 'a' in the Expo dev server terminal

# Option 2: Direct launch
npx expo start --android
```

Requires Android Studio with an AVD (Android Virtual Device) configured and running. Start the emulator from Android Studio > Device Manager before running the command.

### Running on a Physical Device

1. Install the **Expo Go** app on your phone
2. Start the dev server: `npx expo start`
3. **iOS:** Scan the QR code with your phone camera
4. **Android:** Scan the QR code from inside the Expo Go app

Your computer and phone must be on the same WiFi network. If that's not possible, use tunnel mode:

```bash
npx expo start --tunnel
```

This routes through Expo's servers (slower, but works across networks). Requires `@expo/ngrok` — Expo will prompt you to install it.

---

## Expo Builds

### Development Build

A development build is a custom version of Expo Go that includes your native dependencies. Use this when you need native modules that Expo Go doesn't support, or when you want a closer-to-production dev experience.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure your project for EAS Build (first time only)
eas build:configure

# Create a development build for iOS
eas build --profile development --platform ios

# Create a development build for Android
eas build --profile development --platform android

# Run the dev build on a simulator/emulator
eas build --profile development-simulator --platform ios
```

After the build completes, install it on your device/simulator and connect it to your dev server:

```bash
npx expo start --dev-client
```

### Preview Build

A preview build is an internal distribution build — like a beta. It's a real app binary you can share with testers via a link, but it's not on the App Store or Play Store.

```bash
# iOS preview (ad-hoc distribution — needs device UDIDs registered)
eas build --profile preview --platform ios

# Android preview (produces an APK or AAB you can sideload)
eas build --profile preview --platform android
```

You'll need an `eas.json` file. Here's a starter:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "development-simulator": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### Production Build

A production build is what goes to the App Store and Google Play.

```bash
# iOS production (requires Apple Developer account, $99/year)
eas build --profile production --platform ios

# Android production (requires Google Play Developer account, $25 one-time)
eas build --profile production --platform android

# Both at once
eas build --profile production --platform all
```

### Submitting to Stores

```bash
# Submit to App Store (after production iOS build completes)
eas submit --platform ios

# Submit to Google Play (after production Android build completes)
eas submit --platform android
```

You'll need to configure credentials:
- **iOS:** Apple Developer account, App Store Connect API key or Apple ID login
- **Android:** Google Play service account JSON key

### OTA Updates

Expo supports over-the-air updates for JS bundle changes (no native code changes). This lets you push bug fixes without going through the app stores.

```bash
# Push an update to all users on the production channel
eas update --branch production --message "Fix recipe card layout"

# Push to a specific channel (e.g., preview testers)
eas update --branch preview --message "New weekly plan UI"
```

### Local Compilation (No EAS)

If you need to build locally without Expo's cloud service:

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Build with Xcode
cd ios && pod install && cd ..
open ios/DizzyDish.xcworkspace
# Build and run from Xcode

# Generate native Android project
npx expo prebuild --platform android

# Build with Gradle
cd android && ./gradlew assembleDebug
```

After prebuilding, the `ios/` and `android/` directories contain standard native projects. You can open them in Xcode and Android Studio respectively.

### Clearing Caches

When things go wrong:

```bash
# Clear Expo/Metro cache
npx expo start --clear

# Nuclear option: clear everything
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

---

## Project Structure

```
app/                        Screens (Expo Router file-based routing)
  _layout.tsx               Root layout — fonts, providers, nav config
  index.tsx                 Home — spin button, weekly toggle
  result.tsx                Single recipe result
  weekly-result.tsx         7-day meal plan result
  saved.tsx                 Saved recipes list
  (modal)/                  Modal presentations
    settings.tsx            Dietary/time/calorie preferences
    account.tsx             Auth, Instacart, subscription
    instacart.tsx           Instacart login

components/                 Reusable UI components
context/                    React Context modules (client state)
providers/                  Provider composition
hooks/                      React Query hooks (server state)
lib/                        API fetchers, query config, helpers
  spoonacular.ts            Spoonacular client — types, mapper, pool fetchers, fixture fallback
  fixtures/
    spoonacularRecipes.ts   25 hand-crafted fallback recipes (raw SpoonacularRecipe format)
constants/                  Colors, typography tokens
types/                      Shared TypeScript interfaces
assets/                     Fonts, images
__tests__/                  Test files (Jest + React Testing Library) — 111 tests, 11 suites
.github/workflows/          CI workflows (GitHub Actions)
```

See `CLAUDE.md` for full architectural documentation, coding conventions, and guides for adding new features.

---

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Start and open on iOS Simulator |
| `npm run android` | Start and open on Android Emulator |
| `npm run web` | Start web version (limited support) |
| `npm test` | Run Jest test suite |
| `npm test -- --watch` | Run tests in watch mode |
| `npm test -- --coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests in CI mode (`--ci --runInBand --forceExit`) |
| `npm run lint` | Run ESLint |

---

## Testing

### Overview

Tests use **Jest** (`jest-expo` preset) and **React Testing Library** (`@testing-library/react-native`). The test infrastructure handles NativeWind, Reanimated, and all Expo/React Native modules via mocks in `jest.setup.js`.

### Running Tests

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- --testPathPattern=PrimaryButton

# Watch mode (re-runs on changes)
npm test -- --watch

# With coverage
npm test -- --coverage
```

### Test Structure

```
__tests__/
  test-utils.tsx                  ← Shared helpers (QueryClient wrapper, re-exports)
  AuthContextReducer.test.ts      ← Pure unit tests (reducer, helpers)
  api.checkEmailExists.test.ts    ← API helper tests (supabase mock)
  PrimaryButton.test.tsx          ← Component tests
  SocialButton.test.tsx           ← Component tests
  InputField.test.tsx             ← Component tests
  AuthContext.test.tsx            ← Provider integration tests (renderHook)
  AccountScreen.test.tsx          ← Screen integration tests (full render)
  spoonacular.mapping.test.ts     ← Spoonacular mapper, tag builder, filters, emoji picker
  useGuestSpinLimit.test.ts       ← Guest spin limit: increment, daily reset, limit reached
  useRecipePool.test.tsx          ← Pool fetch, cache fingerprint, tier switching
  useSpinRecipe.test.tsx          ← Spin mutations: success, empty pool, filter mismatch
```

111 tests passing across 11 suites. Run `npm test` to verify.

### Writing New Tests

1. Create `__tests__/YourThing.test.tsx`
2. Import helpers from `__tests__/test-utils` if you need a React Query wrapper
3. For screen tests, mock context hooks at the module level with `jest.mock()`
4. For pure functions (reducers, helpers), import and test directly

See `CLAUDE.md` section 15 for detailed conventions and examples.

---

## CI/CD

### GitHub Actions

The CI workflow (`.github/workflows/test.yml`) runs automatically on:
- **Push** to `main` and all conventional branches (`feat/**`, `fix/**`, `refactor/**`, etc.)
- **Pull requests** targeting `main`

It runs two jobs:

| Job | What it checks |
|---|---|
| **Branch naming** | PR branch matches `<type>/<kebab-case-description>` pattern (PRs only) |
| **Tests** | `npm run test:ci` — all Jest tests must pass |

### Branch Protection (required setup)

After pushing this workflow, configure branch protection on GitHub:

1. Go to **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable these settings:
   - **Require a pull request before merging**
     - Require approvals: 1 (or more for your team size)
   - **Require status checks to pass before merging**
     - Search and add: `Tests` and `Branch naming`
     - Check "Require branches to be up to date before merging"
   - **Do not allow bypassing the above settings**
   - **Restrict deletions**
   - **Block force pushes**
   - **Automatically delete head branches** (keeps repo clean after merge)
4. Save changes

### Branch Naming Convention

All branches must follow `<type>/<kebab-case-description>`:

| Prefix | Purpose | Example |
|---|---|---|
| `feat/` | New feature | `feat/add-weekly-meal-plan` |
| `fix/` | Bug fix | `fix/auth-redirect-loop` |
| `refactor/` | Refactoring | `refactor/split-preferences-context` |
| `chore/` | Build, deps, config | `chore/bump-expo-sdk-55` |
| `docs/` | Documentation | `docs/update-api-guide` |
| `test/` | Tests | `test/add-recipe-card-tests` |
| `style/` | Formatting | `style/fix-indentation` |
| `hotfix/` | Urgent prod fix | `hotfix/crash-on-empty-session` |
| `release/` | Release prep | `release/1-0-0` |

The description must be lowercase with hyphens only (no underscores, no uppercase).

### Future CI Additions (planned)

- TypeScript type-checking (`npx tsc --noEmit`)
- ESLint (`npm run lint`)
- EAS Build (preview on PR, production on merge)
- EAS Submit (App Store + Google Play)
- OTA updates via `expo-updates`

---

## Contributing & Project Management

### Where things live

| Resource | URL | Purpose |
|---|---|---|
| **Project Board** | [github.com/orgs/DizzyDishApp/projects/7](https://github.com/orgs/DizzyDishApp/projects/7) | Kanban — what's in progress right now |
| **Discussions** | [github.com/DizzyDishApp/dizzy-dish-calm/discussions](https://github.com/DizzyDishApp/dizzy-dish-calm/discussions) | Feature debate, roadmap, wants vs needs |
| **Issues** | [github.com/DizzyDishApp/dizzy-dish-calm/issues](https://github.com/DizzyDishApp/dizzy-dish-calm/issues) | Committed work items with labels + milestones |
| **Wiki** | [github.com/DizzyDishApp/dizzy-dish-calm/wiki](https://github.com/DizzyDishApp/dizzy-dish-calm/wiki) | Architecture, feature guides, design system, testing |
| **Milestones** | [github.com/DizzyDishApp/dizzy-dish-calm/milestones](https://github.com/DizzyDishApp/dizzy-dish-calm/milestones) | Internal Alpha → TestFlight Beta → App Store 1.0 → Post-Launch 1.1 |

### Workflow

1. **New idea?** → Open a [Discussion](https://github.com/DizzyDishApp/dizzy-dish-calm/discussions) first. Debate it, vote on it. Once it's agreed on, convert to an issue.
2. **New issue?** → Use the issue templates. Always set a `priority:` label, an `area:` label, and a milestone.
3. **Starting work?** → Move the issue to **This Sprint** on the board, cut a branch (`feat/issue-N-short-description`), move to **In Progress**.
4. **Opening a PR?** → Add `Closes #N` in the PR body. This auto-closes the issue and moves the board card to Done on merge.

### Sprint vs Milestone

- **Milestone** = the destination (Internal Alpha, TestFlight Beta, etc.) — weeks of work
- **This Sprint** = what you're doing *this week* — 2–3 issues per person max

Each week, pull the highest-priority milestone issues into **This Sprint**. When the milestone's issues are all Done, you ship.

### Labels

Issues use three label namespaces — always set at least one from each of the first two:

- `area:` — which feature module (spin, auth, payments, instacart, etc.)
- `priority:` — P0 (launch-blocking) → P3 (nice-to-have)
- `type:` — optional modifier (`native-only`, `accessibility`, `performance`, etc.)

See `tasks.md` for the full prioritized task list linked to GitHub issues.

---

## License

Proprietary. All rights reserved.
