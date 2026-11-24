# CALCTOOLS — PHASE D3.3 ROLLBACK & RECOVERY PLAN

## 1. Objectives
Ensure instantaneous, zero-loss rollback capability at any stage of the migration process.

## 2. Rollback Artifacts & Procedures
- **Pre-Migration Snapshots:** Full JSON and CSV exports of `CALCULATORS`, `SUBCATEGORIES`, and `CATEGORIES` stored prior to executing Batch B1.
- **Feature Flag Isolation:** All migration resolvers wrapped behind feature flags (`ENABLE_CANONICAL_RESOLVER`).
- **Batch Reversal:** Individual batch rollback scripts restoring file git states and registry pointers.
