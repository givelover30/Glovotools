# GLOVOTOOLS — PHASE 11B BATCH 6 DISCOVERY & DUPLICATE AUDIT

## Executive Summary

This discovery audit outlines the proposed 10 new calculators for **Batch 6** of the GLOVOTOOLS platform expansion. Following a rigorous catalog-wide audit of all **350 existing calculators, 34 categories, and 101 subcategories**, Batch 6 targets four high-value, underserved domains:
1. **Legal & Compliance Calculations**
2. **Real Estate Development**
3. **Retail & Supply Chain**
4. **Sports & Athletics Performance**

All proposed calculators have been checked against the existing catalog to ensure zero duplication, distinct user value, and reliable deterministic mathematical foundations adhering to the strict **$0 development cost requirement**.

---

## 1. Existing Catalog Audit Summary

- **Total Registered Calculators**: 350
- **Total Categories**: 34
- **Total Subcategories**: 101
- **Catalog Gaps Identified**: While GLOVOTOOLS boasts extensive calculators in finance, health, math, and engineering, there is a notable absence of professional tools for legal compliance risk modeling (NDAs, GDPR requests), advanced real estate development (net operating income, land residual value), retail inventory planning (Open-to-Buy, stockout costs), and specialized athletic disciplines (cycling FTP, swim speed, running race prediction, and baseball statistics).

---

## 2. Proposed Batch 6 Calculators (10 Tools)

### Domain 1: Legal & Compliance Calculations (`legal-compliance`)

#### 1. NDA Breach Damage & Liquidated Damages Estimator (`nda-damages-calc`)
- *Category & Subcategory*: Legal & Compliance (`legal-compliance`) / Contract Law (`contract-law`)
- *Purpose*: Help attorneys, business owners, and risk analysts estimate potential financial damages and enforceable liquidated damages from trade secret or Non-Disclosure Agreement (NDA) breaches.
- *Inputs*: Estimated misappropriated commercial value ($), direct revenue lost ($), mitigation efforts/legal fees ($), contractual liquidated damages cap ($).
- *Outputs*: Total estimated breach damages ($), recommended settlement benchmark ($), enforceability risk assessment.
- *Deterministic Formula*:
  $$\text{Total Damages} = \text{Misappropriation Value} + \text{Direct Revenue Lost} + \text{Legal Fees}$$
  $$\text{Enforceable Damages} = \min(\text{Total Damages}, \text{Liquidated Damages Cap})$$
- *Worked Example*: Misappropriation value: $150,000; Lost revenue: $45,000; Legal fees: $25,000; Contractual cap: $250,000.
  $$\text{Total Damages} = 150,000 + 45,000 + 25,000 = \$220,000$$
- *Duplicate Analysis*: Zero overlap with existing contract or legal tools.

#### 2. GDPR Data Subject Access Request (DSAR) Cost Calculator (`dsar-cost-calc`)
- *Category & Subcategory*: Legal & Compliance (`legal-compliance`) / Data Privacy Compliance (`data-privacy`)
- *Purpose*: Calculate the operational labor and compliance costs associated with fulfilling GDPR/CCPA Data Subject Access Requests.
- *Inputs*: Annual number of DSARs received, average staff hours per request, average hourly wage/compliance officer cost ($), software tool licensing cost per year ($).
- *Outputs*: Total annual DSAR compliance cost ($), cost per individual request ($), projected regulatory penalty risk exposure.
- *Deterministic Formula*:
  $$\text{Annual Labor Cost} = \text{Annual DSARs} \times \text{Hours per Request} \times \text{Hourly Rate}$$
  $$\text{Total Compliance Cost} = \text{Annual Labor Cost} + \text{Software Licensing Cost}$$
  $$\text{Cost per Request} = \frac{\text{Total Compliance Cost}}{\text{Annual DSARs}}$$
- *Worked Example*: 500 DSARs/yr; 4.5 hours per request; $45/hr wage; $12,000 annual tooling.
  $$\text{Annual Labor} = 500 \times 4.5 \times 45 = \$101,250$$
  $$\text{Total Cost} = 101,250 + 12,000 = \$113,250 \quad (\$226.50\text{ per request})$$
- *Duplicate Analysis*: No existing DSAR or privacy compliance calculators in the catalog.

