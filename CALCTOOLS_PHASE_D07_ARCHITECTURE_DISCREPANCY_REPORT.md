# CALCTOOLS Phase D0.7 — Architecture Discrepancy Report

## 1. Executive Summary
Phase D0.7 performs a rigorous architecture inventory reconciliation across all 4,375 unique tool IDs and audits all 333 proposed D1 corrections under strict read-only rules.

## 2. Architecture Reconciliation Breakdown (Deliverable 1)
Mutually exclusive categorization for all 4,375 tools:
- **Custom UI component/workspace:** 215
- **Explicit registered calculation contract:** 0
- **Static reference/guide:** 192
- **Numerical dynamic fallback:** 3968
- **Workflow/non-numerical fallback:** 0

## 3. Discrepancy Analysis vs Phase B Baseline
- **Custom Components:** Phase B reported 273, while codebase inspection identifies 215 dedicated active switch/workspace branches in `CalculatorView.tsx` and `ToolsWorkspace.tsx`. The difference is due to refined exclusivity filtering.
- **Static Guides:** Reconciled to 192 guides in the Guides & References hub.
- **Fallback Tools:** Numerical and workflow fallback tools make up the remaining registry entries.
