# CALCTOOLS — PHASE 11B BATCH 2: DISCOVERY & DUPLICATE AUDIT REPORT

**Objective:** Conduct a comprehensive catalog-wide discovery audit of the current platform (310 calculators, 18 categories, 66 subcategories), evaluate high-value expansion candidates (Insurance & Risk, Automotive, Education & Student Finance, Salary & Compensation), propose 10 distinct professional calculators, perform rigorous duplicate analysis, and outline the architectural roadmap for Batch 2.

---

### 1. Existing Platform Audit Summary
- **Current Baseline:** 310 client-side calculators, 18 categories, 66 subcategories.
- **Engine Architecture:** Robust `CalculationContract` registry, deterministic formulas, modular catalog files, and zero external dependency calls.
- **Identified Gaps:** While Phase 11B Batch 1 introduced Tax, Real Estate, E-commerce, and Solar, everyday consumer and professional decision-making still lacks dedicated suites in Insurance, Automotive ownership, Student & College Finance, and Salary & Compensation.

---

### 2. Candidate Category Evaluation & Selection

| Proposed Category ID | Category Title | Strategic Value | Complexity | Suitability Score (/10) | Verdict & Rationale |
|---|---|---|---|---|---|
| `insurance-risk` | Insurance & Risk Calculators | High financial literacy and life-planning intent | Medium | 9.0/10 | **Selected.** Essential for evaluating life insurance coverage needs and auto/home deductible cost trade-offs. |
| `automotive` | Automotive & Transport Calculators | High consumer search volume and ownership cost analysis | Low-Medium | 9.0/10 | **Selected.** Addresses vehicle depreciation curves and road trip fuel/travel expense budgeting. |
| `education-finance` | Education & Student Finance | High student/parent demand for debt repayment & savings | Medium | 9.5/10 | **Selected.** Fills a major gap in student loan amortization and 529 college savings planning. |
| `salary-compensation` | Salary & Compensation Calculators | High career utility, hourly-to-salary conversion & net pay | Medium | 9.5/10 | **Selected.** Highly searched professional toolset for pay transparency, overtime, and retirement 401(k) growth. |

---

### 3. Recommended 10 New Calculators for Batch 2

#### Category 1: Insurance & Risk (`insurance-risk`)
1. **Life Insurance Needs Calculator (`life-insurance-needs-calc`)**
   - **Subcategory:** Life & Health Risk (`life-health-risk`)
   - **Purpose & Target User:** Calculates recommended term life insurance coverage based on income replacement, debts, mortgage balance, and children's education needs.
   - **Main Inputs:** Annual Income, Years to Support, Total Debt/Mortgage, Existing Savings, Target Education Fund.
   - **Outputs:** Recommended Life Insurance Face Value, Income Replacement Component, Debt Offset.
   - **Formula:** `Coverage = (Annual Income × Years to Support) + Total Debt + Education Fund - Existing Savings`.
   - **Differentiation:** Completely unique life-planning coverage analysis not present in basic loans or financial calculators.

2. **Auto Insurance Deductible vs. Premium Comparison (`auto-insurance-deductible-calc`)**
   - **Subcategory:** Property & Casualty (`property-casualty`)
   - **Purpose & Target User:** Compares annual premium savings of higher deductibles against out-of-pocket costs in the event of an accident.
   - **Main Inputs:** Current Annual Premium, Proposed Annual Premium, Current Deductible, Proposed Deductible, Expected Claim Probability.
   - **Outputs:** Net Annual Premium Savings, Out-of-Pocket Difference, Break-even Claim Frequency.
   - **Formula:** `Net Savings = (Current Premium - Proposed Premium) - (Deductible Difference × Claim Probability)`.
   - **Differentiation:** Specialized risk management tool for policyholders.