---

### Domain 2: Real Estate Development (`real-estate-dev`)

#### 3. Commercial Real Estate Cap Rate & NOI Calculator (`cre-cap-rate-calc`)
- *Category & Subcategory*: Real Estate Development (`real-estate-dev`) / Commercial Real Estate (`commercial-re`)
- *Purpose*: Compute Net Operating Income (NOI), Capitalization Rate (Cap Rate), and property valuation for commercial real estate investments.
- *Inputs*: Gross potential rent ($/yr), vacancy and collection loss (%), operating expenses ($/yr), property purchase price ($).
- *Outputs*: Net Operating Income ($/yr), Capitalization Rate (%), Gross Income Multiplier (GIM).
- *Deterministic Formula*:
  $$\text{Effective Gross Income} = \text{Potential Rent} \times (1 - \text{Vacancy Rate}/100)$$
  $$\text{NOI} = \text{Effective Gross Income} - \text{Operating Expenses}$$
  $$\text{Cap Rate } (\%) = \left(\frac{\text{NOI}}{\text{Purchase Price}}\right) \times 100$$
- *Worked Example*: Potential rent: $200,000; Vacancy: 5%; Operating expenses: $65,000; Purchase price: $1,800,000.
  $$\text{Effective Income} = 200,000 \times 0.95 = \$190,000$$
  $$\text{NOI} = 190,000 - 65,000 = \$125,000$$
  $$\text{Cap Rate} = (125,000 / 1,800,000) \times 100 = 6.94\%$$
- *Duplicate Analysis*: Distinct from residential mortgage or rental yield calculators; tailored specifically to commercial NOI and cap rate analysis.

#### 4. Real Estate Land Residual Value Calculator (`land-residual-calc`)
- *Category & Subcategory*: Real Estate Development (`real-estate-dev`) / Property Development (`property-dev`)
- *Purpose*: Determine the maximum acquisition price a developer can pay for raw land based on projected completed building value, construction costs, and required profit margin.
- *Inputs*: Projected Gross Development Value (GDV) ($), total hard and soft construction costs ($), developer profit margin (%), financing & transaction costs ($).
- *Outputs*: Maximum Land Residual Value ($), total project cost ($), developer profit amount ($).
- *Deterministic Formula*:
  $$\text{Total Development Cost} = \text{Construction Costs} + \text{Financing Costs}$$
  $$\text{Target Profit} = \text{GDV} \times (\text{Profit Margin } \% / 100)$$
  $$\text{Land Residual Value} = \text{GDV} - \text{Total Development Cost} - \text{Target Profit}$$
- *Worked Example*: GDV: $5,000,000; Construction costs: $3,200,000; Financing costs: $300,000; Target profit: 20% of GDV ($1,000,000).
  $$\text{Land Residual} = 5,000,000 - 3,200,000 - 300,000 - 1,000,000 = \$500,000$$
- *Duplicate Analysis*: Zero existing land residual development tools.

---

### Domain 3: Retail & Supply Chain (`retail-supply-chain`)

#### 5. Retail Open-to-Buy (OTB) Plan Calculator (`open-to-buy-calc`)
- *Category & Subcategory*: Retail & Supply Chain (`retail-supply-chain`) / Retail Inventory (`retail-inventory`)
- *Purpose*: Calculate merchandise Open-to-Buy budget ($) to ensure retailers maintain optimal inventory levels without overbuying or stocking out.
- *Inputs*: Planned end-of-month inventory ($), projected sales ($), planned markdowns ($), existing on-hand inventory ($), on-order inventory arriving this month ($).
- *Outputs*: Open-to-Buy budget at retail ($), planned stock-to-sales ratio.
- *Deterministic Formula*:
  $$\text{Total Merchandise Needed} = \text{Planned EOM Inventory} + \text{Projected Sales} + \text{Planned Markdowns}$$
  $$\text{Total Inventory Available} = \text{On-Hand Inventory} + \text{On-Order Inventory}$$
  $$\text{Open-to-Buy (OTB)} = \text{Total Merchandise Needed} - \text{Total Inventory Available}$$
