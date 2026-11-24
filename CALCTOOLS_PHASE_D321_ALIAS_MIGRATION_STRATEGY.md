# CALCTOOLS — PHASE D3.2.1 ALIAS & MIGRATION STRATEGY SPECIFICATION

## 1. Architectural Design Overview (Option C)
Phase D3.2.1 establishes **Option C** as the formal backward-compatible migration architecture: **Normalize tool records to canonical IDs while retaining a separate, explicit legacy alias registry.**

## 2. Detailed Registry & Lookup Specifications

### A. Canonical Registry Structure (`SUBCATEGORIES`)
- Contains verified subcategories, each bound to exactly one subject category.
- Primary source of truth for all active UI routing, filtering, and breadcrumbs.

### B. Legacy Alias Registry Structure (`SUBCATEGORY_ALIAS_MAP`)
- Maps legacy/unregistered `subcategoryId` string -> `{ canonicalId: string, parentCategory: string }`.
- Supports all 36 `ALIAS_TO_EXISTING` mappings and legacy slug aliases.

### C. Parent-Aware Alias Resolution Algorithm
1. **Direct Canonical Check:** Inspect if `tool.subcategoryId` exists in `SUBCATEGORIES` under `tool.category`.
2. **Alias Table Resolution:** If not found directly, query `SUBCATEGORY_ALIAS_MAP[tool.subcategoryId]`.
3. **Parent-Category Validation:** Verify that the resolved canonical subcategory's parent category strictly matches `tool.category`. If a cross-category alias conflict occurs, fall back to the tool's subject category default.
4. **Ambiguous Alias Handling:** Identifiers appearing in multiple parent categories require category-scoped alias entries (`categoryId::subcategoryId`).

### D. Unknown & Duplicate Identifier Behavior
- **Unknown Identifiers:** If a `subcategoryId` resolves to neither canonical nor alias registries, the system logs a diagnostic warning and defaults to the subject category's primary fallback or general view without breaking runtime rendering.
- **Duplicate Alias Handling:** When two duplicate raw occurrences (`PDFMetadataEditor`) diverge in metadata (e.g., occurrence #1 uses `p25-sub-edit`, occurrence #2 uses `"metadata"`), both raw records are preserved; explicit indexing maps each occurrence to its verified target.

### E. Route Compatibility & Search Integration
- **URL Routes:** Existing calculator routes (`/calculator/:id`) remain fully unaffected. Category and subcategory browse routes (`/category/:cat/subcategory/:sub`) resolve via the canonical lookup layer.
- **Search & Filtering:** Global search and category filtering index canonical subcategories while preserving keyword matching against legacy aliases.

### F. Migration Ordering, Rollback & Acceptance Criteria
1. **Migration Phase 1:** Deploy alias mapping module in read-only resolver mode.
2. **Migration Phase 2:** Normalize tool definitions in batch updates.
3. **Rollback Procedure:** Revert tool catalog pointers while maintaining the alias registry as a fallback layer.
4. **Acceptance Criteria:** 100% test coverage on subcategory resolution, zero broken routes, and zero build errors.
