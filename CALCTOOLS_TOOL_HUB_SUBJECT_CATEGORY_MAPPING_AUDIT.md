# CALCTOOLS 2.0 — Tool Hub Subject-Category Mapping Audit & Correction Report

## Executive Summary

- **Scope:** All **20 verified Tool Hubs** (`TOOL_HUBS`), **49 canonical subject categories** (`CATEGORIES`), **4,400 raw catalog entries**, and **4,375 unique tool IDs** (`CALCULATORS`).
- **Root Cause:** `CategoriesPage.tsx` previously aggregated every `calc.category` from all tools returned by `getPrimaryToolHub(calc)` without verifying whether the tool genuinely belonged to that Tool Hub's functional domain. Because `getPrimaryToolHub(calc)` relies on unanchored `.includes(...)` substring matching and a generic `'Calculators'` default fallback, keyword collisions (e.g., `'plan'` inside `'plant'`/`'plank'`/`'implant'`/`'planetary'`, `'log'` inside `'logistics'`/`'logarithm'`/`'logic'`/`'parallelogram'`, `'merge'`/`'split'`/`'compress'` inside `'emergency'`/`'merger'`/`'bill split'`/`'vapor-compression'`, `'diff'` inside `'differential'`/`'diffusion'`, `'count'` inside `'discount'`/`'account'`, `'edit'` inside `'credit'`, `'format'` inside `'transformation'`/`'information'`, `'project'` inside `'projectile'`/`'projection'`, and static `'guides'` entries falling into `'Calculators'`) caused unrelated subject categories to appear inside Tool Hub cards and Tool Hub detail views.
- **Data-Driven Fix Implemented:**
  - Added `HubSubjectCategoryAssociation`, `isVerifiedHubCategoryTool(calc, hubTitle)`, and `getHubSubjectCategoryAssociations(hubTitle, calculators, categories)` in `src/data/toolClassification.ts`.
  - Updated `src/components/CategoriesPage.tsx` to populate `hubRecords[i].coreCategories` using `getHubSubjectCategoryAssociations(title, CALCULATORS, CATEGORIES)`.
  - Total subject-category associations across all 20 Tool Hubs tightened cleanly from **283 -> 209** (**74 unrelated/false-positive category associations removed**).
- **Strict Preservation Confirmed:**
  - `TOOL_HUBS` and `getPrimaryToolHub(calc)` were **NOT modified** — zero tools moved between primary Tool Hubs.
  - All 20 hub unique tool counts remain identical and sum to exactly **4,375 unique tools** (**4,400 raw catalog entries**, 25 duplicates deduplicated cleanly).
  - All 49 subject categories, 492 subcategories, tool cards, search, pagination, favorites, routes, and storage schemas remain unchanged.

---

## Summary Comparison Across All 20 Tool Hubs

| # | Tool Hub | Unique Tools | Raw Entries | Categories Before | Categories After | Removed Categories |
|---:|---|---:|---:|---:|---:|---:|
| 1 | Calculators | 2,125 | 2,134 | 41 | 39 | 2 |
| 2 | Converters | 191 | 193 | 16 | 15 | 1 |
| 3 | Generators | 167 | 169 | 9 | 7 | 2 |
| 4 | Planners | 246 | 247 | 24 | 14 | 10 |
| 5 | Trackers | 279 | 279 | 22 | 13 | 9 |
| 6 | Counters | 44 | 44 | 13 | 9 | 4 |
| 7 | Analyzers | 58 | 58 | 11 | 10 | 1 |
| 8 | Checkers | 149 | 149 | 13 | 6 | 7 |
| 9 | Validators | 71 | 72 | 8 | 8 | 0 |
| 10 | Estimators | 113 | 115 | 17 | 17 | 0 |
| 11 | Finders | 41 | 41 | 9 | 9 | 0 |
| 12 | Comparators | 34 | 34 | 16 | 8 | 8 |
| 13 | Optimizers | 112 | 117 | 8 | 8 | 0 |
| 14 | Simulators | 79 | 79 | 9 | 9 | 0 |
| 15 | Testers | 76 | 76 | 14 | 7 | 7 |
| 16 | Document & PDF | 118 | 119 | 17 | 4 | 13 |
| 17 | Editors | 37 | 37 | 4 | 2 | 2 |
| 18 | Formatters | 55 | 55 | 7 | 4 | 3 |
| 19 | Organizers | 25 | 25 | 11 | 10 | 1 |
| 20 | Business & Management | 355 | 357 | 14 | 10 | 4 |
| **Total** | **20 Hubs** | **4,375** | **4,400** | **283** | **209** | **74** |

