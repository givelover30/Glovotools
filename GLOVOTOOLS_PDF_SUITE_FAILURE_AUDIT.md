# GLOVOTOOLS — PDF Suite Failure Investigation Audit

**Audit Mode:** Strictly Read-Only (no production files, tests, dependencies, translations, or existing docs were modified)  
**Target Environment Tested:** Headless Chromium (Playwright) against Vite Dev Server (`http://localhost:3000`) and Vite 8 Production Preview (`vite preview` at `http://127.0.0.1:4173`)  
**Companion Deliverables:**
- `GLOVOTOOLS_PDF_SUITE_TOOL_TEST_MATRIX.csv`
- `GLOVOTOOLS_PDF_SUITE_ROOT_CAUSE_REGISTER.csv`

---

## 1. Executive Summary & Inventory Reconciliation

A full-stack static inspection and live headless Chromium test execution were performed across **all** registered PDF tools and document converters in `CALCULATORS` (`src/data/calculators.ts`) and `PDF_TOOL_OPERATION_REGISTRY` (`src/services/pdf/v2/pdfRegistry.ts`).

| Inventory Metric | Count | Verified Detail |
|---|---:|---|
| Catalog entries in `pdf-tools` (`CALCULATORS`) | **34** | Includes duplicate registration of `pdf-metadata-editor` in `src/data/catalog/phase25_pdf_tools_expansion.ts:159` and `src/data/catalog/batch82d_group6.ts:252` |
| Unique canonical IDs in `pdf-tools` | **33** | 100% resolve `supported: true` via `resolvePdfWorkspaceToolV2` |
| Unique canonical IDs in `document-converters` | **20** | 100% resolve `supported: true` via `resolvePdfWorkspaceToolV2` |
| **Total unique registered PDF / Document tools** | **53** | 33 `pdf-tools` + 20 `document-converters` |
| Tools tested end-to-end in live Chromium (Dev + Prod Preview) | **53** | 100% of unique registered tools executed via `/calculator/<id>` |
| Passing on standard valid inputs (Dev & Prod Preview) | **52** (+1 conditional) | All **33/33** `pdf-tools` pass; **19/20** `document-converters` pass on all fixtures, and **20/20** pass when `ods-to-pdf-converter` uses a SheetJS/LibreOffice `.ods` with `META-INF/manifest.xml` |
| Failing under verified edge-case / mismatch workflows | **Multiple** | See Root Causes `RC-01` through `RC-09` below (worker MIME failure, `pdf-images-to-pdf` WebP/SVG/GIF/BMP failure, minimal `.ods` failure, extensionless PDF rejection, encrypted PDF converter gap, default-click alerts, CDN OCR dependency) |
| Legacy non-catalog tools | **1** | `pdf-duplicate-pages` exists only as a dead branch in `PdfToolsWorkspace.tsx:414` (`/calculator/pdf-duplicate-pages` renders **Calculator Not Found**). Zero entries from `REJECTED_NON_PDF_GENERATOR_IDS` appear in `CALCULATORS`. |

### Why Users Report "None of the PDF Tools Work"
In local Vite dev and local `vite preview`, all 33 `pdf-tools` execute cleanly when given valid PDFs and required parameters because Vite serves `pdf.worker.min.mjs` with `Content-Type: text/javascript` (`HTTP 200`). However, our fault-injection and deep-code audit identified **one suite-wide architectural fragility (`RC-01`)** plus **seven concrete code/UI defects (`RC-02`–`RC-08`)** that cause widespread failures in deployed environments or common user workflows:

