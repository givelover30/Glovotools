# GLOVOTOOLS — GEMINI TRANSLATION WORKFLOW
# Development-Time Translation & Integration Workflow

## 1. Overview
This workflow defines how developers use Gemini within Google AI Studio as a development-time assistant to translate new or updated English content into all eight target languages (`es`, `fr`, `de`, `it`, `ja`, `zh-CN`, `pl`, `pt-BR`) and integrate the results into static TypeScript dictionaries.

## 2. Step-by-Step Developer Workflow
1. **Identify Changes**: Add or modify English source strings in components, catalog data, or translation keys.
2. **Consult Glossary**: Reference `GLOVOTOOLS_TRANSLATION_GLOSSARY.md` for approved domain-specific terms.
3. **Prompt Gemini**: Provide Gemini with the English source text, key name, domain, and target language codes referencing the glossary rules.
4. **Review & Validate**: Verify interpolation placeholders (`{value}`), mathematical symbols, and CJK/diacritic integrity.
5. **Update Static Dictionaries**: Insert generated translations into `translations.ts`, `esTranslations.ts`, or dictionary modules.
6. **Run Quality Gates**: Execute `npx vitest run`, `npx tsc --noEmit`, and `npm run build`.
7. **Commit**: Commit updated static dictionary files to version control.