---

## Detailed Before-and-After Audit by Tool Hub

### 1. Calculators (`2,125` unique / `2,134` raw)
- **Categories:** `41 -> 39`
- **Removed (2):**
  - `Guides & References (160)` — static educational cheat sheets, glossaries, and reference tables that reached the default fallback.
  - `Checkers & Validators (2)` — audit tools (`HTTP Security Response Header Auditor`, `HTML5 Semantic Tag Structure Auditor`) without calculator functionality.
- **Adjusted:** `Cybersecurity & Data Management (80 -> 79)` (removed 1 web-vitals auditor).
- **Retained (39):** Engineering Calculators (403), Construction Calculators (180), Electrical Calculators (94), Cybersecurity & Data Management (79), Health & Fitness Calculators (78), Additional Tools & Utilities (73), Everyday Calculators (69), Energy & Solar Calculators (69), Aviation & Transportation (63), Environmental & Sustainability (37), Scientific Calculators (35), Basic Math Calculators (33), Business Operations Calculators (32), Automotive & Transport Calculators (31), Geometry Calculators (24), Statistics & Probability Calculators (24), Healthcare Operations Calculators (24), Telecommunications & Internet (24), Developer & Everyday Digital Tools (24), Algebra Calculators (21), Animal World Calculators (14), Trigonometry Calculators (12), Date & Time Calculators (11), Agriculture & Farming Calculators (10), Sports & Athletics Performance (9), Logistics & Shipping Calculators (7), Food Service & Hospitality (7), Tax & Accounting Calculators (6), Real Estate & Property Calculators (6), E-commerce & Retail Calculators (6), Salary & Compensation Calculators (5), Insurance & Risk Calculators (3), Manufacturing & Inventory Calculators (3), Personal Productivity & Planning (3), Unit Converter & Measurement Tools (3), Banking & Savings Calculators (2), Real Estate Development (2), Retail & Supply Chain (2), Legal & Compliance (1).

### 2. Converters (`191` unique / `193` raw)
- **Categories:** `16 -> 15`
- **Removed (1):**
  - `Trackers & Metrics (1)` — `Startup SAFE & Convertible Note Cap Table Tracker` (financial cap-table tracker matched only via `'convertible'`).
- **Retained (15):** Unit Converter & Measurement Tools (124), Electrical Calculators (10), Additional Tools & Utilities (8), Everyday Calculators (6), Basic Math Calculators (4), Developer & Everyday Digital Tools (4), Financial Calculators (3), Energy & Solar Calculators (3), Business Calculators (2), Date & Time Calculators (2), Engineering Calculators (2), Trigonometry Calculators (1), Statistics & Probability Calculators (1), Food Service & Hospitality (1), Generators & Utilities (1).

### 3. Generators (`167` unique / `169` raw)
- **Categories:** `9 -> 7`
- **Removed (2):**
  - `Electrical Calculators (5)` — standby/microgrid/black-start/TEG electrical hardware generator sizing calculators.
  - `Energy & Solar Calculators (1)` — DC-OPF power grid generator dispatch cost model.
- **Adjusted:** `Engineering Calculators (3 -> 1)` (retained `Cubic and Quintic Polynomial Trajectory Profile Generator`; removed MHD/piezoelectric hardware power calculators).
- **Retained (7):** Generators & Utilities (116), Additional Tools & Utilities (8), Business Calculators (4), Developer & Everyday Digital Tools (3), Financial Calculators (2), E-commerce & Retail Calculators (2), Engineering Calculators (1).