1. **Suite-Wide Worker `.mjs` / Sub-Path Fragility (`RC-01` — CRITICAL):** Every PDF-producing tool runs `verifyPdfOutputIntegrity(..., { verifyWithPdfJs: true })` (`src/services/pdf/v2/pdfOutputIntegrity.ts:29`), and every reader/previewer calls `openManagedPdfDocument` (`src/services/pdf/pdfRuntime.ts:187`). When `pdf.worker.min.mjs` fails strict MIME checks (common on reverse proxies/CDNs that do not map `.mjs` to `application/javascript`, SPA `text/html` fallbacks, or sub-path deployments), Chromium **also fails PDF.js v6's fake-worker dynamic `import()` fallback**, crashing **every** PDF tool (`ERR_OUTPUT_INTEGRITY` on writers, `ERR_PDF_LOAD_FAILED` on readers, and thumbnail errors).
2. **UI & Upload Workflow Breakages (`RC-02`, `RC-05`, `RC-06`, `RC-07`):** Users uploading WebP/SVG/GIF/BMP images permitted by `pdf-images-to-pdf`'s file picker always hit `ERR_UNSUPPORTED_IMAGE_FORMAT`; clicking "Process PDF Document" right after uploading on parameter-dependent tools triggers immediate `[role="alert"]` errors; `DocumentConvertersWorkspace` rejects extensionless `application/pdf` files and provides no password field for encrypted PDFs.

---

## 2. Phase 1 & Phase 2 Verification Findings

### 2.1 Routing, Dispatch & Component Architecture
- **Route Resolution (`src/App.tsx:111-116`):** `/calculator/:calculatorId` matches `CALCULATORS` and mounts `CalculatorView`.
- **Workspace Dispatch (`src/components/CalculatorView.tsx:615-620`):** All `pdf-tools` mount `<PdfToolsWorkspace initialTool={calculator.id} />`; all `document-converters` mount `<DocumentConvertersWorkspace initialTool={calculator.id} />`. No hardcoded `case 'pdf-...'` overrides intercept them.
- **Category Navigation (`/categories/pdf-tools`):** Verified in Chromium (`0` console errors, clicking "Merge PDF" navigates to `/calculator/pdf-merge` and mounts `<PdfToolsWorkspace />`), **except** `PDF Metadata Editor` renders **2 duplicate cards** (`RC-04`).
- **Vite Production Build (`vite build` with Vite 8.3.0 / Rolldown):** Built cleanly to `/tmp/pdf-audit/dist`. Vite rewrote `new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url)` into `new URL('/assets/pdf.worker.min-B5Yc7dP4.mjs', '' + import.meta.url)` and emitted `/assets/pdf.worker.min-B5Yc7dP4.mjs` (confirmed `HTTP 200` in `vite preview` across all 53 tools).

### 2.2 Worker Script Loading & Fault-Injection Verification
- **Single Worker Configuration Point (`src/services/pdf/pdfRuntime.ts:12-40`):**
  ```ts
  const localWorkerUrl =
    typeof window !== 'undefined'
      ? new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString()
      : ...
  ```
- **Dev & Preview Network Check:** In both `localhost:3000` and `127.0.0.1:4173`, Chromium fetched `pdf.worker.min*.mjs` with `200 text/javascript`.
- **Simulated Worker MIME / SPA Fallback Failure (Verified in Chromium Playwright):**
  Intercepting `**/pdf.worker*.mjs*` with `200 text/html` (simulating an SPA fallback or strict `.mjs` MIME rejection) reproduced **100% suite failure**:
  - `pdf-compress`: `ALERT: Processing error Generated PDF failed independent PDF.js reopening verification: Setting up fake worker failed: "Failed to fetch dynamically imported module: .../pdf.worker.min.mjs".`
  - `pdf-split`: `thumbErr=1` ("Could not generate PDF page thumbnails.") + `ALERT: Processing error Generated PDF failed independent PDF.js reopening verification: Setting up fake worker failed...`
  - `pdf-page-counter`: `ALERT: Processing error Setting up fake worker failed: "Failed to fetch dynamically imported module: .../pdf.worker.min.mjs".`
- **Tesseract OCR Worker (`src/services/pdf/v2/pdfOcrEngine.ts:608`, `src/services/document/pdfExtractor.ts:222`):**
  Verified in Playwright network trace that `pdf-ocr` and OCR fallback fetch 3 assets from external CDN even though `node_modules/tesseract.js/dist/` exists locally:
  - `https://cdn.jsdelivr.net/npm/tesseract.js@v7.0.0/dist/worker.min.js`
  - `https://cdn.jsdelivr.net/npm/tesseract.js-core@v7.0.0/tesseract-core-relaxedsimd-lstm.wasm.js`
  - `https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz`
  Offline or CSP-restricted environments fail with `ERR_OCR_MODEL_LOAD_FAILED` (`RC-03`).

