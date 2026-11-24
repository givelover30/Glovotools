# CALCTOOLS 2.0 — Phase A: Master Functional Classification & Taxonomy Audit

## 1. Audit Scope & Verification Evidence
- **Mode:** Strictly Read-Only Inspection & Documentation (zero production source files modified).
- **Raw Catalog Records Inspected:** 4,400
- **Unique Tool IDs Audited Individually:** 4,375 (100% coverage; zero sampling)
- **Duplicate Raw Records Audited:** 25 (with full field-level diff log)
- **Tool Hubs Audited:** 20
- **Canonical Subject Categories Audited:** 49 (+ 6 orphan categories discovered across 756 tools)
- **Canonical Subcategories Audited:** 492 (+ 1,039 orphan subcategory IDs discovered across 2,770 tools)
- **Custom UI Components Inspected:** 174 `.tsx` files mapped to 197 `CalculatorView.tsx` switch cases (plus `ToolsWorkspace`, `PdfToolsWorkspace`, and `DocumentConvertersWorkspace`)
- **Calculation Contracts Inspected:** 406 entries in `ALL_REGISTERED_CONTRACTS` (404 unique IDs) + `CalculationRegistry.get` dynamic contract generator

## 2. Final Audit Summary Metrics (Section 9)
- **Total unique tools inspected:** 4,375
- **Total tools classified with high confidence:** 2,555 (58.40%; remaining 1,820 [41.60%] are Medium confidence)
- **Total tools flagged for manual review:** 2,253 unique tools in `CALCTOOLS_PHASE_A_AMBIGUOUS_TOOLS_REGISTER.csv` (1,701 with `REVIEW` action [433 High + 1,268 Medium] plus 552 Medium-confidence KEEP/RECLASSIFY verifications)
- **Total proposed primary hub corrections:** 363
- **Total subject-category corrections:** 759 (including 756 tools in 6 orphan categories + 3 miscategorized engineering calculators in `converter`)
- **Total subcategory naming corrections / flags:** 48 canonical subcategory naming/empty flags (+ 1,039 orphan subcategory IDs affecting 2,770 tools)
- **Total invalid hub-category associations:** 74
- **Total valid hub-category associations:** 209
- **Total categories reviewed:** 49 canonical + 6 orphan (55 total)
- **Total subcategories reviewed:** 492 canonical (+ 1,039 orphan IDs cataloged)

## 3. Unresolved Architectural Issues Identified (For Phase B Decision)
1. **3,753 Dynamic Engine Fallback Tools:** `EngineCalculatorView` routes 3,753 unique IDs through `CalculationRegistry.get`'s generic 2-numeric-parameter evaluation fallback (`baseAmount/rateOrFee`, `numeratorVal/denominatorVal`, or `primaryParam/secondaryParam`). For non-numerical hubs (`Trackers`, `Planners`, `Validators`, `Checkers`, `Editors`, `Formatters`, `Generators`), runtime execution currently behaves as a 2-number formula calculator rather than a specialized interactive tool — documented explicitly in `CALCTOOLS_PHASE_A_AMBIGUOUS_TOOLS_REGISTER.csv`.
2. **202 Static `Guides & References` Entries:** No `References & Guides` hub exists in `TOOL_HUBS`, scattering 202 static guides across 9 operational hubs (`Calculators`: 160, `Business & Management`: 21, `Trackers`: 7, etc.).
3. **756 Tools in 6 Orphan Subject Categories & 2,770 Tools in 1,039 Orphan Subcategories:** Invisible in standard `CATEGORIES` / `SUBCATEGORIES` navigation.
4. **9 Broken Subcategory Routes in `tools`:** `getCategoryBySlug("tools")` aliases `"tools"` to `"additional-tools"`, breaking `getSubcategoryBySlug("tools", s.slug)`.
5. **25 Duplicate Catalog Entries & 2 Duplicate Contracts:** Including divergent metadata between duplicate copies.

## 4. Before-and-After Proposed Mappings Across All 20 Tool Hubs

| # | Tool Hub | Existing Unique Tools | Proposed Unique Tools | Delta | Existing Cat Assocs | Valid Assocs | Invalid Assocs | Proposed Cat Assocs |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Calculators | 2,125 | 2,380 | +255 | 41 | 39 | 2 | 41 |
| 2 | Converters | 191 | 193 | +2 | 16 | 15 | 1 | 16 |
| 3 | Generators | 167 | 168 | +1 | 9 | 7 | 2 | 10 |
| 4 | Planners | 246 | 204 | -42 | 24 | 14 | 10 | 13 |
| 5 | Trackers | 279 | 182 | -97 | 22 | 13 | 9 | 10 |
| 6 | Counters | 44 | 16 | -28 | 13 | 9 | 4 | 7 |
| 7 | Analyzers | 58 | 58 | 0 | 11 | 10 | 1 | 11 |
| 8 | Checkers | 149 | 140 | -9 | 13 | 6 | 7 | 9 |
| 9 | Validators | 71 | 69 | -2 | 8 | 8 | 0 | 9 |
| 10 | Estimators | 113 | 119 | +6 | 17 | 17 | 0 | 19 |
| 11 | Finders | 41 | 41 | 0 | 9 | 9 | 0 | 11 |
| 12 | Comparators | 34 | 16 | -18 | 16 | 8 | 8 | 10 |
| 13 | Optimizers | 112 | 114 | +2 | 8 | 8 | 0 | 10 |
| 14 | Simulators | 79 | 78 | -1 | 9 | 9 | 0 | 10 |
| 15 | Testers | 76 | 53 | -23 | 14 | 7 | 7 | 6 |
| 16 | Document & PDF | 118 | 54 | -64 | 17 | 4 | 13 | 2 |
| 17 | Editors | 37 | 31 | -6 | 4 | 2 | 2 | 3 |
| 18 | Formatters | 55 | 48 | -7 | 7 | 4 | 3 | 5 |
| 19 | Organizers | 25 | 21 | -4 | 11 | 10 | 1 | 14 |
| 20 | Business & Management | 355 | 390 | +35 | 14 | 10 | 4 | 11 |
| **Total** | **20 Hubs** | **4,375** | **4,375** | **0** | **283** | **209** | **74** | **227** |

## 5. Complete Deliverable Index
1. `CALCTOOLS_PHASE_A_MASTER_CLASSIFICATION_AUDIT.md`
2. `CALCTOOLS_PHASE_A_TOOL_CLASSIFICATION_INVENTORY.csv`
3. `CALCTOOLS_PHASE_A_TOOL_HUB_MAPPING_REPORT.md`
4. `CALCTOOLS_PHASE_A_SUBJECT_CATEGORY_MAPPING_REPORT.md`
5. `CALCTOOLS_PHASE_A_SUBCATEGORY_NAMING_REPORT.md`
6. `CALCTOOLS_PHASE_A_MISCLASSIFICATION_REGISTER.csv`
7. `CALCTOOLS_PHASE_A_AMBIGUOUS_TOOLS_REGISTER.csv`
8. `CALCTOOLS_PHASE_A_RECOMMENDED_TAXONOMY.md`
9. `CALCTOOLS_PHASE_A_DATA_INTEGRITY_REPORT.md`
10. `CALCTOOLS_PHASE_A_IMPLEMENTATION_ROADMAP.md`
