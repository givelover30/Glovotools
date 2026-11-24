# GLOVOTOOLS 2.0 — LEAN PRODUCTION READINESS AUDIT

**Audit Date:** 2026-11-21  
**Mode:** Strictly Read-Only Audit (Zero Production Code, Catalog, Taxonomy, UI, or Dependency Modifications)  
**Target Strategy:** Lean Production Launch — Freeze Existing Features, Maximize Stability/Trust/SEO/Deployability at Minimal Cost  

---

## 1. Executive Summary & Launch Readiness Verdict

**Overall Assessment:** **NOT READY FOR PRODUCTION LAUNCH (4 BLOCKERs, 8 HIGHs, 8 MEDIUMs, 4 LOWs — 24 Total Findings)**

From a build and TypeScript compilation perspective, the frozen GLOVOTOOLS 2.0 codebase is healthy: `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build`) both exit `0`, producing a `25 MB` `dist/` artifact, and all `317` URLs in `public/sitemap.xml` resolve to valid in-app routes.

However, four launch-critical blockers prevent immediate production deployment:
1. **No SPA hosting/rewrite configuration (`F-01`):** Direct navigation or page refresh on any deep route (`/calculator/*`, `/calculators/*`, `/all-calculators`) returns HTTP 404 on static hosts.
2. **Missing legal/trust pages (`F-02`):** No `/terms`, `/privacy`, `/contact`, or `/about` routes exist; `Footer.tsx` opens `AboutModal` for Privacy Policy, and no financial/medical/engineering liability disclaimers exist at the site-policy level.
3. **No 404 recovery route (`F-03`):** Unknown paths and invalid `/calculator/:id` URLs silently render the homepage (`App.tsx:44-97`).
4. **Generic synthetic fallback engine for 85.8% of tools + duplicate contract failure (`F-04`):** `3,753` of `4,375` unique tools lack dedicated UI/workspaces or explicit calculation contracts and fall back to `CalculationRegistry.ts:100-169` generic `smartFields` approximations (`a * b`, `a / b`, `a * 1.25`) while still labeled `"Free & verified"` (`App.tsx:948`) and `"Ready and Operational"` (`CalculationRegistry.ts:156`). Additionally, `2` explicit contracts (`inventory-turnover-calc`, `college-savings-529-calc`) are duplicated and overwrite earlier definitions, causing `inventory-turnover-calc` (which has no custom UI) to collide across schema expectations.

Under the frozen lean-launch strategy (no catalog expansion, no taxonomy migration, no UI redesign, no paid APIs), all blockers and high-priority defects can be remediated in **3 small, low-cost engineering passes** before manual browser QA and production cutover.

### Finding Severity Summary

| Severity | Count | Launch Gate Impact |
|---|---:|---|
| **BLOCKER** | 4 | Must resolve before production deployment |
| **HIGH** | 8 | Strongly recommended before launch (navigation defect, SEO split, fake ratings, ErrorBoundary, 15 MB dead PNG weight) |
| **MEDIUM** | 8 | Resolve pre-launch where cheap, or early post-launch sprint + required manual browser QA |
| **LOW** | 4 | Safe post-launch polish |
| **Total** | **24** | Complete 12-area audit register (`GLOVOTOOLS_LAUNCH_BLOCKERS.csv`) |

---

## 2. Authoritative Runtime Snapshot (Verified via Code & Automated Execution)

