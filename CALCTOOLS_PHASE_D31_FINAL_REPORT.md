# CALCTOOLS 2.0 — PHASE D3.1: UNREGISTERED SUBCATEGORY MAPPING & TAXONOMY DESIGN AUDIT
**Final Audit Report**

- **Phase:** D3.1 (Read-Only Taxonomy Discovery & Canonical Mapping Design)
- **Production Modifications:** **ZERO** (100% read-only audit; all canonical files, routes, UI components, and duplicates remain untouched)
- **Audit Scope:** All **1,039** distinct unregistered `subcategoryId` identifiers across **2,770** unique primary tools (plus **45** registered-but-parent-mismatched primary tools and **25** preserved duplicate ID pairs / **50** raw occurrences)
- **Final Verdict:** **`PASS WITH LIMITATIONS`**

---

## 1. Executive Summary

Phase D3.1 audited the **2,770** unique CALCTOOLS tools whose `subcategoryId` values do not resolve against the live canonical `SUBCATEGORIES` registry (`492` canonical subcategories across `52` canonical subject categories), alongside a separate remediation audit of the **45** primary tools whose `subcategoryId` resolves to a valid canonical entry under a *different* subject category (`parent_mismatch`).

Rather than blindly promoting **1,039** ad-hoc `subcategoryId` strings into `SUBCATEGORIES`, every identifier was inspected against live tool definitions (`src/types.ts`, `src/data/calculators.ts`, `src/data/toolClassification.ts`, batch files), existing canonical subcategories/slugs, implementation runtime types, and strict **parent-category safety invariants** (a canonical `SubcategoryMeta` is strictly scoped to a single `categoryId`).

### Key Quantitative Outcomes

| Dimension | Distinct `subcategoryId`s | Unique Primary Tools | % of 2,770 Unregistered Tools | Notes |
|---|---:|---:|---:|---|
| **`MAP_TO_EXISTING`** | **79** | **141** | **5.09%** | Direct semantic fit into an existing canonical subcategory in the **same** parent category |
| **`ALIAS_TO_EXISTING`** | **36** | **107** | **3.86%** | Legitimate slug match or synonymous name aliasing an existing canonical subcategory in the **same** parent category |
| **`NEW_SUBCATEGORY_CANDIDATE`** | **652** | **1,207** | **43.57%** | Consolidated cleanly into **76** cohesive proposed new subcategories (zero ID collisions with existing 492) |
| **`MANUAL_REVIEW`** | **263** | **1,306** | **47.15%** | **164** cross-category multi-parent IDs (**1,150** tools) + **99** single-category boundary/mismatch IDs (**156** tools) |
| **`LEGACY_OR_INVALID`** | **9** | **9** | **0.32%** | 1 leading-whitespace malformed ID (`" culinary-conversions"`) + 8 internal QA/certification/test stubs |
| **TOTAL UNREGISTERED SCOPE** | **1,039** | **2,770** | **100.00%** | Matches live catalog invariants with zero discrepancy |

- **Direct Actionable Coverage Without Cross-Category Split:** **767** distinct identifiers (**73.82%** of IDs) covering **1,455** unique tools (**52.53%** of unregistered tools) resolve cleanly to parent-safe existing targets (`MAP` + `ALIAS`: **115** IDs / **248** tools) or consolidated `NEW_SUBCATEGORY_CANDIDATE` proposals (**652** IDs / **1,207** tools across **76** new canonical subcategories).
- **Manual Review Gate Kept Honest:** **263** identifiers (**1,306** tools) plus **32** of the **45** parent-mismatch tools are explicitly isolated for human category/boundary decisions in Phase D3.2 rather than silently forced across parent categories.

---

## 2. Live Source Inspection & Baseline Reconciliation

All metrics were derived directly from the live repository sources:

1. **Canonical Data Model (`src/types.ts`):**
   - `CalculatorMeta` defines `category: string`, optional `subcategoryId?: string`, and optional `toolHub?: ToolHubId`.
   - `SubcategoryMeta` strictly binds each subcategory to `id`, `name`, `slug`, and a single parent `categoryId`.
