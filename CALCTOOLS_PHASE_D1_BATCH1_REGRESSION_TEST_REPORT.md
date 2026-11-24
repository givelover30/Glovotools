# CALCTOOLS 2.0 — PHASE D1 BATCH 1 REGRESSION TEST REPORT

## 1. Executed Checks Summary

All automated build, typecheck, catalog diff, contract execution, UI dispatch inspection, localization, and hub-association checks were executed directly against the updated codebase after editing `src/data/toolClassification.ts`.

| Check | Command / Tool | Outcome | Notes |
|---|---|---|---|
| TypeScript Type Check | `tsc --noEmit` (`lint_applet`) | **PASS** | 0 errors |
| Production Build | `vite build` (`compile_applet`) | **PASS** | Bundle built cleanly |
| Catalog & 4,375-Tool Diff Verification | `npx tsx tmp/verify_batch1.ts` | **PASS** | 59/59 assertions passed; exact 15 changed, 4,360 unchanged |
| Excluded Candidates Isolation | `npx tsx tmp/verify_batch1.ts` | **PASS** | All 4 excluded tools unchanged |
| Registered Contract Execution (7 Batch 1 contracts) | `npx tsx tmp/run_runtime_regression.ts` | **PASS** | All 7 registered Batch 1 contracts executed with `success=true` |
| Engine Formula & Validation Assertions (`EngineTestSuite`) | `npx tsx tmp/run_runtime_regression.ts` | **PASS (with 4 legacy suite notes)** | 79/79 formula, percentage, algebra, geometry, trig, stats, finance, engineering, precision, unit, validation, and 24-fixture assertions passed; 4 pre-existing Phase-6 `CalculationRegistry` 300-tool count assertions failed as expected on the 4,375-tool catalog |
| UI Component & Variant Dispatch Check | `npx tsx tmp/run_runtime_regression.ts` | **PASS** | All 15 tools confirmed mapped to dedicated branches in `CalculatorView.tsx` or `ToolsWorkspace.tsx` and `toolPageVariant.ts` |
| Hub-Subject Category Association & EN/ES Localization | `npx tsx tmp/run_runtime_regression.ts` | **PASS** | `isVerifiedHubCategoryTool(calc, newHub) === true` and `getHubSubjectCategoryAssociations` includes each tool's category under its new hub |
| Headless Browser E2E (Playwright) | Playwright runtime check | **NOT RUN** | Playwright is not installed in this environment (`NO_PW`) |

---

## 2. Detailed Regression Results

### 2.1 Full-Catalog Before/After Diff (`tmp/verify_batch1.ts`)
- **Raw `CALCULATORS` length:** `4400 === 4400` (PASS)
- **Unique tool IDs:** `4375 === 4375` (PASS)
- **Duplicate catalog entries:** `25 === 25` untouched (PASS)
- **Unique tool IDs whose primary hub changed:** `15` (PASS)
- **Unexpected hub changes outside Batch 1:** `0` (PASS)
- **Sum of unique hub counts across all 21 `TOOL_HUBS`:** `4375` (PASS)
- **Sum of raw hub counts across all 21 `TOOL_HUBS`:** `4400` (PASS)

### 2.2 Batch 1 Registered Contract Execution (`CalculationExecutor.execute`)
The 7 Batch 1 tools with registered contracts in `CalculationRegistry` were executed with schema-valid inputs:
1. `stats-summary` (`{ data: [10, 20, 20, 30, 40] }`) → `success=true`
2. `date-difference` (`{ startDate: '2026-10-05', endDate: '2026-10-16' }`) → `success=true`
3. `tip-split` (`{ billAmount: 84.0, tipPercent: 20, guests: 3 }`) → `success=true`
4. `discount-tax` (`{ originalPrice: 80, discountPercent: 25, taxPercent: 8.25 }`) → `success=true`
5. `base64-encoder-decoder` (`{ byteLength: 120, mode: 'encode' }`) → `success=true`
6. `hash-generator-tool` (`{ algorithm: 'sha256', messageLength: 48 }`) → `success=true`
7. `url-encoder-decoder` (`{ characterLength: 60, mode: 'encode' }`) → `success=true`

The remaining 8 Batch 1 tools (`moving-planner`, `regex-tester`, `phone-number-checker`, `wedding-planning-organizer`, `emergency-fund-planner`, `personal-goal-organizer`, `plant-growth-tracker`, `w4-withholding-calc`) are UI-component/workspace tools dispatched directly via `CalculatorView.tsx` `switch` cases and have no broken contract dependencies.

### 2.3 Navigation, Direct URL, Favorites & Localization Compatibility
- Direct URLs (`/calculator/:calculatorId`) resolve against `CALCULATORS.some((c) => c.id === calcId)` in `src/App.tsx`; no tool IDs or slugs were modified, so all 15 direct links remain identical.
- Favorites persistence (`FavoritesService` in `src/services/FavoritesService.ts`, keyed by `CalculatorId` under `calctools_global_favorites`) does not store hub names and remains unaffected.
- `getLocalizedCalculator(calc, 'en' | 'es')` and `getContextualToolName(name, newHub)` execute cleanly for all 15 tools.
- `EngineTestSuite` results note: 79 assertions passed; the 4 failures are pre-existing Phase-6 static checks (`CalculationRegistry.validateRegistry().registeredCount === 300`, `valid === true`, `unregisteredIds.length === 0`, `contractCategoriesMismatched.length === 0`) left over from the 300-tool catalog era and unrelated to Batch 1.
