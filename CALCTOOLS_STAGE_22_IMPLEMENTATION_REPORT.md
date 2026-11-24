# CALCTOOLS 2.0 — STAGE 2.2 IMPLEMENTATION REPORT
## Calculation Reliability, Error Protection & UI Honesty (`F-04`, `F-05`, `F-08`, `F-09`)

## 1. Executive Summary
Stage 2.2 / Implementation 01 resolved findings `F-04`, `F-05`, `F-08`, and `F-09` from the Lean Production Readiness Audit while preserving all 4,400 catalog entries (4,375 unique tool IDs), existing routes, SEO configuration, Stage 2.1 `.htaccess`/legal pages, and calculation formulas.

- **`F-04` (Duplicate Contracts & Status Honesty):** Eliminated both duplicate contract registrations (`college-savings-529-calc` and `inventory-turnover-calc`) leaving **404/404** unique contracts with zero overwrite warnings, introduced honest 5-tier status classification in `src/engine/toolStatus.ts` and `CALCTOOLS_STAGE_22_CALCULATION_STATUS_AUDIT.csv`, surfaced clear unverified fallback notices in `EngineCalculatorView` and `CalculatorHeader`, and removed inflated `"verified"` labels across UI and i18n copy.
- **`F-05` (Sidebar Destination):** Updated the `Calculators` item in `src/components/common/Sidebar.tsx` to navigate to `/all-calculators` (`onNavigateAllCalculators`) instead of an invalid `category-detail` lookup, syncing `aria-current="page"` with `currentView === 'all-calculators'`.
- **`F-08` (Honest Rating Component):** Removed all fabricated aggregate star averages (`4.6 + ...`), synthetic vote counts (`85 + id.length * 7`), and `calctools_rating_stats_*` localStorage logic from `src/components/calculator/CalculatorRating.tsx`, retaining only clean local-device 1–5 star personal feedback.
- **`F-09` (ErrorBoundary Crash Protection):** Created `src/components/common/ErrorBoundary.tsx` and wrapped the root entry (`src/main.tsx`), main routed viewport (`src/App.tsx`), and individual tool renderer (`src/components/CalculatorView.tsx`) with navigation `resetKey` auto-recovery, `console.error` logging, and friendly recovery buttons without exposing stack traces.

---

## 2. Duplicate Contract Collision Resolution (`F-04`)

1. **`college-savings-529-calc`**
   - **Previous conflict:** `src/engine/contracts/batch4_financial.ts` (index 157) was silently overwritten by `src/engine/contracts/batch12_expansion_batch2.ts` (index 315) using incompatible category (`education-finance`) and field names (`currentSavings` vs `targetTuition`/`current529`).
   - **Canonical choice:** Kept `src/engine/contracts/batch4_financial.ts` (matches `CALCULATORS` category `financial`, `retirement-savings`, and `financial_oracles.ts`) and removed the accidental duplicate from `batch12_expansion_batch2.ts`.
   - **Outcome:** Eliminated duplicate warning and resolved `AuditRunner` failure `DEFECT-P7-0054` and `validateRegistry()` category mismatch.

2. **`inventory-turnover-calc`**
   - **Previous conflict:** `src/engine/contracts/batch5_business.ts` (`category: 'business'`, field `avgInventory`) was overwritten by `src/engine/contracts/batch13_expansion_batch3.ts` (`category: 'manufacturing-inventory'`, field `averageInventory`), causing `AuditRunner` failure `DEFECT-P7-0055`.
   - **Canonical choice:** Kept `src/engine/contracts/batch13_expansion_batch3.ts` (matches the sole catalog entry in `CALCULATORS` under `manufacturing-inventory`), removed the superseded duplicate from `batch5_business.ts`, and added fallback support in `calculate()` for `inputs.averageInventory ?? inputs.avgInventory`.
   - **Outcome:** Eliminated duplicate warning, resolved `DEFECT-P7-0055`, and preserved compatibility with both UI inputs and oracle fixtures.

---

## 3. Code-and-Test-Evidence Classification of All 4,375 Unique Tools

Generated in `CALCTOOLS_STAGE_22_CALCULATION_STATUS_AUDIT.csv` from live inspection of `CALCULATORS`, `CalculatorView.tsx`, `ALL_REGISTERED_CONTRACTS`, `AuditRunner`, and `EngineTestSuite`:

| Implementation Tier | Count | Share | Basis in Code & Executed Tests |
|---|---:|---:|---|
| `explicit-tested` | 240 | 5.49% | Custom UI or explicit contract backed by passing `AuditRunner` (`234` exact-ID passes) or `EngineTestSuite` (`6` additional core fixtures) |
| `explicit-untested` | 277 | 6.33% | Dedicated custom UI (`158`) or explicit engine contract (`119`, incl. `cloud-storage-cost-optimizer` and 3 tools with pre-existing oracle defects: `rhombus-area`, `geometric-mean`, `harmonic-mean`) |
| `workspace` | 96 | 2.19% | Dedicated multi-tool browser workspaces (`tools`: 43, `pdf-tools`: 33, `document-converters`: 20) |
| `static-guide` | 10 | 0.23% | Dedicated static reference components (`*ReferenceCalculator` in `CalculatorView.tsx`) |
| `generic-fallback` | 3,752 | 85.76% | Tools routed to `EngineCalculatorView` using synthetic `generateSmartFields` contracts (`isSyntheticFallback: true`), including 192 `references`-category entries lacking custom UI components |
| **Total Unique Tools** | **4,375** | **100.00%** | **Preserves all 4,400 raw catalog entries (0 deletions)** |

---

## 4. UI Honesty & Reliability Changes Summary
- **`CalculationRegistry.ts` & `EngineCalculatorView.tsx`:** Removed `'Ready and Operational'` from fallback contracts; replaced with `'Generic estimate (formula preview)'` (`isSyntheticFallback: true`) and an explicit bilingual warning banner above fallback calculator workspaces advising users not to rely on preview estimates for financial, medical, engineering, or construction decisions without independent verification.
- **Unboxed Header Tier Indicator (`CalculatorHeader.tsx`):** Shows honest implementation tier (`Tested formula`, `Dedicated tool`, `Interactive workspace`, `Reference guide`, or amber-highlighted `Formula preview (generic estimate)`).
- **Inflated Copy Cleanup (`Hero.tsx`, `HomePage.tsx`, `CategoryGrid.tsx`, `CategoriesPage.tsx`, `CategoryDetailPage.tsx`, `App.tsx`, `calculatorDetails.ts`, `translations.ts`, `esTranslations.ts`):** Removed blanket `"verified"` claims across homepage counters, search results, category cards, and default detail/disclaimer templates.
- **Pre-edit Backups Preserved:** All 20 modified existing source files were backed up prior to modification in `backups/stage_22_impl_01/` with SHA-256 checksums (`CHECKSUMS.sha256`). Stage 2.1 backups (`backups/stage_21_impl_01/`) were left untouched.

---

## 5. Next Stage Readiness
Stage 2.2 / Implementation 01 is complete and verified (`tests/stage22.regression.ts`, `src/engine/test-suite.ts`, `npm run build`, `npm run lint`, and `compile_applet`). Stage 2.3 and Stage 2.4 were intentionally **not** started.
