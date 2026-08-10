<!-- Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 -->
# Design — GreatDB

A locked design system for this static multi-page site. Every page redesign reads this file before emitting code. Extend this file when the system needs to grow; do not create page-local themes.

## Genre

Modern-minimal, with a precise technical and austere voice.

## Audience and action

- Audience: enterprise database buyers, architects, DBAs, and developers.
- Primary job: establish product fit and technical credibility.
- Primary action: start a trial.
- Secondary action: inspect products, solutions, and proof before contacting the team.

## Macrostructure family

- Marketing pages: **Split Studio** by default; product pages may use **Workbench**, and solution pages may use **Map / Diagram** when the diagram communicates a real architecture.
- Index pages: **Index-First**, with filters or category rails only when they improve browsing.
- Content pages: **Long Document**, with a 60–65 character reading measure and no decorative section numbering.
- Conversion page: a compact form-led layout; no testimonial or metric filler.
- App pages: none in this project.

## Component voice

- Navigation: **N13 Inline command/search pill**. It must open a real, keyboard-operable search dialog across the site.
- Footer: **Ft1 Mast-headed**. The GreatDB wordmark and one closing statement carry the footer; only essential links follow.
- Hero: **H2 Split Diptych** for the homepage. Text is paired with a hand-built database topology diagram, never fake browser or IDE chrome.
- Specifications: **F3 Tabular spec sheet** when the source provides comparable facts.
- Secondary CTA: **C3 Typographic link**. Primary CTA is a compact cobalt fill with a 6 px radius.

## Theme

Catalog theme: **Cobalt**, localized for Chinese content.

- `--color-paper`: `oklch(98.5% 0.004 250)`
- `--color-paper-2`: `oklch(96.5% 0.008 250)`
- `--color-ink`: `oklch(19% 0.022 258)`
- `--color-ink-2`: `oklch(30% 0.020 257)`
- `--color-rule`: `oklch(87% 0.012 250)`
- `--color-accent`: `oklch(48% 0.190 256)`
- `--color-focus`: `oklch(43% 0.210 256)`
- Dark mode keeps hue 256 and flips only lightness/chroma relationships.
- Accent footprint stays below 5% of each viewport.

## Typography

- Display: Space Grotesk, weight 700, roman; Noto Sans SC handles Chinese glyphs.
- Body: Noto Sans SC, weight 400.
- Mono: JetBrains Mono, weight 400/700, reserved for code and compact machine labels.
- Display tracking: `-0.035em`.
- Type scale anchor: `--text-display: clamp(2.75rem, 7vw, 5.25rem)`.
- No italic headings. No more than three font families on a page.

## Spacing

The named 4-point scale lives in `tokens.css`. Pages use `var(--space-*)`; new raw spacing values are not allowed.

## Motion

- Easings: `--ease-out`, `--ease-in`, and `--ease-in-out` from `tokens.css`.
- Page reveal: static; content is immediately present.
- Interaction motion: button press and the native theme view transition only.
- Removed from the previous system: parallax, card tilt, pulsing grid, floating particles, continuous data streams, and universal scroll reveals.
- Reduced-motion fallback: opacity-only or static, no more than 150 ms.

## Microinteractions stance

- Silent success when the result is already visible.
- Search opens immediately from click, `Ctrl+K`, or `⌘K`; Escape/backdrop closes; arrows select; Enter follows.
- Focus feedback is instant and never animated.
- Hover behavior exists only for fine pointers and always has a keyboard equivalent.
- Forms validate after blur; errors explain what happened and how to fix it.

## CTA voice

- Primary CTA: compact cobalt fill, 6 px radius, destination-specific verb such as “免费试用”.
- Secondary CTA: underlined typographic link with a directional arrow.
- Clickable labels stay on one line at every viewport.

## Per-page allowances

- Marketing pages may use Tier-A CSS diagrams or Tier-B hand-built SVG diagrams.
- Index pages use typography and rules only.
- Content pages use source imagery inline when present; no decorative enrichment.
- Existing factual claims may remain. New metrics, testimonials, logos, or proof are never invented.

