# CALCTOOLS — PHASE 11B BATCH 3: DISCOVERY & DUPLICATE AUDIT REPORT

**Objective:** Conduct a comprehensive catalog-wide discovery audit of the current platform (320 calculators, 22 categories, 75 subcategories), evaluate high-value expansion candidates (Banking & Savings, Business Operations, Logistics & Shipping, Manufacturing & Inventory), propose 10 distinct professional calculators, perform rigorous duplicate analysis, and outline the architectural roadmap for Batch 3.

---

### 1. Existing Platform Audit Summary
- **Current Baseline:** 320 client-side calculators, 22 categories, 75 subcategories.
- **Engine Architecture:** Robust `CalculationContract` registry, deterministic formulas, modular catalog files, and zero external dependency calls.
- **Identified Gaps:** While prior batches established broad coverage across math, finance, tax, real estate, insurance, automotive, and education, enterprise-grade operational suites in Banking/Savings, Business Operations, Logistics & Shipping, and Manufacturing/Inventory remain underserved.

---

### 2. Candidate Category Evaluation & Selection

| Proposed Category ID | Category Title | Strategic Value | Complexity | Suitability Score (/10) | Verdict & Rationale |
|---|---|---|---|---|---|
| `banking-savings` | Banking & Savings Calculators | High consumer interest in CD maturity and high-yield savings growth | Low-Medium | 9.0/10 | **Selected.** Complements existing loans with dedicated deposit, CD, and recurring savings accumulation tools. |
| `business-operations` | Business Operations Calculators | High SaaS/startup and HR management utility (LTV/CAC, turnover) | Medium | 9.0/10 | **Selected.** Expands business analytics beyond margins into customer unit economics and workforce retention. |
| `logistics-shipping` | Logistics & Shipping Calculators | High utility for e-commerce merchants calculating billable dimensional weight | Medium | 9.5/10 | **Selected.** Essential for online sellers evaluating carrier dimensional weight and freight costs. |
| `manufacturing-inventory` | Manufacturing & Inventory | High industrial utility (EOQ, OEE, safety stock, inventory turnover) | Medium | 9.5/10 | **Selected.** Provides plant managers and supply chain planners with rigorous lean manufacturing models. |

---

### 3. Recommended 10 New Calculators for Batch 3

#### Category 1: Banking & Savings (`banking-savings`)
1. **Certificate of Deposit (CD) Interest & Maturity Calculator (`cd-interest-calc`)**
   - **Subcategory:** Deposit Accounts (`deposit-accounts`)
   - **Purpose & Target User:** Calculates total maturity value and earned interest for fixed-term Certificates of Deposit with compound interest.
   - **Main Inputs:** Initial Deposit ($), Annual Percentage Yield (APY %), CD Term (Months).
   - **Outputs:** Total Maturity Value ($), Total Interest Earned ($).
   - **Formula:** `Maturity Value = Principal × (1 + APY / n)^(n × t)`.
   - **Differentiation:** Dedicated CD maturity analyzer distinct from general compound interest.

2. **Compound Interest with Regular Deposits Calculator (`compound-savings-calc`)**
   - **Subcategory:** Savings Accumulation (`savings-accumulation`)
   - **Purpose & Target User:** Projects long-term savings growth from initial lump sums and recurring periodic deposits.
   - **Main Inputs:** Initial Principal ($), Monthly Deposit ($), Years, Annual Interest Rate (%).
   - **Outputs:** Final Future Value ($), Total Contributions ($), Total Interest Earned ($).
   - **Formula:** Future Value of lump sum plus ordinary annuity.
   - **Differentiation:** Focused specifically on personal savings milestones and recurring deposit goals.

#### Category 2: Business Operations (`business-operations`)
3. **Customer Lifetime Value (LTV) & Acquisition Cost (CAC) Calculator (`ltv-cac-calc`)**
   - **Subcategory:** SaaS & Unit Economics (`saas-unit-economics`)
   - **Purpose & Target User:** Evaluates business customer profitability by comparing lifetime value against customer acquisition cost (LTV:CAC ratio).
   - **Main Inputs:** Average Revenue per User (ARPU), Gross Margin (%), Churn Rate (%), Customer Acquisition Cost (CAC).
   - **Outputs:** Customer Lifetime Value ($), LTV:CAC Ratio, Payback Period (Months).
   - **Formula:** `LTV = (ARPU × Gross Margin) / Churn Rate`, `Ratio = LTV / CAC`.
   - **Differentiation:** Critical growth metric calculator for subscription and SaaS businesses.

4. **Employee Turnover Rate & Retention Cost Calculator (`turnover-rate-calc`)**
   - **Subcategory:** Human Resources (`human-resources`)
   - **Purpose & Target User:** Calculates annual workforce turnover percentages and estimated financial costs associated with employee departures.
   - **Main Inputs:** Number of Departures, Average Total Employees, Average Cost per Replacement Hiring.
   - **Outputs:** Annual Turnover Rate (%), Total Estimated Replacement Cost ($).
   - **Formula:** `Turnover Rate = (Departures / Average Employees) × 100`, `Cost = Departures × Cost per Hire`.
   - **Differentiation:** Essential HR operational analytics tool.

#### Category 3: Logistics & Shipping (`logistics-shipping`)
5. **Dimensional Weight & Billable Shipping Cost Calculator (`dimensional-weight-calc`)**
   - **Subcategory:** Freight & Parcel (`freight-parcel`)
   - **Purpose & Target User:** Computes carrier billable weight by comparing actual physical weight against volumetric dimensional weight.
   - **Main Inputs:** Length (in), Width (in), Height (in), Actual Weight (lbs), Dimensional Divisor (e.g. 139).
   - **Outputs:** Dimensional Weight (lbs), Billable Weight (lbs).
   - **Formula:** `Dim Weight = (Length × Width × Height) / Divisor`.
   - **Differentiation:** Crucial e-commerce shipping cost optimization calculator.

