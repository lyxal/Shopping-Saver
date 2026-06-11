---
name: react-native-styling
description: >
  Apply clean, minimal styling to React Native components using plain StyleSheet.create.
  Triggered whenever styling, layout polish, or visual improvements are requested.
  Also triggered when creating or editing any component that currently lacks styles.
version: 1.0.0
---

# React Native Styling Skill

## When to use this skill

Use this skill when:

- Adding or updating styles to any component or page
- Asked to make the UI look better, cleaner, or more polished
- Creating a new component that needs styling
- Fixing layout or visual issues

## Architecture rules (read these first)

These are hard constraints. Do not deviate without explicitly asking the user.

- **Do not create new folders** for styles. No `styles/`, no `theme/`, no `tokens/`.
- **Do not create new shared style files** beyond the existing `src/app/styles/global.ts`.
- **Do not introduce a ThemeContext, ThemeProvider, or style utility functions.**
- **Do not use StyleSheet.flatten, StyleSheet.compose, or style arrays** unless
  the component already uses them.
- **Keep styles in the same file as the component.** Local styles go at the bottom
  of the file, below the component, above nothing else.
- **Do not create barrel files or index re-exports** for styles.
- **One component, one file.** Do not split a component across files to accommodate styling.
- If something feels like it needs a new abstraction, stop and ask the user instead.

## Migration from old global styles

This codebase is migrating from a legacy `global.ts` that exported a single flat
`styles` object with these keys:

```ts
styles.main        → g.screenContainer (or g.screenContainerCentered)
styles.text        → g.textBody
styles.container   → g.row
styles.modal       → g.modal
styles.input       → g.input
```

**When you touch any file, replace all legacy references in that file.**
Do not leave a mix of old and new in the same component. Do not import both
the old and new shapes. If you see any of the above keys, replace them as
part of your change — even if the user didn't explicitly ask.

The old import was:

```ts
import { styles } from "../styles/global"; // legacy — do not use
```

The correct import is:

```ts
import {
  styles as g,
  colors,
  spacing,
  typography,
  radii,
} from "../styles/global";
```

- Always import from global:
  ```ts
  import {
    styles as g,
    colors,
    spacing,
    typography,
    radii,
  } from "../styles/global";
  ```
- Use `g.textHeading`, `g.buttonPrimary`, etc. for composed styles that are reused across components.
- Use `colors.accent`, `spacing.md`, etc. directly for dynamic/runtime values (inside `style={[..., { backgroundColor: colors.accent }]}`).
- Define component-specific styles at the bottom of the file:
  ```ts
  const styles = StyleSheet.create({ ... });
  ```
- Use `styles.foo` for local, `g.foo` for global. Do not merge them.
- Do not use inline style objects (e.g. `style={{ margin: 8 }}`), except for
  dynamic values that depend on runtime state (e.g. `style={{ width: percent }}`).
- All static values must live in a StyleSheet.

## Design tokens

Use these values consistently. Do not invent new colors, font sizes, or spacing
values. If a new value is genuinely needed, add it to `global.ts` and note this
to the user.

### Color

```
background:    #000000   — screen/page background
surface:       #0F0F0F   — modals, secondary surfaces
surfaceHigh:   #1A1A1A   — inputs, dark cards, hover/pressed states
surfaceWhite:  #FFFFFF   — white cards (featured offers, prominent content)
border:        #2A2A2A   — unfocused input borders, dividers
borderFocus:   #FFFFFF   — input border when focused
borderError:   #FF3B6B   — input border when validation fails
textPrimary:   #FFFFFF   — all primary text on dark backgrounds
textSecondary: #9CA3AF   — captions, labels, placeholders on dark
textDark:      #1A1A1A   — text on white surfaces
textError:     #FF3B6B   — inline validation error messages

accent:        #1D7EF5   — informational UI, icons, links (blue)
accentSubtle:  #0F2A4A   — blue accent backgrounds

amber:         #F5A623   — savings figures, success headings, offer CTAs
amberSubtle:   #2A1F0A   — amber accent backgrounds
amberBadge:    #F5A020   — "CHEAPEST" pill background

alertRed:      #E8442A   — "SAVINGS ALERT" badge (not for form errors)
errorBg:       #3D0014   — error banner background
destructive:   #FF3B6B   — error banners, borders, inline error text
```

