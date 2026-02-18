# constants/ — Design Token Reference

## Where tokens are defined

| File | Contents |
|---|---|
| `constants/colors.ts` | `Colors` object — all hex values as TypeScript constants |
| `constants/typography.ts` | `FontSizes`, `FontWeights`, `LineHeights`, `LetterSpacing` |
| `tailwind.config.js` | Tailwind theme — the single source of truth for NativeWind `className` props |

**Rule:** Prefer NativeWind `className` props over importing from `constants/` directly. The constants are for places where NativeWind can't reach (e.g., `StyleSheet.create()`, Reanimated `useAnimatedStyle`).

---

## Color Tokens

```
bg: #FAF6F1          — App background (warm off-white)
card: #FFFFFF        — Card surfaces
cream: #F5EDE5       — Secondary surface

warm: #C65D3D        — Primary accent (terracotta/rust)
warm-light: #E8BBA8  — Warm tint
warm-pale: #FDF0EB   — Warm background wash
warm-dark: #B04E32   — Warm pressed/hover

green: #5B8C6A       — Success / secondary action
green-light: #E4EFE7 — Green background wash

instacart: #108910   — Instacart brand green
border: #E8E3DD      — Subtle dividers

txt: #2D2A26         — Primary text (near-black, warm)
txt-soft: #8C857D    — Secondary text
txt-light: #B8B2AA   — Placeholder / disabled text
```

NativeWind usage: `text-warm`, `bg-bg`, `border-border`, `text-txt-soft`, etc.

---

## Typography Tokens

### Font families (NativeWind className)
```
font-display            → Fraunces 700 Bold       — Hero headings
font-display-semibold   → Fraunces 600 SemiBold
font-display-italic     → Fraunces 400 Italic
font-display-bold-italic → Fraunces 700 Bold Italic
font-body               → Plus Jakarta Sans 400    — Body text (default)
font-body-medium        → Plus Jakarta Sans 500
font-body-semibold      → Plus Jakarta Sans 600
font-body-bold          → Plus Jakarta Sans 700
font-body-extrabold     → Plus Jakarta Sans 800
font-body-light         → Plus Jakarta Sans 300
```

### Font sizes (from `constants/typography.ts`)
```
h1: 26px   (display)       — Screen titles
h2: 18px   (display)       — Section headers
subtitle: 14px             — Subtitles
buttonHero: 18px           — Spin button label
recipeTitle: 14px          — Recipe name in cards
body: 13px                 — Body copy
sectionLabel: 11px         — Section labels (uppercase)
pillLabel: 12px            — Filter pill labels
meta: 11px                 — Meta info (time, calories)
legal: 9px                 — Fine print
```

---

## Spacing Tokens (NativeWind)
```
p-micro → 4px    — Tight padding (icon gaps)
p-sm    → 8px    — Small spacing
p-md    → 12px   — Medium spacing (inner card padding)
p-lg    → 16px   — Standard section padding
p-xl    → 24px   — Large breathing room
p-hero  → 40px   — Hero area padding
```

---

## Border Radius Tokens (NativeWind)
```
rounded-input  → 12px  — Text inputs
rounded-card   → 14px  — Recipe cards
rounded-pill   → 20px  — Filter pills, MetaPill
rounded-social → 28px  — Social auth buttons
rounded-btn    → 50px  — Primary/Secondary buttons (fully rounded)
```

---

## Extending the theme

Edit `tailwind.config.js` under `theme.extend`:
```js
colors: {
  warning: "#E5A100",
},
spacing: {
  xxl: "32px",
},
```

Then use immediately via NativeWind: `bg-warning`, `p-xxl`.

---

For Figma-to-code mapping and full design system usage in components, see `components/CLAUDE.md`.