2. **Canonical Registries (`src/data/calculators.ts` & `src/data/toolClassification.ts`):**
   - Raw catalog (`CALCULATORS`): **4,400** records.
   - Primary first-occurrence deduplicated catalog: **4,375** unique tool IDs (**25** preserved duplicate IDs / **50** raw occurrences).
   - Subject categories (`CATEGORIES`): **52** canonical categories (`RAW_CATEGORIES` post `CATEGORY_MERGE_MAP`).
   - Primary Tool Hubs: **21** registered hubs.
   - Canonical Subcategories (`SUBCATEGORIES`): **492** entries across **49** populated categories.
3. **Full Catalog Subcategory Status Breakdown (4,375 Unique Tools):**
   - **Valid registered & parent-matched:** **1,560** tools (`35.66%`) — require zero remediation.
   - **Registered but parent-mismatched:** **45** tools (`1.03%`) — audited in `CALCTOOLS_PHASE_D31_PARENT_MISMATCH_AUDIT.csv`.
   - **Unregistered `subcategoryId`:** **2,770** tools (`63.31%`) across **1,039** distinct `subcategoryId` strings — full D3.1 mapping scope.
   - **Critical 1,039 vs. 1,040 Raw-Occurrence Edge Case:** One additional unregistered string (`"metadata"`) exists **only** on secondary duplicate #2 of `pdf-metadata-editor` (`batch82d_group6.ts:252`, `pdf-tools`), while occurrence #1 uses canonical `p25-sub-edit`. Across all 4,400 raw records there are 1,040 distinct unregistered strings; deduplicated to primary canonical records there are exact **1,039**.
4. **Zero-Subcategory Canonical Gap (Promoted Categories):**
   - **3** canonical categories currently possess **0** entries in `SUBCATEGORIES`: `education-science` (381 primary unregistered + 26 parent-mismatched = 407 primary tools), `developer-it` (227 primary unregistered tools), and `text-writing` (56 primary unregistered tools). Together these three account for **664** unregistered tools (`23.97%` of all unregistered tools) and **26** parent mismatches.

---

## 3. Methodology & Strict Mapping Safety Invariants

Every identifier classification adhered to five non-negotiable safety rules:

1. **Strict Single-Parent Enforcement:** No tool was ever assigned to a `MAP_TO_EXISTING`, `ALIAS_TO_EXISTING`, or `NEW_SUBCATEGORY_CANDIDATE` target whose `categoryId` differs from the tool's `category`. All 115 existing mappings and 76 new proposals were programmatically verified against `SUBCATEGORIES` for 100% parent-category alignment and zero ID collisions.
2. **Automatic Quarantine of Multi-Category Identifiers (`164` IDs / `1,150` Tools):** Any unregistered `subcategoryId` appearing across `>= 2` subject categories in primary tools was automatically routed to `MANUAL_REVIEW` with an explicit per-category split plan (e.g., `acoustics`: `engineering:26; construction:11; education-science:5`; `security`: `checkers:23; developer-it:8; text-writing:2; planners:1`).
3. **False-Friend & Slug-Collision Guardrails:**
   - **18** unregistered IDs verbatim-match canonical `SubcategoryMeta.slug` strings, yet **10** of them are **cross-parent false friends** (`hydraulics` `construction` vs `engineering`; `valuation` `financial` vs `business`; `typography` `developer-it/tools` vs `converter`; `combinatorics` `education-science` vs `statistics`; `image-tools` cross-category) or semantic traps (`body-mass`).
   - **`body-mass` Trap (`health-fitness`):** Although `body-mass` matches the slug of `body-composition`, inspecting its live tools reveals `pregnancy-due-date-calc` and `ovulation-tracker-calc` (Custom UI) — obstetrics tools that must NOT map to Body Composition (`MANUAL_REVIEW`).
   - **`solar-roi` Trap (`energy-solar`):** Contains both `solar-battery-calc` and `ev-charging-calc` (EV charging, Custom UI), requiring split review (`MANUAL_REVIEW`).
4. **Consolidation Over Fragmentation:** Rather than proposing hundreds of 1-tool subcategories, **652** single-category identifiers (**1,207** tools) were synthesized into **76** high-cohesion canonical subcategories (an **8.58:1** identifier compression ratio).
5. **Implementation Type Awareness:** Each inventory row records exact runtime breakdown (`Numerical Dynamic Fallback`, `Workflow-assigned Generic Fallback`, `Custom UI / Workspace`) so Phase D3.2 can prioritize Custom UI / high-visibility tools first.

