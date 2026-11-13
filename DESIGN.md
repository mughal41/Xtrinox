---
name: Xtrinox — Premium AI Tool Marketplace
description: High-precision managed AI marketplace and session bridge built on Chalk White, Ink Black, and Acid Green.
colors:
  primary: "#0b0b0c"
  neutral-bg: "#f3f2ee"
  surface: "#ffffff"
  surface-raised: "#eae8df"
  surface-deep: "#dedad0"
  border: "#d7d3c6"
  border-strong: "#9e9a8d"
  text-primary: "#0b0b0c"
  text-sub: "#2c2c31"
  text-muted: "#64646e"
  accent-green: "#b6ff2e"
  brand-hover: "#1f2024"
  status-success: "#0b7e3f"
  status-warn: "#b06000"
  status-danger: "#c5221f"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  card: "15px"
  stack: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-ghost:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  card-product:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "14px 14px 13px"
  badge-accent:
    backgroundColor: "{colors.accent-green}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "5px 10px"
---

# Design System: Xtrinox — Premium AI Tool Marketplace

## Overview

**Creative North Star: "The Chalk & Ink Conduit"**

Xtrinox is engineered around an architectural aesthetic that fuses high-end editorial paper with dark tactical terminal machinery. Rather than defaulting to generic dark neon or sterile SaaS white, the canvas is rooted in warm tactile Chalk White (`#F3F2EE`), layered with precision greige dividers (`#D7D3C6`), and anchored by pure Ink Black (`#0B0B0C`). 

Electric Acid Green (`#B6FF2E`) functions as an energetic visual conduit—sparingly deployed to signal vitality, active sessions, high-priority status badges, and critical focus states. Every product card features a dual-world composition: a dark, graphite top cover reminiscent of premium hardware packaging, married to a clean, highly legible white informational deck beneath.

**Key Characteristics:**
- **Chalk-and-Ink Architecture:** Rich matte surfaces, warm alabaster backdrops, and deep slate typography that banish sterile gray-on-gray fatigue.
- **Controlled Kinetic Depth:** Fanned card decks, kinetic hover expansion, and disciplined elevation shifts that simulate tangible physical objects.
- **Surgical Acid Accentuation:** Acid Green is strictly reserved for active states, key conversion triggers, and live status dots.

## Colors

The palette establishes an unmistakable hierarchy: warm paper neutrals govern 80% of screen space, ink darks anchor the headers and primary controls, and acid green cuts through as a high-visibility focal beacon.

### Primary
- **Ink Black** (`#0B0B0C`): The primary structural anchor. Used for primary CTA buttons, headings, heavy borders, dark card cover bases, and the core wordmark.
- **Charcoal Hover** (`#1F2024`): Hover state for primary buttons and interactive dark card covers.

### Accent
- **Electric Acid Green** (`#B6FF2E`): The high-voltage brand signature. Applied to active status pills, live bridge indicators, focus rings, and glowing card borders on interaction.
- **Acid Glow Flare** (`rgba(182, 255, 46, 0.12)`): Ambient radial background glow behind the hero card deck.

### Product Partner Accents (Hover Reveal Only)
Tool cards selectively reveal their authentic brand identity upon hover or focus:
- **OpenAI Emerald** (`#10A37F`): ChatGPT card accent and icon drop shadow.
- **Anthropic Warm Terracotta** (`#D7764D`): Claude card accent and icon highlight.
- **QuillBot Mint** (`#21A36A`): Paraphrasing tool accent.
- **Stealth Violet** (`#9B4CF5`): AI bypass tool accent.
- **Turnitin Electric Blue** (`#0863AE`): Plagiarism detector accent.

### Neutral
- **Chalk White Background** (`#F3F2EE`): The normative canvas background for all pages.
- **Pure Surface White** (`#FFFFFF`): Elevated content surfaces, card bases, headers, and form inputs.
- **Raised Chalk** (`#EAE8DF`): Hover states on subtle rows, secondary button backgrounds, and drawer headers.
- **Deep Chalk Stone** (`#DEDAD0`): Sticky header borders, subtle container dividing lines, and recessed panels.
- **Greige Border** (`#D7D3C6`): Default 1px structural boundary for all cards and table rows.
- **Greige Border Strong** (`#9E9A8D`): Interactive borders, active inputs, and badge strokes.
- **Text Sub** (`#2C2C31`): Secondary body text, card descriptions, and descriptive subtitles.
- **Text Muted** (`#64646E`): Metadata labels, price periods, timestamps, and input placeholders.

### Semantic
- **Success Green** (`#0B7E3F`): Entitlement active states, payment verification success.
- **Warning Amber** (`#B06000`): Pending review badges, session conflict notices.
- **Danger Red** (`#C5221F`): Blocked device alerts, expired session indicators.

### Named Rules
**The Acid Rarity Rule.** Acid Green (`#B6FF2E`) must never cover more than 5% of any viewport. Its power comes from scarcity; overusing it degrades it from an electric beacon to visual noise.

**The Split Cover Rule.** Product cards in the catalog always maintain a dark graphite cover top (`#0D0E11` to `#1F2025`) and a crisp white lower information block (`#FFFFFF`). Never invert this relationship.