| Metric | Measured Value | Evidence Source |
|---|---:|---|
| Raw `CALCULATORS` entries | **4,400** | `src/data/calculators.ts` (`npx tsx` audit) |
| Unique tool IDs (`getUniqueRegisteredToolCount()`) | **4,375** | `src/data/calculators.ts:2034-2050` |
| Duplicate tool IDs (raw occurrences) | **25** (50 rows; 9 span multiple categories) | `src/data/calculators.ts` |
| Active `CATEGORIES` (`count > 0`) | **52** of 52 | `src/data/calculators.ts:1971-1977` |
| Registered `SUBCATEGORIES` | **492** (`5` have `count === 0`) | `src/data/calculators.ts:1980-1986` |
| Custom React UI components (`CalculatorView.tsx`) | **197** unique tools (100% match `CALCULATORS`) | `src/components/CalculatorView.tsx` |
| Specialized Domain Workspaces | **96** (`tools`: 43, `pdf-tools`: 33, `document-converters`: 20) | `CalculatorView.tsx` + `CALCULATORS` |
| Explicit `ALL_REGISTERED_CONTRACTS` | **406** entries (**404** unique IDs; **329** used directly by `EngineCalculatorView`) | `src/engine/contracts/allContracts.ts` |
| Synthetic `smartFields` fallback tools | **3,753** (**85.8%** of 4,375 unique tools) | `src/engine/CalculationRegistry.ts:100-169` |
| Advertised `LANGUAGES` | **10** (`en`, `es`, `pt`, `fr`, `de`, `it`, `nl`, `pl`, `ja`, `ko`) | `src/i18n/translations.ts` |
| `public/sitemap.xml` URLs | **317** (Home, `/calculators`, `/all-calculators`, **14** categories, **300** tools) | `public/sitemap.xml` |
| Production `dist/` build size | **25 MB** (`15 MB` unreferenced `public/assets/aistudio/` PNGs + `9.6 MB` assets) | `npm run build` (`vite build`) |

---

## 3. Verification Boundary: Executed vs. NOT Executed

To maintain strict audit accuracy, every check below distinguishes between **automated checks actually executed** and **runtime browser/manual checks NOT executed** in this read-only audit.