- *Worked Example*: Planned EOM inventory: $50,000; Projected sales: $30,000; Markdowns: $2,000; On-hand: $40,000; On-order: $15,000.
  $$\text{Needed} = 50,000 + 30,000 + 2,000 = \$82,000$$
  $$\text{Available} = 40,000 + 15,000 = \$55,000$$
  $$\text{OTB} = 82,000 - 55,000 = \$27,000$$
- *Duplicate Analysis*: Distinct from EOQ or safety stock calculators; focuses on retail merchandise budgeting and open-to-buy cycles.

#### 6. Stockout Cost & Lost Sales Calculator (`stockout-cost-calc`)
- *Category & Subcategory*: Retail & Supply Chain (`retail-supply-chain`) / Inventory Risk (`inventory-risk`)
- *Purpose*: Quantify the financial loss resulting from stockouts, including lost gross profit and customer churn impact.
- *Inputs*: Average daily unit sales during stockout, number of stockout days, retail price per unit ($), cost of goods sold per unit ($), customer lifetime loss factor ($).
- *Outputs*: Total lost revenue ($), lost gross profit ($), estimated customer goodwill loss ($), total stockout financial impact ($).
- *Deterministic Formula*:
  $$\text{Lost Units} = \text{Daily Unit Sales} \times \text{Stockout Days}$$
  $$\text{Lost Revenue} = \text{Lost Units} \times \text{Retail Price}$$
  $$\text{Lost Profit} = \text{Lost Units} \times (\text{Retail Price} - \text{COGS})$$
- *Worked Example*: Daily sales: 25 units; Stockout days: 6; Retail price: $40; COGS: $16.
  $$\text{Lost Units} = 25 \times 6 = 150 \text{ units}$$
  $$\text{Lost Revenue} = 150 \times 40 = \$6,000$$
  $$\text{Lost Profit} = 150 \times (40 - 16) = \$3,600$$
- *Duplicate Analysis*: Complements existing inventory turnover and safety stock calculators by evaluating the exact cost of stockout events.

---

### Domain 4: Sports & Athletics Performance (`sports-athletics`)

#### 7. Running Race Time Predictor (Riegel Formula) (`running-race-predictor-calc`)
- *Category & Subcategory*: Sports & Athletics (`sports-athletics`) / Endurance Running (`endurance-running`)
- *Purpose*: Predict finish times for various running distances (e.g., marathon, half marathon) based on a recent race time using Peter Riegel’s endurance formula.
- *Inputs*: Recent race distance (km or miles), recent race time (hours:minutes:seconds), target race distance (km or miles).
- *Outputs*: Predicted target finish time (hours:mins:secs), predicted average pace per mile/km.
- *Deterministic Formula*:
  $$T_2 = T_1 \times \left(\frac{D_2}{D_1}\right)^{1.06}$$
  *(where $T_1$ is known time, $D_1$ is known distance, $T_2$ is predicted time, $D_2$ is target distance).*
- *Worked Example*: 5K race time ($D_1 = 5$ km): 20:00 (1,200 seconds). Target distance ($D_2 = 42.195$ km, Marathon).
  $$T_2 = 1200 \times (42.195 / 5)^{1.06} = 1200 \times (8.439)^{1.06} = 1200 \times 9.492 = 11,390 \text{ seconds (3h 16m 30s)}$$
- *Duplicate Analysis*: Distinct from basic running pace calculator; implements Riegel's endurance prediction power law.

#### 8. Cycling Functional Threshold Power (FTP) & Zones Calculator (`cycling-ftp-calc`)
- *Category & Subcategory*: Sports & Athletics (`sports-athletics`) / Cycling Power (`cycling-power`)
- *Purpose*: Calculate Functional Threshold Power (FTP) from standard testing protocols (e.g., 95% of 20-minute time trial power) and establish 7 Coggan power training zones.
- *Inputs*: Average power output during 20-minute test (Watts), rider body weight (kg).
- *Outputs*: FTP (Watts), Power-to-Weight Ratio (W/kg), and power ranges for Zones 1 through 7.
- *Deterministic Formula*:
  $$\text{FTP} = \text{20-Minute Average Power} \times 0.95$$
  $$\text{W/kg} = \frac{\text{FTP}}{\text{Weight (kg)}}$$
