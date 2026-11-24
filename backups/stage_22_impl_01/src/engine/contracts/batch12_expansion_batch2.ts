import { CalculationContract } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH12_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Life Insurance Needs Calculator
  {
    id: 'life-insurance-needs-calc',
    name: 'Life Insurance Needs Calculator',
    category: 'insurance-risk',
    subcategoryId: 'life-health-risk',
    formulaMeta: {
      formulaName: 'Income Replacement & Debt Offset Formula',
      formulaExpression: 'Coverage = (Annual Income × Years) + Total Debt + Education - Existing Savings',
      variables: [
        { symbol: 'AI', name: 'Annual Income ($)', unit: '$' },
        { symbol: 'Y', name: 'Support Years' },
        { symbol: 'D', name: 'Total Debt ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'annualIncome', label: 'Annual Gross Income ($)', type: 'currency', required: true, defaultValue: 85000, min: 0 },
        { name: 'supportYears', label: 'Years to Support Dependents', type: 'integer', required: true, defaultValue: 15, min: 1, max: 40 },
        { name: 'totalDebt', label: 'Total Debt & Mortgage ($)', type: 'currency', required: true, defaultValue: 320000, min: 0 },
        { name: 'educationFund', label: 'Children College Fund ($)', type: 'currency', required: true, defaultValue: 60000, min: 0 },
        { name: 'existingSavings', label: 'Existing Savings & Life Policy ($)', type: 'currency', required: true, defaultValue: 45000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualIncome: number; supportYears: number; totalDebt: number; educationFund: number; existingSavings: number }) => {
      const incomeReplacement = inputs.annualIncome * inputs.supportYears;
      const grossNeed = incomeReplacement + inputs.totalDebt + inputs.educationFund;
      const netCoverageNeeded = Math.max(0, grossNeed - inputs.existingSavings);
      return { incomeReplacement, totalDebt: inputs.totalDebt, educationFund: inputs.educationFund, existingSavings: inputs.existingSavings, netCoverageNeeded };
    },
    formatResult: (res: { incomeReplacement: number; totalDebt: number; educationFund: number; existingSavings: number; netCoverageNeeded: number }) => ({
      primary: {
        label: 'Recommended Life Insurance Coverage',
        value: ResultFormatter.formatCurrency(res.netCoverageNeeded),
        numericValue: res.netCoverageNeeded
      },
      secondary: [
        { label: 'Income Replacement Component', value: ResultFormatter.formatCurrency(res.incomeReplacement) },
        { label: 'Debt & Mortgage Payoff', value: ResultFormatter.formatCurrency(res.totalDebt) },
        { label: 'Children Education Fund', value: ResultFormatter.formatCurrency(res.educationFund) },
        { label: 'Existing Savings Offset', value: ResultFormatter.formatCurrency(res.existingSavings) }
      ]
    })
  },

  // 2. Auto Insurance Deductible vs. Premium Comparison Calculator
  {
    id: 'auto-insurance-deductible-calc',
    name: 'Auto Insurance Deductible vs. Premium Calculator',
    category: 'insurance-risk',
    subcategoryId: 'property-casualty',
    formulaMeta: {
      formulaName: 'Deductible Risk Trade-off Formula',
      formulaExpression: 'Net Savings = Annual Premium Savings - (Deductible Increase × Claim Probability)',
      variables: [
        { symbol: 'PS', name: 'Annual Premium Savings ($)', unit: '$' },
        { symbol: 'DI', name: 'Deductible Increase ($)', unit: '$' },
        { symbol: 'CP', name: 'Claim Probability' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'currentPremium', label: 'Current Annual Premium ($)', type: 'currency', required: true, defaultValue: 1400, min: 100 },
        { name: 'proposedPremium', label: 'Proposed Higher-Deductible Premium ($)', type: 'currency', required: true, defaultValue: 1100, min: 100 },
        { name: 'currentDeductible', label: 'Current Deductible ($)', type: 'currency', required: true, defaultValue: 500, min: 0 },
        { name: 'proposedDeductible', label: 'Proposed Deductible ($)', type: 'currency', required: true, defaultValue: 1000, min: 0 },
        { name: 'claimProbability', label: 'Estimated Claims per Year (e.g. 0.2 = 1 in 5 yrs)', type: 'percentage', required: true, defaultValue: 20, min: 0, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentPremium: number; proposedPremium: number; currentDeductible: number; proposedDeductible: number; claimProbability: number }) => {
      const annualPremiumSavings = inputs.currentPremium - inputs.proposedPremium;
      const deductibleIncrease = inputs.proposedDeductible - inputs.currentDeductible;
      const prob = inputs.claimProbability / 100;
      const expectedClaimCostDiff = deductibleIncrease * prob;
      const netAnnualBenefit = annualPremiumSavings - expectedClaimCostDiff;
      return { annualPremiumSavings, deductibleIncrease, expectedClaimCostDiff, netAnnualBenefit };
    },
    formatResult: (res: { annualPremiumSavings: number; deductibleIncrease: number; expectedClaimCostDiff: number; netAnnualBenefit: number }) => ({
      primary: {
        label: 'Net Expected Annual Benefit',
        value: ResultFormatter.formatCurrency(res.netAnnualBenefit),
        numericValue: res.netAnnualBenefit
      },
      secondary: [
        { label: 'Guaranteed Premium Savings', value: ResultFormatter.formatCurrency(res.annualPremiumSavings) },
        { label: 'Deductible Increase', value: ResultFormatter.formatCurrency(res.deductibleIncrease) },
        { label: 'Expected Annual Claim Risk', value: ResultFormatter.formatCurrency(res.expectedClaimCostDiff) }
      ]
    })
  },

  // 3. Car Loan & Trade-In Depreciation Calculator
  {
    id: 'car-depreciation-calc',
    name: 'Car Loan & Trade-In Depreciation Calculator',
    category: 'automotive',
    subcategoryId: 'vehicle-financing',
    formulaMeta: {
      formulaName: 'Compound Vehicle Depreciation Formula',
      formulaExpression: 'Value(t) = Purchase Price × (1 - Rate)ᵗ',
      variables: [
        { symbol: 'P', name: 'Purchase Price ($)', unit: '$' },
        { symbol: 'R', name: 'Annual Depreciation Rate (%)', unit: '%' },
        { symbol: 't', name: 'Time in Years' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'purchasePrice', label: 'Vehicle Purchase Price ($)', type: 'currency', required: true, defaultValue: 38000, min: 1000 },
        { name: 'downPayment', label: 'Down Payment ($)', type: 'currency', required: true, defaultValue: 5000, min: 0 },
        { name: 'loanRate', label: 'Loan Interest Rate (%)', type: 'percentage', required: true, defaultValue: 6.0, min: 0, max: 30 },
        { name: 'loanTermMonths', label: 'Loan Term (Months)', type: 'integer', required: true, defaultValue: 60, min: 12, max: 84 },
        { name: 'depreciationRate', label: 'Estimated Annual Depreciation (%)', type: 'percentage', required: true, defaultValue: 15, min: 1, max: 50 },
        { name: 'yearsElapsed', label: 'Years Elapsed / Horizon', type: 'integer', required: true, defaultValue: 3, min: 1, max: 10 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { purchasePrice: number; downPayment: number; loanRate: number; loanTermMonths: number; depreciationRate: number; yearsElapsed: number }) => {
      const loanAmount = Math.max(0, inputs.purchasePrice - inputs.downPayment);
      const monthlyRate = inputs.loanRate / 100 / 12;
      const n = inputs.loanTermMonths;
      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / n;
      } else {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      }
      const monthsElapsed = Math.min(n, inputs.yearsElapsed * 12);
      let remainingBalance = loanAmount;
      if (monthlyRate === 0) {
        remainingBalance = Math.max(0, loanAmount - (monthlyPayment * monthsElapsed));
      } else {
        remainingBalance = loanAmount * (Math.pow(1 + monthlyRate, n) - Math.pow(1 + monthlyRate, monthsElapsed)) / (Math.pow(1 + monthlyRate, n) - 1);
      }

      const depRate = inputs.depreciationRate / 100;
      const futureVehicleValue = inputs.purchasePrice * Math.pow(1 - depRate, inputs.yearsElapsed);
      const netEquity = futureVehicleValue - remainingBalance;

      return { futureVehicleValue, remainingBalance, netEquity, monthlyPayment };
    },
    formatResult: (res: { futureVehicleValue: number; remainingBalance: number; netEquity: number; monthlyPayment: number }) => ({
      primary: {
        label: 'Projected Net Vehicle Equity',
        value: ResultFormatter.formatCurrency(res.netEquity),
        numericValue: res.netEquity
      },
      secondary: [
        { label: 'Projected Resale Value', value: ResultFormatter.formatCurrency(res.futureVehicleValue) },
        { label: 'Remaining Loan Balance', value: ResultFormatter.formatCurrency(res.remainingBalance) },
        { label: 'Monthly Car Payment', value: ResultFormatter.formatCurrency(res.monthlyPayment) }
      ]
    })
  },

  // 4. Road Trip Fuel & Travel Expense Calculator
  {
    id: 'road-trip-cost-calc',
    name: 'Road Trip Fuel & Travel Expense Calculator',
    category: 'automotive',
    subcategoryId: 'transport-travel',
    formulaMeta: {
      formulaName: 'Road Trip Fuel & Expense Formula',
      formulaExpression: 'Total Cost = (Distance / MPG) × Fuel Price + Tolls',
      variables: [
        { symbol: 'D', name: 'Distance (Miles)', unit: 'mi' },
        { symbol: 'MPG', name: 'Fuel Economy (MPG)' },
        { symbol: 'FP', name: 'Fuel Price ($/gal)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'distanceMiles', label: 'Total Trip Distance (Miles)', type: 'number', required: true, defaultValue: 650, min: 1 },
        { name: 'mpg', label: 'Vehicle Fuel Economy (MPG)', type: 'number', required: true, defaultValue: 28, min: 1, max: 120 },
        { name: 'fuelPrice', label: 'Fuel Price per Gallon ($)', type: 'currency', required: true, defaultValue: 3.59, min: 0.50, max: 15 },
        { name: 'tolls', label: 'Total Estimated Tolls ($)', type: 'currency', required: true, defaultValue: 25, min: 0 },
        { name: 'travelers', label: 'Number of Travelers (for splitting)', type: 'integer', required: true, defaultValue: 2, min: 1, max: 20 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { distanceMiles: number; mpg: number; fuelPrice: number; tolls: number; travelers: number }) => {
      const gallonsNeeded = inputs.mpg > 0 ? inputs.distanceMiles / inputs.mpg : 0;
      const fuelCost = gallonsNeeded * inputs.fuelPrice;
      const totalTripCost = fuelCost + inputs.tolls;
      const costPerTraveler = inputs.travelers > 0 ? totalTripCost / inputs.travelers : totalTripCost;
      return { gallonsNeeded, fuelCost, totalTripCost, costPerTraveler };
    },
    formatResult: (res: { gallonsNeeded: number; fuelCost: number; totalTripCost: number; costPerTraveler: number }) => ({
      primary: {
        label: 'Total Road Trip Expense',
        value: ResultFormatter.formatCurrency(res.totalTripCost),
        numericValue: res.totalTripCost
      },
      secondary: [
        { label: 'Total Fuel Cost', value: ResultFormatter.formatCurrency(res.fuelCost) },
        { label: 'Gallons Required', value: `${res.gallonsNeeded.toFixed(1)} gal` },
        { label: 'Cost per Traveler', value: ResultFormatter.formatCurrency(res.costPerTraveler) }
      ]
    })
  },

  // 5. Student Loan Payoff & Repayment Calculator
  {
    id: 'student-loan-payoff-calc',
    name: 'Student Loan Payoff & Repayment Calculator',
    category: 'education-finance',
    subcategoryId: 'student-loans',
    formulaMeta: {
      formulaName: 'Student Loan Amortization Formula',
      formulaExpression: 'PMT = P [r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
      variables: [
        { symbol: 'P', name: 'Loan Principal ($)', unit: '$' },
        { symbol: 'r', name: 'Monthly Interest Rate' },
        { symbol: 'n', name: 'Total Months' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Total Student Loan Balance ($)', type: 'currency', required: true, defaultValue: 35000, min: 500 },
        { name: 'annualRate', label: 'Interest Rate (%)', type: 'percentage', required: true, defaultValue: 5.8, min: 0, max: 20 },
        { name: 'termYears', label: 'Standard Repayment Term (Years)', type: 'integer', required: true, defaultValue: 10, min: 1, max: 30 },
        { name: 'extraMonthlyPayment', label: 'Extra Monthly Principal Payment ($)', type: 'currency', required: true, defaultValue: 150, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { principal: number; annualRate: number; termYears: number; extraMonthlyPayment: number }) => {
      const p = inputs.principal;
      const r = inputs.annualRate / 100 / 12;
      const n = inputs.termYears * 12;

      let standardPayment = 0;
      if (r === 0) {
        standardPayment = p / n;
      } else {
        standardPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }
      const standardTotalPaid = standardPayment * n;
      const standardInterest = standardTotalPaid - p;

      const acceleratedPayment = standardPayment + inputs.extraMonthlyPayment;
      let balance = p;
      let actualMonths = 0;
      let totalPaidAccelerated = 0;

      while (balance > 0 && actualMonths < 600) {
        const interestCharge = balance * r;
        let principalPaid = acceleratedPayment - interestCharge;
        if (principalPaid >= balance) {
          principalPaid = balance;
          balance = 0;
        } else {
          balance -= principalPaid;
        }
        totalPaidAccelerated += (interestCharge + principalPaid);
        actualMonths++;
      }

      const acceleratedInterest = Math.max(0, totalPaidAccelerated - p);
      const interestSaved = Math.max(0, standardInterest - acceleratedInterest);
      const monthsSaved = Math.max(0, n - actualMonths);

      return { standardPayment, acceleratedPayment, standardInterest, acceleratedInterest, interestSaved, monthsSaved, actualMonths };
    },
    formatResult: (res: { standardPayment: number; acceleratedPayment: number; standardInterest: number; acceleratedInterest: number; interestSaved: number; monthsSaved: number; actualMonths: number }) => ({
      primary: {
        label: 'Total Interest Saved',
        value: ResultFormatter.formatCurrency(res.interestSaved),
        numericValue: res.interestSaved
      },
      secondary: [
        { label: 'Standard Monthly Payment', value: ResultFormatter.formatCurrency(res.standardPayment) },
        { label: 'Accelerated Monthly Payment', value: ResultFormatter.formatCurrency(res.acceleratedPayment) },
        { label: 'Time Saved', value: `${Math.floor(res.monthsSaved / 12)} years ${res.monthsSaved % 12} months` },
        { label: 'Accelerated Total Interest', value: ResultFormatter.formatCurrency(res.acceleratedInterest) }
      ]
    })
  },

  // 6. College Savings & 529 Plan Calculator
  {
    id: 'college-savings-529-calc',
    name: 'College Savings & 529 Plan Calculator',
    category: 'education-finance',
    subcategoryId: 'college-savings',
    formulaMeta: {
      formulaName: '529 College Savings Compound Growth Formula',
      formulaExpression: 'Future Value = P(1+r)ᵗ + PMT [((1+r)ᵗ - 1) / r]',
      variables: [
        { symbol: 'P', name: 'Initial Savings ($)', unit: '$' },
        { symbol: 'PMT', name: 'Monthly Contribution ($)', unit: '$' },
        { symbol: 'r', name: 'Monthly Return' },
        { symbol: 't', name: 'Total Months' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'currentSavings', label: 'Current College Savings ($)', type: 'currency', required: true, defaultValue: 10000, min: 0 },
        { name: 'monthlyContribution', label: 'Monthly Contribution ($)', type: 'currency', required: true, defaultValue: 300, min: 0 },
        { name: 'yearsUntilCollege', label: 'Years Until Child Enters College', type: 'integer', required: true, defaultValue: 12, min: 1, max: 25 },
        { name: 'annualReturn', label: 'Expected Annual Investment Return (%)', type: 'percentage', required: true, defaultValue: 7.0, min: 0, max: 15 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentSavings: number; monthlyContribution: number; yearsUntilCollege: number; annualReturn: number }) => {
      const p = inputs.currentSavings;
      const pmt = inputs.monthlyContribution;
      const r = inputs.annualReturn / 100 / 12;
      const n = inputs.yearsUntilCollege * 12;

      let futureValue = 0;
      if (r === 0) {
        futureValue = p + (pmt * n);
      } else {
        futureValue = (p * Math.pow(1 + r, n)) + (pmt * ((Math.pow(1 + r, n) - 1) / r));
      }

      const totalContributions = p + (pmt * n);
      const totalEarnings = Math.max(0, futureValue - totalContributions);

      return { futureValue, totalContributions, totalEarnings };
    },
    formatResult: (res: { futureValue: number; totalContributions: number; totalEarnings: number }) => ({
      primary: {
        label: 'Total Projected College Fund',
        value: ResultFormatter.formatCurrency(res.futureValue),
        numericValue: res.futureValue
      },
      secondary: [
        { label: 'Total Principal Contributions', value: ResultFormatter.formatCurrency(res.totalContributions) },
        { label: 'Compound Investment Earnings', value: ResultFormatter.formatCurrency(res.totalEarnings) }
      ]
    })
  },

  // 7. Hourly to Annual Salary & Overtime Calculator
  {
    id: 'hourly-to-salary-calc',
    name: 'Hourly to Annual Salary & Overtime Calculator',
    category: 'salary-compensation',
    subcategoryId: 'salary-conversion',
    formulaMeta: {
      formulaName: 'Hourly & Overtime Compensation Formula',
      formulaExpression: 'Annual = (Wage × Reg Hours × Weeks) + (Wage × 1.5 × OT Hours × Weeks)',
      variables: [
        { symbol: 'W', name: 'Hourly Wage ($)', unit: '$' },
        { symbol: 'RH', name: 'Regular Weekly Hours' },
        { symbol: 'OTH', name: 'Overtime Weekly Hours' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'hourlyWage', label: 'Hourly Wage Rate ($/hr)', type: 'currency', required: true, defaultValue: 28.50, min: 1 },
        { name: 'regularHoursPerWeek', label: 'Regular Hours per Week', type: 'number', required: true, defaultValue: 40, min: 1, max: 80 },
        { name: 'overtimeHoursPerWeek', label: 'Overtime Hours per Week', type: 'number', required: true, defaultValue: 5, min: 0, max: 40 },
        { name: 'weeksPerYear', label: 'Paid Weeks Worked per Year', type: 'integer', required: true, defaultValue: 52, min: 1, max: 52 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { hourlyWage: number; regularHoursPerWeek: number; overtimeHoursPerWeek: number; weeksPerYear: number }) => {
      const regularAnnual = inputs.hourlyWage * inputs.regularHoursPerWeek * inputs.weeksPerYear;
      const overtimeRate = inputs.hourlyWage * 1.5;
      const overtimeAnnual = overtimeRate * inputs.overtimeHoursPerWeek * inputs.weeksPerYear;
      const grossAnnual = regularAnnual + overtimeAnnual;
      const grossMonthly = grossAnnual / 12;
      const grossWeekly = grossAnnual / inputs.weeksPerYear;
      return { regularAnnual, overtimeAnnual, grossAnnual, grossMonthly, grossWeekly };
    },
    formatResult: (res: { regularAnnual: number; overtimeAnnual: number; grossAnnual: number; grossMonthly: number; grossWeekly: number }) => ({
      primary: {
        label: 'Gross Annual Compensation',
        value: ResultFormatter.formatCurrency(res.grossAnnual),
        numericValue: res.grossAnnual
      },
      secondary: [
        { label: 'Gross Monthly Pay', value: ResultFormatter.formatCurrency(res.grossMonthly) },
        { label: 'Regular Annual Earnings', value: ResultFormatter.formatCurrency(res.regularAnnual) },
        { label: 'Overtime Annual Earnings', value: ResultFormatter.formatCurrency(res.overtimeAnnual) },
        { label: 'Gross Weekly Pay', value: ResultFormatter.formatCurrency(res.grossWeekly) }
      ]
    })
  },

  // 8. Take-Home Pay & Net Salary Calculator
  {
    id: 'net-salary-calc',
    name: 'Take-Home Pay & Net Salary Calculator',
    category: 'salary-compensation',
    subcategoryId: 'paycheck-net-pay',
    formulaMeta: {
      formulaName: 'Net Take-Home Salary Formula',
      formulaExpression: 'Net Pay = Gross - (Gross × Total Tax%) - Deductions',
      variables: [
        { symbol: 'G', name: 'Gross Annual Salary ($)', unit: '$' },
        { symbol: 'T', name: 'Total Tax Rate (%)', unit: '%' },
        { symbol: 'D', name: 'Annual Pre-Tax Deductions ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'grossSalary', label: 'Gross Annual Salary ($)', type: 'currency', required: true, defaultValue: 95000, min: 1000 },
        { name: 'federalTaxRate', label: 'Estimated Federal Tax Rate (%)', type: 'percentage', required: true, defaultValue: 15, min: 0, max: 50 },
        { name: 'stateTaxRate', label: 'Estimated State & Local Tax Rate (%)', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 20 },
        { name: 'ficaRate', label: 'FICA Tax Rate (Social Security & Medicare)', type: 'percentage', required: true, defaultValue: 7.65, min: 0, max: 15 },
        { name: 'annualDeductions', label: 'Pre-Tax Health & Retirement Deductions ($)', type: 'currency', required: true, defaultValue: 7200, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossSalary: number; federalTaxRate: number; stateTaxRate: number; ficaRate: number; annualDeductions: number }) => {
      const taxableIncome = Math.max(0, inputs.grossSalary - inputs.annualDeductions);
      const totalTaxPercent = inputs.federalTaxRate + inputs.stateTaxRate + inputs.ficaRate;
      const totalTaxAmount = taxableIncome * (totalTaxPercent / 100);
      const netAnnualPay = taxableIncome - totalTaxAmount;
      const netMonthlyPay = netAnnualPay / 12;
      const netBiweeklyPay = netAnnualPay / 26;
      return { taxableIncome, totalTaxAmount, netAnnualPay, netMonthlyPay, netBiweeklyPay };
    },
    formatResult: (res: { taxableIncome: number; totalTaxAmount: number; netAnnualPay: number; netMonthlyPay: number; netBiweeklyPay: number }) => ({
      primary: {
        label: 'Net Annual Take-Home Pay',
        value: ResultFormatter.formatCurrency(res.netAnnualPay),
        numericValue: res.netAnnualPay
      },
      secondary: [
        { label: 'Net Monthly Take-Home Pay', value: ResultFormatter.formatCurrency(res.netMonthlyPay) },
        { label: 'Net Bi-Weekly Paycheck', value: ResultFormatter.formatCurrency(res.netBiweeklyPay) },
        { label: 'Total Annual Taxes', value: ResultFormatter.formatCurrency(res.totalTaxAmount) },
        { label: 'Taxable Income Base', value: ResultFormatter.formatCurrency(res.taxableIncome) }
      ]
    })
  },

  // 9. Bonus & Commission Tax Withholding Calculator
  {
    id: 'bonus-tax-calc',
    name: 'Bonus & Commission Tax Withholding Calculator',
    category: 'salary-compensation',
    subcategoryId: 'paycheck-net-pay',
    formulaMeta: {
      formulaName: 'Supplemental Bonus Withholding Formula',
      formulaExpression: 'Net Bonus = Bonus Amount × (1 - Supplemental Tax Rate)',
      variables: [
        { symbol: 'BA', name: 'Bonus Amount ($)', unit: '$' },
        { symbol: 'STR', name: 'Supplemental Tax Rate (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'bonusAmount', label: 'Gross Bonus / Commission Amount ($)', type: 'currency', required: true, defaultValue: 7500, min: 100 },
        { name: 'federalSupplementalRate', label: 'Federal Supplemental Withholding Rate (%)', type: 'percentage', required: true, defaultValue: 22, min: 0, max: 50 },
        { name: 'stateSupplementalRate', label: 'State Supplemental Withholding Rate (%)', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 20 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { bonusAmount: number; federalSupplementalRate: number; stateSupplementalRate: number }) => {
      const totalSupplementalRate = inputs.federalSupplementalRate + inputs.stateSupplementalRate;
      const totalTaxWithheld = inputs.bonusAmount * (totalSupplementalRate / 100);
      const netBonusPayout = inputs.bonusAmount - totalTaxWithheld;
      return { totalSupplementalRate, totalTaxWithheld, netBonusPayout };
    },
    formatResult: (res: { totalSupplementalRate: number; totalTaxWithheld: number; netBonusPayout: number }) => ({
      primary: {
        label: 'Net Bonus Payout',
        value: ResultFormatter.formatCurrency(res.netBonusPayout),
        numericValue: res.netBonusPayout
      },
      secondary: [
        { label: 'Total Tax Withheld', value: ResultFormatter.formatCurrency(res.totalTaxWithheld) },
        { label: 'Combined Supplemental Rate', value: `${res.totalSupplementalRate}%` }
      ]
    })
  },

  // 10. Retirement 401(k) & Employer Match Calculator
  {
    id: 'retirement-401k-calc',
    name: 'Retirement 401(k) & Employer Match Calculator',
    category: 'salary-compensation',
    subcategoryId: 'retirement-growth',
    formulaMeta: {
      formulaName: 'Dual-Stream Retirement Compound Annuity Formula',
      formulaExpression: 'Nest Egg = Compound Growth with Employee & Employer Contributions',
      variables: [
        { symbol: 'S', name: 'Annual Salary ($)', unit: '$' },
        { symbol: 'EC', name: 'Employee Contribution (%)', unit: '%' },
        { symbol: 'EM', name: 'Employer Match (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'currentSalary', label: 'Current Annual Salary ($)', type: 'currency', required: true, defaultValue: 85000, min: 1000 },
        { name: 'currentBalance', label: 'Current 401(k) Balance ($)', type: 'currency', required: true, defaultValue: 35000, min: 0 },
        { name: 'employeeContributionPercent', label: 'Employee Contribution (%)', type: 'percentage', required: true, defaultValue: 8, min: 0, max: 30 },
        { name: 'employerMatchPercent', label: 'Employer Match (%)', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 20 },
        { name: 'yearsToRetirement', label: 'Years Until Retirement', type: 'integer', required: true, defaultValue: 25, min: 1, max: 50 },
        { name: 'annualReturn', label: 'Expected Annual Investment Return (%)', type: 'percentage', required: true, defaultValue: 7.5, min: 0, max: 15 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentSalary: number; currentBalance: number; employeeContributionPercent: number; employerMatchPercent: number; yearsToRetirement: number; annualReturn: number }) => {
      const salary = inputs.currentSalary;
      const r = inputs.annualReturn / 100 / 12;
      const n = inputs.yearsToRetirement * 12;

      const employeeAnnual = salary * (inputs.employeeContributionPercent / 100);
      const employerAnnual = salary * (Math.min(inputs.employeeContributionPercent, inputs.employerMatchPercent) / 100);
      const totalAnnualContribution = employeeAnnual + employerAnnual;
      const monthlyContribution = totalAnnualContribution / 12;

      let nestEgg = inputs.currentBalance;
      let totalContributions = inputs.currentBalance;

      for (let i = 0; i < n; i++) {
        nestEgg = (nestEgg + monthlyContribution) * (1 + r);
        totalContributions += monthlyContribution;
      }

      const totalEarnings = Math.max(0, nestEgg - totalContributions);
      const employeeTotalContrib = inputs.currentBalance + (employeeAnnual * inputs.yearsToRetirement);
      const employerTotalContrib = employerAnnual * inputs.yearsToRetirement;

      return { nestEgg, totalContributions, totalEarnings, employeeTotalContrib, employerTotalContrib };
    },
    formatResult: (res: { nestEgg: number; totalContributions: number; totalEarnings: number; employeeTotalContrib: number; employerTotalContrib: number }) => ({
      primary: {
        label: 'Projected Retirement Nest Egg',
        value: ResultFormatter.formatCurrency(res.nestEgg),
        numericValue: res.nestEgg
      },
      secondary: [
        { label: 'Total Investment Earnings', value: ResultFormatter.formatCurrency(res.totalEarnings) },
        { label: 'Your Total Contributions', value: ResultFormatter.formatCurrency(res.employeeTotalContrib) },
        { label: 'Employer Match Total', value: ResultFormatter.formatCurrency(res.employerTotalContrib) }
      ]
    })
  }
];