### 4. Planners (`246` unique / `247` raw)
- **Categories:** `24 -> 14`
- **Removed (10):**
  - `Trackers & Metrics (3)` — plant growth & reserved-instance expiry trackers.
  - `Additional Tools & Utilities (1)` — `Indoor Plant Sunlight Exposure & Window Utility` (`'plant'` substring collision).
  - `Guides & References (3)` — houseplant/gardening reference guides (`'plant'` substring collision).
  - `Telecommunications & Internet (1)` — `Internet Plan Cost Comparator` (comparator tool).
  - `Environmental & Sustainability (3)` — wastewater treatment plant calculators (`'plant'` substring collision).
  - `Electrical Calculators (1)` — `Virtual Power Plant (VPP) Aggregated DER Dispatch Optimizer` (`'plant'` substring collision).
  - `Cybersecurity & Data Management (1)` — RRT* path cost convergence math tool.
  - `Energy & Solar Calculators (2)` — geothermal binary cycle power plant calculators (`'plant'` substring collision).
  - `Automotive & Transport Calculators (1)` — planetary gear ratio (`'planetary'` substring collision).
  - `Healthcare Operations Calculators (1)` — cochlear implant frequency allocation (`'implant'` substring collision).
- **Adjusted:** `Construction Calculators (4 -> 1)` (kept `Home Renovation Project Planner`; excluded vinyl plank & chiller/wastewater plant tools), `Engineering Calculators (9 -> 2)` (kept quintic trajectory & potential-field path planning), `Aviation & Transportation (5 -> 1)` (kept `Commercial Jet Trip Fuel Burn, Contingency & Alternate Reserve Planning`), `Agriculture & Farming Calculators (3 -> 1)` (kept `Garden Planting Calendar Planner`), `Retail & Supply Chain (2 -> 1)`.
- **Retained (14):** Planners & Organizers (170), Business Calculators (10), Everyday Calculators (5), Personal Productivity & Planning (3), Financial Calculators (2), Engineering Calculators (2), Education & Student Finance (2), Construction Calculators (1), Health & Fitness Calculators (1), Date & Time Calculators (1), Agriculture & Farming Calculators (1), Food Service & Hospitality (1), Aviation & Transportation (1), Retail & Supply Chain (1).

### 5. Trackers (`279` unique / `279` raw)
- **Categories:** `22 -> 13`
- **Removed (9):**
  - `Logistics & Shipping Calculators (31)` — matched `'log'` in `logistics` / `log-`.
  - `Business Calculators (23)` — matched `'log'` in `log-` / `logistics`.
  - `Guides & References (7)` — matched `'log'` in `methodology` / `metrology` / `technology`.
  - `Engineering Calculators (4)` — database WAL/undo logs, Bayesian log-odds, holographic grating.
  - `Scientific Calculators (3)` — logarithm calculators (`'log'` substring collision).
  - `Geometry Calculators (1)` — `Parallelogram Area Calculator` (`'log'` inside `'parallelogram'`).
  - `Date & Time Calculators (1)` — `Corrected Gestational Age Calculator` (`'log'` in `chronological`).
  - `Environmental & Sustainability (1)` — GHG radiative forcing logarithmic formula.
  - `Healthcare Operations Calculators (1)` — EEG spectral power density.
- **Adjusted:** `Health & Fitness Calculators (6 -> 2)`, `Construction Calculators (3 -> 1)` (retained `Household Maintenance Tracker`), `Cybersecurity & Data Management (4 -> 1)` (retained `SSL/TLS Certificate Validity Days, Expiry & Cipher Suite Auditor`), `Additional Tools & Utilities (2 -> 1)` (retained `Log Storage & Retention Size Calculator`; excluded Boolean Logic).
- **Retained (13):** Trackers & Metrics (156), Financial Calculators (2), Health & Fitness Calculators (2), Energy & Solar Calculators (2), Animal World Calculators (2), Personal Productivity & Planning (2), Developer & Everyday Digital Tools (2), Construction Calculators (1), Everyday Calculators (1), Automotive & Transport Calculators (1), Education & Student Finance (1), Cybersecurity & Data Management (1), Additional Tools & Utilities (1).

### 6. Counters (`44` unique / `44` raw)
- **Categories:** `13 -> 9`
- **Removed (4):**
  - `Financial Calculators (11)` — matched `'account'` or `'discount'`.
  - `Everyday Calculators (2)` — sales discount calculators (`'discount'`).
  - `Guides & References (2)` — accounting & accounts receivable glossaries.
  - `Energy & Solar Calculators (1)` — battery rainflow cycle counting aging model.
