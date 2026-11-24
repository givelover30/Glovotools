# CALCTOOLS 2.0 — PHASE D1.1 CATALOG REGRESSION REPORT

## 1. Catalog Invariant & Regression Verification

The complete catalog regression verification was executed against the codebase following Phase D1 Batch 1 implementation.

### 1.1 Verified Invariants

| Invariant | Expected | Actual | Status |
|---|---|---|---|
| Raw Catalog Entries (`CALCULATORS.length`) | 4,400 | 4,400 | **PASS** |
| Unique Tool IDs | 4,375 | 4,375 | **PASS** |
| Duplicate Catalog Entries Untouched | 25 | 25 | **PASS** |
| Primary Hub Override Map Size | 15 | 15 | **PASS** |
| Unique Tool Primary Hub Changes | Exactly 15 | 15 | **PASS** |
| Unchanged Unique Tools | 4,360 | 4,360 | **PASS** |
| Excluded Candidate 1 (`water-intake-calc`) | `Calculators` (2 entries) | `Calculators` (2 entries) | **PASS** |
| Excluded Candidate 2 (`hsa-growth-tax-savings-calc`) | `Counters` | `Counters` | **PASS** |
| Excluded Candidate 3 (`emergency-fund-expense-calc`) | `Document & PDF` | `Document & PDF` | **PASS** |
| Excluded Candidate 4 (`emergency-runway-calc`) | `Document & PDF` | `Document & PDF` | **PASS** |
| Registered Tool Hubs | 21 hubs | 21 hubs | **PASS** |
| Sum of Unique Primary Hub Assignments | 4,375 | 4,375 | **PASS** |
| Sum of Raw Primary Hub Assignments | 4,400 | 4,400 | **PASS** |

---

## 2. Summary of Override Consistency
`BATCH1_PRIMARY_HUB_OVERRIDES` in `/src/data/toolClassification.ts` remains identically preserved with its exact 15 entries. Zero additional tools were modified, and zero production code changes were introduced during Phase D1 Batch 1.1.
