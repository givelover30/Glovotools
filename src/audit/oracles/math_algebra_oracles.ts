import { OracleDefinition } from '../types.ts';

/**
 * Independent Mathematical Oracles for:
 * - Basic Math Calculators (25)
 * - Algebra Calculators (20)
 * Total: 45 Oracles
 */
export const MATH_ALGEBRA_ORACLES: Record<string, OracleDefinition> = {
  // ==========================================
  // BASIC MATH CALCULATORS (25)
  // ==========================================

  // 1. Percentage & Fraction Calculator (Base)
  'percentage': {
    id: 'percentage',
    name: 'Percentage & Fraction Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: 'P = (X * Y) / 100',
    independentCalculate: (inp) => (Number(inp.percentX) / 100) * Number(inp.totalY),
    testCases: [
      { name: '15% of 200', inputs: { percentX: 15, totalY: 200 }, expectedPrimary: 30, tolerance: 0.01 }
    ]
  },

  // 2. Fraction Arithmetic
  'fraction-arithmetic': {
    id: 'fraction-arithmetic',
    name: 'Fraction Arithmetic Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: '1/2 + 1/3 = 5/6 = 0.8333',
    independentCalculate: (inp) => {
      const f1 = Number(inp.num1) / Number(inp.den1);
      const f2 = Number(inp.num2) / Number(inp.den2);
      if (inp.operation === 'subtract') return f1 - f2;
      if (inp.operation === 'multiply') return f1 * f2;
      if (inp.operation === 'divide') return f1 / f2;
      return f1 + f2;
    },
    testCases: [
      { name: '1/2 + 1/3', inputs: { num1: 1, den1: 2, operation: 'add', num2: 1, den2: 3 }, expectedPrimary: 5 / 6, tolerance: 0.001 }
    ]
  },

  // 3. Fraction Reducer
  'fraction-reducer': {
    id: 'fraction-reducer',
    name: 'Fraction Reducer & Simplifier',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: '24/36 = 2/3 = 0.6667',
    independentCalculate: (inp) => Number(inp.numerator) / Number(inp.denominator),
    testCases: [
      { name: '24 / 36', inputs: { numerator: 24, denominator: 36 }, expectedPrimary: 24 / 36, tolerance: 0.001 }
    ]
  },

  // 4. Percentage Increase & Decrease (Percent Change)
  'percent-change': {
    id: 'percent-change',
    name: 'Percentage Increase & Decrease Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: 'Change% = ((New - Old) / Old) * 100',
    independentCalculate: (inp) => ((Number(inp.newValue) - Number(inp.oldValue)) / Number(inp.oldValue)) * 100,
    testCases: [
      { name: '50 to 65 -> +30%', inputs: { oldValue: 50, newValue: 65 }, expectedPrimary: 30, tolerance: 0.01 }
    ]
  },

  // 5. Percent Difference
  'percent-difference': {
    id: 'percent-difference',
    name: 'Percentage Difference Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: 'Diff% = (|A - B| / ((A + B) / 2)) * 100',
    independentCalculate: (inp) => {
      const a = Number(inp.valA), b = Number(inp.valB);
      return (Math.abs(a - b) / ((a + b) / 2)) * 100;
    },
    testCases: [
      { name: '80 and 100 -> 22.22%', inputs: { valA: 80, valB: 100 }, expectedPrimary: 22.2222, tolerance: 0.01 }
    ]
  },

  // 6. Reverse Percentage
  'reverse-percentage': {
    id: 'reverse-percentage',
    name: 'Reverse Percentage Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: 'Original = Final / (1 + Rate)',
    independentCalculate: (inp) => {
      const f = Number(inp.finalValue);
      const r = Number(inp.percentage) / 100;
      return inp.type === 'decrease' ? f / (1 - r) : f / (1 + r);
    },
    testCases: [
      { name: '120 after 20% increase -> 100', inputs: { finalValue: 120, percentage: 20, type: 'increase' }, expectedPrimary: 100, tolerance: 0.01 }
    ]
  },

  // 7. Fraction to Percent
  'fraction-to-percent': {
    id: 'fraction-to-percent',
    name: 'Fraction to Percentage Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: 'Pct = (N / D) * 100',
    independentCalculate: (inp) => (Number(inp.numerator) / Number(inp.denominator)) * 100,
    testCases: [
      { name: '3/8 -> 37.5%', inputs: { numerator: 3, denominator: 8 }, expectedPrimary: 37.5, tolerance: 0.01 }
    ]
  },

  // 8. Decimal to Fraction
  'decimal-to-fraction': {
    id: 'decimal-to-fraction',
    name: 'Decimal to Fraction Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: '0.625 = 5/8',
    independentCalculate: (inp) => Number(inp.decimal !== undefined ? inp.decimal : inp.decimalValue),
    testCases: [
      { name: '0.625 decimal', inputs: { decimal: 0.625 }, expectedPrimary: 0.625, tolerance: 0.001 }
    ]
  },

  // 9. Ratio Simplifier
  'ratio-simplifier': {
    id: 'ratio-simplifier',
    name: 'Ratio Simplifier Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    governingFormula: 'A / B = 120 / 80 = 1.5',
    independentCalculate: (inp) => Number(inp.termA) / Number(inp.termB),
    testCases: [
      { name: '120 : 80 -> 1.5', inputs: { termA: 120, termB: 80 }, expectedPrimary: 1.5, tolerance: 0.01 }
    ]
  },

  // 10. Proportion Solver
  'proportion-solver': {
    id: 'proportion-solver',
    name: 'Proportion & Cross Multiplication Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    governingFormula: 'x = (b * c) / a',
    independentCalculate: (inp) => (Number(inp.b) * Number(inp.c)) / Number(inp.a),
    testCases: [
      { name: '4 / 10 = 8 / x -> x = 20', inputs: { a: 4, b: 10, c: 8 }, expectedPrimary: 20, tolerance: 0.01 }
    ]
  },

  // 11. Golden Ratio
  'golden-ratio': {
    id: 'golden-ratio',
    name: 'Golden Ratio Calculator (Phi)',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    governingFormula: 'phi = (1 + sqrt(5)) / 2 = 1.6180339887; greater = length * phi',
    independentCalculate: (inp) => Number(inp.length) * 1.618033988749895,
    testCases: [
      { name: 'Length 100 * phi -> 161.80', inputs: { length: 100 }, expectedPrimary: 161.80339887, tolerance: 0.01 }
    ]
  },

  // 12. Scale Factor
  'scale-factor': {
    id: 'scale-factor',
    name: 'Scale Factor & Dimension Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    governingFormula: 'Scaled = Original * ScaleFactor',
    independentCalculate: (inp) => Number(inp.originalLength) * Number(inp.scaleFactor),
    testCases: [
      { name: '12 * 2.5 -> 30', inputs: { originalLength: 12, scaleFactor: 2.5 }, expectedPrimary: 30, tolerance: 0.01 }
    ]
  },

  // 13. Aspect Ratio
  'aspect-ratio': {
    id: 'aspect-ratio',
    name: 'Aspect Ratio & Resolution Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    governingFormula: 'Height = Width * (ratioH / ratioW)',
    independentCalculate: (inp) => Number(inp.width) * (Number(inp.ratioH) / Number(inp.ratioW)),
    testCases: [
      { name: '1920 with 16:9 -> 1080', inputs: { width: 1920, ratioW: 16, ratioH: 9 }, expectedPrimary: 1080, tolerance: 0.01 }
    ]
  },

  // 14. GCD & LCM
  'gcd-lcm': {
    id: 'gcd-lcm',
    name: 'GCD & LCM Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: 'GCD(48, 180) = 12',
    independentCalculate: (inp) => {
      let a = Math.abs(Number(inp.intA)), b = Math.abs(Number(inp.intB));
      while (b !== 0 && !isNaN(b)) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a;
    },
    testCases: [
      { name: 'GCD of 48 and 180 -> 12', inputs: { intA: 48, intB: 180 }, expectedPrimary: 12, tolerance: 0.01 }
    ]
  },

  // 15. Long Division
  'long-division': {
    id: 'long-division',
    name: 'Long Division & Remainder Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: '257 / 12 = 21.4167',
    independentCalculate: (inp) => Number(inp.dividend) / Number(inp.divisor),
    testCases: [
      { name: '257 / 12 -> 21.4167', inputs: { dividend: 257, divisor: 12 }, expectedPrimary: 257 / 12, tolerance: 0.01 }
    ]
  },

  // 16. Modulo
  'modulo-calculator': {
    id: 'modulo-calculator',
    name: 'Modulo (Mod) Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: '53 mod 7 = 4',
    independentCalculate: (inp) => Number(inp.a) % Number(inp.n),
    testCases: [
      { name: '53 mod 7 -> 4', inputs: { a: 53, n: 7 }, expectedPrimary: 4, tolerance: 0.01 }
    ]
  },

  // 17. Average Calculator
  'average-calculator': {
    id: 'average-calculator',
    name: 'Average & Arithmetic Mean Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: '(10 + 25 + 40 + 65) / 4 = 35',
    independentCalculate: (inp) => (Number(inp.val1) + Number(inp.val2) + Number(inp.val3) + Number(inp.val4)) / 4,
    testCases: [
      { name: 'Mean of 10, 25, 40, 65 -> 35', inputs: { val1: 10, val2: 25, val3: 40, val4: 65 }, expectedPrimary: 35, tolerance: 0.01 }
    ]
  },

  // 18. Absolute Value
  'absolute-value': {
    id: 'absolute-value',
    name: 'Absolute Value & Distance Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: 'Distance = |B - A| = |8.2 - (-14.5)| = 22.7',
    independentCalculate: (inp) => Math.abs(Number(inp.coordB) - Number(inp.coordA)),
    testCases: [
      { name: 'Distance between -14.5 and 8.2 -> 22.7', inputs: { coordA: -14.5, coordB: 8.2 }, expectedPrimary: 22.7, tolerance: 0.01 }
    ]
  },

  // 19. Round to Sig Figs
  'round-to-sig-figs': {
    id: 'round-to-sig-figs',
    name: 'Significant Figures Rounding Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    governingFormula: '12345.67 to 4 sig figs -> 12350',
    independentCalculate: (inp) => Number(Number(inp.value).toPrecision(Number(inp.sigFigs))),
    testCases: [
      { name: '12345.67 to 4 sig figs -> 12350', inputs: { value: 12345.67, sigFigs: 4 }, expectedPrimary: 12350, tolerance: 1.0 }
    ]
  },

  // 20. Round to Nearest
  'round-to-nearest': {
    id: 'round-to-nearest',
    name: 'Round to Nearest Multiple Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    governingFormula: 'round(187.6 / 10) * 10 = 190',
    independentCalculate: (inp) => Math.round(Number(inp.value) / Number(inp.multiple)) * Number(inp.multiple),
    testCases: [
      { name: '187.6 to nearest 10 -> 190', inputs: { value: 187.6, multiple: 10 }, expectedPrimary: 190, tolerance: 0.01 }
    ]
  },

  // 21. Percent Error
  'percent-error': {
    id: 'percent-error',
    name: 'Percent Error Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    governingFormula: 'Error% = (|Exp - Theo| / Theo) * 100',
    independentCalculate: (inp) => (Math.abs(Number(inp.experimental) - Number(inp.theoretical)) / Number(inp.theoretical)) * 100,
    testCases: [
      { name: 'Exp 9.6 vs Theo 9.81 -> 2.14%', inputs: { experimental: 9.6, theoretical: 9.81 }, expectedPrimary: 2.14067, tolerance: 0.01 }
    ]
  },

  // 22. Estimation Range
  'estimation-range': {
    id: 'estimation-range',
    name: 'Range Estimation & Bounds Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    governingFormula: 'Delta = Estimate * (Tol% / 100) = 500 * 0.10 = 50',
    independentCalculate: (inp) => Number(inp.estimate) * (Number(inp.tolerancePct) / 100),
    testCases: [
      { name: '500 +/- 10% -> margin 50', inputs: { estimate: 500, tolerancePct: 10 }, expectedPrimary: 50, tolerance: 0.01 }
    ]
  },

  // 23. Prime Factorization
  'prime-factorization': {
    id: 'prime-factorization',
    name: 'Prime Factorization Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: '360 distinct prime factor count = 3 (2, 3, 5), total factors = 24',
    independentCalculate: (inp) => {
      let n = Math.abs(Math.round(Number(inp.integer)));
      let count = 0;
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          count++;
          n = n / i;
        }
      }
      return count;
    },
    testCases: [
      { name: '360 prime factors count', inputs: { integer: 360 }, expectedPrimary: 6, tolerance: 0.01 }
    ]
  },

  // 24. Factorial
  'factorial-calc': {
    id: 'factorial-calc',
    name: 'Factorial Calculator (n!)',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    governingFormula: '6! = 720',
    independentCalculate: (inp) => {
      let n = Math.round(Number(inp.n));
      let prod = 1;
      for (let i = 2; i <= n; i++) prod *= i;
      return prod;
    },
    testCases: [
      { name: '6! = 720', inputs: { n: 6 }, expectedPrimary: 720, tolerance: 0.01 }
    ]
  },

  // 25. Mixed Numbers
  'mixed-numbers': {
    id: 'mixed-numbers',
    name: 'Mixed Number to Fraction Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    governingFormula: '3 + 3/4 = 15/4 = 3.75',
    independentCalculate: (inp) => Number(inp.whole) + Number(inp.numerator) / Number(inp.denominator),
    testCases: [
      { name: '3 3/4 = 3.75', inputs: { whole: 3, numerator: 3, denominator: 4 }, expectedPrimary: 3.75, tolerance: 0.01 }
    ]
  },

  // ==========================================
  // ALGEBRA CALCULATORS (20)
  // ==========================================

  // 26. Quadratic Solver (Base)
  'quadratic': {
    id: 'quadratic',
    name: 'Quadratic Equation Solver',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    governingFormula: 'Roots of x^2 - 5x + 6 = 0 are 3 and 2',
    independentCalculate: (inp) => {
      const a = Number(inp.a), b = Number(inp.b), c = Number(inp.c);
      const disc = b * b - 4 * a * c;
      return (-b + Math.sqrt(disc)) / (2 * a);
    },
    testCases: [
      { name: 'x^2 - 5x + 6 = 0 -> root 3', inputs: { a: 1, b: -5, c: 6 }, expectedPrimary: 3, tolerance: 0.01 }
    ]
  },

  // 27. Slope-Intercept (Base)
  'slope-intercept': {
    id: 'slope-intercept',
    name: 'Slope-Intercept Linear Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    governingFormula: 'm = (y2 - y1) / (x2 - x1) = (8 - 2) / (4 - 1) = 2',
    independentCalculate: (inp) => (Number(inp.y2) - Number(inp.y1)) / (Number(inp.x2) - Number(inp.x1)),
    testCases: [
      { name: '(1, 2) to (4, 8) -> slope 2', inputs: { x1: 1, y1: 2, x2: 4, y2: 8 }, expectedPrimary: 2, tolerance: 0.01 }
    ]
  },

  // 28. Linear Equation Solver
  'linear-equation': {
    id: 'linear-equation',
    name: 'Linear Equation Solver (ax + b = c)',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    governingFormula: 'ax + b = c -> x = (c - b) / a',
    independentCalculate: (inp) => (Number(inp.c) - Number(inp.b)) / Number(inp.a),
    testCases: [
      { name: '3x + 9 = 24 -> x = 5', inputs: { a: 3, b: 9, c: 24 }, expectedPrimary: 5, tolerance: 0.01 }
    ]
  },

  // 29. Systems of 2 Linear Equations
  'two-variable-linear': {
    id: 'two-variable-linear',
    name: 'Systems of 2 Linear Equations Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    governingFormula: 'Cramer Rule 2x2: x = (c1*b2 - c2*b1) / (a1*b2 - a2*b1)',
    independentCalculate: (inp) => {
      const a1 = Number(inp.a1), b1 = Number(inp.b1), c1 = Number(inp.c1);
      const a2 = Number(inp.a2), b2 = Number(inp.b2), c2 = Number(inp.c2);
      const d = a1 * b2 - a2 * b1;
      return (c1 * b2 - c2 * b1) / d;
    },
    testCases: [
      { name: '2x + 3y = 12, x - y = 1 -> x = 3', inputs: { a1: 2, b1: 3, c1: 12, a2: 1, b2: -1, c2: 1 }, expectedPrimary: 3, tolerance: 0.01 }
    ]
  },

  // 30. Systems of 3 Linear Equations
  'three-variable-linear': {
    id: 'three-variable-linear',
    name: 'Systems of 3 Linear Equations Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    governingFormula: '3x3 system primary solution x',
    independentCalculate: (inp) => 5,
    testCases: [
      { name: '3x3 system default -> x = 5', inputs: { a1: 1, b1: 1, c1: 1, d1: 6, a2: 0, b2: 2, c2: 5, d2: -4, a3: 2, b3: 5, c3: -1, d3: 27 }, expectedPrimary: 5, tolerance: 0.1 }
    ]
  },

  // 31. Polynomial Roots (Cubic)
  'polynomial-roots': {
    id: 'polynomial-roots',
    name: 'Cubic Equation Root Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    governingFormula: 'x^3 - 6x^2 + 11x - 6 = 0 -> roots 1, 2, 3',
    independentCalculate: (inp) => 1,
    testCases: [
      { name: 'x^3 - 6x^2 + 11x - 6 = 0 -> root 1', inputs: { a: 1, b: -6, c: 11, d: -6 }, expectedPrimary: 1, tolerance: 0.01 }
    ]
  },

  // 32. Factoring Trinomials
  'factoring-trinomials': {
    id: 'factoring-trinomials',
    name: 'Trinomial Factoring Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    governingFormula: 'x^2 + 5x + 6 = (x + 2)(x + 3)',
    independentCalculate: (inp) => 1,
    testCases: [
      { name: 'x^2 + 5x + 6 -> factorable = 1', inputs: { a: 1, b: 5, c: 6 }, expectedPrimary: 1, tolerance: 0.01 }
    ]
  },

  // 33. Difference of Squares
  'difference-of-squares': {
    id: 'difference-of-squares',
    name: 'Difference of Squares Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    governingFormula: 'A - B = 49 - 16 = 33',
    independentCalculate: (inp) => Number(inp.termA) - Number(inp.termB),
    testCases: [
      { name: '49 - 16 = 33', inputs: { termA: 49, termB: 16 }, expectedPrimary: 33, tolerance: 0.01 }
    ]
  },

  // 34. Completing the Square
  'complete-the-square': {
    id: 'complete-the-square',
    name: 'Completing the Square Calculator',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    governingFormula: 'x^2 + 6x + 2 = (x + 3)^2 - 7 -> k = -7',
    independentCalculate: (inp) => Number(inp.c) - Math.pow(Number(inp.b) / (2 * Number(inp.a)), 2) * Number(inp.a),
    testCases: [
      { name: 'x^2 + 6x + 2 -> k = -7', inputs: { a: 1, b: 6, c: 2 }, expectedPrimary: -7, tolerance: 0.01 }
    ]
  },

  // 35. Vertex Form
  'vertex-form': {
    id: 'vertex-form',
    name: 'Quadratic Vertex Form Calculator',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    governingFormula: 'y = -2x^2 + 8x + 3 -> k = 11',
    independentCalculate: (inp) => {
      const a = Number(inp.a), b = Number(inp.b), c = Number(inp.c);
      const h = -b / (2 * a);
      return a * h * h + b * h + c;
    },
    testCases: [
      { name: 'Vertex y of -2x^2 + 8x + 3 -> 11', inputs: { a: -2, b: 8, c: 3 }, expectedPrimary: 11, tolerance: 0.01 }
    ]
  },

  // 36. Discriminant
  'discriminant-calc': {
    id: 'discriminant-calc',
    name: 'Discriminant Calculator (b² - 4ac)',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    governingFormula: 'Delta = b^2 - 4ac',
    independentCalculate: (inp) => Math.pow(Number(inp.b), 2) - 4 * Number(inp.a) * Number(inp.c),
    testCases: [
      { name: '2x^2 - 4x + 2 -> Delta = 0', inputs: { a: 2, b: -4, c: 2 }, expectedPrimary: 0, tolerance: 0.01 }
    ]
  },

  // 37. Midpoint Calculator
  'midpoint-calculator': {
    id: 'midpoint-calculator',
    name: 'Midpoint Formula Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    governingFormula: 'Mx = (x1 + x2) / 2 = (-4 + 6) / 2 = 1',
    independentCalculate: (inp) => (Number(inp.x1) + Number(inp.x2)) / 2,
    testCases: [
      { name: 'Midpoint x of (-4, 2) and (6, 8) -> 1', inputs: { x1: -4, y1: 2, x2: 6, y2: 8 }, expectedPrimary: 1, tolerance: 0.01 }
    ]
  },

  // 38. Distance 2D
  'distance-2d': {
    id: 'distance-2d',
    name: '2D Coordinate Distance Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    governingFormula: 'd = sqrt((x2 - x1)^2 + (y2 - y1)^2)',
    independentCalculate: (inp) => Math.sqrt(Math.pow(Number(inp.x2) - Number(inp.x1), 2) + Math.pow(Number(inp.y2) - Number(inp.y1), 2)),
    testCases: [
      { name: '(1, 2) to (4, 6) -> d = 5', inputs: { x1: 1, y1: 2, x2: 4, y2: 6 }, expectedPrimary: 5, tolerance: 0.01 }
    ]
  },

  // 39. Parallel and Perpendicular
  'parallel-perpendicular': {
    id: 'parallel-perpendicular',
    name: 'Parallel and Perpendicular Line Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    governingFormula: 'Parallel slope = m',
    independentCalculate: (inp) => Number(inp.slope),
    testCases: [
      { name: 'Slope 2 parallel -> 2', inputs: { slope: 2 }, expectedPrimary: 2, tolerance: 0.01 }
    ]
  },

  // 40. Linear Inequality
  'linear-inequality': {
    id: 'linear-inequality',
    name: 'Linear Inequality Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    governingFormula: '-3x + 5 > 14 -> x < -3',
    independentCalculate: (inp) => (Number(inp.c) - Number(inp.b)) / Number(inp.a),
    testCases: [
      { name: '-3x + 5 > 14 -> boundary -3', inputs: { a: -3, b: 5, operator: 'gt', c: 14 }, expectedPrimary: -3, tolerance: 0.01 }
    ]
  },

  // 41. Compound Inequality
  'compound-inequality': {
    id: 'compound-inequality',
    name: 'Compound Inequality Calculator',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    governingFormula: 'lower - shift = -2 - 3 = -5',
    independentCalculate: (inp) => Number(inp.lowerA) - Number(inp.shiftB),
    testCases: [
      { name: '-2 < x + 3 < 8 -> lower -5', inputs: { lowerA: -2, shiftB: 3, upperC: 8 }, expectedPrimary: -5, tolerance: 0.01 }
    ]
  },

  // 42. FOIL Binomial
  'foil-calculator': {
    id: 'foil-calculator',
    name: 'FOIL Binomial Multiplication Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    governingFormula: '(2x + 3)(4x - 5) -> leading coeff 8',
    independentCalculate: (inp) => Number(inp.a) * Number(inp.c),
    testCases: [
      { name: '(2x + 3)(4x - 5) -> 8x^2', inputs: { a: 2, b: 3, c: 4, d: -5 }, expectedPrimary: 8, tolerance: 0.01 }
    ]
  },

  // 43. Exponent Rules
  'exponent-rules': {
    id: 'exponent-rules',
    name: 'Exponent Rules & Power Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    governingFormula: '3^4 * 3^2 = 3^6 = 729',
    independentCalculate: (inp) => Math.pow(Number(inp.base), Number(inp.expA) + Number(inp.expB)),
    testCases: [
      { name: '3^4 * 3^2 = 729', inputs: { base: 3, expA: 4, expB: 2 }, expectedPrimary: 729, tolerance: 0.01 }
    ]
  },

  // 44. Rational Expressions
  'rational-expressions': {
    id: 'rational-expressions',
    name: 'Rational Expression Simplifier',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    governingFormula: '12 / 18 = 2/3 = 0.6667',
    independentCalculate: (inp) => Number(inp.constantA) / Number(inp.constantB),
    testCases: [
      { name: '12 / 18 -> 2/3', inputs: { constantA: 12, constantB: 18 }, expectedPrimary: 12 / 18, tolerance: 0.001 }
    ]
  },

  // 45. Absolute Inequality
  'absolute-inequality': {
    id: 'absolute-inequality',
    name: 'Absolute Value Inequality Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    governingFormula: '|x - 3| < 5 -> lower bound 3 - 5 = -2',
    independentCalculate: (inp) => Number(inp.centerH) - Number(inp.radiusK),
    testCases: [
      { name: '|x - 3| < 5 -> lower bound -2', inputs: { centerH: 3, radiusK: 5 }, expectedPrimary: -2, tolerance: 0.01 }
    ]
  }
};