### 2.3 MIME Type Validation, File Upload & Processing Logic
| Check | Observed Chromium Behavior | Source Location | Root Cause |
|---|---|---|---|
| Uppercase `.PDF` with empty MIME `""` (`pdf-page-counter`) | **PASS** (`DOWNLOAD`) — `PdfToolsWorkspace` accepts and magic-bytes validation succeeds | `pdfValidation.ts:150` | — |
| Extensionless `no_extension_pdf` with `mimeType: "application/pdf"` in `PdfToolsWorkspace` (`pdf-split`) | **PARTIAL** — Processing succeeds (`DOWNLOAD`), but `PdfThumbnailPreview` does not render (`noExtThumbs: 0`) due to `.endsWith('.pdf')` check | `PdfToolsWorkspace.tsx:568` | `RC-06` |
| Extensionless `no_extension_pdf` with `mimeType: "application/pdf"` in `DocumentConvertersWorkspace` (`pdf-to-word-docx`) | **FAIL** at upload — `"Conversion error Unsupported or empty file. Please upload a valid file matching: .pdf"` (blocks before magic-byte check) | `DocumentConvertersWorkspace.tsx:154-162` | `RC-06` |
| `pdf-images-to-pdf` with valid `.webp`, `.svg`, `.gif`, `.bmp` | **FAIL** for all 4 formats — `ERR_UNSUPPORTED_IMAGE_FORMAT` despite `<input accept>` allowing them | `pdfRegistry.ts:8-9`; `pdfConversionExtractionEngine.ts:441-545` | `RC-02` |
| Encrypted PDF (`sample_encrypted.pdf`) in `DocumentConvertersWorkspace` (`pdf-to-word-docx`) | **FAIL** — `"Conversion error This PDF is password-protected..."` with no password input UI | `DocumentConvertersWorkspace.tsx:394-588`; `pdfExtractor.ts:243` | `RC-07` |
| Minimal valid `.ods` (ZIP with `mimetype` + `content.xml`, no `META-INF/manifest.xml`) in `ods-to-pdf-converter` | **FAIL** — `"Conversion error Unsupported ZIP file"` (SheetJS `XLSX.read`), whereas SheetJS-generated `.ods` passes | `officeParsers.ts:146`; `documentConversionEngine.ts:823` | `RC-08` |
| Default-click (upload 1 PDF, click Process immediately without extra inputs) | Triggers `[role="alert"]` errors on 10 tools (`pdf-merge`, `pdf-extractor-merger`, `pdf-extract-pages`, `pdf-page-extraction-tool`, `pdf-delete-pages`, `pdf-reorder-pages`, `pdf-page-reordering-tool`, `pdf-protect-password`, `pdf-remove-password`, `pdf-comparison`) | `PdfToolsWorkspace.tsx:1189-1193`; `pdfPageOrganizationEngine.ts:203-214` | `RC-05` |
| Partial thumbnail selection (click 2 of 3 thumbnails in `pdf-reorder-pages`) | Triggers `[role="alert"]`: `"Reorder permutation must include all 3 pages without omission (received 2 pages; missing: 3)"` | `pdfWorkspaceIntegration.ts:537-554` | `RC-05` |
| Corrupted/truncated PDF in `pdf-repair` | **PASS** — Recovered all 3 pages and fixed 3 anomalies, verified by PDF.js | `pdfOptimizationRepairEngine.ts` | — |
| `pdf-to-images` JPEG export mode | **PASS** — Downloaded `sample_main_images.zip` | `pdfConversionExtractionEngine.ts` | — |

---

## 3. Root Cause Summary & Minimal Remediation Plan (Not Applied)

