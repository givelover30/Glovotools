# CALCTOOLS — PHASE D3.3 ARCHITECTURE PLAN

## 1. Executive Summary
This architecture plan establishes the technical foundation for migrating the CALCTOOLS 2.0 catalog to a unified canonical taxonomy while maintaining 100% backward compatibility and calculation fidelity.

## 2. Core Architectural Principles
1. **Strict Parent-Child Binding:** Every subcategory belongs to exactly one subject category.
2. **Four-Tier Resolution Hierarchy:** `DIRECT_CANONICAL`, `ALIAS_RESOLVED`, `CATEGORY_FALLBACK`, `UNRESOLVED`.
3. **Fallback Non-Contamination:** Fallback or unresolved classifications never count as successful canonical classifications.
4. **Duplicate Preservation:** All 25 duplicate IDs and 50 raw occurrences are preserved with unique occurrence indexing.

## 3. TypeScript Interface Proposals (Design Reference Only)
```ts
export type ResolutionState = 'DIRECT_CANONICAL' | 'ALIAS_RESOLVED' | 'CATEGORY_FALLBACK' | 'UNRESOLVED';

export interface CanonicalSubcategory {
  id: string;
  name: string;
  categoryId: string;
  slug: string;
}

export interface ResolverResult {
  canonicalId: string;
  state: ResolutionState;
  fallbackUsed: boolean;
}
```
