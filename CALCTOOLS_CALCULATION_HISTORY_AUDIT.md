# CALCTOOLS — CALCULATION HISTORY FEATURE SECURITY, PRIVACY & FUNCTIONALITY AUDIT REPORT
## READ-ONLY AUDIT — IMPLEMENTATION REVIEW

### Executive Summary

This audit evaluates the newly implemented Calculation History feature across security, privacy compliance, functionality, browser safety, and performance. Overall, the implementation is robust, client-side secure, resilient against malformed storage, and optimized with debounce timers. However, one documentation gap was identified in the draft Privacy Policy (`PrivacyPage.tsx`), along with two minor enhancements (disabling auto-recording option and explicit clear confirmation) recommended for a future release.

---

### Investigation 1 — Privacy Audit

- **Stored Data Structure:** Each history record stores `id`, `calculatorId`, `calculatorName`, `timestamp`, `inputs` (key-value pairs of user inputs), and `primaryResult` (`label`, `value`).
- **Sensitive Information Risk:** Because CalcTools includes financial, health, medical, and tax calculators, sensitive numerical parameters (e.g., loan amounts, health metrics, salaries) are stored in plain text inside browser `localStorage`.
- **Default State:** Automatic recording is enabled by default upon successful calculation.
- **User Control & Disabling:** **Finding (Low Severity):** There is currently no UI toggle or setting allowing users to disable automatic recording of calculation history (only a manual clear button is provided).
- **Clearing History:** The clear history action (`CalculationHistoryService.clearHistory()`) completely removes `calctools_calculation_history` from `localStorage` and resets the in-memory fallback array.
- **Privacy Policy Disclosure Gap:** **Finding (Medium Severity):** The draft Privacy Policy (`src/components/pages/PrivacyPage.tsx`, Section 2) lists various localStorage keys (`calctools_theme`, `calctools_global_favorites`, etc.) but **omits** the new `calctools_calculation_history` storage key.
- **Data Locality:** Verified 100% browser-local (`localStorage` + in-memory fallback); zero server-side transmission or telemetry.

---

### Investigation 2 — Functionality Audit

- **Maximum 5 Records:** Enforced strictly via `.slice(0, 5)` in `CalculationHistoryService.getHistory()` and `addRecord()`.
- **Newest-First Ordering:** Enforced by prepending new items: `[newItem, ...current].slice(0, 5)`.
- **Calculator Identification & Timestamps:** Uses exact `calculator.id`, `calculator.name`, and `new Date().toISOString()`.
- **Successful-Calculation-Only:** Guarded by `if (!success || !formatted?.primary) return;`.
- **Duplicate Prevention:** Protected via a 1-second debounce `setTimeout` in `EngineCalculatorView.tsx` to prevent spamming records during rapid input adjustments.
- **Malformed Storage Recovery:** Handled safely via `try { JSON.parse(...) } catch` with array type validation.
- **SSR & In-memory Fallback:** `memoryStore` array fallback handles Node.js SSR and test environments where `typeof window === 'undefined'` or `localStorage` throws.

---

### Investigation 3 — Browser Safety & Robustness

- **Clipboard API:** `navigator.clipboard.writeText()` is used with temporary visual feedback (`copiedId`). In non-secure HTTP environments without clipboard permission, unhandled rejections should ideally be caught (`.catch(() => {})`).
- **LocalStorage Quota & Sandbox Errors:** Wrapped in `try { ... } catch {}` across all service operations, preventing quota exceeded or security sandbox exceptions from throwing unhandled errors.
- **Input Rendering & XSS Safety:** Parameters are rendered safely as string values (`String(v)`), avoiding raw HTML injection.
- **Expand/Collapse & Clear:** Accordion toggle and clear history actions operate smoothly with custom window event dispatch (`calctools:history-updated`).
- **Mobile Layout:** Fully responsive with flex/grid wrapping and text truncation.

---

### Investigation 4 — Performance & Overhead

- **Storage & Render Overhead:** Capped strictly at 5 small JSON records ensures negligible storage footprint (< 5 KB).
- **Execution Overhead:** The 1-second debounce timeout ensures calculation execution is never blocked or bogged down by repeated storage serialization.

---

### Recommendations for Future Enhancement (Non-Blocking)

1. **Privacy Policy Update:** Add `calctools_calculation_history` to the listed localStorage keys in `src/components/pages/PrivacyPage.tsx`.
2. **User Preference Toggle:** Provide an optional setting in the history widget to pause/disable automatic history recording.
3. **Clipboard Catch Handler:** Add `.catch(() => {})` to clipboard write calls to prevent unhandled rejection warnings in restricted iframe or non-secure HTTP contexts.
