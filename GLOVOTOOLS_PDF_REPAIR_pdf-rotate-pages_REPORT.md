# GLOVOTOOLS PDF Individual Repair Report — `pdf-rotate-pages`

**Tool ID:** `pdf-rotate-pages` (`Rotate PDF Pages`, alias `pdf-rotate`)  
**Route:** `/calculator/pdf-rotate-pages`  
**Inventory Order:** #5 of 33 unique `pdf-tools` (`34` catalog registrations)  
**Pre-Edit Backups & Checksums (`backups/pdf_repair_05_pdf_rotate_pages/CHECKSUMS.sha256`):**
- `backups/pdf_repair_05_pdf_rotate_pages/src/components/calculators/PdfToolsWorkspace.tsx`  
  SHA-256: `12cf91ee09877cd75ba088f7683f58d5fd98baa12d183b12b5aad84b7015ce7d`
- `backups/pdf_repair_05_pdf_rotate_pages/src/services/pdf/v2/pdfPageOrganizationEngine.ts`  
  SHA-256: `014154cbca84c326d6ad43d6e0114e6fcaa2f99afdbd07a5ce7890cb2d4493aa`

---

## 1. Inspection Summary & Expected Behavior

- **Registry (`src/services/pdf/v2/pdfRegistry.ts`):**
  - `canonicalId: 'pdf-rotate-pages'`, `aliases: ['pdf-rotate']`, `module: 'page-organization'`, `minFiles: 1`, `maxFiles: 1`, `supportsThumbnailSelection: true`, `browserExecutionClass: 'FULLY_BROWSER_LOCAL'`.
- **Workspace Integration (`src/services/pdf/v2/pdfWorkspaceIntegration.ts`):**
  - Enables `showsPageRangeInput`, `showsRotationSelector` (`90° Clockwise`, `180°`, `270° Clockwise (90° Counter-Clockwise)`), `supportsThumbnailSelection`, and `showsPasswordInputs: 'unlock-or-open'`.
  - Normalizes non-empty `pageRangeText` into `{ mode: 'range-string', rangeExpression }`, falls back to `{ mode: 'indices', indices: selectedPageIndices }` when `pageRangeText` is blank and thumbnails are selected, and leaves `selection: undefined` when both are empty so the engine rotates all pages (`defaultToAll: true`).
- **Engine (`src/services/pdf/v2/pdfPageOrganizationEngine.ts` — `rotatePdfPagesV2`):**
  - Rejects invalid angles (`0`, `45`, non-multiples of 90, `NaN`) with `ERR_INVALID_PAGE_RANGE`.
  - Computes relative clockwise angle modulo 360 (`(((prevAngle + rawAngle) % 360) + 360) % 360`) on selected pages and explicitly preserves `prevAngle` on unselected pages.
  - Verifies generated PDFs via `serializeAndVerifyPdfV2` including independent reopening in PDF.js.

---

## 2. Reproduced Defects & Root Causes

Three reproducible defects were identified and reproduced before editing production code:

1. **Defect #1 — Stale `pageRangeText` Persists Across File Replacement / Removal (`src/components/calculators/PdfToolsWorkspace.tsx`):**
   - **Reproduction:** Uploaded 4-page `mixed_4p.pdf`, entered `"4"`, then uploaded 2-page `two_2p.pdf`. `selectedPages` cleared to `[]`, while `pageRangeText` stayed `"4"`. Clicking **Process PDF Document** immediately failed with `ERR_INVALID_PAGE_RANGE`: `"Page number 4 is out of bounds (valid range: 1 to 2)."`
   - **Root Cause:** `applySelectedFiles`, `handleRemoveFile`, and `handleClearPrimaryFiles` only cleared `pageRangeText` for `pdf-extract-pages` and `pdf-delete-pages`, omitting `pdf-rotate-pages`.

