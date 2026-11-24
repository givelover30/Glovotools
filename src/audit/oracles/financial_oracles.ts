import { OracleDefinition } from '../types.ts';

export const FINANCIAL_ORACLES: Record<string, OracleDefinition> = {
  // 1. Mortgage (Base)
  'loan-mortgage': {
    id: 'loan-mortgage',
    name: 'Mortgage Loan Payment Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.principal);
      const r = (Number(inp.rate || inp.annualInterestRate) / 100) / 12;
      const n = Number(inp.years || inp.termYears) * 12;
      return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },
    testCases: [
      { name: '$300k at 6% for 30 yrs -> $1798.65', inputs: { principal: 300000, rate: 6, years: 30 }, expectedPrimary: 1798.65, tolerance: 0.50 }
    ]
  },

  // 2. Compound Interest (Base)
  'compound-interest': {
    id: 'compound-interest',
    name: 'Compound Interest Growth Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => {
      const p = Number(inp.principal);
      const r = Number(inp.rate) / 100;
      const t = Number(inp.years);
      return p * Math.pow(1 + r / 12, 12 * t);
    },
    testCases: [
      { name: '$10k at 7% for 10 yrs monthly compounding', inputs: { principal: 10000, rate: 7, years: 10, monthlyContribution: 0 }, expectedPrimary: 10000 * Math.pow(1 + 0.07 / 12, 120), tolerance: 1.0 }
    ]
  },

  // 3. Auto Loan
  'auto-loan-calc': {
    id: 'auto-loan-calc',
    name: 'Auto Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.vehiclePrice) - Number(inp.downPayment);
      const r = (Number(inp.interestRate) / 100) / 12;
      const n = Number(inp.loanTermMonths);
      return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },
    testCases: [
      { name: '$28k net at 5.5% for 60 mos -> $534.81', inputs: { vehiclePrice: 32000, downPayment: 4000, interestRate: 5.5, loanTermMonths: 60 }, expectedPrimary: 534.81, tolerance: 0.50 }
    ]
  },

  // 4. Amortization Schedule
  'amortization-schedule-calc': {
    id: 'amortization-schedule-calc',
    name: 'Loan Amortization Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.principal);
      const r = (Number(inp.annualRate) / 100) / 12;
      const n = Number(inp.years) * 12;
      return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },
    testCases: [
      { name: '$100k at 6% for 15 yrs -> $843.86', inputs: { principal: 100000, annualRate: 6.0, years: 15 }, expectedPrimary: 843.86, tolerance: 0.50 }
    ]
  },

  // 5. Debt to Income
  'debt-to-income-calc': {
    id: 'debt-to-income-calc',
    name: 'Debt-to-Income (DTI) Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => ((Number(inp.mortgageRent) + Number(inp.otherDebts)) / Number(inp.monthlyIncome)) * 100,
    testCases: [
      { name: '(1800 + 600) / 7500 = 32%', inputs: { monthlyIncome: 7500, mortgageRent: 1800, otherDebts: 600 }, expectedPrimary: 32 }
    ]
  },

  // 6. Refinance Mortgage
  'refinance-mortgage-calc': {
    id: 'refinance-mortgage-calc',
    name: 'Mortgage Refinance Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => Number(inp.currentPayment) - Number(inp.newPayment),
    testCases: [
      { name: 'Savings $2100 - $1750 = $350', inputs: { currentPayment: 2100, newPayment: 1750, closingCosts: 4500 }, expectedPrimary: 350 }
    ]
  },

  // 7. Extra Payment
  'extra-payment-calc': {
    id: 'extra-payment-calc',
    name: 'Mortgage Extra Payment Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const r = (Number(inp.rate) / 100) / 12;
      const n = Number(inp.termYears) * 12;
      const stdPMT = (Number(inp.balance) * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const newPMT = stdPMT + Number(inp.extraMonthly);
      const newMonths = -Math.log(1 - (r * Number(inp.balance)) / newPMT) / Math.log(1 + r);
      const stdInterest = stdPMT * n - Number(inp.balance);
      const newInterest = newPMT * newMonths - Number(inp.balance);
      return Math.max(0, stdInterest - newInterest);
    },
    testCases: [
      { name: 'Extra $250/mo saves interest', inputs: { balance: 300000, rate: 6.0, termYears: 25, extraMonthly: 250 }, expectedPrimary: 71272.22, tolerance: 10 }
    ]
  },

  // 8. Personal Loan
  'personal-loan-calc': {
    id: 'personal-loan-calc',
    name: 'Personal Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.loanAmount);
      const r = (Number(inp.interestRate) / 100) / 12;
      const n = Number(inp.termMonths);
      return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },
    testCases: [
      { name: '$15k at 9.5% for 36 mos -> $480.49', inputs: { loanAmount: 15000, interestRate: 9.5, termMonths: 36 }, expectedPrimary: 480.49, tolerance: 0.50 }
    ]
  },

  // 9. Boat RV Loan
  'boat-rv-loan-calc': {
    id: 'boat-rv-loan-calc',
    name: 'Boat & RV Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.purchasePrice) - Number(inp.downPayment);
      const r = (Number(inp.rate) / 100) / 12;
      const n = Number(inp.termYears) * 12;
      return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },
    testCases: [
      { name: '$55k financed at 7.25% for 12 yrs -> $574.65', inputs: { purchasePrice: 65000, downPayment: 10000, rate: 7.25, termYears: 12 }, expectedPrimary: 574.65, tolerance: 1.0 }
    ]
  },

  // 10. Balloon Payment
  'balloon-payment-calc': {
    id: 'balloon-payment-calc',
    name: 'Balloon Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.loanAmount);
      const r = (Number(inp.interestRate) / 100) / 12;
      const n = Number(inp.amortYears) * 12;
      const k = Number(inp.balloonYear) * 12;
      const pmt = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return p * Math.pow(1 + r, k) - pmt * ((Math.pow(1 + r, k) - 1) / r);
    },
    testCases: [
      { name: '$250k at 6.5% 30yr amort, 7yr balloon', inputs: { loanAmount: 250000, interestRate: 6.5, amortYears: 30, balloonYear: 7 }, expectedPrimary: 228000, tolerance: 5000 }
    ]
  },

  // 11. Biweekly Mortgage
  'biweekly-mortgage-calc': {
    id: 'biweekly-mortgage-calc',
    name: 'Bi-Weekly Mortgage Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => {
      const p = Number(inp.loanAmount);
      const r = (Number(inp.rate) / 100) / 12;
      const n = Number(inp.years) * 12;
      const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return monthly / 2;
    },
    testCases: [
      { name: '$350k at 6.2% 30yr -> biweekly payment ~$1073', inputs: { loanAmount: 350000, rate: 6.2, years: 30 }, expectedPrimary: 1073.4, tolerance: 2.0 }
    ]
  },

  // 12. Interest Only Loan
  'interest-only-loan-calc': {
    id: 'interest-only-loan-calc',
    name: 'Interest-Only Loan Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    independentCalculate: (inp) => Number(inp.loanAmount) * ((Number(inp.rate) / 100) / 12),
    testCases: [
      { name: '$400k at 6.0% -> IO PMT = $2000', inputs: { loanAmount: 400000, rate: 6.0, ioYears: 10, totalYears: 30 }, expectedPrimary: 2000 }
    ]
  },

  // 13. Simple Interest
  'simple-interest-calc': {
    id: 'simple-interest-calc',
    name: 'Simple Interest Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => Number(inp.principal) * (Number(inp.annualRate) / 100) * Number(inp.years),
    testCases: [
      { name: '$10k at 5% for 3 yrs = $1500', inputs: { principal: 10000, annualRate: 5.0, years: 3 }, expectedPrimary: 1500 }
    ]
  },

  // 14. APR to APY
  'apr-to-apy-calc': {
    id: 'apr-to-apy-calc',
    name: 'APR to APY Converter & Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => {
      const r = Number(inp.apr) / 100;
      const n = parseInt(inp.frequency, 10);
      return (Math.pow(1 + r / n, n) - 1) * 100;
    },
    testCases: [
      { name: '5.25% APR compounded monthly -> 5.378% APY', inputs: { apr: 5.25, frequency: '12' }, expectedPrimary: (Math.pow(1 + 0.0525 / 12, 12) - 1) * 100, tolerance: 0.001 }
    ]
  },

  // 15. CD Calculator
  'certificate-deposit-calc': {
    id: 'certificate-deposit-calc',
    name: 'Certificate of Deposit (CD) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => Number(inp.deposit) * Math.pow(1 + Number(inp.apy) / 100, Number(inp.termMonths) / 12),
    testCases: [
      { name: '$10k at 4.8% APY for 12 mos = $10480', inputs: { deposit: 10000, apy: 4.8, termMonths: 12 }, expectedPrimary: 10480, tolerance: 0.1 }
    ]
  },

  // 16. Rule of 72
  'rule-of-72-calc': {
    id: 'rule-of-72-calc',
    name: 'Rule of 72 Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => 72 / Number(inp.rate),
    testCases: [
      { name: '8% return doubles in 9 years', inputs: { rate: 8.0, initialInvestment: 25000 }, expectedPrimary: 9.0 }
    ]
  },

  // 17. Dividend Yield
  'dividend-yield-calc': {
    id: 'dividend-yield-calc',
    name: 'Dividend Yield Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => (Number(inp.annualDividend) / Number(inp.stockPrice)) * 100,
    testCases: [
      { name: '$3.40 div on $85 stock = 4.0%', inputs: { stockPrice: 85, annualDividend: 3.40, sharesOwned: 200 }, expectedPrimary: 4.0 }
    ]
  },

  // 18. Future Value
  'future-value-calc': {
    id: 'future-value-calc',
    name: 'Future Value (FV) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => Number(inp.presentValue) * Math.pow(1 + Number(inp.rate) / 100, Number(inp.years)),
    testCases: [
      { name: '$50k at 7% for 10 yrs = $98357.57', inputs: { presentValue: 50000, rate: 7.0, years: 10 }, expectedPrimary: 50000 * Math.pow(1.07, 10), tolerance: 0.50 }
    ]
  },

  // 19. Present Value
  'present-value-calc': {
    id: 'present-value-calc',
    name: 'Present Value (PV) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => Number(inp.futureValue) / Math.pow(1 + Number(inp.discountRate) / 100, Number(inp.years)),
    testCases: [
      { name: '$100k discounted at 6% for 10 yrs = $55839.48', inputs: { futureValue: 100000, discountRate: 6.0, years: 10 }, expectedPrimary: 100000 / Math.pow(1.06, 10), tolerance: 0.50 }
    ]
  },

  // 20. Annuity Value
  'annuity-payout-calc': {
    id: 'annuity-payout-calc',
    name: 'Annuity Value Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => {
      const pmt = Number(inp.payment);
      const r = (Number(inp.annualRate) / 100) / 12;
      const n = Number(inp.years) * 12;
      return pmt * ((Math.pow(1 + r, n) - 1) / r);
    },
    testCases: [
      { name: '$500/mo at 7% for 20 yrs = $260,463', inputs: { payment: 500, annualRate: 7.0, years: 20 }, expectedPrimary: 260463, tolerance: 200 }
    ]
  },

  // 21. Treasury Bond Yield
  'treasury-bond-yield-calc': {
    id: 'treasury-bond-yield-calc',
    name: 'Bond Yield to Maturity (YTM) Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => {
      const C = Number(inp.faceValue) * (Number(inp.couponRate) / 100);
      const F = Number(inp.faceValue);
      const P = Number(inp.currentPrice);
      const n = Number(inp.yearsToMaturity);
      return ((C + (F - P) / n) / ((F + P) / 2)) * 100;
    },
    testCases: [
      { name: '$1000 par at $940, 4.5% coupon, 10 yrs -> ~5.26%', inputs: { faceValue: 1000, currentPrice: 940, couponRate: 4.5, yearsToMaturity: 10 }, expectedPrimary: 5.257, tolerance: 0.05 }
    ]
  },

  // 22. Mutual Fund Fee Drag
  'mutual-fund-fee-calc': {
    id: 'mutual-fund-fee-calc',
    name: 'Mutual Fund Expense Drag Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    independentCalculate: (inp) => {
      const p = Number(inp.initialInvestment);
      const g = Number(inp.grossReturn) / 100;
      const net = (Number(inp.grossReturn) - Number(inp.expenseRatio)) / 100;
      const t = Number(inp.years);
      return p * Math.pow(1 + g, t) - p * Math.pow(1 + net, t);
    },
    testCases: [
      { name: '$100k at 8% vs 6.75% for 25 yrs', inputs: { initialInvestment: 100000, grossReturn: 8.0, expenseRatio: 1.25, years: 25 }, expectedPrimary: 174000, tolerance: 10000 }
    ]
  },

  // 23. 401(k) Calculator
  '401k-savings-calc': {
    id: '401k-savings-calc',
    name: '401(k) Retirement Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const emp = Number(inp.currentSalary) * (Number(inp.contributionPct) / 100);
      const match = Number(inp.currentSalary) * (Number(inp.employerMatchPct) / 100);
      const monthly = (emp + match) / 12;
      const r = (Number(inp.expectedReturn) / 100) / 12;
      const n = Number(inp.yearsToRetire) * 12;
      return Number(inp.currentBalance) * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
    },
    testCases: [
      { name: '$80k salary, 6% + 3% match for 30 yrs at 7%', inputs: { currentSalary: 80000, contributionPct: 6.0, employerMatchPct: 3.0, currentBalance: 45000, yearsToRetire: 30, expectedReturn: 7.0 }, expectedPrimary: 1000000, tolerance: 150000 }
    ]
  },

  // 24. Roth IRA
  'roth-ira-calc': {
    id: 'roth-ira-calc',
    name: 'Roth IRA Growth Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const monthly = Number(inp.annualContribution) / 12;
      const r = (Number(inp.expectedReturn) / 100) / 12;
      const n = Number(inp.years) * 12;
      return Number(inp.currentBalance) * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
    },
    testCases: [
      { name: '$7000/yr for 25 yrs at 7.5%', inputs: { annualContribution: 7000, currentBalance: 20000, years: 25, expectedReturn: 7.5 }, expectedPrimary: 620000, tolerance: 50000 }
    ]
  },

  // 25. Traditional IRA
  'traditional-ira-calc': {
    id: 'traditional-ira-calc',
    name: 'Traditional IRA Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const yrs = Number(inp.retireAge) - Number(inp.currentAge);
      const r = Number(inp.expectedReturn) / 100;
      return Number(inp.annualContrib) * ((Math.pow(1 + r, yrs) - 1) / r);
    },
    testCases: [
      { name: '$7000/yr for 30 yrs at 7%', inputs: { annualContrib: 7000, currentAge: 35, retireAge: 65, expectedReturn: 7.0 }, expectedPrimary: 661200, tolerance: 20000 }
    ]
  },

  // 26. Safe Withdrawal Rate
  'safe-withdrawal-rate-calc': {
    id: 'safe-withdrawal-rate-calc',
    name: 'Safe Withdrawal Rate (4% Rule) Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => Number(inp.portfolioBalance) * (Number(inp.withdrawalRate) / 100),
    testCases: [
      { name: '4% of $1.25M = $50,000/yr', inputs: { portfolioBalance: 1250000, withdrawalRate: 4.0 }, expectedPrimary: 50000 }
    ]
  },

  // 27. Pension vs Lump Sum
  'pension-annuity-calc': {
    id: 'pension-annuity-calc',
    name: 'Pension Lump Sum vs Monthly Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const m = Number(inp.monthlyPension);
      const r = (Number(inp.discountRate) / 100) / 12;
      const n = Number(inp.expectedYears) * 12;
      return (m * (1 - Math.pow(1 + r, -n))) / r;
    },
    testCases: [
      { name: '$2100/mo for 22 yrs at 5.5% -> PV ~$319,890', inputs: { lumpSumOffer: 320000, monthlyPension: 2100, expectedYears: 22, discountRate: 5.5 }, expectedPrimary: 319890, tolerance: 2000 }
    ]
  },

  // 28. FIRE Calculator
  'fire-calculator': {
    id: 'fire-calculator',
    name: 'FIRE (Financial Independence) Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => Number(inp.annualExpenses) * 25,
    testCases: [
      { name: 'FIRE target on $60k expenses = $1,500,000', inputs: { annualExpenses: 60000, currentSavings: 220000, annualSavings: 30000, realReturn: 5.0 }, expectedPrimary: 1500000 }
    ]
  },

  // 29. Social Security Breakeven
  'social-security-estimate-calc': {
    id: 'social-security-estimate-calc',
    name: 'Social Security Breakeven Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const diff = Number(inp.age67Monthly) - Number(inp.age62Monthly);
      const headStart = Number(inp.age62Monthly) * 60;
      return 67 + (headStart / diff) / 12;
    },
    testCases: [
      { name: 'Breakeven age between 62 and 67', inputs: { age62Monthly: 1750, age67Monthly: 2500 }, expectedPrimary: 67 + (1750 * 60 / 750) / 12, tolerance: 0.1 }
    ]
  },

  // 30. 529 College Savings
  'college-savings-529-calc': {
    id: 'college-savings-529-calc',
    name: '529 College Savings Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const r = (Number(inp.expectedReturn) / 100) / 12;
      const n = Number(inp.yearsUntilCollege) * 12;
      const fvInitial = Number(inp.current529) * Math.pow(1 + r, n);
      const remaining = Number(inp.targetTuition) - fvInitial;
      return (remaining * r) / (Math.pow(1 + r, n) - 1);
    },
    testCases: [
      { name: '$120k goal in 12 yrs at 6.5%', inputs: { targetTuition: 120000, current529: 15000, yearsUntilCollege: 12, expectedReturn: 6.5 }, expectedPrimary: 395, tolerance: 30 }
    ]
  },

  // 31. HSA Growth
  'hsa-growth-calc': {
    id: 'hsa-growth-calc',
    name: 'HSA Triple-Tax Advantage Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const r = Number(inp.growthRate) / 100;
      const y = Number(inp.years);
      return Number(inp.currentBalance) * Math.pow(1 + r, y) + Number(inp.annualContrib) * ((Math.pow(1 + r, y) - 1) / r);
    },
    testCases: [
      { name: '$4150/yr for 20 yrs at 7%', inputs: { annualContrib: 4150, currentBalance: 8000, years: 20, growthRate: 7.0 }, expectedPrimary: 200000, tolerance: 20000 }
    ]
  },

  // 32. Retirement Shortfall
  'retirement-shortfall-calc': {
    id: 'retirement-shortfall-calc',
    name: 'Retirement Gap & Shortfall Calculator',
    category: 'financial',
    subcategoryId: 'retirement-savings',
    independentCalculate: (inp) => {
      const neededFromPort = Number(inp.annualDesiredIncome) - Number(inp.annualPensionsSS);
      const totalNeeded = neededFromPort * 25;
      const shortfall = Math.max(0, totalNeeded - Number(inp.projectedNestEgg));
      return shortfall > 0 ? -shortfall : 0;
    },
    testCases: [
      { name: 'Shortfall on $80k desired - $32k pensions = $48k * 25 = $1.2M - $850k = $350k', inputs: { annualDesiredIncome: 80000, annualPensionsSS: 32000, projectedNestEgg: 850000 }, expectedPrimary: -350000, tolerance: 0.01 }
    ]
  },

  // 33. Straight Line Depreciation
  'straight-line-depreciation-calc': {
    id: 'straight-line-depreciation-calc',
    name: 'Straight-Line Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => (Number(inp.assetCost) - Number(inp.salvageValue)) / Number(inp.usefulLife),
    testCases: [
      { name: '($50k - $5k) / 5 yrs = $9000/yr', inputs: { assetCost: 50000, salvageValue: 5000, usefulLife: 5 }, expectedPrimary: 9000 }
    ]
  },

  // 34. Double Declining Depreciation
  'declining-balance-depreciation-calc': {
    id: 'declining-balance-depreciation-calc',
    name: 'Double Declining Balance Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => Number(inp.cost) * (2 / Number(inp.life)),
    testCases: [
      { name: 'Year 1 DDB on $40k 5-yr life (40%) = $16000', inputs: { cost: 40000, salvage: 4000, life: 5 }, expectedPrimary: 16000 }
    ]
  },

  // 35. Sum of Years Digits
  'sum-of-years-digits-calc': {
    id: 'sum-of-years-digits-calc',
    name: 'Sum-of-Years-Digits Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => {
      const n = Number(inp.life);
      const syd = (n * (n + 1)) / 2;
      return (Number(inp.cost) - Number(inp.salvage)) * (n / syd);
    },
    testCases: [
      { name: 'Year 1 SYD on $30k - $3k over 5 yrs (5/15) = $9000', inputs: { cost: 30000, salvage: 3000, life: 5 }, expectedPrimary: 9000 }
    ]
  },

  // 36. MACRS Depreciation
  'macrs-depreciation-calc': {
    id: 'macrs-depreciation-calc',
    name: 'MACRS Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => Number(inp.costBasis) * 0.20,
    testCases: [
      { name: 'Year 1 MACRS 20% on $25k = $5000', inputs: { costBasis: 25000 }, expectedPrimary: 5000 }
    ]
  },

  // 37. Capital Gains Tax
  'capital-gains-tax-calc': {
    id: 'capital-gains-tax-calc',
    name: 'Capital Gains Tax Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => (Number(inp.salePrice) - Number(inp.purchasePrice)) * (Number(inp.taxBracket) / 100),
    testCases: [
      { name: '15% on $20k gain ($35k - $15k) = $3000', inputs: { purchasePrice: 15000, salePrice: 35000, taxBracket: 15 }, expectedPrimary: 3000 }
    ]
  },

  // 38. Sales Tax Deduction
  'sales-tax-deduction-calc': {
    id: 'sales-tax-deduction-calc',
    name: 'Sales Tax Deduction Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => Number(inp.taxablePurchases) * (Number(inp.localTaxRate) / 100),
    testCases: [
      { name: '7.25% on $42k purchases = $3045', inputs: { taxablePurchases: 42000, localTaxRate: 7.25 }, expectedPrimary: 3045 }
    ]
  },

  // 39. Effective Tax Rate
  'effective-tax-rate-calc': {
    id: 'effective-tax-rate-calc',
    name: 'Effective Tax Rate Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => (Number(inp.totalTaxPaid) / Number(inp.grossIncome)) * 100,
    testCases: [
      { name: '$17,100 tax on $95,000 income = 18.0%', inputs: { grossIncome: 95000, totalTaxPaid: 17100 }, expectedPrimary: 18.0 }
    ]
  },

  // 40. FICA Payroll Tax
  'fica-payroll-tax-calc': {
    id: 'fica-payroll-tax-calc',
    name: 'FICA Payroll Tax Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => {
      const g = Number(inp.grossSalary);
      const ss = Math.min(g, 168600) * 0.062;
      const med = g * 0.0145;
      return ss + med;
    },
    testCases: [
      { name: '7.65% on $75k = $5737.50', inputs: { grossSalary: 75000 }, expectedPrimary: 5737.50 }
    ]
  },

  // 41. Bonus Depreciation
  'bonus-depreciation-calc': {
    id: 'bonus-depreciation-calc',
    name: 'Section 179 & Bonus Depreciation Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => Number(inp.equipmentCost) * (Number(inp.taxBracket) / 100),
    testCases: [
      { name: '28% bracket on $80k equip = $22,400 savings', inputs: { equipmentCost: 80000, taxBracket: 28 }, expectedPrimary: 22400 }
    ]
  },

  // 42. Net Paycheck
  'net-paycheck-calc': {
    id: 'net-paycheck-calc',
    name: 'Take-Home Paycheck Calculator',
    category: 'financial',
    subcategoryId: 'depreciation-tax',
    independentCalculate: (inp) => {
      const freq = parseInt(inp.payFrequency, 10);
      const gross = Number(inp.annualSalary) / freq;
      const taxRate = 0.12 + 0.0765 + Number(inp.stateTaxRate) / 100;
      return gross * (1 - taxRate);
    },
    testCases: [
      { name: '$72k salary bi-weekly with 4.5% state tax', inputs: { annualSalary: 72000, payFrequency: '26', stateTaxRate: 4.5 }, expectedPrimary: (72000 / 26) * (1 - (0.12 + 0.0765 + 0.045)), tolerance: 1.0 }
    ]
  }
};
