# CALCTOOLS PDF Individual Repair Report — `pdf-reorder-pages`

**Tool ID:** `pdf-reorder-pages` (`Reorder PDF Pages`)  
**Route:** `/calculator/pdf-reorder-pages`  
**Inventory Order:** #6 of 33 unique `pdf-tools` (`34` catalog registrations)  
**Pre-Edit Backups & Checksums (`backups/pdf_repair_06_pdf_reorder_pages/CHECKSUMS.sha256`):**
- `backups/pdf_repair_06_pdf_reorder_pages/src/components/calculators/PdfToolsWorkspace.tsx`  
  SHA-256: `c156469a9967eaf8a8bda35118f3e14fa10f99335ae2aa2ec046b1880c6ba52b`

---

## 1. Inspection Summary & Expected Behavior

- **Registry (`src/services/pdf/v2/pdfRegistry.ts`):**
  - `canonicalId: 'pdf-reorder-pages'`, `module: 'page-organization'`, `minFiles: 1`, `maxFiles: 1`, `supportsThumbnailSelection: true`, `browserExecutionClass: 'FULLY_BROWSER_LOCAL'`.
- **Workspace Integration (`src/services/pdf/v2/pdfWorkspaceIntegration.ts`):**
  - Enables `showsPageRangeInput` (`"New Page Order (e.g. 3, 1, 2)"`), `supportsThumbnailSelection`, and `showsPasswordInputs: 'unlock-or-open'`.
  - Normalizes non-empty `pageRangeText` or `selectedPageIndices` into `{ newOrder: number[], indexing: '1-based' }`.
- **Engine & Parser (`src/services/pdf/v2/pdfPageOrganizationEngine.ts` & `pdfPageRangeParser.ts` — `reorderPdfPagesV2` / `validateReorderPermutation`):**
  - Validates that every page in the document appears exactly once in the reorder permutation (rejects omitted pages or duplicate references with `ERR_REORDER_LENGTH_MISMATCH`; rejects out-of-range page numbers with `ERR_INVALID_PAGE_RANGE`).
  - Copies selected pages while strictly preserving `MediaBox`, crop boxes, and rotation angles.
  - Serializes and verifies output via `serializeAndVerifyPdfV2` with PDF.js.

---

## 2. Reproduced Defects & Root Causes

One reproducible UI state defect was identified in `src/components/calculators/PdfToolsWorkspace.tsx`:

- **Defect #1 — Stale `pageRangeText` Persists Across File Replacement / Removal (`PdfToolsWorkspace.tsx`):**
  - **Reproduction:** Loaded 4-page PDF, typed permutation `"3, 1, 4, 2"`, then uploaded a 2-page replacement PDF. `selectedPages` cleared to `[]`, while `pageRangeText` remained `"3, 1, 4, 2"`. Submitting immediately triggered `ERR_REORDER_LENGTH_MISMATCH` because permutation length 4 exceeded total pages 2.
  - **Root Cause:** Conditional file-reset logic omitted `pdf-reorder-pages`.
- **Thumbnail Interaction:**
  - Enhanced `handleTogglePage` and `handlePageRangeTextChange` for `pdf-reorder-pages` so clicking thumbnails sequentially builds the reorder permutation or typing expressions updates selected page indices.

---

## 3. Minimal Repair Implemented

All changes were strictly scoped to **`src/components/calculators/PdfToolsWorkspace.tsx`** (zero changes to shared PDF engines, `pdfRegistry.ts`, `pdfWorkspaceIntegration.ts`, or other PDF tools):

1. Included `uiConfig.canonicalId === 'pdf-reorder-pages'` in `applySelectedFiles`, `handleRemoveFile`, and `handleClearPrimaryFiles` to clear `pageRangeText` upon file replacement or removal.
2. Updated `handleTogglePage` and `handlePageRangeTextChange` for `pdf-reorder-pages` to keep thumbnail clicks and range input synchronized.

