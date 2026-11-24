# GLOVOTOOLS PDF Individual Repair Report — `pdf-merge`

**Tool ID:** `pdf-merge` (`Merge PDF Files`)  
**Route:** `/calculator/pdf-merge`  
**Inventory Order:** #1 of 33 unique `pdf-tools` (`34` catalog registrations)  
**Audit Reconciliation:** Phase 7 certified the 300 core mathematical calculators (`GLOVOTOOLS_PHASE_7_FINAL_CERTIFICATION_REPORT.md`); `pdf-merge` is handled by the PDF Engine 2.0 suite (`PdfToolsWorkspace.tsx` + `pdfPageOrganizationEngine.ts`) and was flagged for `RC-01` / `RC-05` UX & workflow issues in `GLOVOTOOLS_PDF_SUITE_FAILURE_AUDIT.md`.  
**Backup Preserved:** `backups/pdf_repair_01_pdf_merge/` (pre-edit snapshots + `CHECKSUMS.sha256`)

---

## 1. Original Defects Reproduced

Four reproducible user-facing defects were observed directly on `/calculator/pdf-merge` in headless Chromium before editing:

1. **Sequential File Upload Overwrite:** Uploading `a.pdf` and then selecting or dropping `b.pdf` overwrote `files` with `["b.pdf"]`, losing `a.pdf` and preventing users from adding PDFs one at a time or reordering the merge order.
2. **Encrypted PDF Merge Failure (`ERR_PDF_LOAD_FAILED`):** Merging an encrypted PDF (`enc.pdf`, AES-256 / default object streams created by `@cantoo/pdf-lib`) with another PDF (`b.pdf`) using the valid password (`TestPass123!`) failed with:
   `Failed to parse the internal structure of the PDF document. (Try running the PDF Structure Repair utility if the document cross-reference table is damaged.)`
   even though `pdf-merge` declares password-protected PDF support and displays a password field.
3. **Misleading Page Selection Thumbnails & Console Error:** `pdf-merge` rendered `PdfThumbnailPreview` (`"Document Page Thumbnails — Click to select pages"`) for `files[0]` only, accepted thumbnail page clicks (`Click to select pages (1)`), and then silently ignored them while merging all pages of all files. Uploading an encrypted PDF also emitted a browser console error (`PDF preview error: PasswordException`).
4. **Duplicate Output Download Card:** Merging 2 PDFs produced 1 output (`a_merged.pdf`) but rendered it twice in the Output panel — once under `Download Result` and again under `Additional Output Files (1)`.

---

## 2. Reproduction Steps

1. Open `http://localhost:3000/calculator/pdf-merge`.
2. Select `a.pdf` via `<input type="file">`, then select `b.pdf` via `<input type="file">`.  
   - **Observed before fix:** Selected files list became `["b.pdf"]`; clicking `Process PDF Document` failed with `PDF Merge requires at least 2 input PDF files (received 1)`.
3. Select `["a.pdf", "b.pdf"]` simultaneously, click thumbnail `Page 1`, then click `Process PDF Document`.  
   - **Observed before fix:** Selection was ignored (all 3 pages merged) and Output panel displayed both `Download Result` and `Additional Output Files (1)` for `a_merged.pdf`.
4. Reset, upload `["enc.pdf", "b.pdf"]`, enter `TestPass123!`, and click `Process PDF Document`.  
   - **Observed before fix:** Console logged `PDF preview error: PasswordException` and processing failed with `ERR_PDF_LOAD_FAILED`.

---

## 3. Root Cause Analysis

- **Workspace Upload & Output UI (`src/components/calculators/PdfToolsWorkspace.tsx`):**
  - `applySelectedFiles` replaced `files` (`setFiles(selected)`) even when `uiConfig.allowMultiplePrimaryFiles` was `true`, and `handleFileChange` did not reset `e.target.value`.
  - `executePdfOperation` checked `outFile === primaryOut` (strict reference equality) between two separately wrapped objects (`outputs[0]` vs `primaryOutput` created in `pdfWorkspaceIntegration.ts`), causing index `0` to always appear in `additionalOutputs`.
- **Encrypted Object-Stream Loading (`src/services/pdf/v2/pdfDocumentLoader.ts`):**
  - `loadPdfDocumentV2` verified the password cleanly via `verifyEncryptedPdfAccessWithPdfJs`, then called `PDFDocument.load(isolatedBytes, { throwOnInvalidObject: true, password })`. For `@cantoo/pdf-lib` encrypted PDFs saved with default object streams, `PDFDocument.load` threw `Trying to parse invalid object`, and the `catch` block only retried when the error text matched `encrypt`/`password`.
- **Registry Thumbnail Flag (`src/services/pdf/v2/pdfRegistry.ts`):**
  - `'pdf-merge'` set `supportsThumbnailSelection: true` despite merging complete documents without `pageSelection` filtering (unlike `'pdf-extractor-merger'`).

---

## 4. Files Modified

1. `src/components/calculators/PdfToolsWorkspace.tsx`
2. `src/services/pdf/v2/pdfDocumentLoader.ts`
3. `src/services/pdf/v2/pdfRegistry.ts`

*(Zero changes to unrelated calculators, search, favorites, history, theme, SEO, or document converters.)*

---

## 5. Exact Corrections Implemented

