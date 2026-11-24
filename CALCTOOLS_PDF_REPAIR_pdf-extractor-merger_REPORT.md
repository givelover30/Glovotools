# CALCTOOLS PDF Individual Repair Report — `pdf-extractor-merger`

**Tool ID:** `pdf-extractor-merger` (`PDF Page Extractor & Merger Utility`)  
**Route:** `/calculator/pdf-extractor-merger`  
**Inventory Order:** #8 of 33 unique `pdf-tools` (`34` catalog registrations)  
**V2 Module:** `page-organization` (`Engine B`)  
**Pre-Edit Backups & Checksums (`backups/pdf_repair_08_pdf_extractor_merger/CHECKSUMS.sha256`):**
- `backups/pdf_repair_08_pdf_extractor_merger/src/services/pdf/v2/pdfPageOrganizationEngine.ts`  
  SHA-256: `093695113d15247396bdae9aafba12d0284712a8f1d03cbc8c1010efec7d38f1`
- `backups/pdf_repair_08_pdf_extractor_merger/src/components/calculators/PdfToolsWorkspace.tsx`  
  SHA-256: `07731e9a090e738287dbe8fa412797d330bbef598047043c377bde76bb4ac78c`

---

## 1. Inspection Summary & Expected Behavior

- **Registry (`src/services/pdf/v2/pdfRegistry.ts`):**
  - `canonicalId: 'pdf-extractor-merger'`, `module: 'page-organization'`, `acceptedFileTypes: '.pdf,application/pdf'`, `expectedInputKind: 'pdf'`, `minFiles: 1`, `maxFiles: 50`, `supportsThumbnailSelection: true`, `browserExecutionClass: 'FULLY_BROWSER_LOCAL'`.
- **Workspace Integration (`src/services/pdf/v2/pdfWorkspaceIntegration.ts`):**
  - `getWorkspaceToolUiConfigV2('pdf-extractor-merger')` sets `allowMultiplePrimaryFiles: true`, `supportsThumbnailSelection: true`, `showsPageRangeInput: true`, `showsPasswordInputs: 'unlock-or-open'`.
- **Engine (`src/services/pdf/v2/pdfPageOrganizationEngine.ts` — `case 'pdf-extractor-merger'`):**
  - Supports **dual-mode operation**:
    1. **Single-file mode (`1` PDF):** Extracts selected pages (thumbnail clicks, manual ranges, or `"all"` preset) in exact selected order (`*_extracted_pages_*.pdf`), preserving dimensions and page rotations. No-selection or invalid input must return accurate validation/file errors rather than a misleading merge error.
    2. **Multi-file mode (`2+` PDFs):** Merges uploaded PDFs in user-arranged file order (`*_merged.pdf`), also supporting programmatic per-file `input.pageSelection` extraction & merge (`PDF04-TC-06`), while preserving dimensions and page rotations.

---

## 2. Reproduced Defects & Root Causes

Four reproducible defects were identified prior to editing via live Playwright Chromium probes and Node/engine inspection:

1. **Defect #1 — Misleading Merge Error on 1-File Upload Without Selection (`src/services/pdf/v2/pdfPageOrganizationEngine.ts`):**
   - **Reproduction:** Uploading `1` PDF (`minFiles: 1`) and clicking **Process PDF Document** with no thumbnails clicked and no range typed called `mergePdfsV2(..., { allowSingleFileWithSelection: false })` and displayed: `"Action Required: PDF Merge requires at least 2 input PDF files (received 1). Upload two or more PDF files before executing."` Moreover, empty/non-PDF/corrupt/encrypted single files without selection were blocked by `ERR_SECOND_FILE_REQUIRED` instead of reporting file validation or encryption errors.
   - **Root Cause:** `case 'pdf-extractor-merger'` fell through directly to `mergePdfsV2` with `allowSingleFileWithSelection: false` whenever `singleInput && !hasSelection`.
2. **Defect #2 — Manual Range to Thumbnail Click Desync (`src/components/calculators/PdfToolsWorkspace.tsx`):**
   - **Reproduction:** Typing `"2, 4"` in the page range field and then clicking Thumbnail `1` left `pageRangeText` stuck at `"2, 4"`, so `buildNormalizedV2RequestFromWorkspaceParams` prioritized `pageRangeText` and ignored the thumbnail click on extraction.
   - **Root Cause:** `handleTogglePage` and `handlePageRangeTextChange` lacked bidirectional synchronization for `pdf-extractor-merger`.
