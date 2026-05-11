# MRUIPEZ — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1 | UI framework |
| react-dom | ^19.1 | DOM renderer |
| react-router-dom | ^7.6 | Client-side routing (3 pages) |
| gsap | ^3.13 | Animation engine (core + ScrollTrigger + SplitText) |
| lenis | ^1.3 | Smooth scrolling |
| lucide-react | ^0.511 | Icons (Menu, X, ChevronLeft, ChevronRight, ChevronDown, Mail, Phone, MapPin, CheckCircle) |
| tailwindcss | ^4.1 | Styling |
| @tailwindcss/vite | ^4.1 | Tailwind Vite integration |
| typescript | ^5.8 | Type checking |
| vite | ^6.3 | Build tool |
| @vitejs/plugin-react | ^4.4 | React Vite plugin |
| @types/react | ^19.1 | React type definitions |
| @types/react-dom | ^19.1 | ReactDOM type definitions |

No shadcn/ui components — all UI is custom-built to match the dark editorial aesthetic.

---

## Component Inventory

### Layout (shared across all pages)

| Component | Source | Notes |
|-----------|--------|-------|
| Navigation | Custom | Fixed header, 64px height, logo + 3 nav links, mobile hamburger overlay. Scroll-aware auto-hide behavior. |
| Footer | Custom | Minimal two-row footer with logo, nav links, copyright. |
| PageLayout | Custom | Wraps pages with Navigation + Footer + page transition fade overlay. Initializes Lenis. |

### Reusable Components (used by multiple sections/pages)

| Component | Source | Used By |
|-----------|--------|---------|
| CTASection | Custom | Home page, Work page — accepts heading, subtext, ctaText, ctaLink as props |
| PageHeader | Custom | Work page, Contact page — accepts label, heading, subtext as props. Includes SplitText heading animation. |
| ProjectCard | Custom | FeaturedWorkSection (home), PortfolioGrid (work) — accepts project data, aspect ratio, hover behavior config |

### Page Sections — Home

| Component | Notes |
|-----------|-------|
| HeroSection | Full-viewport with background image, gradient overlay, scroll indicator. Ken Burns background + staggered text entrance. |
| ServicesSection | 3-column grid of service cards with icon + title + description |
| FeaturedWorkSection | Asymmetric 3-column grid (6 projects), links to Work page |
| ProcessSection | 4-step horizontal process with connecting line (desktop) / vertical stack (mobile) |
| StatsSection | Full-width band, 4 stat counters with count-up animation |

### Page Sections — Work

| Component | Notes |
|-----------|-------|
| FilterTabs | Horizontal row of category filter buttons. Controls active filter state. |
| PortfolioGrid | CSS masonry (`columns: 3/2/1`), 12 ProjectCards. Filtered by active category. |
| LightboxModal | Fixed overlay modal with image display, prev/next navigation, keyboard support. |

### Page Sections — Contact

