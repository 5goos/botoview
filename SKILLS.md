# BotoView Project Instructions & Engineering Guidelines

## 1. Product Identity & Codebase Hygiene
- **Public Open-Source Standards**: Keep code clean, idiomatic, and production-ready. Never leave AI-generated commentary, filler comments, or dead commented-out blocks in templates, scripts, or configuration files. Only preserve license headers, required linter/TypeScript directives, or single-line workarounds explaining *why*.
- **Shared Utilities**: Keep client formatting, theme management, clipboard/toast dispatch, and Alpine registration unified inside `src/utils/formatting.ts` and `src/utils/client.ts` via Vite-bundled `<script>` modules (passing SSR payloads via JSON `<script type="application/json">` islands rather than duplicating helpers in inline `define:vars` scripts).
- **Branding**: Render the logo cleanly as `BotoView` without redundant tagline badges (`SDK`, hype labels, or marketing fluff) next to the wordmark.
- **Zero Static Hydration Artifacts**: Never leave raw `<h2>Connection Override</h2>`, static initialization spinners (`Initializing Core...`), or uncloaked interactive elements visible prior to Alpine hydration.

## 2. UI / UX & Visual System
- **Borderless Unified Surface**:
  - Maintain a unified flat base canvas across `LeftRail`, sticky headers, and `MainView` (`#090b10` dark / `#f4f6fa` light) with matching translucent scrolled header tone (`rgba(9, 11, 16, 0.88)` / `rgba(244, 246, 250, 0.90)`).
  - Keep **zero background grid lines, dot matrices, graph-paper backdrops, or harsh card/table divider borders** (`border-b`, `border-t`, `border-r`, `1px` box outlines). Separate surfaces through tonal elevation (`#11151e` / `#181e2b` dark, `#ffffff` / `#fbfcfe` light) and soft diffuse elevation shadows (`--shadow-card` / `--shadow-card-hover`), with optional faint hairline dividers (`--hairline`, opacity `<= 0.06`) inside floating modals.
  - Pair the canvas with an ultra-soft non-interactive `.ambient-glow` backdrop layer (`z-0`) while keeping `.glass-header` exact-matched to `--bg-main` at rest (`scrollTop === 0`) and same-hue translucent blur when scrolled (`.glass-header-scrolled`).
  - Never use `bg-white` or `hover:bg-white` active/hover highlights on a light canvas; use tinted frosted accents (`bg-indigo-500/12`, `bg-emerald-500/15`, `bg-rose-500/15`, `hover:bg-slate-900/[0.045]`) that hold clear contrast in both light and dark themes.
- **Theme Initialization**:
  - Default to refined Dark Mode (`<html class="dark">`) with an instant, flicker-free Light Mode toggle persisted in `localStorage` and initialized synchronously in `<head>` alongside `<meta name="theme-color">`.
- **Color Hierarchy**:
  - **Change-type semantic badges** (normalized via `normalizeChangeType`): `teal` (`api-change` / `API Change`), `emerald` (`feature` / `Feature`), `sky` (`enhancement` / `Enhancement`, accounting for upstream `enhancment`/`enchancement` typos), and `rose` (`bugfix` / `Bugfix`).
  - **Service badges**: restrict `getServiceColorClass` and release service pills to cool accents (`indigo`, `violet`, `cyan`, `teal`, `slate`) so service chips never visually collide with change-type badges.
  - **Search highlights**: use high-contrast warm amber `.search-highlight` tokens (`--search-highlight-bg`, `--search-highlight-text`).
- **Developer UX & Micro-Interactions**:
  - Use `180ms–200ms cubic-bezier(0.16, 1, 0.3, 1)` transitions and honor `@media (prefers-reduced-motion: reduce)`.
  - Global `Cmd/Ctrl + K` `CommandPalette` (`src/components/CommandPalette.astro`) searches across all Boto3 releases, all AWS services, and active in-view changelog entries.
  - Provide one-click `pip install boto3==...` / `uv add boto3==...` version-pin copy controls, entry copy buttons, deep-link `#` anchor buttons with subtle toast feedback, and collapsible toggles (`> 280` chars) for verbose diffs while keeping full crawlable HTML in SSR.
  - Sync active filters (`?v=`, `?s=`, `?svc=`, `?type=`, `?q=`, `?page=`) with URL query parameters so filtered views are shareable.
