# CALCTOOLS Phase A — Data Integrity & Registry Audit Report

## 1. Catalog Integrity Summary
- **Raw Catalog Entries (`CALCULATORS`):** 4,400
- **Unique Tool IDs:** 4,375
- **Duplicate Raw Entries:** 25
- **Missing/Blank Tool IDs:** 0
- **Missing/Blank Tool Names:** 0
- **Canonical Categories (`CATEGORIES`):** 49 (0 duplicates, 0 empty)
- **Canonical Subcategories (`SUBCATEGORIES`):** 492 (0 duplicates, 5 empty: `reptiles`, `amphibians`, `insects`, `arachnids`, `other-invertebrates`)
- **Custom Component Files (`src/components/calculators/`):** 174 files covering 197 switch cases (0 unreferenced component files)
- **Registered Calculation Contracts (`ALL_REGISTERED_CONTRACTS`):** 406 entries (404 unique IDs, 2 duplicate IDs: `college-savings-529-calc`, `inventory-turnover-calc`)

## 2. Execution Layer Coverage Breakdown (4,375 Unique Tools)
- **Custom React Component Switch Cases:** 197
- **ToolsWorkspace (`category === "tools"`):** 43
- **PdfToolsWorkspace (`category === "pdf-tools"`):** 33
- **DocumentConvertersWorkspace (`category === "document-converters"`):** 20
- **Explicit Registered Calculation Contracts:** 329
- **Dynamic 2-Parameter Formula Engine Fallback:** 3753

## 3. All 25 Duplicate Raw Records

| # | Tool ID | First Index | Dup Index | First Name | Dup Name | Divergent Fields |
|---:|---|---:|---:|---|---|---|
| 1 | `college-savings-529-calc` | 157 | 1552 | 529 College Savings Calculator | 529 College Savings Growth & Contribution Calculator | name, subcategoryId, shortDesc, formula |
| 2 | `roof-pitch-calc` | 211 | 1558 | Roof Pitch & Slope Multiplier Calculator | Roof Pitch & Rafter Length Calculator | name, subcategoryId, shortDesc, formula |
| 3 | `student-loan-payoff-calc` | 313 | 1566 | Student Loan Payoff & Repayment Calculator | Student Loan Payoff Acceleration Calculator | name, category, subcategoryId, shortDesc, formula |
| 4 | `water-intake-calc` | 235 | 1573 | Daily Water Intake & Hydration Calculator | Water Intake & Daily Hydration Calculator | name, subcategoryId, shortDesc, formula |
| 5 | `roof-shingle-calc` | 210 | 1580 | Roofing Shingles & Bundles Calculator | Roof Shingle & Underlayment Estimator | name, subcategoryId, shortDesc, formula |
| 6 | `macro-protein-calc` | 233 | 1581 | Daily Protein Requirement Calculator | Macro Nutrient & Daily Protein Target Calculator | name, subcategoryId, shortDesc, formula |
| 7 | `iban-validator` | 425 | 1721 | IBAN & Bank Account Number Validator | IBAN Validator | name, category, subcategoryId, shortDesc, formula |
| 8 | `pdf-metadata-editor` | 1510 | 1729 | PDF Metadata Editor | PDF Metadata Editor | subcategoryId, shortDesc, formula |
| 9 | `css-gradient-generator` | 466 | 1752 | CSS Linear & Radial Gradient Generator | CSS Gradient Generator | name, category, subcategoryId, shortDesc, formula |
| 10 | `markdown-to-html-converter` | 615 | 1772 | Markdown-to-HTML Converter & Sanitizer | Markdown to HTML Converter | name, category, subcategoryId, shortDesc, formula |
| 11 | `freelance-client-project-organizer` | 1652 | 1943 | Freelance Client & Project Organizer | Freelance Client & Project Milestone Organizer | name, category, shortDesc, formula |
| 12 | `asphalt-paving-tonnage-calculator` | 999 | 2180 | Asphalt Paving Tonnage Calculator | Asphalt Paving Volume & Tonnage Calculator | name, subcategoryId, shortDesc, formula |
| 13 | `password-entropy-crack-time-calculator` | 913 | 2457 | Password Entropy & Crack Time Calculator | Password Entropy & Brute-Force Crack Time Calculator | name, category, subcategoryId, shortDesc, formula |
| 14 | `enzyme-kinetics-michaelis-menten-calculator` | 1212 | 2506 | Enzyme Kinetics & Michaelis-Menten Calculator | Michaelis-Menten Enzyme Kinetics & Vmax / Km Calculator | name, category, subcategoryId, shortDesc, formula |
| 15 | `clothing-shoe-international-size-converter` | 1320 | 2578 | International Clothing & Shoe Size Converter | International Clothing, Dress, & Shoe Size Converter | name, category, subcategoryId, shortDesc, formula |
| 16 | `solar-battery-microgrid-dispatch-optimizer` | 2408 | 2608 | Solar PV & Battery Energy Storage Microgrid Dispatch Optimizer | Solar PV & Battery Energy Storage Microgrid Dispatch Optimizer | shortDesc, formula |
| 17 | `data-center-server-cooling-airflow-optimizer` | 2413 | 2613 | Data Center Server Rack Airflow & Cooling Fan Speed Optimizer | Data Center Server Rack Airflow & Cooling Fan Speed Optimizer | shortDesc |
| 18 | `commercial-greenhouse-lighting-schedule-optimizer` | 2414 | 2614 | Commercial Greenhouse Supplemental Lighting Optimizer | Commercial Greenhouse Supplemental Lighting Optimizer | Identical |
| 19 | `commercial-pizzeria-dough-fermentation-optimizer` | 2415 | 2615 | Commercial Pizzeria Dough Cold Fermentation Optimizer | Commercial Pizzeria Dough Cold Fermentation Optimizer | shortDesc |
| 20 | `municipal-water-network-pressure-optimizer` | 2417 | 2617 | Municipal Water Distribution Network Pressure Optimizer | Municipal Water Distribution Network Pressure Optimizer | shortDesc |
| 21 | `bone-mineral-density-t-score-z-score-calculator` | 2544 | 2744 | Bone Mineral Density T-Score & Osteoporosis Risk Calculator | Bone Mineral Density T-Score & Osteoporosis Risk Calculator | Identical |
| 22 | `rolling-element-bearing-l10h-fatigue-life` | 2631 | 3132 | Rolling Element Bearing L10h Fatigue Life Calculator | Rolling Element Bearing L10h Dynamic Load Rating & Life | name, category, subcategoryId, shortDesc |
| 23 | `adv-quantum-shor-factoring-qubit-requirement` | 3426 | 4150 | Shor Algorithm Qubit & Gate Count Requirement Estimator | Shor Algorithm Quantum Circuit & Qubit Resource Estimator | name, subcategoryId, shortDesc, formula |
| 24 | `adv-quantum-optical-bell-state-generator-efficiency` | 3436 | 4160 | Spontaneous Parametric Down-Conversion (SPDC) Bell Pair Rate | Spontaneous Parametric Down-Conversion (SPDC) Photon Pair Rate | name, category, subcategoryId, shortDesc, formula |
| 25 | `adv-quantum-error-mitigation-zero-noise-extrapolation` | 3447 | 4166 | Zero-Noise Extrapolation (ZNE) Quantum Error Mitigation | Zero-Noise Extrapolation (ZNE) Quantum Error Mitigation | subcategoryId, shortDesc, formula |