#### Category 2: Automotive (`automotive`)
3. **Car Loan & Trade-In Depreciation Calculator (`car-depreciation-calc`)**
   - **Subcategory:** Vehicle Financing & Ownership (`vehicle-financing`)
   - **Purpose & Target User:** Estimates vehicle resale value over time factoring in annual depreciation curves and loan amortization balance.
   - **Main Inputs:** Purchase Price, Down Payment, Loan Rate, Loan Term, Annual Depreciation Rate (%).
   - **Outputs:** Projected Vehicle Value at Year 3/5, Remaining Loan Balance, Net Equity / Negative Equity.
   - **Formula:** `Value(t) = Initial Price × (1 - Rate)ᵗ`.
   - **Differentiation:** Combines loan amortization with multi-year asset depreciation analysis.

4. **Road Trip Fuel & Travel Expense Calculator (`road-trip-cost-calc`)**
   - **Subcategory:** Transport & Travel (`transport-travel`)
   - **Purpose & Target User:** Computes total travel fuel expenditure, tolls, and per-person cost splitting for road trips.
   - **Main Inputs:** Trip Distance (Miles/KM), Vehicle Fuel Economy (MPG / L/100km), Fuel Price per Gallon/Liter, Tolls, Number of Travelers.
   - **Outputs:** Total Fuel Cost, Total Trip Expense, Cost per Traveler.
   - **Formula:** `Fuel Cost = (Distance / MPG) × Fuel Price`.
   - **Differentiation:** Enhances basic fuel economy calculators with end-to-end trip budgeting and splitting.

#### Category 3: Education & Student Finance (`education-finance`)
5. **Student Loan Payoff & Repayment Plan Calculator (`student-loan-payoff-calc`)**
   - **Subcategory:** Student Loans (`student-loans`)
   - **Purpose & Target User:** Compares standard 10-year repayment versus income-driven or accelerated payoff strategies.
   - **Main Inputs:** Total Student Loan Balance, Interest Rate, Repayment Term (Years), Extra Monthly Payment.
   - **Outputs:** Standard Monthly Payment, Accelerated Monthly Payment, Total Interest Saved, Time Saved (Months).
   - **Formula:** Standard amortization with extra principal prepayment reduction.
   - **Differentiation:** Specialized student debt optimization tool distinct from general auto/mortgage loans.

6. **College Savings & 529 Plan Growth Calculator (`college-savings-529-calc`)**
   - **Subcategory:** College Savings (`college-savings`)
   - **Purpose & Target User:** Projects 529 college savings plan growth and compound interest accumulation for child education.
   - **Main Inputs:** Current Savings Balance, Monthly Contribution, Years until College, Expected Annual Return (%).
   - **Outputs:** Total Future Savings Balance, Total Contributions, Total Investment Earnings.
   - **Formula:** Compound interest formula with regular periodic contributions.
   - **Differentiation:** Dedicated tax-advantaged college savings growth model.

#### Category 4: Salary & Compensation (`salary-compensation`)
7. **Hourly to Annual Salary & Overtime Pay Calculator (`hourly-to-salary-calc`)**
   - **Subcategory:** Salary Conversion (`salary-conversion`)
   - **Purpose & Target User:** Converts hourly wages into annual, monthly, weekly, and daily equivalents with overtime time-and-a-half calculations.
   - **Main Inputs:** Hourly Wage Rate, Hours Worked per Week, Overtime Hours per Week, Paid Weeks per Year.
   - **Outputs:** Annual Base Salary, Overtime Earnings, Total Annual Gross Compensation.
   - **Formula:** `Annual = (Wage × Regular Hours × Weeks) + (Wage × 1.5 × OT Hours × Weeks)`.
   - **Differentiation:** Highly practical career tool absent from standard basic math or financial modules.

