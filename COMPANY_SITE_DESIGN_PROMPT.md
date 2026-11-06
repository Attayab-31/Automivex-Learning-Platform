# MASTER PROMPT: AUTOMIVEX COMPANY WEBSITE (DUAL DARK/LIGHT THEME)
> **Instructions for the AI Coding Agent (Codex / Claude / GPT):**
> You are acting as an elite Principal Frontend Architect and Senior UI/UX Designer specialized in developer platforms (Linear, Supabase, Warp, Raycast, Vercel). Your mission is to build the official **Automivex** technology company website.
>
> You must follow this design specification with extreme precision. Do not compromise on typography, spacing, contrast, or micro-interactions. **Zero "AI soup" patterns are permitted.**

---

## 1. DESIGN MANIFESTO: ANTI-"AI SOUP" GUARDRAILS

You must strictly reject generic, sloppy AI web design cliches:
- ❌ **NO Glowing Blur Blobs**: Do not inject diffuse radial gradient blur circles (`filter: blur(100px)`) floating behind sections.
- ❌ **NO Slanted Gradients**: Do not use generic 45-degree rainbow or purple-to-pink text gradients on headings.
- ❌ **NO Floating Tilted Cards**: Do not skew, rotate, or float cards in 3D perspective with artificial drop-shadows.
- ❌ **NO Glassmorphism Overkill**: Do not blur every card background with `backdrop-filter: blur(20px)` and semi-opaque white strokes. Use solid, machined surfaces with distinct semantic elevation ladders.
- ❌ **NO Arbitrary Padding**: Every margin and padding must adhere strictly to the calibrated 8-point spacing baseline.
- ❌ **NO Low-Contrast Text**: Muted text must never fall below WCAG AA (4.5:1), and primary text must achieve WCAG AAA contrast.

---

## 2. DUAL-THEME COLOR SYSTEM & DESIGN TOKENS

Implement a CSS custom property system supporting **both Dark and Light modes** via a `data-theme` attribute on the `<html>` element (`[data-theme="dark"]` and `[data-theme="light"]`), with automatic fallbacks for `prefers-color-scheme`.