3. **Defect #3 — Stale `pageRangeText` Across File Remove / Clear / Multi-File Transition (`src/components/calculators/PdfToolsWorkspace.tsx`):**
   - **Reproduction:** After extracting `"2, 4"` from a 4-page PDF and removing it to upload a 1-page PDF, `pageRangeText` remained `"2, 4"` and caused an immediate `ERR_INVALID_PAGE_RANGE: Page number 2 is out of bounds`.
   - **Root Cause:** `applySelectedFiles`, `handleRemoveFile`, and `handleClearPrimaryFiles` did not clear `pageRangeText` for `pdf-extractor-merger`.
4. **Defect #4 — Exposed Single-File Thumbnails & Ignored Range Input in Multi-File Merge Mode (`src/components/calculators/PdfToolsWorkspace.tsx`):**
   - **Reproduction:** Uploading 2 PDFs (`four.pdf` + `two.pdf`) while `"2"` was entered still displayed `Document Page Thumbnails (4)` of File 1 and the Page Range input box, even though `executePageOrganizationOperationV2` ignored `request.pageSelection` in multi-file workspace mode and merged all `6` pages (`four_merged.pdf`).
   - **Root Cause:** `canRenderPdfThumbnails` and `uiConfig.showsPageRangeInput` did not account for `uiConfig.canonicalId === 'pdf-extractor-merger' && files.length > 1`, and no UI mode helper clarified single-file extract vs multi-file merge behavior.

---

## 3. Minimal Repair Implemented

1. **`src/services/pdf/v2/pdfPageOrganizationEngine.ts` (Strictly scoped to `case 'pdf-extractor-merger'`):**
   - When `inputs.length === 1 && !hasSelection`: validates `inputs[0]` first (`ERR_EMPTY_FILE` if empty; `loadPdfDocumentV2` so corrupt, non-PDF, and encrypted-password errors preserve exact error codes), and for valid unlocked 1-file uploads returns `ERR_INVALID_PAGE_RANGE` (`VALIDATION_ERROR`) with clear message `"With 1 PDF uploaded, select specific pages (click thumbnails or enter a page range such as 1-3, 5) to extract, or upload at least 1 more PDF file to merge."` and custom `recoverableHint`.
   - **Shared `pdf-merge` Protection:** `pdf-merge`, `mergePdfsV2`, `extractPdfPagesV2`, and all other tools remain untouched.
2. **`src/components/calculators/PdfToolsWorkspace.tsx` (Strictly scoped to `uiConfig.canonicalId === 'pdf-extractor-merger'`):**
   - Clears `pageRangeText` when `applySelectedFiles` transitions to `> 1` primary files, on `handleRemoveFile`, and on `handleClearPrimaryFiles`.
   - Added click-order-preserving bidirectional sync between thumbnail clicks (`handleTogglePage` formatting `selectedPages` via `formatPageNumbersAsExpression`) and valid numeric expressions in `handlePageRangeTextChange`.
   - Hides `<PdfThumbnailPreview>` and single-file page range input whenever `uiConfig.canonicalId === 'pdf-extractor-merger' && files.length > 1`, and displays clear inline helper guidance for both 1-file extract mode and `2+`-file merge mode.

---

## 4. Verification Test Evidence

### Fixtures Used
- `one_1p.pdf`: 1-page US Letter PDF (`612×792`, `0°`, `"ONE_P1"`).
- `four_distinct.pdf`: 4-page PDF (`612×792`, `0°`, distinct `"FOUR_P1"`..`"FOUR_P4"`).
- `mixed_geo_4p.pdf`: 4-page PDF with mixed dimensions (`612×792`, `595.28×841.89`, `612×1008`, `420×595`) and rotations (`0°`, `90°`, `180°`, `270°`), labeled `"MIX_P1"`..`"MIX_P4"`.
- `two_distinct.pdf`: 2-page PDF (`500×700 @ 90°` `"TWO_P1"`, `400×600 @ 180°` `"TWO_P2"`).
- `encrypted_3p.pdf`: AES-encrypted 3-page PDF (`612×792`, rotations `0°`, `90°`, `180°`, `"ENC_EM_P1"`..`"ENC_EM_P3"`, password `"ExtMergePass2026!"`).
- `invalid_image.png` (PNG signature), `empty_0b.pdf` (`0` bytes), `corrupt.pdf` (malformed PDF structure).

### Post-Repair Live Browser E2E Verification (`PdfToolsWorkspace.tsx`)

**1. Vite Development (`http://localhost:3000/calculator/pdf-extractor-merger`) — Browser Health: `0` console errors, `0` uncaught page errors, `0` failed network requests (`pdf.worker.min.mjs`: `200 text/javascript`, `15/15` requests)**

