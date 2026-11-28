# GLOVOTOOLS — PHASE 3G EXECUTION GUIDE
# Manual Browser QA Execution Guide

## 1. Objective
Provide step-by-step instructions for executing manual browser verification of the GLOVOTOOLS Spanish (`es`) localization implementation across all functional areas.

## 2. Prerequisites
- Development server running on port 3000 (or preview environment URL).
- Modern web browser (Chrome, Firefox, Safari, or Edge) with DevTools enabled.

## 3. Execution Steps
1. **Access Homepage**: Open `https://glovotools.com/es/` (or local preview).
2. **Verify Navigation**: Check header menus, language selector, and footer links.
3. **Run Targeted Title Audit**: Inspect the 4 specified tools on the Spanish homepage (`Merge PDF Files`, `Secure Password & Passphrase Generator`, `JSON Syntax & Structure Validator`, `Group Restaurant Bill & Tax Split Calculator`) to confirm translation display status.
4. **Test Calculator Workspaces**: Open representative calculators, enter inputs, trigger validation, and verify formatted results.
5. **Inspect SEO**: Verify `/sitemap.xml` and HTML head meta tags (`hreflang`, canonical links).
6. **Record Status**: Update `GLOVOTOOLS_ES_PHASE_3G_TEST_CASES.csv` from `NOT TESTED` to `PASS` or `FAIL` with screenshot evidence.

## 4. Safety Reminder
Do not modify application source code or translation dictionaries during browser QA.