## Typography

The type system pairs the punchy, geometric personality of **Plus Jakarta Sans** for prominent headlines and brand expressions with the clinical, neutral readability of **Inter** for dense interface data.

**Display Font:** `Plus Jakarta Sans`, sans-serif  
**Body Font:** `Inter`, system-ui, sans-serif  
**Tabular/Numeric Font:** `Inter` with `tabular-nums lining-nums` (`.num`, `.tabular`)

**Character:** Technical, crisp, and authoritative. Tight negative letter-spacing on headlines creates density and weight, balanced by generous line-heights in body copy.

### Hierarchy
- **Display** (800 weight, `2.5rem` / `40px`–`48px`, line-height `1.08`, tracking `-0.045em`): Hero headlines and card cover titles.
- **Headline** (700 weight, `1.75rem` / `28px`, line-height `1.2`, tracking `-0.035em`): Section headings and modal titles.
- **Title** (600/700 weight, `1.125rem`–`1.25rem` / `18px`–`20px`, line-height `1.3`, tracking `-0.025em`): Product card names, table headers, drawer section titles.
- **Body** (400/500 weight, `0.875rem` / `14px`, line-height `1.5`–`1.6`, tracking `-0.01em`): Descriptions, features, FAQs, and documentation copy.
- **Label** (700/800 weight, `0.6875rem`–`0.75rem` / `11px`–`12px`, uppercase or tracking `0.02em`–`0.05em`): Status badges, category pills, table column headers, and action buttons.

### Named Rules
**The Tabular Currency Rule.** All financial amounts (PKR prices, USD conversions, fee tallies) must use the `.tabular` / `font-variant-numeric: tabular-nums` utility to prevent jitter during updates and ensure vertical alignment.

**The Negative Tracking Rule.** Any heading set in Plus Jakarta Sans at or above 20px must carry negative letter-spacing (`tracking-[-0.03em]` to `tracking-[-0.045em]`) to preserve optical cohesion.

## Layout

The application operates on a 12-column grid foundation with a maximum container width of `1280px` (`max-w-[1280px] mx-auto px-6`), scaling down gracefully across specific breakpoints:

- **Desktop (≥1200px):** 5-column product catalog grid (`gap: 14px`), horizontal hero arrangement with full 5-card fanned stack deck (`height: 211px`), and expanded sticky navigation bar.
- **Laptop / Tablet Landscape (801px–1199px):** 3-column product catalog grid, hero deck scaled to `0.88` with centered origin.
- **Tablet Portrait (561px–800px):** 2-column product grid, hero deck height reduced to `157px` (`scale(0.74)`).
- **Mobile (≤560px):** Single-column stacked cards (`gap: 12px`), hero stack scaled to `0.62` (`height: 124px`), full-width action buttons, and slide-in navigation drawer.

**Spacing Scale:**
- `xs` (4px): Micro gaps between icons and labels.
- `sm` (8px): Button icon padding, chip horizontal gaps.
- `md` (14px): Product card internal padding and grid spacing.
- `lg` (20px): Section inner padding and modal content margins.
- `xl` (28px): Header and section spacing.
- `2xl` (40px): Outer layout section separation and hero padding.

## Elevation & Depth

Xtrinox rejects exaggerated drop shadows in favor of tonal surface layering combined with razor-thin borders (`1px solid #D7D3C6`). Depth is conveyed through surface elevation tiers:

`--bg` (`#F3F2EE`) → `--surface-raised` (`#EAE8DF`) → `--surface` (`#FFFFFF`)

### Shadow Vocabulary
- **Card Ambient Rest** (`0 6px 18px rgba(10, 10, 10, 0.06)`): Default baseline shadow under product cards on the chalk background.
- **Card Lift Hover** (`0 14px 28px rgba(10, 10, 10, 0.12), 0 0 0 1px rgba(185, 255, 37, 0.35)`): Applied when hovering over or focusing a product card, pairing soft diffusion with an Acid Green edge highlight.
- **Hero Foremost Card** (`0 18px 30px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(182, 255, 46, 0.2) inset`): High-contrast elevation for the front card in the 3D hero stack.
- **Acid Flare Halo** (`drop-shadow(0 2px 8px rgba(182, 255, 46, 0.4))` / `box-shadow: 0 0 20px rgba(182, 255, 46, 0.22)`): Luminous glow surrounding active indicators and hovered brand symbols.
- **Flyout / Modal Depth** (`0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(215, 211, 198, 0.6)`): Floating elevation for the navigation drawer, dropdown menus, and checkout dialogs.

### Named Rules
**The Flat-Rest Reactive-Elevation Rule.** Surfaces remain flat and disciplined at rest. Dramatic shadows and color-matched glows appear exclusively in response to user interaction (hover, keyboard focus, or active state toggles).

## Shapes

