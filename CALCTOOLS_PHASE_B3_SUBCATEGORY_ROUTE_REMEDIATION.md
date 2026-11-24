# CALCTOOLS Phase B3 — Subcategory & Route Integrity Remediation Plan

## 1. Scope of Findings
- **Orphan Subcategory Identifiers:** 1,039 unlinked `subcategoryId` strings found across **2,770** unique tools.
- **Broken Subcategory Routes:** All 9 subcategories under `categoryId: "tools"` fail route resolution because `getCategoryBySlug("tools")` maps to `"additional-tools"` while subcategory lookups expect `categoryId === "tools"`.

## 2. Safe Remediation Proposal
1. **Fix Route Lookup Helper:** Update `getCategoryBySlug` and `getSubcategoryBySlug` in `src/data/calculators.ts` to support both `'tools'`, `'additional-tools'`, and `'developer-tools'` bidirectionally without route breakage.
2. **Dynamic Subcategory Fallback:** For tools referencing unlinked subcategory IDs, render a dynamic default subcategory group titled after the parent category rather than crashing or displaying empty screens.
3. **Zero Data Loss:** Do not delete or modify existing tool records or subcategory IDs.
