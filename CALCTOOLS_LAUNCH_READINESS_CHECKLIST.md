# CALCTOOLS 2.0 — LEAN LAUNCH READINESS CHECKLIST

Use this pre-launch go/no-go checklist to gate production cutover. Zero items below require taxonomy migration, catalog expansion, UI redesign, or paid services.

---

## Gate 1 — Mandatory Code & Hosting Blockers (Must Complete Before Cutover)

- [ ] **F-01 — SPA Routing Fallback Config:** Add `vercel.json` / `netlify.toml` / `public/_redirects` rewriting all non-asset routes to `/index.html` (HTTP 200). Test direct refresh on `/calculator/loan-mortgage`, `/calculators/financial`, and `/all-calculators`.
- [ ] **F-02 — Legal, Privacy, Terms & Contact Routes:** Implement `/privacy`, `/terms`, `/contact`, and `/about` static views; update `Footer.tsx` and `Sidebar.tsx` links so Privacy no longer opens `AboutModal`; include financial, tax, health/medical, and engineering non-advisory disclaimers.
- [ ] **F-03 — Explicit 404 View:** Update `parseUrlPath` in `src/App.tsx` so unknown routes and unknown `/calculator/:id` IDs render a dedicated 404 screen with Search / All Tools / Home actions instead of silently rendering Home.
- [ ] **F-04a — Deduplicate Colliding Explicit Contracts:** Remove duplicate contract definitions for `college-savings-529-calc` and `inventory-turnover-calc` so `ALL_REGISTERED_CONTRACTS` passes `404/404` without `console.warn` overwrites.
- [ ] **F-04b — Honest Labeling on 3,753 Synthetic Fallback Tools:** Flag `CalculationRegistry.ts` generated `smartFields` contracts so `EngineCalculatorView` and search cards label them honestly (e.g., `Formula Preview / Estimate` + disclaimer) rather than `"Free & verified"` / `"Ready and Operational"`.

---

## Gate 2 — Mandatory High-Priority Fixes (Before Public Launch)

- [ ] **F-05 — Fix Sidebar "Calculators" Link:** Update `Sidebar.tsx:161` `'calculators'` hub action to navigate to `/all-calculators` (instead of resolving to `basic-math`).
- [ ] **F-06 — Unify Canonical Domain:** Choose single production origin (`https://calctools.app` or `https://calctools.io`) and align `index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/App.tsx`, and `src/audit/generateSitemap.ts`.
- [ ] **F-07 — Regenerate `public/sitemap.xml`:** Expand beyond 317 URLs to include all 52 active categories and verified tools (decide explicitly whether `3,753` fallback tools are included or excluded/noindexed).
- [ ] **F-08 — Remove Fabricated Ratings:** Remove synthetic `4.6–4.9` / `85+` seed ratings in `CalculatorRating.tsx:35-40`.
- [ ] **F-09 — Add Root & Workspace `ErrorBoundary`:** Wrap `<App />` and `<CalculatorView />` in an `ErrorBoundary` recovery UI.
- [ ] **F-10 — Fix Stale Counts (`1,544+`, `300+`, `of 14`):** Replace `Category #X of 14` in `CategoryDetailPage.tsx:266` with `CATEGORIES.length`; align `index.html` and `App.tsx` counts with live registry (`4,375+` unique tools, `52` categories).
- [ ] **F-11 — Remove Dead 15 MB Mockup PNGs:** Delete or move `public/assets/aistudio/` out of `public/` so `dist/` drops from `25 MB` to `~10 MB`.
- [ ] **F-12 — Correct Unsubstantiated Footer Badges:** Remove/replace unverified `"WCAG 2.2 AA Compliant"` text and update `"Zero cookies"` badge text to reflect localStorage + Google Fonts accurately.

---

## Gate 3 — Quick Hygiene & SEO Polish (Recommended in Same PR)

- [ ] **F-13 — Handle `?q=` Query Param:** Parse `?q=` on mount in `App.tsx` (matching JSON-LD `SearchAction`) or remove `SearchAction` from `index.html`.
- [ ] **F-14 — Favicon, `og:image`, Single Title Source:** Add `<link rel="icon">` and `og:image`; add `language` and `currentSubcategoryId` to `App.tsx` SEO `useEffect` deps; unify `document.title` updates.
- [ ] **F-16 — Language Selector Honesty:** Limit `LANGUAGES` in production UI to verified languages (`en`, `es`) or mark partial translations `(Beta)` so `"10 languages"` is not misleading.
- [ ] **F-18 — Remove Startup Console Audit Log:** Remove `console.log('[CALCTOOLS REGISTRY AUDIT]...')` from `src/App.tsx:198`.

---

## Gate 4 — Mandatory Manual / Live Browser QA (Previously Unexecuted)

Run `npm run lint && npm run build && npm run preview` (or deploy to preview URL) and verify in real browsers:

- [ ] **Deep-Link & 404 Check:** Hard-refresh `/calculator/loan-mortgage`, `/calculators/financial`, `/all-calculators`, `/privacy`, `/terms`, `/contact`, and `/invalid-route-check`.
- [ ] **Mobile Viewport QA (`375×812` & `768×1024`):** Verify `Header`, `Sidebar` slide-over drawer, `Hero` search dropdown, `CategoryDetailPage` pill slider, and `AdditionalInformationSection` tables have zero horizontal scrollbars and `>= 44px` tap targets.
- [ ] **Representative Calculators E2E:** Verify live input/result updates on `loan-mortgage`, `bmi`, `percentage`, `compound-interest`, `break-even`, `pythagorean`, `ohms-law`, and `inventory-turnover-calc`.
- [ ] **PDF / OCR / Document Converters Runtime QA:** Upload a real `.pdf`, `.docx`/`.xlsx`/`.csv`, and image in `PdfToolsWorkspace` and `DocumentConvertersWorkspace`; verify `pdfjs-dist` worker loads cleanly, cancellation works, and downloaded files open without corruption.
- [ ] **Dark Mode & Keyboard Accessibility QA:** Toggle light/dark themes, verify `Tab`/`Escape` handling on `GlobalSearchModal`, `AboutModal`, and `BlogModal`, and run Lighthouse (Performance, Accessibility, Best Practices, SEO) on `/` and `/calculator/loan-mortgage`.

---

## Gate 5 — Build & Cleanliness Sign-Off

- [ ] `npm run lint` (`tsc --noEmit`) exits `0`
- [ ] `npm run build` (`vite build`) exits `0` with `public/assets/aistudio/` excluded
- [ ] `git status` confirms only intended launch-fix files changed (zero unintended catalog/taxonomy edits)
- [ ] Production DNS / SSL / HTTPS redirect verified (`http://` -> `https://`, canonical host redirect)
