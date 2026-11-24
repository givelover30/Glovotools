import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH3_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Variance Calculator
  {
    id: 'variance-calc',
    name: 'Variance Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Statistical Variance',
      formulaExpression: 's² = Σ(x - x̄)² / (n - 1)',
      variables: [{ symbol: 'x', name: 'Sample values' }]
    },
    inputSchema: {
      fields: [
        { name: 'v1', label: 'Value 1', type: 'number', required: true, defaultValue: 10 },
        { name: 'v2', label: 'Value 2', type: 'number', required: true, defaultValue: 15 },
        { name: 'v3', label: 'Value 3', type: 'number', required: true, defaultValue: 20 },
        { name: 'v4', label: 'Value 4', type: 'number', required: true, defaultValue: 25 },
        { name: 'v5', label: 'Value 5', type: 'number', required: true, defaultValue: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { v1: number; v2: number; v3: number; v4: number; v5: number }) => {
      const arr = [inputs.v1, inputs.v2, inputs.v3, inputs.v4, inputs.v5];
      const sampleVar = FormulaEngine.variance(arr, true);
      const popVar = FormulaEngine.variance(arr, false);
      const mean = FormulaEngine.mean(arr);
      return { sampleVar, popVar, mean };
    },
    formatResult: (result: { sampleVar: number; popVar: number; mean: number }) => ({
      primary: {
        label: 'Sample Variance (s²)',
        value: ResultFormatter.formatDecimal(result.sampleVar),
        numericValue: result.sampleVar
      },
      secondary: [
        { label: 'Population Variance (σ²)', value: ResultFormatter.formatDecimal(result.popVar) },
        { label: 'Mean', value: ResultFormatter.formatDecimal(result.mean) }
      ]
    })
  },

  // 2. Standard Deviation
  {
    id: 'standard-deviation',
    name: 'Standard Deviation Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Standard Deviation',
      formulaExpression: 's = √(Σ(x - x̄)² / (n - 1))',
      variables: [{ symbol: 's', name: 'Standard deviation' }]
    },
    inputSchema: {
      fields: [
        { name: 'v1', label: 'Sample 1', type: 'number', required: true, defaultValue: 12 },
        { name: 'v2', label: 'Sample 2', type: 'number', required: true, defaultValue: 15 },
        { name: 'v3', label: 'Sample 3', type: 'number', required: true, defaultValue: 18 },
        { name: 'v4', label: 'Sample 4', type: 'number', required: true, defaultValue: 22 },
        { name: 'v5', label: 'Sample 5', type: 'number', required: true, defaultValue: 28 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { v1: number; v2: number; v3: number; v4: number; v5: number }) => {
      const arr = [inputs.v1, inputs.v2, inputs.v3, inputs.v4, inputs.v5];
      const sampleSD = FormulaEngine.standardDeviation(arr, true);
      const popSD = FormulaEngine.standardDeviation(arr, false);
      const mean = FormulaEngine.mean(arr);
      return { sampleSD, popSD, mean };
    },
    formatResult: (result: { sampleSD: number; popSD: number; mean: number }) => ({
      primary: {
        label: 'Sample Standard Deviation (s)',
        value: ResultFormatter.formatDecimal(result.sampleSD, 4),
        numericValue: result.sampleSD
      },
      secondary: [
        { label: 'Population Std Dev (σ)', value: ResultFormatter.formatDecimal(result.popSD, 4) },
        { label: 'Sample Mean (x̄)', value: ResultFormatter.formatDecimal(result.mean) }
      ]
    })
  },

  // 3. Mean Median Mode
  {
    id: 'mean-median-mode',
    name: 'Mean, Median & Mode Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Measures of Central Tendency',
      formulaExpression: 'Mean = Σx/n, Median = middle, Mode = frequency',
      variables: [{ symbol: 'x', name: 'Data points' }]
    },
    inputSchema: {
      fields: [
        { name: 'v1', label: 'Number 1', type: 'number', required: true, defaultValue: 10 },
        { name: 'v2', label: 'Number 2', type: 'number', required: true, defaultValue: 20 },
        { name: 'v3', label: 'Number 3', type: 'number', required: true, defaultValue: 20 },
        { name: 'v4', label: 'Number 4', type: 'number', required: true, defaultValue: 30 },
        { name: 'v5', label: 'Number 5', type: 'number', required: true, defaultValue: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { v1: number; v2: number; v3: number; v4: number; v5: number }) => {
      const arr = [inputs.v1, inputs.v2, inputs.v3, inputs.v4, inputs.v5];
      const stats = FormulaEngine.statistics(arr);
      return { mean: stats.mean, median: stats.median, mode: stats.mode };
    },
    formatResult: (result: { mean: number; median: number; mode: number[] }) => ({
      primary: {
        label: 'Arithmetic Mean (Average)',
        value: ResultFormatter.formatDecimal(result.mean),
        numericValue: result.mean
      },
      secondary: [
        { label: 'Median', value: ResultFormatter.formatDecimal(result.median) },
        { label: 'Mode', value: result.mode.length > 0 ? result.mode.join(', ') : 'No unique mode' }
      ]
    })
  },

  // 4. Geometric Mean
  {
    id: 'geometric-mean',
    name: 'Geometric Mean Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Geometric Mean',
      formulaExpression: 'GM = (x₁ * x₂ * ... * xₙ)^(1/n)',
      variables: [{ symbol: 'x', name: 'Positive factors' }]
    },
    inputSchema: {
      fields: [
        { name: 'v1', label: 'Factor 1', type: 'number', required: true, defaultValue: 4, min: 0.0001 },
        { name: 'v2', label: 'Factor 2', type: 'number', required: true, defaultValue: 9, min: 0.0001 },
        { name: 'v3', label: 'Factor 3', type: 'number', required: true, defaultValue: 16, min: 0.0001 }
      ]
    },
    validate: (inputs: { v1: number; v2: number; v3: number }) => {
      if (inputs.v1 <= 0 || inputs.v2 <= 0 || inputs.v3 <= 0) return [{ field: 'v1', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Values must be strictly positive.' }];
      return [];
    },
    calculate: (inputs: { v1: number; v2: number; v3: number }) => {
      const prod = inputs.v1 * inputs.v2 * inputs.v3;
      const gm = PrecisionEngine.clean(Math.pow(prod, 1 / 3));
      return { gm, prod };
    },
    formatResult: (result: { gm: number; prod: number }) => ({
      primary: {
        label: 'Geometric Mean',
        value: ResultFormatter.formatDecimal(result.gm, 4),
        numericValue: result.gm
      },
      secondary: [
        { label: 'Product Total', value: ResultFormatter.formatDecimal(result.prod) }
      ]
    })
  },

  // 5. Harmonic Mean
  {
    id: 'harmonic-mean',
    name: 'Harmonic Mean Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Harmonic Reciprocal Mean',
      formulaExpression: 'H = n / Σ(1 / xᵢ)',
      variables: [{ symbol: 'x', name: 'Rates/Speeds' }]
    },
    inputSchema: {
      fields: [
        { name: 'rate1', label: 'Rate 1 (e.g. 40 mph)', type: 'number', required: true, defaultValue: 40, min: 0.0001 },
        { name: 'rate2', label: 'Rate 2 (e.g. 60 mph)', type: 'number', required: true, defaultValue: 60, min: 0.0001 }
      ]
    },
    validate: (inputs: { rate1: number; rate2: number }) => {
      if (inputs.rate1 <= 0 || inputs.rate2 <= 0) return [{ field: 'rate1', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Rates must be > 0.' }];
      return [];
    },
    calculate: (inputs: { rate1: number; rate2: number }) => {
      const h = PrecisionEngine.clean(2 / (1 / inputs.rate1 + 1 / inputs.rate2));
      return { h };
    },
    formatResult: (result: { h: number }) => ({
      primary: {
        label: 'Harmonic Mean',
        value: ResultFormatter.formatDecimal(result.h, 2),
        numericValue: result.h
      }
    })
  },

  // 6. Weighted Average
  {
    id: 'weighted-average',
    name: 'Weighted Average & Grade Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Weighted Arithmetic Mean',
      formulaExpression: 'x̄_w = Σ(wᵢ * xᵢ) / Σwᵢ',
      variables: [{ symbol: 'x', name: 'Score' }, { symbol: 'w', name: 'Weight' }]
    },
    inputSchema: {
      fields: [
        { name: 'score1', label: 'Score 1', type: 'number', required: true, defaultValue: 85 },
        { name: 'weight1', label: 'Weight 1 (%)', type: 'number', required: true, defaultValue: 20 },
        { name: 'score2', label: 'Score 2', type: 'number', required: true, defaultValue: 90 },
        { name: 'weight2', label: 'Weight 2 (%)', type: 'number', required: true, defaultValue: 30 },
        { name: 'score3', label: 'Score 3', type: 'number', required: true, defaultValue: 78 },
        { name: 'weight3', label: 'Weight 3 (%)', type: 'number', required: true, defaultValue: 50 }
      ]
    },
    validate: (inputs: { weight1: number; weight2: number; weight3: number }) => {
      const sumW = inputs.weight1 + inputs.weight2 + inputs.weight3;
      if (sumW === 0) return [{ field: 'weight1', code: 'DIVISION_BY_ZERO', message: 'Total weight cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { score1: number; weight1: number; score2: number; weight2: number; score3: number; weight3: number }) => {
      const sumProd = inputs.score1 * inputs.weight1 + inputs.score2 * inputs.weight2 + inputs.score3 * inputs.weight3;
      const sumWeight = inputs.weight1 + inputs.weight2 + inputs.weight3;
      const weightedAvg = PrecisionEngine.clean(sumProd / sumWeight);
      return { weightedAvg, sumWeight };
    },
    formatResult: (result: { weightedAvg: number; sumWeight: number }) => ({
      primary: {
        label: 'Weighted Average Score',
        value: ResultFormatter.formatDecimal(result.weightedAvg, 2),
        numericValue: result.weightedAvg
      },
      secondary: [
        { label: 'Total Weight Sum', value: `${result.sumWeight}%` }
      ]
    })
  },

  // 7. Interquartile Range (IQR)
  {
    id: 'interquartile-range',
    name: 'Interquartile Range (IQR) Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Interquartile Range (IQR)',
      formulaExpression: 'IQR = Q₃ - Q₁',
      variables: [{ symbol: 'Q₁, Q₃', name: 'Quartiles' }]
    },
    inputSchema: {
      fields: [
        { name: 'q1', label: 'First Quartile (Q₁)', type: 'number', required: true, defaultValue: 25 },
        { name: 'q3', label: 'Third Quartile (Q₃)', type: 'number', required: true, defaultValue: 65 }
      ]
    },
    validate: (inputs: { q1: number; q3: number }) => {
      if (inputs.q1 > inputs.q3) return [{ field: 'q1', code: 'RANGE_OUT_OF_BOUNDS', message: 'Q1 cannot be greater than Q3.' }];
      return [];
    },
    calculate: (inputs: { q1: number; q3: number }) => {
      const iqr = PrecisionEngine.clean(inputs.q3 - inputs.q1);
      const lowerFence = PrecisionEngine.clean(inputs.q1 - 1.5 * iqr);
      const upperFence = PrecisionEngine.clean(inputs.q3 + 1.5 * iqr);
      return { iqr, lowerFence, upperFence };
    },
    formatResult: (result: { iqr: number; lowerFence: number; upperFence: number }) => ({
      primary: {
        label: 'Interquartile Range (IQR)',
        value: ResultFormatter.formatDecimal(result.iqr),
        numericValue: result.iqr
      },
      secondary: [
        { label: 'Lower Outlier Fence (<)', value: ResultFormatter.formatDecimal(result.lowerFence) },
        { label: 'Upper Outlier Fence (>)', value: ResultFormatter.formatDecimal(result.upperFence) }
      ]
    })
  },

  // 8. Z-Score
  {
    id: 'z-score',
    name: 'Z-Score & Standard Normal Score Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Standard Score Transformation',
      formulaExpression: 'z = (x - μ) / σ',
      variables: [{ symbol: 'x', name: 'Raw score' }, { symbol: 'μ', name: 'Mean' }, { symbol: 'σ', name: 'Std dev' }]
    },
    inputSchema: {
      fields: [
        { name: 'rawScore', label: 'Raw Score (x)', type: 'number', required: true, defaultValue: 82 },
        { name: 'mean', label: 'Population Mean (μ)', type: 'number', required: true, defaultValue: 70 },
        { name: 'stdDev', label: 'Standard Deviation (σ)', type: 'number', required: true, defaultValue: 8, min: 0.0001 }
      ]
    },
    validate: (inputs: { stdDev: number }) => {
      if (inputs.stdDev <= 0) return [{ field: 'stdDev', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Standard deviation must be > 0.' }];
      return [];
    },
    calculate: (inputs: { rawScore: number; mean: number; stdDev: number }) => {
      const z = PrecisionEngine.clean((inputs.rawScore - inputs.mean) / inputs.stdDev);
      return { z };
    },
    formatResult: (result: { z: number }) => ({
      primary: {
        label: 'Standard Score (z)',
        value: ResultFormatter.formatDecimal(result.z, 2),
        numericValue: result.z
      }
    })
  },

  // 9. Normal Distribution
  {
    id: 'normal-distribution',
    name: 'Normal Distribution Probability Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Gaussian Probability Density Function',
      formulaExpression: 'f(x) = (1 / (σ√(2π))) * e^(-½((x-μ)/σ)²)',
      variables: [{ symbol: 'μ', name: 'Mean' }, { symbol: 'σ', name: 'Std dev' }]
    },
    inputSchema: {
      fields: [
        { name: 'x', label: 'Value (x)', type: 'number', required: true, defaultValue: 100 },
        { name: 'mean', label: 'Mean (μ)', type: 'number', required: true, defaultValue: 100 },
        { name: 'stdDev', label: 'Standard Deviation (σ)', type: 'number', required: true, defaultValue: 15, min: 0.001 }
      ]
    },
    validate: (inputs: { stdDev: number }) => {
      if (inputs.stdDev <= 0) return [{ field: 'stdDev', code: 'POSITIVE_NUMBER_REQUIRED', message: 'σ must be > 0.' }];
      return [];
    },
    calculate: (inputs: { x: number; mean: number; stdDev: number }) => {
      const z = (inputs.x - inputs.mean) / inputs.stdDev;
      const pdf = PrecisionEngine.clean((1 / (inputs.stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z));
      return { pdf, z: PrecisionEngine.clean(z) };
    },
    formatResult: (result: { pdf: number; z: number }) => ({
      primary: {
        label: 'Probability Density f(x)',
        value: ResultFormatter.formatDecimal(result.pdf, 5),
        numericValue: result.pdf
      },
      secondary: [
        { label: 'Standard Score (z)', value: ResultFormatter.formatDecimal(result.z, 2) }
      ]
    })
  },

  // 10. Binomial Probability
  {
    id: 'binomial-distribution',
    name: 'Binomial Probability Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Binomial Mass Function',
      formulaExpression: 'P(X = k) = C(n, k) * p^k * (1-p)^(n-k)',
      variables: [{ symbol: 'n', name: 'Trials' }, { symbol: 'k', name: 'Successes' }, { symbol: 'p', name: 'Probability' }]
    },
    inputSchema: {
      fields: [
        { name: 'trials', label: 'Number of Trials (n)', type: 'integer', required: true, defaultValue: 10, min: 1, max: 100 },
        { name: 'successes', label: 'Number of Successes (k)', type: 'integer', required: true, defaultValue: 4, min: 0 },
        { name: 'prob', label: 'Single Trial Probability (p)', type: 'percentage', required: true, defaultValue: 50, min: 0, max: 100 }
      ]
    },
    validate: (inputs: { trials: number; successes: number }) => {
      if (inputs.successes > inputs.trials) return [{ field: 'successes', code: 'RANGE_OUT_OF_BOUNDS', message: 'Successes cannot exceed trials.' }];
      return [];
    },
    calculate: (inputs: { trials: number; successes: number; prob: number }) => {
      const p = inputs.prob / 100;
      const n = inputs.trials;
      const k = inputs.successes;
      const nCr = FormulaEngine.combinations(n, k);
      const probExact = PrecisionEngine.clean(nCr * Math.pow(p, k) * Math.pow(1 - p, n - k));
      const expectedMean = PrecisionEngine.clean(n * p);
      return { probExact, expectedMean };
    },
    formatResult: (result: { probExact: number; expectedMean: number }) => ({
      primary: {
        label: 'Exact Probability P(X = k)',
        value: ResultFormatter.formatPercentage(result.probExact * 100, 2),
        numericValue: result.probExact
      },
      secondary: [
        { label: 'Expected Value E(X) = n*p', value: ResultFormatter.formatDecimal(result.expectedMean) }
      ]
    })
  },

  // 11. Poisson Distribution
  {
    id: 'poisson-distribution',
    name: 'Poisson Distribution Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Poisson Probability Function',
      formulaExpression: 'P(X = k) = (λ^k * e^-λ) / k!',
      variables: [{ symbol: 'λ', name: 'Average arrival rate' }, { symbol: 'k', name: 'Observed events' }]
    },
    inputSchema: {
      fields: [
        { name: 'lambda', label: 'Average Arrival Rate (λ)', type: 'number', required: true, defaultValue: 3.5, min: 0 },
        { name: 'k', label: 'Actual Occurrences (k)', type: 'integer', required: true, defaultValue: 2, min: 0 }
      ]
    },
    validate: (inputs: { lambda: number }) => {
      if (inputs.lambda <= 0) return [{ field: 'lambda', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Lambda must be > 0.' }];
      return [];
    },
    calculate: (inputs: { lambda: number; k: number }) => {
      const num = Math.pow(inputs.lambda, inputs.k) * Math.exp(-inputs.lambda);
      const den = FormulaEngine.factorial(inputs.k);
      const prob = PrecisionEngine.clean(num / den);
      return { prob };
    },
    formatResult: (result: { prob: number }) => ({
      primary: {
        label: 'Poisson Probability P(X = k)',
        value: ResultFormatter.formatPercentage(result.prob * 100, 2),
        numericValue: result.prob
      }
    })
  },

  // 12. Permutations
  {
    id: 'permutations-calc',
    name: 'Permutations Calculator (nPr)',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    formulaMeta: {
      formulaName: 'Permutations Without Repetition',
      formulaExpression: 'nPr = n! / (n - r)!',
      variables: [{ symbol: 'n', name: 'Total items' }, { symbol: 'r', name: 'Selected items' }]
    },
    inputSchema: {
      fields: [
        { name: 'n', label: 'Total Number of Elements (n)', type: 'integer', required: true, defaultValue: 8, min: 1, max: 15 },
        { name: 'r', label: 'Number of Items Ordered (r)', type: 'integer', required: true, defaultValue: 3, min: 0 }
      ]
    },
    validate: (inputs: { n: number; r: number }) => {
      if (inputs.r > inputs.n) return [{ field: 'r', code: 'RANGE_OUT_OF_BOUNDS', message: 'r cannot be greater than n.' }];
      return [];
    },
    calculate: (inputs: { n: number; r: number }) => {
      const permutations = FormulaEngine.permutations(inputs.n, inputs.r);
      return { permutations };
    },
    formatResult: (result: { permutations: number }) => ({
      primary: {
        label: 'Total Permutations (nPr)',
        value: ResultFormatter.formatInteger(result.permutations),
        numericValue: result.permutations
      }
    })
  },

  // 13. Combinations
  {
    id: 'combinations-calc',
    name: 'Combinations Calculator (nCr)',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    formulaMeta: {
      formulaName: 'Combinations Without Repetition',
      formulaExpression: 'nCr = n! / (r! * (n - r)!)',
      variables: [{ symbol: 'n', name: 'Total elements' }, { symbol: 'r', name: 'Chosen elements' }]
    },
    inputSchema: {
      fields: [
        { name: 'n', label: 'Total Elements (n)', type: 'integer', required: true, defaultValue: 10, min: 1, max: 20 },
        { name: 'r', label: 'Chosen Elements (r)', type: 'integer', required: true, defaultValue: 4, min: 0 }
      ]
    },
    validate: (inputs: { n: number; r: number }) => {
      if (inputs.r > inputs.n) return [{ field: 'r', code: 'RANGE_OUT_OF_BOUNDS', message: 'r cannot exceed n.' }];
      return [];
    },
    calculate: (inputs: { n: number; r: number }) => {
      const combinations = FormulaEngine.combinations(inputs.n, inputs.r);
      return { combinations };
    },
    formatResult: (result: { combinations: number }) => ({
      primary: {
        label: 'Total Combinations (nCr)',
        value: ResultFormatter.formatInteger(result.combinations),
        numericValue: result.combinations
      }
    })
  },

  // 14. Single Event Probability
  {
    id: 'probability-calc',
    name: 'Single Event Probability & Odds Calculator',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    formulaMeta: {
      formulaName: 'Classical Theoretical Probability',
      formulaExpression: 'P(E) = n(E) / n(S)',
      variables: [{ symbol: 'n(E)', name: 'Favorable outcomes' }, { symbol: 'n(S)', name: 'Sample space' }]
    },
    inputSchema: {
      fields: [
        { name: 'favorable', label: 'Favorable Outcomes n(E)', type: 'integer', required: true, defaultValue: 1, min: 0 },
        { name: 'total', label: 'Total Possible Outcomes n(S)', type: 'integer', required: true, defaultValue: 6, min: 1 }
      ]
    },
    validate: (inputs: { favorable: number; total: number }) => {
      if (inputs.favorable > inputs.total) return [{ field: 'favorable', code: 'RANGE_OUT_OF_BOUNDS', message: 'Favorable outcomes cannot exceed total outcomes.' }];
      return [];
    },
    calculate: (inputs: { favorable: number; total: number }) => {
      const prob = PrecisionEngine.clean(inputs.favorable / inputs.total);
      const complement = PrecisionEngine.clean(1 - prob);
      const odds = inputs.total > inputs.favorable ? `${inputs.favorable} to ${inputs.total - inputs.favorable}` : 'Certain';
      return { prob, complement, odds };
    },
    formatResult: (result: { prob: number; complement: number; odds: string }) => ({
      primary: {
        label: 'Probability of Event',
        value: ResultFormatter.formatPercentage(result.prob * 100, 2),
        numericValue: result.prob
      },
      secondary: [
        { label: 'Complement P(not E)', value: ResultFormatter.formatPercentage(result.complement * 100, 2) },
        { label: 'Odds in Favor', value: result.odds }
      ]
    })
  },

  // 15. Bayes' Theorem
  {
    id: 'bayes-theorem',
    name: "Bayes' Theorem Probability Calculator",
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    formulaMeta: {
      formulaName: "Bayes' Rule for Conditional Probability",
      formulaExpression: 'P(A|B) = (P(B|A) * P(A)) / P(B)',
      variables: [{ symbol: 'P(A)', name: 'Prior probability' }, { symbol: 'P(B|A)', name: 'Likelihood' }]
    },
    inputSchema: {
      fields: [
        { name: 'priorA', label: 'Prior Probability P(A) %', type: 'percentage', required: true, defaultValue: 2, min: 0, max: 100 },
        { name: 'probBgivenA', label: 'Sensitivity P(B|A) %', type: 'percentage', required: true, defaultValue: 95, min: 0, max: 100 },
        { name: 'probBgivenNotA', label: 'False Alarm P(B|~A) %', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { priorA: number; probBgivenA: number; probBgivenNotA: number }) => {
      const pA = inputs.priorA / 100;
      const pB_A = inputs.probBgivenA / 100;
      const pB_notA = inputs.probBgivenNotA / 100;
      const pB = pB_A * pA + pB_notA * (1 - pA);
      const posterior = pB > 0 ? PrecisionEngine.clean((pB_A * pA) / pB) : 0;
      return { posterior: posterior * 100, totalEvidence: pB * 100 };
    },
    formatResult: (result: { posterior: number; totalEvidence: number }) => ({
      primary: {
        label: 'Posterior Probability P(A|B)',
        value: ResultFormatter.formatPercentage(result.posterior, 2),
        numericValue: result.posterior
      },
      secondary: [
        { label: 'Total Probability P(B)', value: ResultFormatter.formatPercentage(result.totalEvidence, 2) }
      ]
    })
  },

  // 16. Odds Converter
  {
    id: 'odds-converter',
    name: 'Odds & Probability Converter Calculator',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    formulaMeta: {
      formulaName: 'Implied Probability from Decimal Odds',
      formulaExpression: 'Probability% = (1 / Decimal) * 100',
      variables: [{ symbol: 'Decimal', name: 'Decimal odds' }]
    },
    inputSchema: {
      fields: [
        { name: 'decimalOdds', label: 'Decimal Odds', type: 'number', required: true, defaultValue: 2.5, min: 1.01 }
      ]
    },
    validate: (inputs: { decimalOdds: number }) => {
      if (inputs.decimalOdds <= 1.0) return [{ field: 'decimalOdds', code: 'RANGE_OUT_OF_BOUNDS', message: 'Decimal odds must be strictly greater than 1.0.' }];
      return [];
    },
    calculate: (inputs: { decimalOdds: number }) => {
      const impliedPct = PrecisionEngine.clean((1 / inputs.decimalOdds) * 100);
      const moneyline = inputs.decimalOdds >= 2.0
        ? Math.round((inputs.decimalOdds - 1) * 100)
        : Math.round(-100 / (inputs.decimalOdds - 1));
      return { impliedPct, moneyline };
    },
    formatResult: (result: { impliedPct: number; moneyline: number }) => ({
      primary: {
        label: 'Implied Probability',
        value: ResultFormatter.formatPercentage(result.impliedPct, 2),
        numericValue: result.impliedPct
      },
      secondary: [
        { label: 'American Moneyline', value: `${result.moneyline > 0 ? '+' : ''}${result.moneyline}` }
      ]
    })
  },

  // 17. Expected Value E(X)
  {
    id: 'expected-value',
    name: 'Expected Value Calculator E(X)',
    category: 'statistics',
    subcategoryId: 'combinatorics-probability',
    formulaMeta: {
      formulaName: 'Discrete Expectation',
      formulaExpression: 'E(X) = Σ(xᵢ * P(xᵢ))',
      variables: [{ symbol: 'x', name: 'Payoff' }, { symbol: 'P', name: 'Probability' }]
    },
    inputSchema: {
      fields: [
        { name: 'payoff1', label: 'Outcome 1 Payoff ($)', type: 'number', required: true, defaultValue: 100 },
        { name: 'prob1', label: 'Probability 1 (%)', type: 'percentage', required: true, defaultValue: 30 },
        { name: 'payoff2', label: 'Outcome 2 Payoff ($)', type: 'number', required: true, defaultValue: -20 },
        { name: 'prob2', label: 'Probability 2 (%)', type: 'percentage', required: true, defaultValue: 70 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { payoff1: number; prob1: number; payoff2: number; prob2: number }) => {
      const ev = PrecisionEngine.clean(inputs.payoff1 * (inputs.prob1 / 100) + inputs.payoff2 * (inputs.prob2 / 100));
      return { ev };
    },
    formatResult: (result: { ev: number }) => ({
      primary: {
        label: 'Expected Value E(X)',
        value: ResultFormatter.formatCurrency(result.ev),
        numericValue: result.ev
      }
    })
  },

  // 18. Linear Regression
  {
    id: 'linear-regression',
    name: 'Linear Regression Trendline Calculator',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    formulaMeta: {
      formulaName: 'Least Squares Linear Fit',
      formulaExpression: 'y = mx + b',
      variables: [{ symbol: 'm', name: 'Slope' }, { symbol: 'b', name: 'Y-Intercept' }]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'x₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'y1', label: 'y₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'x2', label: 'x₂', type: 'number', required: true, defaultValue: 2 },
        { name: 'y2', label: 'y₂', type: 'number', required: true, defaultValue: 5 },
        { name: 'x3', label: 'x₃', type: 'number', required: true, defaultValue: 3 },
        { name: 'y3', label: 'y₃', type: 'number', required: true, defaultValue: 7 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }) => {
      const xs = [inputs.x1, inputs.x2, inputs.x3];
      const ys = [inputs.y1, inputs.y2, inputs.y3];
      const n = 3;
      const sumX = xs.reduce((a, b) => a + b, 0);
      const sumY = ys.reduce((a, b) => a + b, 0);
      const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
      const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
      const m = PrecisionEngine.clean((n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX));
      const b = PrecisionEngine.clean((sumY - m * sumX) / n);
      return { m, b };
    },
    formatResult: (result: { m: number; b: number }) => ({
      primary: {
        label: 'Trendline Equation',
        value: `y = ${ResultFormatter.formatDecimal(result.m)}x + ${ResultFormatter.formatDecimal(result.b)}`,
        numericValue: result.m
      },
      secondary: [
        { label: 'Slope (m)', value: ResultFormatter.formatDecimal(result.m) },
        { label: 'Intercept (b)', value: ResultFormatter.formatDecimal(result.b) }
      ]
    })
  },

  // 19. Correlation Coefficient
  {
    id: 'correlation-coefficient',
    name: 'Pearson Correlation & R² Calculator',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    formulaMeta: {
      formulaName: 'Pearson Product-Moment Correlation',
      formulaExpression: 'r = Σ((x - x̄)(y - ȳ)) / (√(Σ(x - x̄)²) * √(Σ(y - ȳ)²))',
      variables: [{ symbol: 'r', name: 'Correlation coefficient' }]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'x₁', type: 'number', required: true, defaultValue: 10 },
        { name: 'y1', label: 'y₁', type: 'number', required: true, defaultValue: 20 },
        { name: 'x2', label: 'x₂', type: 'number', required: true, defaultValue: 20 },
        { name: 'y2', label: 'y₂', type: 'number', required: true, defaultValue: 45 },
        { name: 'x3', label: 'x₃', type: 'number', required: true, defaultValue: 30 },
        { name: 'y3', label: 'y₃', type: 'number', required: true, defaultValue: 62 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }) => {
      const xs = [inputs.x1, inputs.x2, inputs.x3];
      const ys = [inputs.y1, inputs.y2, inputs.y3];
      const mx = FormulaEngine.mean(xs);
      const my = FormulaEngine.mean(ys);
      let num = 0;
      let denX = 0;
      let denY = 0;
      for (let i = 0; i < 3; i++) {
        const dx = xs[i] - mx;
        const dy = ys[i] - my;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      const r = PrecisionEngine.clean(num / Math.sqrt(denX * denY));
      const r2 = PrecisionEngine.clean(r * r);
      return { r, r2 };
    },
    formatResult: (result: { r: number; r2: number }) => ({
      primary: {
        label: 'Pearson Correlation (r)',
        value: ResultFormatter.formatDecimal(result.r, 4),
        numericValue: result.r
      },
      secondary: [
        { label: 'R-Squared Fit (R²)', value: ResultFormatter.formatDecimal(result.r2, 4) }
      ]
    })
  },

  // 20. Covariance
  {
    id: 'covariance-calc',
    name: 'Covariance Calculator',
    category: 'statistics',
    subcategoryId: 'regression-correlation',
    formulaMeta: {
      formulaName: 'Sample Covariance',
      formulaExpression: 'Cov(X, Y) = Σ((x - x̄)(y - ȳ)) / (n - 1)',
      variables: [{ symbol: 'Cov', name: 'Covariance' }]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'x₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'y1', label: 'y₁', type: 'number', required: true, defaultValue: 5 },
        { name: 'x2', label: 'x₂', type: 'number', required: true, defaultValue: 4 },
        { name: 'y2', label: 'y₂', type: 'number', required: true, defaultValue: 8 },
        { name: 'x3', label: 'x₃', type: 'number', required: true, defaultValue: 6 },
        { name: 'y3', label: 'y₃', type: 'number', required: true, defaultValue: 14 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }) => {
      const xs = [inputs.x1, inputs.x2, inputs.x3];
      const ys = [inputs.y1, inputs.y2, inputs.y3];
      const mx = FormulaEngine.mean(xs);
      const my = FormulaEngine.mean(ys);
      let sum = 0;
      for (let i = 0; i < 3; i++) sum += (xs[i] - mx) * (ys[i] - my);
      const cov = PrecisionEngine.clean(sum / 2);
      return { cov };
    },
    formatResult: (result: { cov: number }) => ({
      primary: {
        label: 'Sample Covariance',
        value: ResultFormatter.formatDecimal(result.cov, 3),
        numericValue: result.cov
      }
    })
  },

  // 21. Confidence Interval
  {
    id: 'confidence-interval',
    name: 'Confidence Interval Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Normal Mean Confidence Interval',
      formulaExpression: 'CI = x̄ ± z * (s / √n)',
      variables: [{ symbol: 'x̄', name: 'Sample mean' }, { symbol: 'z', name: 'Critical value' }]
    },
    inputSchema: {
      fields: [
        { name: 'mean', label: 'Sample Mean (x̄)', type: 'number', required: true, defaultValue: 50 },
        { name: 'stdDev', label: 'Standard Deviation (s)', type: 'number', required: true, defaultValue: 10, min: 0.001 },
        { name: 'sampleSize', label: 'Sample Size (n)', type: 'integer', required: true, defaultValue: 64, min: 2 },
        {
          name: 'confidenceLevel',
          label: 'Confidence Level',
          type: 'select',
          required: true,
          defaultValue: '95',
          options: [
            { label: '90% (z = 1.645)', value: '90' },
            { label: '95% (z = 1.960)', value: '95' },
            { label: '99% (z = 2.576)', value: '99' }
          ]
        }
      ]
    },
    validate: (inputs: { sampleSize: number }) => {
      if (inputs.sampleSize < 2) return [{ field: 'sampleSize', code: 'RANGE_OUT_OF_BOUNDS', message: 'Sample size must be ≥ 2.' }];
      return [];
    },
    calculate: (inputs: { mean: number; stdDev: number; sampleSize: number; confidenceLevel: string }) => {
      const zMap: Record<string, number> = { '90': 1.645, '95': 1.96, '99': 2.576 };
      const z = zMap[inputs.confidenceLevel] || 1.96;
      const se = inputs.stdDev / Math.sqrt(inputs.sampleSize);
      const moe = PrecisionEngine.clean(z * se);
      const lower = PrecisionEngine.clean(inputs.mean - moe);
      const upper = PrecisionEngine.clean(inputs.mean + moe);
      return { lower, upper, moe };
    },
    formatResult: (result: { lower: number; upper: number; moe: number }) => ({
      primary: {
        label: 'Confidence Interval Bounds',
        value: `[${ResultFormatter.formatDecimal(result.lower)}, ${ResultFormatter.formatDecimal(result.upper)}]`,
        numericValue: result.moe
      },
      secondary: [
        { label: 'Margin of Error (±)', value: `±${ResultFormatter.formatDecimal(result.moe)}` }
      ]
    })
  },

  // 22. Margin of Error
  {
    id: 'margin-of-error',
    name: 'Margin of Error Survey Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Survey Margin of Error',
      formulaExpression: 'MOE = z * √(p(1-p)/n)',
      variables: [{ symbol: 'n', name: 'Sample size' }]
    },
    inputSchema: {
      fields: [
        { name: 'sampleSize', label: 'Sample Size (n)', type: 'integer', required: true, defaultValue: 1000, min: 10 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { sampleSize: number }) => {
      const z = 1.96; // 95% confidence
      const p = 0.5; // worst case variance
      const moe = PrecisionEngine.clean(z * Math.sqrt((p * (1 - p)) / inputs.sampleSize) * 100);
      return { moe };
    },
    formatResult: (result: { moe: number }) => ({
      primary: {
        label: 'Margin of Error (95% Confidence)',
        value: `±${ResultFormatter.formatPercentage(result.moe, 2)}`,
        numericValue: result.moe
      }
    })
  },

  // 23. Sample Size
  {
    id: 'sample-size',
    name: 'Sample Size Determination Calculator',
    category: 'statistics',
    subcategoryId: 'distributions',
    formulaMeta: {
      formulaName: 'Cochran Minimum Sample Size',
      formulaExpression: 'n = (z² * p(1-p)) / e²',
      variables: [{ symbol: 'e', name: 'Margin of error' }]
    },
    inputSchema: {
      fields: [
        { name: 'marginPct', label: 'Desired Margin of Error (%)', type: 'percentage', required: true, defaultValue: 3, min: 0.1, max: 20 }
      ]
    },
    validate: (inputs: { marginPct: number }) => {
      if (inputs.marginPct <= 0) return [{ field: 'marginPct', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Margin must be > 0.' }];
      return [];
    },
    calculate: (inputs: { marginPct: number }) => {
      const z = 1.96;
      const p = 0.5;
      const e = inputs.marginPct / 100;
      const n = Math.ceil((z * z * p * (1 - p)) / (e * e));
      return { n };
    },
    formatResult: (result: { n: number }) => ({
      primary: {
        label: 'Recommended Sample Size',
        value: `${ResultFormatter.formatInteger(result.n)} respondents`,
        numericValue: result.n
      }
    })
  },

  // ==========================================
  // SCIENTIFIC (11 new)
  // ==========================================

  // 24. Scientific Notation
  {
    id: 'scientific-notation',
    name: 'Scientific & Engineering Notation Calculator',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    formulaMeta: {
      formulaName: 'Scientific Exponential Notation',
      formulaExpression: 'N = m * 10ⁿ',
      variables: [{ symbol: 'm', name: 'Mantissa' }, { symbol: 'n', name: 'Order of magnitude' }]
    },
    inputSchema: {
      fields: [
        { name: 'number', label: 'Number to Format', type: 'number', required: true, defaultValue: 4500000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { number: number }) => {
      const sci = inputs.number.toExponential(4);
      return { sci };
    },
    formatResult: (result: { sci: string }) => ({
      primary: {
        label: 'Scientific Notation',
        value: result.sci,
        numericValue: result.sci
      }
    })
  },

  // 25. Logarithm (Any Base)
  {
    id: 'logarithm-base-n',
    name: 'Logarithm Calculator (Any Base)',
    category: 'scientific',
    subcategoryId: 'logarithms',
    formulaMeta: {
      formulaName: 'Arbitrary Base Logarithm',
      formulaExpression: 'log_b(x) = ln(x) / ln(b)',
      variables: [{ symbol: 'b', name: 'Base' }, { symbol: 'x', name: 'Argument' }]
    },
    inputSchema: {
      fields: [
        { name: 'value', label: 'Input Value (x)', type: 'number', required: true, defaultValue: 64, min: 0.0001 },
        { name: 'base', label: 'Log Base (b)', type: 'number', required: true, defaultValue: 2, min: 0.0001 }
      ]
    },
    validate: (inputs: { value: number; base: number }) => {
      if (inputs.value <= 0) return [{ field: 'value', code: 'MATHEMATICAL_DOMAIN_ERROR', message: 'Logarithm argument must be > 0.' }];
      if (inputs.base <= 0 || inputs.base === 1) return [{ field: 'base', code: 'MATHEMATICAL_DOMAIN_ERROR', message: 'Base must be positive and not 1.' }];
      return [];
    },
    calculate: (inputs: { value: number; base: number }) => {
      const logVal = FormulaEngine.log(inputs.value, inputs.base);
      return { logVal };
    },
    formatResult: (result: { logVal: number }) => ({
      primary: {
        label: 'Logarithm Result',
        value: ResultFormatter.formatDecimal(result.logVal, 4),
        numericValue: result.logVal
      }
    })
  },

  // 26. Natural Log (ln)
  {
    id: 'natural-log',
    name: 'Natural Logarithm (ln) & e^x Calculator',
    category: 'scientific',
    subcategoryId: 'logarithms',
    formulaMeta: {
      formulaName: 'Natural Log & Euler Exponential',
      formulaExpression: 'ln(x) = log_e(x), exp(x) = e^x',
      variables: [{ symbol: 'x', name: 'Real input' }]
    },
    inputSchema: {
      fields: [
        { name: 'value', label: 'Value (x)', type: 'number', required: true, defaultValue: 10, min: 0.0001 }
      ]
    },
    validate: (inputs: { value: number }) => {
      if (inputs.value <= 0) return [{ field: 'value', code: 'MATHEMATICAL_DOMAIN_ERROR', message: 'Argument for ln must be > 0.' }];
      return [];
    },
    calculate: (inputs: { value: number }) => {
      const lnVal = FormulaEngine.ln(inputs.value);
      const expVal = PrecisionEngine.clean(Math.exp(inputs.value));
      return { lnVal, expVal };
    },
    formatResult: (result: { lnVal: number; expVal: number }) => ({
      primary: {
        label: 'Natural Log ln(x)',
        value: ResultFormatter.formatDecimal(result.lnVal, 5),
        numericValue: result.lnVal
      },
      secondary: [
        { label: 'e^x Exponential', value: ResultFormatter.formatDecimal(result.expVal, 4) }
      ]
    })
  },

  // 27. Exponential Growth
  {
    id: 'exponential-growth',
    name: 'Exponential Growth & Decay Calculator',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    formulaMeta: {
      formulaName: 'Continuous Exponential Function',
      formulaExpression: 'N(t) = N₀ * e^(kt)',
      variables: [{ symbol: 'N₀', name: 'Initial' }, { symbol: 'k', name: 'Growth constant' }, { symbol: 't', name: 'Time' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialN0', label: 'Initial Amount (N₀)', type: 'number', required: true, defaultValue: 100, min: 0 },
        { name: 'rateConstantK', label: 'Rate Constant (k)', type: 'number', required: true, defaultValue: 0.05 },
        { name: 'timeT', label: 'Time Elapsed (t)', type: 'number', required: true, defaultValue: 10, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialN0: number; rateConstantK: number; timeT: number }) => {
      const finalN = PrecisionEngine.clean(inputs.initialN0 * Math.exp(inputs.rateConstantK * inputs.timeT));
      return { finalN };
    },
    formatResult: (result: { finalN: number }) => ({
      primary: {
        label: 'Final Amount N(t)',
        value: ResultFormatter.formatDecimal(result.finalN),
        numericValue: result.finalN
      }
    })
  },

  // 28. Half-Life
  {
    id: 'half-life',
    name: 'Half-Life & Radioactive Decay Calculator',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    formulaMeta: {
      formulaName: 'Exponential Half-Life Decay',
      formulaExpression: 'N(t) = N₀ * (1/2)^(t / t_half)',
      variables: [{ symbol: 'N₀', name: 'Starting quantity' }, { symbol: 't_half', name: 'Half-life' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialQty', label: 'Starting Quantity', type: 'number', required: true, defaultValue: 500, min: 0 },
        { name: 'halfLifeTime', label: 'Half-Life Period', type: 'number', required: true, defaultValue: 5.27, min: 0.0001 },
        { name: 'elapsedTime', label: 'Elapsed Time', type: 'number', required: true, defaultValue: 15.81, min: 0 }
      ]
    },
    validate: (inputs: { halfLifeTime: number }) => {
      if (inputs.halfLifeTime <= 0) return [{ field: 'halfLifeTime', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Half-life must be > 0.' }];
      return [];
    },
    calculate: (inputs: { initialQty: number; halfLifeTime: number; elapsedTime: number }) => {
      const elapsedHalfLives = PrecisionEngine.clean(inputs.elapsedTime / inputs.halfLifeTime);
      const remaining = PrecisionEngine.clean(inputs.initialQty * Math.pow(0.5, elapsedHalfLives));
      return { remaining, elapsedHalfLives };
    },
    formatResult: (result: { remaining: number; elapsedHalfLives: number }) => ({
      primary: {
        label: 'Remaining Quantity',
        value: ResultFormatter.formatDecimal(result.remaining, 3),
        numericValue: result.remaining
      },
      secondary: [
        { label: 'Half-Lives Elapsed', value: ResultFormatter.formatDecimal(result.elapsedHalfLives, 2) }
      ]
    })
  },

  // 29. Power Function
  {
    id: 'power-function',
    name: 'Power Function & Exponents Calculator (xʸ)',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    formulaMeta: {
      formulaName: 'General Power Function',
      formulaExpression: 'y = xⁿ',
      variables: [{ symbol: 'x', name: 'Base' }, { symbol: 'n', name: 'Exponent' }]
    },
    inputSchema: {
      fields: [
        { name: 'base', label: 'Base (x)', type: 'number', required: true, defaultValue: 5 },
        { name: 'exponent', label: 'Exponent (y)', type: 'number', required: true, defaultValue: 4 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { base: number; exponent: number }) => {
      const result = FormulaEngine.power(inputs.base, inputs.exponent);
      return { result };
    },
    formatResult: (result: { result: number }) => ({
      primary: {
        label: 'xʸ Result',
        value: ResultFormatter.formatDecimal(result.result),
        numericValue: result.result
      }
    })
  },

  // 30. Root Calculator
  {
    id: 'root-calculator',
    name: 'Nth Root & Radical Calculator (ⁿ√x)',
    category: 'scientific',
    subcategoryId: 'powers-exponents',
    formulaMeta: {
      formulaName: 'Nth Radical Extraction',
      formulaExpression: 'ⁿ√x = x^(1/n)',
      variables: [{ symbol: 'n', name: 'Degree' }, { symbol: 'x', name: 'Radicand' }]
    },
    inputSchema: {
      fields: [
        { name: 'radicand', label: 'Radicand (x)', type: 'number', required: true, defaultValue: 81, min: 0 },
        { name: 'degree', label: 'Root Degree (n)', type: 'integer', required: true, defaultValue: 4, min: 1 }
      ]
    },
    validate: (inputs: { radicand: number; degree: number }) => {
      if (inputs.degree <= 0) return [{ field: 'degree', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Degree must be ≥ 1.' }];
      return [];
    },
    calculate: (inputs: { radicand: number; degree: number }) => {
      const rootVal = FormulaEngine.root(inputs.radicand, inputs.degree);
      return { rootVal };
    },
    formatResult: (result: { rootVal: number }) => ({
      primary: {
        label: 'Root Result',
        value: ResultFormatter.formatDecimal(result.rootVal, 4),
        numericValue: result.rootVal
      }
    })
  },

  // 31. Significant Figures Counter
  {
    id: 'sig-figs-counter',
    name: 'Significant Figures Counter & Identifier',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    formulaMeta: {
      formulaName: 'Significant Figures Metric',
      formulaExpression: 'Count of scientifically significant digits',
      variables: [{ symbol: 'x', name: 'Input string' }]
    },
    inputSchema: {
      fields: [
        { name: 'inputNum', label: 'Number String', type: 'number', required: true, defaultValue: 0.00450 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { inputNum: number }) => {
      const str = String(inputs.inputNum).trim();
      const cleaned = str.replace(/^-/, '').replace(/^0+/, '');
      const count = cleaned.replace('.', '').length || 1;
      return { count, input: str };
    },
    formatResult: (result: { count: number }) => ({
      primary: {
        label: 'Significant Figures Count',
        value: `${result.count} sig figs`,
        numericValue: result.count
      }
    })
  },

  // 32. Fibonacci Sequence
  {
    id: 'fibonacci-sequence',
    name: 'Fibonacci Sequence & Golden Spiral Calculator',
    category: 'scientific',
    subcategoryId: 'constants-sequences',
    formulaMeta: {
      formulaName: "Binet's Formula",
      formulaExpression: 'F_n = (φⁿ - ψⁿ) / √5',
      variables: [{ symbol: 'n', name: 'Sequence index' }]
    },
    inputSchema: {
      fields: [
        { name: 'indexN', label: 'Fibonacci Term Index (n)', type: 'integer', required: true, defaultValue: 12, min: 0, max: 70 }
      ]
    },
    validate: (inputs: { indexN: number }) => {
      if (inputs.indexN < 0 || inputs.indexN > 70) return [{ field: 'indexN', code: 'RANGE_OUT_OF_BOUNDS', message: 'Index n must be between 0 and 70.' }];
      return [];
    },
    calculate: (inputs: { indexN: number }) => {
      const PHI = (1 + Math.sqrt(5)) / 2;
      const PSI = (1 - Math.sqrt(5)) / 2;
      const fn = Math.round((Math.pow(PHI, inputs.indexN) - Math.pow(PSI, inputs.indexN)) / Math.sqrt(5));
      return { fn, indexN: inputs.indexN };
    },
    formatResult: (result: { fn: number; indexN: number }) => ({
      primary: {
        label: `Fibonacci F(${result.indexN})`,
        value: ResultFormatter.formatInteger(result.fn),
        numericValue: result.fn
      }
    })
  },

  // 33. Arithmetic Sequence
  {
    id: 'arithmetic-sequence',
    name: 'Arithmetic Sequence & Series Calculator',
    category: 'scientific',
    subcategoryId: 'constants-sequences',
    formulaMeta: {
      formulaName: 'Arithmetic Progression (A.P.)',
      formulaExpression: 'a_n = a₁ + (n - 1)d, S_n = (n/2)(a₁ + a_n)',
      variables: [{ symbol: 'a₁', name: 'First term' }, { symbol: 'd', name: 'Difference' }, { symbol: 'n', name: 'Term count' }]
    },
    inputSchema: {
      fields: [
        { name: 'firstTerm', label: 'First Term (a₁)', type: 'number', required: true, defaultValue: 3 },
        { name: 'diff', label: 'Common Difference (d)', type: 'number', required: true, defaultValue: 4 },
        { name: 'n', label: 'Number of Terms (n)', type: 'integer', required: true, defaultValue: 10, min: 1 }
      ]
    },
    validate: (inputs: { n: number }) => {
      if (inputs.n < 1) return [{ field: 'n', code: 'POSITIVE_NUMBER_REQUIRED', message: 'n must be ≥ 1.' }];
      return [];
    },
    calculate: (inputs: { firstTerm: number; diff: number; n: number }) => {
      const an = PrecisionEngine.clean(inputs.firstTerm + (inputs.n - 1) * inputs.diff);
      const sn = PrecisionEngine.clean((inputs.n / 2) * (inputs.firstTerm + an));
      return { an, sn };
    },
    formatResult: (result: { an: number; sn: number }) => ({
      primary: {
        label: 'Nth Term (a_n)',
        value: ResultFormatter.formatDecimal(result.an),
        numericValue: result.an
      },
      secondary: [
        { label: 'Partial Sum S_n', value: ResultFormatter.formatDecimal(result.sn) }
      ]
    })
  },

  // 34. Geometric Sequence
  {
    id: 'geometric-sequence',
    name: 'Geometric Sequence & Series Calculator',
    category: 'scientific',
    subcategoryId: 'constants-sequences',
    formulaMeta: {
      formulaName: 'Geometric Progression (G.P.)',
      formulaExpression: 'a_n = a₁ * r^(n-1), S_n = a₁(1 - rⁿ) / (1 - r)',
      variables: [{ symbol: 'a₁', name: 'First term' }, { symbol: 'r', name: 'Ratio' }, { symbol: 'n', name: 'Term' }]
    },
    inputSchema: {
      fields: [
        { name: 'firstTerm', label: 'First Term (a₁)', type: 'number', required: true, defaultValue: 2 },
        { name: 'ratio', label: 'Common Ratio (r)', type: 'number', required: true, defaultValue: 3 },
        { name: 'n', label: 'Number of Terms (n)', type: 'integer', required: true, defaultValue: 6, min: 1 }
      ]
    },
    validate: (inputs: { n: number }) => {
      if (inputs.n < 1) return [{ field: 'n', code: 'POSITIVE_NUMBER_REQUIRED', message: 'n must be ≥ 1.' }];
      return [];
    },
    calculate: (inputs: { firstTerm: number; ratio: number; n: number }) => {
      const an = PrecisionEngine.clean(inputs.firstTerm * Math.pow(inputs.ratio, inputs.n - 1));
      let sn = 0;
      if (inputs.ratio === 1) {
        sn = inputs.firstTerm * inputs.n;
      } else {
        sn = PrecisionEngine.clean(inputs.firstTerm * (1 - Math.pow(inputs.ratio, inputs.n)) / (1 - inputs.ratio));
      }
      return { an, sn };
    },
    formatResult: (result: { an: number; sn: number }) => ({
      primary: {
        label: 'Nth Term (a_n)',
        value: ResultFormatter.formatDecimal(result.an),
        numericValue: result.an
      },
      secondary: [
        { label: 'Partial Sum S_n', value: ResultFormatter.formatDecimal(result.sn) }
      ]
    })
  }
];