---

## 4. Semantic Grouping Analysis (16 Functional Domains)

Every unregistered identifier was assigned to one of **16** normalized semantic groups (`CALCTOOLS_PHASE_D31_SEMANTIC_GROUPING.csv`):

| Semantic Group | Distinct IDs | Unique Tools | % of Unreg Tools | Primary Domains Covered |
|---|---:|---:|---:|---|
| Engineering & Mechanical Systems | 209 | 642 | 23.18% | Structural, CFD, chemical process, robotics, petroleum, marine, aerospace |
| Computer Science & Cybersecurity | 171 | 469 | 16.93% | Security, crypto, quantum computing, software engineering, DBs, DevOps |
| Business & Management | 104 | 278 | 10.04% | Operations, supply chain, logistics, HR, SaaS, retail, pricing |
| Finance & Accounting | 75 | 262 | 9.46% | Corporate/quant finance, investing, fixed income, tax, real estate, macroeconomics |
| Physics & Scientific Research | 95 | 209 | 7.55% | Classical/quantum physics, nuclear/plasma, photonics, Earth sciences, astronomy |
| Everyday Utilities | 61 | 169 | 6.10% | Household, personal productivity, cooking, travel, lifestyle, pets |
| Energy & Sustainability | 74 | 157 | 5.67% | Solar PV, wind, geothermal, batteries, smart grids, LCA, carbon |
| Health & Fitness | 55 | 143 | 5.16% | Body composition, nutrition, fitness, clinical diagnostics, healthcare ops |
| Construction & Building | 44 | 141 | 5.09% | Concrete, masonry, framing, MEP/HVAC, plumbing, civil/geotechnical |
| Biology & Chemistry | 52 | 126 | 4.55% | Chemistry, biochemistry, genetics, biotech, ecology, agriculture, neuroscience |
| Mathematics & Statistics | 21 | 45 | 1.62% | Algebra, discrete math, numerical methods, ANOVA, probability |
| Writing & Document Tools | 24 | 42 | 1.52% | Markdown editing, PDF tools, text analysis, diffs, linguistics |
| Design & Media | 16 | 37 | 1.34% | Color, CSS, SVG, image scaling, audio/video, UX utilities |
| Networking & Telecommunications | 20 | 27 | 0.97% | Optical fiber, RF/wireless, 5G MIMO, satellite links, network QoS |
| Education & Academic | 9 | 14 | 0.51% | GPA, grading, SAT/ACT, citations, publishing, study tools |
| Platform & Legacy Diagnostics | 9 | 9 | 0.32% | Malformed whitespace ID (`" culinary-conversions"`) + internal QA/audit stubs |
| **Total** | **1,039** | **2,770** | **100.00%** | **100% coverage** |

---

## 5. Existing Subcategory Mapping & Alias Design (`115` IDs / `248` Tools)

Stored in `CALCTOOLS_PHASE_D31_EXISTING_SUBCATEGORY_MAPPINGS.csv`:

- **`MAP_TO_EXISTING` (79 IDs / 141 tools):** Direct parent-safe mappings into populated canonical subcategories (e.g., `structural`, `insulation`, `carpentry`, `paving`, `drywall`, `rebar`, `stairs`, `fencing`, `formwork` -> `construction / p19-sub-calc` or `p13-sub-const`; `pricing`, `sales`, `cashflow`, `kpi`, `marketing-analytics` -> `business / p23-sub-calc`; `solar-pv`, `csp`, `solar-thermal`, `solar-economics`, `net-zero-building` -> `energy-solar / solar-systems`; `svg`, `colors`, `image-tools` -> `additional-tools / additional-media`).
- **`ALIAS_TO_EXISTING` (36 IDs / 107 tools):** Canonical slug matches or unambiguous morphological/domain aliases within the same parent category:
  - Slug matches: `investing` -> `compound-investments` (23 tools), `mortgage` -> `loans-mortgages` (7 tools), `concrete` -> `concrete-masonry` (8 tools), `flooring` -> `flooring-materials` (6 tools), `roofing` -> `paint-roofing` (6 tools), `circuits` -> `circuits-impedance` (3 tools), `framing` -> `framing-lumber` (2 tools), `heart-rate` -> `target-heart-rate` (2 tools).
  - Clean synonyms: `loans` -> `loans-mortgages` (5 tools), `dining` -> `dining-tipping` (4 tools), `pages`/`splitter` -> `p25-sub-org` (4 tools), `stamping` -> `p25-sub-edit`, `inspection` -> `p25-sub-sec`, `baseball` -> `baseball-stats`, `cycling` -> `cycling-power`, `poultry` -> `birds`, `take-home` -> `paycheck-net-pay`, `wage-calc` -> `salary-conversion`, `parcel-shipping` -> `freight-parcel`.

