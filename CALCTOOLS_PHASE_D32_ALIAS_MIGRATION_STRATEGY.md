# CALCTOOLS — PHASE D3.2 ALIAS & MIGRATION STRATEGY

## 1. Architectural Evaluation
Four architectural options for backward-compatible normalization were evaluated:
- **Option A:** Direct replacement in tool records (High risk of breaking legacy bookmarks).
- **Option B:** External lookup layer (High runtime overhead).
- **Option C (Recommended):** **Normalize tool records to canonical IDs while retaining a separate, explicit legacy alias registry.**

## 2. Recommended Migration Architecture
1. **Canonical Registry (`SUBCATEGORIES`):** Primary store of verified subcategories.
2. **Legacy Alias Registry (`SUBCATEGORY_ALIAS_MAP`):** Explicit mapping from legacy/unregistered `subcategoryId` strings to canonical IDs.
3. **Lookup Precedence:**
   - Check if `subcategoryId` exists in `SUBCATEGORIES`.
   - If missing, check `SUBCATEGORY_ALIAS_MAP`.
   - If missing, fall back to default category-level classification.
4. **Duplicate Alias Handling:** Explicit tie-breaking rules based on parent category matching.
5. **Route Compatibility:** Preserve existing URL slugs and redirect legacy query parameters.
