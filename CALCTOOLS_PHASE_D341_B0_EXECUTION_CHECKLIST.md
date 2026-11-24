# CALCTOOLS 2.0 — PHASE D3.4.1 BATCH B0 EXECUTION & ROLLBACK CHECKLIST

- **Batch ID:** `B0` (Migration Safety Infrastructure & Baseline Snapshots)
- **Authorization Status:** **`PENDING_APPROVAL`** — **DO NOT EXECUTE WITHOUT EXPLICIT HUMAN AUTHORIZATION**
- **Repository VCS Status:** `NO_GIT_REPO` (No `.git` repository present; file-level snapshot backups + SHA-256 verification are **mandatory** because `git checkout` / `git clean` are unavailable)

---

## 1. B0 Scope & Strict Safety Boundary (Task 3)

### Allowed B0 Scope (Read-Only Tooling & Test Harness Only)
- Create `scripts/snapshot.ts` (deterministic baseline exporter + SHA-256 manifest generator).
- Create `tests/taxonomy.test.ts` (read-only invariant & baseline regression test suite).
- When executed post-authorization, generate snapshot artifacts exclusively inside `snapshots/`.

### Prohibited B0 Scope (Must Remain 100% Unmodified)
- **ZERO** modifications to `src/data/calculators.ts`, `src/data/toolClassification.ts`, `src/types.ts`, `src/data/categories/*`, or any of the **199** files under `src/data/catalog/`.
- **ZERO** modifications to routes, UI components (`src/components/*`), calculation engines (`src/engine/*`), search/i18n modules, or runtime behavior.
- **ZERO** modifications to `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, or `index.html`.
- **ZERO** modifications to pre-existing scripts (`scripts/create_zip.ts`, `scripts/generate_batch_files.ts`, `scripts/generate_translation_excel.ts`, `scripts/import_batch_01.ts`).

### Environment Constraints Verified During Preflight
1. **No Git Repository:** Workspace has no `.git` directory. All pre-B0 snapshots and rollback steps must use explicit file copies (`.b0_pre_snapshot_backup/`) and SHA-256 verification against `CALCTOOLS_PHASE_D341_B0_FILE_ROLLBACK_MANIFEST.csv`.
2. **Test Runner Constraint:** `package.json` does **not** install `vitest` or `jest`, whereas `tsx@^4.21.0` and Node.js `v22` built-in `node:test` / `node:assert` are already available. To avoid modifying `package.json`, `tests/taxonomy.test.ts` must use `node:test` + `node:assert/strict` and execute via `npx tsx --test tests/taxonomy.test.ts`.
3. **TypeScript Config Constraint:** `tsconfig.json` specifies `"include": ["src/**/*"]` and `"exclude": ["dist", "scripts"]`. Therefore `npm run lint` (`tsc --noEmit`) checks `src/**/*` only and does not compile `scripts/` or `tests/`; `scripts/snapshot.ts` and `tests/taxonomy.test.ts` must be type-checked directly or executed cleanly with `npx tsx` without altering `tsconfig.json`.

---

## 2. Pre-Execution Gate Checklist (Before Any B0 Write)

- [ ] **Gate 1 — Human Approval:** Explicit written authorization received for Batch `B0` only (`B1`–`B9` remain `PENDING_APPROVAL`).
- [ ] **Gate 2 — Verify Target Absence:** Confirm `scripts/snapshot.ts`, `tests/`, `tests/taxonomy.test.ts`, and `snapshots/` do not exist prior to B0 start:
  ```bash
  test ! -e scripts/snapshot.ts && test ! -d tests && test ! -d snapshots
  ```
- [ ] **Gate 3 — Capture Pre-B0 Backup Directory:** Because `NO_GIT_REPO`, mirror protected directories/files into `.b0_pre_snapshot_backup/` before writing any B0 file:
  ```bash
  mkdir -p .b0_pre_snapshot_backup
  cp -a src scripts package.json tsconfig.json vite.config.ts .gitignore index.html CALCTOOLS_PHASE_D22_CANONICAL_SUBCATEGORY_REGISTRY.csv CALCTOOLS_PHASE_D334_* .b0_pre_snapshot_backup/
  ```
- [ ] **Gate 4 — Verify Pre-B0 Checksums Match Manifest:** Confirm every protected file's live SHA-256 matches `CALCTOOLS_PHASE_D341_B0_FILE_ROLLBACK_MANIFEST.csv` (`222` protected baseline files).

---

## 3. Execution & Post-Execution Verification Checklist (Only After Authorization)

- [ ] **Step 1:** Implement `scripts/snapshot.ts` (read-only imports of `CALCULATORS`, `SUBCATEGORIES`, `CATEGORIES`; outputs deterministic JSON/CSV baseline snapshot & SHA-256 manifest to `snapshots/`).
- [ ] **Step 2:** Implement `tests/taxonomy.test.ts` using `node:test` + `node:assert/strict` verifying baseline counts (`4,400` raw, `4,375` unique, `25` duplicate IDs / `50` raw occurrences, `52` categories, `492` subcategories) and snapshot SHA-256 parity.
- [ ] **Step 3:** Run `npx tsx scripts/snapshot.ts` and `npx tsx --test tests/taxonomy.test.ts`.
- [ ] **Step 4 — Boundary Integrity Check:** Re-compute SHA-256 checksums for all `222` protected files in `CALCTOOLS_PHASE_D341_B0_FILE_ROLLBACK_MANIFEST.csv` and verify **0** byte or hash changes.
- [ ] **Step 5 — Build & Typecheck Gate:** Run `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build`) and confirm zero regressions.

---

## 4. Complete B0 Rollback & Recovery Procedure (Task 2)

If any safety boundary check fails, any unexpected file is modified, or B0 needs to be reverted to exact pre-B0 state:

### Step A — Remove B0-Created Files & Generated Snapshot Artifacts
```bash
rm -f scripts/snapshot.ts
rm -f tests/taxonomy.test.ts
rmdir tests 2>/dev/null || rm -rf tests
rm -rf snapshots
```

### Step B — Restore Protected Files if Any Boundary Drift Occurred
```bash
# Only needed if any protected file failed SHA-256 parity check:
cp -a .b0_pre_snapshot_backup/src/* src/
cp -a .b0_pre_snapshot_backup/scripts/* scripts/
cp -p .b0_pre_snapshot_backup/package.json package.json
cp -p .b0_pre_snapshot_backup/tsconfig.json tsconfig.json
cp -p .b0_pre_snapshot_backup/vite.config.ts vite.config.ts
cp -p .b0_pre_snapshot_backup/.gitignore .gitignore
cp -p .b0_pre_snapshot_backup/index.html index.html
cp -p .b0_pre_snapshot_backup/CALCTOOLS_PHASE_D22_CANONICAL_SUBCATEGORY_REGISTRY.csv .
cp -p .b0_pre_snapshot_backup/CALCTOOLS_PHASE_D334_* .
```

### Step C — Post-Rollback Cryptographic Verification
1. Verify all B0 targets and snapshot artifacts are absent:
   ```bash
   test ! -e scripts/snapshot.ts && test ! -e tests/taxonomy.test.ts && test ! -d tests && test ! -d snapshots
   ```
2. Verify SHA-256 checksum and byte size of all `222` protected files against `CALCTOOLS_PHASE_D341_B0_FILE_ROLLBACK_MANIFEST.csv`:
   - `package.json`: `1212` bytes, `8936bb03472991750f71c5e4177f0314b22b6cbfa27dd9290c5224e621cf2cfa`
   - `tsconfig.json`: `599` bytes, `4c2b1bd889252c5cb66003204b5d7e0f68ffa8d6cbeb01d29c4192135072b2b2`
   - `vite.config.ts`: `705` bytes, `a7aa711292e5ad7eb10f7a17f5f34fbbf75c7b7c24d59cb0212c60bc493c3208`
   - `src/types.ts`: `2374` bytes, `f3d78d5742c7afbb5dece156076f13a2c1fda5d37bd2b846b8e6db6f0f9d1ecf`
   - `src/data/calculators.ts`: `80840` bytes, `981ef0dff9b2ad5190ba5f7c13b7a785d0a807407e6c4d975cafce647f5b25b2`
   - `src/data/toolClassification.ts`: `16785` bytes, `6f0287d04e4f8b58d78287c17aa6a96dac9c550ea45d90fc2d9e763b4fe1a528`
   - All `199` files in `src/data/catalog/*.ts` (100% per-file SHA-256 match)
3. Clean up `.b0_pre_snapshot_backup/` **only after** Step C1 and C2 return 100% pass.

### Step D — Failure Handling if Rollback Verification Fails
1. **Immediate Halt:** Freeze all migration batches (`B0`–`B9`) and stop any running processes locking files in `scripts/`, `tests/`, `snapshots/`, or `src/`.
2. **Preserve Forensic State:** Do **not** delete `.b0_pre_snapshot_backup/`; capture `ls -la`, `sha256sum` mismatches, and process state to an incident log.
3. **Manual Byte-Level Restore:** Re-copy mismatched files individually from `.b0_pre_snapshot_backup/`, verify disk write sync (`sync`), and re-run `CALCTOOLS_PHASE_D341_B0_FILE_ROLLBACK_MANIFEST.csv` checksum verification.
4. **Escalation:** If checksum parity still fails or any protected `src/data/*` file cannot be verified against its pre-B0 SHA-256, abort migration and escalate to human engineering owner before any further workspace writes.