```css
/* ==========================================================================
   AUTOMIVEX DESIGN TOKENS (DUAL THEME ENGINE)
   ========================================================================== */

:root, [data-theme="dark"] {
  /* Canvas & Surface Ladder (Dark Mode - Neo-Terminal Obsidian) */
  --bg-canvas: #090d16;
  --bg-surface: #0f1523;
  --bg-surface-elevated: #151d30;
  --bg-surface-hover: #1b263e;
  --bg-surface-active: #22304d;
  --bg-input: #0b101b;

  /* Hairline Borders */
  --border-hairline: rgba(255, 255, 255, 0.07);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-hover: rgba(255, 255, 255, 0.24);
  --border-focus: #38bdf8;

  /* Ink Scale (Dark) */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-subtle: #475569;
  --text-inverse: #090d16;

  /* Chromatic Signals (Dark) */
  --cyan: #38bdf8;
  --cyan-hover: #0ea5e9;
  --cyan-soft: rgba(56, 189, 248, 0.10);
  --cyan-border: rgba(56, 189, 248, 0.28);

  --emerald: #10b981;
  --emerald-hover: #059669;
  --emerald-soft: rgba(16, 185, 129, 0.10);
  --emerald-border: rgba(16, 185, 129, 0.28);

  --amber: #f59e0b;
  --amber-soft: rgba(245, 158, 11, 0.10);
  --amber-border: rgba(245, 158, 11, 0.28);

  --violet: #818cf8;
  --violet-soft: rgba(129, 140, 248, 0.10);
  --violet-border: rgba(129, 140, 248, 0.28);

  --rose: #f43f5e;
  --rose-soft: rgba(244, 63, 94, 0.10);
  --rose-border: rgba(244, 63, 94, 0.28);

  /* Dot Matrix Pattern */
  --dot-color: rgba(255, 255, 255, 0.04);
  --code-bg: #0b1120;

  /* Tactile Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
  --shadow-lg: 0 12px 28px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
}

[data-theme="light"] {
  /* Canvas & Surface Ladder (Light Mode - Precision Architectural Slate) */
  --bg-canvas: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f1f5f9;
  --bg-surface-hover: #e2e8f0;
  --bg-surface-active: #cbd5e1;
  --bg-input: #ffffff;

  /* Hairline Borders */
  --border-hairline: rgba(15, 23, 42, 0.06);
  --border-default: rgba(15, 23, 42, 0.12);
  --border-hover: rgba(15, 23, 42, 0.22);
  --border-focus: #0284c7;

  /* Ink Scale (Light) */
  --text-primary: #090d16;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --text-subtle: #94a3b8;
  --text-inverse: #ffffff;

  /* Chromatic Signals (Light - Calibrated for high contrast) */
  --cyan: #0284c7;
  --cyan-hover: #0369a1;
  --cyan-soft: rgba(2, 132, 199, 0.08);
  --cyan-border: rgba(2, 132, 199, 0.24);

  --emerald: #059669;
  --emerald-hover: #047857;
  --emerald-soft: rgba(5, 150, 105, 0.08);
  --emerald-border: rgba(5, 150, 105, 0.24);

  --amber: #d97706;
  --amber-soft: rgba(217, 119, 6, 0.08);
  --amber-border: rgba(217, 119, 6, 0.24);

  --violet: #6366f1;
  --violet-soft: rgba(99, 102, 241, 0.08);
  --violet-border: rgba(99, 102, 241, 0.24);

  --rose: #e11d48;
  --rose-soft: rgba(225, 29, 72, 0.08);
  --rose-border: rgba(225, 29, 72, 0.24);

  /* Dot Matrix Pattern */
  --dot-color: rgba(15, 23, 42, 0.04);
  --code-bg: #0f172a;

  /* Tactile Shadows */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 12px -2px rgba(15, 23, 42, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
  --shadow-lg: 0 12px 28px -4px rgba(15, 23, 42, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
}

:root {
  /* Layout Dimensions */
  --topbar-height: 60px;
  --container-max: 1120px;
  --container-narrow: 820px;

  /* Typography Stacks (Zero-latency system fonts) */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", system-ui, sans-serif;
  --font-heading: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  /* 8-Point Baseline Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 48px;
  --space-9: 64px;

  /* Corner Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## 3. ZERO-FLICKER THEME SWITCHER IMPLEMENTATION

Prevent Flash of Unstyled Content (FOUC) by placing this tiny inline script in the `<head>` tag immediately before stylesheets:

```html
<script>
  (function () {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

And provide an accessible theme toggle button in the navigation bar:

```javascript
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  function updateAria(theme) {
    toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateAria(next);
  });

  updateAria(document.documentElement.getAttribute('data-theme') || 'dark');
}
```

---

## 4. TYPOGRAPHY & TEXT RHYTHM

- **Headings (`h1`, `h2`, `h3`)**:
  - `font-family: var(--font-heading)`
  - Letter-spacing: `-0.025em` for `h1`/`h2`, `-0.015em` for `h3`.
  - Line-height: `1.15` to `1.2`.
  - Always apply `text-wrap: balance` to prevent orphaned words.
- **Eyebrows / Kickers**:
  - `font-family: var(--font-mono)`
  - `font-size: 11px`, `font-weight: 700`, `letter-spacing: 0.12em`, `text-transform: uppercase`.
  - Color: `var(--cyan)` or `var(--emerald)`.
  - Optional prefix dot or hairline pill border.
- **Body Text**:
  - `font-family: var(--font-sans)`
  - `font-size: 14px`, `line-height: 1.6`.
  - Color: `var(--text-secondary)`.
  - Contrast must always exceed WCAG AA standards.
- **Code & Numeric Badges**:
  - `font-family: var(--font-mono)`
  - `font-variant-numeric: tabular-nums` for timestamps, counts, status codes.

---

## 5. BUTTON & INTERACTIVE COMPONENT HIERARCHY

Every interactive element must provide tactile micro-interactions without bouncy or sluggish easing. Use `150ms cubic-bezier(0.16, 1, 0.3, 1)`.

### A. Primary Action Button (`.btn.primary`)
- Dark: Solid `var(--cyan)` background (`#38bdf8`), dark inverse text (`#090d16`), weight `600`.
- Light: Solid `var(--cyan)` background (`#0284c7`), white text (`#ffffff`), weight `600`.
- Hover: Slight brightness increase, `-1px` vertical lift, subtle box-shadow.
- Active: Scale `0.98`.

### B. Secondary / Outline Button (`.btn.outline`)
- Background: `var(--bg-surface-elevated)`
- Border: `1px solid var(--border-default)`
- Color: `var(--text-primary)`
- Hover: Border color shifts to `var(--border-hover)`, background shifts to `var(--bg-surface-hover)`.

### C. Ghost Button (`.btn.ghost`)
- Background: Transparent
- Color: `var(--text-secondary)`
- Hover: Color becomes `var(--text-primary)`, background `var(--bg-surface-elevated)`.

### D. Focus Accessibility
- All buttons and links must implement:
  ```css
  button:focus-visible, a:focus-visible, input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  ```

---

## 6. COMPANY SITE ARCHITECTURE & KEY SECTIONS

Structure the company landing page with these specific high-density sections:

### 1. Unified Navigation Topbar (`<header class="topbar">`)
- Fixed/Sticky: `height: var(--topbar-height)`, `background-color: var(--bg-canvas)` with backdrop blur `backdrop-filter: blur(8px)`.
- Bottom border: `1px solid var(--border-hairline)`.
- Brand lockup:
  - Monogram badge (`A+` inside rounded box with signal dot).
  - Wordmark: `AUTOMIVEX` with sub-brand `TECHNOLOGY & SOFTWARE` in 9px mono.
- Navigation links: Solutions, Platform, Architecture, Learning, Company.
- Actions: Theme toggle (sun/moon icon), "Sign In" link, "Get Started" CTA button.
- Mobile Hamburger: Clean drawer toggle, transitions with no horizontal page shift.

### 2. High-Impact Hero Section (`<section class="hero">`)
- 2-Column Desktop Grid (`1fr 1fr` or `1.1fr 0.9fr`), collapsing cleanly to single column under 900px.
- Left Column:
  - Status Eyebrow: `● AUTOMIVEX ENTERPRISE PLATFORM`
  - Headline: High-density, balanced typography (`Automate, inspect, and scale your backend infrastructure.`).
  - Subtitle: Clear value proposition without buzzword padding.
  - Action Group: Primary CTA + Secondary "View Architecture" button + Terminal command copy box (`curl -sSL automivex.com/cli | bash`).
- Right Column:
  - **Live Terminal / API Simulation Card**: Dark code surface with 3 macOS traffic light dots, HTTP method badge (`POST /v1/deploy`), JSON syntax highlighted payload with cyan and emerald accents, and a simulated latency readout (`28ms · 99.99% uptime`).

### 3. Trust & Technical Metrics Strip (`<section class="trust-strip">`)
- Bordered top and bottom with `var(--border-hairline)`.
- Monospace labels and stats:
  - `99.99% UPTIME SLA` · `ZERO-KNOWLEDGE TENANCY` · `AES-256 ENCRYPTION` · `POSTGRESQL & FASTAPI` · `OPEN STANDARDS`.

### 4. Bento Feature Grid (`<section class="features">`)
- Multi-card grid layout with variable widths (`grid-column: span 2` and `span 1`).
- Card style: Machined obsidian surface (`var(--bg-surface)`), `1px solid var(--border-default)`, radius `var(--radius-lg)`, hairline top edge highlight.
- Visuals inside cards:
  - Card 1: Interactive Architecture Node Graph (Client → API Gateway → Isolated Tenants → Database).
  - Card 2: Security & RBAC matrix (role badges, checkmarks).
  - Card 3: Automated verification pipeline (step status indicators).

### 5. Developer Code & CLI Showcase (`<section class="code-showcase">`)
- Tabbed interface switching between Python, TypeScript, and cURL examples.
- Code blocks with line numbers, copy button with "Copied!" feedback state.
- Tab buttons using monospace typography and signal emerald active indicator line.

### 6. Company & Leadership Standards (`<section class="standards">`)
- Clear principles: Educational commitment, open source contributions, privacy-first data policy (no data reselling).
- Direct link to the Automivex Learning Platform (`learn.automivex.com`).

### 7. Footer (`<footer class="footer">`)
- 4-column structured footer: Solutions, Platform, Resources, Legal (`Privacy Notice`, `Programme Terms`).
- System status indicator (`● All systems operational` in Signal Emerald).
- Copyright notice and company registration details.

---

## 7. ANIMATION & MOTION SPECIFICATIONS

Keep animations subtle, purposeful, and performant:
1. **Canvas Texture**: Use a microscopic dot grid background:
   ```css
   body {
     background-color: var(--bg-canvas);
     background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
     background-size: 28px 28px;
   }
   ```
2. **Card Hover**: No aggressive scaling or 3D rotations. Use subtle hairline border brightening and a soft 1px vertical translation:
   ```css
   .bento-card {
     transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
   }
   .bento-card:hover {
     border-color: var(--border-hover);
     transform: translateY(-2px);
     box-shadow: var(--shadow-lg);
   }
   ```
3. **Reduced Motion**: Respect accessibility preferences strictly:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

## 8. CODE GENERATION PROTOCOL FOR CODEX

When writing code based on this prompt:
1. **Self-Contained & Semantic**: Generate standard semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
2. **Framework Alignment**: Use Vanilla CSS variables, Tailwind CSS with extended theme tokens, or styled modern React/Vue components matching these variable names.
3. **No External Font Dependencies in CSP**: Use the provided system font stacks to ensure instantaneous page rendering with zero network requests.
4. **Mobile Responsiveness**: Test down to 320px viewport width. Never allow horizontal scrollbars (`overflow-x: hidden` on body, containers with `min(100%, ...)`).
5. **Color Contrast**: Verify all text against `var(--bg-canvas)` and `var(--bg-surface)` in both dark and light modes.