- **Responsive Design & Performance**:
  - Guarantee zero horizontal overflow down to `360px` width (`overflow-x: clip`, `min-w-0` on flex/grid containers, `overflow-wrap: anywhere` on `.inline-code`, scoped horizontal scroll inside `<pre>` and filter chip strips, and `44x44px` minimum mobile icon tap targets via `.tap-target`).
  - Separate SSR HTML from Alpine-hydrated lists via `isClientHydrated` / `x-cloak` on `/` and cap initial SSR feeds on `/services/[service]/` (`30` updates + pagination) while scoping embedded `versionDates` to used releases so HTML payloads stay fast.

## 3. Technical SEO & Indexing Rules
- **Canonical URLs & Trailing Slashes**:
  - Every HTML page canonical URL must point to `https://botoview.5goos.com/.../` with a trailing slash (except `.xml` / `.txt` files).
  - Non-trailing-slash requests (`/releases`, `/releases/1.10.26`, `/services`, `/services/s3`) and `*/index.html` must return HTTP `301` redirects to the canonical trailing-slash URL via `src/middleware.ts`, preserving query strings.
- **Cloudflare Workers Dev vs Production Routing**:
  - Keep `wrangler.jsonc` free of `!/releases/` or `!/services/` `run_worker_first` exclusions so `npm run dev` (`@cloudflare/vite-plugin`) routes HTML pages normally.
  - Inject production `run_worker_first` rules (`!/releases/`, `!/releases/*/`, `!/services/`, `!/services/*/`, `/releases`, `/releases/*`, `/services`, `/services/*`, `/404`, `/index.html`, `/*.txt`) into `dist/server/wrangler.json` during `astro:build:done` inside `astro.config.mjs`.
- **Crawl Budget, Structured Data & Search Engine Compliance (Google & Bing)**:
  - Keep `<meta property="og:site_name" content="BotoView" />` aligned with `WebSite.name` (`BotoView`) per Google Site Names guidelines.
  - Only emit `FAQPage` JSON-LD when the matching Q&A content is visibly rendered in the HTML body (`services/[service].astro`); do not emit hidden FAQ schema on `/releases/[version]/` or duplicate homepage `SoftwareApplication` nodes on subpages (`includeDefaultApp={false}`).
  - Ensure semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<time datetime="...">`, `<footer>`) with one `<h1>` per page and non-skipping `<h2>`/`<h3>` hierarchy.
  - `src/pages/releases/[version].astro`: serve `noindex, follow` to avoid thousands of thin release pages diluting crawl budget while preserving internal link equity, and keep service badge links directly crawlable without `@click.prevent`.
  - `src/pages/services/[service].astro`: only index (`index, follow`) high-value or `>= 3` changelog entry services (`computeServiceTelemetry`); mark 1–2 entry edge/token pages as `noindex, follow`.
  - `src/pages/sitemap-services.xml.ts`: include only indexable services; keep `robots.txt` and `[key].txt.ts` aligned on a single canonical `Sitemap: https://botoview.5goos.com/sitemap.xml` (no thin release sitemap).
  - `scripts/ping_indexnow.py`: submit `/` + `/services/` + `/releases/` + top services + recently modified indexable services to Bing IndexNow after deployments.

## 4. Verification Before Finishing
Always rebuild and verify all QA assertions after code or style edits:
```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build && node tests/run.js
```
All assertions in `tests/qa.test.js` must pass with `0` failures, and functional contracts (keyboard shortcuts `Cmd/Ctrl+K`, `/`, `j`, `k`, `t`, `Esc`, clipboard attribution, URL `?v=`/`?s=`/`?svc=`/`?type=`/`?q=` state, and route links) must remain intact.
