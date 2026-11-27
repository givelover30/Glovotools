# GLOVOTOOLS — TRANSLATION ARCHITECTURE
# Permanent Gemini Development-Time Translation & Static Localization System

## 1. Executive Summary
This document defines the permanent, reusable translation architecture for GLOVOTOOLS using Gemini within Google AI Studio as the development-time translation assistant. The architecture separates development-time generation from production execution: Gemini generates and refines static TypeScript dictionaries during development, while production builds import static TypeScript modules with zero runtime network requests, zero translation APIs, and zero external dependencies.

## 2. Core Architectural Principles
- **Separation of Concerns**: Gemini operates strictly at development time. Production relies exclusively on static dictionaries (`translations.ts`, `esTranslations.ts`, `ptTranslations.ts`, `esignTranslations.ts`, `docConverterTranslations.ts`).
- **Master Language**: English (`en`) serves as the master source language.
- **Supported Targets (8)**: Spanish (`es`), French (`fr`), German (`de`), Italian (`it`), Japanese (`ja`), Simplified Chinese (`zh-CN`), Polish (`pl`), and Brazilian Portuguese (`pt-BR`).
- **Stable Identifiers**: Translation keys and canonical calculator IDs are used as immutable references; never use translated string text as dictionary keys.
- **Calculation Safety**: Calculation formulas, calculation engines, calculation contracts, input schemas, and unit conversion logic remain strictly decoupled from localization dictionaries.

## 3. Directory & File Structure
- `src/i18n/I18nContext.tsx`: Core runtime context providing `t()`, `setLanguage()`, and locale persistence.
- `src/i18n/translations.ts`: Master translation dictionary and dictionary registry.
- `src/i18n/esTranslations.ts`: Spanish and catalog localization dictionaries.
- `src/i18n/ptTranslations.ts`: Brazilian Portuguese dictionary.
- `src/i18n/esignTranslations.ts`: E-sign workspace localization.
- `src/i18n/docConverterTranslations.ts`: Document conversion workspace localization.
- `src/i18n/languageUtils.ts`: Priority language resolution and `localStorage` persistence.

## 4. Development vs. Production Lifecycle
1. **Development**: Add/modify English strings -> Invoke Gemini translation workflow with terminology glossary -> Validate placeholders & types -> Update static dictionary files -> Run test suite & build.
2. **Production**: Client imports static dictionaries -> Zero external runtime dependencies.