1. **`src/components/calculators/PdfToolsWorkspace.tsx`:**
   - Appended newly chosen/dropped files to `files` when `uiConfig.allowMultiplePrimaryFiles` is `true`, reset `e.target.value = ''` in `handleFileChange`, updated multi-file dropzone copy (`"...click or drop to add more files"`), added `Clear all` and `Move up`/`Move down` (`ArrowUp`/`ArrowDown`) file-order buttons, and added a 1-file merge helper note (`"Add at least 1 more PDF file using the upload area above (2 or more files required to merge)."`).
   - Fixed `additionalOutputs` deduplication (`outIdx === 0 && primaryOut && outFile.fileName === primaryOut.fileName && outFile.byteLength === primaryOut.byteLength`) so single-file merged output appears once.
2. **`src/services/pdf/v2/pdfDocumentLoader.ts`:**
   - When `validation.hasEncryptDictionary` is `true` (after `verifyEncryptedPdfAccessWithPdfJs` already verified authorization), added fallback retry with `throwOnInvalidObject: false` before optional `ignoreEncryption` re-check.
3. **`src/services/pdf/v2/pdfRegistry.ts`:**
   - Changed `'pdf-merge'` `supportsThumbnailSelection` from `true` to `false`.

---

## 6. Test Inputs, Expected Output & Actual Output

| Test Case | Test Inputs | Expected Output | Actual Output (Observed) |
|---|---|---|---|
| **TC-01: Sequential upload + reorder** | Upload `a.pdf` (2 pages: `DOC_A_1`, `DOC_A_2`), then upload `b.pdf` (1 page: `DOC_B_1`), move `b.pdf` up | File list `["b.pdf", "a.pdf"]`; merged 3-page `b_merged.pdf` with page texts `["DOC_B_1", "DOC_A_1", "DOC_A_2"]`; single download card | **PASS** — `b_merged.pdf` (`1821 B` Dev / `1820 B` Prod), independent `pdfjs-dist` + `@cantoo/pdf-lib` verified 3 pages `["DOC_B_1","DOC_A_1","DOC_A_2"]`, `Additional Output Files` count = `0` |
| **TC-02: Encrypted + plain PDF merge** | Upload `enc.pdf` (1 page: `SECRET_PAGE`, password `TestPass123!`) + `c.pdf` (1 page: `DOC_C_1`), password `TestPass123!` | Password-unlocked merge -> 2-page `enc_merged.pdf` containing `["SECRET_PAGE", "DOC_C_1"]` | **PASS** — `enc_merged.pdf` (`1437 B`), verified 2 pages `["SECRET_PAGE","DOC_C_1"]`, 0 console errors |
| **TC-03: Invalid file rejection** | Upload `a.pdf` + `not_a_pdf.pdf` (plain ASCII text) | Validation alert explaining missing `%PDF-` magic header | **PASS** — `[role="alert"]`: `"Invalid magic bytes: file does not contain a valid %PDF- header within the first 1024 bytes."` |
| **TC-04: Regression — shared consumers** | `pdf-extractor-merger` sequential upload (`a.pdf` then `b.pdf`), `pdf-images-to-pdf` sequential upload (`i1.png` then `i2.png`), `pdf-remove-password` (`enc.pdf`), `pdf-split` (`a.pdf`) | All shared consumers succeed with zero console/page/network errors | **PASS** — All 4 browser consumer checks + V2 CLI suites (`PDF04` 20/20, `PDF08` 11/11, `PDF10` 14/14) passed |

---

## 7. Build, Development & Production Preview Results

- **Type-Check (`npm run lint` / `tsc --noEmit`):** PASS (`0` errors)
- **Production Build (`vite build`):** PASS (`0` errors)
- **V2 CLI Regression Suites (`npx tsx`):**
  - `runPdf04PageOrganizationTests.ts`: **20 / 20 VERIFIED**
  - `runPdf08SecurityTests.ts`: **11 / 11 VERIFIED**
  - `runPdf10WorkspaceIntegrationTests.ts`: **14 / 14 VERIFIED**
- **Development Server (`http://localhost:3000`) Browser Verification:** PASS (`0` console errors, `0` page errors, `0` failed requests)
- **Production Preview (`http://127.0.0.1:4174`) Browser Verification:** PASS (`0` console errors, `0` page errors, `0` failed requests)

---

## 8. Remaining Limitations

- **Distinct Passwords Across Multiple Encrypted Files:** `PdfToolsWorkspace` provides one shared optional password input applied across uploaded inputs (`pdfWorkspaceIntegration.ts:482`). Merging multiple encrypted PDFs that use *different* user passwords in a single operation requires unlocking one first via `pdf-remove-password`.
- **Shared Worker Sub-Path / `.mjs` Hosting (`RC-01`):** `pdfRuntime.ts` still resolves `pdf.worker.min.mjs` via `new URL(..., import.meta.url)` (verified `200 text/javascript` in Vite Dev and Preview; deployment environments blocking `.mjs` MIME remain tracked separately in `GLOVOTOOLS_PDF_SUITE_ROOT_CAUSE_REGISTER.csv`).
- **Duplicate `pdf-metadata-editor` Catalog Entry (`RC-04`):** Tracked in the repair tracker for its own turn.

---

**Gate Status:** `pdf-merge` repair and verification complete. **Stopped awaiting user review and authorization before starting the next PDF tool.**
