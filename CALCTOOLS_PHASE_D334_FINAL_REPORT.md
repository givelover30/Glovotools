# CALCTOOLS 2.0 — PHASE D3.3.4 PROPOSAL-TO-TOOL ASSIGNMENT RECONSTRUCTION REPORT

- **Phase:** D3.3.4 (Proposal-to-Tool Assignment Reconstruction & Evidence Reconciliation)
- **Mode:** **STRICTLY READ-ONLY — ZERO PRODUCTION MODIFICATIONS**
- **Baseline Snapshot ID:** `d334-snap-eb4688de0064bd33` (Git commit: `NO_GIT_REPO`)
- **Final Verdict:** **PASS WITH LIMITATIONS**

---

## 1. Root Cause of D3.3.3 Discrepancies Resolved

1. **Missing Proposal Consolidated Source IDs in D3.3.3:** The Phase D3.3.3 generator read column index 4 of `CALCTOOLS_PHASE_D32_NEW_SUBCATEGORY_DECISIONS.csv` (which holds integer `affected_tool_count`) instead of column index 4 of `CALCTOOLS_PHASE_D31_NEW_SUBCATEGORY_PROPOSALS.csv` (which holds `consolidated_source_ids`), causing all 76 proposals to match 0 tools.
2. **Valid Registered Tools Misclassified as `MANUAL_REVIEW_REQUIRED`:** Prior D3.3–D3.3.3 eligibility scripts omitted the branch handling `1,546` non-duplicate `Valid — Registered & Parent-Matched` tools, causing them to fall into `MANUAL_REVIEW_REQUIRED` (`4,057`). Those `1,546` already-canonical tools are now properly placed under `APPROVED_EXISTING_MAPPING` with `disposition_subtype = ALREADY_CANONICAL_REGISTERED` and `eligible_for_batch_mutation = FALSE` (distinguished cleanly from the `248` Batch B3 existing-mapping migrations).
3. **QA Matrix Honesty Correction:** `TC-05` now executes actual verification against reconstructed proposal assignments and eligibility counts; `TC-09` and `TC-10` (post-migration formula and browser search tests) have been restored to `PLANNED` alongside `TC-06`–`TC-08` until implementation occurs.

---

## 2. Reconstructed Proposal Assignment Summary (76 Total Proposals)