| Check / Feature Area | Execution Status | Method & Observed Outcome |
|---|---|---|
| TypeScript check (`npm run lint`) | **EXECUTED — PASS** | `tsc --noEmit` exited `0` with zero type errors. |
| Production bundle (`npm run build`) | **EXECUTED — PASS (With Size Findings)** | `vite build` exited `0`; `dist/` is `25 MB` (`index-*.js` `3.4 MB`, `pdfWorkspaceIntegration-*.js` `3.0 MB`, `pdf.worker.min-*.mjs` `1.3 MB`, unused `public/assets/aistudio/` `15 MB`). |
| Registry integrity audit (`npx tsx`) | **EXECUTED — PASS (Findings Recorded)** | Verified `4,400` raw / `4,375` unique tools, `52` categories, `492` subcategories (`5` empty), `25` duplicate IDs, `3` contract-to-metadata category mismatches. |
| Explicit contracts batch execution (`npx tsx`) | **EXECUTED — 404 PASS / 2 FAIL** | Executed `CalculationExecutor.execute(c.id, defaults)` across all `406` entries in `ALL_REGISTERED_CONTRACTS`. `404` succeeded; `2` failed due to duplicate ID overwrite (`college-savings-529-calc`, `inventory-turnover-calc`). |
| Representative formula spot-checks (`npx tsx`) | **EXECUTED — 7/7 VERIFIED** | `loan-mortgage` (`$1,798.65`), `bmi` (`22.9`), `percentage` (`30`), `compound-interest` (`$16,470.09` when `monthlyAddition=0` & `rate=5`), `break-even` (`500 units`), `pythagorean` (`5`), `ohms-law` (`1,200 Watts`). |
| Sitemap URL route validation (`npx tsx`) | **EXECUTED — 317/317 VALID** | Verified all `317` `<loc>` URLs in `public/sitemap.xml` resolve to existing categories (`14`) or tools (`300`), though `4,075` tools and `38` categories are omitted. |
| Live browser rendering & hydration | **NOT EXECUTED** | Static code/DOM analysis only; no headless or interactive browser session launched. |
| Mobile responsiveness (375px / 768px) & touch targets | **NOT EXECUTED** | CSS/Tailwind classes reviewed (`AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `Hero.tsx`), but overflow, drawer animation, and marquee pill slider require live viewport QA. |
| Client-side PDF / OCR / Office runtime | **NOT EXECUTED** | `PdfToolsWorkspace.tsx` and `DocumentConvertersWorkspace.tsx` inspected statically; real browser file upload, `pdfjs-dist` worker load, `tesseract.js` OCR, and blob download unverified. |
| Search UX latency & keyboard accessibility | **NOT EXECUTED** | `Fuse.js` config, `Hero.tsx`, `GlobalSearchModal.tsx`, and `AllCalculatorsPage.tsx` inspected in source; typing latency across 4,400 items and ARIA screen-reader behavior unverified in browser. |
| WCAG 2.2 AA contrast & Lighthouse / CWV | **NOT EXECUTED** | `index.css` tokens reviewed, but automated contrast/Axe/Lighthouse audits were not run. |

---

## 4. Area-by-Area Audit Findings (All 12 Launch-Critical Areas)

### Area 1 — Homepage (`HomePage.tsx`, `Hero.tsx`, `App.tsx`)
- **Verified Architecture:** Renders compact `Hero` search box with trending/suggested queries, `Popular Tools` domain tabs (`HomePage.tsx:205-243`), `Recently Used` and `Favorites` backed by `localStorage`, top `12` featured categories (`HomePage.tsx:250-254`), and `Utility Suites` (`pdf-tools`, `converter`, `generators`, `checkers`, `document-converters`).
- **Issues Found:**
  - `F-10` (`HIGH`): `App.tsx:209,284` fallback description & JSON-LD claim `300+` calculators across `14` categories, contradicting `Hero.tsx:74-78` (`4,375+` tools, `52` categories).
  - `F-16` (`MEDIUM`): `Hero.tsx:76,681` advertises `10 languages` (`LANGUAGES.length`), yet `HomePage.tsx` and `Hero.tsx` only translate `en` and `es` (`language === 'es'`), leaving 8 languages largely in English.

### Area 2 — Navigation and Category Browsing (`Header.tsx`, `Sidebar.tsx`, `CategoriesPage.tsx`, `CategoryDetailPage.tsx`, `AllCalculatorsPage.tsx`)
- **Issues Found:**
  - `F-05` (`HIGH`): `Sidebar.tsx:161` defines `{ id: 'calculators', label: 'Calculators' }` in `toolboxHubs`, calling `onNavigateCategoryDetail('calculators')`. `getCategoryById('calculators')` (`src/data/calculators.ts:2055`) maps `'calculators'` to `'basic-math'`. Clicking **Calculators** in the sidebar Tool Hubs opens `/calculators/calculators` showing **Basic Math** instead of all calculators. (Other hubs `converters` -> `converter`, `checkers`, `generators`, `planners`, `additional-tools`, `trackers`, `guides` map to real categories.)
  - `F-10` (`HIGH`): `CategoryDetailPage.tsx:266` renders hardcoded `Category #${category.sortOrder} of 14` (`Categoría #${rawCategory.sortOrder} de 14`), displaying invalid strings such as `Category #37 of 14` for categories 15–52.
  - `F-15` (`MEDIUM`): `25` duplicate tool IDs exist in `CALCULATORS` (`4,400` raw vs `4,375` unique; `9` span multiple categories), causing potential React `key` collisions or inconsistent category attribution when rendering unfiltered lists.
  - `F-17` (`MEDIUM`): `5` subcategories in `SUBCATEGORIES` have `count === 0` (`reptiles`, `amphibians`, `insects`, `arachnids`, `other-invertebrates`).

### Area 3 — Search Functionality (`App.tsx`, `Hero.tsx`, `GlobalSearchModal.tsx`, `AllCalculatorsPage.tsx`)
- **Verified Architecture:** `App.tsx:531-555` initializes `Fuse.js` over `CALCULATORS` (`threshold: 0.4`, `ignoreLocation: true`). `AllCalculatorsPage.tsx:200-277` uses a 2-stage direct-match + debounced `Fuse` fallback with A–Z filtering, scope tabs (`All`, `Popular`, `Favorites`, `Recently Used`), and pagination. `GlobalSearchModal.tsx` supports `Cmd/Ctrl + /` and arrow-key navigation.
- **Issues Found:**
  - `F-13` (`MEDIUM`): `index.html:32` advertises schema `SearchAction` target `https://glovotools.io/?q={search_term_string}`, but `App.tsx` never reads `window.location.search` `?q=` on mount.
  - `F-24` (`LOW`): `Hero.tsx:184` performs a synchronous `for (const calc of CALCULATORS)` linear scan with `fuzzyMatch` whenever `searchResults.length < 18`; runtime latency on mobile devices is unbenchmarked (`NOT EXECUTED`).

### Area 4 — Individual Calculator Pages (`CalculatorView.tsx`, `CalculatorPageLayout.tsx`, `EngineCalculatorView.tsx`, `CalculatorRating.tsx`, `PdfToolsWorkspace.tsx`, `DocumentConvertersWorkspace.tsx`)
- **Issues Found:**
  - `F-08` (`HIGH`): `CalculatorRating.tsx:35-40` fabricates deterministic synthetic ratings (`base = 4.6 + (id.charCodeAt(0) % 4) * 0.1`, `count = 85 + id.length * 7`) displayed to users as real ratings/vote counts (`e.g., 4.8 / 5.0 · 169 ratings`), persisted only locally.
  - `F-09` (`HIGH`): No React `ErrorBoundary` exists anywhere in `src/` (`src/main.tsx`, `src/App.tsx`). Any uncaught exception in lazy chunks, PDF parsing, OCR, or document conversion crashes the entire UI to a blank screen.
  - `F-18` (`MEDIUM`): `App.tsx:198` logs `[GLOVOTOOLS REGISTRY AUDIT]` and `CalculationRegistry.ts:25` logs duplicate overwrite `console.warn`s in production builds.
  - Note (`NOT EXECUTED`): `PdfToolsWorkspace.tsx`, `DocumentConvertersWorkspace.tsx`, and `ToolsWorkspace.tsx` were inspected in code (contain `AbortController`, blob URL cleanup, and inline error banners) but **not executed in a live browser**.

### Area 5 — Representative Calculation Accuracy (`CalculationRegistry.ts`, `CalculationExecutor.ts`, `ALL_REGISTERED_CONTRACTS`)
- **Verified Explicit Contracts:** `404` of `406` entries in `ALL_REGISTERED_CONTRACTS` execute cleanly on default inputs, and all `7` representative formula checks (`loan-mortgage`, `bmi`, `percentage`, `compound-interest`, `break-even`, `pythagorean`, `ohms-law`) produced mathematically accurate values.
- **Issues Found:**
  - `F-04` (`BLOCKER`):
    1. **85.8% Generic Synthetic Fallback:** `3,753` tools have neither a custom UI (`197`), a domain workspace (`96`), nor an explicit contract (`329`), so `CalculationRegistry.ts:100-169` synthesizes generic `smartFields` (`vals[0] * vals[1]`, `vals[0] / vals[1]`, or `vals[0] * 1.25`), while UI surfaces label every tool `"Free & verified"` (`App.tsx:948`) and `"Ready and Operational"` (`CalculationRegistry.ts:156`).
    2. **Duplicate Contract Collision:** `college-savings-529-calc` (`batch4_financial.ts:1131` vs `batch12_expansion_batch2.ts:287`) and `inventory-turnover-calc` (`batch5_business.ts:516` vs `batch13_expansion_batch3.ts:448`) overwrite prior registrations. `college-savings-529-calc` is masked by `CollegeSavings529Calculator` in `CalculatorView.tsx:252`, whereas `inventory-turnover-calc` executes via `EngineCalculatorView` with mismatched field expectations (`avgInventory` vs `averageInventory`) and category metadata mismatch.
  - `F-15` (`MEDIUM`): `3` explicit contracts mismatch their `CALCULATORS` category (`inventory-turnover-calc`, `college-savings-529-calc`, `lorem-ipsum-generator`).
  - `F-21` (`LOW`): `compound-interest` explicit contract uses `rate` (not `annualRate`) and defaults `monthlyAddition: 200` (accurate when `monthlyAddition: 0`, though easy for lump-sum users to overlook if they don't zero out monthly contributions).

### Area 6 — Mobile Responsiveness (`AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `Hero.tsx`, `CategoryDetailPage.tsx`)
- **Static Review Findings:** `AppShell.tsx:29` applies `overflow-x-clip`; `Header.tsx:84-102` and `Sidebar.tsx:427-447` provide a responsive `< lg` slide-over drawer (`min-h-[44px]` touch targets); `Hero.tsx:391` uses `w-full sm:w-[340px]`.
- **Issues Found:**
  - `F-19` (`MEDIUM` — **Verification Gap**): Live mobile/tablet viewport testing (`375px`, `768px`), drawer focus restoration, horizontal overflow verification across complex tables (`AdditionalInformationSection.tsx`), and `CategoryDetailPage.tsx:78-159` infinite marquee pill slider on touch devices were **NOT EXECUTED**.

### Area 7 — Broken Routes and Links (`App.tsx`, `Sidebar.tsx`, `Footer.tsx`)
- **Issues Found:**
  - `F-03` (`BLOCKER`): `parseUrlPath` (`App.tsx:44-97`) has **no 404 state**. Unknown routes (`/nonexistent`, `/privacy`, `/terms`, `/contact`, `/calculator/does-not-exist`) silently fall through to `{ view: 'home' }`.
  - `F-05` (`HIGH`): Sidebar `'calculators'` hub links to `/calculators/calculators`, resolving to `basic-math`.
  - `F-13` (`MEDIUM`): `/?q={search_term_string}` is declared in JSON-LD but ignored by routing.

### Area 8 — Production Build and TypeScript (`package.json`, `vite.config.ts`, `tsconfig.json`)
- **Verified:** `npm run lint` (`tsc --noEmit`) passed (`exit 0`); `npm run build` (`vite build`) passed (`exit 0`).
- **Issues Found:**
  - `F-11` (`HIGH`): `public/assets/aistudio/` contains **15 MB** of PNG mockups (`0` references anywhere in `src/` or `index.html`) that Vite copies verbatim into `dist/assets/aistudio/`, inflating deploy size from `10 MB` to `25 MB`. Also, the main JS entry chunk `dist/assets/index-*.js` is **3.4 MB** due to synchronous imports of 199 catalog batch files in `src/data/calculators.ts`, and `pdfWorkspaceIntegration-*.js` is **3.0 MB** (`pdf.worker.min-*.mjs` **1.3 MB**).
  - `F-20` (`MEDIUM`): `package.json:15,22` includes unused `@google/genai` and `express` packages, `metadata.json:5` retains `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, and no `.env.example` exists.

### Area 9 — Page Metadata and SEO (`index.html`, `App.tsx`, `CalculatorPageLayout.tsx`)
- **Issues Found:**
  - `F-06` (`HIGH`): Canonical origin mismatch — `index.html:9,15,28,32` specifies `https://glovotools.io`, while `public/robots.txt:4`, `public/sitemap.xml`, `App.tsx:204`, and `src/audit/generateSitemap.ts:6` use `https://glovotools.app`.
  - `F-10` (`HIGH`): `index.html:6,7,13,20,29` hardcodes `1,544+`, while `App.tsx:209,284` hardcodes `300+` tools and `14 categories`.
  - `F-14` (`MEDIUM`): Missing `<link rel="icon">` and `og:image`/`twitter:image` assets; `App.tsx:340` omits `language` and `currentSubcategoryId` from the SEO `useEffect` dependency array; `CalculatorPageLayout.tsx:65-83` sets `document.title` independently from `App.tsx:234` (creating title overwrite races on navigation).

### Area 10 — Sitemap and robots.txt (`public/sitemap.xml`, `public/robots.txt`, `src/audit/generateSitemap.ts`)
- **Verified:** `public/robots.txt` permits `/` and references `https://glovotools.app/sitemap.xml`. All `317` URLs in `public/sitemap.xml` match valid routes (`0` broken URLs).
- **Issues Found:**
  - `F-07` (`HIGH`): `public/sitemap.xml` omits **38 of 52 categories**, **4,075 of 4,375 unique tools**, and all subcategories (coverage is only **6.9%** of unique tools). Note: when regenerating, synthetic fallback tools (`3,753`) should either carry clear disclaimer/noindex policy or wait until verified, depending on launch scope decision (`F-04`).
  - `F-06` (`HIGH`): Domain mismatch between `robots.txt`/`sitemap.xml` (`glovotools.app`) and `index.html` (`glovotools.io`).

### Area 11 — Privacy, About, Contact and Terms Pages (`Footer.tsx`, `AboutModal.tsx`, `BlogModal.tsx`)
- **Issues Found:**
  - `F-02` (`BLOCKER`):
    - **No Terms of Use / Legal Disclaimers route:** Financial, tax, mortgage, medical/pregnancy, and engineering tools have zero site-wide Terms of Use or limitation-of-liability policy.
    - **No Privacy Policy route:** `Footer.tsx:97-104` binds `Privacy & Data Policy` to `onOpenAbout`, opening `AboutModal.tsx` (which has no privacy policy details).
    - **No Contact page or real support channel:** Zero `/contact` route or link anywhere in `Footer.tsx`, `Sidebar.tsx`, or `AboutModal.tsx` (`support@glovotools.io` only appears inside dummy regex/URL tool sample defaults).
    - **No crawlable `/about` page:** Only `AboutModal.tsx` dialog exists.
  - `F-12` (`HIGH`): `Footer.tsx:106` displays `"WCAG 2.2 AA Compliant"` without an accessibility audit/VPAT; `Footer.tsx:37` (`t('footer.privacyBadge')`) states `"100% Client-side • Zero cookies • Open mathematics"` without disclosing third-party Google Fonts requests (`index.html:40`) or `localStorage` persistence (`glovotools_theme`, `glovotools_recent_*`, `glovotools_favorites`, `glovotools_user_rating_*`).

### Area 12 — Production Deployment Configuration
- **Issues Found:**
  - `F-01` (`BLOCKER`): No hosting/SPA fallback config exists (`vercel.json`, `netlify.toml`, `public/_redirects`, `_headers`, `Dockerfile`, or `server.ts` absent; `package.json` lacks `"start"` script). Any direct hit or browser reload on `/calculator/bmi`, `/calculators/financial`, or `/all-calculators` will return a static host 404.
  - `F-11` (`HIGH`): `15 MB` of dead PNG files in `public/assets/aistudio/` deployed needlessly to CDN.

---

## 5. Top 5 Issues Blocking Production Launch

1. **`F-01` (`BLOCKER`) — Missing SPA Hosting & Rewrite Fallback:** Direct links, bookmarks, and Google-indexed `/calculator/*` or `/calculators/*` URLs will 404 on refresh without a rewrite rule to `/index.html`.
2. **`F-02` (`BLOCKER`) — Missing Privacy Policy, Terms of Use / Liability Disclaimers, and Contact Page:** Required for public launch trust, ad/search compliance, and liability protection across financial, tax, health, and engineering calculators.
3. **`F-04` (`BLOCKER`) — 3,753 Synthetic Fallback Tools Labeled `"Free & verified"` + 2 Duplicate Contract Collisions:** 85.8% of tools run generic `smartFields` math (`a * b`, `a / b`, `a * 1.25`) while UI labels them verified; `inventory-turnover-calc` has two conflicting contracts.
4. **`F-03` (`BLOCKER`) — Silent Homepage Fallback Instead of 404 View:** Invalid paths and unknown `/calculator/*` IDs render `/` silently instead of a clean 404 screen, breaking user recovery and SEO soft-404 handling.
5. **`F-05` & `F-06` & `F-08` (`HIGH`) — Broken Sidebar Hub Link, Canonical Domain Split, and Fabricated Ratings:** Sidebar "Calculators" points to Basic Math; `index.html` says `glovotools.io` while `sitemap.xml`/`robots.txt` say `glovotools.app`; `CalculatorRating.tsx` displays synthetic rating/vote numbers.

---

## 6. Minimum Cost-Controlled Implementation Plan (Zero Paid Services, Zero Taxonomy Migration)

### Scope Preserved (Unchanged)
- Zero catalog expansion, zero taxonomy migration (`D3.*` remains frozen), zero UI redesign, zero new npm dependencies, zero paid APIs/AI services.

### Minimum Pre-Launch Work (3 Small Passes)

| Pass | Scope & Files | Cost / Risk |
|---|---|---|
| **Pass 1 — Hosting, Routing & Legal Pages (`BLOCKER`s `F-01`, `F-02`, `F-03`)** | 1. Add SPA fallback config (`vercel.json` / `public/_redirects` for static hosting, plus optional lightweight `Cache-Control` headers for `/assets/*`).<br>2. Add lightweight static SPA routes `/privacy`, `/terms`, `/about`, `/contact` and wire `Footer.tsx` + `Sidebar.tsx` links cleanly.<br>3. Add a `NotFoundView` fallback in `App.tsx` `parseUrlPath` for unknown paths and invalid `/calculator/:id` IDs (with search/home links). | **Minimal** (static TSX views + 1 config file; zero dependencies) |
| **Pass 2 — Calculation Honesty, Error Resilience & Nav Fix (`F-04`, `F-05`, `F-08`, `F-09`)** | 1. Deduplicate the 2 colliding explicit contracts (`college-savings-529-calc`, `inventory-turnover-calc`) so `ALL_REGISTERED_CONTRACTS` has `404` unique, non-overwriting contracts.<br>2. Flag fallback `CalculationRegistry.ts` synthetic contracts (`isSyntheticFallback: true`) so `EngineCalculatorView.tsx` and `App.tsx:948` display an honest `"Standard Estimate / Formula Preview"` notice + domain disclaimer instead of `"Free & verified"`.<br>3. Fix `Sidebar.tsx:161` `'calculators'` hub action to navigate to `all-calculators` (or a non-`basic-math` hub view).<br>4. Wrap `<App />` and `<CalculatorView />` in a lightweight React `ErrorBoundary`.<br>5. Remove fabricated seed rating numbers in `CalculatorRating.tsx:35-40` (show local feedback or unseeded state only). | **Low** (surgical edits, preserves all 4,375 registrations and UI layout) |
| **Pass 3 — Canonical SEO, Copy Consistency & Deploy Hygiene (`F-06`, `F-07`, `F-10`, `F-11`, `F-12`, `F-13`, `F-14`, `F-18`)** | 1. Standardize canonical domain across `index.html`, `robots.txt`, `sitemap.xml`, and `App.tsx` (pick single canonical domain: `https://glovotools.app` or `https://glovotools.io`).<br>2. Fix stale copy (`1,544+`, `300+`, `of 14`) in `index.html`, `App.tsx`, and `CategoryDetailPage.tsx:266`.<br>3. Add favicon (`public/favicon.svg`), `og:image`, single-source `document.title`, `?q=` query parsing, and regenerate `sitemap.xml` (covering all 52 categories + verified 622 explicit/custom/workspace tools, or full catalog per indexing decision).<br>4. Remove unused `15 MB` `public/assets/aistudio/` directory and remove/soften unverified `"WCAG 2.2 AA Compliant"` / `"Zero cookies"` badge text & startup `console.log`s. | **Low** (saves 15 MB deploy weight immediately; clean SEO) |
| **Pass 4 — Pre-Cutover Live Browser QA (`F-19`, `F-23`)** | Execute manual/Playwright smoke tests on built `dist/` (`vite preview`): `375px` mobile & `768px` tablet responsiveness, deep-link refresh, search, representative calculators, and client-side PDF/OCR/Office upload/download. | **Zero code cost** (QA gate) |

### Safe Post-Launch Deferrals (Do NOT Block Lean Launch)
- **Catalog Taxonomy Migration (`D3.x`):** 25 duplicate catalog entries, 5 empty pet subcategories, and canonical taxonomy cleanup (`F-15`, `F-17`).
- **Translating All 10 Languages (`F-16`):** Reorder or scope `LanguageSelector` to `en`/`es` first, or complete the remaining 8 languages (`pt`, `fr`, `de`, `it`, `nl`, `pl`, `ja`, `ko`) post-launch.
- **Replacing All 3,753 Synthetic Fallback Contracts with Explicit Formulas:** Roll out domain-by-domain post-launch based on real traffic analytics.
- **Bundle Splitting of 199 Catalog Files (`3.4 MB` main chunk):** Optimize post-launch via dynamic catalog chunking or search index splitting.
- **Expanding `BlogModal` (`F-22`) into SEO Guide Pages & Removing Unused `express`/`@google/genai` Deps (`F-20`).**
