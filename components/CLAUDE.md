# components/ — Component Guide, Styling & Design System

## Component Guidelines

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

### TypeScript: Component Props
- Inline `interface` in the component file for props
- Accept `className?: string` explicitly if the component needs NativeWind override support:
```ts
interface Props {
  className?: string;
}
```

---

## Component Inventory

| Component | Purpose | Key props |
|---|---|---|
| `Avatar` | User avatar | `size: "small" \| "large"`, `uri?` |
| `ConfettiEmoji` | Floating food emoji animation | — |
| `FilterPill` | On/off dietary filter toggle | `label`, `selected`, `onPress` |
| `GearButton` | Settings gear icon | `onPress` |
| `HeaderBar` | Shared header with back + title | `title`, `onBack?` |
| `HeartButton` | Heart/save toggle | `saved`, `onPress` |
| `InputField` | Styled TextInput (forwardRef) | Standard TextInput props |
| `LoadingDots` | Animated bouncing dots | — |
| `MetaPill` | Read-only info pill (time, cal, servings) | `label`, `icon?` |
| `PrimaryButton` | Primary CTA | `variant: "warm" \| "green" \| "instacart"`, `loading?` |
| `RecipeCard` | Recipe list item | `recipe`, `onPress`, `onHeart` |
| `SecondaryButton` | Secondary action | `variant: "cream" \| "warmPale" \| "ghost"` |
| `SmartGroceryCard` | Weekly plan shared ingredients callout | `ingredients` |
| `SocialButton` | Social auth button | `provider: "google" \| "facebook" \| "apple"`, `onPress` |
| `SpinButton` | Hero spin button with calmPulse animation | `onPress`, `isSpinning` |
| `SpinningOverlay` | Full-screen spin animation overlay | `visible` |
| `TagChip` | Recipe tag label chip | `label` |
| `Toast` | Auto-dismissing toast | `message`, `variant: "default" \| "error"` |
| `Toggle` | Toggle switch | `variant: "warm" \| "green"`, `value`, `onValueChange` |
| `WeeklyDayRow` | Single day row in weekly plan | `day`, `recipe` |

---

## NativeWind Configuration

### How it's wired up
1. `metro.config.js` — wraps default config with `withNativeWind({ input: "./global.css" })`
2. `babel.config.js` — uses `nativewind/babel` preset with `jsxImportSource: "nativewind"` (**disabled in test env**)
3. `global.css` — standard `@tailwind base/components/utilities` directives
4. `tailwind.config.js` — theme configuration with all design system tokens
5. `nativewind-env.d.ts` — TypeScript types for `className` prop
6. `app/_layout.tsx` — imports `../global.css`

### Using dynamic classes
```tsx
// Conditional classes
<Text className={`font-body ${isActive ? "text-warm" : "text-txt-soft"}`}>

// Platform-specific
<View className="p-lg ios:p-xl android:p-md">
```

### When to use `style={}` instead of `className`
Only use `StyleSheet.create()` or `style={}` for things NativeWind can't express:
- Complex shadows (`shadowColor`, `shadowOffset`, `elevation`)
- Dynamic values computed at runtime (e.g., `{ width: measuredWidth }`)
- Never mix `StyleSheet` and `className` on the same property

---

## Reanimated Patterns

### Enter/Exit Animations
```tsx
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";

<Animated.View
  entering={FadeInDown.delay(200).duration(400).springify()}
  exiting={FadeOut.duration(200)}
>
```

### Looping Animations (calmPulse — SpinButton idle)
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

### Float-away (confFloat — ConfettiEmoji)
```tsx
translateY.value = withDelay(delay, withTiming(-60, { duration: 1500 }));
scale.value = withDelay(delay, withTiming(0.5, { duration: 1500 }));
opacity.value = withDelay(delay, withTiming(0, { duration: 1500 }));
```

### Named animation patterns
- **calmPulse** — SpinButton idle: scale 1→1.03 loop
- **gentleUp** — Content entrance: `FadeInDown` with staggered delays
- **slideUp** — Result cards: `SlideInDown`
- **spinWheel** — Spin sequence: rotation 0→1080deg cubic-bezier
- **confFloat** — Celebration: translateY/scale/opacity float-away
- **loadingDots** — Button loading: 3 dots staggered `translateY` bounce

---

## Component Pitfalls

**Text not wrapped in `<Text>`** — React Native requires all text content inside `<Text>` components. Bare strings cause crashes.

**`StyleSheet` conflicts with NativeWind** — Avoid mixing `StyleSheet.create()` styles with NativeWind `className`. Use `style={}` only for shadows and runtime-computed values.

**Reanimated worklet rules** — Functions inside `useAnimatedStyle` run on the UI thread. They cannot access regular React state or closures. Only use `SharedValue` refs created with `useSharedValue`.

---

## Figma Design System Rules

