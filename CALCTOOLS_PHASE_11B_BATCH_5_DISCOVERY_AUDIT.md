# CALCTOOLS — PHASE 11B BATCH 5: DISCOVERY & DUPLICATE AUDIT REPORT

**Objective:** Conduct a comprehensive catalog-wide audit of the current platform (340 calculators, 30 categories, 91 subcategories), evaluate high-value expansion candidates (Environmental & Sustainability, Food Service & Hospitality, Aviation & Transportation, Cybersecurity & Data Management), propose 10 distinct professional calculators, perform rigorous duplicate analysis, confirm $0 paid-development-cost compliance, and outline the architectural roadmap for Batch 5.

---

### 1. Existing Platform Audit Summary
- **Current Baseline:** 340 client-side calculators, 30 categories, 91 subcategories.
- **Engine Architecture:** Robust `CalculationContract` registry, deterministic formulas, modular catalog files, and zero external dependency calls.
- **Identified Gaps:** While previous batches established broad coverage across math, finance, tax, real estate, insurance, automotive, education, banking, business operations, logistics, manufacturing, agriculture, healthcare, telecom, and personal productivity, specialized professional domains in Environmental Sustainability, Food Service & Hospitality, Aviation, and Cybersecurity remain unaddressed.

---

### 2. Candidate Category Evaluation & Selection

| Proposed Category ID | Category Title | Strategic Value | Complexity | Suitability Score (/10) | Verdict & Rationale |
|---|---|---|---|---|---|
| `environmental-sustainability` | Environmental & Sustainability | High consumer and corporate interest in carbon emissions and offset planning | Low-Medium | 9.0/10 | **Selected.** Introduces vital ecological tools for household/commute carbon footprints and energy offsets. |
| `food-service` | Food Service & Hospitality | High restaurant and catering utility for menu item recipe costing and table turnover | Low-Medium | 9.0/10 | **Selected.** Provides culinary and hospitality operators with food cost percentage and seating analytics. |
| `aviation-transport` | Aviation & Transportation | High utility for aviation students and pilots calculating wind correction and fuel range | Medium | 9.0/10 | **Selected.** Essential navigation and fuel burn estimators for flight planning. |
| `cybersecurity-data` | Cybersecurity & Data Management | High IT and security utility for password entropy, RAID capacity, and data center PUE | Medium | 9.5/10 | **Selected.** Fills a major technical gap in digital security, cloud storage transfers, and data center efficiency. |

---

### 3. Recommended 10 New Calculators for Batch 5

#### Category 1: Environmental & Sustainability (`environmental-sustainability`)
1. **Carbon Footprint & CO₂ Emission Estimator (`carbon-footprint-calc`)**
   - **Subcategory:** Carbon Accounting (`carbon-accounting`)
   - **Purpose & Target User:** Estimates annual household carbon footprint from electricity usage, natural gas, vehicle mileage, and air travel.
   - **Main Inputs:** Annual Electricity (kWh), Natural Gas (therms), Vehicle Miles Driven, Flight Hours.
   - **Outputs:** Total Annual CO₂ Emissions (Metric Tons).
   - **Formula:** Sum of consumption multiplied by EPA greenhouse gas emission coefficients.
   - **Differentiation:** Dedicated ecological carbon accounting tool.

2. **Home Solar Energy & Carbon Offset Calculator (`home-carbon-offset-calc`)**
   - **Subcategory:** Renewable Offset (`renewable-offset`)
   - **Purpose & Target User:** Calculates annual carbon dioxide emissions offset by installing rooftop solar photovoltaic systems.
   - **Main Inputs:** Annual Solar Generation (kWh), Regional Grid Emission Factor (lbs CO₂/kWh).
   - **Outputs:** Annual CO₂ Offset (Metric Tons), Equivalent Trees Planted.
   - **Formula:** `Offset (Tons) = (Solar kWh × Emission Factor) / 2204.62`.
   - **Differentiation:** Complements existing solar financial ROI calculators with ecological offset metrics.

#### Category 2: Food Service & Hospitality (`food-service`)
3. **Restaurant Food Cost Percentage & Recipe Pricing Calculator (`recipe-cost-calc`)**
   - **Subcategory:** Menu Costing (`menu-costing`)
   - **Purpose & Target User:** Computes individual recipe ingredient costs, total plate cost, food cost percentage, and recommended menu price.
   - **Main Inputs:** Ingredient Cost Sum, Target Food Cost Percentage (%).
   - **Outputs:** Total Plate Cost, Recommended Menu Price, Gross Profit per Dish.
   - **Formula:** `Menu Price = Total Plate Cost / (Target Food Cost % / 100)`.
   - **Differentiation:** Essential culinary management tool for restaurant operators.

4. **Restaurant Table Turnover & Seating Capacity Calculator (`table-turnover-calc`)**
   - **Subcategory:** Restaurant Operations (`restaurant-operations`)
   - **Purpose & Target User:** Calculates daily dining capacity, table turnover rate, and maximum guest volume.
   - **Main Inputs:** Number of Dining Seats, Average Meal Duration (Minutes), Operating Hours.
   - **Outputs:** Maximum Daily Guest Capacity, Table Turnover Rate.
   - **Formula:** `Capacity = Seats × (Operating Minutes / Meal Duration)`.
   - **Differentiation:** Dedicated hospitality capacity planning tool.