- **Card Outer Geometry:** `15px` (`border-radius: 15px`). Softened industrial rectangle that prevents sharp corners while avoiding toy-like pill bubbles.
- **Hero Deck Stack Cards:** `20px` (`border-radius: 20px`). Smooth tactile card silhouette with 1px inset rim lighting.
- **Logo Tiles:** `12px` (`border-radius: 12px`). High-contrast squircle tile housing tool vector marks (`47px × 47px`).
- **Action Buttons & Form Inputs:** `8px` (`border-radius: 8px`). Functional, utilitarian radius ensuring maximum clickable territory.
- **Status Badges & Pills:** `9999px` (`border-radius: 99px`). Full capsules for categories, active states, and discount badges.
- **Borders:** Consistent `1px solid` throughout. Dividers never exceed 1px; weight is achieved through color contrast (`--border-strong`), not stroke thickness.

## Components

### Buttons
- **Shape:** Rectangular with `8px` radius (`rounded-md`).
- **Primary Action (`.btn-primary`, `.xt-btn-primary`):** Solid Ink Black (`#0B0B0C`), text Chalk White (`#F3F2EE`), `padding: 10px 18px`, min-height `42px`, font-size `12px`, font-weight `700`. Hover state shifts to `#1F2024` with immediate response.
- **Ghost / Secondary Action (`.btn-ghost`):** Background Raised Chalk (`#EAE8DF`), text Ink Black (`#0B0B0C`), border `1px solid #9E9A8D`. Hover state darkens to `#D7D3C6`.
- **Keyboard Focus:** High-visibility outline: `2px solid #0B0B0C`, `outline-offset: 3px`.

### Chips & Filter Tabs
- **Style:** Capsule pill (`rounded-full`), background `#E6E4DC`, text `#0B0B0C`, padding `6px 14px`, font-weight `600`, font-size `12px`.
- **Active State:** Solid Ink Black background (`#0B0B0C`) with Chalk White text (`#F3F2EE`), accompanied by an Acid Green accent dot.

### Cards / Containers (Split Cover Product Card)
- **Top Cover (`.cover`):** `height: 214px`, dark graphite background with subtle radial gradient flare, housing a `47px × 47px` light squircle logo tile, high-contrast title, and angled preview viewport.
- **Bottom Information Body (`.card-content`):** Pure white background (`#FFFFFF`), `padding: 14px 14px 13px`, 2-line description (`font-size: 13px`), price block with bold headline price (`19px`), duration label (`11px`), and sticky full-width CTA button.
- **Hover Motion:** Translates upward `3px` (`translateY(-3px)`), brightens border to `#B9FF25`, and reveals specific product brand colors on the logo tile.

### Inputs & Fields
- **Search Bar (`#marketplace-search`):** Height `44px`, background `#FFFFFF`, border `1px solid #D7D3C6`, radius `10px`, icon left-aligned, right-aligned keyboard shortcut pill (`⌘K` / `Ctrl+K`). Focus state displays a `2px solid #0B0B0C` ring with `outline-offset: 1px`.

### Navigation (Shared Header)
- **Height & Placement:** Sticky top navigation bar, `height: 72px`, background `#FFFFFF`, bottom border `1px solid #DEDAD0`.
- **Elements:** Left-aligned Xtrinox logo mark + wordmark, center desktop route links with active state indicator pill, right-aligned bridge connection status pill (`Ready` / `Syncing` / `Disconnected`) and user account drawer trigger.

### Signature Component: The Kinetic Hero Stack Deck
- **Structure:** Fanned deck of 5 layered 3D tool cards (ChatGPT at `z-index: 5` foreground, Claude at `z: 4`, QuillBot at `z: 3`, StealthWriter at `z: 2`, Turnitin at `z: 1` background).
- **Kinetic Spread:** Hovering anywhere over the deck spreads the cards horizontally (`translateX` offsets expand from `-94px..+185px` to `-107px..+205px`) with smooth spring-like easing (`cubic-bezier(.22, 1, .36, 1)`).
- **Reduced Motion:** When `prefers-reduced-motion` is active, rotations and scale transforms are disabled into a clean flat horizontal layout.

## Do's and Don'ts

### Do:
- **Do** maintain the 80/15/5 ratio: 80% warm chalk neutrals, 15% crisp ink blacks, and 5% surgical acid green accents.
- **Do** preserve the split dark-cover / white-body layout on catalog cards.
- **Do** format all currency and numerical statistics using `.tabular` (`font-variant-numeric: tabular-nums`).
- **Do** use negative tracking (`-0.03em` to `-0.045em`) on large Plus Jakarta Sans headings.
- **Do** provide instant keyboard accessibility and explicit `outline: 2px solid var(--brand)` on all interactive controls.
- **Do** test animations against `@media (prefers-reduced-motion: reduce)`.

### Don't:
- **Don't** flood entire container backgrounds with Acid Green (`#B6FF2E`).
- **Don't** use generic purple-to-blue AI gradients or rounded bubbly toy aesthetics.
- **Don't** replace Chalk White (`#F3F2EE`) with harsh `#000000` or sterile `#F8F9FA` grays.
- **Don't** omit the Acid Green live status dot from the official Xtrinox logo lockup.
- **Don't** invent secondary pastel button styles; stick to the high-contrast Ink Black primary and Greige ghost variants.
