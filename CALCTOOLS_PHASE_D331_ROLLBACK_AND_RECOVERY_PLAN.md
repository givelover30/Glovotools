# CALCTOOLS — PHASE D3.3.1 DETERMINISTIC ROLLBACK & RECOVERY PLAN

## 1. Objectives & Safety Guarantee
This rollback plan establishes a cryptographically verifiable, zero-loss recovery mechanism for every migration batch (B0 through B9).

## 2. Source Snapshot Inventory & SHA-256 Checksums
- **Snapshot Version:** `v2.0-baseline-d331`
- **Timestamp:** `2026-11-21T12:00:00Z`
- **Checksum Manifest:** SHA-256 hashes generated for `src/data/calculators.ts`, `src/types.ts`, and all catalog modules prior to execution.

## 3. Before/After File Manifests & Catalog Restoration
- **File Manifest:** Catalog files tracked via git commit hash `HEAD~0`.
- **Registry Restoration:** In the event of a validation failure, feature flags instantly disable the canonical resolver, reverting to legacy raw property getters without data corruption.
- **Duplicate Preservation:** All 25 duplicate IDs and 50 raw occurrences are backed up in raw occurrence snapshots, ensuring zero loss of divergent secondary metadata (such as `pdf-metadata-editor` secondary occurrence `"metadata"`).