*(Shared PDF service protection: Zero shared PDF services were modified; `pdfPageOrganizationEngine.ts` and `pdfPageRangeParser.ts` remain untouched.)*

---

## 4. Verification Test Evidence

### Fixtures Used
- `custom_4p.pdf`: 4-page PDF with distinct text (`ORD_P1`–`ORD_P4`), mixed dimensions (`612×792`, `842×595`, `500×700`, `420×595`), and rotations (`0°`, `90°`, `180°`, `270°`).
- `two_2p.pdf`: 2-page PDF (`TWO_P1`–`TWO_P2`, `420×620`).
- `encrypted_3p.pdf`: AES-protected 3-page PDF (`ENC_ORD_P1`–`ENC_ORD_P3`, password `ReorderPass123!`).
- `corrupt.pdf`: Invalid non-PDF payload.

### Browser Verification

#### Pre-Repair Suite Audit (`CALCTOOLS_PDF_SUITE_FAILURE_AUDIT.md` & `CALCTOOLS_PDF_SUITE_TOOL_TEST_MATRIX.csv`, row 7)
- **Environments Tested:** Headless Chromium (Playwright) on Vite Dev (`http://localhost:3000`) and Vite 8 Production Preview (`http://127.0.0.1:4173`).
- **Pre-Repair Findings:** Valid reorder on `sample_main` passed (`sample_main_reordered.pdf`, `6078` bytes, `%PDF-1.7`, `3` thumbnails rendered, worker `200 text/javascript`), while default click without parameters and partial thumbnail selection (`2` of `3` thumbnails clicked) reproduced `ERR_REORDER_LENGTH_MISMATCH` (`RC-05`). Per-tool browser error counts were not separately itemized in the suite audit.

#### Post-Repair Browser E2E Verification (`PdfToolsWorkspace.tsx`)
Executed post-repair Playwright Chromium verification against the repaired workspace in **Vite Development (`http://localhost:3000`)** and **Vite Production Preview (`http://127.0.0.1:4189`)** separately. Every successful scenario downloaded the real browser output file and independently reopened it with `pdfjs-dist` (`pdfjsLib.getDocument`):

**1. Vite Development (`http://localhost:3000/calculator/pdf-reorder-pages`) — Browser Health: `0` console errors, `0` uncaught page errors, `0` failed requests (`pdf.worker.min.mjs`: `200 text/javascript`, 14 requests)**