2. **Defect #2 — Thumbnail Click vs Manual Page Range Desynchronization (`src/components/calculators/PdfToolsWorkspace.tsx`):**
   - **Reproduction:** Uploaded `mixed_4p.pdf` (rotations `[0°, 90°, 180°, 270°]`), entered `"1"` in `Page Range or Selection`, then clicked thumbnail Page 3. The UI highlighted Page 3, while `pageRangeText` remained `"1"`. Submitting rotated Page 1 instead of Page 3 (`[90°, 90°, 180°, 270°]` instead of rotating Page 3).
   - **Root Cause:** `handleTogglePage` and `handlePageRangeTextChange` only kept `selectedPages` and `pageRangeText` synchronized for `pdf-delete-pages`.

3. **Defect #3 — Stale `/Encrypt` Trailer Dictionary Left on Serialized Encrypted Outputs (`src/services/pdf/v2/pdfPageOrganizationEngine.ts` — `rotatePdfPagesV2`):**
   - **Reproduction:** Loaded AES-encrypted `encrypted_3p.pdf` (`userPassword: 'RotatePass123!'`) into `rotatePdfPagesV2({ angleDegrees: 180, selection: '1, 3' })`. Because `rotatePdfPagesV2` saved the unlocked `@cantoo/pdf-lib` `PDFDocument` in-place, the output bytes still contained `/Encrypt` (`hasEncrypt: true`) while clearing/invalidating the password: `PDFDocument.load(outputBytes)` failed (`"Input document to PDFDocument.load is encrypted"`), `PDFDocument.load(outputBytes, { password: 'RotatePass123!' })` failed (`"Password incorrect"`), and re-uploading the output PDF with the original password would fail in `verifyEncryptedPdfAccessWithPdfJs`.
   - **Root Cause:** Unlike `extractPdfPagesV2`, `deletePdfPagesV2`, and `reorderPdfPagesV2` (which copy pages into a fresh unencrypted `PDFDocument.create()`), `rotatePdfPagesV2` saved `doc` directly even when `loadRes.validation.hasEncryptDictionary || doc.isEncrypted` was true.

---

## 3. Minimal Repair & Shared-Service Consumer Impact

### Changes Made
1. **`src/components/calculators/PdfToolsWorkspace.tsx`** *(strictly scoped to `uiConfig.canonicalId === 'pdf-rotate-pages'`)*:
   - Cleared `pageRangeText` alongside `selectedPages` in `applySelectedFiles`, `handleRemoveFile`, and `handleClearPrimaryFiles` when `uiConfig.canonicalId === 'pdf-rotate-pages'`.
   - Enabled bidirectional synchronization in `handleTogglePage` and `handlePageRangeTextChange` for `pdf-rotate-pages` (keeping sorted `selectedPages` and `pageRangeText` in sync via `formatPageNumbersAsExpression` / `parsePageRangeExpression`, while preserving keyword and invalid expressions for engine validation).
   - Added a concise helper note under the range field (`"Leave blank to rotate all pages, or select specific pages above / enter ranges."`).
2. **`src/services/pdf/v2/pdfPageOrganizationEngine.ts`** *(strictly scoped inside `rotatePdfPagesV2`)*:
   - Added a guarded branch when `loadRes.validation.hasEncryptDictionary || doc.isEncrypted`: after applying rotations on `doc`, copy all pages cleanly into `PDFDocument.create()` via `copySelectedPagesPreservingGeometry` and `delete cleanDoc.context.trailerInfo.Encrypt` before calling `serializeAndVerifyPdfV2`. Unencrypted PDFs continue using `doc` directly with zero change.