## What pages MUST share

- GreatDB wordmark.
- Cobalt accent and cool-neutral surfaces.
- Space Grotesk / Noto Sans SC / JetBrains Mono roles.
- CTA geometry and interaction states.
- N13 navigation and Ft1 footer.
- Mobile behavior at 320, 375, 414, and 768 px.

## What pages MAY differ on

- Macrostructure within the allowed page family.
- Product/solution diagrams when they communicate route-specific architecture.
- Reading measure and sidebar presence on long content.

## Verification status

- Slop test: pass (58 gates).
- Contrast: pass in light and dark modes; body, muted text, focus ring, and accent-fill pairs meet their thresholds.
- Responsive: pass at 320, 375, 414, 768, 1280, and 1920 px with no page-level horizontal overflow.
- Hero fold: primary action and diagram focal point remain visible at 1280 × 800; bottom-to-top padding ratio is 1.56.
- Route shell: 308 public pages and the reusable page template share N13 navigation, Ft1 footer, theme control, and command search.

## Exports

### tokens.css

The source of truth is [`tokens.css`](tokens.css). Its complete `:root` and `[data-theme="dark"]` blocks are authoritative.

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(98.5% 0.004 250);
  --color-paper-2: oklch(96.5% 0.008 250);
  --color-paper-3: oklch(93% 0.010 250);
  --color-rule: oklch(87% 0.012 250);
  --color-rule-2: oklch(70% 0.016 252);
  --color-muted: oklch(50% 0.018 257);
  --color-ink-2: oklch(30% 0.020 257);
  --color-ink: oklch(19% 0.022 258);
  --color-accent: oklch(48% 0.190 256);
  --color-focus: oklch(43% 0.210 256);
  --font-display: "Space Grotesk", "Noto Sans SC", ui-sans-serif, sans-serif;
  --font-body: "Noto Sans SC", ui-sans-serif, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --spacing-3xs: 0.25rem;
  --spacing-2xs: 0.5rem;
  --spacing-xs: 0.75rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4.5rem;
  --spacing-3xl: 7rem;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.75rem;
  --text-2xl: 2.25rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --radius-card: 0.625rem;
  --radius-input: 0.375rem;
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(98.5% 0.004 250)", "$type": "color" },
    "paper-2": { "$value": "oklch(96.5% 0.008 250)", "$type": "color" },
    "ink": { "$value": "oklch(19% 0.022 258)", "$type": "color" },
    "ink-2": { "$value": "oklch(30% 0.020 257)", "$type": "color" },
    "rule": { "$value": "oklch(87% 0.012 250)", "$type": "color" },
    "accent": { "$value": "oklch(48% 0.190 256)", "$type": "color" },
    "focus": { "$value": "oklch(43% 0.210 256)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk, Noto Sans SC, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Noto Sans SC, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "JetBrains Mono, monospace", "$type": "fontFamily" }
  },
  "space": {
    "sm": { "$value": "1rem", "$type": "dimension" },
    "md": { "$value": "1.5rem", "$type": "dimension" },
    "lg": { "$value": "2rem", "$type": "dimension" },
    "xl": { "$value": "3rem", "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 98.5% 0.004 250;
  --foreground: 19% 0.022 258;
  --card: 96.5% 0.008 250;
  --card-foreground: 19% 0.022 258;
  --popover: 96.5% 0.008 250;
  --popover-foreground: 19% 0.022 258;
  --primary: 48% 0.190 256;
  --primary-foreground: 98.5% 0.004 250;
  --secondary: 93% 0.010 250;
  --secondary-foreground: 30% 0.020 257;
  --muted: 87% 0.012 250;
  --muted-foreground: 50% 0.018 257;
  --accent: 48% 0.190 256;
  --accent-foreground: 98.5% 0.004 250;
  --destructive: 50% 0.180 25;
  --destructive-foreground: 98.5% 0.004 250;
  --border: 87% 0.012 250;
  --input: 87% 0.012 250;
  --ring: 43% 0.210 256;
  --radius: 0.625rem;
}
```