| Component | Notes |
|-----------|-------|
| ContactInfo | Left column — contact items (icon, label, value) + social links |
| ContactForm | Right column — form with 4 fields + submit. Manages submitting/success/error states. |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| SplitText heading entrance | GSAP + SplitText | Split into lines, stagger `opacity/y` animation, triggered on scroll via ScrollTrigger | Medium |
| Hero text stagger entrance | GSAP timeline | Sequential timeline: label → headline (SplitText) → subheadline → CTA with increasing delays | Medium |
| Hero Ken Burns background | GSAP | `scale: 1.05 → 1` over 2000ms on mount | Low |
| Scroll indicator pulse | CSS @keyframes | Circle translates down line, 2s infinite loop. Fades out on scroll (>100px) via ScrollTrigger | Low |
| Card stagger entrance | GSAP + ScrollTrigger | Batch: `opacity: 0, y: N` → final, stagger 80-150ms per card group, triggered at threshold 0.1-0.2 | Medium |
| Process line draw | GSAP + ScrollTrigger | `scaleX: 0 → 1`, transform-origin left, 1200ms | Low |
| Process step entrance | GSAP + ScrollTrigger | Stagger `opacity/x` from left, 200ms apart | Low |
| Stats count-up | GSAP | `gsap.to()` with `snap` on a proxy object, ScrollTrigger `once: true`, 1500ms | Medium |
| Nav auto-hide/show | GSAP / CSS | Track scroll direction via ScrollTrigger or Lenis scroll event; toggle translateY | Low |
| Mobile menu overlay | GSAP timeline | Fade overlay + stagger links entrance, reverse on close | Medium |
| Lightbox transitions | GSAP | Overlay fade 300ms, image cross-fade 400ms between projects | Medium |
| Hover effects (images) | CSS transitions | `transform: scale(1.03)`, overlay opacity, info slide-up — all pure CSS | Low |
| Page transitions | GSAP | Fade overlay in/out on route change, 200ms out / 400ms in | Medium |

**Key:** GSAP SplitText requires Club GSAP license — use the npm package `@gsap/split-text` or the bundled `SplitText` plugin from the gsap package.

---

## State & Logic Plan

All state is local — no global state library needed.

| State | Scope | Type | Notes |
|-------|-------|------|-------|
| Mobile menu open | Navigation | `boolean` | Toggle hamburger overlay |
| Active page nav highlight | Navigation | Derived from `useLocation()` pathname |
| Lightbox open + current index | LightboxModal | `{ open: boolean; index: number }` | Controlled by PortfolioGrid click + keyboard nav |
| Active portfolio filter | PortfolioGrid | `string` (category name, default "All") | Derived filter on static project array |
| Form state | ContactForm | `{ name, email, projectType, message }` | Local controlled inputs |
| Form submission status | ContactForm | `"idle" \| "submitting" \| "success" \| "error"` | Simulated (no backend), shows success UI after 1s |
| Lenis instance | PageLayout | `Lenis` ref | Shared via React context (lightweight, no external library) |

### Data Architecture

- **Projects array**: Static data file exporting 12 project objects (id, name, category, aspect, imageSrc). Filtered client-side by category string match.
- **Services array**: Static data file exporting 3 service objects (icon type, title, description).
- **Process steps array**: Static data file exporting 4 step objects (number, title, description).
- **Stats array**: Static data file exporting 4 stat objects (value, label) — value stored as number for count-up.
- **Contact info**: Static data object.

---

## Other Key Decisions

### Routing

React Router with 3 routes: `/` (Home), `/work` (Work), `/contact` (Contact). No route guards, no lazy loading (site is small). Page transitions implemented via GSAP fade overlay triggered on route change.

### Google Fonts

Instrument Serif (weight 400) and Inter (weights 400, 500) loaded via `<link>` tags in `index.html` with `display=swap` for FOUT handling.

### Image Strategy

All 13 images (1 hero + 12 portfolio) generated via AI image generation. Stored as static assets in `/public/images/`. Hero image preloaded via `<link rel="preload">`. Portfolio images lazy-loaded with native `loading="lazy"` and responsive `srcset`.

### Form Handling

No backend integration. Contact form simulates submission with 1s timeout, then displays success state. In production, the form action would be replaced with a service like Formspree, Netlify Forms, or a custom API endpoint.

### Accessibility

- All images have descriptive `alt` text
- Form inputs use semantic `<label>` elements with `htmlFor`
- Focus indicators: 2px `--accent` outline with 2px offset on all interactive elements
- Color contrast: `--text-primary` on `--bg-primary` = 14.8:1 (exceeds WCAG AAA)
- `prefers-reduced-motion`: all GSAP animations check media query and skip to final state
- Lightbox: keyboard navigation (Escape, Left/Right arrows), focus trap, `role="dialog"`
- Mobile menu: focus trap while open, Escape to close
