# CALCTOOLS — PHASE D3.2.2 ALIAS RESOLVER SPECIFICATION REFINEMENT

## A. Stable Identity for Duplicate Raw Occurrences
- **Duplicate Handling:** All 25 duplicate tool IDs (50 raw occurrences) are assigned a composite stable identifier `toolId::occurrenceIndex` (e.g., `pdf-metadata-editor::1` and `pdf-metadata-editor::2`).
- **Metadata Divergence Tracking:** Where secondary raw occurrences introduce divergent subcategory assignments or raw-only strings (e.g., `pdf-metadata-editor` occurrence #2 using `"metadata"`), the resolver binds the occurrence explicitly to its catalog source index to prevent silent route collisions.

## B. Exact Registry Schema for Category-Scoped Aliases
```ts
interface CategoryScopedAlias {
  subcategoryId: string;          // Original raw or alias string
  canonicalId: string;            // Resolved canonical subcategory ID
  parentCategory: string;         // Verified subject category ID
  scope: 'GLOBAL' | 'SCOPED';     // Scope constraint
}
const SUBCATEGORY_ALIAS_MAP: Record<string, CategoryScopedAlias> = { ... };
```

## C. Deterministic Alias Collision Precedence
When an alias string (e.g., `structural`, `security`, `hydraulics`) appears across multiple subject categories:
1. **Precedence Rule 1 (Exact Parent Match):** If the tool's subject category matches the alias entry's parent category, resolve immediately.
2. **Precedence Rule 2 (Explicit Scoped Key):** If ambiguous, query category-prefixed lookup `categoryId::subcategoryId`.
3. **Precedence Rule 3 (Category Default Fallback):** If unresolved, fall back to the subject category's primary registered subcategory.

## D. Classification Resolution States (Four-Tier Taxonomy)
1. **DIRECT_CANONICAL:** `subcategoryId` exists directly in `SUBCATEGORIES` under the correct parent category.
2. **ALIAS_RESOLVED:** `subcategoryId` resolved successfully via `SUBCATEGORY_ALIAS_MAP` with verified parent match.
3. **CATEGORY_FALLBACK:** `subcategoryId` is unregistered, malformed, or ambiguous, falling back to category-level default routing.
4. **UNRESOLVED:** Identifier is missing, conflicting, or requires manual review gating.

## E. Diagnostic Reporting & Failsafe Rules
- **Diagnostic Logging:** Every `CATEGORY_FALLBACK` or `UNRESOLVED` resolution emits a structured warning payload `[TaxonomyResolver] Warning: Tool {id} used unresolvable subcategoryId {sub} under category {cat}.`.
- **Strict Success Metric:** Fallback resolutions are **never** counted as successful canonical classifications in catalog analytics or SEO coverage metrics.

## F. Migration & Rollback Verification
- **Verification Suites:** Automated test harness verifying 100% resolution of all 4,375 unique tools and 50 raw duplicate occurrences.
- **Rollback Procedure:** Instant switch-back via feature flag reverting resolver to legacy raw property getters.