- *Worked Example*: 20-minute power: 280 Watts; Weight: 70 kg.
  $$\text{FTP} = 280 \times 0.95 = 263 \text{ Watts}$$
  $$\text{W/kg} = 263 / 70 = 3.76 \text{ W/kg}$$
- *Duplicate Analysis*: Zero existing cycling power meter or FTP zone calculators in the catalog.

#### 9. Swimming Pace & Critical Swim Speed (CSS) Calculator (`swimming-pace-calc`)
- *Category & Subcategory*: Sports & Athletics (`sports-athletics`) / Swimming Performance (`swimming`)
- *Purpose*: Compute Critical Swim Speed (CSS) and threshold pace per 100 meters/yards based on time trial results.
- *Inputs*: Time for 400m time trial (seconds), time for 200m time trial (seconds).
- *Outputs*: Critical Swim Speed (meters per second), threshold pace per 100m (minutes:seconds).
- *Deterministic Formula*:
  $$\text{CSS (m/s)} = \frac{400 - 200}{T_{400} - T_{200}}$$
  $$\text{Pace per 100m (seconds)} = \frac{100}{\text{CSS}}$$
- *Worked Example*: 400m time: 5:20 (320 seconds); 200m time: 2:30 (150 seconds).
  $$\text{CSS} = (400 - 200) / (320 - 150) = 200 / 170 = 1.176 \text{ m/s}$$
  $$\text{Pace per 100m} = 100 / 1.176 = 85 \text{ seconds (1:25 / 100m)}$$
- *Duplicate Analysis*: No existing swimming pace or CSS calculators.

#### 10. Baseball Batting Average & On-Base Percentage (OBP) Calculator (`baseball-batting-stats-calc`)
- *Category & Subcategory*: Sports & Athletics (`sports-athletics`) / Baseball Statistics (`baseball-stats`)
- *Purpose*: Calculate standard baseball offensive metrics including Batting Average (BA), On-Base Percentage (OBP), Slugging Percentage (SLG), and On-Base Plus Slugging (OPS).
- *Inputs*: At-bats (AB), Hits (H), Walks (BB), Hit-by-pitch (HBP), Sacrifice flies (SF), Total bases (TB - singles + 2×doubles + 3×triples + 4×home runs).
- *Outputs*: Batting Average (BA), On-Base Percentage (OBP), Slugging Percentage (SLG), OPS.
- *Deterministic Formula*:
  $$\text{BA} = \frac{\text{Hits}}{\text{At-Bats}}$$
  $$\text{OBP} = \frac{\text{Hits} + \text{Walks} + \text{HBP}}{\text{At-Bats} + \text{Walks} + \text{HBP} + \text{Sacrifice Flies}}$$
  $$\text{SLG} = \frac{\text{Total Bases}}{\text{At-Bats}}$$
  $$\text{OPS} = \text{OBP} + \text{SLG}$$
- *Worked Example*: AB: 400, Hits: 120, Walks: 50, HBP: 10, SF: 5, Total Bases: 200.
  $$\text{BA} = 120 / 400 = 0.300$$
  $$\text{OBP} = (120 + 50 + 10) / (400 + 50 + 10 + 5) = 180 / 465 = 0.387$$
  $$\text{SLG} = 200 / 400 = 0.500$$
  $$\text{OPS} = 0.387 + 0.500 = 0.887$$
- *Duplicate Analysis*: Zero baseball or team sports statistics calculators currently exist in the catalog.

---

## 3. Projected Platform Totals (Batch 6)

If all 10 proposed calculators are approved and implemented:
- **Total Calculators**: 360 (up from 350)
- **Total Categories**: 37 (adding 3 new clean categories: `legal-compliance`, `real-estate-dev`, `retail-supply-chain`; sports/athletics integrated into existing `health-fitness` or dedicated category).
- **Total Subcategories**: Exactly 111 subcategories.

---

## 4. Technical Dependencies & Risks

- **Dependencies**: None. 100% browser-native TypeScript and Math libraries.
- **Cost**: $0 paid development cost.
- **Risk**: Low. All formulas use established domain-standard equations (Riegel formula, NOI/Cap Rate, OTB retail equations, baseball sabermetrics).

---

## 5. Compliance Confirmation
- Discovery only. No source code modified. No files created outside of this discovery audit report. Awaiting user review and approval before proceeding to implementation.
