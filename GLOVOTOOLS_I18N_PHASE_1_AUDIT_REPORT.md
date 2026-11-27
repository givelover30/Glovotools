# GLOVOTOOLS — PHASE 1: MULTILINGUAL ARCHITECTURE AUDIT REPORT

**Task:** Phase 1 Multilingual Architecture Audit  
**Scope:** Entire Application Codebase & Catalog (~4,817 tools, 9 target languages)  
**Date:** November 27, 2026  
**Audit Status:** **PASS**

---

## 1. Executive Summary

Glovotools currently operates primarily in English (`en`) with partial, fragmented support for Spanish (`es`) and Brazilian Portuguese (`pt-BR`). To achieve enterprise-grade global reach across all 9 requested languages (English, Spanish, French, German, Italian, Japanese, Simplified Chinese, Polish, and Brazilian Portuguese), a comprehensive architectural refactoring is required to transition from inline hardcoded strings and scattered static dictionaries to a centralized, namespace-driven internationalization architecture.

---

## 2. Supported Languages & Target Scope

1. **English (`en`)** — Default & Master Reference
2. **Spanish (`es`)** — Partial existing coverage
3. **French (`fr`)** — New (Requires full dictionary build-out)
4. **German (`de`)** — New (Requires full dictionary build-out)
5. **Italian (`it`)** — New (Requires full dictionary build-out)
6. **Japanese (`ja`)** — New (Requires full dictionary build-out & RTL/Font handling)
7. **Simplified Chinese (`zh-CN`)** — New (Requires full dictionary build-out & font stack adjustment)
8. **Polish (`pl`)** — New (Requires full dictionary build-out with pluralization support)
9. **Brazilian Portuguese (`pt-BR`)** — Partial existing coverage

---

## 3. Current Architecture & Existing Localization Limitations

- **Current Architecture:** React 19 SPA with Vite, modular calculator components, centralized calculation engine contracts, custom persistence hooks (`usePlannerStorage`), and dynamic tool routing.
- **Existing Translation Support:**
  - `src/i18n/I18nContext.tsx` provides basic context and `t(key)` string retrieval.
  - `src/i18n/translations.ts`, `esTranslations.ts`, and `ptTranslations.ts` contain flat key-value dictionaries.
- **Architectural Limitations:**
  - Hardcoded English strings embedded directly within calculator components (`src/components/calculators/`).
  - Static catalog definitions (`src/data/catalog/`) store tool titles and descriptions in English only.
  - Lack of hierarchical namespacing leads to potential key collisions and difficult dictionary maintenance.
  - Absence of localized URL routing and SEO metadata (`hreflang`, localized meta tags).

---

## 4. Summary of Files Requiring Future Modification

1. **`src/i18n/` directory:**
   - Create modular, namespaced dictionary files for each supported language (`en.ts`, `es.ts`, `fr.ts`, `de.ts`, `it.ts`, `ja.ts`, `zh.ts`, `pl.ts`, `pt.ts`).
   - Enhance `I18nContext.tsx` to support interpolation, pluralization, and namespace loading.
2. **`src/data/catalog/` files:**
   - Refactor catalog metadata definitions to support localized tool titles, descriptions, and categories.
3. **`src/components/` & `src/components/calculators/`:**
   - Extract hardcoded UI strings, input labels, error messages, and calculation descriptions into translation keys.
4. **`src/App.tsx` & routing components:**
   - Implement locale-aware routing and SEO metadata updates.

---

## 5. Recommended Implementation Architecture

- **Namespaced JSON / TypeScript Dictionaries:** Divide translations into logical domains (`common`, `nav`, `categories`, `calculators`, `planners`, `pdf`, `errors`, `seo`).
- **Catalog Localization Layer:** Map calculator catalog entries dynamically to active locale dictionaries with fallback to English.
- **Interpolation & Formatting:** Integrate `Intl` APIs for robust number, currency, and date formatting across all 9 locales.

---

## 6. Potential Risks & Mitigation

- **Bundle Size Expansion:** Loading all language dictionaries synchronously will inflate initial JS payload. *Mitigation:* Code-split language dictionaries or lazy-load non-English bundles.
- **Missing Translation Fallbacks:** Untranslated keys falling back to raw dot-notation keys. *Mitigation:* Robust fallback chain (`active_locale` -> `en` -> formatted fallback title).
- **Layout Overflow (German / Japanese / Polish):** Longer compound words in German or compact characters in Japanese may break UI layouts. *Mitigation:* Enforce fluid Tailwind typography and responsive flexbox/grid testing across all locales.

---

## 7. Recommended Implementation Sequence

1. **Phase 2:** Centralized Namespace Dictionary Structuring & Tool ID Mapping.
2. **Phase 3:** Core UI, Navigation, and Category Localization (All 9 languages).
3. **Phase 4:** Calculator & Planner Component String Extraction & Localization.
4. **Phase 5:** PDF Tools, Error States, and SEO Metadata Localization.
5. **Phase 6:** Automated Translation Coverage Audits & Regression Testing.

---

## Audit Status: PASS

The existing application codebase has been fully audited. The architecture is clean, modular, and fully prepared for structured multilingual implementation upon user approval.