## 4. Critical Integrity Issues Discovered

1. **6 Orphan Subject Categories (756 unique tools):** `education-science` (407), `developer-it` (227), `text-writing` (56), `health` (56), `image-design` (9), `lifestyle` (1) are absent from `CATEGORIES`.
2. **1,039 Orphan Subcategory IDs (2770 unique tools):** Refer to `subcategoryId` values missing from `SUBCATEGORIES`.
3. **9 Broken Subcategory Routes:** All 9 belong to `categoryId: "tools"` (`parent.slug = "tools"`), where `getSubcategoryBySlug("tools", s.slug)` calls `getCategoryBySlug("tools")`, which aliases `"tools"` to `"additional-tools"` so the subcategory lookup searches `categoryId === "additional-tools"` instead of `"tools"`.
4. **10 Category Count Drifts:** `CategoryMeta.count` counts raw rows instead of deduplicated unique IDs (`financial`: 293 raw vs 290 unique; `business`: 259 raw vs 258 unique; `construction`: 280 raw vs 276 unique; `health-fitness`: 88 raw vs 86 unique; `electrical`: 125 raw vs 124 unique; `engineering`: 455 raw vs 454 unique; `everyday`: 125 raw vs 124 unique; `cybersecurity-data`: 111 raw vs 108 unique; `planners`: 179 raw vs 178 unique; `pdf-tools`: 34 raw vs 33 unique).
5. **Contract Registry Issues:** 2 duplicate contracts (`college-savings-529-calc`, `inventory-turnover-calc`) and 3 category mismatches between contracts and catalog metadata.