6. **Shipping Zone & Freight Cost Estimator (`freight-cost-calc`)**
   - **Subcategory:** Freight & Parcel (`freight-parcel`)
   - **Purpose & Target User:** Estimates base freight shipping rates based on weight, distance zone, and carrier fuel surcharges.
   - **Main Inputs:** Billable Weight (lbs), Shipping Zone (1-8), Base Rate per lb, Fuel Surcharge (%).
   - **Outputs:** Base Freight Charge, Fuel Surcharge Amount, Total Estimated Shipping Cost.
   - **Formula:** `Cost = (Weight × Zone Rate) × (1 + Fuel Surcharge %)`.
   - **Differentiation:** Practical freight cost estimation tool for supply chain dispatchers.

#### Category 4: Manufacturing & Inventory (`manufacturing-inventory`)
7. **Economic Order Quantity (EOQ) & Inventory Replenishment Calculator (`eoq-calc`)**
   - **Subcategory:** Inventory Management (`inventory-management`)
   - **Purpose & Target User:** Determines optimal inventory order quantity that minimizes total holding and ordering costs.
   - **Main Inputs:** Annual Demand (Units), Ordering Cost per Order ($), Holding Cost per Unit per Year ($).
   - **Outputs:** Economic Order Quantity (Units), Total Annual Inventory Cost ($), Optimal Orders per Year.
   - **Formula:** `EOQ = √((2 × Demand × Ordering Cost) / Holding Cost)`.
   - **Differentiation:** Core supply chain operations formula absent from retail break-even tools.

8. **Manufacturing Overall Equipment Effectiveness (OEE) Calculator (`oee-calc`)**
   - **Subcategory:** Plant Operations (`plant-operations`)
   - **Purpose & Target User:** Measures manufacturing productivity by evaluating Availability, Performance, and Quality metrics.
   - **Main Inputs:** Planned Production Time, Operating Time, Total Count Produced, Defective Count.
   - **Outputs:** Availability (%), Performance (%), Quality (%), OEE Percentage (%).
   - **Formula:** `OEE = Availability × Performance × Quality`.
   - **Differentiation:** Standard lean manufacturing productivity index.

9. **Safety Stock & Reorder Point Calculator (`safety-stock-calc`)**
   - **Subcategory:** Inventory Management (`inventory-management`)
   - **Purpose & Target User:** Calculates safety stock buffer requirements and inventory reorder trigger points to prevent stockouts.
   - **Main Inputs:** Average Daily Demand, Lead Time (Days), Max Daily Demand, Max Lead Time (Days).
   - **Outputs:** Safety Stock (Units), Reorder Point (Units).
   - **Formula:** `Reorder Point = (Avg Demand × Lead Time) + Safety Stock`.
   - **Differentiation:** Essential warehouse inventory control tool.

10. **Inventory Turnover Ratio & Days Sales of Inventory (DSI) Calculator (`inventory-turnover-calc`)**
    - **Subcategory:** Inventory Management (`inventory-management`)
    - **Purpose & Target User:** Measures how efficiently inventory is managed and sold over an accounting period.
    - **Main Inputs:** Cost of Goods Sold (COGS) ($), Average Inventory Value ($).
    - **Outputs:** Inventory Turnover Ratio, Days Sales of Inventory (Days in Stock).
    - **Formula:** `Turnover = COGS / Average Inventory`, `DSI = 365 / Turnover`.
    - **Differentiation:** Core financial and operational inventory efficiency metric.

---

### 4. Duplicate & Overlap Analysis
- **Comparison against Existing 320 Calculators:**
  - Checked against existing financial (`compound-interest`), business (`break-even`, `profit-margin`), and construction calculators. None of the 10 proposed tools duplicate existing functionality.
  - `cd-interest-calc` and `compound-savings-calc` specialize in fixed-term deposit maturity and regular deposit accumulation.
  - `ltv-cac-calc` and `turnover-rate-calc` introduce SaaS unit economics and HR metrics.
  - `dimensional-weight-calc` and `freight-cost-calc` establish the Logistics & Shipping category.
  - `eoq-calc`, `oee-calc`, `safety-stock-calc`, and `inventory-turnover-calc` establish the Manufacturing & Inventory category.

---

### 5. Proposed Category & Subcategory Structure
- **New Categories (4):**
  1. `banking-savings` (Banking & Savings Calculators)
  2. `business-operations` (Business Operations Calculators)
  3. `logistics-shipping` (Logistics & Shipping Calculators)
  4. `manufacturing-inventory` (Manufacturing & Inventory)
- **New Subcategories (6):**
  - `deposit-accounts`, `savings-accumulation`
  - `saas-unit-economics`, `human-resources`
  - `freight-parcel`
  - `inventory-management`, `plant-operations`

---

### 6. Implementation Dependencies & Risks
- **Dependencies:** Adherence to `CalculationContract` structure, `ResultFormatter`, and `PrecisionEngine`.
- **Risks & Mitigation:** Zero external API or paid service dependencies; all formulas are deterministic client-side mathematics. Strict ID prefixing ensures zero collision with existing IDs.

---

### 7. Projected Platform Totals After Batch 3
- **Categories:** 22 → **26 Categories**
- **Subcategories:** 75 → **81 Subcategories**
- **Calculators:** 320 → **330 Calculators**

---
*Discovery Audit Complete. Awaiting user approval before initiating Batch 3 implementation.*
