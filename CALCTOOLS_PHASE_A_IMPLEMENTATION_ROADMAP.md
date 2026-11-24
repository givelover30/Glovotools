# CALCTOOLS Phase A — Phased Implementation Roadmap (For Phase B / C Authorization)

> **Status:** Proposal Only — Zero production files modified during Phase A.

## Phase B — Non-Breaking Classification & Integrity Foundation
1. **Deduplicate Catalog & Contracts:** Merge or remove the **25 duplicate raw catalog entries** (preserving all first-occurrence canonical IDs and creating alias redirects if any metadata fields diverged) and remove the **2 duplicate registered contracts** (`college-savings-529-calc`, `inventory-turnover-calc`).
2. **Harden `getPrimaryToolHub(calc)`:** Replace unanchored `.includes(...)` substring checks with word-boundary matching and explicit functional rules so the **363 misclassified tools** resolve cleanly to their true primary hubs.
3. **Isolate Static Reference Guides:** Decide whether to introduce a dedicated `References & Guides` hub (21st hub for the **202** `guides` items) or display them cleanly as reference utilities outside `Calculators` / `Trackers` / `Planners`.
4. **Reconcile Orphan Categories & Routes:** Map or promote the **6 orphan categories** (`756` tools) into `CATEGORIES`, resolve the **9 broken `tools` subcategory routes** in `getCategoryBySlug`, and recompute `CategoryMeta.count` over deduplicated unique IDs.

## Phase C — Subcategory Consolidation & Engine Upgrades
1. **Normalize 1,039 Orphan Subcategories:** Map the **2,770 tools** using unlinked `subcategoryId` values into canonical `SUBCATEGORIES` (and populate or archive the **5 empty animal subcategories**).
2. **Upgrade Generic Fallback Tools:** Prioritize replacing the **dynamic 2-parameter fallback** (`CalculationRegistry.ts` lines 100–167) on non-formula tools (`Planners`, `Trackers`, `Validators`, `Checkers`, `Generators`, `Formatters`, `Editors`, `Comparators`) with domain-specific schemas and UIs.
3. **Standardize Natural Names:** Apply the natural professional naming standard across categories and the flagged subcategories while preserving SEO URL slugs via 301/client redirects.

## Phase D — Automated CI Verification
- Enforce unique `calc.id`, unique contract IDs, 100% category/subcategory foreign-key validity, zero broken routes, and 100% hub-category consistency in CI.