| Scenario | Input / Action | Downloaded Output | Independent PDF.js Verification | Dev Result |
|---|---|---|---|---|
| **Reorder `3, 1, 4, 2`** | `custom_4p.pdf`, range `"3, 1, 4, 2"` | `custom_4p_reordered.pdf` (`2236` bytes) | 4 pages; texts `['ORD_P3', 'ORD_P1', 'ORD_P4', 'ORD_P2']`; dims `[500×700, 612×792, 420×595, 842×595]`; rot `[180°, 0°, 270°, 90°]` | **PASS** |
| **Reorder `4, 2, 1, 3`** | `custom_4p.pdf`, range `"4, 2, 1, 3"` | `custom_4p_reordered.pdf` (`2236` bytes) | 4 pages; texts `['ORD_P4', 'ORD_P2', 'ORD_P1', 'ORD_P3']`; dims `[420×595, 842×595, 612×792, 500×700]`; rot `[270°, 90°, 0°, 180°]` | **PASS** |
| **Thumbnail click permutation** | Upload `custom_4p.pdf`, click thumbnails `2 -> 4 -> 1 -> 3` | `custom_4p_reordered.pdf` (`2236` bytes) | Range input synced to `"2, 4, 1, 3"`; 4 pages; texts `['ORD_P2', 'ORD_P4', 'ORD_P1', 'ORD_P3']`; dims `[842×595, 420×595, 612×792, 500×700]`; rot `[90°, 270°, 0°, 180°]` | **PASS** |
| **Stale permutation reset on file replace** | Enter `"3, 1, 4, 2"` on `custom_4p.pdf`, replace with `two_2p.pdf`, then reorder `"2, 1"` | `two_2p_reordered.pdf` (`1445` bytes) | Range cleared to `""` on upload; replacement output 2 pages; texts `['TWO_P2', 'TWO_P1']`; dims `[500×700, 420×620]`; rot `[90°, 0°]` | **PASS** |
| **Omitted / duplicate / OOB / invalid / corrupt rejection** | `"3, 1, 2"`, `"3, 1, 1, 2"`, `"3, 1, 5, 2"`, `"abc"`, `corrupt.pdf` | No download (rejected) | Scoped `[role="alert"]` displayed `ERR_REORDER_LENGTH_MISMATCH` (omission/duplicate), `ERR_INVALID_PAGE_RANGE` (OOB/invalid syntax), and `ERR_INVALID_PDF` (magic bytes) | **PASS** |
| **Encrypted PDF (missing / wrong / valid password)** | `encrypted_3p.pdf`, `"3, 1, 2"` with `""`, `"WrongPassword999"`, `"ReorderPass123!"` | `encrypted_3p_reordered.pdf` (`1866` bytes) | Blank -> `Password Required`; Wrong -> `Incorrect Password`; Valid -> 3 pages; texts `['ENC_ORD_P3', 'ENC_ORD_P1', 'ENC_ORD_P2']`; dims `[600×800, 500×700, 550×750]`; rot `[180°, 0°, 90°]` | **PASS** |

**2. Vite Production Preview (`http://127.0.0.1:4189/calculator/pdf-reorder-pages`) — Browser Health: `0` console errors, `0` uncaught page errors, `0` failed requests (`pdf.worker.min.mjs`: `200 text/javascript`, 14 requests)**

| Scenario | Input / Action | Downloaded Output | Independent PDF.js Verification | Prod Preview Result |
|---|---|---|---|---|
| **Reorder `3, 1, 4, 2`** | `custom_4p.pdf`, range `"3, 1, 4, 2"` | `custom_4p_reordered.pdf` (`2235` bytes) | 4 pages; texts `['ORD_P3', 'ORD_P1', 'ORD_P4', 'ORD_P2']`; dims `[500×700, 612×792, 420×595, 842×595]`; rot `[180°, 0°, 270°, 90°]` | **PASS** |
| **Reorder `4, 2, 1, 3`** | `custom_4p.pdf`, range `"4, 2, 1, 3"` | `custom_4p_reordered.pdf` (`2236` bytes) | 4 pages; texts `['ORD_P4', 'ORD_P2', 'ORD_P1', 'ORD_P3']`; dims `[420×595, 842×595, 612×792, 500×700]`; rot `[270°, 90°, 0°, 180°]` | **PASS** |
| **Thumbnail click permutation** | Upload `custom_4p.pdf`, click thumbnails `2 -> 4 -> 1 -> 3` | `custom_4p_reordered.pdf` (`2235` bytes) | Range input synced to `"2, 4, 1, 3"`; 4 pages; texts `['ORD_P2', 'ORD_P4', 'ORD_P1', 'ORD_P3']`; dims `[842×595, 420×595, 612×792, 500×700]`; rot `[90°, 270°, 0°, 180°]` | **PASS** |
| **Stale permutation reset on file replace** | Enter `"3, 1, 4, 2"` on `custom_4p.pdf`, replace with `two_2p.pdf`, then reorder `"2, 1"` | `two_2p_reordered.pdf` (`1444` bytes) | Range cleared to `""` on upload; replacement output 2 pages; texts `['TWO_P2', 'TWO_P1']`; dims `[500×700, 420×620]`; rot `[90°, 0°]` | **PASS** |
| **Omitted / duplicate / OOB / invalid / corrupt rejection** | `"3, 1, 2"`, `"3, 1, 1, 2"`, `"3, 1, 5, 2"`, `"abc"`, `corrupt.pdf` | No download (rejected) | Scoped `[role="alert"]` displayed `ERR_REORDER_LENGTH_MISMATCH` (omission/duplicate), `ERR_INVALID_PAGE_RANGE` (OOB/invalid syntax), and `ERR_INVALID_PDF` (magic bytes) | **PASS** |
| **Encrypted PDF (missing / wrong / valid password)** | `encrypted_3p.pdf`, `"3, 1, 2"` with `""`, `"WrongPassword999"`, `"ReorderPass123!"` | `encrypted_3p_reordered.pdf` (`1866` bytes) | Blank -> `Password Required`; Wrong -> `Incorrect Password`; Valid -> 3 pages; texts `['ENC_ORD_P3', 'ENC_ORD_P1', 'ENC_ORD_P2']`; dims `[600×800, 500×700, 550×750]`; rot `[180°, 0°, 90°]` | **PASS** |

