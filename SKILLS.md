# BotoView Project Instructions & Engineering Guidelines

## 1. Product Identity & Codebase Hygiene
- **Public Open-Source Standards**: Keep code clean, idiomatic, and production-ready. Never leave AI-generated commentary, filler comments, or placeholder prose in templates, scripts, or configuration files.
- **Branding**: Render the logo cleanly as `BotoView` without redundant tagline badges (`SDK`, hype labels, or marketing fluff) next to the wordmark.
- **Zero Static Hydration Artifacts**: Never leave raw `<h2>Connection Override</h2>`, static initialization spinners (`Initializing Core...`), or uncloaked interactive elements visible prior to Alpine hydration.

## 2. UI / UX & Visual System
- **Borderless Unified Surface**:
  - Maintain one identical flat base canvas across `LeftRail`, sticky headers, and `MainView` (`#f4f6fa` light / `#0b0e14` dark) with matching translucent scrolled header tone (`rgba(244, 246, 250, 0.92)` / `rgba(11, 14, 20, 0.92)`). Do not apply spot radial gradients or off-tone scroll overlays that tint the header differently from the sidebar and main area.
  - Keep **zero visible grid lines or layout divider borders** (`border-b`, `border-t`, `border-r`, `1px` box-shadow hairlines between sidebar and main canvas, or `1px` card outlines). Separate surfaces exclusively via clean elevated card backgrounds (`#ffffff` light / `#131823` dark) and soft diffuse elevation shadows (`--shadow-card` / `--shadow-card-hover`).
  - Keep `.glass-header` exact-matched to `--bg-main` at rest (`scrollTop === 0`) and same-hue translucent blur when scrolled (`.glass-header-scrolled`) without `mask-image` or `background-attachment: fixed`.
  - Never use `bg-white` or `hover:bg-white` active/hover highlights on a light canvas; use tinted frosted accents (`bg-indigo-500/12`, `bg-emerald-500/15`, `bg-rose-500/15`, `hover:bg-slate-900/[0.045]`) that hold clear contrast in both light and dark themes.
  - Avoid card-inside-card nesting (e.g., do not wrap a grid of `.changelog-card` tiles inside another `.soft-card`).
- **Color Hierarchy**:
  - **Change-type semantic badges**: strictly reserve `emerald` (features / API changes), `rose` (fixes / patches), and `sky`/`blue` (enhancements / docs).
  - **Service badges**: restrict `getServiceColorClass` and release service pills to cool accents (`indigo`, `violet`, `cyan`, `teal`, `slate`) so service chips never visually collide with change-type badges.
  - **Search highlights**: use high-contrast warm amber `.search-highlight` tokens (`--search-highlight-bg`, `--search-highlight-text`).
- **Typography & Micro-Interactions**:
  - Prefer calm, developer-friendly weights (`font-semibold` / `font-bold`) over heavy display styles (`font-black`, oversized tracked uppercase headings).
  - Keep copy buttons explicit (icon + `"Copied"` state), scope badge hover arrows (`group/svc`), and pair card hovers with a smooth `1px` lift (`translateY(-1px)`).
  - Keep the theme color consistent across LeftNav, top bars, main workspace, `/services/`, `/releases/`, individual pages, `/404/`, and `<meta name="theme-color">`.
- **Responsive Design**:
  - Every page and sidebar drawer must work smoothly on desktop, tablet, and mobile (`44x44px` minimum mobile icon touch targets, clean responsive wrapping, zero horizontal overflow).
  - Separate SSR HTML from Alpine-hydrated lists via `isClientHydrated` / `x-cloak` so service pills and changelog entries never render twice.
  - Keep the homepage `MainView` focused cleanly on the release/service changelog feed (`Modified services` strip + changelog entries) — do not re-add the removed "Popular AWS Services", "Recent AWS Boto3 SDK Releases", or bulky Release Overview hero sections.

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
  - Target `BotoView` + `AWS Boto3 Changelogs` cleanly in `<title>`, `<meta name="description">`, `<h1>`, and concise crawlable homepage overview copy (`MainView`) without bloating the above-the-fold layout.
  - `src/pages/releases/[version].astro`: serve `noindex, follow` to avoid thousands of thin release pages diluting crawl budget while preserving internal link equity.
  - `src/pages/services/[service].astro`: only index (`index, follow`) high-value or `>= 3` changelog entry services (`computeServiceTelemetry`); mark 1–2 entry edge/token pages as `noindex, follow`.
  - `src/pages/sitemap-services.xml.ts`: include only indexable services; keep `robots.txt` and `[key].txt.ts` aligned on a single canonical `Sitemap: https://botoview.5goos.com/sitemap.xml` (no thin release sitemap).
  - `scripts/ping_indexnow.py`: submit `/` + `/services/` + `/releases/` + top services + recently modified indexable services to Bing IndexNow after deployments.
  - `src/pages/releases/index.astro`: keep initial SSR payload fast and compact (render recent 12 months statically and lazy-load `/data/track.json` for older years or search).
  - Do not emit mismatched schema markup (`FAQPage` without matching visible FAQ content on `/`).

## 4. Verification Before Finishing
Always rebuild and verify all QA assertions after code or style edits:
```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build && node tests/run.js
```
All assertions in `tests/qa.test.js` must pass with `0` failures, and functional contracts (keyboard shortcuts `/`, `j`, `k`, `t`, `Esc`, clipboard attribution, URL `?v=`/`?s=` state, and route links) must remain intact.