- **Adjusted:** `Business Calculators (4 -> 1)` (retained `Toyota Kanban Card Count`), `Engineering Calculators (4 -> 1)` (retained `Apache Kafka Partition Count`), `Additional Tools & Utilities (2 -> 1)` (retained `Code Repository Token Counter`).
- **Retained (9):** Cybersecurity & Data Management (3), Construction Calculators (2), Scientific Calculators (1), Business Calculators (1), Date & Time Calculators (1), Engineering Calculators (1), E-commerce & Retail Calculators (1), Developer & Everyday Digital Tools (1), Additional Tools & Utilities (1).

### 7. Analyzers (`58` unique / `58` raw)
- **Categories:** `11 -> 10`
- **Removed (1):**
  - `Sports & Athletics Performance (1)` — `Baseball Sabermetrics: Batting Average & OBP Calculator` (matched `'stats'` in ID).
- **Retained (10):** Business Calculators (11), Financial Calculators (8), Construction Calculators (5), Everyday Calculators (3), Statistics & Probability Calculators (2), Cybersecurity & Data Management (2), E-commerce & Retail Calculators (1), Automotive & Transport Calculators (1), Developer & Everyday Digital Tools (1), Additional Tools & Utilities (1).

### 8. Checkers (`149` unique / `149` raw)
- **Categories:** `13 -> 6`
- **Removed (7):**
  - `Planners & Organizers (3)` — moving/packing/go-bag checklists (`'checklist'`).
  - `Generators & Utilities (2)` — checklist generators (`'checklist'`).
  - `Guides & References (2)` — camping & bicycle maintenance checklists (`'guides'`).
  - `Financial Calculators (1)` — `Take-Home Paycheck Calculator` (`'paycheck'`).
  - `Salary & Compensation Calculators (1)` — `W-4 Paycheck Withholding Estimator` (`'paycheck'`).
  - `Trackers & Metrics (1)` — `Developer Onboarding & Setup Checklist Tracker`.
  - `Aviation & Transportation (1)` — aircraft heavy maintenance check optimization.
- **Adjusted:** `Additional Tools & Utilities (4 -> 3)` (excluded luggage weight/dimension utility).
- **Retained (6):** Checkers & Validators (113), Construction Calculators (11), Business Calculators (3), Additional Tools & Utilities (3), Developer & Everyday Digital Tools (2), Education & Student Finance (1).

### 9. Validators (`71` unique / `72` raw)
- **Categories:** `8 -> 8`
- **Removed (0):** None.
- **Adjusted:** `Financial Calculators (4 -> 3)` (excluded PoS cryptocurrency staking validator rewards calculator; kept IBAN/BIC, Luhn credit card, and EU VAT format validators).
- **Retained (8):** Checkers & Validators (34), Financial Calculators (3), Everyday Calculators (3), Cybersecurity & Data Management (2), Additional Tools & Utilities (2), Date & Time Calculators (1), E-commerce & Retail Calculators (1), Developer & Everyday Digital Tools (1).

### 10. Estimators (`113` unique / `115` raw)
- **Categories:** `17 -> 17`
- **Removed (0):** None — all 17 categories verified to contain genuine estimation tools.
- **Retained (17):** Construction Calculators (35), Financial Calculators (10), Business Calculators (9), Everyday Calculators (9), Cybersecurity & Data Management (7), Engineering Calculators (4), Additional Tools & Utilities (4), Logistics & Shipping Calculators (3), Agriculture & Farming Calculators (3), Environmental & Sustainability (3), Aviation & Transportation (2), Developer & Everyday Digital Tools (2), Electrical Calculators (1), Animal World Calculators (1), Telecommunications & Internet (1), Legal & Compliance (1), Checkers & Validators (1).

### 11. Finders (`41` unique / `41` raw)
- **Categories:** `9 -> 9`
- **Removed (0):** None — all 9 categories verified to contain genuine finder/lookup utilities.
- **Retained (9):** Additional Tools & Utilities (5), Everyday Calculators (4), Basic Math Calculators (2), Algebra Calculators (1), Statistics & Probability Calculators (1), Financial Calculators (1), Business Calculators (1), Construction Calculators (1), Date & Time Calculators (1).