### Automated Test Suites & Build Results (Previously Executed)
- **TypeScript (`tsc --noEmit`):** **PASS** (`0` errors).
- **Vite Production Build (`vite build`):** **PASS** (`0` errors).
- **Vitest Targeted Suites (`npx vitest run`):**
  - `src/tests/pdf-reorder-pages.test.ts`: **5 / 5 passed**
  - `src/tests/pdf-rotate-pages.test.ts`: **6 / 6 passed**
  - `src/tests/pdf-delete-pages.test.ts`: **6 / 6 passed**
  - `src/tests/pdf-extract-pages.test.ts`: **44 / 44 passed** (Total: **61 / 61 passed**).
- **V2 CLI Suites (`npx tsx`):**
  - `runPdf04PageOrganizationTests.ts`: **20 / 20 VERIFIED** (including `PDF04-TC-04`, `PDF04-TC-16`, `PDF04-TC-17`)
  - `runPdf08SecurityTests.ts`: **11 / 11 VERIFIED**
  - `runPdf10WorkspaceIntegrationTests.ts`: **14 / 14 VERIFIED PASS (0 FAILED)**

---

## 5. Untested / Out-of-Scope Notes

- **Tested (Node + Live Dev & Production Preview Browser E2E):** Array and string permutation parsing (`validateReorderPermutation`), 4-page custom geometry reordering (`3, 1, 4, 2` and `4, 2, 1, 3`), sequential thumbnail click ordering (`2, 4, 1, 3`), stale permutation clearing on 4-page-to-2-page file replacement, omission/duplication/out-of-bounds/non-numeric/corrupt error rejections, encrypted PDF reordering (missing password, wrong password, valid password), independent PDF.js verification of page counts/text order/dimensions/rotations on downloaded outputs, `0/0/0` console/page/network errors in both Dev and Production Preview, TypeScript check, Vite build, Vitest unit tests, and V2 CLI suites.
- **Untested / Out of Scope for Tool #6:** Single-page (`1`-page) PDF reordering in live browser UI, thumbnail deselection/unclick-to-remove sequence behavior in live browser UI, file removal (`X` button) clearing in live browser UI, extensionless valid PDF filename upload (`RC-06`), >24-page stress reordering, and owner-only permission-locked PDFs with empty user password. **Tool #7 (`pdf-page-counter`)**, **Tool #8 (`pdf-extractor-merger`)**, and all remaining tools (#7–#33) were not started.

---

## 6. Mandatory Approval Gate Status

- **Tool #6 (`pdf-reorder-pages`) Status:** `REPAIRED_VERIFIED` — **Approval Status:** `PENDING_USER_APPROVAL`.
- **STOPPED:** Awaiting explicit user review and approval before beginning **PDF Tool #7 (`pdf-page-counter`)** (followed by **Tool #8 (`pdf-extractor-merger`)**).