---

## 6. Consolidated New Subcategory Proposals (`76` Proposals Consolidating `652` IDs / `1,207` Tools)

Stored in `CALCTOOLS_PHASE_D31_NEW_SUBCATEGORY_PROPOSALS.csv`. Every proposal targets a single existing canonical parent category, consolidates multiple fragmented tags, and avoids any collision with the 492 canonical IDs:

- **Zero-Subcategory Categories Fixed (22 proposals / 358 tools):**
  - `education-science` (13 proposals, 130 source IDs, 256 tools): `edu-physics-classical-optics`, `edu-quantum-atomic-physics`, `edu-nuclear-plasma-physics`, `edu-chemistry-materials`, `edu-biology-biotech`, `edu-neuroscience`, `edu-astronomy-space`, `edu-earth-geophysics`, `edu-meteorology-climate`, `edu-oceanography-marine`, `edu-math-computation`, `edu-academics-study`, `edu-ecology-agronomy`.
  - `developer-it` (6 proposals, 42 source IDs, 83 tools): `dev-databases-sql`, `dev-web-frontend`, `dev-formats-codegen`, `dev-security-compliance`, `dev-software-engineering`, `dev-infra-streaming`.
  - `text-writing` (3 proposals, 15 source IDs, 19 tools): `writing-markdown-docs`, `writing-text-analysis`, `writing-transforms-linguistics`.
- **Major Populated-Category Expansions (54 proposals / 849 tools):**
  - `engineering` (7 proposals, 82 IDs, 186 tools): `eng-structural-civil-fea`, `eng-cfd-fluid-dynamics`, `eng-chemical-process`, `eng-robotics-control`, `eng-petroleum-geomechanics`, `eng-marine-ocean`, `eng-mechanical-dynamics`.
  - `financial` (6 proposals, 36 IDs, 105 tools): `fin-corporate-valuation`, `fin-derivatives-quant`, `fin-fixed-income-rates`, `fin-portfolio-risk`, `fin-forex-fintech`, `fin-macroeconomics`.
  - `business` (4 proposals, 38 IDs, 96 tools): `biz-hr-workforce`, `biz-operations-supply-chain`, `biz-retail-hospitality`, `biz-strategy-saas-ops`.
  - `health-fitness` (4 proposals, 24 IDs, 68 tools): `health-fitness-training`, `health-clinical-diagnostics`, `health-pregnancy-obstetrics`, `health-hydration-wellness`.
  - `electrical` (4 proposals, 35 IDs, 67 tools): `elec-batteries-storage`, `elec-rf-antennas-microwave`, `elec-power-electronics-ic`, `elec-power-systems-grid`.
  - `aviation-transport` (3 proposals, 39 IDs, 63 tools), `cybersecurity-data` (3 proposals, 32 IDs, 38 tools), `energy-solar` (3 proposals, 25 IDs, 37 tools), `logistics-shipping` (2 proposals, 29 IDs, 35 tools), `environmental-sustainability` (2 proposals, 27 IDs, 34 tools), `automotive` (2 proposals, 21 IDs, 24 tools), `construction` (2 proposals, 12 IDs, 22 tools), `telecom-internet` (2 proposals, 17 IDs, 18 tools), plus targeted additions in `healthcare-operations`, `trackers`, `tools`, `planners`, `agriculture-farming`, `food-service`, `real-estate`, `datetime`, `sports-athletics`, and `statistics`.

---

## 7. Manual Review Register (`263` IDs / `1,306` Tools) & Legacy/Invalid (`9` IDs / `9` Tools)