### 12. Comparators (`34` unique / `34` raw)
- **Categories:** `16 -> 8`
- **Removed (8):**
  - `Engineering Calculators (5)` — differential drive kinematics, Arrhenius diffusion, Schroeder diffuser, acousto-optic diffraction.
  - `Cybersecurity & Data Management (2)` — Diffie-Hellman key exchange, differential privacy.
  - `Date & Time Calculators (1)` — `Date Difference & Business Days Calculator` (`'diff'` in `'difference'`).
  - `Algebra Calculators (1)` — `Difference of Squares Calculator` (`'diff'` in `'difference'`).
  - `Energy & Solar Calculators (1)` — perovskite exciton diffusion.
  - `Telecommunications & Internet (1)` — differential group delay.
  - `Aviation & Transportation (1)` — cabin pressurization differential.
  - `Healthcare Operations Calculators (1)` — polymer migration & diffusion.
- **Adjusted:** `Additional Tools & Utilities (4 -> 2)` (kept 2 text diff/comparison tools; excluded numerical differentiation), `Automotive & Transport Calculators (3 -> 2)` (kept lease vs. buy & car ownership comparators; excluded Limited Slip Differential).
- **Retained (8):** Financial Calculators (3), Automotive & Transport Calculators (2), Additional Tools & Utilities (2), Basic Math Calculators (1), Construction Calculators (1), Everyday Calculators (1), Insurance & Risk Calculators (1), Education & Student Finance (1).

### 13. Optimizers (`112` unique / `117` raw)
- **Categories:** `8 -> 8`
- **Removed (0):** None — all 8 categories verified to contain genuine optimization tools.
- **Retained (8):** Business Calculators (50), Construction Calculators (18), Financial Calculators (15), Electrical Calculators (6), Everyday Calculators (2), Energy & Solar Calculators (2), Agriculture & Farming Calculators (1), Aviation & Transportation (1).

### 14. Simulators (`79` unique / `79` raw)
- **Categories:** `9 -> 9`
- **Removed (0):** None — all 9 categories verified to contain genuine simulation tools.
- **Retained (9):** Financial Calculators (17), Business Calculators (14), Construction Calculators (11), Electrical Calculators (7), Cybersecurity & Data Management (2), Automotive & Transport Calculators (1), Environmental & Sustainability (1), Checkers & Validators (1), Additional Tools & Utilities (1).

### 15. Testers (`76` unique / `76` raw)
- **Categories:** `14 -> 7`
- **Removed (7):**
  - `Guides & References (3)` — QA/NDT testing reference guides.
  - `Business Calculators (2)` — current/quick acid-test liquidity ratio formulas.
  - `Financial Calculators (2)` — ASC 350 goodwill impairment & acid-test liquidity ratio.
  - `Health & Fitness Calculators (1)` — `Bodybuilding Contest Prep Macro Calculator` (`'contest'`).
  - `Business Operations Calculators (1)` — `Corrugated Box Edge Crush Test (ECT) Calculator`.
  - `Construction Calculators (1)` — hydraulic conductivity permeability test.
  - `Engineering Calculators (1)` — Horner plot well pressure buildup test.
- **Retained (7):** Checkers & Validators (32), Statistics & Probability Calculators (4), Additional Tools & Utilities (4), Date & Time Calculators (2), Scientific Calculators (1), Personal Productivity & Planning (1), Developer & Everyday Digital Tools (1).

### 16. Document & PDF (`118` unique / `119` raw)
- **Categories:** `17 -> 4`
- **Removed (13):**
  - `Engineering Calculators (12)` — compressible gas/pipe flow, vapor-compression refrigeration, columnar DB compression, NoSQL document store.
  - `Everyday Calculators (9)` — restaurant bill split & trip gas split calculators (`'split'`).
  - `Planners & Organizers (5)` — emergency fund/supply & workout/microservices split planners.
  - `Financial Calculators (5)` — emergency fund/runway & M&A merger EPS calculators.
  - `Cybersecurity & Data Management (3)` — Shannon entropy, IPv6 compression, JSON vs CSV compression ratio.
  - `Construction Calculators (2)` — axial column compression & refrigeration COP.
  - `Guides & References (2)` — commercial invoice & emergency preparedness guides.
  - `Automotive & Transport Calculators (2)` — turbocharger compressor maps.
  - `Developer & Everyday Digital Tools (2)` — WebP/AVIF & JS bundle gzip/brotli compression.
  - `Trackers & Metrics (1)` — emergency backup generator fuel tracker.
  - `Aviation & Transportation (1)` — aircraft emergency descent glide ratio.
  - `Sports & Athletics Performance (1)` — running marathon split calculator.
  - `Energy & Solar Calculators (1)` — compressed air energy storage (CAES).
