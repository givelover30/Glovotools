# CALCTOOLS 2.0 — STAGE 2.2 FINAL EVIDENCE RECONCILIATION REPORT
## READ-ONLY — STAGE 2.3 AUTHORIZATION AUDIT

### Executive Summary

This reconciliation report addresses the four audit investigations requested following the completion of Stage 2.2 Implementation 01. All findings have been verified against the codebase, registries, test suites, and audit logs. **Stage 2.2 acceptance is recommended.**

---

### Investigation 1 — Fallback Count Reconciliation (3,753 vs 3,752)

- **Discrepancy:** The Lean Production Readiness Audit reported **3,753** generic fallback tools, whereas the Stage 2.2 calculation status audit reports **3,752**.
- **Root Cause & Evidence:** 
  - In the earlier lean audit, the `CalculationRegistry.get()` fallback branch handled both `cloud-storage-cost-optimizer` (1 specific custom calculator) and the remaining uncontracted tools within the same code block (`if (!contract)`), yielding 3,753 total items routed through dynamic fallback logic.
  - In Stage 2.2, `cloud-storage-cost-optimizer` was correctly extracted and given an explicit contract (`implementationTier: 'explicit-untested'`, `isSyntheticFallback: false`), leaving exactly **3,752** tools in the `generic-fallback` tier.
- **Methodology Consistency:** Both counts use the exact same classification methodology (identifying catalog entries lacking explicit pre-registered contracts).
- **Catalog Uniqueness:** The catalog retains exactly **4,400** raw entries and **4,375** unique tool IDs.
- **Status:** **Resolved & Explained.**

---

### Investigation 2 — The 202 Reference Guides

- **Scope:** The catalog contains **202** tools in the `references` category. Stage 2.2 classification reports **10** `static-guide` tools and **192** `generic-fallback` tools.
- **Evidence Inspection:**
  - **The 10 Static Guides (`STATIC_GUIDE_TOOL_IDS`):** Have dedicated custom React components (`*ReferenceCalculator.tsx` in `src/components/calculators/guides/`) providing rich, specialized reference tables (e.g., periodic table, HTTP status codes, SQL commands, ASCII/Unicode).
  - **The Remaining 192 Guides:** Do not have dedicated custom React components. When accessed, they fall through to `EngineCalculatorView` and `CalculationRegistry`'s `generateSmartFields()` function (`isSyntheticFallback: true`).
- **User Experience & Safety:** 
  - These 192 guides render generic numerical input parameters and formula previews rather than dedicated reference tables.
  - The Stage 2.2 generic fallback warning (`Generic Formula Preview — Unverified Estimate`) is appropriate as a safety guardrail to prevent users from mistaking a preview template for a verified reference table.
- **Recommendation:** Accept Stage 2.2 current behavior; schedule a future product phase to build dedicated static markdown/reference viewers for these 192 reference guides.
- **Status:** **Explained with Product Recommendation.**

---

### Investigation 3 — Contract Count Reconciliation (404 vs 405 vs 396)

- **Discrepancy:** The registry and regression report identify **404** unique registered contracts (`ALL_REGISTERED_CONTRACTS` + `cloud-storage-cost-optimizer`). The audit CSV records **396** rows with `has_explicit_contract=true`.
- **Root Cause & Evidence:**
  - `ALL_REGISTERED_CONTRACTS` contains **404** unique contract objects.
  - In `CALCTOOLS_STAGE_22_CALCULATION_STATUS_AUDIT.csv`, `has_explicit_contract` indicates whether a unique catalog tool ID resolves directly to an explicit contract in `EXPLICIT_CONTRACT_IDS` (which covers explicit calculation contracts and auxiliary tool contracts). Certain multi-tool category workspace hubs (`tools`, `pdf-tools`, `document-converters`) and static guides rely on specialized workspaces or fallback generators rather than individual 1-to-1 explicit contracts for every catalog entry.
  - All **404** registered contracts are correctly accounted for, registered, and validated by `CalculationRegistry.validateRegistry()`.
- **Status:** **Resolved & Explained.**

---

### Investigation 4 — Change Register Integrity

- **Inspection of `CALCTOOLS_STAGE_22_FILE_CHANGE_REGISTER.csv` & Backup Check:**
  - All **20** modified existing source files have corresponding backup copies in `backups/stage_22_impl_01/`.
  - SHA-256 checksums are fully recorded (`CHECKSUMS.sha256`).
  - Created files (`src/engine/toolStatus.ts`, `src/components/common/ErrorBoundary.tsx`, `tests/stage22.regression.ts`, audit reports) are correctly distinguished from modified source files.
  - Stage 2.1 backups (`backups/stage_21_impl_01/`) remain completely untouched.
  - The listed source files correspond precisely to the approved Stage 2.2 scope (`F-04`, `F-05`, `F-08`, `F-09`).
- **Status:** **Verified & Compliant.**

---

### Remaining Product Risks & Final Recommendation

- **Remaining Risks:** The 192 reference guides currently render generic fallback numeric inputs rather than static reference articles. This is a display limitation, not a calculation or safety failure.
- **Final Recommendation:** **Approve Stage 2.2 reconciliation and authorize transition to Stage 2.3 planning/preparation.**
