# PLANNER-IMPLEMENTATION-01 — CHANGELOG

**Program:** GLOVOTOOLS Planners & Organizers Remediation (P0 Critical Batch)  
**Baseline Audits:** `PLANNERS_ORGANIZERS_AUDIT_REPORT.md` & `PLANNERS_ORGANIZERS_DEFECT_REGISTER.csv`  
**Authorized Scope:** 14 P0 Tool IDs (`13 Implemented` + `1 Blocked & Unchanged`)

---

## 1. Shared Planner Infrastructure Added

1. **`src/hooks/usePlannerStorage.ts`**
   - Versioned `localStorage` envelope (`{ version, updatedAt, data }`) with `loadPlannerStorage`, `savePlannerStorage`, `clearPlannerStorage`, and React hook `usePlannerStorage`.
   - Automatic persistence on edits, corruption/version-mismatch recovery (`recoveredFromCorruption`), `resetToDefault`, `clearWithState`, and `storageKey`-reactive reload for mode-isolated shared workspaces.
2. **`src/components/planner/exportUtils.ts`**
   - RFC 4180 CSV serializer (`escapeCsvCell`, `buildCsvContent`, `downloadCsvFile` with UTF-8 BOM) neutralizing spreadsheet formula injection (`=`, `+`, `@`, `\t`, non-numeric `-`) without corrupting valid negative numbers.
   - Structured JSON download (`downloadJsonFile`).
3. **`src/components/planner/PlannerPrimitives.tsx`**
   - Shared UI controls: `PlannerHeaderToolbar` (persistence status badge, corruption-recovery banner, copy summary, CSV export, JSON export, reset, clear), `PlannerDisclaimer`, and `PlannerProgressBar`.

---

## 2. Sub-batch A — Upgraded Partial P0 Planners (3 Tools)

1. **`project-timeline-planner`**
   - **Engine/Contract:** `src/engine/contracts/planners/projectTimeline.ts` (`PROJECT_TIMELINE_CONTRACT`, `solveProjectTimeline`, `validateProjectTimeline`).
   - **Logic Added:** UTC calendar-date arithmetic (DST-safe), cycle detection (`validateProjectTimeline`), topological CPM forward/backward pass (`ES`, `EF`, `LS`, `LF`, `slackDays`, critical path tracking), dependency-driven delay flags, and overdue detection.
   - **UI Upgraded:** `src/components/calculators/ProjectTimelinePlannerCalculator.tsx` — interactive task table/dependency editor, horizontal Gantt bar schedule visualization, KPI strip, `calctools_project_timeline_v1` persistence, CSV & JSON export, Copy, Print, EN/ES localization.
2. **`debt-repayment-planner`**
   - **Engine/Contract:** `src/engine/contracts/planners/debtAmortization.ts` (`DEBT_REPAYMENT_PLANNER_CONTRACT`, `analyzeDebtRepayment`, `validateDebtPayoffInput`).
   - **Logic Added:** Multi-account month-by-month debt amortization (`avalanche`, `snowball`, and `minimum-only` schedules) with freed-minimum payment rollover, 0% APR exact division handling, negative-amortization/unpayable balance detection, and interest/months-saved comparison.
   - **UI Upgraded:** `src/components/calculators/DebtRepaymentPlannerCalculator.tsx` (`mode="planner"`, key `calctools_debt_repayment_v1`) — multi-debt CRUD editor, strategy toggle, comparative payoff summary, monthly amortization schedule table, CSV & JSON export, Copy, Print, EN/ES localization.
3. **`retirement-planning-calculator`**
   - **Engine/Contract:** `src/engine/contracts/planners/retirementPlanning.ts` (`RETIREMENT_PLANNING_CONTRACT`, `calculateRetirementPlan`, `validateRetirementPlanInput`).
   - **Logic Added:** Annual salary growth compounding, tiered employer match (`employerMatchPct` up to `employerMatchLimit`), nominal & inflation-adjusted (real) ending balance, configurable safe withdrawal rate (4% default nominal/real annual & monthly income), and year-by-year growth schedule.
   - **UI Upgraded & Isolated:** `src/components/calculators/RetirementPlanningCalculator.tsx` refactored to support `mode?: 'planner' | '401k'`. `CalculatorView.tsx` passes `mode="planner"` for `retirement-planning-calculator` (using key `calctools_retirement_planning_v1`, safe-withdrawal focus, full EN/ES UI) and preserves `mode="401k"` for `401k-savings-calc` cleanly.

---

## 3. Sub-batch B — Replaced P0 Generic Placeholders (4 Tools)