### Shared-Service Protection & Affected Consumers
- Searched `src/` for all callers of `rotatePdfPagesV2`: it is invoked solely by `'pdf-rotate-pages'` (`'pdf-rotate'`) and `'pdf-page-rotation-tool'` (`pdfPageOrganizationEngine.ts:1256-1264`).
- Because `pdfPageOrganizationEngine.ts` hosts the 11 Page Organization operations and `PdfToolsWorkspace.tsx` renders the shared workspace UI, regression tests were executed across all affected Page Organization consumers (`pdf-merge`, `pdf-split`, `pdf-extract-pages`, `pdf-delete-pages`, `pdf-reorder-pages`, `pdf-rotate-pages`, `pdf-page-rotation-tool`) in both automated V2/Vitest suites and real Chromium browser tests.

---

## 4. Verification Test Evidence

### Fixtures Used
- `mixed_4p.pdf`: 4-page PDF with distinct page texts (`ROT_P1`–`ROT_P4`), mixed dimensions (`400×600`, `450×650`, `500×700`, `550×750`), and mixed existing rotations (`0°`, `90°`, `180°`, `270°`).
- `two_2p.pdf`: 2-page PDF (`TWO_P1`–`TWO_P2`, `420×620`, `0°`).
- `encrypted_3p.pdf`: AES-encrypted 3-page PDF (`ENC_ROT_P1`–`ENC_ROT_P3`, `500×700`, initial rotations `[0°, 90°, 180°]`, user password `RotatePass123!`).
- `corrupt.pdf`: Invalid ASCII non-PDF payload.

### Browser E2E Results (`http://localhost:3000` Vite Dev & `http://127.0.0.1:4179` Production Preview)

Every downloaded PDF output was independently opened and verified with `pdfjs-dist` (`pdfjsLib.getDocument`):

| Scenario | Input | Expected Output | Observed Result (Dev & Prod Preview) |
|---|---|---|---|
| **Whole PDF 90° CW (blank selection)** | `mixed_4p.pdf`, range `""`, `90°` | 4p, `[90°, 180°, 270°, 0°]`, dims `[400×600..550×750]`, texts `ROT_P1..ROT_P4` | **PASS** — Exact 4 pages, text, dimensions & rotations verified in PDF.js |
| **Repeated rotation round-trip** | Downloaded 90° output re-uploaded, `270°` (90° CCW) | Returns to `[0°, 90°, 180°, 270°]` | **PASS** — Verified in PDF.js |
| **Whole PDF 180° & 270° (90° CCW)** | `mixed_4p.pdf`, `180°` then `270°` | `[180°, 270°, 0°, 90°]` and `[270°, 0°, 90°, 180°]` | **PASS** — Both verified in PDF.js |
| **Single pages (first, middle, last)** | `"1"` (`90°`), `"2"` (`180°`), `"4"` (`270°`) | `[90,90,180,270]`, `[0,270,180,270]`, `[0,90,180,180]` (unselected unchanged) | **PASS** — Exact selective rotations verified in PDF.js |
| **Multiple non-sequential pages** | `"4, 1"`, `90°` | `[90°, 90°, 180°, 0°]` | **PASS** — Pages 2 & 3 unchanged; Pages 1 & 4 rotated |
| **Thumbnail ↔ Manual Range Sync** | Type `"1"`, click Pg 3 (`"1, 3"`), uncheck Pg 1 (`"3"`), `90°`, then uncheck Pg 3 (`""`) | Rotates only Page 3 -> `[0°, 90°, 270°, 270°]`; clearing returns range to `""` | **PASS** — Thumbnails and range input stayed synchronized |
| **File replacement stale-range reset** | Enter `"4"` on `mixed_4p.pdf`, replace with `two_2p.pdf`, submit `90°` | Range resets to `""`; rotates both pages -> `[90°, 90°]` | **PASS** — No stale `ERR_INVALID_PAGE_RANGE` |
| **Duplicate / OOB / Invalid / Corrupt** | `"2, 2"`, `"9"`, `"abc"`, `corrupt.pdf` | Clean `PdfErrorDisplay` rejection (`ERR_INVALID_PAGE_RANGE` / `ERR_INVALID_PDF`) | **PASS** — All rejected cleanly |
| **Encrypted PDF + follow-up re-rotation** | `encrypted_3p.pdf`: blank / wrong / `RotatePass123!` (`"1, 3"`, `180°`), then re-upload output (`90°`) | Missing -> `ERR_PASSWORD_REQUIRED`; wrong -> `ERR_INCORRECT_PASSWORD`; valid -> `[180°, 90°, 0°]` cleanly unencrypted & re-rotatable (`[270°, 180°, 90°]`) | **PASS** — **Encrypted PDF rotation & clean re-serialization verified** |
| **Shared-consumer regression** | `pdf-merge` (6p), `pdf-split` (4p chunk=2 -> 2 ZIP PDFs), `pdf-extract-pages` (`"2, 4"` -> 2p), `pdf-delete-pages` (`"2"` -> 3p) | All 4 succeed with expected PDF.js page text/counts | **PASS** — Verified in both Dev & Prod Preview |
| **Browser health** | Console errors, uncaught page errors, failed network requests | `0 / 0 / 0` | **PASS** — `0 / 0 / 0` in both Dev & Prod Preview |

