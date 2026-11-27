# PLANNER-IMPLEMENTATION-02 — ARCHITECTURE REPORT

**Program:** GLOVOTOOLS Planners & Organizers Remediation  
**Phase:** P1 Remediation (`PLANNER-IMPLEMENTATION-02`)  
**Scope:** 89 P1 Tools (7 existing partial upgrades + 82 generic placeholders)  
**Date:** 2026-11-26

---

## 1. Architectural Objectives

Phase 2 (P1 Remediation) scales the robust architecture established during P0 (`PLANNER-IMPLEMENTATION-01`) to cover the remaining 89 P1 tools in the Planners & Organizers category (`category === 'planners'`).

The architectural goals are:
1. **Domain-Specific Contracts:** Replace generic 2-parameter synthetic fallback (`CalculationRegistry` preview formulas) with explicit, typed `CalculationContract<TInput, TResult>` implementations for each P1 tool.
2. **Reusable Shared Primitives:** Leverage existing shared infrastructure:
   - `usePlannerStorage.ts` for versioned `localStorage` persistence and corruption recovery.
   - `exportUtils.ts` for RFC 4180 CSV serialization with formula-injection protection and JSON export.
   - `PlannerPrimitives.tsx` (`PlannerHeaderToolbar`, `PlannerDisclaimer`, `PlannerProgressBar`) and `ToolWorkspacePrimitives.tsx`.
3. **Dedicated Interactive Workspaces:** Build modular, task-specific React components under `src/components/calculators/` mapped in `CalculatorView.tsx`, `toolPageVariant.ts`, and `toolStatus.ts`.
4. **Bilingual EN/ES Localization:** Provide complete English and Spanish UI string coverage via `esTranslations.ts`.
5. **Rigorous Test Coverage:** Write independent unit/contract test suites for each implementation batch.

---

## 2. Core Architectural Design Patterns

### A. Contract Structure
Every P1 engine conforms to the standard `CalculationContract` interface:
```ts
export interface CalculationContract<TInput, TResult> {
  id: string;
  name: string;
  category: CategoryId;
  subcategoryId: string;
  isSyntheticFallback: false;
  implementationTier: 'explicit-tested';
  formulaMeta: { formulaName: string; formulaExpression: string; variables: [...] };
  inputSchema: { fields: ToolInputSchemaField[] };
  validate: (inputs: TInput) => CalculationError[];
  calculate: (inputs: TInput) => TResult;
  formatResult: (result: TResult) => FormattedResult;
}
```

### B. State Management & Persistence
All stateful planners use `usePlannerStorage` with unique versioned keys (`calctools_<planner_id>_v1`), ensuring zero state collision between tools, automatic debounced persistence, and clean reset/clear handlers.

### C. CSV & Data Export
Structured planners provide RFC 4180 compliant CSV exports with UTF-8 BOM (`\uFEFF`) and formula-injection neutralization (`=`, `+`, `@`, `\t`, unquoted leading `-`).

---

## 3. Scope Boundaries & Protection Guarantees

1. **P0 Protection:** The 13 P0 tools completed in `PLANNER-IMPLEMENTATION-01` (`project-timeline-planner`, `debt-repayment-planner`, `retirement-planning-calculator`, `freelance-rate-planner`, `wedding-budget-planner`, `fitness-workout-planner`, `meal-prep-planner`, `side-hustle-planner`, `debt-snowball-avalanche-planner`, `cash-flow-forecast-planner`, `retirement-bucket-strategy-planner`, `freelance-quarterly-tax-payment-planner`, `college-tuition-savings-growth-planner`) are strictly locked and protected. Their contracts, components, and tests will not be altered.
2. **Blocked Duplicate ID:** `freelance-client-project-organizer` remains blocked and excluded due to its duplicate catalog ID collision across `business` and `planners`.
3. **Threshold Stability:** Existing catalog counts (`4,404` raw / `4,379` unique) and non-planner routes/modules remain untouched.
