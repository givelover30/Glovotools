# CALCTOOLS Phase D0.3 — Confidence & ID Corruption Repair Report

## 1. Root Cause Analysis of D0.2 Defects
During Phase D0.2 inventory generation, `src/generate_4375_rows.mjs` constructed CSV rows using a template placeholder `confidence` and executed `.replace('confidence', confidence)`. Because JavaScript's `String.prototype.replace` substitutes only the **first** substring match, any `tool_id` containing the literal word `"confidence"` had its ID mutated while leaving the actual `confidence_level` column unreplaced as `"confidence"`.

Exactly **2** records out of 4,375 were affected:
1. `confidence-interval` → corrupted to `High-interval` with `confidence_level = "confidence"`
2. `error-bar-confidence-visualizer` → corrupted to `error-bar-High-visualizer` with `confidence_level = "confidence"`

## 2. Evidence-Based Implementation Investigation

### Case A: `confidence-interval` (Confidence Interval Calculator)
- **Catalog Metadata:** `category: "statistics"`, `subcategoryId: "distributions"`, `formula: "CI = x̄ ± z × (s / √n)"`
- **Primary Hub Assignment:** `Calculators`
- **Execution Layer Evidence:** Backed by an **explicit registered calculation contract** in `src/engine/contracts/allContracts.ts` (`id: "confidence-interval"`) with 4 typed input fields (`mean`, `stdDev`, `sampleSize`, `confidenceLevel`), custom `validate`, `calculate`, and `formatResult` handlers.
- **Determined Confidence Level:** **`High`** — Explicit contract implementation aligns directly with the `Calculators` primary hub and canonical `statistics` category.

### Case B: `error-bar-confidence-visualizer` (Error Bar & Confidence Interval Visualizer)
- **Catalog Metadata:** `category: "education-science"`, `subcategoryId: "statistics"`, `tags: ["visualizer", "error-bars", "confidence-interval", "standard-deviation", "stats"]`, `formula: "Interval = Mean ± z × (σ / √n)"`
- **Primary Hub Assignment:** `Calculators` (default hub fallback)
- **Execution Layer Evidence:** Has **NO** custom React component in `src/components/CalculatorView.tsx` and **NO** explicit contract in `ALL_REGISTERED_CONTRACTS`. At runtime, `EngineCalculatorView` falls back to `CalculationRegistry.get`'s generic 2-parameter numeric evaluation (`numeratorVal` / `denominatorVal`), which cannot render visual error bars or accept mean/standard deviation/sample size inputs.
- **Determined Confidence Level:** **`Medium`** — Not classified as `High` because the tool is advertised as a statistical **Visualizer** yet relies solely on the generic 2-parameter formula fallback without a specialized plotting UI or explicit contract.

## 3. Repair Verification
- Both defective rows were repaired in `CALCTOOLS_PHASE_D02_PRIMARY_HUB_INVENTORY.csv` (`High-interval` → `confidence-interval` [`High`]; `error-bar-High-visualizer` → `error-bar-confidence-visualizer` [`Medium`]).
- All remaining **4,373** primary hub rows were preserved untouched.
- Approved confidence distribution across all 4,375 unique tools: **High: 4,374**, **Medium: 1**, **Invalid ("confidence"): 0**.