| Scenario | Input / Action | Downloaded Output | Independent `pdfjs-dist` & DOM Verification | Dev Result |
|---|---|---|---|---|
| **Initial empty state guard** | Load route (`0` files) | No download | `Process PDF Document` button `disabled=true` | **PASS** |
| **1-PDF no-selection validation** | `four_distinct.pdf`, click Process with no selection | No download | Single-file helper visible; `[role="alert"]` shows `"With 1 PDF uploaded, select specific pages..."` (`ERR_INVALID_PAGE_RANGE`, not `requires at least 2`) | **PASS** |
| **Partial thumbnail selection `[3, 1]`** | Click thumbnails `3` then `1` -> Process | `four_distinct_extracted_pages_3_1.pdf` (`1450` B) | Range input auto-synced to `"3, 1"`; `numPages=2`, text order `["FOUR_P3", "FOUR_P1"]` verified in `pdfjs-dist` | **PASS** |
| **Remove reset + mixed geo manual/thumb switch + `"all"`** | Remove `four_distinct.pdf`, upload `mixed_geo_4p.pdf`, range `"2, 4"`, click thumb `1`, then `"all"` | `..._2_4.pdf`, `..._2_4_1.pdf`, `..._1-4.pdf` | Range cleared on Remove (`""`); `"2, 4"` -> `[MIX_P2@90°, MIX_P4@270°]`; clicking thumb `1` synced to `"2, 4, 1"` -> `[MIX_P2, MIX_P4, MIX_P1]`; `"all"` -> all `4` pages `MIX_P1..MIX_P4` | **PASS** |
| **Multi-file merge, reorder, remove & clear all** | Upload `four_distinct.pdf` + `two_distinct.pdf`, Move `two_distinct.pdf` up -> Process -> Remove `four` -> Add `one` -> Clear all | `two_distinct_merged.pdf` | Multi-file helper visible, File-1 thumbnails & range hidden; merged `6` pages `[TWO_P1@90°, TWO_P2@180°, FOUR_P1..P4@0°]` verified in `pdfjs-dist`; Remove returned to 1-file thumbnails `(2)`; Clear all disabled Process button | **PASS** |
| **Encrypted PDF (blank / wrong / valid password)** | `encrypted_3p.pdf` + `"3, 1"` (`""`, `"WrongPass!"`, `"ExtMergePass2026!"`) | `encrypted_3p_extracted_pages_3_1.pdf` | Blank -> Password required alert; Wrong -> Incorrect password alert; Valid -> `2` pages `[ENC_EM_P3@180°, ENC_EM_P1@0°]` verified in `pdfjs-dist` | **PASS** |
| **Invalid PNG / 0-byte empty / corrupt rejection** | `invalid_image.png`, `empty_0b.pdf`, `corrupt.pdf` | No download (rejected) | Scoped `[role="alert"]` displayed `Invalid or Unreadable PDF`, `Empty File`, and malformed PDF error cleanly | **PASS** |

**2. Vite Production Preview (`http://127.0.0.1:4196/calculator/pdf-extractor-merger`) — Browser Health: `0` console errors, `0` uncaught page errors, `0` failed network requests (`pdf.worker.min.mjs`: `200 text/javascript`, `15/15` requests)**

| Scenario | Input / Action | Downloaded Output | Independent `pdfjs-dist` & DOM Verification | Prod Preview Result |
|---|---|---|---|---|
| **Initial empty state guard** | Load route (`0` files) | No download | `Process PDF Document` button `disabled=true` | **PASS** |
| **1-PDF no-selection validation** | `four_distinct.pdf`, click Process with no selection | No download | Single-file helper visible; `[role="alert"]` shows `"With 1 PDF uploaded, select specific pages..."` | **PASS** |
| **Partial thumbnail selection `[3, 1]`** | Click thumbnails `3` then `1` -> Process | `four_distinct_extracted_pages_3_1.pdf` (`1449` B) | Range input auto-synced to `"3, 1"`; `numPages=2`, text order `["FOUR_P3", "FOUR_P1"]` verified in `pdfjs-dist` | **PASS** |
| **Remove reset + mixed geo manual/thumb switch + `"all"`** | Remove `four_distinct.pdf`, upload `mixed_geo_4p.pdf`, range `"2, 4"`, click thumb `1`, then `"all"` | `..._2_4.pdf`, `..._2_4_1.pdf`, `..._1-4.pdf` | Range cleared on Remove (`""`); `"2, 4"` -> `[MIX_P2@90°, MIX_P4@270°]`; `"2, 4, 1"` -> `[MIX_P2, MIX_P4, MIX_P1]`; `"all"` -> `4` pages | **PASS** |
| **Multi-file merge, reorder, remove & clear all** | Upload `four_distinct.pdf` + `two_distinct.pdf`, Move `two_distinct.pdf` up -> Process -> Remove `four` -> Add `one` -> Clear all | `two_distinct_merged.pdf` | Multi-file helper visible, File-1 thumbnails & range hidden; merged `6` pages `[TWO_P1@90°, TWO_P2@180°, FOUR_P1..P4@0°]` verified in `pdfjs-dist`; Remove -> 1-file thumbnails `(2)`; Clear all -> disabled | **PASS** |
| **Encrypted PDF (blank / wrong / valid password)** | `encrypted_3p.pdf` + `"3, 1"` (`""`, `"WrongPass!"`, `"ExtMergePass2026!"`) | `encrypted_3p_extracted_pages_3_1.pdf` | Blank & wrong alerts verified; Valid -> `2` pages `[ENC_EM_P3@180°, ENC_EM_P1@0°]` verified in `pdfjs-dist` | **PASS** |
| **Invalid PNG / 0-byte empty / corrupt rejection** | `invalid_image.png`, `empty_0b.pdf`, `corrupt.pdf` | No download (rejected) | Clear rejection alerts for PNG, `0`-byte PDF, and corrupt PDF | **PASS** |

