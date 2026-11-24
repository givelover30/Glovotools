# GLOVOTOOLS Phase B2 — Orphan Category Investigation & Decision Report

## 1. Overview
During Phase A, 6 orphan subject categories containing **756 unique tools** were discovered in `CALCULATORS` metadata but were absent from `CATEGORIES`.

## 2. Category-by-Category Architectural Decision

| Orphan Category ID | Unique Tools | Proposed Architectural Decision | Rationale & Migration Impact |
|---|---:|---|---|
| `education-science` | 407 | **Promote to Canonical Subject Category** | Primary bucket for scientific simulators, astronomy, physics, and chemistry tools. |
| `developer-it` | 227 | **Promote to Canonical Subject Category** | Essential bucket for developer, database, cloud, and IT infrastructure utilities. |
| `text-writing` | 56 | **Promote to Canonical Subject Category** | Core category for readability analysis, markdown editors, and text utilities. |
| `health` | 56 | **Merge into canonical `health-fitness`** | Aligns clinical and fitness calculators under a unified health domain. |
| `image-design` | 9 | **Merge into `additional-tools`** | Consolidates graphic/design tools into digital utilities. |
| `lifestyle` | 1 | **Merge into `everyday`** | Consolidates consumer lifestyle tools into everyday calculators. |

## 3. Recommendation
Officially register all 6 orphan categories in `CATEGORIES` with clean titles and icons to instantly integrate all 756 orphaned tools into the main navigation hierarchy.
