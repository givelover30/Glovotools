# PLANNER-IMPLEMENTATION-01 — REGRESSION REPORT

**Task ID:** `PLANNER-IMPLEMENTATION-01`  
**Audit Baseline vs. Post-Implementation Comparison**

---

## 1. Catalog & Classification Parity (Before vs. After)

| Metric | Pre-Implementation Baseline | Post-Implementation Observed | Delta & Explanation |
| :--- | ---: | ---: | :--- |
| **Raw Catalog Entries (`RAW_CALCULATORS`)** | 4,404 | **4,404** | `0` (zero catalog files modified) |
| **Unique Catalog Tool IDs** | 4,379 | **4,379** | `0` (no additions, deletions, or renames) |
| **Registered Explicit Contracts (`ALL_REGISTERED_CONTRACTS`)** | 404 | **417** | **+13** (13 P0 planner contracts added; `0` duplicate ID warnings) |
| **Global `explicit-tested` Unique Tools** | 240 | **253** | **+13** (all 13 verified P0 planners added to `TESTED_PASSING_TOOL_IDS`) |
| **Global `explicit-untested` Unique Tools** | 277 | **274** | **-3** (`project-timeline-planner`, `debt-repayment-planner`, `retirement-planning-calculator` upgraded to `explicit-tested`) |
| **Global `workspace` Unique Tools** | 96 | **96** | `0` |
| **Global `static-guide` Unique Tools** | 10 | **10** | `0` |
| **Global `generic-fallback` Unique Tools** | 3,756 | **3,746** | **-10** (Sub-batches B, C, and D12–D14 replaced with contracts + custom workspaces) |
| **Canonical `planners` Category Total** | 179 | **179** | `0` |
| **`planners` — `explicit-tested`** | 0 | **13** | **+13** |
| **`planners` — `explicit-untested`** | 20 | **17** | **-3** (remaining 17 pre-existing custom planner UIs preserved untouched) |
| **`planners` — `generic-fallback`** | 159 | **149** | **-10** (148 P1/P2/P3 tools + 1 Blocked P0 tool `freelance-client-project-organizer`) |

---

## 2. Explicit Isolation & Non-Regression Checks

| Target / Boundary | Verification Result | Details |
| :--- | :--- | :--- |
| **`401k-savings-calc` vs. `retirement-planning-calculator`** | **PASS** | `CalculatorView.tsx` routes `'401k-savings-calc'` to `<RetirementPlanningCalculator mode="401k" />` and `'retirement-planning-calculator'` to `<RetirementPlanningCalculator mode="planner" />`. Separate storage keys prevent state bleed; `401k-savings-calc` keeps its canonical `financial` contract in `batch4_financial.ts`. |
| **`freelance-rate-calc` vs. `freelance-rate-planner`** | **PASS** | `freelance-rate-calc` continues routing to `FreelanceRateCalculator.tsx` under `business`; `freelance-rate-planner` uses its own workspace and contract under `planners`. |
| **`college-savings-529-calc` vs. `college-tuition-savings-growth-planner`** | **PASS** | `college-savings-529-calc` preserves its canonical `financial` contract (`batch4_financial.ts`) and `CollegeSavings529Calculator.tsx`; `college-tuition-savings-growth-planner` runs independently under `planners`. |
| **Duplicate Collision (`freelance-client-project-organizer`)** | **PASS (Preserved Untouched)** | Left untouched across `batch82d_group3.ts` (`business`), `batch83_group6.ts` (`planners`), `CalculatorView.tsx`, and `CalculationRegistry.ts`. Verified via Vitest to avoid introducing category-mismatch errors or silent business-tool overrides. |
| **Pre-existing Vitest Suites (9 files / 81 tests)** | **PASS (81/81)** | All PDF (`pdf-extract-pages`, `pdf-delete-pages`, `pdf-reorder-pages`, `pdf-rotate-pages`, `pdf-extractor-merger`, `pdf-page-counter`), `currency.test.ts`, `loanCurrency.test.tsx`, and `allToolsAlphabet.test.tsx` tests pass without regression. |
| **Production Build & Asset Pipeline (`npm run build`)** | **PASS** | Sitemap generation (`public/sitemap.xml`), Vite bundling, PDF.js 6.5.438 worker SHA-256 verification, and `dist/.htaccess` validation all pass. |

---

## 3. Legacy Baseline Script Notes (Transparent Reporting)

Two pre-existing repository scripts were executed without editing their source assertions:

1. **`npx tsx src/engine/test-suite.ts`**: Passed **82 / 83 assertions**. The single failure (`metadataTotal matches catalog length (4400 raw)` vs. actual `4404`) is a **pre-existing catalog drift** present prior to `PLANNER-IMPLEMENTATION-01`.
2. **`npx tsx tests/stage22.regression.ts`**: Failed at **Check 1** (`ALL_REGISTERED_CONTRACTS` expected `404`, observed `417`). This script also hardcodes pre-existing catalog totals (`4400`/`4375`) and baseline status counts (`240` `explicit-tested`, `277` `explicit-untested`, `3752` `generic-fallback`). The `+13` contract count delta is an expected outcome of implementing 13 domain contracts in `ALL_REGISTERED_CONTRACTS`. Updating `stage22.regression.ts` / `test-suite.ts` thresholds was intentionally deferred outside P0 planner scope so existing baseline invariants remain visibly tracked.
