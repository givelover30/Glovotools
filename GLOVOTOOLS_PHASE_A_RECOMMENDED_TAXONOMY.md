# GLOVOTOOLS Phase A — Recommended Target Taxonomy & Naming Standard

## 1. Core Architectural Principles
1. **Functional Role First (Tool Hub):** Every tool receives **exactly one primary Tool Hub** determined by what the component/engine actually does (calculation, conversion, generation, validation, checking, planning, tracking, document processing, etc.) rather than unanchored substring matching.
2. **Subject Domain Second (Subject Category & Subcategory):** Categories represent the *subject domain* (Finance, Construction, Engineering, Health, Cybersecurity, Developer/Web) and may associate with multiple Tool Hubs only when verified active tools in that category belong to each hub.
3. **Natural Professional Naming:** Category and subcategory names match natural English usage (*Financial Calculators*, *Unit Converters*, *Syntax Validators*, *Project Planners*, *Habit Trackers*, *PDF Document Utilities*) without awkward mechanical suffixes.
4. **Static Reference Separation:** The **202** static `Guides & References` items (periodic table, math formulas, HTTP status codes, compliance frameworks) are informational references, not calculators or operational tools. Phase B should either add a dedicated 21st hub (`References & Guides`) or keep them isolated from operational hub counts.

## 2. Recommended Primary Tool Hub Definitions (20 Operational Hubs + Guides Recommendation)

| Hub | Primary Functional Criterion | Canonical Examples | Proposed Tool Count |
|---|---|---|---:|
| Calculators | Functional domain aligned to Calculators | Percentage & Fraction Calculator; Quadratic Equation Solver | 2,380 |
| Converters | Functional domain aligned to Converters | Fraction to Percentage Calculator; Radians to Degrees Angle Calculator | 193 |
| Generators | Functional domain aligned to Generators | Cryptographic Hash & Checksum Generator; QR Code Text, URL & Wi-Fi Payload Formatter | 168 |
| Planners | Functional domain aligned to Planners | Time Management & Pomodoro Planner; Personal Net Worth & Asset Growth Planner | 204 |
| Trackers | Functional domain aligned to Trackers | Daily Water Intake & Hydration Calculator; Habit Streak Success & Goal Probability | 182 |
| Counters | Functional domain aligned to Counters | Significant Figures Counter & Identifier; Event Countdown & Days Until Calculator | 16 |
| Analyzers | Functional domain aligned to Analyzers | SVG Path Data Inspector & Bounding Box Tool; Advanced Text Readability & Syllable Analyzer | 58 |
| Checkers | Functional domain aligned to Checkers | Password Strength & Entropy Checker; Markdown Syntax & Formatting Checker | 140 |
| Validators | Functional domain aligned to Validators | JSON Formatter, Minifier & Syntax Validator; JSON Syntax & Structure Validator | 69 |
| Estimators | Functional domain aligned to Estimators | Social Security Breakeven Calculator; Shipping Zone & Freight Cost Estimator | 119 |
| Finders | Functional domain aligned to Finders | DNS Record Lookup & Propagation Diagnostic; Roof Pitch Angle & Rise Finder Utility | 41 |
| Comparators | Functional domain aligned to Comparators | Text Diff & Comparison Checker; Text Diff & Version Comparison Utility | 16 |
| Optimizers | Functional domain aligned to Optimizers | Portfolio Risk & Return Optimizer; Tax Bracket & Deduction Optimizer | 114 |
| Simulators | Functional domain aligned to Simulators | Compound Interest with Monthly Additions Simulator; Small Business Multi-Product Break-Even Simulator | 78 |
| Testers | Functional domain aligned to Testers | Regular Expression Tester & Matcher; Regular Expression (RegEx) Matcher | 53 |
| Document & PDF | Functional domain aligned to Document & PDF | Commercial Document & Invoice Terms Reference; Merge PDF Files | 54 |
| Editors | Functional domain aligned to Editors | Live Markdown Previewer & HTML Exporter; CSV Spreadsheet Preview & Grid Editor | 31 |
| Formatters | Functional domain aligned to Formatters | Markdown Syntax & Formatting Cheat Sheet; SQL Query Formatter & Minifier | 48 |
| Organizers | Functional domain aligned to Organizers | Wedding Planning & Budget Organizer; Personal Goal & Life Planning Organizer | 21 |
| Business & Management | Functional domain aligned to Business & Management | Loan & Mortgage Calculator; Compound Interest Calculator | 390 |

## 3. Recommended Category Naming Standardization Highlights

- Promote or alias the **6 orphan categories** (`education-science` [407], `developer-it` [227], `text-writing` [56], `health` [56], `image-design` [9], `lifestyle` [1]) so all **756 orphaned tools** become browsable through category pages.
- Remediate the **1,039 orphan `subcategoryId` values** (`2,770` tools) by mapping them into canonical `SUBCATEGORIES` or normalizing batch subcategory IDs.
- Fix `getCategoryBySlug("tools")` alias mismatch (currently resolves `"tools"` to `"additional-tools"` instead of `"tools"`) causing **9 broken subcategory routes**.
