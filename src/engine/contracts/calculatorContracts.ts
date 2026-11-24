import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { ValidationEngine } from '../ValidationEngine.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const ALL_CALCULATOR_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Percentage & Fraction Calculator
  {
    id: 'percentage',
    name: 'Percentage & Fraction Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Percentage of Number and Difference',
      formulaExpression: 'P = (X * Y) / 100',
      variables: [
        { symbol: 'X', name: 'Percentage Rate', unit: '%' },
        { symbol: 'Y', name: 'Base Value' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'percentX', label: 'Percentage Rate', type: 'percentage', required: true, defaultValue: 15, min: 0 },
        { name: 'totalY', label: 'Base Amount', type: 'number', required: true, defaultValue: 200 }
      ]
    },
    validate: (inputs: { percentX: number; totalY: number }) => {
      const errors: CalculationError[] = [];
      const numErr1 = ValidationEngine.validateNumeric('percentX', inputs.percentX);
      const numErr2 = ValidationEngine.validateNumeric('totalY', inputs.totalY);
      if (numErr1) errors.push(numErr1);
      if (numErr2) errors.push(numErr2);
      return errors;
    },
    calculate: (inputs: { percentX: number; totalY: number }) => {
      const result = FormulaEngine.percentageOf(inputs.percentX, inputs.totalY);
      return { result, percent: inputs.percentX, total: inputs.totalY };
    },
    formatResult: (result: { result: number; percent: number; total: number }) => {
      return {
        primary: {
          label: `${result.percent}% of ${ResultFormatter.formatDecimal(result.total)}`,
          value: ResultFormatter.formatDecimal(result.result, 2),
          numericValue: result.result
        },
        summaryText: `${result.percent}% of ${result.total} is ${ResultFormatter.formatDecimal(result.result)}`
      };
    }
  },

  // 2. Quadratic Equation Solver
  {
    id: 'quadratic',
    name: 'Quadratic Equation Solver',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    formulaMeta: {
      formulaName: 'Quadratic Formula',
      formulaExpression: 'x = (-b ± √(b² - 4ac)) / (2a)',
      variables: [
        { symbol: 'a', name: 'Quadratic coefficient' },
        { symbol: 'b', name: 'Linear coefficient' },
        { symbol: 'c', name: 'Constant term' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'a (x² coefficient)', type: 'number', required: true, defaultValue: 1 },
        { name: 'b', label: 'b (x coefficient)', type: 'number', required: true, defaultValue: -5 },
        { name: 'c', label: 'c (constant)', type: 'number', required: true, defaultValue: 6 }
      ]
    },
    validate: (inputs: { a: number; b: number; c: number }) => {
      const errors: CalculationError[] = [];
      if (Math.abs(inputs.a) < 1e-12) {
        errors.push({
          field: 'a',
          code: 'DIVISION_BY_ZERO',
          message: 'Coefficient "a" cannot be zero in a quadratic equation.'
        });
      }
      return errors;
    },
    calculate: (inputs: { a: number; b: number; c: number }) => {
      return FormulaEngine.quadratic(inputs.a, inputs.b, inputs.c);
    },
    formatResult: (result: { root1: number | string; root2: number | string; vertexX: number; vertexY: number }) => {
      const r1 = typeof result.root1 === 'number' ? ResultFormatter.formatDecimal(result.root1) : result.root1;
      const r2 = typeof result.root2 === 'number' ? ResultFormatter.formatDecimal(result.root2) : result.root2;
      return {
        primary: {
          label: 'Roots (x₁, x₂)',
          value: `x₁ = ${r1}, x₂ = ${r2}`,
          numericValue: typeof result.root1 === 'number' ? result.root1 : 0
        },
        secondary: [
          { label: 'Parabola Vertex', value: `(${ResultFormatter.formatDecimal(result.vertexX)}, ${ResultFormatter.formatDecimal(result.vertexY)})` }
        ]
      };
    }
  },

  // 3. Slope-Intercept Linear Calculator
  {
    id: 'slope-intercept',
    name: 'Slope-Intercept Linear Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    formulaMeta: {
      formulaName: 'Slope-Intercept Form',
      formulaExpression: 'm = (y₂ - y₁) / (x₂ - x₁), y = mx + b',
      variables: [
        { symbol: '(x₁, y₁)', name: 'Point 1' },
        { symbol: '(x₂, y₂)', name: 'Point 2' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'x₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'y1', label: 'y₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'x2', label: 'x₂', type: 'number', required: true, defaultValue: 4 },
        { name: 'y2', label: 'y₂', type: 'number', required: true, defaultValue: 8 }
      ]
    },
    validate: (inputs: { x1: number; y1: number; x2: number; y2: number }) => {
      return [];
    },
    calculate: (inputs: { x1: number; y1: number; x2: number; y2: number }) => {
      return FormulaEngine.linearSlopeIntercept(inputs.x1, inputs.y1, inputs.x2, inputs.y2);
    },
    formatResult: (result: { slope: number; interceptB: number; distance: number; isVertical: boolean }) => {
      return {
        primary: {
          label: 'Slope (m)',
          value: result.isVertical ? 'Undefined (Vertical Line)' : ResultFormatter.formatDecimal(result.slope),
          numericValue: result.isVertical ? 0 : result.slope
        },
        secondary: [
          { label: 'Y-Intercept (b)', value: isNaN(result.interceptB) ? 'None' : ResultFormatter.formatDecimal(result.interceptB) },
          { label: 'Distance', value: ResultFormatter.formatDecimal(result.distance) }
        ]
      };
    }
  },

  // 4. Area & Perimeter Calculator
  {
    id: 'area-shapes',
    name: 'Area & Perimeter Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: '2D Geometric Area',
      formulaExpression: 'Rectangle: l * w, Circle: π * r²',
      variables: [
        { symbol: 'l, w', name: 'Dimensions', unit: 'units' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'length', label: 'Length / Radius', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'width', label: 'Width', type: 'number', required: false, defaultValue: 5, min: 0 }
      ]
    },
    validate: (inputs: { length: number; width?: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.length < 0) errors.push({ field: 'length', code: 'NON_NEGATIVE_REQUIRED', message: 'Dimension cannot be negative.' });
      return errors;
    },
    calculate: (inputs: { length: number; width?: number }) => {
      const w = inputs.width !== undefined ? inputs.width : inputs.length;
      const rectArea = FormulaEngine.rectangleArea(inputs.length, w);
      const circleArea = FormulaEngine.circleArea(inputs.length);
      return { rectArea, circleArea, length: inputs.length, width: w };
    },
    formatResult: (result: { rectArea: number; circleArea: number }) => {
      return {
        primary: {
          label: 'Rectangle Area',
          value: ResultFormatter.formatDecimal(result.rectArea),
          numericValue: result.rectArea,
          unit: 'sq units'
        },
        secondary: [
          { label: 'Circle Area (r=length)', value: ResultFormatter.formatDecimal(result.circleArea), unit: 'sq units' }
        ]
      };
    }
  },

  // 5. Volume & Surface Area Calculator
  {
    id: 'volume-surface',
    name: 'Volume & Surface Area Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Solid Geometry Formulas',
      formulaExpression: 'V = π * r² * h, V = (4/3) * π * r³',
      variables: [
        { symbol: 'r', name: 'Radius', unit: 'units' },
        { symbol: 'h', name: 'Height', unit: 'units' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius', type: 'number', required: true, defaultValue: 3, min: 0 },
        { name: 'height', label: 'Height', type: 'number', required: true, defaultValue: 5, min: 0 }
      ]
    },
    validate: (inputs: { radius: number; height: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.radius < 0) errors.push({ field: 'radius', code: 'NON_NEGATIVE_REQUIRED', message: 'Radius cannot be negative.' });
      if (inputs.height < 0) errors.push({ field: 'height', code: 'NON_NEGATIVE_REQUIRED', message: 'Height cannot be negative.' });
      return errors;
    },
    calculate: (inputs: { radius: number; height: number }) => {
      const cylVol = FormulaEngine.cylinderVolume(inputs.radius, inputs.height);
      const cylSA = FormulaEngine.cylinderSurfaceArea(inputs.radius, inputs.height);
      const sphVol = FormulaEngine.sphereVolume(inputs.radius);
      return { cylVol, cylSA, sphVol };
    },
    formatResult: (result: { cylVol: number; cylSA: number; sphVol: number }) => {
      return {
        primary: {
          label: 'Cylinder Volume',
          value: ResultFormatter.formatDecimal(result.cylVol),
          numericValue: result.cylVol,
          unit: 'cu units'
        },
        secondary: [
          { label: 'Cylinder Surface Area', value: ResultFormatter.formatDecimal(result.cylSA), unit: 'sq units' },
          { label: 'Sphere Volume', value: ResultFormatter.formatDecimal(result.sphVol), unit: 'cu units' }
        ]
      };
    }
  },

  // 6. Pythagorean Theorem Calculator
  {
    id: 'pythagorean',
    name: 'Pythagorean Theorem Calculator',
    category: 'trigonometry',
    subcategoryId: 'right-triangles',
    formulaMeta: {
      formulaName: 'Pythagorean Theorem',
      formulaExpression: 'a² + b² = c²',
      variables: [
        { symbol: 'a', name: 'Leg a' },
        { symbol: 'b', name: 'Leg b' },
        { symbol: 'c', name: 'Hypotenuse' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'legA', label: 'Leg A', type: 'number', required: true, defaultValue: 6, min: 0 },
        { name: 'legB', label: 'Leg B', type: 'number', required: true, defaultValue: 8, min: 0 }
      ]
    },
    validate: (inputs: { legA: number; legB: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.legA <= 0) errors.push({ field: 'legA', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Leg A must be > 0.' });
      if (inputs.legB <= 0) errors.push({ field: 'legB', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Leg B must be > 0.' });
      return errors;
    },
    calculate: (inputs: { legA: number; legB: number }) => {
      const hypotenuse = FormulaEngine.pythagoreanHypotenuse(inputs.legA, inputs.legB);
      const area = FormulaEngine.triangleArea(inputs.legA, inputs.legB);
      return { hypotenuse, area };
    },
    formatResult: (result: { hypotenuse: number; area: number }) => {
      return {
        primary: {
          label: 'Hypotenuse (c)',
          value: ResultFormatter.formatDecimal(result.hypotenuse),
          numericValue: result.hypotenuse
        },
        secondary: [
          { label: 'Triangle Area', value: ResultFormatter.formatDecimal(result.area), unit: 'sq units' }
        ]
      };
    }
  },

  // 7. Trigonometric Functions Calculator
  {
    id: 'trig-solver',
    name: 'Trigonometric Functions Calculator',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    formulaMeta: {
      formulaName: 'Trigonometric Ratios',
      formulaExpression: 'sin(θ), cos(θ), tan(θ)',
      variables: [
        { symbol: 'θ', name: 'Angle', unit: 'deg' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'angle', label: 'Angle', type: 'number', required: true, defaultValue: 30 }
      ]
    },
    validate: (inputs: { angle: number }) => [],
    calculate: (inputs: { angle: number }) => {
      const sinVal = FormulaEngine.trigSin(inputs.angle, true);
      const cosVal = FormulaEngine.trigCos(inputs.angle, true);
      const tanVal = Math.abs(cosVal) > 1e-12 ? FormulaEngine.trigTan(inputs.angle, true) : NaN;
      return { sinVal, cosVal, tanVal, angle: inputs.angle };
    },
    formatResult: (result: { sinVal: number; cosVal: number; tanVal: number; angle: number }) => {
      return {
        primary: {
          label: `sin(${result.angle}°)`,
          value: ResultFormatter.formatDecimal(result.sinVal, 4),
          numericValue: result.sinVal
        },
        secondary: [
          { label: `cos(${result.angle}°)`, value: ResultFormatter.formatDecimal(result.cosVal, 4) },
          { label: `tan(${result.angle}°)`, value: isNaN(result.tanVal) ? 'Undefined' : ResultFormatter.formatDecimal(result.tanVal, 4) }
        ]
      };
    }
  },

  // 8. Statistics & Probability Calculator
  {
    id: 'stats-summary',
    name: 'Statistics & Probability Calculator',
    category: 'statistics',
    subcategoryId: 'descriptive-statistics',
    formulaMeta: {
      formulaName: 'Descriptive Central Tendency',
      formulaExpression: 'μ = Σx / N, σ = √(Σ(x - μ)² / N)',
      variables: [{ symbol: 'x', name: 'Data array' }]
    },
    inputSchema: {
      fields: [
        { name: 'data', label: 'Data numbers', type: 'number', required: true, defaultValue: [70, 80, 85, 90, 100] }
      ]
    },
    validate: (inputs: { data: number[] }) => {
      const errors: CalculationError[] = [];
      if (!Array.isArray(inputs.data) || inputs.data.length === 0) {
        errors.push({ field: 'data', code: 'REQUIRED_FIELD_MISSING', message: 'Dataset cannot be empty.' });
      }
      return errors;
    },
    calculate: (inputs: { data: number[] }) => {
      const mean = FormulaEngine.mean(inputs.data);
      const median = FormulaEngine.median(inputs.data);
      const stdev = inputs.data.length > 1 ? FormulaEngine.standardDeviation(inputs.data, true) : 0;
      return { mean, median, stdev, count: inputs.data.length };
    },
    formatResult: (result: { mean: number; median: number; stdev: number; count: number }) => {
      return {
        primary: {
          label: 'Arithmetic Mean (Average)',
          value: ResultFormatter.formatDecimal(result.mean),
          numericValue: result.mean
        },
        secondary: [
          { label: 'Median', value: ResultFormatter.formatDecimal(result.median) },
          { label: 'Sample Std Dev', value: ResultFormatter.formatDecimal(result.stdev) },
          { label: 'Sample Count', value: result.count.toString() }
        ]
      };
    }
  },

  // 9. Scientific Calculator
  {
    id: 'scientific-calc',
    name: 'Scientific Calculator',
    category: 'scientific',
    subcategoryId: 'precision-scientific',
    formulaMeta: {
      formulaName: 'Transcendental Operations',
      formulaExpression: 'f(x) = { log, ln, x^y, √x }',
      variables: [{ symbol: 'x, y', name: 'Operands' }]
    },
    inputSchema: {
      fields: [
        { name: 'base', label: 'Base (x)', type: 'number', required: true, defaultValue: 2 },
        { name: 'exponent', label: 'Exponent (y)', type: 'number', required: true, defaultValue: 8 }
      ]
    },
    validate: (inputs: { base: number; exponent: number }) => [],
    calculate: (inputs: { base: number; exponent: number }) => {
      const powVal = FormulaEngine.power(inputs.base, inputs.exponent);
      const sqrtVal = inputs.base >= 0 ? FormulaEngine.root(inputs.base, 2) : NaN;
      return { powVal, sqrtVal, base: inputs.base, exponent: inputs.exponent };
    },
    formatResult: (result: { powVal: number; sqrtVal: number; base: number; exponent: number }) => {
      return {
        primary: {
          label: `${result.base}^${result.exponent}`,
          value: ResultFormatter.formatDecimal(result.powVal),
          numericValue: result.powVal
        },
        secondary: [
          { label: `√${result.base}`, value: isNaN(result.sqrtVal) ? 'Non-real' : ResultFormatter.formatDecimal(result.sqrtVal) }
        ]
      };
    }
  },

  // 10. Loan & Mortgage Calculator
  {
    id: 'loan-mortgage',
    name: 'Loan & Mortgage Calculator',
    category: 'financial',
    subcategoryId: 'loans-mortgages',
    formulaMeta: {
      formulaName: 'Fixed-Rate Loan Amortization',
      formulaExpression: 'M = P[r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
      variables: [
        { symbol: 'P', name: 'Principal', unit: '$' },
        { symbol: 'r', name: 'Monthly rate' },
        { symbol: 'n', name: 'Months' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Loan Principal', type: 'currency', required: true, defaultValue: 300000, min: 1 },
        { name: 'rate', label: 'Annual Rate (APR)', type: 'percentage', required: true, defaultValue: 6.0, min: 0 },
        { name: 'years', label: 'Loan Term (Years)', type: 'integer', required: true, defaultValue: 30, min: 1 }
      ]
    },
    validate: (inputs: { principal: number; rate: number; years: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.principal <= 0) errors.push({ field: 'principal', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Principal must be > 0' });
      if (inputs.years <= 0) errors.push({ field: 'years', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Loan years must be > 0' });
      return errors;
    },
    calculate: (inputs: { principal: number; rate: number; years: number }) => {
      const totalMonths = inputs.years * 12;
      const monthlyPayment = FormulaEngine.loanMonthlyPayment(inputs.principal, inputs.rate, totalMonths);
      const totalRepaid = PrecisionEngine.roundFinancial(monthlyPayment * totalMonths);
      const totalInterest = PrecisionEngine.roundFinancial(totalRepaid - inputs.principal);
      return { monthlyPayment, totalRepaid, totalInterest, principal: inputs.principal };
    },
    formatResult: (result: { monthlyPayment: number; totalRepaid: number; totalInterest: number }) => {
      return {
        primary: {
          label: 'Monthly Payment (P&I)',
          value: ResultFormatter.formatCurrency(result.monthlyPayment),
          numericValue: result.monthlyPayment
        },
        secondary: [
          { label: 'Total Repaid', value: ResultFormatter.formatCurrency(result.totalRepaid) },
          { label: 'Total Lifetime Interest', value: ResultFormatter.formatCurrency(result.totalInterest) }
        ]
      };
    }
  },

  // 11. Compound Interest Calculator
  {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    category: 'financial',
    subcategoryId: 'compound-investments',
    formulaMeta: {
      formulaName: 'Compound Interest with Annuity Additions',
      formulaExpression: 'A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]',
      variables: [
        { symbol: 'P', name: 'Initial Principal', unit: '$' },
        { symbol: 'PMT', name: 'Monthly Addition', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Initial Investment', type: 'currency', required: true, defaultValue: 10000, min: 0 },
        { name: 'monthlyAddition', label: 'Monthly Addition', type: 'currency', required: false, defaultValue: 200, min: 0 },
        { name: 'rate', label: 'Annual Rate', type: 'percentage', required: true, defaultValue: 7.0, min: 0 },
        { name: 'years', label: 'Time Horizon (Years)', type: 'integer', required: true, defaultValue: 10, min: 1 }
      ]
    },
    validate: (inputs: { principal: number; rate: number; years: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.years <= 0) errors.push({ field: 'years', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Time horizon must be > 0.' });
      return errors;
    },
    calculate: (inputs: { principal: number; monthlyAddition?: number; rate: number; years: number }) => {
      return FormulaEngine.compoundInterest(inputs.principal, inputs.rate, 12, inputs.years, inputs.monthlyAddition || 0);
    },
    formatResult: (result: { futureValue: number; totalPrincipalInvested: number; totalInterestEarned: number }) => {
      return {
        primary: {
          label: 'Future Value',
          value: ResultFormatter.formatCurrency(result.futureValue),
          numericValue: result.futureValue
        },
        secondary: [
          { label: 'Total Principal Invested', value: ResultFormatter.formatCurrency(result.totalPrincipalInvested) },
          { label: 'Total Interest Earned', value: ResultFormatter.formatCurrency(result.totalInterestEarned) }
        ]
      };
    }
  },

  // 12. Break-Even Analysis Calculator
  {
    id: 'break-even',
    name: 'Break-Even Analysis Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    formulaMeta: {
      formulaName: 'Break-Even Unit Volume',
      formulaExpression: 'Q = Fixed Costs / (Price - Variable Cost)',
      variables: [{ symbol: 'Q', name: 'Units' }]
    },
    inputSchema: {
      fields: [
        { name: 'fixedCosts', label: 'Fixed Costs', type: 'currency', required: true, defaultValue: 5000, min: 0 },
        { name: 'pricePerUnit', label: 'Price per Unit', type: 'currency', required: true, defaultValue: 15, min: 0.01 },
        { name: 'variableCost', label: 'Variable Cost per Unit', type: 'currency', required: true, defaultValue: 5, min: 0 }
      ]
    },
    validate: (inputs: { fixedCosts: number; pricePerUnit: number; variableCost: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.pricePerUnit <= inputs.variableCost) {
        errors.push({
          field: 'pricePerUnit',
          code: 'MATHEMATICAL_DOMAIN_ERROR',
          message: 'Price per unit must be greater than variable cost per unit.'
        });
      }
      return errors;
    },
    calculate: (inputs: { fixedCosts: number; pricePerUnit: number; variableCost: number }) => {
      const cm = inputs.pricePerUnit - inputs.variableCost;
      const breakEvenUnits = Math.ceil(inputs.fixedCosts / cm);
      const breakEvenRevenue = breakEvenUnits * inputs.pricePerUnit;
      return { breakEvenUnits, breakEvenRevenue, contributionMargin: cm };
    },
    formatResult: (result: { breakEvenUnits: number; breakEvenRevenue: number; contributionMargin: number }) => {
      return {
        primary: {
          label: 'Break-Even Volume',
          value: `${ResultFormatter.formatInteger(result.breakEvenUnits)} units`,
          numericValue: result.breakEvenUnits
        },
        secondary: [
          { label: 'Break-Even Revenue', value: ResultFormatter.formatCurrency(result.breakEvenRevenue) },
          { label: 'Unit Contribution Margin', value: ResultFormatter.formatCurrency(result.contributionMargin) }
        ]
      };
    }
  },

  // 13. Profit Margin & Markup Calculator
  {
    id: 'profit-margin',
    name: 'Profit Margin & Markup Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    formulaMeta: {
      formulaName: 'Gross Margin and Markup',
      formulaExpression: 'Margin% = (P - C) / P, Markup% = (P - C) / C',
      variables: [{ symbol: 'P', name: 'Price' }, { symbol: 'C', name: 'Cost' }]
    },
    inputSchema: {
      fields: [
        { name: 'cost', label: 'Cost of Goods (COGS)', type: 'currency', required: true, defaultValue: 40, min: 0 },
        { name: 'revenue', label: 'Selling Price (Revenue)', type: 'currency', required: true, defaultValue: 100, min: 0.01 }
      ]
    },
    validate: (inputs: { cost: number; revenue: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.revenue <= 0) errors.push({ field: 'revenue', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Revenue must be > 0.' });
      return errors;
    },
    calculate: (inputs: { cost: number; revenue: number }) => {
      const grossProfit = PrecisionEngine.clean(inputs.revenue - inputs.cost);
      const marginPct = PrecisionEngine.clean((grossProfit / inputs.revenue) * 100);
      const markupPct = inputs.cost > 0 ? PrecisionEngine.clean((grossProfit / inputs.cost) * 100) : 0;
      return { grossProfit, marginPct, markupPct };
    },
    formatResult: (result: { grossProfit: number; marginPct: number; markupPct: number }) => {
      return {
        primary: {
          label: 'Profit Margin',
          value: ResultFormatter.formatPercentage(result.marginPct),
          numericValue: result.marginPct
        },
        secondary: [
          { label: 'Markup Percentage', value: ResultFormatter.formatPercentage(result.markupPct) },
          { label: 'Gross Profit', value: ResultFormatter.formatCurrency(result.grossProfit) }
        ]
      };
    }
  },

  // 14. Construction Material & Concrete Calculator
  {
    id: 'construction-calc',
    name: 'Construction Material & Concrete Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Concrete Volume Sizing',
      formulaExpression: 'Yards = (L_ft * W_ft * D_in / 12) / 27',
      variables: [{ symbol: 'L, W', name: 'Length & Width' }]
    },
    inputSchema: {
      fields: [
        { name: 'length', label: 'Length (ft)', type: 'number', required: true, defaultValue: 20, min: 0 },
        { name: 'width', label: 'Width (ft)', type: 'number', required: true, defaultValue: 15, min: 0 },
        { name: 'depthInches', label: 'Thickness (inches)', type: 'number', required: true, defaultValue: 4, min: 1 }
      ]
    },
    validate: (inputs: { length: number; width: number; depthInches: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.length <= 0) errors.push({ field: 'length', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Length must be > 0.' });
      if (inputs.width <= 0) errors.push({ field: 'width', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Width must be > 0.' });
      return errors;
    },
    calculate: (inputs: { length: number; width: number; depthInches: number }) => {
      const cuFt = inputs.length * inputs.width * (inputs.depthInches / 12);
      const cuYdsNet = PrecisionEngine.clean(cuFt / 27);
      const cuYdsWithWaste = PrecisionEngine.clean(cuYdsNet * 1.10);
      const bags80lb = Math.ceil(cuFt / 0.6);
      return { cuYdsNet, cuYdsWithWaste, bags80lb };
    },
    formatResult: (result: { cuYdsNet: number; cuYdsWithWaste: number; bags80lb: number }) => {
      return {
        primary: {
          label: 'Concrete Required (+10% waste)',
          value: `${ResultFormatter.formatDecimal(result.cuYdsWithWaste)} cu yds`,
          numericValue: result.cuYdsWithWaste
        },
        secondary: [
          { label: 'Exact Net Volume', value: `${ResultFormatter.formatDecimal(result.cuYdsNet)} cu yds` },
          { label: '80lb Premix Bags', value: `~${result.bags80lb} bags` }
        ]
      };
    }
  },

  // 15. BMI Calculator
  {
    id: 'bmi',
    name: 'BMI Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'Body Mass Index',
      formulaExpression: 'BMI = weight_kg / (height_m)²',
      variables: [{ symbol: 'kg, m', name: 'Weight & Height' }]
    },
    inputSchema: {
      fields: [
        { name: 'weightKg', label: 'Weight (kg)', type: 'number', required: true, defaultValue: 72, min: 20, max: 300 },
        { name: 'heightCm', label: 'Height (cm)', type: 'number', required: true, defaultValue: 175, min: 50, max: 250 }
      ]
    },
    validate: (inputs: { weightKg: number; heightCm: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.weightKg <= 0) errors.push({ field: 'weightKg', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Weight must be > 0.' });
      if (inputs.heightCm <= 0) errors.push({ field: 'heightCm', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Height must be > 0.' });
      return errors;
    },
    calculate: (inputs: { weightKg: number; heightCm: number }) => {
      const heightM = inputs.heightCm / 100;
      const bmi = PrecisionEngine.clean(inputs.weightKg / (heightM * heightM));
      let category = 'Normal weight';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal weight';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      return { bmi, category };
    },
    formatResult: (result: { bmi: number; category: string }) => {
      return {
        primary: {
          label: 'BMI Score',
          value: ResultFormatter.formatDecimal(result.bmi, 1),
          numericValue: result.bmi,
          unit: 'kg/m²'
        },
        secondary: [
          { label: 'Classification', value: result.category }
        ]
      };
    }
  },

  // 16. BMR & TDEE Calorie Calculator
  {
    id: 'bmr-tdee',
    name: 'BMR & TDEE Calorie Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    formulaMeta: {
      formulaName: 'Mifflin-St Jeor Metabolic Equations',
      formulaExpression: 'BMR = 10w + 6.25h - 5a + s',
      variables: [{ symbol: 'w, h, a', name: 'Weight, Height, Age' }]
    },
    inputSchema: {
      fields: [
        { name: 'weightKg', label: 'Weight (kg)', type: 'number', required: true, defaultValue: 80, min: 30 },
        { name: 'heightCm', label: 'Height (cm)', type: 'number', required: true, defaultValue: 180, min: 100 },
        { name: 'age', label: 'Age', type: 'integer', required: true, defaultValue: 30, min: 15, max: 100 },
        { name: 'gender', label: 'Gender', type: 'select', required: true, defaultValue: 'male' }
      ]
    },
    validate: (inputs: { weightKg: number; heightCm: number; age: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.age <= 0) errors.push({ field: 'age', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Age must be > 0.' });
      return errors;
    },
    calculate: (inputs: { weightKg: number; heightCm: number; age: number; gender?: string }) => {
      const isMale = inputs.gender !== 'female';
      const bmr = (10 * inputs.weightKg) + (6.25 * inputs.heightCm) - (5 * inputs.age) + (isMale ? 5 : -161);
      const tdeeModerate = PrecisionEngine.clean(bmr * 1.55);
      return { bmr: PrecisionEngine.clean(bmr), tdee: tdeeModerate };
    },
    formatResult: (result: { bmr: number; tdee: number }) => {
      return {
        primary: {
          label: 'Basal Metabolic Rate (BMR)',
          value: `${ResultFormatter.formatInteger(result.bmr)} kcal/day`,
          numericValue: result.bmr
        },
        secondary: [
          { label: 'Maintenance TDEE (Moderate)', value: `${ResultFormatter.formatInteger(result.tdee)} kcal/day` }
        ]
      };
    }
  },

  // 17. Age Calculator
  {
    id: 'exact-age',
    name: 'Age Calculator',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    formulaMeta: {
      formulaName: 'Chronological Gregorian Span',
      formulaExpression: 'Age = Target Date - Date of Birth',
      variables: [{ symbol: 'DOB', name: 'Birth date' }]
    },
    inputSchema: {
      fields: [
        { name: 'birthDate', label: 'Date of Birth', type: 'date', required: true, defaultValue: '1995-06-15' }
      ]
    },
    validate: (inputs: { birthDate: string }) => {
      const errors: CalculationError[] = [];
      const dErr = ValidationEngine.validateDate('birthDate', inputs.birthDate);
      if (dErr) errors.push(dErr);
      return errors;
    },
    calculate: (inputs: { birthDate: string; targetDate?: string }) => {
      const birth = new Date(inputs.birthDate);
      const target = inputs.targetDate ? new Date(inputs.targetDate) : new Date();

      let years = target.getFullYear() - birth.getFullYear();
      let months = target.getMonth() - birth.getMonth();
      let days = target.getDate() - birth.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return { years, months, days, totalDays };
    },
    formatResult: (result: { years: number; months: number; days: number; totalDays: number }) => {
      return {
        primary: {
          label: 'Exact Chronological Age',
          value: `${result.years} years, ${result.months} months, ${result.days} days`,
          numericValue: result.years
        },
        secondary: [
          { label: 'Total Days Lived', value: ResultFormatter.formatInteger(result.totalDays) }
        ]
      };
    }
  },

  // 18. Date Difference & Business Days Calculator
  {
    id: 'date-difference',
    name: 'Date Difference & Business Days Calculator',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    formulaMeta: {
      formulaName: 'Calendar & Business Days Delta',
      formulaExpression: 'Days = Date₂ - Date₁',
      variables: [{ symbol: 'D1, D2', name: 'Dates' }]
    },
    inputSchema: {
      fields: [
        { name: 'startDate', label: 'Start Date', type: 'date', required: true, defaultValue: '2026-10-05' },
        { name: 'endDate', label: 'End Date', type: 'date', required: true, defaultValue: '2026-10-16' }
      ]
    },
    validate: (inputs: { startDate: string; endDate: string }) => {
      const errors: CalculationError[] = [];
      const ordErr = ValidationEngine.validateDateOrder('startDate', inputs.startDate, 'endDate', inputs.endDate);
      if (ordErr) errors.push(ordErr);
      return errors;
    },
    calculate: (inputs: { startDate: string; endDate: string }) => {
      const start = new Date(inputs.startDate);
      const end = new Date(inputs.endDate);
      const totalDays = Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      let businessDays = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return { totalDays, businessDays };
    },
    formatResult: (result: { totalDays: number; businessDays: number }) => {
      return {
        primary: {
          label: 'Total Calendar Days',
          value: `${result.totalDays} days`,
          numericValue: result.totalDays
        },
        secondary: [
          { label: 'Business Working Days', value: `${result.businessDays} days` }
        ]
      };
    }
  },

  // 19. Ohm's Law & Power Calculator
  {
    id: 'ohms-law',
    name: "Ohm's Law & Power Calculator",
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    formulaMeta: {
      formulaName: "Ohm's Law",
      formulaExpression: 'V = I * R, P = V * I',
      variables: [{ symbol: 'V, I, R, P', name: 'Electrical units' }]
    },
    inputSchema: {
      fields: [
        { name: 'voltage', label: 'Voltage (V)', type: 'number', required: false, defaultValue: 120, min: 0 },
        { name: 'current', label: 'Current (A)', type: 'number', required: false, defaultValue: 12.5, min: 0 }
      ]
    },
    validate: (inputs: { voltage?: number; current?: number }) => [],
    calculate: (inputs: { voltage?: number; current?: number; resistance?: number; power?: number }) => {
      return FormulaEngine.ohmsLawSolve(inputs.voltage, inputs.current, inputs.resistance, inputs.power);
    },
    formatResult: (result: { voltage: number; current: number; resistance: number; power: number }) => {
      return {
        primary: {
          label: 'Power (Dissipation)',
          value: `${ResultFormatter.formatDecimal(result.power)} Watts`,
          numericValue: result.power,
          unit: 'W'
        },
        secondary: [
          { label: 'Voltage', value: `${ResultFormatter.formatDecimal(result.voltage)} V` },
          { label: 'Current', value: `${ResultFormatter.formatDecimal(result.current)} A` },
          { label: 'Resistance', value: `${ResultFormatter.formatDecimal(result.resistance)} Ω` }
        ]
      };
    }
  },

  // 20. Electricity Appliance Cost Calculator
  {
    id: 'electricity-cost',
    name: 'Electricity Appliance Cost Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    formulaMeta: {
      formulaName: 'Kilowatt-Hour Cost Evaluation',
      formulaExpression: 'Cost = (Watts * Hours / 1000) * Rate',
      variables: [{ symbol: 'W', name: 'Watts' }]
    },
    inputSchema: {
      fields: [
        { name: 'watts', label: 'Appliance Wattage', type: 'number', required: true, defaultValue: 1200, min: 1 },
        { name: 'hoursPerDay', label: 'Hours Used Per Day', type: 'number', required: true, defaultValue: 8, min: 0.1, max: 24 },
        { name: 'ratePerKwh', label: 'Electricity Cost ($/kWh)', type: 'number', required: true, defaultValue: 0.15, min: 0.01 }
      ]
    },
    validate: (inputs: { watts: number; hoursPerDay: number; ratePerKwh: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.watts <= 0) errors.push({ field: 'watts', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Wattage must be > 0.' });
      return errors;
    },
    calculate: (inputs: { watts: number; hoursPerDay: number; ratePerKwh: number }) => {
      return FormulaEngine.electricityCost(inputs.watts, inputs.hoursPerDay, inputs.ratePerKwh, 30);
    },
    formatResult: (result: { kwhPerDay: number; kwhTotal: number; totalCost: number }) => {
      return {
        primary: {
          label: 'Estimated Monthly Cost (30 days)',
          value: ResultFormatter.formatCurrency(result.totalCost),
          numericValue: result.totalCost
        },
        secondary: [
          { label: 'Daily Energy Consumption', value: `${ResultFormatter.formatDecimal(result.kwhPerDay)} kWh/day` },
          { label: 'Monthly Energy Consumption', value: `${ResultFormatter.formatDecimal(result.kwhTotal)} kWh` }
        ]
      };
    }
  },

  // 21. Hydraulic Cylinder Force Calculator
  {
    id: 'hydraulic-force',
    name: 'Hydraulic Cylinder Force Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    formulaMeta: {
      formulaName: "Pascal's Law Piston Force",
      formulaExpression: 'F = P * A = P * π(d/2)²',
      variables: [{ symbol: 'P', name: 'Pressure' }, { symbol: 'd', name: 'Diameter' }]
    },
    inputSchema: {
      fields: [
        { name: 'pressurePsi', label: 'System Pressure (PSI)', type: 'number', required: true, defaultValue: 2500, min: 1 },
        { name: 'boreDiameterInches', label: 'Piston Bore Diameter (inches)', type: 'number', required: true, defaultValue: 3.0, min: 0.1 }
      ]
    },
    validate: (inputs: { pressurePsi: number; boreDiameterInches: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.pressurePsi <= 0) errors.push({ field: 'pressurePsi', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Pressure must be > 0.' });
      return errors;
    },
    calculate: (inputs: { pressurePsi: number; boreDiameterInches: number }) => {
      return FormulaEngine.hydraulicPistonForce(inputs.pressurePsi, inputs.boreDiameterInches);
    },
    formatResult: (result: { forceLbs: number; forceTons: number; areaSqIn: number }) => {
      return {
        primary: {
          label: 'Piston Thrust Force',
          value: `${ResultFormatter.formatDecimal(result.forceTons)} Tons`,
          numericValue: result.forceTons
        },
        secondary: [
          { label: 'Force in Pounds', value: `${ResultFormatter.formatInteger(result.forceLbs)} lbs` },
          { label: 'Effective Piston Area', value: `${ResultFormatter.formatDecimal(result.areaSqIn)} sq in` }
        ]
      };
    }
  },

  // 22. Kinetic & Potential Energy Calculator
  {
    id: 'kinetic-energy',
    name: 'Kinetic & Potential Energy Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    formulaMeta: {
      formulaName: 'Newtonian Mechanical Energy',
      formulaExpression: 'KE = 1/2 * m * v², PE = m * g * h',
      variables: [{ symbol: 'm', name: 'Mass' }, { symbol: 'v', name: 'Velocity' }]
    },
    inputSchema: {
      fields: [
        { name: 'massKg', label: 'Mass (kg)', type: 'number', required: true, defaultValue: 1500, min: 0 },
        { name: 'velocityMps', label: 'Velocity (m/s)', type: 'number', required: true, defaultValue: 20, min: 0 }
      ]
    },
    validate: (inputs: { massKg: number; velocityMps: number }) => [],
    calculate: (inputs: { massKg: number; velocityMps: number }) => {
      const keJoules = FormulaEngine.kineticEnergy(inputs.massKg, inputs.velocityMps);
      const keKilojoules = PrecisionEngine.clean(keJoules / 1000);
      return { keJoules, keKilojoules };
    },
    formatResult: (result: { keJoules: number; keKilojoules: number }) => {
      return {
        primary: {
          label: 'Kinetic Energy',
          value: `${ResultFormatter.formatDecimal(result.keKilojoules)} kJ`,
          numericValue: result.keKilojoules
        },
        secondary: [
          { label: 'Energy in Joules', value: `${ResultFormatter.formatInteger(result.keJoules)} J` }
        ]
      };
    }
  },

  // 23. Tip & Bill Split Calculator
  {
    id: 'tip-split',
    name: 'Tip & Bill Split Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    formulaMeta: {
      formulaName: 'Gratuity & Bill Split',
      formulaExpression: 'Tip = Bill * (t / 100), Per Person = (Bill + Tip) / N',
      variables: [{ symbol: 'Bill', name: 'Bill Subtotal' }]
    },
    inputSchema: {
      fields: [
        { name: 'billAmount', label: 'Bill Subtotal', type: 'currency', required: true, defaultValue: 84.0, min: 0 },
        { name: 'tipPercent', label: 'Tip Percentage', type: 'percentage', required: true, defaultValue: 20, min: 0 },
        { name: 'guests', label: 'Number of Guests', type: 'integer', required: true, defaultValue: 3, min: 1 }
      ]
    },
    validate: (inputs: { billAmount: number; guests: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.guests < 1) errors.push({ field: 'guests', code: 'RANGE_OUT_OF_BOUNDS', message: 'Guests must be at least 1.' });
      return errors;
    },
    calculate: (inputs: { billAmount: number; tipPercent: number; guests: number }) => {
      const tip = PrecisionEngine.clean((inputs.tipPercent / 100) * inputs.billAmount);
      const total = PrecisionEngine.clean(inputs.billAmount + tip);
      const perPerson = PrecisionEngine.roundFinancial(total / (inputs.guests || 1));
      return { tip, total, perPerson, guests: inputs.guests };
    },
    formatResult: (result: { tip: number; total: number; perPerson: number }) => {
      return {
        primary: {
          label: 'Payment Per Person',
          value: ResultFormatter.formatCurrency(result.perPerson),
          numericValue: result.perPerson
        },
        secondary: [
          { label: 'Total Tip', value: ResultFormatter.formatCurrency(result.tip) },
          { label: 'Total Bill (with tip)', value: ResultFormatter.formatCurrency(result.total) }
        ]
      };
    }
  },

  // 24. Discount & Sales Tax Calculator
  {
    id: 'discount-tax',
    name: 'Discount & Sales Tax Calculator',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    formulaMeta: {
      formulaName: 'Retail Markdown and Tax',
      formulaExpression: 'P_final = (P_orig - Discount) * (1 + Tax Rate)',
      variables: [{ symbol: 'P_orig', name: 'Original Price' }]
    },
    inputSchema: {
      fields: [
        { name: 'originalPrice', label: 'Original Price', type: 'currency', required: true, defaultValue: 80.0, min: 0 },
        { name: 'discountPercent', label: 'Discount %', type: 'percentage', required: true, defaultValue: 25, min: 0, max: 100 },
        { name: 'taxPercent', label: 'Sales Tax %', type: 'percentage', required: true, defaultValue: 8.25, min: 0 }
      ]
    },
    validate: (inputs: { originalPrice: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.originalPrice < 0) errors.push({ field: 'originalPrice', code: 'NON_NEGATIVE_REQUIRED', message: 'Price cannot be negative.' });
      return errors;
    },
    calculate: (inputs: { originalPrice: number; discountPercent: number; taxPercent: number }) => {
      const discountAmount = PrecisionEngine.clean(inputs.originalPrice * (inputs.discountPercent / 100));
      const discountedPrice = PrecisionEngine.clean(inputs.originalPrice - discountAmount);
      const taxAmount = PrecisionEngine.clean(discountedPrice * (inputs.taxPercent / 100));
      const finalPrice = PrecisionEngine.roundFinancial(discountedPrice + taxAmount);
      return { discountAmount, discountedPrice, taxAmount, finalPrice };
    },
    formatResult: (result: { discountAmount: number; discountedPrice: number; taxAmount: number; finalPrice: number }) => {
      return {
        primary: {
          label: 'Final Out-of-Pocket Price',
          value: ResultFormatter.formatCurrency(result.finalPrice),
          numericValue: result.finalPrice
        },
        secondary: [
          { label: 'You Save', value: ResultFormatter.formatCurrency(result.discountAmount) },
          { label: 'Sales Tax Amount', value: ResultFormatter.formatCurrency(result.taxAmount) }
        ]
      };
    }
  }
];
