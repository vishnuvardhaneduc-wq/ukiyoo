---
name: Warm Editorial Parchment
colors:
  surface: '#fff8f1'
  surface-dim: '#dfd9d1'
  surface-bright: '#fff8f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3eb'
  surface-container: '#f4ede5'
  surface-container-high: '#eee7df'
  surface-container-highest: '#e8e1da'
  on-surface: '#1e1b17'
  on-surface-variant: '#4f453c'
  inverse-surface: '#33302b'
  inverse-on-surface: '#f7f0e8'
  outline: '#81756b'
  outline-variant: '#d3c4b8'
  surface-tint: '#795736'
  primary: '#241100'
  on-primary: '#ffffff'
  primary-container: '#3e2407'
  on-primary-container: '#b18964'
  inverse-primary: '#ebbe95'
  secondary: '#b02f00'
  on-secondary: '#ffffff'
  secondary-container: '#ff5d2c'
  on-secondary-container: '#581300'
  tertiary: '#1e140a'
  on-tertiary: '#ffffff'
  tertiary-container: '#34281d'
  on-tertiary-container: '#a18e7f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbe'
  primary-fixed-dim: '#ebbe95'
  on-primary-fixed: '#2d1600'
  on-primary-fixed-variant: '#5f4021'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#872200'
  tertiary-fixed: '#f5dfcd'
  tertiary-fixed-dim: '#d8c3b2'
  on-tertiary-fixed: '#25190f'
  on-tertiary-fixed-variant: '#534438'
  background: '#fff8f1'
  on-background: '#1e1b17'
  surface-variant: '#e8e1da'
  parchment: '#fdf6ee'
  soft-cream: '#f0e6dc'
  pure-card: '#ffffff'
  ink-black: '#000000'
  charcoal-bark: '#21201c'
  sepia: '#2b180a'
  bronze: '#7f6e60'
  driftwood: '#94877c'
  stone: '#a99d93'
  pebble: '#d9cfc3'
  chestnut: '#3e2407'
  ember-orange: '#f65726'
  saffron-pulse: '#ff5c00'
  peach-glow: '#fed0b3'
typography:
  headline-xl:
    fontFamily: EB Garamond
    fontSize: 56px
    fontWeight: '300'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '300'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '300'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

# Delphi — Style Reference
> warm parchment editorial with ember sparks

**Theme:** light

Delphi reads like an editorial spread on warm parchment: cream canvas, brown-black ink, a serif display voice, and orange sparks of energy. The product promises digital preservation of human expertise, and the visual language mirrors that — quiet, literary surfaces, generous whitespace, and chrome that feels printed rather than engineered. Color is used sparingly: the page stays achromatic-warm, with a single dark-chestnut button tone and a vivid ember orange reserved for trust signals, highlights, and the conversational heat of the hero's scattered question cards. Components are flat, low-elevation, and rely on thin hairlines and soft 12px corners rather than shadow stacks. Typography carries the personality — a humanist serif at whisper-light weight for headlines, a workhorse sans for body — creating the rhythm of a long-form magazine sitting next to a product interface.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Parchment | `#fdf6ee` | `--color-parchment` | Page canvas, hero background, card surfaces on light sections |
| Soft Cream | `#f0e6dc` | `--color-soft-cream` | Navigation background, secondary surface layer, subtle hover/elevated zones |
| Pure Card | `#ffffff` | `--color-pure-card` | Foreground card surface for content blocks, feature panels |
| Ink Black | `#000000` | `--color-ink-black` | Primary text, icon strokes, and border lines |
| Charcoal Bark | `#21201c` | `--color-charcoal-bark` | Body text on light surfaces where pure black reads too cold against the cream |
| Sepia | `#2b180a` | `--color-sepia` | Headings, button text, emphasized inline elements |
| Bronze | `#7f6e60` | `--color-bronze` | Muted secondary body text, descriptive captions beneath headings |
| Driftwood | `#94877c` | `--color-driftwood` | Tertiary text, nav links, low-emphasis labels, and warm-toned dividers |
| Stone | `#a99d93` | `--color-stone` | Disabled or lowest-emphasis text, ghost iconography |
| Pebble | `#d9cfc3` | `--color-pebble` | Hairline borders, card edges, and subtle dividers on cream surfaces |
| Chestnut | `#3e2407` | `--color-chestnut` | Primary CTA and dark accent surface |
| Ember Orange | `#f65726` | `--color-ember-orange` | Accent text, highlights, conversational emphasis |
| Saffron Pulse | `#ff5c00` | `--color-saffron-pulse` | Orange supporting accent for active/selected tags |
| Peach Glow | `#fed0b3` | `--color-peach-glow` | Subtle warm bloom/shadow accent |

## Tokens — Typography

### Cormorant Garamond / Martina Plantijn Light
Display and heading face — light weight (300), negative letter spacing.

### Inter
Body, navigation, and UI text (400, 500).

### Roboto Mono
Monospace accent for code, timestamps, tool triggers.
