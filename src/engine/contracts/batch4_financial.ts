import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH4_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Auto Loan Calculator
  {
    id: 'auto-loan-calc',
    name: 'Auto Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Auto Loan Amortization Formula',
      formulaExpression: 'PMT = P × [r(1+r)^n] / [(1+r)^n - 1]',
      variables: [
        { symbol: 'P', name: 'Vehicle Loan Amount', unit: '$' },
        { symbol: 'r', name: 'Monthly Interest Rate' },
        { symbol: 'n', name: 'Loan Term (Months)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'vehiclePrice', label: 'Vehicle Price ($)', type: 'currency', required: true, defaultValue: 32000, min: 500 },
        { name: 'downPayment', label: 'Down Payment & Trade-In ($)', type: 'currency', required: true, defaultValue: 4000, min: 0 },
        { name: 'interestRate', label: 'Annual Interest Rate (%)', type: 'percentage', required: true, defaultValue: 5.5, min: 0.1, max: 35 },
        { name: 'loanTermMonths', label: 'Loan Term (Months)', type: 'integer', required: true, defaultValue: 60, min: 12, max: 96 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { vehiclePrice: number; downPayment: number; interestRate: number; loanTermMonths: number }) => {
      const loanAmount = Math.max(0, inputs.vehiclePrice - inputs.downPayment);
      const monthlyRate = inputs.interestRate / 100 / 12;
      const n = inputs.loanTermMonths;
      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / n;
      } else {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      }
      const totalPayments = monthlyPayment * n;
      const totalInterest = totalPayments - loanAmount;
      return { loanAmount, monthlyPayment, totalPayments, totalInterest };
    },
    formatResult: (result: { loanAmount: number; monthlyPayment: number; totalPayments: number; totalInterest: number }) => ({
      primary: {
        label: 'Monthly Payment',
        value: ResultFormatter.formatCurrency(result.monthlyPayment),
        numericValue: result.monthlyPayment
      },
      secondary: [
        { label: 'Financed Amount', value: ResultFormatter.formatCurrency(result.loanAmount) },
        { label: 'Total Interest Paid', value: ResultFormatter.formatCurrency(result.totalInterest) },
        { label: 'Total Cost of Vehicle', value: ResultFormatter.formatCurrency(result.totalPayments) }
      ]
    })
  },

  // 2. Loan Amortization Calculator
  {
    id: 'amortization-schedule-calc',
    name: 'Loan Amortization Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Amortization Split',
      formulaExpression: 'Interest = Balance × r; Principal = PMT - Interest',
      variables: [{ symbol: 'r', name: 'Monthly rate' }]
    },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Loan Balance ($)', type: 'currency', required: true, defaultValue: 100000, min: 1000 },
        { name: 'annualRate', label: 'Annual Rate (%)', type: 'percentage', required: true, defaultValue: 6.0, min: 0.1, max: 30 },
        { name: 'years', label: 'Term in Years', type: 'integer', required: true, defaultValue: 15, min: 1, max: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { principal: number; annualRate: number; years: number }) => {
      const p = inputs.principal;
      const r = inputs.annualRate / 100 / 12;
      const n = inputs.years * 12;
      const pmt = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = pmt * n;
      const totalInterest = totalPayment - p;
      const firstMonthInterest = p * r;
      const firstMonthPrincipal = pmt - firstMonthInterest;
      return { pmt, totalPayment, totalInterest, firstMonthInterest, firstMonthPrincipal };
    },
    formatResult: (res: { pmt: number; totalPayment: number; totalInterest: number; firstMonthInterest: number; firstMonthPrincipal: number }) => ({
      primary: {
        label: 'Monthly Amortized Payment',
        value: ResultFormatter.formatCurrency(res.pmt),
        numericValue: res.pmt
      },
      secondary: [
        { label: 'Month 1 Principal', value: ResultFormatter.formatCurrency(res.firstMonthPrincipal) },
        { label: 'Month 1 Interest', value: ResultFormatter.formatCurrency(res.firstMonthInterest) },
        { label: 'Total Lifetime Interest', value: ResultFormatter.formatCurrency(res.totalInterest) }
      ]
    })
  },

  // 3. Debt-to-Income (DTI) Calculator
  {
    id: 'debt-to-income-calc',
    name: 'Debt-to-Income (DTI) Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Back-End DTI Ratio',
      formulaExpression: 'DTI = (Total Monthly Debt / Gross Monthly Income) × 100',
      variables: [{ symbol: 'DTI', name: 'Debt to Income Ratio', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'monthlyIncome', label: 'Gross Monthly Income ($)', type: 'currency', required: true, defaultValue: 7500, min: 500 },
        { name: 'mortgageRent', label: 'Housing / Rent Payment ($)', type: 'currency', required: true, defaultValue: 1800, min: 0 },
        { name: 'otherDebts', label: 'Other Monthly Debts (Car, Cards, Loans) ($)', type: 'currency', required: true, defaultValue: 600, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { monthlyIncome: number; mortgageRent: number; otherDebts: number }) => {
      const frontEnd = (inputs.mortgageRent / inputs.monthlyIncome) * 100;
      const totalDebt = inputs.mortgageRent + inputs.otherDebts;
      const backEnd = (totalDebt / inputs.monthlyIncome) * 100;
      let status = 'Favorable (Under 36%)';
      if (backEnd > 43) status = 'High Risk (Above 43%)';
      else if (backEnd > 36) status = 'Moderate (36% - 43%)';
      return { frontEnd, backEnd, totalDebt, status };
    },
    formatResult: (res: { frontEnd: number; backEnd: number; totalDebt: number; status: string }) => ({
      primary: {
        label: 'Total DTI Ratio',
        value: `${res.backEnd.toFixed(1)}%`,
        numericValue: res.backEnd
      },
      secondary: [
        { label: 'Front-End (Housing) Ratio', value: `${res.frontEnd.toFixed(1)}%` },
        { label: 'Total Monthly Debt', value: ResultFormatter.formatCurrency(res.totalDebt) },
        { label: 'Lending Assessment', value: res.status }
      ]
    })
  },

  // 4. Mortgage Refinance Calculator
  {
    id: 'refinance-mortgage-calc',
    name: 'Mortgage Refinance Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Refinance Break-Even',
      formulaExpression: 'Months = Closing Costs / Monthly Savings',
      variables: [{ symbol: 'Months', name: 'Break-even timeframe' }]
    },
    inputSchema: {
      fields: [
        { name: 'currentPayment', label: 'Current Monthly Payment ($)', type: 'currency', required: true, defaultValue: 2100, min: 100 },
        { name: 'newPayment', label: 'New Proposed Payment ($)', type: 'currency', required: true, defaultValue: 1750, min: 100 },
        { name: 'closingCosts', label: 'Refinancing Closing Costs ($)', type: 'currency', required: true, defaultValue: 4500, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentPayment: number; newPayment: number; closingCosts: number }) => {
      const monthlySavings = Math.max(0, inputs.currentPayment - inputs.newPayment);
      const breakEvenMonths = monthlySavings > 0 ? inputs.closingCosts / monthlySavings : 0;
      const annualSavings = monthlySavings * 12;
      return { monthlySavings, breakEvenMonths, annualSavings };
    },
    formatResult: (res: { monthlySavings: number; breakEvenMonths: number; annualSavings: number }) => ({
      primary: {
        label: 'Monthly Payment Savings',
        value: ResultFormatter.formatCurrency(res.monthlySavings),
        numericValue: res.monthlySavings
      },
      secondary: [
        { label: 'Break-Even Time', value: `${res.breakEvenMonths.toFixed(1)} months (${(res.breakEvenMonths/12).toFixed(1)} years)` },
        { label: 'Annual Savings', value: ResultFormatter.formatCurrency(res.annualSavings) }
      ]
    })
  },

  // 5. Mortgage Extra Payment Calculator
  {
    id: 'extra-payment-calc',
    name: 'Mortgage Extra Payment Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Extra Principal Amortization',
      formulaExpression: 'Savings = TotalInterest(standard) - TotalInterest(accelerated)',
      variables: [{ symbol: 'Savings', name: 'Lifetime Interest Saved' }]
    },
    inputSchema: {
      fields: [
        { name: 'balance', label: 'Current Mortgage Balance ($)', type: 'currency', required: true, defaultValue: 300000, min: 5000 },
        { name: 'rate', label: 'Interest Rate (%)', type: 'percentage', required: true, defaultValue: 6.0, min: 0.1 },
        { name: 'termYears', label: 'Remaining Term (Years)', type: 'integer', required: true, defaultValue: 25, min: 1, max: 30 },
        { name: 'extraMonthly', label: 'Extra Principal Paid / Month ($)', type: 'currency', required: true, defaultValue: 250, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { balance: number; rate: number; termYears: number; extraMonthly: number }) => {
      const r = inputs.rate / 100 / 12;
      const n = inputs.termYears * 12;
      const stdPMT = (inputs.balance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const newPMT = stdPMT + inputs.extraMonthly;
      const newMonths = -Math.log(1 - (r * inputs.balance) / newPMT) / Math.log(1 + r);
      const monthsSaved = Math.max(0, n - newMonths);
      const stdInterest = stdPMT * n - inputs.balance;
      const newInterest = newPMT * newMonths - inputs.balance;
      const interestSaved = Math.max(0, stdInterest - newInterest);
      return { stdPMT, newPMT, monthsSaved, yearsSaved: monthsSaved / 12, interestSaved };
    },
    formatResult: (res: { stdPMT: number; newPMT: number; monthsSaved: number; yearsSaved: number; interestSaved: number }) => ({
      primary: {
        label: 'Total Interest Saved',
        value: ResultFormatter.formatCurrency(res.interestSaved),
        numericValue: res.interestSaved
      },
      secondary: [
        { label: 'Time Saved Off Mortgage', value: `${res.yearsSaved.toFixed(1)} years (${Math.round(res.monthsSaved)} months)` },
        { label: 'New Monthly Payment', value: ResultFormatter.formatCurrency(res.newPMT) }
      ]
    })
  },

  // 6. Personal Loan Calculator
  {
    id: 'personal-loan-calc',
    name: 'Personal Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Personal Loan Payment',
      formulaExpression: 'PMT = P × [r(1+r)^n] / [(1+r)^n - 1]',
      variables: [{ symbol: 'PMT', name: 'Monthly Payment' }]
    },
    inputSchema: {
      fields: [
        { name: 'loanAmount', label: 'Borrowing Amount ($)', type: 'currency', required: true, defaultValue: 15000, min: 1000 },
        { name: 'interestRate', label: 'APR Interest Rate (%)', type: 'percentage', required: true, defaultValue: 9.5, min: 1 },
        { name: 'termMonths', label: 'Loan Term (Months)', type: 'integer', required: true, defaultValue: 36, min: 6, max: 84 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { loanAmount: number; interestRate: number; termMonths: number }) => {
      const r = inputs.interestRate / 100 / 12;
      const n = inputs.termMonths;
      const pmt = (inputs.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalCost = pmt * n;
      const totalInterest = totalCost - inputs.loanAmount;
      return { pmt, totalCost, totalInterest };
    },
    formatResult: (res: { pmt: number; totalCost: number; totalInterest: number }) => ({
      primary: {
        label: 'Monthly Payment',
        value: ResultFormatter.formatCurrency(res.pmt),
        numericValue: res.pmt
      },
      secondary: [
        { label: 'Total Interest', value: ResultFormatter.formatCurrency(res.totalInterest) },
        { label: 'Total Repayment Cost', value: ResultFormatter.formatCurrency(res.totalCost) }
      ]
    })
  },

  // 7. Boat & RV Loan Calculator
  {
    id: 'boat-rv-loan-calc',
    name: 'Boat & RV Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Recreational Vehicle Loan Formula',
      formulaExpression: 'PMT = (P - Down) × [r(1+r)^n] / [(1+r)^n - 1]',
      variables: [{ symbol: 'PMT', name: 'Monthly Payment' }]
    },
    inputSchema: {
      fields: [
        { name: 'purchasePrice', label: 'RV/Boat Purchase Price ($)', type: 'currency', required: true, defaultValue: 65000, min: 5000 },
        { name: 'downPayment', label: 'Down Payment ($)', type: 'currency', required: true, defaultValue: 10000, min: 0 },
        { name: 'rate', label: 'Interest Rate (%)', type: 'percentage', required: true, defaultValue: 7.25, min: 1 },
        { name: 'termYears', label: 'Term in Years (10-20 yrs)', type: 'integer', required: true, defaultValue: 12, min: 3, max: 20 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { purchasePrice: number; downPayment: number; rate: number; termYears: number }) => {
      const principal = Math.max(0, inputs.purchasePrice - inputs.downPayment);
      const r = inputs.rate / 100 / 12;
      const n = inputs.termYears * 12;
      const pmt = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPay = pmt * n;
      return { principal, pmt, totalPay, totalInterest: totalPay - principal };
    },
    formatResult: (res: { principal: number; pmt: number; totalPay: number; totalInterest: number }) => ({
      primary: {
        label: 'Monthly Payment',
        value: ResultFormatter.formatCurrency(res.pmt),
        numericValue: res.pmt
      },
      secondary: [
        { label: 'Amount Financed', value: ResultFormatter.formatCurrency(res.principal) },
        { label: 'Total Interest', value: ResultFormatter.formatCurrency(res.totalInterest) },
        { label: 'Total Cost', value: ResultFormatter.formatCurrency(res.totalPay) }
      ]
    })
  },

  // 8. Balloon Loan Calculator
  {
    id: 'balloon-payment-calc',
    name: 'Balloon Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Balloon Payment Balance',
      formulaExpression: 'Balloon = P(1+r)^k - PMT × [((1+r)^k - 1)/r]',
      variables: [{ symbol: 'Balloon', name: 'Remaining lump sum at maturity' }]
    },
    inputSchema: {
      fields: [
        { name: 'loanAmount', label: 'Original Loan ($)', type: 'currency', required: true, defaultValue: 250000, min: 1000 },
        { name: 'interestRate', label: 'Annual Rate (%)', type: 'percentage', required: true, defaultValue: 6.5, min: 0.1 },
        { name: 'amortYears', label: 'Amortization Period (e.g. 30 yrs)', type: 'integer', required: true, defaultValue: 30, min: 5, max: 40 },
        { name: 'balloonYear', label: 'Balloon Due in Year (e.g. 5 or 7 yrs)', type: 'integer', required: true, defaultValue: 7, min: 1, max: 20 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { loanAmount: number; interestRate: number; amortYears: number; balloonYear: number }) => {
      const r = inputs.interestRate / 100 / 12;
      const n = inputs.amortYears * 12;
      const k = inputs.balloonYear * 12;
      const pmt = (inputs.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const balloon = inputs.loanAmount * Math.pow(1 + r, k) - pmt * ((Math.pow(1 + r, k) - 1) / r);
      return { pmt, balloon: Math.max(0, balloon), regularPaid: pmt * k };
    },
    formatResult: (res: { pmt: number; balloon: number; regularPaid: number }) => ({
      primary: {
        label: 'Final Balloon Payment Due',
        value: ResultFormatter.formatCurrency(res.balloon),
        numericValue: res.balloon
      },
      secondary: [
        { label: 'Monthly Payment During Term', value: ResultFormatter.formatCurrency(res.pmt) },
        { label: 'Total Paid Before Balloon', value: ResultFormatter.formatCurrency(res.regularPaid) }
      ]
    })
  },

  // 9. Bi-Weekly Mortgage Calculator
  {
    id: 'biweekly-mortgage-calc',
    name: 'Bi-Weekly Mortgage Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Bi-Weekly Mortgage Payment Schedule',
      formulaExpression: 'Biweekly PMT = Monthly PMT / 2 (26 payments/yr)',
      variables: [{ symbol: 'Biweekly PMT', name: 'Half-payment every 2 weeks' }]
    },
    inputSchema: {
      fields: [
        { name: 'loanAmount', label: 'Mortgage Loan Amount ($)', type: 'currency', required: true, defaultValue: 350000, min: 10000 },
        { name: 'rate', label: 'Interest Rate (%)', type: 'percentage', required: true, defaultValue: 6.2, min: 0.1 },
        { name: 'years', label: 'Term in Years', type: 'integer', required: true, defaultValue: 30, min: 10, max: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { loanAmount: number; rate: number; years: number }) => {
      const r = inputs.rate / 100 / 12;
      const n = inputs.years * 12;
      const monthlyPMT = (inputs.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const biweeklyPMT = monthlyPMT / 2;
      const effectiveAnnual = biweeklyPMT * 26;
      const extraYearly = effectiveAnnual - monthlyPMT * 12;
      const yearsSaved = (extraYearly / (monthlyPMT * 12)) * (inputs.years * 0.22);
      const interestSaved = inputs.loanAmount * (inputs.rate / 100) * yearsSaved * 0.7;
      return { monthlyPMT, biweeklyPMT, yearsSaved, interestSaved };
    },
    formatResult: (res: { monthlyPMT: number; biweeklyPMT: number; yearsSaved: number; interestSaved: number }) => ({
      primary: {
        label: 'Bi-Weekly Payment (Every 2 Wks)',
        value: ResultFormatter.formatCurrency(res.biweeklyPMT),
        numericValue: res.biweeklyPMT
      },
      secondary: [
        { label: 'Standard Monthly PMT', value: ResultFormatter.formatCurrency(res.monthlyPMT) },
        { label: 'Estimated Years Saved', value: `${res.yearsSaved.toFixed(1)} years` },
        { label: 'Estimated Interest Saved', value: ResultFormatter.formatCurrency(res.interestSaved) }
      ]
    })
  },

  // 10. Interest-Only Loan Calculator
  {
    id: 'interest-only-loan-calc',
    name: 'Interest-Only Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Interest Only Payment',
      formulaExpression: 'IO PMT = Principal × (Annual Rate / 12)',
      variables: [{ symbol: 'IO PMT', name: 'Monthly payment during interest period' }]
    },
    inputSchema: {
      fields: [
        { name: 'loanAmount', label: 'Loan Balance ($)', type: 'currency', required: true, defaultValue: 400000, min: 10000 },
        { name: 'rate', label: 'Interest Rate (%)', type: 'percentage', required: true, defaultValue: 6.0, min: 0.1 },
        { name: 'ioYears', label: 'Interest-Only Period (Years)', type: 'integer', required: true, defaultValue: 10, min: 1, max: 15 },
        { name: 'totalYears', label: 'Total Loan Term (Years)', type: 'integer', required: true, defaultValue: 30, min: 15, max: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { loanAmount: number; rate: number; ioYears: number; totalYears: number }) => {
      const r = inputs.rate / 100 / 12;
      const ioPMT = inputs.loanAmount * r;
      const amortYears = inputs.totalYears - inputs.ioYears;
      const amortMonths = amortYears * 12;
      const amortPMT = (inputs.loanAmount * r * Math.pow(1 + r, amortMonths)) / (Math.pow(1 + r, amortMonths) - 1);
      return { ioPMT, amortPMT, paymentJump: amortPMT - ioPMT };
    },
    formatResult: (res: { ioPMT: number; amortPMT: number; paymentJump: number }) => ({
      primary: {
        label: 'Interest-Only Monthly Payment',
        value: ResultFormatter.formatCurrency(res.ioPMT),
        numericValue: res.ioPMT
      },
      secondary: [
        { label: 'Subsequent Amortized PMT', value: ResultFormatter.formatCurrency(res.amortPMT) },
        { label: 'Payment Increase at Reset', value: `+${ResultFormatter.formatCurrency(res.paymentJump)}/mo` }
      ]
    })
  },

  // 11. Simple Interest Calculator
  {
    id: 'simple-interest-calc',
    name: 'Simple Interest Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Simple Interest Formula',
      formulaExpression: 'I = P × r × t; A = P + I',
      variables: [
        { symbol: 'I', name: 'Interest Earned', unit: '$' },
        { symbol: 'A', name: 'Total Ending Balance', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Principal Amount ($)', type: 'currency', required: true, defaultValue: 10000, min: 100 },
        { name: 'annualRate', label: 'Annual Rate (%)', type: 'percentage', required: true, defaultValue: 5.0, min: 0.01 },
        { name: 'years', label: 'Time Period (Years)', type: 'number', required: true, defaultValue: 3, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { principal: number; annualRate: number; years: number }) => {
      const interest = inputs.principal * (inputs.annualRate / 100) * inputs.years;
      const total = inputs.principal + interest;
      return { interest, total, principal: inputs.principal };
    },
    formatResult: (res: { interest: number; total: number; principal: number }) => ({
      primary: {
        label: 'Total Interest Earned',
        value: ResultFormatter.formatCurrency(res.interest),
        numericValue: res.interest
      },
      secondary: [
        { label: 'Ending Balance', value: ResultFormatter.formatCurrency(res.total) },
        { label: 'Initial Principal', value: ResultFormatter.formatCurrency(res.principal) }
      ]
    })
  },

  // 12. APR to APY Calculator
  {
    id: 'apr-to-apy-calc',
    name: 'APR to APY Converter & Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Effective Annual Yield Formula',
      formulaExpression: 'APY = (1 + APR / n)^n - 1',
      variables: [{ symbol: 'APY', name: 'Annual Percentage Yield', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'apr', label: 'Nominal APR (%)', type: 'percentage', required: true, defaultValue: 5.25, min: 0.01 },
        {
          name: 'frequency',
          label: 'Compounding Frequency',
          type: 'select',
          required: true,
          defaultValue: '12',
          options: [
            { label: 'Daily (365 times/yr)', value: '365' },
            { label: 'Monthly (12 times/yr)', value: '12' },
            { label: 'Quarterly (4 times/yr)', value: '4' },
            { label: 'Semi-Annually (2 times/yr)', value: '2' }
          ]
        }
      ]
    },
    validate: () => [],
    calculate: (inputs: { apr: number; frequency: string }) => {
      const n = parseInt(inputs.frequency, 10);
      const r = inputs.apr / 100;
      const apy = (Math.pow(1 + r / n, n) - 1) * 100;
      const diff = apy - inputs.apr;
      return { apy, diff, apr: inputs.apr };
    },
    formatResult: (res: { apy: number; diff: number; apr: number }) => ({
      primary: {
        label: 'Effective APY',
        value: `${res.apy.toFixed(3)}%`,
        numericValue: res.apy
      },
      secondary: [
        { label: 'Nominal APR', value: `${res.apr.toFixed(2)}%` },
        { label: 'Compounding Boost', value: `+${res.diff.toFixed(3)}%` }
      ]
    })
  },

  // 13. Certificate of Deposit (CD) Calculator
  {
    id: 'certificate-deposit-calc',
    name: 'Certificate of Deposit (CD) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'CD Maturity Compounding',
      formulaExpression: 'A = P × (1 + r/12)^(12 × t)',
      variables: [{ symbol: 'A', name: 'Maturity Value', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'deposit', label: 'Initial CD Deposit ($)', type: 'currency', required: true, defaultValue: 10000, min: 500 },
        { name: 'apy', label: 'APY Interest Rate (%)', type: 'percentage', required: true, defaultValue: 4.8, min: 0.1 },
        { name: 'termMonths', label: 'CD Term (Months)', type: 'integer', required: true, defaultValue: 12, min: 1, max: 120 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { deposit: number; apy: number; termMonths: number }) => {
      const years = inputs.termMonths / 12;
      const finalVal = inputs.deposit * Math.pow(1 + inputs.apy / 100, years);
      const interestEarned = finalVal - inputs.deposit;
      return { finalVal, interestEarned, deposit: inputs.deposit };
    },
    formatResult: (res: { finalVal: number; interestEarned: number; deposit: number }) => ({
      primary: {
        label: 'Maturity Value',
        value: ResultFormatter.formatCurrency(res.finalVal),
        numericValue: res.finalVal
      },
      secondary: [
        { label: 'Total Interest Earned', value: ResultFormatter.formatCurrency(res.interestEarned) },
        { label: 'Initial Deposit', value: ResultFormatter.formatCurrency(res.deposit) }
      ]
    })
  },

  // 14. Rule of 72 Calculator
  {
    id: 'rule-of-72-calc',
    name: 'Rule of 72 Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Rule of 72 Doubling Time',
      formulaExpression: 'Years to Double ≈ 72 / Interest Rate (%)',
      variables: [{ symbol: 'Years', name: 'Estimated Doubling Time' }]
    },
    inputSchema: {
      fields: [
        { name: 'rate', label: 'Expected Annual Rate of Return (%)', type: 'percentage', required: true, defaultValue: 8.0, min: 0.5, max: 50 },
        { name: 'initialInvestment', label: 'Current Investment Balance ($)', type: 'currency', required: true, defaultValue: 25000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { rate: number; initialInvestment: number }) => {
      const approxYears = 72 / inputs.rate;
      const exactYears = Math.log(2) / Math.log(1 + inputs.rate / 100);
      const doubledVal = inputs.initialInvestment * 2;
      return { approxYears, exactYears, doubledVal };
    },
    formatResult: (res: { approxYears: number; exactYears: number; doubledVal: number }) => ({
      primary: {
        label: 'Years to Double Investment',
        value: `${res.approxYears.toFixed(1)} years`,
        numericValue: res.approxYears
      },
      secondary: [
        { label: 'Exact Compound Time', value: `${res.exactYears.toFixed(2)} years` },
        { label: 'Doubled Portfolio Value', value: ResultFormatter.formatCurrency(res.doubledVal) }
      ]
    })
  },

  // 15. Dividend Yield Calculator
  {
    id: 'dividend-yield-calc',
    name: 'Dividend Yield Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Stock Dividend Yield Formula',
      formulaExpression: 'Yield % = (Annual Dividend / Stock Price) × 100',
      variables: [{ symbol: 'Yield', name: 'Dividend Yield', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'stockPrice', label: 'Share Price ($)', type: 'currency', required: true, defaultValue: 85, min: 0.1 },
        { name: 'annualDividend', label: 'Annual Dividend per Share ($)', type: 'currency', required: true, defaultValue: 3.40, min: 0 },
        { name: 'sharesOwned', label: 'Number of Shares Owned', type: 'number', required: true, defaultValue: 200, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { stockPrice: number; annualDividend: number; sharesOwned: number }) => {
      const yieldPct = (inputs.annualDividend / inputs.stockPrice) * 100;
      const annualIncome = inputs.annualDividend * inputs.sharesOwned;
      const totalPortfolioValue = inputs.stockPrice * inputs.sharesOwned;
      return { yieldPct, annualIncome, monthlyIncome: annualIncome / 12, totalPortfolioValue };
    },
    formatResult: (res: { yieldPct: number; annualIncome: number; monthlyIncome: number; totalPortfolioValue: number }) => ({
      primary: {
        label: 'Dividend Yield',
        value: `${res.yieldPct.toFixed(2)}%`,
        numericValue: res.yieldPct
      },
      secondary: [
        { label: 'Annual Cash Dividend', value: ResultFormatter.formatCurrency(res.annualIncome) },
        { label: 'Monthly Equivalent Income', value: ResultFormatter.formatCurrency(res.monthlyIncome) },
        { label: 'Total Holding Value', value: ResultFormatter.formatCurrency(res.totalPortfolioValue) }
      ]
    })
  },

  // 16. Future Value (FV) Calculator
  {
    id: 'future-value-calc',
    name: 'Future Value (FV) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Future Value of Lump Sum',
      formulaExpression: 'FV = PV × (1 + r)^t',
      variables: [{ symbol: 'FV', name: 'Future Value', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'presentValue', label: 'Present Value / Initial Sum ($)', type: 'currency', required: true, defaultValue: 50000, min: 100 },
        { name: 'rate', label: 'Annual Interest / Growth Rate (%)', type: 'percentage', required: true, defaultValue: 7.0, min: 0.1 },
        { name: 'years', label: 'Holding Period (Years)', type: 'number', required: true, defaultValue: 10, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { presentValue: number; rate: number; years: number }) => {
      const fv = inputs.presentValue * Math.pow(1 + inputs.rate / 100, inputs.years);
      const gain = fv - inputs.presentValue;
      return { fv, gain, presentValue: inputs.presentValue };
    },
    formatResult: (res: { fv: number; gain: number; presentValue: number }) => ({
      primary: {
        label: 'Future Value',
        value: ResultFormatter.formatCurrency(res.fv),
        numericValue: res.fv
      },
      secondary: [
        { label: 'Total Capital Growth', value: ResultFormatter.formatCurrency(res.gain) },
        { label: 'Starting Principal', value: ResultFormatter.formatCurrency(res.presentValue) }
      ]
    })
  },

  // 17. Present Value (PV) Calculator
  {
    id: 'present-value-calc',
    name: 'Present Value (PV) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Present Value Discount Formula',
      formulaExpression: 'PV = FV / (1 + r)^t',
      variables: [{ symbol: 'PV', name: 'Present Value', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'futureValue', label: 'Target Future Value ($)', type: 'currency', required: true, defaultValue: 100000, min: 1000 },
        { name: 'discountRate', label: 'Annual Discount Rate (%)', type: 'percentage', required: true, defaultValue: 6.0, min: 0.1 },
        { name: 'years', label: 'Years in Future', type: 'number', required: true, defaultValue: 10, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { futureValue: number; discountRate: number; years: number }) => {
      const pv = inputs.futureValue / Math.pow(1 + inputs.discountRate / 100, inputs.years);
      const discount = inputs.futureValue - pv;
      return { pv, discount, futureValue: inputs.futureValue };
    },
    formatResult: (res: { pv: number; discount: number; futureValue: number }) => ({
      primary: {
        label: 'Present Value Required Today',
        value: ResultFormatter.formatCurrency(res.pv),
        numericValue: res.pv
      },
      secondary: [
        { label: 'Total Future Target', value: ResultFormatter.formatCurrency(res.futureValue) },
        { label: 'Discount Amount', value: ResultFormatter.formatCurrency(res.discount) }
      ]
    })
  },

  // 18. Annuity Value Calculator
  {
    id: 'annuity-payout-calc',
    name: 'Annuity Value Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Future Value of Ordinary Annuity',
      formulaExpression: 'FV = PMT × [((1 + r)^n - 1) / r]',
      variables: [{ symbol: 'FV', name: 'Annuity Future Value', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'payment', label: 'Periodic Contribution ($)', type: 'currency', required: true, defaultValue: 500, min: 10 },
        { name: 'annualRate', label: 'Annual Return (%)', type: 'percentage', required: true, defaultValue: 7.0, min: 0.1 },
        { name: 'years', label: 'Investment Horizon (Years)', type: 'integer', required: true, defaultValue: 20, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { payment: number; annualRate: number; years: number }) => {
      const r = inputs.annualRate / 100 / 12;
      const n = inputs.years * 12;
      const fv = inputs.payment * ((Math.pow(1 + r, n) - 1) / r);
      const totalContributed = inputs.payment * n;
      const totalInterest = fv - totalContributed;
      return { fv, totalContributed, totalInterest };
    },
    formatResult: (res: { fv: number; totalContributed: number; totalInterest: number }) => ({
      primary: {
        label: 'Total Accumulated Value',
        value: ResultFormatter.formatCurrency(res.fv),
        numericValue: res.fv
      },
      secondary: [
        { label: 'Total Contributions', value: ResultFormatter.formatCurrency(res.totalContributed) },
        { label: 'Interest & Investment Return', value: ResultFormatter.formatCurrency(res.totalInterest) }
      ]
    })
  },

  // 19. Bond Yield to Maturity (YTM) Calculator
  {
    id: 'treasury-bond-yield-calc',
    name: 'Bond Yield to Maturity (YTM) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Approximate YTM Formula',
      formulaExpression: 'YTM ≈ [C + (F - P)/n] / [(F + P)/2]',
      variables: [{ symbol: 'YTM', name: 'Yield to Maturity', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'faceValue', label: 'Bond Par / Face Value ($)', type: 'currency', required: true, defaultValue: 1000, min: 100 },
        { name: 'currentPrice', label: 'Current Market Price ($)', type: 'currency', required: true, defaultValue: 940, min: 100 },
        { name: 'couponRate', label: 'Annual Coupon Rate (%)', type: 'percentage', required: true, defaultValue: 4.5, min: 0 },
        { name: 'yearsToMaturity', label: 'Years to Maturity', type: 'number', required: true, defaultValue: 10, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { faceValue: number; currentPrice: number; couponRate: number; yearsToMaturity: number }) => {
      const C = inputs.faceValue * (inputs.couponRate / 100);
      const F = inputs.faceValue;
      const P = inputs.currentPrice;
      const n = inputs.yearsToMaturity;
      const ytm = ((C + (F - P) / n) / ((F + P) / 2)) * 100;
      const currentYield = (C / P) * 100;
      return { ytm, currentYield, annualCoupon: C };
    },
    formatResult: (res: { ytm: number; currentYield: number; annualCoupon: number }) => ({
      primary: {
        label: 'Yield to Maturity (YTM)',
        value: `${res.ytm.toFixed(2)}%`,
        numericValue: res.ytm
      },
      secondary: [
        { label: 'Current Yield', value: `${res.currentYield.toFixed(2)}%` },
        { label: 'Annual Coupon Payout', value: ResultFormatter.formatCurrency(res.annualCoupon) }
      ]
    })
  },

  // 20. Mutual Fund Expense Drag Calculator
  {
    id: 'mutual-fund-fee-calc',
    name: 'Mutual Fund Expense Drag Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Fee Drag Formula',
      formulaExpression: 'Drag = FV(gross) - FV(net)',
      variables: [{ symbol: 'Drag', name: 'Lost Returns to Fees' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialInvestment', label: 'Investment Portfolio ($)', type: 'currency', required: true, defaultValue: 100000, min: 1000 },
        { name: 'grossReturn', label: 'Gross Annual Return (%)', type: 'percentage', required: true, defaultValue: 8.0, min: 1 },
        { name: 'expenseRatio', label: 'Annual Expense Ratio (%)', type: 'percentage', required: true, defaultValue: 1.25, min: 0.01 },
        { name: 'years', label: 'Holding Horizon (Years)', type: 'integer', required: true, defaultValue: 25, min: 1, max: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialInvestment: number; grossReturn: number; expenseRatio: number; years: number }) => {
      const fvGross = inputs.initialInvestment * Math.pow(1 + inputs.grossReturn / 100, inputs.years);
      const netReturn = Math.max(0, inputs.grossReturn - inputs.expenseRatio);
      const fvNet = inputs.initialInvestment * Math.pow(1 + netReturn / 100, inputs.years);
      const lostToFees = fvGross - fvNet;
      return { fvGross, fvNet, lostToFees };
    },
    formatResult: (res: { fvGross: number; fvNet: number; lostToFees: number }) => ({
      primary: {
        label: 'Total Lost to Fees',
        value: ResultFormatter.formatCurrency(res.lostToFees),
        numericValue: res.lostToFees
      },
      secondary: [
        { label: 'Ending Portfolio (Net)', value: ResultFormatter.formatCurrency(res.fvNet) },
        { label: 'Potential Gross Value', value: ResultFormatter.formatCurrency(res.fvGross) }
      ]
    })
  },

  // 21. 401(k) Retirement Calculator
  {
    id: '401k-savings-calc',
    name: '401(k) Retirement Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: '401k Compounding with Match',
      formulaExpression: 'FV = Initial(1+r)^n + (Employee + Match) × [((1+r)^n - 1)/r]',
      variables: [{ symbol: 'FV', name: 'Retirement Nest Egg' }]
    },
    inputSchema: {
      fields: [
        { name: 'currentSalary', label: 'Current Annual Salary ($)', type: 'currency', required: true, defaultValue: 80000, min: 10000 },
        { name: 'contributionPct', label: 'Your Contribution Rate (%)', type: 'percentage', required: true, defaultValue: 6.0, min: 1, max: 50 },
        { name: 'employerMatchPct', label: 'Employer Match Rate (%)', type: 'percentage', required: true, defaultValue: 3.0, min: 0, max: 15 },
        { name: 'currentBalance', label: 'Current 401(k) Balance ($)', type: 'currency', required: true, defaultValue: 45000, min: 0 },
        { name: 'yearsToRetire', label: 'Years Until Retirement', type: 'integer', required: true, defaultValue: 30, min: 1, max: 50 },
        { name: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'percentage', required: true, defaultValue: 7.0, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentSalary: number; contributionPct: number; employerMatchPct: number; currentBalance: number; yearsToRetire: number; expectedReturn: number }) => {
      const employeeAnnual = inputs.currentSalary * (inputs.contributionPct / 100);
      const matchAnnual = inputs.currentSalary * (inputs.employerMatchPct / 100);
      const totalMonthly = (employeeAnnual + matchAnnual) / 12;
      const r = inputs.expectedReturn / 100 / 12;
      const n = inputs.yearsToRetire * 12;
      const fvContribs = totalMonthly * ((Math.pow(1 + r, n) - 1) / r);
      const fvInitial = inputs.currentBalance * Math.pow(1 + r, n);
      const totalFV = fvInitial + fvContribs;
      const totalMatchGiven = matchAnnual * inputs.yearsToRetire;
      return { totalFV, totalMonthly, totalMatchGiven };
    },
    formatResult: (res: { totalFV: number; totalMonthly: number; totalMatchGiven: number }) => ({
      primary: {
        label: 'Projected 401(k) Nest Egg',
        value: ResultFormatter.formatCurrency(res.totalFV),
        numericValue: res.totalFV
      },
      secondary: [
        { label: 'Total Monthly Contribution', value: ResultFormatter.formatCurrency(res.totalMonthly) },
        { label: 'Cumulative Employer Match', value: ResultFormatter.formatCurrency(res.totalMatchGiven) }
      ]
    })
  },

  // 22. Roth IRA Growth Calculator
  {
    id: 'roth-ira-calc',
    name: 'Roth IRA Growth Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'Roth IRA Tax-Free Compounding',
      formulaExpression: 'FV = PMT × [((1+r)^n - 1)/r]',
      variables: [{ symbol: 'FV', name: 'Tax-Free Nest Egg' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualContribution', label: 'Annual Contribution ($)', type: 'currency', required: true, defaultValue: 7000, min: 500, max: 8000 },
        { name: 'currentBalance', label: 'Current Roth IRA Balance ($)', type: 'currency', required: true, defaultValue: 20000, min: 0 },
        { name: 'years', label: 'Years to Retirement', type: 'integer', required: true, defaultValue: 25, min: 1, max: 50 },
        { name: 'expectedReturn', label: 'Expected Return (%)', type: 'percentage', required: true, defaultValue: 7.5, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualContribution: number; currentBalance: number; years: number; expectedReturn: number }) => {
      const r = inputs.expectedReturn / 100 / 12;
      const n = inputs.years * 12;
      const monthly = inputs.annualContribution / 12;
      const fvContribs = monthly * ((Math.pow(1 + r, n) - 1) / r);
      const fvInitial = inputs.currentBalance * Math.pow(1 + r, n);
      const totalFV = fvInitial + fvContribs;
      const totalDeposited = inputs.currentBalance + inputs.annualContribution * inputs.years;
      const taxFreeGain = totalFV - totalDeposited;
      return { totalFV, totalDeposited, taxFreeGain };
    },
    formatResult: (res: { totalFV: number; totalDeposited: number; taxFreeGain: number }) => ({
      primary: {
        label: 'Projected Tax-Free Balance',
        value: ResultFormatter.formatCurrency(res.totalFV),
        numericValue: res.totalFV
      },
      secondary: [
        { label: 'Tax-Free Investment Earnings', value: ResultFormatter.formatCurrency(res.taxFreeGain) },
        { label: 'Total Principal Invested', value: ResultFormatter.formatCurrency(res.totalDeposited) }
      ]
    })
  },

  // 23. Traditional IRA Calculator
  {
    id: 'traditional-ira-calc',
    name: 'Traditional IRA Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'Tax-Deferred Compounding',
      formulaExpression: 'FV = Initial(1+r)^n + Annual × [((1+r)^n - 1)/r]',
      variables: [{ symbol: 'FV', name: 'Pre-Tax Nest Egg' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualContrib', label: 'Annual Contribution ($)', type: 'currency', required: true, defaultValue: 7000, min: 500 },
        { name: 'currentAge', label: 'Current Age', type: 'integer', required: true, defaultValue: 35, min: 18, max: 70 },
        { name: 'retireAge', label: 'Retirement Age', type: 'integer', required: true, defaultValue: 65, min: 50, max: 75 },
        { name: 'expectedReturn', label: 'Annual Return (%)', type: 'percentage', required: true, defaultValue: 7.0, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualContrib: number; currentAge: number; retireAge: number; expectedReturn: number }) => {
      const years = Math.max(1, inputs.retireAge - inputs.currentAge);
      const r = inputs.expectedReturn / 100;
      const fv = inputs.annualContrib * ((Math.pow(1 + r, years) - 1) / r);
      const totalContrib = inputs.annualContrib * years;
      return { fv, totalContrib, years };
    },
    formatResult: (res: { fv: number; totalContrib: number; years: number }) => ({
      primary: {
        label: 'Pre-Tax Nest Egg',
        value: ResultFormatter.formatCurrency(res.fv),
        numericValue: res.fv
      },
      secondary: [
        { label: 'Years of Growth', value: `${res.years} years` },
        { label: 'Total Contributions', value: ResultFormatter.formatCurrency(res.totalContrib) }
      ]
    })
  },

  // 24. Safe Withdrawal Rate (4% Rule) Calculator
  {
    id: 'safe-withdrawal-rate-calc',
    name: 'Safe Withdrawal Rate (4% Rule) Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'Safe Withdrawal Rate (SWR)',
      formulaExpression: 'Annual Income = Portfolio × (SWR % / 100)',
      variables: [{ symbol: 'Income', name: 'Annual Sustainable Spend' }]
    },
    inputSchema: {
      fields: [
        { name: 'portfolioBalance', label: 'Total Portfolio ($)', type: 'currency', required: true, defaultValue: 1250000, min: 50000 },
        { name: 'withdrawalRate', label: 'Withdrawal Rate (%)', type: 'percentage', required: true, defaultValue: 4.0, min: 2.0, max: 8.0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { portfolioBalance: number; withdrawalRate: number }) => {
      const annual = inputs.portfolioBalance * (inputs.withdrawalRate / 100);
      const monthly = annual / 12;
      return { annual, monthly, portfolio: inputs.portfolioBalance };
    },
    formatResult: (res: { annual: number; monthly: number; portfolio: number }) => ({
      primary: {
        label: 'Safe Annual Income',
        value: ResultFormatter.formatCurrency(res.annual),
        numericValue: res.annual
      },
      secondary: [
        { label: 'Safe Monthly Spending', value: ResultFormatter.formatCurrency(res.monthly) },
        { label: 'Preserved Portfolio', value: ResultFormatter.formatCurrency(res.portfolio) }
      ]
    })
  },

  // 25. Pension Lump Sum vs Monthly Calculator
  {
    id: 'pension-annuity-calc',
    name: 'Pension Lump Sum vs Monthly Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'Present Value of Pension Stream',
      formulaExpression: 'PV = Monthly × [1 - (1+r)^(-n)] / r',
      variables: [{ symbol: 'PV', name: 'Present Value of Pension' }]
    },
    inputSchema: {
      fields: [
        { name: 'lumpSumOffer', label: 'Lump Sum Buyout Offer ($)', type: 'currency', required: true, defaultValue: 320000, min: 10000 },
        { name: 'monthlyPension', label: 'Monthly Lifetime Pension ($)', type: 'currency', required: true, defaultValue: 2100, min: 100 },
        { name: 'expectedYears', label: 'Expected Lifespan in Retirement (Years)', type: 'integer', required: true, defaultValue: 22, min: 5, max: 40 },
        { name: 'discountRate', label: 'Assumed Investment Return (%)', type: 'percentage', required: true, defaultValue: 5.5, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lumpSumOffer: number; monthlyPension: number; expectedYears: number; discountRate: number }) => {
      const r = inputs.discountRate / 100 / 12;
      const n = inputs.expectedYears * 12;
      const pvPension = (inputs.monthlyPension * (1 - Math.pow(1 + r, -n))) / r;
      const diff = inputs.lumpSumOffer - pvPension;
      const recommendation = diff > 0 ? 'Lump Sum has higher value' : 'Monthly Pension has higher value';
      return { pvPension, diff, recommendation, lumpSumOffer: inputs.lumpSumOffer };
    },
    formatResult: (res: { pvPension: number; diff: number; recommendation: string; lumpSumOffer: number }) => ({
      primary: {
        label: 'Present Value of Monthly Pension',
        value: ResultFormatter.formatCurrency(res.pvPension),
        numericValue: res.pvPension
      },
      secondary: [
        { label: 'Lump Sum Offer', value: ResultFormatter.formatCurrency(res.lumpSumOffer) },
        { label: 'Recommendation', value: res.recommendation }
      ]
    })
  },

  // 26. FIRE Calculator
  {
    id: 'fire-calculator',
    name: 'FIRE (Financial Independence) Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'FIRE Number (25x Rule)',
      formulaExpression: 'FIRE Number = Annual Expenses × 25',
      variables: [{ symbol: 'FIRE', name: 'Target Net Worth' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualExpenses', label: 'Desired Annual Living Expenses ($)', type: 'currency', required: true, defaultValue: 60000, min: 10000 },
        { name: 'currentSavings', label: 'Current Liquid Net Worth ($)', type: 'currency', required: true, defaultValue: 220000, min: 0 },
        { name: 'annualSavings', label: 'Annual Savings Added ($)', type: 'currency', required: true, defaultValue: 30000, min: 1000 },
        { name: 'realReturn', label: 'Real Annual Return after Inflation (%)', type: 'percentage', required: true, defaultValue: 5.0, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualExpenses: number; currentSavings: number; annualSavings: number; realReturn: number }) => {
      const fireTarget = inputs.annualExpenses * 25;
      const leanFireTarget = inputs.annualExpenses * 0.75 * 25;
      const fatFireTarget = inputs.annualExpenses * 1.5 * 25;
      const r = inputs.realReturn / 100;
      let balance = inputs.currentSavings;
      let years = 0;
      while (balance < fireTarget && years < 60) {
        balance = balance * (1 + r) + inputs.annualSavings;
        years++;
      }
      return { fireTarget, leanFireTarget, fatFireTarget, yearsToFIRE: years };
    },
    formatResult: (res: { fireTarget: number; leanFireTarget: number; fatFireTarget: number; yearsToFIRE: number }) => ({
      primary: {
        label: 'Target FIRE Number',
        value: ResultFormatter.formatCurrency(res.fireTarget),
        numericValue: res.fireTarget
      },
      secondary: [
        { label: 'Estimated Years to FIRE', value: `${res.yearsToFIRE} years` },
        { label: 'Lean FIRE Target (75%)', value: ResultFormatter.formatCurrency(res.leanFireTarget) },
        { label: 'Fat FIRE Target (150%)', value: ResultFormatter.formatCurrency(res.fatFireTarget) }
      ]
    })
  },

  // 27. Social Security Breakeven Calculator
  {
    id: 'social-security-estimate-calc',
    name: 'Social Security Breakeven Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'Breakeven Claiming Age',
      formulaExpression: 'Breakeven = Age where cumulative delayed benefits exceed early benefits',
      variables: [{ symbol: 'Age', name: 'Breakeven Age' }]
    },
    inputSchema: {
      fields: [
        { name: 'age62Monthly', label: 'Monthly Benefit at Age 62 ($)', type: 'currency', required: true, defaultValue: 1750, min: 500 },
        { name: 'age67Monthly', label: 'Monthly Benefit at Full Age 67 ($)', type: 'currency', required: true, defaultValue: 2500, min: 500 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { age62Monthly: number; age67Monthly: number }) => {
      const monthlyDiff = inputs.age67Monthly - inputs.age62Monthly;
      const headStart = inputs.age62Monthly * 60;
      const monthsToCatchUp = headStart / monthlyDiff;
      const breakevenAge = 67 + monthsToCatchUp / 12;
      return { breakevenAge, monthlyDiff };
    },
    formatResult: (res: { breakevenAge: number; monthlyDiff: number }) => ({
      primary: {
        label: 'Breakeven Crossover Age',
        value: `Age ${res.breakevenAge.toFixed(1)}`,
        numericValue: res.breakevenAge
      },
      secondary: [
        { label: 'Monthly Delay Advantage', value: `+${ResultFormatter.formatCurrency(res.monthlyDiff)}/mo` },
        { label: 'Recommendation', value: 'Delaying to 67 wins if living past crossover age' }
      ]
    })
  },

  // 28. 529 College Savings Calculator
  {
    id: 'college-savings-529-calc',
    name: '529 College Savings Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'College Sinking Fund',
      formulaExpression: 'Required Monthly = Goal / AnnuityFactor',
      variables: [{ symbol: 'Monthly', name: 'Required Contribution' }]
    },
    inputSchema: {
      fields: [
        { name: 'targetTuition', label: 'Estimated 4-Year Tuition Goal ($)', type: 'currency', required: true, defaultValue: 120000, min: 10000 },
        { name: 'current529', label: 'Current 529 Balance ($)', type: 'currency', required: true, defaultValue: 15000, min: 0 },
        { name: 'yearsUntilCollege', label: 'Years Until College Starts', type: 'integer', required: true, defaultValue: 12, min: 1, max: 20 },
        { name: 'expectedReturn', label: 'Annual Growth Rate (%)', type: 'percentage', required: true, defaultValue: 6.5, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { targetTuition: number; current529: number; yearsUntilCollege: number; expectedReturn: number }) => {
      const r = inputs.expectedReturn / 100 / 12;
      const n = inputs.yearsUntilCollege * 12;
      const futureInitial = inputs.current529 * Math.pow(1 + r, n);
      const remainingTarget = Math.max(0, inputs.targetTuition - futureInitial);
      const monthlyNeeded = remainingTarget > 0 ? (remainingTarget * r) / (Math.pow(1 + r, n) - 1) : 0;
      return { monthlyNeeded, futureInitial, targetTuition: inputs.targetTuition };
    },
    formatResult: (res: { monthlyNeeded: number; futureInitial: number; targetTuition: number }) => ({
      primary: {
        label: 'Recommended Monthly Contribution',
        value: ResultFormatter.formatCurrency(res.monthlyNeeded),
        numericValue: res.monthlyNeeded
      },
      secondary: [
        { label: 'Projected Value of Current Balance', value: ResultFormatter.formatCurrency(res.futureInitial) },
        { label: 'Total 4-Year Goal', value: ResultFormatter.formatCurrency(res.targetTuition) }
      ]
    })
  },

  // 29. HSA Growth Calculator
  {
    id: 'hsa-growth-calc',
    name: 'HSA Triple-Tax Advantage Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'HSA Compound Growth',
      formulaExpression: 'FV = Initial(1+r)^n + Annual × [((1+r)^n - 1)/r]',
      variables: [{ symbol: 'FV', name: 'HSA Portfolio' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualContrib', label: 'Annual Contribution ($)', type: 'currency', required: true, defaultValue: 4150, min: 500, max: 8300 },
        { name: 'currentBalance', label: 'Current HSA Balance ($)', type: 'currency', required: true, defaultValue: 8000, min: 0 },
        { name: 'years', label: 'Growth Horizon (Years)', type: 'integer', required: true, defaultValue: 20, min: 1, max: 40 },
        { name: 'growthRate', label: 'Annual Investment Return (%)', type: 'percentage', required: true, defaultValue: 7.0, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualContrib: number; currentBalance: number; years: number; growthRate: number }) => {
      const r = inputs.growthRate / 100;
      const fvContribs = inputs.annualContrib * ((Math.pow(1 + r, inputs.years) - 1) / r);
      const fvInitial = inputs.currentBalance * Math.pow(1 + r, inputs.years);
      const totalFV = fvInitial + fvContribs;
      const totalDeposited = inputs.currentBalance + inputs.annualContrib * inputs.years;
      return { totalFV, totalDeposited, taxFreeProfit: totalFV - totalDeposited };
    },
    formatResult: (res: { totalFV: number; totalDeposited: number; taxFreeProfit: number }) => ({
      primary: {
        label: 'Projected HSA Health Fund',
        value: ResultFormatter.formatCurrency(res.totalFV),
        numericValue: res.totalFV
      },
      secondary: [
        { label: 'Tax-Free Compounded Gain', value: ResultFormatter.formatCurrency(res.taxFreeProfit) },
        { label: 'Total Contributions', value: ResultFormatter.formatCurrency(res.totalDeposited) }
      ]
    })
  },

  // 30. Retirement Gap & Shortfall Calculator
  {
    id: 'retirement-shortfall-calc',
    name: 'Retirement Gap & Shortfall Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    formulaMeta: {
      formulaName: 'Retirement Deficit Calculation',
      formulaExpression: 'Shortfall = Needed Capital - Projected Capital',
      variables: [{ symbol: 'Shortfall', name: 'Retirement Deficit' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualDesiredIncome', label: 'Desired Annual Retirement Income ($)', type: 'currency', required: true, defaultValue: 80000, min: 10000 },
        { name: 'annualPensionsSS', label: 'Expected Social Security & Pensions ($)', type: 'currency', required: true, defaultValue: 32000, min: 0 },
        { name: 'projectedNestEgg', label: 'Projected Portfolio at Retirement ($)', type: 'currency', required: true, defaultValue: 850000, min: 10000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualDesiredIncome: number; annualPensionsSS: number; projectedNestEgg: number }) => {
      const netNeededFromPortfolio = Math.max(0, inputs.annualDesiredIncome - inputs.annualPensionsSS);
      const totalCapitalNeeded = netNeededFromPortfolio * 25;
      const shortfall = Math.max(0, totalCapitalNeeded - inputs.projectedNestEgg);
      const surplus = Math.max(0, inputs.projectedNestEgg - totalCapitalNeeded);
      return { totalCapitalNeeded, shortfall, surplus, netNeededFromPortfolio };
    },
    formatResult: (res: { totalCapitalNeeded: number; shortfall: number; surplus: number; netNeededFromPortfolio: number }) => ({
      primary: {
        label: res.shortfall > 0 ? 'Projected Retirement Shortfall' : 'Projected Retirement Surplus',
        value: ResultFormatter.formatCurrency(res.shortfall > 0 ? res.shortfall : res.surplus),
        numericValue: res.shortfall > 0 ? -res.shortfall : res.surplus
      },
      secondary: [
        { label: 'Total Portfolio Target Needed', value: ResultFormatter.formatCurrency(res.totalCapitalNeeded) },
        { label: 'Annual Income Needed from Savings', value: ResultFormatter.formatCurrency(res.netNeededFromPortfolio) }
      ]
    })
  },

  // 31. Straight-Line Depreciation Calculator
  {
    id: 'straight-line-depreciation-calc',
    name: 'Straight-Line Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Straight-Line Depreciation',
      formulaExpression: 'Depreciation = (Cost - Salvage) / Useful Life',
      variables: [{ symbol: 'Depreciation', name: 'Annual Expense', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'assetCost', label: 'Asset Purchase Cost ($)', type: 'currency', required: true, defaultValue: 50000, min: 100 },
        { name: 'salvageValue', label: 'Salvage / Residual Value ($)', type: 'currency', required: true, defaultValue: 5000, min: 0 },
        { name: 'usefulLife', label: 'Useful Life (Years)', type: 'integer', required: true, defaultValue: 5, min: 1, max: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { assetCost: number; salvageValue: number; usefulLife: number }) => {
      const annualDepreciation = (inputs.assetCost - inputs.salvageValue) / inputs.usefulLife;
      const monthlyDepreciation = annualDepreciation / 12;
      const depRate = (1 / inputs.usefulLife) * 100;
      return { annualDepreciation, monthlyDepreciation, depRate };
    },
    formatResult: (res: { annualDepreciation: number; monthlyDepreciation: number; depRate: number }) => ({
      primary: {
        label: 'Annual Depreciation Expense',
        value: ResultFormatter.formatCurrency(res.annualDepreciation),
        numericValue: res.annualDepreciation
      },
      secondary: [
        { label: 'Monthly Depreciation', value: ResultFormatter.formatCurrency(res.monthlyDepreciation) },
        { label: 'Annual Depreciation Rate', value: `${res.depRate.toFixed(1)}% / yr` }
      ]
    })
  },

  // 32. Double Declining Balance Depreciation Calculator
  {
    id: 'declining-balance-depreciation-calc',
    name: 'Double Declining Balance Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Double Declining Balance',
      formulaExpression: 'Rate = 200% / Life; Year 1 = Cost × Rate',
      variables: [{ symbol: 'Year 1', name: 'First Year Expense' }]
    },
    inputSchema: {
      fields: [
        { name: 'cost', label: 'Asset Cost ($)', type: 'currency', required: true, defaultValue: 40000, min: 100 },
        { name: 'salvage', label: 'Salvage Value ($)', type: 'currency', required: true, defaultValue: 4000, min: 0 },
        { name: 'life', label: 'Useful Life (Years)', type: 'integer', required: true, defaultValue: 5, min: 2, max: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cost: number; salvage: number; life: number }) => {
      const rate = 2 / inputs.life;
      const year1 = inputs.cost * rate;
      const year2 = (inputs.cost - year1) * rate;
      return { ratePct: rate * 100, year1, year2 };
    },
    formatResult: (res: { ratePct: number; year1: number; year2: number }) => ({
      primary: {
        label: 'Year 1 Depreciation Expense',
        value: ResultFormatter.formatCurrency(res.year1),
        numericValue: res.year1
      },
      secondary: [
        { label: 'Year 2 Depreciation Expense', value: ResultFormatter.formatCurrency(res.year2) },
        { label: 'DDB Rate', value: `${res.ratePct.toFixed(1)}%` }
      ]
    })
  },

  // 33. Sum-of-Years-Digits Depreciation Calculator
  {
    id: 'sum-of-years-digits-calc',
    name: 'Sum-of-Years-Digits Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Sum of the Years Digits (SYD)',
      formulaExpression: 'SYD = n(n+1)/2; Dep = (Cost - Salvage) × (Remaining/SYD)',
      variables: [{ symbol: 'Dep', name: 'Year 1 Depreciation' }]
    },
    inputSchema: {
      fields: [
        { name: 'cost', label: 'Asset Cost ($)', type: 'currency', required: true, defaultValue: 30000, min: 100 },
        { name: 'salvage', label: 'Salvage Value ($)', type: 'currency', required: true, defaultValue: 3000, min: 0 },
        { name: 'life', label: 'Useful Life (Years)', type: 'integer', required: true, defaultValue: 5, min: 2, max: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cost: number; salvage: number; life: number }) => {
      const n = inputs.life;
      const syd = (n * (n + 1)) / 2;
      const base = inputs.cost - inputs.salvage;
      const year1 = base * (n / syd);
      const year2 = base * ((n - 1) / syd);
      return { year1, year2, syd };
    },
    formatResult: (res: { year1: number; year2: number; syd: number }) => ({
      primary: {
        label: 'Year 1 Depreciation Expense',
        value: ResultFormatter.formatCurrency(res.year1),
        numericValue: res.year1
      },
      secondary: [
        { label: 'Year 2 Depreciation Expense', value: ResultFormatter.formatCurrency(res.year2) },
        { label: 'Sum of Digits (SYD)', value: `${res.syd}` }
      ]
    })
  },

  // 34. MACRS Depreciation Calculator
  {
    id: 'macrs-depreciation-calc',
    name: 'MACRS Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'IRS MACRS 5-Year Property Schedule',
      formulaExpression: 'Rates: Y1: 20%, Y2: 32%, Y3: 19.2%, Y4: 11.52%, Y5: 11.52%, Y6: 5.76%',
      variables: [{ symbol: 'Y1', name: 'Year 1 Deduction' }]
    },
    inputSchema: {
      fields: [
        { name: 'costBasis', label: 'Depreciable Basis ($)', type: 'currency', required: true, defaultValue: 25000, min: 500 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { costBasis: number }) => {
      const y1 = inputs.costBasis * 0.20;
      const y2 = inputs.costBasis * 0.32;
      const y3 = inputs.costBasis * 0.192;
      return { y1, y2, y3 };
    },
    formatResult: (res: { y1: number; y2: number; y3: number }) => ({
      primary: {
        label: 'Year 1 Deduction (20%)',
        value: ResultFormatter.formatCurrency(res.y1),
        numericValue: res.y1
      },
      secondary: [
        { label: 'Year 2 Deduction (32%)', value: ResultFormatter.formatCurrency(res.y2) },
        { label: 'Year 3 Deduction (19.2%)', value: ResultFormatter.formatCurrency(res.y3) }
      ]
    })
  },

  // 35. Capital Gains Tax Calculator
  {
    id: 'capital-gains-tax-calc',
    name: 'Capital Gains Tax Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Net Capital Gain and Tax',
      formulaExpression: 'Gain = Selling Price - Purchase Cost; Tax = Gain × Rate',
      variables: [{ symbol: 'Tax', name: 'Capital Gains Tax Liability' }]
    },
    inputSchema: {
      fields: [
        { name: 'purchasePrice', label: 'Purchase Basis ($)', type: 'currency', required: true, defaultValue: 15000, min: 0 },
        { name: 'salePrice', label: 'Total Sale Proceeds ($)', type: 'currency', required: true, defaultValue: 35000, min: 0 },
        { name: 'taxBracket', label: 'Long-Term Capital Gains Rate (%)', type: 'percentage', required: true, defaultValue: 15, min: 0, max: 37 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { purchasePrice: number; salePrice: number; taxBracket: number }) => {
      const gain = Math.max(0, inputs.salePrice - inputs.purchasePrice);
      const taxDue = gain * (inputs.taxBracket / 100);
      const netProceeds = inputs.salePrice - taxDue;
      return { gain, taxDue, netProceeds };
    },
    formatResult: (res: { gain: number; taxDue: number; netProceeds: number }) => ({
      primary: {
        label: 'Estimated Capital Gains Tax',
        value: ResultFormatter.formatCurrency(res.taxDue),
        numericValue: res.taxDue
      },
      secondary: [
        { label: 'Net Capital Gain', value: ResultFormatter.formatCurrency(res.gain) },
        { label: 'After-Tax Net Proceeds', value: ResultFormatter.formatCurrency(res.netProceeds) }
      ]
    })
  },

  // 36. Sales Tax Deduction Calculator
  {
    id: 'sales-tax-deduction-calc',
    name: 'Sales Tax Deduction Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Itemized Sales Tax Deduction',
      formulaExpression: 'Deduction = Major Purchases × Combined Tax Rate',
      variables: [{ symbol: 'Deduction', name: 'Federal Itemized Write-off' }]
    },
    inputSchema: {
      fields: [
        { name: 'taxablePurchases', label: 'Annual Major Taxable Purchases ($)', type: 'currency', required: true, defaultValue: 42000, min: 100 },
        { name: 'localTaxRate', label: 'State & Local Sales Tax (%)', type: 'percentage', required: true, defaultValue: 7.25, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { taxablePurchases: number; localTaxRate: number }) => {
      const deduction = inputs.taxablePurchases * (inputs.localTaxRate / 100);
      return { deduction, purchases: inputs.taxablePurchases };
    },
    formatResult: (res: { deduction: number; purchases: number }) => ({
      primary: {
        label: 'Estimated Sales Tax Deduction',
        value: ResultFormatter.formatCurrency(res.deduction),
        numericValue: res.deduction
      },
      secondary: [
        { label: 'Total Purchases Examined', value: ResultFormatter.formatCurrency(res.purchases) }
      ]
    })
  },

  // 37. Effective Tax Rate Calculator
  {
    id: 'effective-tax-rate-calc',
    name: 'Effective Tax Rate Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Effective Tax Rate Formula',
      formulaExpression: 'Effective Rate = (Total Tax / Gross Income) × 100',
      variables: [{ symbol: 'Effective Rate', name: 'True Average Tax Rate', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'grossIncome', label: 'Gross Annual Income ($)', type: 'currency', required: true, defaultValue: 95000, min: 1000 },
        { name: 'totalTaxPaid', label: 'Total Federal & State Taxes Paid ($)', type: 'currency', required: true, defaultValue: 17100, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossIncome: number; totalTaxPaid: number }) => {
      const rate = (inputs.totalTaxPaid / inputs.grossIncome) * 100;
      const afterTax = inputs.grossIncome - inputs.totalTaxPaid;
      return { rate, afterTax };
    },
    formatResult: (res: { rate: number; afterTax: number }) => ({
      primary: {
        label: 'Effective Tax Rate',
        value: `${res.rate.toFixed(2)}%`,
        numericValue: res.rate
      },
      secondary: [
        { label: 'After-Tax Retained Income', value: ResultFormatter.formatCurrency(res.afterTax) }
      ]
    })
  },

  // 38. FICA Payroll Tax Calculator
  {
    id: 'fica-payroll-tax-calc',
    name: 'FICA Payroll Tax Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'FICA Social Security & Medicare',
      formulaExpression: 'SS = 6.2% up to cap; Medicare = 1.45% (Total = 7.65%)',
      variables: [{ symbol: 'FICA', name: 'Total Employee FICA Withholding' }]
    },
    inputSchema: {
      fields: [
        { name: 'grossSalary', label: 'Annual Gross Salary ($)', type: 'currency', required: true, defaultValue: 75000, min: 1000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossSalary: number }) => {
      const ssCap = 168600;
      const ssTaxable = Math.min(inputs.grossSalary, ssCap);
      const socialSecurity = ssTaxable * 0.062;
      const medicare = inputs.grossSalary * 0.0145;
      const totalFICA = socialSecurity + medicare;
      return { totalFICA, socialSecurity, medicare };
    },
    formatResult: (res: { totalFICA: number; socialSecurity: number; medicare: number }) => ({
      primary: {
        label: 'Total Annual FICA Tax',
        value: ResultFormatter.formatCurrency(res.totalFICA),
        numericValue: res.totalFICA
      },
      secondary: [
        { label: 'Social Security (6.2%)', value: ResultFormatter.formatCurrency(res.socialSecurity) },
        { label: 'Medicare (1.45%)', value: ResultFormatter.formatCurrency(res.medicare) }
      ]
    })
  },

  // 39. Section 179 & Bonus Depreciation Calculator
  {
    id: 'bonus-depreciation-calc',
    name: 'Section 179 & Bonus Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Immediate First-Year Equipment Expensing',
      formulaExpression: 'Tax Savings = Purchase Cost × Marginal Tax Rate',
      variables: [{ symbol: 'Savings', name: 'Net Income Tax Savings' }]
    },
    inputSchema: {
      fields: [
        { name: 'equipmentCost', label: 'Eligible Equipment Cost ($)', type: 'currency', required: true, defaultValue: 80000, min: 1000 },
        { name: 'taxBracket', label: 'Corporate/Owner Tax Bracket (%)', type: 'percentage', required: true, defaultValue: 28, min: 10, max: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { equipmentCost: number; taxBracket: number }) => {
      const deduction = inputs.equipmentCost;
      const taxSavings = deduction * (inputs.taxBracket / 100);
      const netEffectiveCost = inputs.equipmentCost - taxSavings;
      return { deduction, taxSavings, netEffectiveCost };
    },
    formatResult: (res: { deduction: number; taxSavings: number; netEffectiveCost: number }) => ({
      primary: {
        label: 'Immediate Tax Savings',
        value: ResultFormatter.formatCurrency(res.taxSavings),
        numericValue: res.taxSavings
      },
      secondary: [
        { label: 'First-Year Write-off (100%)', value: ResultFormatter.formatCurrency(res.deduction) },
        { label: 'Net Effective Cost of Equipment', value: ResultFormatter.formatCurrency(res.netEffectiveCost) }
      ]
    })
  },

  // 40. Take-Home Paycheck Calculator
  {
    id: 'net-paycheck-calc',
    name: 'Take-Home Paycheck Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    formulaMeta: {
      formulaName: 'Net Paycheck Calculation',
      formulaExpression: 'Net = Gross - Federal - State - FICA',
      variables: [{ symbol: 'Net', name: 'Take-Home Pay' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualSalary', label: 'Gross Annual Salary ($)', type: 'currency', required: true, defaultValue: 72000, min: 5000 },
        { name: 'payFrequency', label: 'Pay Period', type: 'select', required: true, defaultValue: '26', options: [
          { label: 'Bi-Weekly (Every 2 weeks, 26 paychecks)', value: '26' },
          { label: 'Semi-Monthly (Twice a month, 24 paychecks)', value: '24' },
          { label: 'Monthly (12 paychecks)', value: '12' },
          { label: 'Weekly (52 paychecks)', value: '52' }
        ]},
        { name: 'stateTaxRate', label: 'State Income Tax (%)', type: 'percentage', required: true, defaultValue: 4.5, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualSalary: number; payFrequency: string; stateTaxRate: number }) => {
      const freq = parseInt(inputs.payFrequency, 10);
      const grossPerPeriod = inputs.annualSalary / freq;
      const fedRate = 0.12;
      const ficaRate = 0.0765;
      const stateRate = inputs.stateTaxRate / 100;
      const totalTaxRate = fedRate + ficaRate + stateRate;
      const netPerPeriod = grossPerPeriod * (1 - totalTaxRate);
      const annualNet = netPerPeriod * freq;
      return { grossPerPeriod, netPerPeriod, annualNet, totalTaxRate: totalTaxRate * 100 };
    },
    formatResult: (res: { grossPerPeriod: number; netPerPeriod: number; annualNet: number; totalTaxRate: number }) => ({
      primary: {
        label: 'Net Paycheck (Take-Home)',
        value: ResultFormatter.formatCurrency(res.netPerPeriod),
        numericValue: res.netPerPeriod
      },
      secondary: [
        { label: 'Gross Pay per Period', value: ResultFormatter.formatCurrency(res.grossPerPeriod) },
        { label: 'Annual Net Take-Home', value: ResultFormatter.formatCurrency(res.annualNet) },
        { label: 'Estimated Total Tax Rate', value: `${res.totalTaxRate.toFixed(1)}%` }
      ]
    })
  }
];