### Manual Review Register (`CALCTOOLS_PHASE_D31_MANUAL_REVIEW_REGISTER.csv`)
1. **Cross-Category Multi-Parent Identifiers (`164` IDs / `1,150` tools):** Top multi-category splits include `acoustics` (`42`), `security` (`34`), `networking` (`32`), `utilities` (`30`), `nanotechnology` (`29`), `aerospace` (`28`), `markdown` (`28`), `photonics` (`28`), `quantum-computing` (`27`), `metallurgy` (`26`), `real-estate` (`24`), `naval-architecture` (`23`), `aerodynamics` (`22`), `manufacturing` (`21`), `hvac` (`20`), `supply-chain` (`20`), `automotive` (`19`), `geotechnical` (`19`).
2. **Single-Category Boundary / Misclassification Traps (`99` IDs / `156` tools):** Includes `body-mass` (obstetrics tools inside `health-fitness`), `solar-roi` (EV charging inside `energy-solar`), `mechanical` (17 shaft/gearbox/ASME vessel tools inside `construction`), misplaced financial/tax/utility tools in `everyday`, `tools`, `checkers`, `additional-tools`, `basic-math`, `algebra`, and non-academic tools inside `education-science` (`animals`, `demographics`, `radar`, `traffic`).

### Legacy or Invalid (`9` IDs / `9` Tools)
- `" culinary-conversions"` (`food-service`, tool `food-kitchen-conversions-volume-weight-temperature`) — literal leading space typo.
- **8** internal QA/certification/benchmark/test-runner manifest tools not matching user-facing calculation taxonomy: `certification` (`calctools-phase-85c-final-certification-manifest`), `platform-audit` (`meta-platform-comprehensive-inventory-audit`), `analytics` (`meta-analytics-conversion-funnel-event-tracking-audit`), `localization` (`meta-internationalization-i18n-translation-coverage`), `benchmark` (`meta-api-latency-benchmark-load-test-simulator`), `performance-audit` (`meta-performance-bundle-size-tree-shaking-analyzer`), `pwa-audit` (`meta-pwa-service-worker-offline-cache-validator`), `formulas` (`calculation-formula-test-runner`).

---

## 8. Parent-Category Mismatch Separate Audit (`45` Primary Tools)

Audited individually in `CALCTOOLS_PHASE_D31_PARENT_MISMATCH_AUDIT.csv`:

| Cluster | Count | Subcategory Mismatch Pattern | Manual Review Required? | Proposed Resolution |
|---|---:|---|---|---|
| **`education-science` `thermodynamics`** | **26** | Tools in `education-science` (0 subs) using `engineering/thermodynamics` | **Yes (26)** | Add `Thermodynamics & Statistical Physics` under `education-science` OR split engineering vs. physics |
| **`planners` `time-management`** | **2** | Uses `personal-productivity/time-management` | **No (2)** | Map `subcategoryId` -> `planners-lifestyle` (under `planners`) |
| **`business` `human-resources`** | **2** | Uses `business-operations/human-resources` | **Yes (2)** | Move `category` -> `business-operations` OR map to proposed `biz-hr-workforce` |
| **`automotive` `fuel-economy`** | **2** | Uses `converter/fuel-economy` | **Yes (2)** | Map to `transport-travel` / `auto-powertrain-dynamics` under `automotive` |
| **`financial` `personal-finance`** | **1** | `net-worth-calculator` uses `personal-productivity/personal-finance` | **No (1)** | Map `subcategoryId` -> `retirement-savings` under `financial` |
| **Phase 12–17 `p*-sub-calc` copy-paste errors** | **10** | Exact canonical subcategory exists under tool's current category | **No (10)** | Direct `subcategoryId` correction (`body-composition`, `business-working-days`, `hydraulics-fluid`, `inventory-management`, `retail-break-even`, `saas-unit-economics`, `loans-mortgages`, `electrical/*`) |
| **Phase 15B / 15G dual-domain errors** | **2** | `sales-tax-inclusive-calc` (`financial` + `basic-math`), `electricity-appliance-cost-calculator` (`scientific` + `financial`) | **Yes (2)** | Move `category` + `subcategoryId` to `tax-accounting/sales-vat` and `electrical/energy-consumption` |
| **Total** | **45** | **13 deterministic fixes + 32 boundary reviews** | **32** | 100% resolved in design |