### Automated Test Suites & Build Verification (Post-Edit)
- **TypeScript (`npm run lint` / `tsc --noEmit`):** **PASS** (`0` errors).
- **Vite Production Build (`npm run build` / `compile_applet`):** **PASS** (`0` errors).
- **Vitest Suites (`npx vitest run`):** **73 / 73 PASSED** across 6 files:
  - `src/tests/pdf-extractor-merger.test.ts`: **5 / 5 passed** (1-file no-selection `ERR_INVALID_PAGE_RANGE` + immutability; partial thumbnail order `[2,0]`, manual range `"2, 4"`, `"all"` preset + mixed geometry preservation; multi-file merge order + programmatic per-file selective extract/merge; empty/non-PDF/corrupt/out-of-range/duplicate rejections; encrypted PDF missing/wrong/valid password in single-file and multi-file modes)
  - `src/tests/pdf-page-counter.test.ts`: **7 / 7 passed**
  - `src/tests/pdf-reorder-pages.test.ts`: **5 / 5 passed**
  - `src/tests/pdf-rotate-pages.test.ts`: **6 / 6 passed**
  - `src/tests/pdf-delete-pages.test.ts`: **6 / 6 passed**
  - `src/tests/pdf-extract-pages.test.ts`: **44 / 44 passed**
- **V2 CLI Regression Suites (`npx tsx`):**
  - `runPdf04PageOrganizationTests.ts`: **20 / 20 VERIFIED**
  - `runPdf08SecurityTests.ts`: **11 / 11 VERIFIED**
  - `runPdf10WorkspaceIntegrationTests.ts`: **14 / 14 VERIFIED PASS (0 FAILED)**

---

## 5. Untested / Out-of-Scope Notes

- **Tested:** Empty state guard, 1-file no-selection validation error + input immutability, partial thumbnail click order `[3, 1]`, manual range extraction `"2, 4"`, switching between manual range and thumbnail clicks (`"2, 4, 1"`), `"all"` preset extraction, mixed dimensions (`pt`) and rotations (`0°/90°/180°/270°`), file remove/clear reset of stale ranges, multi-file merge upload/reorder/merge + transition back to single-file mode, programmatic per-file `input.pageSelection` across multiple files, encrypted PDF single-file and multi-file handling (blank/wrong/valid password), empty/non-PDF/corrupt/out-of-range/duplicate input rejection, independent `pdfjs-dist` verification, `0/0/0` browser console/page/network errors in Vite Development and Vite Production Preview, TypeScript check, Vite build, Vitest, and all V2 Page Org / Security / Workspace Integration CLI suites.
- **Untested / Out of Scope for Tool #8:** Per-file page range selection UI across *separate* files simultaneously when `2+` PDFs are uploaded in the browser workspace (explicitly supported via programmatic `input.pageSelection` API; the browser workspace intentionally scopes `2+`-file mode to whole-file merging with arrow reordering and hides File-1 thumbnails so users are never misled), and `10+` large multi-PDF stress merging in the browser. **Tool #9 (`pdf-add-watermark`)** and all remaining tools (#9–#33) were not started.

---

## 6. Mandatory Approval Gate Status

- **Tool #8 (`pdf-extractor-merger`) Status:** `REPAIRED_VERIFIED` — **Approval Status:** `PENDING_USER_APPROVAL`.
- **STOPPED:** Awaiting explicit user review and approval before beginning **PDF Tool #9 (`pdf-add-watermark`)**.