### Design Philosophy
**Calm competence.** One tap. Deep breath. The UI should feel warm, organic, and unhurried. Every component should exhale, not demand attention.

### Color Tokens → NativeWind className

| Token | Hex | NativeWind | Usage |
|---|---|---|---|
| `bg` | `#FAF6F1` | `bg-bg` | App background |
| `card` | `#FFFFFF` | `bg-card` | Card surfaces |
| `cream` | `#F5EDE5` | `bg-cream` | Secondary surfaces, input backgrounds |
| `warm` | `#C65D3D` | `bg-warm` / `text-warm` | Primary CTA, active states, accents |
| `warm-light` | `#E8BBA8` | `bg-warm-light` | Warm tint, borders on warm elements |
| `warm-pale` | `#FDF0EB` | `bg-warm-pale` | Warm wash background |
| `warm-dark` | `#B04E32` | `bg-warm-dark` | Warm pressed state |
| `green` | `#5B8C6A` | `bg-green` / `text-green` | Success, secondary actions |
| `green-light` | `#E4EFE7` | `bg-green-light` | Green wash background |
| `instacart` | `#108910` | `bg-instacart` | Instacart brand color |
| `border` | `#E8E3DD` | `border-border` | Subtle dividers |
| `txt` | `#2D2A26` | `text-txt` | Primary text |
| `txt-soft` | `#8C857D` | `text-txt-soft` | Secondary/supporting text |
| `txt-light` | `#B8B2AA` | `text-txt-light` | Placeholders, disabled |

### Typography → NativeWind className

| Role | Font | Size | NativeWind |
|---|---|---|---|
| Hero heading (h1) | Fraunces Bold | 26px | `font-display text-[26px]` |
| Section header (h2) | Fraunces Bold | 18px | `font-display text-[18px]` |
| Subtitle | Plus Jakarta Sans | 14px | `font-body text-[14px]` |
| Spin button label | Fraunces Bold | 18px | `font-display text-[18px]` |
| Recipe card title | Plus Jakarta Sans SemiBold | 14px | `font-body-semibold text-[14px]` |
| Body copy | Plus Jakarta Sans | 13px | `font-body text-[13px]` |
| Section label | Plus Jakarta Sans SemiBold | 11px | `font-body-semibold text-[11px] tracking-wider` |
| Pill label | Plus Jakarta Sans Medium | 12px | `font-body-medium text-[12px]` |
| Meta info | Plus Jakarta Sans | 11px | `font-body text-[11px]` |
| Legal / fine print | Plus Jakarta Sans | 9px | `font-body text-[9px]` |

**Display font (Fraunces):** Use for character and warmth — hero headings, spin button, recipe names in the result screen.
**Body font (Plus Jakarta Sans):** Use for everything else — readability first.

### Spacing → NativeWind

| Token | Value | NativeWind | Usage |
|---|---|---|---|
| `micro` | 4px | `p-micro`, `gap-micro` | Icon gaps, tight padding |
| `sm` | 8px | `p-sm`, `gap-sm` | Small spacing |
| `md` | 12px | `p-md`, `gap-md` | Inner card padding |
| `lg` | 16px | `p-lg`, `gap-lg` | Standard section padding |
| `xl` | 24px | `p-xl`, `gap-xl` | Large breathing room |
| `hero` | 40px | `p-hero` | Hero area top/bottom padding |

### Border Radius → NativeWind

| Token | Value | NativeWind | Usage |
|---|---|---|---|
| `input` | 12px | `rounded-input` | Text inputs, search |
| `card` | 14px | `rounded-card` | Recipe cards, content cards |
| `pill` | 20px | `rounded-pill` | Filter pills, MetaPills |
| `social` | 28px | `rounded-social` | Social auth buttons |
| `btn` | 50px | `rounded-btn` | PrimaryButton, SecondaryButton |

### Icon System
- **Library:** `@expo/vector-icons` — **Ionicons only**
- **Usage:**
```tsx
import { Ionicons } from "@expo/vector-icons";
<Ionicons name="heart" size={20} color={Colors.warm} />
```
- **No SVG icons from Figma** — map all icons to the nearest Ionicons equivalent
- **Common icons:** `heart`, `heart-outline`, `settings-outline`, `chevron-back`, `add`, `checkmark`, `close`, `person-outline`, `cart-outline`
- **Size convention:** 16px (small/inline), 20px (standard), 24px (large/header)

### Asset Management
- **Images:** Use `expo-image` (`<Image>` from `expo-image`, not `react-native`) — built-in caching and blur placeholders
- **Local assets:** Reference from `assets/images/` via `require("@/assets/images/logo.png")`
- **Network images:** Pass URI to `expo-image` with `contentFit="cover"` or `contentFit="contain"`
- **Fonts:** Loaded at runtime via `@expo-google-fonts/*` packages in `app/_layout.tsx` — no manual font file management

### Figma → Code Mapping Cheatsheet