8. **Take-Home Pay & Net Salary Calculator (`net-salary-calc`)**
   - **Subcategory:** Paycheck & Net Pay (`paycheck-net-pay`)
   - **Purpose & Target User:** Estimates net take-home pay after federal income tax, state tax, FICA, and pre-tax deductions.
   - **Main Inputs:** Gross Annual Salary, Federal Tax Rate (%), State Tax Rate (%), FICA Rate (7.65%), Pre-tax Deductions.
   - **Outputs:** Net Annual Take-Home Pay, Net Monthly Take-Home Pay, Total Deductions.
   - **Formula:** `Net Pay = Gross - (Gross × (Fed% + State% + FICA%)) - Deductions`.
   - **Differentiation:** Direct employee paycheck estimation tool.

9. **Bonus & Commission Tax Withholding Calculator (`bonus-tax-calc`)**
   - **Subcategory:** Paycheck & Net Pay (`paycheck-net-pay`)
   - **Purpose & Target User:** Calculates supplemental tax withholding on end-of-year bonuses, commissions, and performance incentives.
   - **Main Inputs:** Bonus Amount, Supplemental Tax Withholding Rate (default 22% federal), State Supplemental Rate.
   - **Outputs:** Net Bonus Payout, Total Tax Withheld.
   - **Formula:** `Net Bonus = Bonus Amount × (1 - (Fed Supp% + State Supp%))`.
   - **Differentiation:** Specialized supplemental earnings calculator.

10. **Retirement 401(k) & Employer Match Growth Calculator (`retirement-401k-calc`)**
    - **Subcategory:** Retirement Growth (`retirement-growth`)
    - **Purpose & Target User:** Projects long-term retirement account growth including employee contributions and employer matching percentages.
    - **Main Inputs:** Current Salary, Employee Contribution (%), Employer Match Limit (%), Years to Retirement, Expected Return (%).
    - **Outputs:** Total Retirement Nest Egg, Employee Contributions, Employer Match Contributions, Compound Earnings.
    - **Formula:** Annuity compound growth formula incorporating dual contribution streams.
    - **Differentiation:** Dedicated retirement savings vehicle model.

---

### 4. Duplicate & Overlap Analysis
- **Comparison against Existing 310 Calculators:**
  - Checked against existing financial calculators (`loan-mortgage`, `compound-interest`, `auto-loan-calc`). None of the 10 proposed tools duplicate existing functionality.
  - `life-insurance-needs-calc` and `auto-insurance-deductible-calc` introduce brand-new risk management and insurance modules.
  - `car-depreciation-calc` and `road-trip-cost-calc` introduce consumer transport and vehicle ownership economics.
  - `student-loan-payoff-calc` and `college-savings-529-calc` fill the education finance niche.
  - `hourly-to-salary-calc`, `net-salary-calc`, `bonus-tax-calc`, and `retirement-401k-calc` provide comprehensive career and payroll compensation analysis.

---

### 5. Proposed Category & Subcategory Structure
- **New Categories (4):**
  1. `insurance-risk` (Insurance & Risk Calculators)
  2. `automotive` (Automotive & Transport Calculators)
  3. `education-finance` (Education & Student Finance)
  4. `salary-compensation` (Salary & Compensation Calculators)
- **New Subcategories (9):**
  - `life-health-risk`, `property-casualty`
  - `vehicle-financing`, `transport-travel`
  - `student-loans`, `college-savings`
  - `salary-conversion`, `paycheck-net-pay`, `retirement-growth`

---

### 6. Implementation Dependencies & Risks
- **Dependencies:** Adherence to `CalculationContract` structure, `ResultFormatter`, and `PrecisionEngine`.
- **Risks & Mitigation:** Zero external API or paid service dependencies; all formulas are deterministic client-side mathematics. Strict ID prefixing ensures no collision with existing IDs.

---

### 7. Projected Platform Totals After Batch 2
- **Categories:** 18 → **22 Categories**
- **Subcategories:** 66 → **75 Subcategories**
- **Calculators:** 310 → **320 Calculators**

---
*Discovery Audit Complete. Awaiting user approval before initiating Batch 2 implementation.*