**Color usage rules:**

- Amber: savings figures, offer highlights, celebration/success headings, offer CTAs
- Blue: informational states, icons, links — never for buttons
- alertRed: badge pills only ("SAVINGS ALERT") — not for form validation
- destructive/errorBg: form validation only — not for badge pills
- surfaceWhite: featured offer cards only — the rest of the UI stays dark

### Inputs

Dark background (`surfaceHigh`), white text. Manage three border states in the component:

```ts
const [focused, setFocused] = useState(false);
// hasError comes from your form validation logic
style={[g.input, focused && g.inputFocused, hasError && g.inputError]}
onFocus={() => setFocused(true)}
onBlur={() => setFocused(false)}
```

Always pair with `g.inputLabel` above and `g.inputErrorText` below (render error
text conditionally). When a form has multiple errors, show `g.errorBanner` above
the fields listing them all.

### Buttons

Four variants — pick the right one for context:

- `g.buttonPrimary` / `g.buttonPrimaryText` — white bg, black text.
  Full-width. "Continue", "Confirm", "Get Started".
- `g.buttonDark` / `g.buttonDarkText` — dark bg, white text.
  Used _inside_ white `cardWhite` surfaces only. "View offer".
- `g.buttonAmber` / `g.buttonAmberText` — amber bg, black text.
  Savings/offer CTAs only.
- `g.buttonOutlined` / `g.buttonOutlinedText` — transparent, white border.
  Secondary actions, inactive tab pills.

### Cards / surfaces

- `g.cardWhite` — white background. Featured offer content. Use `g.textHeadingDark`,
  `g.textBodyDark`, `g.textCaptionDark` for all text inside. Never white text on white.
- `g.cardDark` — transparent with subtle border. Account/mortgage summaries on black.

### Badges

- `g.badgeAlert` / `g.badgeAlertText` — red pill. "SAVINGS ALERT". Urgent alerts only.
- `g.badgeAmber` / `g.badgeAmberText` — amber pill. "CHEAPEST", "OFFER FOUND".

### Typography special cases

- `g.textLabel` — uppercase letter-spaced labels. "CURRENT MORTGAGE", section headers.
- `g.textHeadingAmber` — amber heading for celebration/success screens only.

### Spacing

Use multiples of 4. Prefer these named steps:

```
xs:   4
sm:   8
md:  16
lg:  24
xl:  32
xxl: 48
```

### Typography sizes

```
sizeSm:   13   — captions, labels, supporting text
sizeMd:   15   — body text (default)
sizeLg:   18   — subheadings, section titles
sizeXl:   24   — screen headings
sizeXxl:  32   — hero / display
```

### Radii

```
sm:   4
md:   8
lg:  12
xl:  16
full: 9999   — pills, avatars, primary buttons
```

## Global styles shape

When adding new tokens to `src/app/styles/global.ts`, follow this structure:

```ts
import { StyleSheet } from 'react-native';

export const colors = { ... };   // raw color values
export const spacing = { ... };  // raw spacing values
export const typography = { ... };

export const styles = StyleSheet.create({
  // composed styles that are used across many components
  // e.g. screenContainer, card, divider, textBody, textCaption
});
```

Only put something in `global.ts` if it is genuinely used in 3+ components.
Otherwise it belongs in the local `StyleSheet.create` at the bottom of the file.

## What "dark minimal" means here

- **Black backgrounds, white text, two accents.** Amber for savings/money/success.
  Blue for informational UI. Do not introduce any other colors.
- **White cards are the exception, not the rule.** Use `g.cardWhite` only for
  featured offer content — everything else stays dark.
- **Elements float on black** — prefer spacing and typography over borders to
  separate content. `g.cardDark` (subtle border) when containment is genuinely needed.
- **Generous whitespace.** When in doubt, add more vertical padding.
- **Primary buttons are white pill, full-width** on most screens.
  Dark buttons (`g.buttonDark`) live inside white cards only.
  Never use a blue button anywhere.
- **Uppercase labels** (`g.textLabel`) for section headers — not for body text or buttons.
- **Inputs are dark** — `surfaceHigh` bg, white text, white border on focus, red on error.
  Never white-background inputs.
- Touch targets minimum 44×44pt.

## Reference component

See `examples/component.tsx` for a full example of a card-style component
using both global and local styles correctly.
