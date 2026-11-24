# CALCTOOLS — PHASE D3.2 CANONICAL TAXONOMY SPECIFICATION

## 1. Introduction & Objectives
This specification establishes the architectural blueprint for the CALCTOOLS 2.0 canonical taxonomy. It defines the formal data structures, parent-child integrity rules, registry schema, and governance principles governing subject categories, subcategories, and tool classifications.

## 2. Core Taxonomy Architecture
- **Subject Categories (52):** Top-level domain classifications organizing tools by subject matter.
- **Canonical Subcategories (492 existing + 76 proposed = 568 total):** Granular topical subdivisions within each subject category.
- **Primary Tool Hubs (21):** Independent discovery hubs (Calculators, Converters, Generators, etc.) orthogonal to subject categories and subcategories.

## 3. Parent-Child Integrity Rules
1. Every canonical subcategory belongs to **exactly one** valid subject category.
2. Canonical IDs are unique, lowercase kebab-case strings (`[a-z0-9-]+`).
3. Cross-category sharing of subcategory IDs is strictly prohibited.
4. Tool records must reference a valid subcategory belonging to their assigned subject category.

## 4. Zero-Subcategory Category Resolution
Three categories (`education-science`, `developer-it`, `text-writing`) currently have 0 registered subcategories. The approved proposals in Phase D3.2 introduce 22 structured subcategories across these domains (e.g., `edu-physics-classical-optics`, `dev-databases-sql`, `writing-markdown-docs`), fully resolving the historical categorization gap.
