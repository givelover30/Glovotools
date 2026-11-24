import { OracleDefinition } from '../types.ts';

export const STATS_SCIENTIFIC_ORACLES: Record<string, OracleDefinition> = {
  // 1. Statistics Suite (Base)
  'statistics-calc': {
    id: 'statistics-calc',
    name: 'Descriptive Statistics & Dispersion',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      // Mean of array
      const arr = [inp.v1, inp.v2, inp.v3, inp.v4, inp.v5].map(Number);
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    },
    testCases: [
      { name: 'Mean of 10,20,30,40,50', inputs: { v1: 10, v2: 20, v3: 30, v4: 40, v5: 50 }, expectedPrimary: 30 }
    ]
  },

  // 2. Variance
  'variance-calc': {
    id: 'variance-calc',
    name: 'Variance Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      const arr = [inp.v1, inp.v2, inp.v3, inp.v4, inp.v5].map(Number);
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
    },
    testCases: [
      { name: 'Sample variance of 10,15,20,25,30', inputs: { v1: 10, v2: 15, v3: 20, v4: 25, v5: 30 }, expectedPrimary: 62.5 }
    ]
  },

  // 3. Standard Deviation
  'standard-deviation': {
    id: 'standard-deviation',
    name: 'Standard Deviation Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      const arr = [inp.v1, inp.v2, inp.v3, inp.v4, inp.v5].map(Number);
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      const s2 = arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
      return Math.sqrt(s2);
    },
    testCases: [
      { name: 'Sample std dev of 10,15,20,25,30', inputs: { v1: 10, v2: 15, v3: 20, v4: 25, v5: 30 }, expectedPrimary: Math.sqrt(62.5), tolerance: 0.01 }
    ]
  },

  // 4. Mean Median Mode
  'mean-median-mode': {
    id: 'mean-median-mode',
    name: 'Mean, Median & Mode Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      const arr = [inp.v1, inp.v2, inp.v3, inp.v4, inp.v5].map(Number);
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    },
    testCases: [
      { name: 'Mean of 10,20,20,40,60', inputs: { v1: 10, v2: 20, v3: 20, v4: 40, v5: 60 }, expectedPrimary: 30 }
    ]
  },

  // 5. Geometric Mean
  'geometric-mean': {
    id: 'geometric-mean',
    name: 'Geometric Mean Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      const arr = [inp.v1, inp.v2, inp.v3, inp.v4].map(Number);
      const prod = arr.reduce((a, b) => a * b, 1);
      return Math.pow(prod, 1 / arr.length);
    },
    testCases: [
      { name: 'GM of 2, 8 = 4 (here with 4 numbers: 2, 8, 2, 8 = 4)', inputs: { v1: 2, v2: 8, v3: 2, v4: 8 }, expectedPrimary: 4 }
    ]
  },

  // 6. Harmonic Mean
  'harmonic-mean': {
    id: 'harmonic-mean',
    name: 'Harmonic Mean Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      const arr = [inp.v1, inp.v2, inp.v3].map(Number);
      const sumInv = arr.reduce((a, b) => a + 1 / b, 0);
      return arr.length / sumInv;
    },
    testCases: [
      { name: 'HM of 1, 2, 4 = 1.714', inputs: { v1: 1, v2: 2, v3: 4 }, expectedPrimary: 3 / (1 + 0.5 + 0.25), tolerance: 0.01 }
    ]
  },

  // 7. Range & IQR
  'range-iqr-calc': {
    id: 'range-iqr-calc',
    name: 'Range & Interquartile Range (IQR)',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    independentCalculate: (inp) => {
      const arr = [inp.v1, inp.v2, inp.v3, inp.v4, inp.v5].map(Number);
      return Math.max(...arr) - Math.min(...arr);
    },
    testCases: [
      { name: 'Range of 10, 20, 30, 40, 50 = 40', inputs: { v1: 10, v2: 20, v3: 30, v4: 40, v5: 50 }, expectedPrimary: 40 }
    ]
  },

  // 8. Z-Score
  'z-score-standard-normal': {
    id: 'z-score-standard-normal',
    name: 'Z-Score & Standard Normal Distribution',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => (Number(inp.rawScore) - Number(inp.mean)) / Number(inp.stdDev),
    testCases: [
      { name: 'Raw 85, Mean 70, StdDev 10 -> Z = 1.5', inputs: { rawScore: 85, mean: 70, stdDev: 10 }, expectedPrimary: 1.5 }
    ]
  },

  // 9. Sample Size
  'sample-size-confidence': {
    id: 'sample-size-confidence',
    name: 'Sample Size Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => {
      const z = Number(inp.zScore);
      const p = Number(inp.proportion);
      const e = Number(inp.marginOfError);
      return Math.ceil((Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2));
    },
    testCases: [
      { name: 'Z=1.96, p=0.5, e=0.05 -> n=385', inputs: { zScore: 1.96, proportion: 0.5, marginOfError: 0.05 }, expectedPrimary: 385 }
    ]
  },

  // 10. Margin of Error
  'margin-of-error-calc': {
    id: 'margin-of-error-calc',
    name: 'Margin of Error Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => {
      const z = Number(inp.zScore);
      const p = Number(inp.proportion);
      const n = Number(inp.sampleSize);
      return z * Math.sqrt((p * (1 - p)) / n) * 100;
    },
    testCases: [
      { name: 'z=1.96, p=0.5, n=400 -> MOE ~ 4.9%', inputs: { zScore: 1.96, proportion: 0.5, sampleSize: 400 }, expectedPrimary: 1.96 * Math.sqrt(0.25 / 400) * 100, tolerance: 0.01 }
    ]
  },

  // 11. Combinations nCr
  'combinations-ncr-calc': {
    id: 'combinations-ncr-calc',
    name: 'Combinations Calculator (nCr)',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    independentCalculate: (inp) => {
      const n = Number(inp.n), r = Number(inp.r);
      let res = 1;
      for (let i = 1; i <= r; i++) {
        res = (res * (n - i + 1)) / i;
      }
      return Math.round(res);
    },
    testCases: [
      { name: '10 C 3 = 120', inputs: { n: 10, r: 3 }, expectedPrimary: 120 },
      { name: '52 C 5 = 2598960', inputs: { n: 52, r: 5 }, expectedPrimary: 2598960 }
    ]
  },

  // 12. Permutations nPr
  'permutations-npr-calc': {
    id: 'permutations-npr-calc',
    name: 'Permutations Calculator (nPr)',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    independentCalculate: (inp) => {
      const n = Number(inp.n), r = Number(inp.r);
      let res = 1;
      for (let i = 0; i < r; i++) {
        res *= (n - i);
      }
      return res;
    },
    testCases: [
      { name: '5 P 3 = 60', inputs: { n: 5, r: 3 }, expectedPrimary: 60 }
    ]
  },

  // 13. Single Event Probability
  'probability-single-event': {
    id: 'probability-single-event',
    name: 'Single Event Probability',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    independentCalculate: (inp) => (Number(inp.favorable) / Number(inp.totalOutcomes)) * 100,
    testCases: [
      { name: '1 die roll of 6 = 16.67%', inputs: { favorable: 1, totalOutcomes: 6 }, expectedPrimary: (1 / 6) * 100, tolerance: 0.01 }
    ]
  },

  // 14. Conditional Probability
  'conditional-probability-calc': {
    id: 'conditional-probability-calc',
    name: 'Conditional Probability P(A|B)',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    independentCalculate: (inp) => (Number(inp.pAandB) / Number(inp.pB)) * 100,
    testCases: [
      { name: 'P(A and B)=0.2, P(B)=0.5 -> 40%', inputs: { pAandB: 0.2, pB: 0.5 }, expectedPrimary: 40 }
    ]
  },

  // 15. Binomial Probability
  'binomial-probability-calc': {
    id: 'binomial-probability-calc',
    name: 'Binomial Probability Distribution',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    independentCalculate: (inp) => {
      const n = Number(inp.trials), k = Number(inp.successes), p = Number(inp.prob);
      let nCr = 1;
      for (let i = 1; i <= k; i++) nCr = (nCr * (n - i + 1)) / i;
      return nCr * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },
    testCases: [
      { name: 'n=5, k=3, p=0.5 -> 0.3125', inputs: { trials: 5, successes: 3, prob: 0.5 }, expectedPrimary: 0.3125 }
    ]
  },

  // 16. Poisson Distribution
  'poisson-distribution-calc': {
    id: 'poisson-distribution-calc',
    name: 'Poisson Distribution Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => {
      const l = Number(inp.lambda), k = Number(inp.k);
      let fact = 1;
      for (let i = 2; i <= k; i++) fact *= i;
      return (Math.exp(-l) * Math.pow(l, k)) / fact;
    },
    testCases: [
      { name: 'lambda=3, k=2 -> 0.2240', inputs: { lambda: 3, k: 2 }, expectedPrimary: (Math.exp(-3) * 9) / 2, tolerance: 0.001 }
    ]
  },

  // 17. Bayes Theorem
  'bayes-theorem-calc': {
    id: 'bayes-theorem-calc',
    name: 'Bayes’ Theorem Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => {
      const pA = Number(inp.priorA);
      const pBgivenA = Number(inp.pBgivenA);
      const pBgivenNotA = Number(inp.pBgivenNotA);
      const numerator = pBgivenA * pA;
      const denom = numerator + pBgivenNotA * (1 - pA);
      return (numerator / denom) * 100;
    },
    testCases: [
      { name: 'Medical test Bayes: prior=0.01, sens=0.99, falsepos=0.05', inputs: { priorA: 0.01, pBgivenA: 0.99, pBgivenNotA: 0.05 }, expectedPrimary: (0.99 * 0.01) / (0.99 * 0.01 + 0.05 * 0.99) * 100, tolerance: 0.01 }
    ]
  },

  // 18. Expected Value
  'expected-value-calc': {
    id: 'expected-value-calc',
    name: 'Expected Value E(X) Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => Number(inp.x1) * Number(inp.p1) + Number(inp.x2) * Number(inp.p2) + Number(inp.x3) * Number(inp.p3),
    testCases: [
      { name: 'E(X) = 10*0.5 + 20*0.3 + 30*0.2 = 17', inputs: { x1: 10, p1: 0.5, x2: 20, p2: 0.3, x3: 30, p3: 0.2 }, expectedPrimary: 17 }
    ]
  },

  // 19. Confidence Interval Mean
  'confidence-interval-mean': {
    id: 'confidence-interval-mean',
    name: 'Confidence Interval for the Mean',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => {
      const x = Number(inp.sampleMean);
      const s = Number(inp.stdDev);
      const n = Number(inp.sampleSize);
      const z = Number(inp.zVal);
      return z * (s / Math.sqrt(n)); // margin of error
    },
    testCases: [
      { name: 'x=50, s=10, n=100, z=1.96 -> MOE=1.96', inputs: { sampleMean: 50, stdDev: 10, sampleSize: 100, zVal: 1.96 }, expectedPrimary: 1.96 }
    ]
  },

  // 20. Student's t-Distribution
  'students-t-distribution': {
    id: 'students-t-distribution',
    name: 'Student’s t-Score Statistic Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    independentCalculate: (inp) => {
      const x = Number(inp.sampleMean);
      const mu = Number(inp.popMean);
      const s = Number(inp.sampleStdDev);
      const n = Number(inp.sampleSize);
      return (x - mu) / (s / Math.sqrt(n));
    },
    testCases: [
      { name: 'x=105, mu=100, s=15, n=25 -> t=1.667', inputs: { sampleMean: 105, popMean: 100, sampleStdDev: 15, sampleSize: 25 }, expectedPrimary: 5 / (15 / 5), tolerance: 0.01 }
    ]
  },

  // 21. Chi-Square Statistic
  'chi-square-statistic': {
    id: 'chi-square-statistic',
    name: 'Chi-Square Goodness-of-Fit Statistic',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    independentCalculate: (inp) => {
      const o1 = Number(inp.o1), e1 = Number(inp.e1);
      const o2 = Number(inp.o2), e2 = Number(inp.e2);
      return Math.pow(o1 - e1, 2) / e1 + Math.pow(o2 - e2, 2) / e2;
    },
    testCases: [
      { name: 'o1=45, e1=50, o2=55, e2=50 -> chi=1.0', inputs: { o1: 45, e1: 50, o2: 55, e2: 50 }, expectedPrimary: 1.0 }
    ]
  },

  // 22. Pearson Correlation
  'pearson-correlation-calc': {
    id: 'pearson-correlation-calc',
    name: 'Pearson Correlation Coefficient (r)',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    independentCalculate: (inp) => {
      const x = [inp.x1, inp.x2, inp.x3, inp.x4, inp.x5].map(Number);
      const y = [inp.y1, inp.y2, inp.y3, inp.y4, inp.y5].map(Number);
      const n = x.length;
      const mx = x.reduce((a, b) => a + b, 0) / n;
      const my = y.reduce((a, b) => a + b, 0) / n;
      let num = 0, dx2 = 0, dy2 = 0;
      for (let i = 0; i < n; i++) {
        const dx = x[i] - mx;
        const dy = y[i] - my;
        num += dx * dy;
        dx2 += dx * dx;
        dy2 += dy * dy;
      }
      return num / Math.sqrt(dx2 * dy2);
    },
    testCases: [
      { name: 'Perfect positive correlation r = 1.0', inputs: { x1: 1, y1: 2, x2: 2, y2: 4, x3: 3, y3: 6, x4: 4, y4: 8, x5: 5, y5: 10 }, expectedPrimary: 1.0, tolerance: 0.001 }
    ]
  },

  // 23. Linear Regression Least Squares
  'linear-regression-least-squares': {
    id: 'linear-regression-least-squares',
    name: 'Linear Regression (Least Squares) Slope & Intercept',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    independentCalculate: (inp) => {
      const x = [inp.x1, inp.x2, inp.x3, inp.x4].map(Number);
      const y = [inp.y1, inp.y2, inp.y3, inp.y4].map(Number);
      const n = 4;
      const mx = x.reduce((a, b) => a + b, 0) / n;
      const my = y.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (x[i] - mx) * (y[i] - my);
        den += Math.pow(x[i] - mx, 2);
      }
      return num / den; // slope
    },
    testCases: [
      { name: 'y = 2x + 1 -> slope = 2', inputs: { x1: 1, y1: 3, x2: 2, y2: 5, x3: 3, y3: 7, x4: 4, y4: 9 }, expectedPrimary: 2.0 }
    ]
  },

  // 24. Coefficient of Determination R2
  'r-squared-determination': {
    id: 'r-squared-determination',
    name: 'Coefficient of Determination (R²)',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    independentCalculate: (inp) => Math.pow(Number(inp.r), 2) * 100,
    testCases: [
      { name: 'r = 0.9 -> R2 = 81%', inputs: { r: 0.9 }, expectedPrimary: 81 }
    ]
  },

  // ==========================================
  // SCIENTIFIC CALCULATORS (12)
  // ==========================================

  // 25. Scientific Suite (Base)
  'scientific-suite': {
    id: 'scientific-suite',
    name: 'Scientific & Transcendental Functions',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    independentCalculate: (inp) => Math.log(Number(inp.x)),
    testCases: [
      { name: 'ln(e) = 1', inputs: { op: 'ln', x: Math.E }, expectedPrimary: 1.0, tolerance: 0.001 }
    ]
  },

  // 26. Nth Root
  'nth-root-radical': {
    id: 'nth-root-radical',
    name: 'Nth Root & Radical Solver',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    independentCalculate: (inp) => Math.pow(Number(inp.radicand), 1 / Number(inp.nDegree)),
    testCases: [
      { name: 'Cubic root of 27 = 3', inputs: { radicand: 27, nDegree: 3 }, expectedPrimary: 3 }
    ]
  },

  // 27. Exponential Function
  'exponential-function-calc': {
    id: 'exponential-function-calc',
    name: 'Exponential Function (e^x & a^x)',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    independentCalculate: (inp) => Math.exp(Number(inp.x)),
    testCases: [
      { name: 'e^2 = 7.389', inputs: { x: 2 }, expectedPrimary: Math.E * Math.E, tolerance: 0.01 }
    ]
  },

  // 28. Natural Logarithm ln
  'natural-logarithm-ln': {
    id: 'natural-logarithm-ln',
    name: 'Natural Logarithm (ln x)',
    category: 'scientific',
    subcategoryId: 'logarithms',
    independentCalculate: (inp) => Math.log(Number(inp.x)),
    testCases: [
      { name: 'ln(10) = 2.3026', inputs: { x: 10 }, expectedPrimary: Math.log(10), tolerance: 0.001 }
    ]
  },

  // 29. Common Logarithm log10
  'common-logarithm-log10': {
    id: 'common-logarithm-log10',
    name: 'Common Logarithm (log₁₀ x)',
    category: 'scientific',
    subcategoryId: 'logarithms',
    independentCalculate: (inp) => Math.log10(Number(inp.x)),
    testCases: [
      { name: 'log10(1000) = 3', inputs: { x: 1000 }, expectedPrimary: 3 }
    ]
  },

  // 30. Arbitrary Base Log
  'arbitrary-base-log': {
    id: 'arbitrary-base-log',
    name: 'Arbitrary Base Logarithm (log_b x)',
    category: 'scientific',
    subcategoryId: 'logarithms',
    independentCalculate: (inp) => Math.log(Number(inp.x)) / Math.log(Number(inp.base)),
    testCases: [
      { name: 'log2(64) = 6', inputs: { x: 64, base: 2 }, expectedPrimary: 6 }
    ]
  },

  // 31. Power of Ten
  'power-of-ten-scientific': {
    id: 'power-of-ten-scientific',
    name: 'Powers of 10 & Metric Prefixes',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    independentCalculate: (inp) => Math.pow(10, Number(inp.power)),
    testCases: [
      { name: '10^6 = 1,000,000 (Mega)', inputs: { power: 6 }, expectedPrimary: 1000000 }
    ]
  },

  // 32. Half-Life Decay
  'half-life-decay-calc': {
    id: 'half-life-decay-calc',
    name: 'Radioactive Half-Life Decay',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    independentCalculate: (inp) => Number(inp.initialAmount) * Math.pow(0.5, Number(inp.elapsedTime) / Number(inp.halfLife)),
    testCases: [
      { name: '100g with half life 5 after 10 years = 25g', inputs: { initialAmount: 100, elapsedTime: 10, halfLife: 5 }, expectedPrimary: 25 }
    ]
  },

  // 33. Arithmetic Progression Sum
  'arithmetic-progression-sum': {
    id: 'arithmetic-progression-sum',
    name: 'Arithmetic Progression (AP) Sum',
    category: 'scientific',
    subcategoryId: 'constants-sequences',
    independentCalculate: (inp) => {
      const a = Number(inp.firstTerm), d = Number(inp.commonDiff), n = Number(inp.numTerms);
      return (n / 2) * (2 * a + (n - 1) * d);
    },
    testCases: [
      { name: '1, 2, 3... 10 -> Sum = 55', inputs: { firstTerm: 1, commonDiff: 1, numTerms: 10 }, expectedPrimary: 55 }
    ]
  },

  // 34. Geometric Progression Sum
  'geometric-progression-sum': {
    id: 'geometric-progression-sum',
    name: 'Geometric Progression (GP) Sum',
    category: 'scientific',
    subcategoryId: 'constants-sequences',
    independentCalculate: (inp) => {
      const a = Number(inp.firstTerm), r = Number(inp.commonRatio), n = Number(inp.numTerms);
      return (a * (1 - Math.pow(r, n))) / (1 - r);
    },
    testCases: [
      { name: '1 + 2 + 4 + 8 = 15', inputs: { firstTerm: 1, commonRatio: 2, numTerms: 4 }, expectedPrimary: 15 }
    ]
  },

  // 35. Fibonacci Term
  'fibonacci-sequence-term': {
    id: 'fibonacci-sequence-term',
    name: 'Fibonacci Sequence Term Generator',
    category: 'scientific',
    subcategoryId: 'constants-sequences',
    independentCalculate: (inp) => {
      const n = Number(inp.termN);
      if (n <= 1) return n;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        const c = a + b;
        a = b;
        b = c;
      }
      return b;
    },
    testCases: [
      { name: 'Fibonacci(10) = 55', inputs: { termN: 10 }, expectedPrimary: 55 }
    ]
  },

  // 36. Hyperbolic Functions
  'hyperbolic-functions-calc': {
    id: 'hyperbolic-functions-calc',
    name: 'Hyperbolic Functions (sinh, cosh, tanh)',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    independentCalculate: (inp) => Math.sinh(Number(inp.x)),
    testCases: [
      { name: 'sinh(1) = 1.1752', inputs: { x: 1 }, expectedPrimary: Math.sinh(1), tolerance: 0.001 }
    ]
  }
};