| Metric | Count | Notes |
|---|---:|---|
| **Verified Approved Proposals** | **72** / 72 | 100% source-evidence verified via `consolidated_source_ids` -> `D22_SUBCATEGORY_SOURCE_INVENTORY` + `D3.2` decisions |
| **Unresolved Approved Proposals** | **0** | Zero unresolved assignments among the 72 approved proposals |
| **Blocked Domain-Approval Proposals** | **4** | `biz-hr-workforce`, `biz-operations-supply-chain`, `health-clinical-diagnostics`, `trans-maritime-rail` |
| **Primary Unique Tools across 72 Approved Proposals** | **1100** | **1096** non-duplicate tools eligible for Batch B4 + **4** duplicate IDs deferred to Batch B6 |
| **Primary Unique Tools across 4 Blocked Proposals** | **107** | **106** non-duplicate tools under `DOMAIN_APPROVAL_REQUIRED` + **1** duplicate ID deferred to Batch B6 |
| **Duplicate Secondary-Only Proposal Overlaps** | **2** | `rolling-element-bearing-l10h-fatigue-life` (occ #2 -> `eng-mechanical-dynamics`) & `adv-quantum-shor-factoring-qubit-requirement` (occ #2 -> `cyber-crypto-network-defense`), deferred to Batch B6 |

### Zero-Subcategory Category Coverage (TC-05 Verified)
- `education-science`: **13** approved proposals covering **256** unique primary tools (**255** B4-eligible + **1** duplicate deferred to B6).
- `developer-it`: **6** approved proposals covering **83** unique primary tools (**82** B4-eligible + **1** duplicate deferred to B6).
- `text-writing`: **3** approved proposals covering **19** unique primary tools (**19** B4-eligible + **0** duplicates).

---

## 3. Seven-Group Unique Tool Eligibility Reconciliation (4,375 Total)

| Eligibility Group | Unique Tools | Breakdown / Disposition Notes |
|---|---:|---|
| `APPROVED_EXISTING_MAPPING` | **1794** | `1,546` already-canonical registered (no mutation) + `248` D3.2.1 approved B3 mappings (`141` MAP + `107` ALIAS) |
| `APPROVED_NEW_SUBCATEGORY` | **1096** | Non-duplicate tools across the `72` verified approved proposals (Batch B4 scope) |
| `DOMAIN_APPROVAL_REQUIRED` | **106** | Non-duplicate tools across the `4` blocked domain-approval proposals |
| `APPROVED_PARENT_CORRECTION` | **12** | D3.2.2 approved deterministic parent/subcategory fixes (Batch B5 scope) |
| `PARENT_CORRECTION_UNRESOLVED` | **33** | D3.2.2 `MANUAL_REVIEW` parent mismatches (including `battery-bank-capacity-runtime-calculator`) |
| `MANUAL_REVIEW_REQUIRED` | **1309** | `1,300` non-duplicate tools from `263` manual-review IDs + `9` non-duplicate `LEGACY_OR_INVALID` tools |
| `DUPLICATE_REVIEW_REQUIRED` | **25** | All `25` duplicate tool IDs (`50` raw occurrences; secondary overlaps flagged) |
| **TOTAL UNIQUE TOOLS** | **4375** | **100% mutually exclusive & reconciled to 4,375** |

---

## 4. Duplicate & Occurrence Identity Verification

- **Raw Catalog Records:** **4400** (`CALCULATORS.length === 4400`).
- **Unique Tool IDs:** **4375**.
- **Duplicate IDs / Raw Duplicate Occurrences:** **25** IDs / **50** raw occurrences (**0** ordering mismatches vs `CALCTOOLS_PHASE_D22_DUPLICATE_SUBCATEGORY_AUDIT.csv`).
- **Secondary Raw-Only Edge Case:** `pdf-metadata-editor` occ #2 (`batch82d_group6.ts:252`) preserves `raw_subcategoryId = "metadata"`.
- **Identity Stability Boundary:** Each raw record carries a reproducible identity `d334-snap-eb4688de0064bd33::idx_<raw>::<tool_id>::occ_<1|2>` plus a 16-hex SHA-256 content prefix and duplicate `source_location`. Because **2 duplicate pairs** have byte-identical metadata across both occurrences and **23 pairs** rely on array scan order for `occ_1` vs `occ_2`, occurrence indices are **strictly bound to the immutable baseline snapshot order and are NOT permanently invariant if catalog arrays are reordered** without assigning persistent occurrence IDs.

---

## 5. QA Execution Summary & Migration Batch Plan

- **QA Matrix (`10` Total Test Cases):** **5 `EXECUTED_PASS`** (`TC-01` through `TC-05`) and **5 `PLANNED`** (`TC-06` through `TC-10` for unimplemented resolver and post-migration formula/UI regression checks).
- **Migration Batches (`B0`–`B9`):** All **10** batches remain strictly locked at **`PENDING_APPROVAL`**. Batch **B4** is scoped exclusively to the **1096** non-duplicate verified tools across the 72 approved proposals. No batches have been authorized or executed.

---

## 6. Remaining Evidence Limitations & Final Verdict

1. **Blocked Governance Queues:** `4` domain-approval proposals (`107` primary tools), `33` parent-mismatch cases (including `battery-bank-capacity-runtime-calculator`), `263` manual-review identifiers (`1,306` primary tools), and `9` `LEGACY_OR_INVALID` identifiers (`9` tools) remain unresolved pending human taxonomy governance.
2. **Duplicate Occurrence Reorder Sensitivity:** Duplicate occurrence disambiguation depends on the immutable baseline `CALCULATORS` array order until Batch B6 assigns persistent occurrence identifiers.
3. **Unimplemented Runtime Components:** Resolver states (`TC-06`–`TC-08`) and post-migration functional/E2E tests (`TC-09`–`TC-10`) remain `PLANNED` until migration batches are authorized.

**Final Verdict:** **`PASS WITH LIMITATIONS`**. All Phase D3.3.4 evidence files are reconstructed, verified, and reconciled to 4,375 unique tools / 4,400 raw occurrences with **zero production modifications**. Stopping to await human review.