| Figma element | React Native code |
|---|---|
| Frame / Group | `<View>` |
| Text | `<Text className="font-body text-txt">` |
| Auto Layout (row) | `<View className="flex-row items-center gap-sm">` |
| Auto Layout (col) | `<View className="flex-col gap-md">` |
| Fill color | `bg-{token}` className |
| Text color | `text-{token}` className |
| Corner radius | `rounded-{token}` className |
| Padding | `p-{token}` or `px-{token} py-{token}` |
| Gap | `gap-{token}` |
| Button (filled) | `<PrimaryButton variant="warm" />` |
| Button (outline/ghost) | `<SecondaryButton variant="ghost" />` |
| Toggle switch | `<Toggle variant="warm" />` |
| Input field | `<InputField />` |
| Chip / filter tag | `<FilterPill />` or `<TagChip />` |
| Meta badge (time/cal) | `<MetaPill />` |
| Card container | `<View className="bg-card rounded-card p-lg">` |
| Network image | `<Image source={{ uri }} contentFit="cover" />` (expo-image) |
| Icon | `<Ionicons name="..." size={20} color={Colors.warm} />` |
| Divider | `<View className="h-px bg-border" />` |

### Component Architecture Pattern
```tsx
// Always: named export, props interface, JSDoc
interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onHeart: () => void;
}

/**
 * Recipe list item card with emoji, name, time, and heart toggle.
 * rounded-card, bg-card, p-lg, shadow via style={}
 */
export function RecipeCard({ recipe, onPress, onHeart }: RecipeCardProps) {
  return (
    <Pressable
      className="bg-card rounded-card p-lg flex-row items-center gap-md"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${recipe.name}`}
    >
      {/* content */}
    </Pressable>
  );
}
```

### Toast Variants
- `variant="default"` — dark background (`bg-txt`), white text — general messages
- `variant="error"` — warm background (`bg-warm`), white text — error/failure messages

### Button Variants

**PrimaryButton:**
- `variant="warm"` — `bg-warm` background, white text — primary CTA (default)
- `variant="green"` — `bg-green` background, white text — success actions
- `variant="instacart"` — `bg-instacart` background, white text — Instacart ordering

**SecondaryButton:**
- `variant="cream"` — `bg-cream` background, warm text — secondary actions
- `variant="warmPale"` — `bg-warm-pale` background, warm text — soft secondary
- `variant="ghost"` — transparent background, warm text — tertiary actions

---

## Code → Figma (Pushing screens to Figma)

Use the `mcp__figma__generate_figma_design` MCP tool to capture a running screen and push it into Figma.

### Workflow (two-step)

**Step 1 — Get the capture script:**
Call the tool with your chosen `outputMode`. It returns a JavaScript snippet to run in the browser.

```
mcp__figma__generate_figma_design({
  outputMode: "newFile",          // or "existingFile" | "clipboard"
  fileName: "DizzyDish Screens",  // only for newFile
  planKey: "<team-plan-key>",     // only for newFile — omit to get list of plans
})
```

Run the returned JS snippet in your browser's DevTools console (or Expo web preview) while the screen is visible.

**Step 2 — Poll for completion:**
Call the tool again with the `captureId` returned by the script execution:

```
mcp__figma__generate_figma_design({
  captureId: "<id-from-step-1>",
  outputMode: "newFile",
  fileKey: "<file-key>",  // required for existingFile mode
})
```

Returns the Figma file URL when complete.

### Output mode cheatsheet

| Mode | When to use | Extra params needed |
|---|---|---|
| `newFile` | Creating a fresh Figma file | `fileName`, `planKey` (omit to list plans) |
| `existingFile` | Adding a screen to an existing file | `fileKey` (from Figma URL), `nodeId` (optional — targets a specific page/frame) |
| `clipboard` | Paste into any open Figma file | None |

### Getting `fileKey` and `nodeId` from a Figma URL
```
https://figma.com/design/pqrs/MyFile?node-id=1-2
                          ^^^^                ^^^
                        fileKey            nodeId (use "1:2" format, not "1-2")
```

### Capturing multiple screens
Each `captureId` is **single-use** — it captures one page. For multiple screens either:
- Use one capture ID and navigate via the **capture toolbar** that appears in the browser (auto-generates new IDs)
- Call the tool once per screen to generate a separate `captureId` for each

### Tips for React Native / Expo
- Use **Expo web** (`npx expo start --web`) to get a browser-renderable version of the screen
- The capture runs against the live DOM — make sure the screen is in the desired state (loaded, not loading) before running the JS snippet
- For modal screens, navigate to the modal first, then capture
- NativeWind `className` styles render correctly in Expo web since the browser applies Tailwind CSS natively

### Listing available plans / recent files
Call the tool with **no `outputMode`** to get:
- A list of recent Figma files (for `existingFile` mode)
- A list of available team plans (for `newFile` mode)

```
mcp__figma__generate_figma_design({})
```
