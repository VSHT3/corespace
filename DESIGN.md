---
name: Corespace
description: Student-native IB Core tools with candid feedback and structured workflows.
colors:
  warm-cream-bg: "#fef9f0"
  ink: "#1a1a1a"
  surface: "#ffffff"
  muted-text: "#555555"
  soft-muted-text: "#888888"
  hover-cream: "#f0ebe0"
  card-hover-cream: "#f5f0e6"
  yellow-highlight: "#fde68a"
  pink-highlight: "#fbcfe8"
  mint-highlight: "#bbf7d0"
  sky-highlight: "#bae6fd"
  sky-hover: "#7dd3fc"
  lavender-category: "#e9d5ff"
  orange-category: "#fed7aa"
typography:
  display:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  page-x: "1.5rem"
  page-y: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.warm-cream-bg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Corespace

## 1. Overview

**Creative North Star: "The Marked-Up Study Desk"**

Corespace should feel like a focused study desk with useful annotations already in the margins. The interface is direct, tactile, and a little handmade, but it stays serious enough for real IB work. It should support the student who is trying to make progress now, not perform productivity or decorate the task.

The system uses a brutalist pastel vocabulary: warm paper background, black ink borders, compact system type, and soft highlighter accents. It rejects generic AI wrapper framing, corporate edtech dashboard polish, childish school-app language, and over-polished SaaS marketing surfaces.

**Key Characteristics:**
- Warm paper-like base with hard ink borders.
- Small-radius controls that feel sturdy and familiar.
- Pastel highlights used as academic markers, not decoration.
- Compact, candid product UI optimized for repeated student work.
- Motion is brief and stateful, never ornamental.

## 2. Colors

The palette is warm, paper-based, and highlighter-led: black ink and cream surfaces carry the product, while pastels mark academic categories and actions.

### Primary
- **Ink Black** (#1a1a1a): Primary text, borders, dividers, and primary button fill.
- **Warm Cream Background** (#fef9f0): Main app background and primary text color on ink-filled buttons.

### Secondary
- **Yellow Highlighter** (#fde68a): Corespace mark, TOK exhibition accents, and key highlights.
- **Sky Highlighter** (#bae6fd): Dashboard action button and neutral status tags.

### Tertiary
- **Pink Highlighter** (#fbcfe8): Planned modules, category accents, and occasional emphasis.
- **Mint Highlighter** (#bbf7d0): Available/positive module accents.
- **Lavender Category** (#e9d5ff) and **Orange Category** (#fed7aa): TOK prompt category fills only.

### Neutral
- **Surface White** (#ffffff): Card and input surfaces.
- **Body Muted** (#555555): Supporting copy.
- **Soft Muted** (#888888): Eyebrows, back links, low-priority metadata.
- **Hover Cream** (#f0ebe0): Ghost button hover.
- **Card Hover Cream** (#f5f0e6): Passive card-link hover.

### Named Rules

**The Highlighter Rule.** Pastels should mark categories, availability, and key student actions. Do not wash whole screens in pastel.

**The Ink Rule.** Borders are part of the identity. Use the same ink color and 2px stroke consistently rather than mixing gray outlines.

## 3. Typography

**Display Font:** system-ui, -apple-system, Segoe UI, sans-serif  
**Body Font:** system-ui, -apple-system, Segoe UI, sans-serif  
**Label/Mono Font:** system-ui, -apple-system, Segoe UI, sans-serif

**Character:** The type system is native, compact, and utilitarian. Hierarchy comes from weight, scale, and spacing rather than display fonts.

### Hierarchy
- **Display** (700, clamp(2.5rem, 6vw, 4rem), 1.1): Landing hero only.
- **Headline** (700, 32-40px, 1.1): Page titles and major product headings.
- **Title** (700, 16-17px, 1.35): Cards, module labels, and prompt titles.
- **Body** (400, 14px, 1.6): Product copy, descriptions, and form text. Keep prose around 65-75ch where practical.
- **Label** (700, 11-12px, uppercase, 0.06-0.08em letter spacing): Eyebrows, buttons, tags, and navigation.

### Named Rules

**The No-Display-UI Rule.** Product controls, labels, and data should use the system sans. Save hero-scale type for true page heroes.

## 4. Elevation

Corespace is flat at rest. Depth comes from 2px borders, solid surfaces, and a tactile diagonal bump on interactive cards. Shadows are not ambient or decorative; they are a hover response that makes a clickable surface feel physical.

### Shadow Vocabulary
- **Card Bump** (`8px 8px 0 0 var(--fg)`): Use only on hover for clickable cards or prompt cards.
- **Resting Surface** (`0 0 0 0 var(--fg)`): Cards rest flat with no shadow.

### Named Rules

**The Flat-Until-Action Rule.** Surfaces should stay flat until interaction. Do not add ambient dashboard shadows or floating glass panels.

## 5. Components

### Buttons
- **Shape:** Small hard radius (`4px`) with 2px ink border.
- **Primary:** Ink fill, cream text, uppercase 12px label, `8px 16px` base padding.
- **Hover / Focus:** Primary darkens slightly; focus uses a visible ink outline where fields already define it.
- **Ghost:** Transparent background, ink border and text, cream hover.
- **Sky:** Sky highlighter fill for dashboard navigation and friendly product actions.

### Chips
- **Style:** `tag` uses uppercase 11px text, 2px ink border, 4px radius, and pastel fills.
- **State:** Tags are small labels or lightweight action chips. Do not turn them into rounded pills.

### Cards / Containers
- **Corner Style:** 4px radius.
- **Background:** Surface white on warm cream.
- **Shadow Strategy:** Flat at rest, diagonal ink shadow only on hover for clickable cards.
- **Border:** 2px ink border.
- **Internal Padding:** 1.5rem by default, with tighter 1.25rem variants in dense cards.

### Inputs / Fields
- **Style:** White surface, 2px ink border, 4px radius, 14px system text.
- **Focus:** 2px ink outline with offset.
- **Error / Disabled:** Not fully standardized yet. Future work should add clear disabled, loading, and error states without changing the base field vocabulary.

### Navigation
- **Style:** Sticky top bar, warm cream background, 2px bottom border, 52px height.
- **Typography:** Uppercase 12px nav labels with 0.06em letter spacing.
- **State:** Muted gray at rest, ink on hover. Authenticated users get a sky dashboard action.

### TOK Prompt Cards
- **Style:** Animated cards with hard ink border, pastel category fill, compact prompt title, and clipped description preview.
- **Behavior:** Prompt titles must remain visible. Description previews may clip, but only at complete line boundaries with stable bottom padding.

## 6. Do's and Don'ts

### Do:
- **Do** use warm cream (`#fef9f0`) as the default page background.
- **Do** use 2px ink borders and 4px radius for core product surfaces.
- **Do** keep AI feedback framed as support for student thinking, not final submission text.
- **Do** make the next academic move obvious on every workflow screen.
- **Do** keep animation brief, purposeful, and reducible.
- **Do** use pastel highlights as category or status markers.

### Don't:
- **Don't** make Corespace feel like a generic AI wrapper.
- **Don't** make it feel like a corporate edtech dashboard.
- **Don't** make it feel like a childish school app.
- **Don't** make it feel like an over-polished SaaS marketing site.
- **Don't** use em dashes or double hyphens in interface copy.
- **Don't** use glassmorphism, gradient text, decorative blur, or ambient shadow systems.
- **Don't** use side-stripe borders as accent decoration.
- **Don't** rely on color alone for TOK prompt categories or state.