---

## 9. Preserved Duplicate Record Handling (`25` Duplicate IDs / `50` Raw Occurrences)

All **25** duplicate tool IDs remain untouched (`CALCULATORS` = 4,400 raw, 4,375 unique):
- **14** pairs have a **valid registered primary (#1)** and an **unregistered secondary (#2)** — including `pdf-metadata-editor`, whose occurrence #2 (`batch82d_group6.ts:252`, `pdf-tools`) introduces the 1,040th raw-only unregistered string `"metadata"`.
- **4** pairs have **different unregistered IDs** between #1 and #2 (`rolling-element-bearing-l10h-fatigue-life`, `adv-quantum-shor-factoring-qubit-requirement`, `adv-quantum-optical-bell-state-generator-efficiency`, `adv-quantum-error-mitigation-zero-noise-extrapolation`).
- **7** pairs share the **same unregistered ID**, of which **6** are identical metadata duplicates and **1** (`freelance-client-project-organizer`) diverges across `category` (`business` vs `planners`) and `toolHub` (`Organizers` vs `Planners`).

Any Phase D3.2 implementation must update primary and secondary records cohesively (or synchronize duplicates after sign-off) so duplicate deduplication never silently re-exposes unregistered tags.

---

## 10. Risks, Limitations & Final Verdict

### Limitations
1. **Cross-Category Multi-Parent Ambiguity (`1,150` tools / `164` IDs):** Cannot be safely auto-mapped without human sign-off on whether minority categories should be re-categorized or split into category-scoped subcategories.
2. **Zero-Subcategory Canonical Gaps (`3` categories):** `education-science`, `developer-it`, and `text-writing` have `0` existing canonical subcategories, so **100%** of their non-review mappings depend on approving new subcategory proposals in Phase D3.2.
3. **High Boundary Sensitivity in Generic Categories (`99` IDs / `156` tools):** Categories like `everyday`, `checkers`, `tools`, `additional-tools`, and `construction` contain tools whose subject domain conflicts with their parent `category`.
4. **Raw vs. Primary Duplicate Divergence (`"metadata"` & 25 duplicate pairs):** Secondary raw occurrences contain 1 unregistered string (`"metadata"`) absent from primary deduplicated records.

### Deliverables Produced
1. `CALCTOOLS_PHASE_D31_UNREGISTERED_SUBCATEGORY_INVENTORY.csv` (1,039 identifier rows covering 2,770 tools)
2. `CALCTOOLS_PHASE_D31_SEMANTIC_GROUPING.csv` (1,039 rows across 16 semantic groups)
3. `CALCTOOLS_PHASE_D31_EXISTING_SUBCATEGORY_MAPPINGS.csv` (115 rows: 79 `MAP_TO_EXISTING` + 36 `ALIAS_TO_EXISTING`, 248 tools)
4. `CALCTOOLS_PHASE_D31_NEW_SUBCATEGORY_PROPOSALS.csv` (76 consolidated proposals covering 652 IDs / 1,207 tools)
5. `CALCTOOLS_PHASE_D31_MANUAL_REVIEW_REGISTER.csv` (263 rows covering 1,306 tools)
6. `CALCTOOLS_PHASE_D31_PARENT_MISMATCH_AUDIT.csv` (45 parent-mismatched primary tools)
7. `CALCTOOLS_PHASE_D31_MAPPING_SUMMARY.csv` (Baseline, Disposition, Coverage, Duplicates, Semantic Groups, and Subject Categories summary)
8. `CALCTOOLS_PHASE_D31_FINAL_REPORT.md` (This report)

### Final Verdict: **`PASS WITH LIMITATIONS`**

The live repository remains completely untouched. Every one of the **1,039** primary unregistered `subcategoryId` strings (**2,770** unique tools) and all **45** parent-mismatched tools is 100% accounted for with zero orphaned identifiers, zero canonical ID collisions, and zero cross-parent mapping violations. **767** identifiers (**1,455** tools) have complete, parent-safe canonical or consolidated-proposal targets ready for Phase D3.2 authorization, while **263** identifiers (**1,306** tools) plus **32** parent-mismatch records are safely isolated in the Manual Review Register pending taxonomy governance decisions.