1. **`freelance-rate-planner`** (`batch27_phase12_expansion.ts`, `p12-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/freelanceRate.ts` (`FREELANCE_RATE_PLANNER_CONTRACT`).
   - **Logic:** Solves gross annual revenue requirement via non-double-counted accounting divisor `(1 - taxReservePct/100 - profitMarginPct/100)`, billable utilization capacity (`weeks * days * hours * util%`), hourly/daily/weekly/project-day rates, and exact breakdown reconciliation.
   - **UI:** `src/components/calculators/FreelanceRatePlannerCalculator.tsx` (`calctools_freelance_rate_planner_v1`), CSV/JSON export, Copy, Print, EN/ES localization.
2. **`wedding-budget-planner`** (`batch27_phase12_expansion.ts`, `p12-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/weddingBudget.ts` (`WEDDING_BUDGET_PLANNER_CONTRACT`).
   - **Logic:** Budgeted vs. estimated vs. actual category variance tracking, allocation gap check (`100%` target), per-guest cost, payment status tallies (`Paid in Full`, `Deposit Paid`, `Unpaid`), and overspent category flagging.
   - **UI:** `src/components/calculators/WeddingBudgetPlannerCalculator.tsx` (`calctools_wedding_budget_planner_v1`), CSV/JSON export, Copy, Print, EN/ES localization.
3. **`fitness-workout-planner`** (`batch27_phase12_expansion.ts`, `p12-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/fitnessWorkout.ts` (`FITNESS_WORKOUT_PLANNER_CONTRACT`, `buildSplitPresetDays`).
   - **Logic:** 7-day weekly split presets (`ppl`, `upper-lower`, `full-body`), per-day exercise CRUD, training vs. rest day counts, weekly sets per muscle group distribution, and completion % progress.
   - **UI:** `src/components/calculators/FitnessWorkoutPlannerCalculator.tsx` (`calctools_fitness_workout_planner_v1`), CSV/JSON export, Copy, Print, EN/ES localization.
4. **`meal-prep-planner`** (`batch27_phase12_expansion.ts`, `p12-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/mealPrep.ts` (`MEAL_PREP_PLANNER_CONTRACT`).
   - **Logic:** 7-day × 4-slot weekly meal grid, optional per-meal calorie tracking (`null` omitted cleanly without fabricating zeros), and normalized case/whitespace ingredient aggregation into an aisle-grouped grocery checklist with checked persistence.
   - **UI:** `src/components/calculators/MealPrepPlannerCalculator.tsx` (`calctools_meal_prep_planner_v1`), CSV/JSON export, Copy, Print, EN/ES localization.

---

## 4. Sub-batch C — Replaced P0 Generic Placeholders (3 Tools)

1. **`side-hustle-planner`** (`batch27_phase12_expansion.ts`, `p12-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/sideHustle.ts` (`SIDE_HUSTLE_PLANNER_CONTRACT`).
   - **Logic:** Startup capital + recurring monthly cost ledger, milestone readiness completion %, projected monthly net profit vs. goal gap, payback/breakeven months, and effective net hourly return.
   - **UI:** `src/components/calculators/SideHustlePlannerCalculator.tsx` (`calctools_side_hustle_planner_v1`), CSV/JSON export, Copy, Print, EN/ES localization.
2. **`debt-snowball-avalanche-planner`** (`batch35_phase15b_expansion.ts`, `p15b-sub-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/debtAmortization.ts` (`DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT`).
   - **Logic:** Side-by-side Snowball vs. Avalanche vs. Minimum-Only amortization comparison reusing the shared engine with isolated contract ID and `mode="comparison"` UI (`calctools_debt_snowball_avalanche_v1`).
3. **`cash-flow-forecast-planner`** (`batch37_phase15d_expansion.ts`, `p15d-sub-plan`)
   - **Engine/Contract:** `src/engine/contracts/planners/cashFlowForecast.ts` (`CASH_FLOW_FORECAST_PLANNER_CONTRACT`).
   - **Logic:** Rolling multi-month (3–36 months) cash forecast across Base, Optimistic (+15% inflows / -5% outflows), and Conservative (-15% inflows / +10% outflows) scenarios supporting monthly, quarterly, and one-time line items plus negative-cash warning detection.
   - **UI:** `src/components/calculators/CashFlowForecastPlannerCalculator.tsx` (`calctools_cash_flow_forecast_v1`), CSV/JSON export, Copy, Print, EN/ES localization.

---

## 5. Sub-batch D — Replaced P0 Generic Placeholders (3 Implemented + 1 Blocked)

1. **`freelance-client-project-organizer`** — **BLOCKED / UNTOUCHED**
   - **Root Cause:** Duplicate ID collision in `RAW_CALCULATORS` (`src/data/catalog/batch82d_group3.ts` line 96 registers it as `category: 'business'`, `subcategoryId: 'freelance'`, whereas `src/data/catalog/batch83_group6.ts` line 304 registers it as `category: 'planners'`, `subcategoryId: 'freelance'`). First-match lookups resolve to `business`, while `CalculationRegistry.validateRegistry()` enforces `contract.category === meta.category` across every catalog entry.
   - **Action Taken:** Left catalog metadata, routing, `CUSTOM_UI_TOOL_IDS`, and `TESTED_PASSING_TOOL_IDS` completely untouched pending canonical ID/category disambiguation. Remains `generic-fallback`.
2. **`retirement-bucket-strategy-planner`** (`batch84c_group3.ts`, `retirement`)
   - **Engine/Contract:** `src/engine/contracts/planners/retirementBucketStrategy.ts` (`RETIREMENT_BUCKET_STRATEGY_CONTRACT`).
   - **Logic:** 3-Bucket asset segmentation (Cash Reserve, Intermediate Income/Bonds, Long-Term Growth), strict 100% split validation, net portfolio withdrawal & initial withdrawal rate calculation, Bucket 1/2/combined near-term runway years, weighted blended expected return, and 10-year Bucket 3 projection.
   - **UI:** `src/components/calculators/RetirementBucketStrategyPlannerCalculator.tsx` (`calctools_retirement_bucket_v1`), CSV/JSON export, Copy, Print, EN/ES localization, illustrative assumptions disclaimer.
3. **`freelance-quarterly-tax-payment-planner`** (`batch84c_group3.ts`, `taxes`)
   - **Engine/Contract:** `src/engine/contracts/planners/freelanceQuarterlyTax.ts` (`FREELANCE_QUARTERLY_TAX_CONTRACT`).
   - **Logic:** Net profit (`max(0, gross - expenses)`), user-configurable effective tax reserve rate (`0%–70%`), recommended monthly set-aside, Q1–Q4 editable installment weights (validated to 100%) and editable due dates, live paid/partial/due status, and remaining balance tracking.
   - **UI:** `src/components/calculators/FreelanceQuarterlyTaxPaymentPlannerCalculator.tsx` (`calctools_freelance_quarterly_tax_v1`), CSV/JSON export, Copy, Print, EN/ES localization, prominent tax planning disclaimer.
4. **`college-tuition-savings-growth-planner`** (`batch84c_group3.ts`, `education`)
   - **Engine/Contract:** `src/engine/contracts/planners/collegeTuitionSavings.ts` (`COLLEGE_TUITION_SAVINGS_PLANNER_CONTRACT`).
   - **Logic:** Multi-year tuition inflation projection across enrollment years, monthly compounding balance accumulation schedule, funding surplus/gap & coverage %, and closed-form analytical solver for `requiredMonthlyContributionToFund` matching per-month accumulation (including 0% return and 0-year edge cases).
   - **UI:** `src/components/calculators/CollegeTuitionSavingsGrowthPlannerCalculator.tsx` (`calctools_college_tuition_planner_v1`), CSV/JSON export, Copy, Print, EN/ES localization, illustrative projection disclaimer.

---

## 6. Wiring, Registry & Test Files Created/Modified

- **Contract Registry:** `src/engine/contracts/planners/index.ts` (`PLANNER_P0_CONTRACTS`, 13 contracts) wired into `src/engine/contracts/allContracts.ts` (`ALL_REGISTERED_CONTRACTS`: 404 -> 417).
- **Routing & Workspace Variants:** `src/components/CalculatorView.tsx`, `src/components/calculator/toolPageVariant.ts` (`PHASE4_NATIVE_WORKSPACE_IDS`).
- **Status Classification:** `src/engine/toolStatus.ts` (`CUSTOM_UI_TOOL_IDS` and `TESTED_PASSING_TOOL_IDS` updated for the 13 verified P0 planners).
- **Automated Test Suites Created:**
  - `src/tests/plannersSubBatchA.test.ts` (13 tests)
  - `src/tests/plannersSubBatchB.test.ts` (8 tests)
  - `src/tests/plannersSubBatchC.test.ts` (5 tests)
  - `src/tests/plannersSubBatchD.test.ts` (9 tests)
- **Catalog Metadata & Non-P0 Tools:** Zero catalog files modified (`4,404` raw / `4,379` unique preserved); zero P1/P2/P3 tools altered.