### Automated Build, TypeScript & Suite Results
- **TypeScript (`tsc --noEmit` / `lint_applet`):** **PASS** (`0` errors)
- **Vite Production Build (`vite build` / `compile_applet`):** **PASS** (`0` errors)
- **Vitest Targeted Suites (`npx vitest run`):** **56 / 56 passed**
  - `src/tests/pdf-rotate-pages.test.ts`: **6 / 6 passed**
  - `src/tests/pdf-delete-pages.test.ts`: **6 / 6 passed**
  - `src/tests/pdf-extract-pages.test.ts`: **44 / 44 passed**
- **V2 CLI Suites (`npx tsx`):**
  - `runPdf04PageOrganizationTests.ts`: **20 / 20 VERIFIED** (including `PDF04-TC-18`, `PDF04-TC-19`, `PDF04-TC-20`)
  - `runPdf08SecurityTests.ts`: **11 / 11 VERIFIED**
  - `runPdf10WorkspaceIntegrationTests.ts`: **14 / 14 VERIFIED PASS (0 FAILED)**

---

## 5. Tested vs. Untested / Out-of-Scope Notes

- **Tested:** Whole-document & selective 90°/180°/270° (including 270° CW = 90° CCW) and -90°/-180°/-270° (in engine Vitest/PDF04), repeated cumulative rotations, mixed dimensions and existing orientations (`0°/90°/180°/270°`), first/middle/last/non-sequential pages with unselected page preservation, thumbnail-to-range synchronization, file replacement range clearing, duplicate/out-of-bounds/non-numeric/corrupt error paths, encrypted PDFs (no password, wrong password, valid password, clean re-rotation), Dev & Production Preview Playwright verification, independent PDF.js output checks, and shared-consumer regressions (`pdf-merge`, `pdf-split`, `pdf-extract-pages`, `pdf-delete-pages`).
- **Not Applicable / Not Tested:**
  - *Per-thumbnail inline rotate icon buttons:* `PdfThumbnailPreview` provides page selection toggle controls rather than per-thumbnail rotation buttons; rotation angles are selected globally via `Rotation Angle (Degrees)` and applied to selected thumbnails / page ranges.
  - *Out of Scope for Tool #5:* Extensionless valid PDF filename upload (`RC-06`), owner-only permission-locked PDFs with empty user password, and >24-page stress rendering. Tool #6 (`pdf-reorder-pages`) and all remaining pending tools (#6–#33) were not started.

---

## 6. Mandatory Approval Gate Status

- **Tool #5 (`pdf-rotate-pages`) Status:** `REPAIRED_VERIFIED` — **Approval Status:** `PENDING_USER_APPROVAL`.
- **STOPPED:** Awaiting explicit user review and approval before starting **PDF Tool #6 (`pdf-reorder-pages`)**.
