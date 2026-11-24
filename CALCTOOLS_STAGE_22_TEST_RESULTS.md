# CALCTOOLS 2.0 — STAGE 2.2 TEST & VERIFICATION RESULTS

## 1. Execution Environment
- **Workspace:** `/app/applet`
- **Node.js:** `v22.23.2` (`npx tsx`, `vite build`, `tsc --noEmit`)
- **Execution Mode:** Local Node/TypeScript execution, React `renderToStaticMarkup` server rendering assertions, static TypeScript type checking, and Vite production bundling.

---

## 2. Automated Verification Commands & Results

### A. Stage 2.2 Regression Suite (`npx tsx tests/stage22.regression.ts`)
- **Result:** **PASS (14/14 checks)**
- Verified assertions:
  1. `ALL_REGISTERED_CONTRACTS` contains **404** entries with **404** unique IDs (0 duplicate IDs).
  2. `CalculationRegistry.initialize()` runs with **0** `Duplicate calculator contract registration detected` warnings.
  3. `college-savings-529-calc` resolves to the canonical `batch4_financial.ts` contract (`category: 'financial'`) and computes `monthlyNeeded ≈ $395` for `{ targetTuition: 120000, current529: 15000, yearsUntilCollege: 12, expectedReturn: 6.5 }`.
  4. `inventory-turnover-calc` resolves to the canonical `batch13_expansion_batch3.ts` contract (`category: 'manufacturing-inventory'`) and computes `5.0x` for both UI schema `{ cogs: 1450000, averageInventory: 290000 }` and legacy oracle input `{ cogs: 400000, avgInventory: 80000 }`.
  5. Catalog integrity preserved: **4,400** raw entries and **4,375** unique tool IDs.
  6. Exact tier counts across all 4,375 unique tools match runtime routing and test evidence:
     - `explicit-tested`: **240**
     - `explicit-untested`: **277**
     - `workspace`: **96**
     - `static-guide`: **10**
     - `generic-fallback`: **3,752**
     - `rhombus-area`, `geometric-mean`, `harmonic-mean` stay `explicit-untested`; `git-commands-reference` stays `generic-fallback`.
  7. Generic fallback contracts from `CalculationRegistry.get(...)` set `isSyntheticFallback: true`, `implementationTier: 'generic-fallback'`, and `evaluationStatus: 'Generic estimate (formula preview)'`.
  8. `cloud-storage-cost-optimizer` sets `isSyntheticFallback: false`, `implementationTier: 'explicit-untested'`, and computes `(1000 × 0.023) + 5 + 10 = 38`.
  9. Core `EngineTestSuite` passes **83/83** assertions and `AuditRunner` has **0** defects for `college-savings-529-calc` and `inventory-turnover-calc`.
  10. Representative explicit calculations verified (`loan-mortgage`, `bmi`, `ohms-law`, `discount-tax`).
  11. `Sidebar` `'calculators'` hub calls `onNavigateAllCalculators()`, `parseUrlPath('/all-calculators').view === 'all-calculators'`, and SSR renders `aria-current="page"` on `Calculators` when `currentView="all-calculators"`.
  12. `CalculatorRating` renders zero fabricated aggregate scores (`/ 5.0`), zero vote counts (`ratings`/`votos`), and removes `calctools_rating_stats_*`.
  13. `EngineCalculatorView` SSR renders `data-testid="synthetic-fallback-notice"` (`Generic Formula Preview — Unverified Estimate`) for fallback tools; `CalculatorHeader` renders `data-tool-tier="generic-fallback"` vs `data-tool-tier="explicit-tested"`.
  14. `ErrorBoundary.getDerivedStateFromError` returns `{ hasError: true }`, recovery SSR HTML shows `"Unable to display this tool"`, `"Try Again"`, `"All Tools"`, `"Go Home"` without leaking error message or stack traces, and `componentDidUpdate` resets `hasError` when `resetKey` changes.

### B. Core Mathematical Engine Suite (`npx tsx src/engine/test-suite.ts`)
- **Result:** **PASS (83/83 assertions, 0 failed)**

### C. Production Build (`npm run build` / `vite build`)
- **Result:** **PASS** (cleanly bundled into `dist/` in ~4.2s)

### D. TypeScript Lint & Compile (`npm run lint` + `compile_applet`)
- Executed in final co-verification step; see completion output.

---

## 3. Manual / Browser E2E Verification Boundary (Honest Statement)
- Headless Chromium / Playwright UI E2E was **not** executed in this container. Interactive DOM state transitions (such as clicking the Sidebar button in a live browser, clicking a rating star with `localStorage`, or triggering a runtime `throw` inside a React render tree via DOM event) are backed by static source inspection, `renderToStaticMarkup` SSR assertions, unit checks of `ErrorBoundary` lifecycle methods, and full production Vite bundling rather than a live browser session.