| ID | Severity | Summary | Minimal Safe Remediation (Awaiting Approval) |
|---|---|---|---|
| **RC-01** | **CRITICAL** | `pdfRuntime.ts` relies on `.mjs` URL resolution + mandatory `verifyPdfOutputIntegrity(verifyWithPdfJs=true)`, causing 100% failure if `.mjs` MIME or subpath fails | Import worker via Vite `?url` (`pdfjs-dist/legacy/build/pdf.worker.min.mjs?url`) or bundle as `.js`; add graceful handling if worker script fails while preserving byte/structural checks |
| **RC-02** | **HIGH** | `pdf-images-to-pdf` `<input accept>` & `pdfErrors.ts` allow WebP/SVG/GIF/BMP while engine only accepts PNG/JPEG | Transcode browser-decodable WebP/SVG/GIF/BMP to PNG via Canvas before `embedPng`, or restrict `IMAGE_ACCEPT` and error messages to PNG/JPEG |
| **RC-03** | **HIGH** | `pdfOcrEngine.ts` & `pdfExtractor.ts` load Tesseract worker/WASM/models from `cdn.jsdelivr.net` despite local `tesseract.js` assets | Bundle/resolve `workerPath` & `corePath` from local `tesseract.js/dist` assets and document/handle offline language download errors cleanly |
| **RC-04** | **MEDIUM** | Duplicate `pdf-metadata-editor` catalog registration (`phase25` + `batch82d`) | Remove duplicate `pdf-metadata-editor` entry from `batch82d_group6.ts` (or `phase25_pdf_tools_expansion.ts`) |
| **RC-05** | **MEDIUM** | Enabled submit button on incomplete required inputs & confusing `pdf-extractor-merger` 1-file error | Validate required inputs/disable CTA with helper hint; clarify single-file error in `pdf-extractor-merger` |
| **RC-06** | **MEDIUM** | Extension-only rejection in `DocumentConvertersWorkspace` & `.endsWith('.pdf')` thumbnail gate in `PdfToolsWorkspace` | Inspect `file.type` and magic bytes (`%PDF-`, `PK`) as fallback when filename lacks extension |
| **RC-07** | **MEDIUM** | Encrypted PDFs fail in `DocumentConvertersWorkspace` with no password field | Add conditional password input for PDF-input converters and thread `password` into `extractPdfContent` |
| **RC-08** | **LOW-MED** | `ods-to-pdf-converter` fails on minimal `.ods` ZIPs missing `META-INF/manifest.xml` | Add `JSZip` `content.xml` fallback parser matching `odt-to-pdf-converter` / `odp-to-pdf-converter` |
| **RC-09** | **LOW** | Dead V1 `pdf-duplicate-pages` branch in `PdfToolsWorkspace.tsx:414` + dual `pdf-lib@1.17.1` dependency | Remove unreachable `pdf-duplicate-pages` V1 branch (or promote to V2) and drop redundant `pdf-lib@1.17.1` |

---

## 4. Verified Findings vs. Environment-Dependent / Untested Cases

- **Verified Directly in Chromium (Dev & Production Preview):**
  - All 53 unique tools route, render, accept valid fixtures, and execute (`52/53` pass across all fixtures; `53/53` pass when `ods-to-pdf-converter` receives a SheetJS-compliant `.ods` with `META-INF/manifest.xml`).
  - `RC-01` blast radius verified via route interception returning `text/html` for `pdf.worker.min.mjs`.
  - `RC-02`, `RC-03`, `RC-04`, `RC-05`, `RC-06`, `RC-07`, `RC-08`, `RC-09` all directly observed and reproduced in source + Chromium.
- **Environment-Dependent / Untested Cases:**
  - Live deployed Shared App URL / external reverse-proxy `.mjs` `Content-Type` headers were not directly probed externally (simulated via Vite preview and Playwright route interception).
  - Real-world multi-hundred-MB PDFs (>100 MB mobile / >250 MB desktop limits), legacy Adobe XFA forms (`ERR_XFA_UNSUPPORTED`), and legacy binary `.doc` / `.ppt` / `.xls` inputs were not stress-tested in Chromium.
  - Non-English (`es`) UI runs and offline/air-gapped `tesseract.js` runs were verified via code inspection rather than live offline Chromium execution.

**Audit Status:** Complete. **Awaiting user approval before modifying any source files.**
