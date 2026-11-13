# MindMate AI — Design Tokens

Compact design token reference extracted from `docs/DESIGN.md`, workspace frontend rules, and verified against `design/stitch/` HTML/screenshots.

---

## 1. Colors & Semantic Meaning

Semantic rule: color is strictly functional, never decorative. Only High priority elements are colored.

| Token Name | Hex / CSS Value | Role & Semantic Meaning |
|---|---|---|
| `--color-parchment` | `#fdf6ee` / `#fff8f1` | Primary page canvas, reading column background |
| `--color-soft-cream` | `#f0e6dc` | Navigation bar, user message bubble, secondary container |
| `--color-pure-card` | `#ffffff` | Content cards, assistant message containers, composer background |
| `--color-chestnut` | `#3e2407` | Primary action button, AI avatar background |
| `--color-sepia` | `#2b180a` | Headings, active session item, emphasized UI text |
| `--color-charcoal-bark` | `#21201c` | High-contrast body text on light surfaces |
| `--color-bronze` | `#7f6e60` | Secondary body text, section ledger markers |
| `--color-driftwood` | `#94877c` | Tertiary labels, sidebar icons, inactive navigation links |
| `--color-stone` | `#a99d93` | Metadata, timestamps, placeholders, disabled text |
| `--color-pebble` | `#d9cfc3` | Hairline card borders, subtle divider lines (`border-pebble/40`) |
| **Teal (Memory)** | `#0d9488` / `teal-600` | **Memory only**: memory badges, recalled pill chips, vault links |
| **Amber (Confirm)** | `#f59e0b` / `amber-500` | **Action confirmation only**: shield icon, countdown, pending action border |
| **Emerald (Success)** | `#10b981` / `#059669` | **Success only**: completed tool executions, approved actions |
| **Red (Destructive)** | `#ba1a1a` / `#ef4444` | **Error & destructive only**: task deletion target, error banners, high priority |

---

## 2. Typography & Type Scale

| Role | Font Family | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|---|
| `display / headline-xl` | EB Garamond | 56px (40px mob) | 300 | 64px (48px mob) | -0.02em |
| `headline-lg` | EB Garamond | 40px (32px mob) | 300 | 48px (40px mob) | -0.015em |
| `headline-md` | EB Garamond | 28px | 400 | 36px | -0.01em |
| `headline-sm` | EB Garamond | 22px | 400 | 28px | 0em |
| `body-lg` | Inter | 18px | 400 | 28px | 0em |
| `body-md` | Inter | 15px | 400 | 24px | -0.005em |
| `body-sm` | Inter | 13px | 400 | 20px | 0em |
| `label-lg` | Inter | 14px | 500 / 600 | 20px | 0.01em |
| `label-md` | Inter | 12px | 500 | 16px | 0.02em |
| `label-sm` | Inter | 11px | 500 | 14px | 0.03em (uppercase) |
| `code / mono` | JetBrains Mono / font-mono | 11px–13px | 450 / 500 | 18px–20px | 0em |

---

## 3. Border Radius

| Token | Value | Applied To |
|---|---|---|
| `rounded-lg` | `8px` (`0.5rem`) | Secondary tool chips, dropdown menus, icon triggers |
| `rounded-xl` | `12px` (`0.75rem`) | Primary buttons, cards, sidebar nav items, inputs, action target boxes |
| `rounded-2xl` | `16px` (`1rem`) | User message bubbles, bottom chat composer box |
| `rounded-full` | `9999px` | Avatars, status chips, floating circular action buttons |

---

## 4. Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-xs` | `0.25rem` (`4px`) | Micro gaps, badge inner padding, tight icon pairings |
| `space-sm` | `0.5rem` (`8px`) | Standard icon-to-label gaps, chip padding, stacked item gaps |
| `space-md` | `1rem` (`16px`) | Component internal padding, standard card margins |
| `space-lg` | `1.5rem` (`24px`) | Section padding, header height offsets, card gaps |
| `space-xl` | `2.5rem` (`40px`) | Reading column separation, empty state vertical breathing room |
| `gutter` | `1.5rem` (`24px`) | Page margins and horizontal gutter spacing |
| `reading-width` | `720px` max-w | Central conversational column width |
| `sidebar-width` | `260px` | Navigation rail width |
| `context-width` | `320px` | Right contextual inspector panel width |

---

## 5. Shadows & Borders

| Token / Type | Value | Usage |
|---|---|---|
| **Subtle Shadow** | `0 1px 6px rgba(0,0,0,0.02)` | Search inputs, ghost cards |
| **Card Shadow** | `0 1px 8px rgba(0,0,0,0.04)` | Content cards, fixed sidebars |
| **Parchment Bloom** | `0 1px 8px rgba(254,208,179,0.3)` | Active chat items, primary action hover |
| **Alert Glow** | `0 4px 24px rgba(245,158,11,0.18)` | Confirmation card alert focus |
| **Hairline Border** | `1px solid rgba(217,207,195,0.4)` (`border-pebble/40`) | Standard card outlines, timeline dividers |
| **Memory Border** | `1px solid rgba(153,246,228,0.6)` (`border-teal-200/60`) | Memory recall banner and vault cards |
| **Amber Border** | `2px solid rgba(245,158,11,0.7)` (`border-amber-500/70`) | Pending action cards requiring user confirmation |
| **Success Border** | `1px solid rgba(16,185,129,0.3)` (`border-emerald-500/30`) | Executed safe action cards |

