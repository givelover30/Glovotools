# GLOVOTOOLS — SPANISH HOMEPAGE LOCALIZATION DEFECT INVESTIGATION
# Read-Only Investigation Report

## 1. Executive Summary
This report documents a read-only investigation into remaining English text appearing on the Spanish homepage (`/es/`), specifically targeting calculator titles (*Merge PDF Files*, *Secure Password & Passphrase Generator*, *JSON Syntax & Structure Validator*, *Group Restaurant Bill & Tax Split Calculator*, *Monthly Budget & Expenses*), category descriptions, and category names (*Science & Education*, *Developer & IT Infrastructure*, *Guides & References*, *Checkers & Validators*, *Additional Tools & Utilities*). In accordance with strict read-only restrictions, no code changes or dictionary updates were performed.

---

## 2. Confirmed Root Causes

### Root Cause A: Naive Regex Replacement Fallback for Unoverridden Calculators
- **Mechanism**: In `/src/i18n/esTranslations.ts`, the function `getLocalizedCalculator(calc, language)` checks `ES_CALCULATOR_OVERRIDES[calc.id]`. If a specific calculator ID is absent from `ES_CALCULATOR_OVERRIDES`, the function falls back to a naive string replacement (`calc.name.replace(/Calculator/gi, 'Calculadora')...`).
- **Impact**: 
  1. Calculators whose English titles do not contain the exact substrings "Calculator", "Solver", or "Converter" (e.g., *Merge PDF Files*, *Secure Password & Passphrase Generator*, *JSON Syntax & Structure Validator*, *Monthly Budget & Expenses*) undergo zero translation and remain entirely in English.
  2. Calculators containing "Calculator" but phrased differently (e.g., *Group Restaurant Bill & Tax Split Calculator*) result in ungrammatical hybrid strings (*Group Restaurant Bill & Tax Split Calculadora*).

### Root Cause B: Missing Dictionary Keys for Category IDs (`cat.*` and `cat.desc.*`)
- **Mechanism**: In `/src/i18n/translations.ts`, `getLocalizedCategory(cat, language)` looks up category keys via `'cat.' + cat.id` and description keys via `'cat.desc.' + cat.id` in `TRANSLATIONS.es`.
- **Impact**: If category IDs such as `science-education`, `developer-it`, `guides`, `checkers`, or `utilities` lack corresponding entries in `ES_UI_STRINGS`, the function falls back to `cat.title` and `cat.description` in English, causing homepage category cards to display English descriptions and titles.

---

## 3. Affected Source Files & Components
- **Source Files**:
  - `/src/i18n/esTranslations.ts` (`getLocalizedCalculator`, `ES_CALCULATOR_OVERRIDES`)
  - `/src/i18n/translations.ts` (`getLocalizedCategory`)
  - `/src/components/HomePage.tsx`
  - `/src/components/PopularCalculators.tsx`
- **Components**: Homepage hero, Popular Tools section, Category grid cards, and tool card listings.

---

## 4. Affected Translation Keys & Calculator IDs
- **Calculator IDs**:
  - `merge-pdf` (*Merge PDF Files*)
  - `secure-password-generator` (*Secure Password & Passphrase Generator*)
  - `json-validator` (*JSON Syntax & Structure Validator*)
  - `restaurant-bill-split` (*Group Restaurant Bill & Tax Split Calculator*)
  - `monthly-budget` (*Monthly Budget & Expenses*)
- **Category Keys**:
  - `cat.science-education` / `cat.desc.science-education` (*Science & Education*)
  - `cat.developer-it` / `cat.desc.developer-it` (*Developer & IT Infrastructure*)
  - `cat.guides` / `cat.desc.guides` (*Guides & References*)
  - `cat.checkers` / `cat.desc.checkers` (*Checkers & Validators*)
  - `cat.utilities` / `cat.desc.utilities` (*Additional Tools & Utilities*)

---

## 5. Existence of Translations
- **Status**: The specific tool override entries in `ES_CALCULATOR_OVERRIDES` and category translation keys in `ES_UI_STRINGS` for these specific items are missing or incomplete in the current Spanish static dictionaries.

---

## 6. Recommended Minimal Corrections
1. **Expand Calculator Overrides**: Add explicit translation entries to `ES_CALCULATOR_OVERRIDES` in `esTranslations.ts` for all catalog tools lacking "Calculator", "Solver", or "Converter" in their names.
2. **Complete Category Dictionary Keys**: Add missing `cat.{id}` and `cat.desc.{id}` key-value pairs to `ES_UI_STRINGS` for all category hubs.
3. **Refactor Fallback Logic**: Replace naive regex replacement in `getLocalizedCalculator` with a dictionary-driven lookup model (`TRANSLATIONS.es` or explicit overrides) to prevent hybrid English/Spanish titles.

---

## 7. Risks & Required Regression Tests
- **Risks**: Modifying `ES_CALCULATOR_OVERRIDES` or `esTranslations.ts` could introduce key collisions or type errors if keys do not match canonical calculator IDs.
- **Regression Tests**:
  - Run `catalogLocalizationPhase4A.test.ts` to verify 100% catalog localization coverage.
  - Run `calculatorWorkspaceMassPhase4B.test.ts` to verify calculation registry integrity.
  - Run `tsc --noEmit` and `npm run build`.