- **Adjusted:** `Generators & Utilities (4 -> 3)` (kept policy, README, and lien-waiver document generators; excluded emergency supply kit generator).
- **Retained (4):** PDF Document Suite (33), Document Converters (20), Generators & Utilities (3), Personal Productivity & Planning (1).

### 17. Editors (`37` unique / `37` raw)
- **Categories:** `4 -> 2`
- **Removed (2):**
  - `Financial Calculators (7)` — matched `'edit'` inside `'credit'` (credit card & R&D tax credit tools).
  - `Everyday Calculators (1)` — `Credit Card Cash Back & Rebate Calculator` (`'credit'`).
- **Retained (2):** Business Calculators (1), Additional Tools & Utilities (1).

### 18. Formatters (`55` unique / `55` raw)
- **Categories:** `7 -> 4`
- **Removed (3):**
  - `Engineering Calculators (5)` — matched `'format'` inside `'transformation'` and `'formation'`.
  - `Guides & References (2)` — formatting/information security reference sheets (`'guides'`).
  - `Cybersecurity & Data Management (2)` — matched `'format'` inside `'information'` and `'formation'`.
- **Adjusted:** `Financial Calculators (2 -> 1)` (kept `Number and Currency Display Formatter`; excluded Information Ratio CAPM formula).
- **Retained (4):** Additional Tools & Utilities (4), Everyday Calculators (3), Financial Calculators (1), Developer & Everyday Digital Tools (1).

### 19. Organizers (`25` unique / `25` raw)
- **Categories:** `11 -> 10`
- **Removed (1):**
  - `Manufacturing & Inventory Calculators (2)` — industrial inventory turnover & holding cost calculators matched via `'inventory'`.
- **Adjusted:** `Business Calculators (7 -> 1)` (kept `Freelance Client & Project Organizer`; excluded industrial DSI/MEIO/Newsvendor inventory formulas), `Financial Calculators (2 -> 1)` (kept `Subscription & Renewal Organizer`; excluded inventory turnover DIO).
- **Retained (10):** Construction Calculators (2), Everyday Calculators (2), Financial Calculators (1), Business Calculators (1), Automotive & Transport Calculators (1), Education & Student Finance (1), Animal World Calculators (1), Personal Productivity & Planning (1), Food Service & Hospitality (1), Checkers & Validators (1).

### 20. Business & Management (`355` unique / `357` raw)
- **Categories:** `14 -> 10`
- **Removed (4):**
  - `Guides & References (21)` — static business/compliance reference guides.
  - `Engineering Calculators (2)` — robotics null-space projection & camera pose reprojection (`'project'`).
  - `Scientific Calculators (1)` — `Projectile Motion & Trajectory Calculator` (`'project'`).
  - `Automotive & Transport Calculators (1)` — EV battery pack liquid cooling plate thermal management.
- **Adjusted:** `Everyday Calculators (4 -> 3)` (excluded `Hobby & Craft Project Material Cost Calculator`).
- **Retained (10):** Financial Calculators (193), Business Calculators (117), Business Operations Calculators (5), Date & Time Calculators (3), Everyday Calculators (3), Education & Student Finance (2), Additional Tools & Utilities (2), Real Estate & Property Calculators (1), Environmental & Sustainability (1), Aviation & Transportation (1).

---

## Verification Summary

- Verified via automated audit across all `4,400` catalog records and `4,375` unique tool IDs:
  - Sum of unique tools across all 20 hubs = **4,375** (unchanged).
  - Sum of raw entries across all 20 hubs = **4,400** (unchanged).
  - Zero empty (`0`-count) subject categories across all 20 hubs.
- Verified via React SSR (`renderToString`) across all **20 Tool Hubs** in both `en` and `es`, plus the main Tool Hubs Categories Directory view:
  - `Planners` Related Subject Categories section renders only its 14 verified categories (`Planners & Organizers (170)`, `Business Calculators (10)`, etc.) and contains none of the 10 excluded categories.
  - Every hub view renders non-empty, clickable subject-category links and accurate unique tool counts.
- TypeScript typecheck (`npm run lint`) and production Vite bundle (`npm run build`) both passed with zero errors.