#### Category 3: Aviation & Transportation (`aviation-transport`)
5. **Flight Ground Speed & True Airspeed Calculator (`flight-airspeed-calc`)**
   - **Subcategory:** Flight Navigation (`flight-navigation`)
   - **Purpose & Target User:** Computes aircraft true airspeed, wind correction angle, and ground speed for flight planning.
   - **Main Inputs:** Indicated Airspeed (Knots), Altitude (Feet), Wind Speed & Direction.
   - **Outputs:** True Airspeed (TAS), Ground Speed (GS).
   - **Formula:** Standard aviation atmospheric density and vector vector addition formulas.
   - **Differentiation:** Specialized flight navigation calculation.

6. **Aircraft Fuel Burn & Flight Range Estimator (`flight-fuel-calc`)**
   - **Subcategory:** Flight Planning (`flight-planning`)
   - **Purpose & Target User:** Calculates total aviation fuel consumption, reserve fuel requirements, and maximum flight range.
   - **Main Inputs:** Fuel Burn Rate (Gallons/Hour), Cruising Speed (Knots), Usable Fuel Capacity (Gallons).
   - **Outputs:** Maximum Flight Time, Maximum Flight Range (Nautical Miles), Reserve Fuel.
   - **Formula:** `Range = (Usable Fuel / Burn Rate) × Speed`.
   - **Differentiation:** Aviation operational planning tool.

#### Category 4: Cybersecurity & Data Management (`cybersecurity-data`)
7. **Password Entropy & Crack Time Estimator (`password-entropy-calc`)**
   - **Subcategory:** Information Security (`information-security`)
   - **Purpose & Target User:** Calculates password bit entropy and estimates time required for brute-force cracking.
   - **Main Inputs:** Password Character Length, Character Set Size (lowercase, uppercase, numbers, symbols).
   - **Outputs:** Password Entropy (Bits), Estimated Brute-Force Crack Time.
   - **Formula:** `Entropy = Length × log₂(Charset Size)`.
   - **Differentiation:** Dedicated cybersecurity awareness and credential strength analyzer.

8. **Cloud Storage Transfer Time & Backup Cost Estimator (`cloud-storage-transfer-calc`)**
   - **Subcategory:** Cloud Infrastructure (`cloud-infrastructure`)
   - **Purpose & Target User:** Computes cloud data migration transfer times and monthly S3/cloud storage repository costs.
   - **Main Inputs:** Total Data Volume (TB), Upload Bandwidth (Mbps), Storage Cost per GB ($).
   - **Outputs:** Migration Transfer Duration, Monthly Storage Cost.
   - **Formula:** Bandwidth transfer calculation and linear storage pricing.
   - **Differentiation:** Cloud architecture and DevOps planning tool.

9. **RAID Storage Capacity & Fault Tolerance Calculator (`raid-capacity-calc`)**
   - **Subcategory:** Data Storage (`data-storage`)
   - **Purpose & Target User:** Determines usable storage capacity, fault tolerance, and drive failure survivability across RAID levels (RAID 0, 1, 5, 6, 10).
   - **Main Inputs:** Number of Hard Drives, Individual Drive Capacity (TB), RAID Level.
   - **Outputs:** Usable Storage Capacity (TB), Drive Fault Tolerance.
   - **Formula:** Mathematical capacity formulas per RAID standard.
   - **Differentiation:** Dedicated storage administrator hardware calculator.

10. **Data Center Power Usage Effectiveness (PUE) Calculator (`pue-calc`)**
    - **Subcategory:** Data Center Efficiency (`datacenter-efficiency`)
    - **Purpose & Target User:** Calculates data center PUE and infrastructure energy efficiency metrics.
    - **Main Inputs:** Total Facility Energy Power (kW), IT Equipment Energy Power (kW).
    - **Outputs:** PUE Ratio, Facility Overhead Energy Percentage (%).
    - **Formula:** `PUE = Total Facility Energy / IT Equipment Energy`.
    - **Differentiation:** Specialized data center operational efficiency metric.

---

### 4. Duplicate & Overlap Analysis
- **Comparison against Existing 340 Calculators:**
  - Checked against existing electrical (`electricity-cost`), engineering, and business calculators. None of the 10 proposed tools duplicate existing functionality.
  - `carbon-footprint-calc` and `home-carbon-offset-calc` establish Environmental & Sustainability.
  - `recipe-cost-calc` and `table-turnover-calc` establish Food Service & Hospitality.
  - `flight-airspeed-calc` and `flight-fuel-calc` establish Aviation & Transportation.
  - `password-entropy-calc`, `cloud-storage-transfer-calc`, `raid-capacity-calc`, and `pue-calc` establish Cybersecurity & Data Management.

---

### 5. Proposed Category & Subcategory Structure
- **New Categories (4):**
  1. `environmental-sustainability` (Environmental & Sustainability)
  2. `food-service` (Food Service & Hospitality)
  3. `aviation-transport` (Aviation & Transportation)
  4. `cybersecurity-data` (Cybersecurity & Data Management)
- **New Subcategories (10):**
  - `carbon-accounting`, `renewable-offset`
  - `menu-costing`, `restaurant-operations`
  - `flight-navigation`, `flight-planning`
  - `information-security`, `cloud-infrastructure`, `data-storage`, `datacenter-efficiency`

---

### 6. Strict Development Cost Confirmation ($0 Cost)
- **Confirmation:** Batch 5 requires **$0 paid-development-cost**.
- **Dependencies:** Built entirely using local TypeScript/React components, browser-native math libraries, and deterministic calculation contracts.
- **No Paid Assets:** Zero paid APIs, zero paid subscriptions, zero paid AI coding services, and zero paid third-party dependencies.

---

### 7. Projected Platform Totals After Batch 5
- **Categories:** 30 → **34 Categories**
- **Subcategories:** 91 → **101 Subcategories**
- **Calculators:** 340 → **350 Calculators**

---
*Discovery Audit Complete. Awaiting user approval before initiating Batch 5 implementation.*
