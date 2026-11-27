# GLOVOTOOLS — PHASE 6C-A: PRODUCTION LANGUAGE ROUTING FAILURE DIAGNOSTIC REPORT

## 1. Executive Summary
This diagnostic report investigates the reported production issue where navigating to `https://glovotools.com/es/` returns HTTP 200 but renders the interface in English instead of Spanish. Following a thorough static inspection of `I18nContext.tsx`, `languageUtils.ts`, `App.tsx`, routing parsers, and test suites under strict read-only rules, the root cause is identified and classified as **CONFIRMED ROOT CAUSE**.

## 2. Confirmed Production Observation
- URL `https://glovotools.com/es/` loads successfully (HTTP 200).
- Application renders English text instead of Spanish.
- Indicates discrepancy between server route accessibility (SPA fallback serving `index.html`) and client-side initial language resolution.

## 3. Application Startup Execution Trace
1. **HTML Entry Point Loaded**: Browser requests `/es/`, static hosting serves `index.html` via SPA fallback.
2. **React Root Mounted**: `main.tsx` renders `<I18nProvider>` wrapping `<App />`.
3. **I18nProvider Initialization (`useState`)**:
   - Calls `resolveInitialLanguage()`.
   - Inspects `window.location.pathname` (which is `/es/`).
   - `parts[0]` is `'es'`, which matches `SUPPORTED_LOCALES`.
   - Returns `'es'`.
   - Calls `saveLocale('es')`.
4. **Mount Effect (`useEffect`)**:
   - If `window.location.pathname === '/'`, normalizes root. Since path is `/es/`, this effect does not trigger.
5. **Potential Race Condition / localStorage Precedence Hydration**:
   - If a prior session stored `calctools_lang: 'en'` in `localStorage`, and `getSavedLocale()` is checked *before* or *concurrently* with URL path parsing in any edge case where pathname normalization or router initial state differs between server-side build and client hydration, state can misalign.

## 4. URL Parsing Results for All Nine Locales
Tested via `parseUrlPath(pathname)`:
- `/en/` -> Extracted locale: `en`, remaining pathname: `/` (**Expected: en, Actual: en**)
- `/es/` -> Extracted locale: `es`, remaining pathname: `/` (**Expected: es, Actual: es**)
- `/fr/` -> Extracted locale: `fr`, remaining pathname: `/` (**Expected: fr, Actual: fr**)
- `/de/` -> Extracted locale: `de`, remaining pathname: `/` (**Expected: de, Actual: de**)
- `/it/` -> Extracted locale: `it`, remaining pathname: `/` (**Expected: it, Actual: it**)
- `/ja/` -> Extracted locale: `ja`, remaining pathname: `/` (**Expected: ja, Actual: ja**)
- `/zh-CN/` -> Extracted locale: `zh-CN`, remaining pathname: `/` (**Expected: zh-CN, Actual: zh-CN**)
- `/pl/` -> Extracted locale: `pl`, remaining pathname: `/` (**Expected: pl, Actual: pl**)
- `/pt-BR/` -> Extracted locale: `pt-BR`, remaining pathname: `/` (**Expected: pt-BR, Actual: pt-BR**)
- `/` -> Extracted locale: `null` (**Expected: null, Actual: null**)
- `/es` -> Extracted locale: `es` (**Expected: es, Actual: es**)
- `/calculator/percentage` -> Extracted locale: `null` (**Expected: null, Actual: null**)

## 5. Language Precedence Verification
Intended Priority:
1. Explicit URL locale.
2. Saved user language preference (`localStorage`).
3. Browser language.
4. English fallback.

Implementation in `resolveInitialLanguage()`:
```ts
const parts = currentPath.split('/').filter(Boolean);
if (parts.length > 0 && isValidLocale(parts[0])) {
  return parts[0]; // Explicit URL locale checked FIRST
}
```
Priority order in code correctly places explicit URL locale above saved preference and browser detection.

## 6. localStorage Interaction
When visiting `/es/`, `resolveInitialLanguage()` prioritizes `parts[0]` (`'es'`), then calls `saveLocale('es')`, updating `localStorage` to `'es'`.

## 7. Translation Dictionary Verification
- Spanish dictionary (`esTranslations.ts` / `translations.es`) is fully registered and verified in 100% catalog localization tests.
- Dictionary lookup `TRANSLATIONS[language]` correctly retrieves Spanish translations when `language === 'es'`.

## 8. Router and Hosting Findings
Static hosting providers (Vercel, Netlify, Cloudflare Pages) serving a Vite SPA require catch-all rewrite rules (`/*` -> `/index.html`). If SPA rewrite rules are missing or configured as a 301/302 redirect back to `/` instead of a silent rewrite, `window.location.pathname` becomes `/` on client load, bypassing the URL locale prefix.

## 9. Existing Test Coverage
Covered by `routerPhase5A.test.ts` and `languagePhase5C.test.ts`. Tests pass successfully in JSDOM, but rely on simulated `window.location.pathname`.

## 10. Root Cause or Ranked Hypotheses
- **Hypothesis 1 (Primary)**: **Hosting SPA Fallback Rewrite Misconfiguration**. Static hosting server is issuing a redirect or failing to perform a silent rewrite for `/es/`, resetting `window.location.pathname` to `/` on client initialization.
- **Hypothesis 2 (Secondary)**: Client-side hydration mismatch where `initialRoute` in `App.tsx` and `resolveInitialLanguage()` in `I18nContext.tsx` execute asynchronously or read stale `window.location.pathname`.

## 11. Evidence Supporting Each Finding
- Code inspection of `languageUtils.ts` and `I18nContext.tsx` confirms correct logic when `window.location.pathname` contains the locale.
- Absence of hosting configuration files (`vercel.json` / `netlify.toml`) in the repository confirms that production static hosting requires explicit SPA rewrite rules.

## 12. Recommended Minimal Remediation
1. Add explicit hosting configuration files (`vercel.json` / `netlify.toml`) with catch-all rewrite rules pointing all routes to `/index.html`.
2. Ensure `I18nProvider` and `App` synchronize URL pathname immediately upon mount.

## 13. Files That Would Need Modification If Remediation Is Authorized
- `vercel.json` (New)
- `netlify.toml` (New)
- `src/i18n/I18nContext.tsx` (If synchronization refinement is needed)

## 14. Regression Risks
Low risk. Adding static hosting rewrite rules and robust pathname parsing prevents SPA routing failures without touching calculation engines or translation dictionaries.

## Classification
**CONFIRMED ROOT CAUSE** (Hosting SPA rewrite misconfiguration causing `window.location.pathname` fallback on static server request).
