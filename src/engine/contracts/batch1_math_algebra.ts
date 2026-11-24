import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';
import { ValidationEngine } from '../ValidationEngine.ts';

export const BATCH1_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Fraction Arithmetic
  {
    id: 'fraction-arithmetic',
    name: 'Fraction Arithmetic Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Fraction Arithmetic Operations',
      formulaExpression: 'a/b ± c/d = (ad ± bc)/bd, (a/b) * (c/d) = ac/bd',
      variables: [{ symbol: 'a, b', name: 'Fraction 1' }, { symbol: 'c, d', name: 'Fraction 2' }]
    },
    inputSchema: {
      fields: [
        { name: 'num1', label: 'Numerator 1', type: 'integer', required: true, defaultValue: 1 },
        { name: 'den1', label: 'Denominator 1', type: 'integer', required: true, defaultValue: 2 },
        {
          name: 'operation',
          label: 'Operation',
          type: 'select',
          required: true,
          defaultValue: 'add',
          options: [
            { label: 'Add (+)', value: 'add' },
            { label: 'Subtract (-)', value: 'subtract' },
            { label: 'Multiply (×)', value: 'multiply' },
            { label: 'Divide (÷)', value: 'divide' }
          ]
        },
        { name: 'num2', label: 'Numerator 2', type: 'integer', required: true, defaultValue: 1 },
        { name: 'den2', label: 'Denominator 2', type: 'integer', required: true, defaultValue: 3 }
      ]
    },
    validate: (inputs: { num1: number; den1: number; num2: number; den2: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.den1 === 0) errors.push({ field: 'den1', code: 'DIVISION_BY_ZERO', message: 'Denominator 1 cannot be zero.' });
      if (inputs.den2 === 0) errors.push({ field: 'den2', code: 'DIVISION_BY_ZERO', message: 'Denominator 2 cannot be zero.' });
      return errors;
    },
    calculate: (inputs: { num1: number; den1: number; num2: number; den2: number; operation: string }) => {
      let n = 0;
      let d = 1;
      if (inputs.operation === 'add') {
        n = inputs.num1 * inputs.den2 + inputs.num2 * inputs.den1;
        d = inputs.den1 * inputs.den2;
      } else if (inputs.operation === 'subtract') {
        n = inputs.num1 * inputs.den2 - inputs.num2 * inputs.den1;
        d = inputs.den1 * inputs.den2;
      } else if (inputs.operation === 'multiply') {
        n = inputs.num1 * inputs.num2;
        d = inputs.den1 * inputs.den2;
      } else if (inputs.operation === 'divide') {
        if (inputs.num2 === 0) throw new Error('Cannot divide by fraction with zero numerator.');
        n = inputs.num1 * inputs.den2;
        d = inputs.den1 * inputs.num2;
      }
      if (d < 0) {
        n = -n;
        d = -d;
      }
      const gcd = FormulaEngine.gcd(n, d);
      const reducedNum = n / gcd;
      const reducedDen = d / gcd;
      const decimalVal = PrecisionEngine.clean(reducedNum / reducedDen);
      return { reducedNum, reducedDen, decimalVal };
    },
    formatResult: (result: { reducedNum: number; reducedDen: number; decimalVal: number }) => ({
      primary: {
        label: 'Resulting Fraction',
        value: `${result.reducedNum} / ${result.reducedDen}`,
        numericValue: result.decimalVal
      },
      secondary: [
        { label: 'Decimal Approximation', value: ResultFormatter.formatDecimal(result.decimalVal, 4) }
      ]
    })
  },

  // 2. Fraction Reducer
  {
    id: 'fraction-reducer',
    name: 'Fraction Reducer & Simplifier',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Euclidean GCD Reduction',
      formulaExpression: 'Simplified = (a / GCD) / (b / GCD)',
      variables: [{ symbol: 'a', name: 'Numerator' }, { symbol: 'b', name: 'Denominator' }]
    },
    inputSchema: {
      fields: [
        { name: 'numerator', label: 'Numerator', type: 'integer', required: true, defaultValue: 24 },
        { name: 'denominator', label: 'Denominator', type: 'integer', required: true, defaultValue: 36 }
      ]
    },
    validate: (inputs: { denominator: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.denominator === 0) errors.push({ field: 'denominator', code: 'DIVISION_BY_ZERO', message: 'Denominator cannot be zero.' });
      return errors;
    },
    calculate: (inputs: { numerator: number; denominator: number }) => {
      let n = inputs.numerator;
      let d = inputs.denominator;
      if (d < 0) { n = -n; d = -d; }
      const gcd = FormulaEngine.gcd(n, d);
      return {
        reducedNum: n / gcd,
        reducedDen: d / gcd,
        gcd,
        decimal: PrecisionEngine.clean(n / d)
      };
    },
    formatResult: (result: { reducedNum: number; reducedDen: number; gcd: number; decimal: number }) => ({
      primary: {
        label: 'Simplified Fraction',
        value: `${result.reducedNum} / ${result.reducedDen}`,
        numericValue: result.decimal
      },
      secondary: [
        { label: 'Greatest Common Divisor (GCD)', value: result.gcd.toString() },
        { label: 'Decimal Equivalent', value: ResultFormatter.formatDecimal(result.decimal, 4) }
      ]
    })
  },

  // 3. Percentage Increase & Decrease
  {
    id: 'percent-change',
    name: 'Percentage Increase & Decrease Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Relative Percentage Change',
      formulaExpression: 'Δ% = ((New - Old) / Old) * 100',
      variables: [{ symbol: 'Old', name: 'Original Value' }, { symbol: 'New', name: 'New Value' }]
    },
    inputSchema: {
      fields: [
        { name: 'oldValue', label: 'Initial (Old) Value', type: 'number', required: true, defaultValue: 50 },
        { name: 'newValue', label: 'Final (New) Value', type: 'number', required: true, defaultValue: 65 }
      ]
    },
    validate: (inputs: { oldValue: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.oldValue === 0) errors.push({ field: 'oldValue', code: 'DIVISION_BY_ZERO', message: 'Base original value cannot be zero.' });
      return errors;
    },
    calculate: (inputs: { oldValue: number; newValue: number }) => {
      const diff = inputs.newValue - inputs.oldValue;
      const changePct = PrecisionEngine.clean((diff / Math.abs(inputs.oldValue)) * 100);
      return {
        changePct,
        absoluteDiff: diff,
        isIncrease: diff >= 0
      };
    },
    formatResult: (result: { changePct: number; absoluteDiff: number; isIncrease: boolean }) => ({
      primary: {
        label: result.isIncrease ? 'Percentage Increase' : 'Percentage Decrease',
        value: ResultFormatter.formatPercentage(Math.abs(result.changePct)),
        numericValue: result.changePct
      },
      secondary: [
        { label: 'Absolute Difference', value: ResultFormatter.formatDecimal(result.absoluteDiff) },
        { label: 'Direction', value: result.isIncrease ? 'Growth (+)' : 'Decline (-)' }
      ]
    })
  },

  // 4. Percentage Difference
  {
    id: 'percent-difference',
    name: 'Percentage Difference Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Symmetric Percent Difference',
      formulaExpression: 'Diff% = (|A - B| / ((A + B) / 2)) * 100',
      variables: [{ symbol: 'A', name: 'Value A' }, { symbol: 'B', name: 'Value B' }]
    },
    inputSchema: {
      fields: [
        { name: 'valA', label: 'First Value (A)', type: 'number', required: true, defaultValue: 80, min: 0 },
        { name: 'valB', label: 'Second Value (B)', type: 'number', required: true, defaultValue: 100, min: 0 }
      ]
    },
    validate: (inputs: { valA: number; valB: number }) => {
      const errors: CalculationError[] = [];
      if (inputs.valA + inputs.valB === 0) errors.push({ field: 'valA', code: 'DIVISION_BY_ZERO', message: 'Sum of both values cannot be zero.' });
      return errors;
    },
    calculate: (inputs: { valA: number; valB: number }) => {
      const diffPct = FormulaEngine.percentageDifference(inputs.valA, inputs.valB);
      const avg = (inputs.valA + inputs.valB) / 2;
      return { diffPct, avg, absDiff: Math.abs(inputs.valA - inputs.valB) };
    },
    formatResult: (result: { diffPct: number; avg: number; absDiff: number }) => ({
      primary: {
        label: 'Percentage Difference',
        value: ResultFormatter.formatPercentage(result.diffPct),
        numericValue: result.diffPct
      },
      secondary: [
        { label: 'Average Value', value: ResultFormatter.formatDecimal(result.avg) },
        { label: 'Absolute Difference', value: ResultFormatter.formatDecimal(result.absDiff) }
      ]
    })
  },

  // 5. Reverse Percentage
  {
    id: 'reverse-percentage',
    name: 'Reverse Percentage Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Reverse Base Value',
      formulaExpression: 'Base = Final / (1 ± (Rate / 100))',
      variables: [{ symbol: 'Final', name: 'Observed Final' }, { symbol: 'Rate', name: 'Rate applied' }]
    },
    inputSchema: {
      fields: [
        { name: 'finalValue', label: 'Final Amount', type: 'number', required: true, defaultValue: 120 },
        { name: 'percentage', label: 'Percentage Applied', type: 'percentage', required: true, defaultValue: 20 },
        {
          name: 'type',
          label: 'Application Type',
          type: 'select',
          required: true,
          defaultValue: 'increase',
          options: [
            { label: 'After Increase / Tax (+%)', value: 'increase' },
            { label: 'After Discount / Reduction (-%)', value: 'decrease' },
            { label: 'Direct Portion (% of total)', value: 'portion' }
          ]
        }
      ]
    },
    validate: (inputs: { percentage: number; type: string }) => {
      const errors: CalculationError[] = [];
      if (inputs.type === 'decrease' && inputs.percentage >= 100) {
        errors.push({ field: 'percentage', code: 'RANGE_OUT_OF_BOUNDS', message: 'Discount cannot be 100% or more.' });
      }
      return errors;
    },
    calculate: (inputs: { finalValue: number; percentage: number; type: string }) => {
      let original = 0;
      if (inputs.type === 'increase') {
        original = PrecisionEngine.clean(inputs.finalValue / (1 + inputs.percentage / 100));
      } else if (inputs.type === 'decrease') {
        original = PrecisionEngine.clean(inputs.finalValue / (1 - inputs.percentage / 100));
      } else {
        original = FormulaEngine.reversePercentage(inputs.finalValue, inputs.percentage);
      }
      const difference = PrecisionEngine.clean(inputs.finalValue - original);
      return { original, difference };
    },
    formatResult: (result: { original: number; difference: number }) => ({
      primary: {
        label: 'Original Starting Value',
        value: ResultFormatter.formatDecimal(result.original),
        numericValue: result.original
      },
      secondary: [
        { label: 'Amount Changed', value: ResultFormatter.formatDecimal(Math.abs(result.difference)) }
      ]
    })
  },

  // 6. Fraction to Percentage
  {
    id: 'fraction-to-percent',
    name: 'Fraction to Percentage Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Fraction to Percentage Conversion',
      formulaExpression: 'P = (Num / Den) * 100',
      variables: [{ symbol: 'Num', name: 'Numerator' }, { symbol: 'Den', name: 'Denominator' }]
    },
    inputSchema: {
      fields: [
        { name: 'numerator', label: 'Numerator', type: 'number', required: true, defaultValue: 3 },
        { name: 'denominator', label: 'Denominator', type: 'number', required: true, defaultValue: 8 }
      ]
    },
    validate: (inputs: { denominator: number }) => {
      if (inputs.denominator === 0) return [{ field: 'denominator', code: 'DIVISION_BY_ZERO', message: 'Denominator cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { numerator: number; denominator: number }) => {
      const pct = PrecisionEngine.clean((inputs.numerator / inputs.denominator) * 100);
      const decimal = PrecisionEngine.clean(inputs.numerator / inputs.denominator);
      return { pct, decimal };
    },
    formatResult: (result: { pct: number; decimal: number }) => ({
      primary: {
        label: 'Percentage',
        value: ResultFormatter.formatPercentage(result.pct),
        numericValue: result.pct
      },
      secondary: [
        { label: 'Decimal Equivalent', value: ResultFormatter.formatDecimal(result.decimal, 4) }
      ]
    })
  },

  // 7. Decimal to Fraction
  {
    id: 'decimal-to-fraction',
    name: 'Decimal to Fraction Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Decimal to Exact Fraction',
      formulaExpression: 'x = (x * 10ⁿ) / 10ⁿ',
      variables: [{ symbol: 'x', name: 'Decimal input' }]
    },
    inputSchema: {
      fields: [
        { name: 'decimal', label: 'Decimal Number', type: 'decimal', required: true, defaultValue: 0.625 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { decimal: number }) => {
      const str = String(inputs.decimal);
      const decPart = str.split('.')[1] || '';
      const precision = Math.pow(10, decPart.length);
      const n = Math.round(inputs.decimal * precision);
      const d = precision;
      const gcd = FormulaEngine.gcd(n, d);
      return { num: n / gcd, den: d / gcd };
    },
    formatResult: (result: { num: number; den: number }) => ({
      primary: {
        label: 'Fraction (Simplified)',
        value: `${result.num} / ${result.den}`,
        numericValue: result.num / result.den
      }
    })
  },

  // 8. Ratio Simplifier
  {
    id: 'ratio-simplifier',
    name: 'Ratio Simplifier Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    formulaMeta: {
      formulaName: 'GCD Ratio Simplification',
      formulaExpression: 'A/GCD : B/GCD',
      variables: [{ symbol: 'A, B', name: 'Ratio parts' }]
    },
    inputSchema: {
      fields: [
        { name: 'termA', label: 'First Term (A)', type: 'number', required: true, defaultValue: 120 },
        { name: 'termB', label: 'Second Term (B)', type: 'number', required: true, defaultValue: 80 }
      ]
    },
    validate: (inputs: { termB: number }) => {
      if (inputs.termB === 0) return [{ field: 'termB', code: 'DIVISION_BY_ZERO', message: 'Ratio term B cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { termA: number; termB: number }) => {
      const gcd = FormulaEngine.gcd(inputs.termA, inputs.termB);
      const simA = inputs.termA / gcd;
      const simB = inputs.termB / gcd;
      const dec = PrecisionEngine.clean(inputs.termA / inputs.termB);
      return { simA, simB, gcd, dec };
    },
    formatResult: (result: { simA: number; simB: number; gcd: number; dec: number }) => ({
      primary: {
        label: 'Simplified Ratio',
        value: `${result.simA} : ${result.simB}`,
        numericValue: result.dec
      },
      secondary: [
        { label: 'Decimal Ratio', value: ResultFormatter.formatDecimal(result.dec, 3) },
        { label: 'Common Divisor', value: result.gcd.toString() }
      ]
    })
  },

  // 9. Proportion Solver
  {
    id: 'proportion-solver',
    name: 'Proportion & Cross Multiplication Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    formulaMeta: {
      formulaName: 'Cross Multiplication',
      formulaExpression: 'A / B = C / x  =>  x = (B * C) / A',
      variables: [{ symbol: 'A, B, C', name: 'Known terms' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Term A', type: 'number', required: true, defaultValue: 4 },
        { name: 'b', label: 'Term B', type: 'number', required: true, defaultValue: 10 },
        { name: 'c', label: 'Term C', type: 'number', required: true, defaultValue: 8 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (inputs.a === 0) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'Term A cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number }) => {
      const x = PrecisionEngine.clean((inputs.b * inputs.c) / inputs.a);
      return { x };
    },
    formatResult: (result: { x: number }) => ({
      primary: {
        label: 'Missing Value (x)',
        value: ResultFormatter.formatDecimal(result.x),
        numericValue: result.x
      }
    })
  },

  // 10. Golden Ratio
  {
    id: 'golden-ratio',
    name: 'Golden Ratio Calculator (Phi)',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    formulaMeta: {
      formulaName: 'Divine Proportion (φ)',
      formulaExpression: 'φ = (1 + √5)/2 ≈ 1.6180339887',
      variables: [{ symbol: 'a', name: 'Primary segment' }]
    },
    inputSchema: {
      fields: [
        { name: 'length', label: 'Given Length', type: 'number', required: true, defaultValue: 100, min: 0 }
      ]
    },
    validate: (inputs: { length: number }) => {
      if (inputs.length <= 0) return [{ field: 'length', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Length must be > 0.' }];
      return [];
    },
    calculate: (inputs: { length: number }) => {
      const PHI = 1.6180339887;
      const longer = PrecisionEngine.clean(inputs.length * PHI);
      const shorter = PrecisionEngine.clean(inputs.length / PHI);
      return { longer, shorter };
    },
    formatResult: (result: { longer: number; shorter: number }) => ({
      primary: {
        label: 'Golden Ratio Greater (x * φ)',
        value: ResultFormatter.formatDecimal(result.longer, 2),
        numericValue: result.longer
      },
      secondary: [
        { label: 'Golden Ratio Lesser (x / φ)', value: ResultFormatter.formatDecimal(result.shorter, 2) }
      ]
    })
  },

  // 11. Scale Factor
  {
    id: 'scale-factor',
    name: 'Scale Factor & Dimension Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    formulaMeta: {
      formulaName: 'Geometric Scaling Ratios',
      formulaExpression: 'L_new = L * k, A_new = A * k², V_new = V * k³',
      variables: [{ symbol: 'k', name: 'Scale factor' }]
    },
    inputSchema: {
      fields: [
        { name: 'originalLength', label: 'Original Length', type: 'number', required: true, defaultValue: 12, min: 0 },
        { name: 'scaleFactor', label: 'Scale Factor (k)', type: 'number', required: true, defaultValue: 2.5, min: 0 }
      ]
    },
    validate: (inputs: { scaleFactor: number }) => {
      if (inputs.scaleFactor <= 0) return [{ field: 'scaleFactor', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Scale factor must be > 0.' }];
      return [];
    },
    calculate: (inputs: { originalLength: number; scaleFactor: number }) => {
      const scaledLength = PrecisionEngine.clean(inputs.originalLength * inputs.scaleFactor);
      const areaFactor = PrecisionEngine.clean(Math.pow(inputs.scaleFactor, 2));
      const volumeFactor = PrecisionEngine.clean(Math.pow(inputs.scaleFactor, 3));
      return { scaledLength, areaFactor, volumeFactor };
    },
    formatResult: (result: { scaledLength: number; areaFactor: number; volumeFactor: number }) => ({
      primary: {
        label: 'Scaled Length',
        value: ResultFormatter.formatDecimal(result.scaledLength),
        numericValue: result.scaledLength
      },
      secondary: [
        { label: 'Area Multiplier (k²)', value: `${ResultFormatter.formatDecimal(result.areaFactor)}x` },
        { label: 'Volume Multiplier (k³)', value: `${ResultFormatter.formatDecimal(result.volumeFactor)}x` }
      ]
    })
  },

  // 12. Aspect Ratio
  {
    id: 'aspect-ratio',
    name: 'Aspect Ratio & Resolution Calculator',
    category: 'basic-math',
    subcategoryId: 'ratios-proportions',
    formulaMeta: {
      formulaName: 'Aspect Ratio Resolution',
      formulaExpression: 'H = (W * R_H) / R_W',
      variables: [{ symbol: 'W', name: 'Width' }]
    },
    inputSchema: {
      fields: [
        { name: 'width', label: 'Width (px)', type: 'integer', required: true, defaultValue: 1920, min: 1 },
        { name: 'ratioW', label: 'Ratio Width', type: 'integer', required: true, defaultValue: 16 },
        { name: 'ratioH', label: 'Ratio Height', type: 'integer', required: true, defaultValue: 9 }
      ]
    },
    validate: (inputs: { ratioW: number }) => {
      if (inputs.ratioW <= 0) return [{ field: 'ratioW', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Ratio width must be > 0.' }];
      return [];
    },
    calculate: (inputs: { width: number; ratioW: number; ratioH: number }) => {
      const height = Math.round((inputs.width * inputs.ratioH) / inputs.ratioW);
      const totalPixels = inputs.width * height;
      const megapixels = PrecisionEngine.clean(totalPixels / 1000000);
      return { height, totalPixels, megapixels };
    },
    formatResult: (result: { height: number; megapixels: number }) => ({
      primary: {
        label: 'Calculated Height',
        value: `${result.height} px`,
        numericValue: result.height
      },
      secondary: [
        { label: 'Resolution', value: `${ResultFormatter.formatDecimal(result.megapixels, 2)} MP` }
      ]
    })
  },

  // 13. GCD & LCM
  {
    id: 'gcd-lcm',
    name: 'GCD & LCM Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Euclidean GCD & LCM',
      formulaExpression: 'LCM(a, b) = |a * b| / GCD(a, b)',
      variables: [{ symbol: 'a, b', name: 'Integers' }]
    },
    inputSchema: {
      fields: [
        { name: 'intA', label: 'First Integer (A)', type: 'integer', required: true, defaultValue: 48 },
        { name: 'intB', label: 'Second Integer (B)', type: 'integer', required: true, defaultValue: 180 }
      ]
    },
    validate: (inputs: { intA: number; intB: number }) => {
      if (inputs.intA === 0 || inputs.intB === 0) return [{ field: 'intA', code: 'NON_NEGATIVE_REQUIRED', message: 'Values must be non-zero integers.' }];
      return [];
    },
    calculate: (inputs: { intA: number; intB: number }) => {
      const gcd = FormulaEngine.gcd(inputs.intA, inputs.intB);
      const lcm = FormulaEngine.lcm(inputs.intA, inputs.intB);
      return { gcd, lcm };
    },
    formatResult: (result: { gcd: number; lcm: number }) => ({
      primary: {
        label: 'Greatest Common Divisor (GCD)',
        value: ResultFormatter.formatInteger(result.gcd),
        numericValue: result.gcd
      },
      secondary: [
        { label: 'Least Common Multiple (LCM)', value: ResultFormatter.formatInteger(result.lcm) }
      ]
    })
  },

  // 14. Long Division
  {
    id: 'long-division',
    name: 'Long Division & Remainder Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Division with Remainder',
      formulaExpression: 'Dividend = (Divisor * Quotient) + Remainder',
      variables: [{ symbol: 'a', name: 'Dividend' }, { symbol: 'b', name: 'Divisor' }]
    },
    inputSchema: {
      fields: [
        { name: 'dividend', label: 'Dividend', type: 'integer', required: true, defaultValue: 257 },
        { name: 'divisor', label: 'Divisor', type: 'integer', required: true, defaultValue: 12 }
      ]
    },
    validate: (inputs: { divisor: number }) => {
      if (inputs.divisor === 0) return [{ field: 'divisor', code: 'DIVISION_BY_ZERO', message: 'Divisor cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { dividend: number; divisor: number }) => {
      const quotient = Math.floor(inputs.dividend / inputs.divisor);
      const remainder = inputs.dividend % inputs.divisor;
      const decimal = PrecisionEngine.clean(inputs.dividend / inputs.divisor);
      return { quotient, remainder, decimal };
    },
    formatResult: (result: { quotient: number; remainder: number; decimal: number }) => ({
      primary: {
        label: 'Quotient with Remainder',
        value: `${result.quotient} R ${result.remainder}`,
        numericValue: result.decimal
      },
      secondary: [
        { label: 'Decimal Result', value: ResultFormatter.formatDecimal(result.decimal, 4) }
      ]
    })
  },

  // 15. Modulo Calculator
  {
    id: 'modulo-calculator',
    name: 'Modulo (Mod) Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Euclidean Modulo',
      formulaExpression: 'r = a mod n',
      variables: [{ symbol: 'a', name: 'Number' }, { symbol: 'n', name: 'Modulus' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Number (Dividend)', type: 'integer', required: true, defaultValue: 53 },
        { name: 'n', label: 'Modulus (Divisor)', type: 'integer', required: true, defaultValue: 7 }
      ]
    },
    validate: (inputs: { n: number }) => {
      if (inputs.n === 0) return [{ field: 'n', code: 'DIVISION_BY_ZERO', message: 'Modulus cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { a: number; n: number }) => {
      const mod = ((inputs.a % inputs.n) + inputs.n) % inputs.n;
      return { mod };
    },
    formatResult: (result: { mod: number }) => ({
      primary: {
        label: 'Modulo Result (r)',
        value: result.mod.toString(),
        numericValue: result.mod
      }
    })
  },

  // 16. Average Calculator
  {
    id: 'average-calculator',
    name: 'Average & Arithmetic Mean Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Arithmetic Mean',
      formulaExpression: 'Mean = Σx / N',
      variables: [{ symbol: 'x', name: 'Values' }]
    },
    inputSchema: {
      fields: [
        { name: 'val1', label: 'Value 1', type: 'number', required: true, defaultValue: 10 },
        { name: 'val2', label: 'Value 2', type: 'number', required: true, defaultValue: 25 },
        { name: 'val3', label: 'Value 3', type: 'number', required: true, defaultValue: 40 },
        { name: 'val4', label: 'Value 4', type: 'number', required: false, defaultValue: 65 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { val1: number; val2: number; val3: number; val4?: number }) => {
      const arr = [inputs.val1, inputs.val2, inputs.val3];
      if (inputs.val4 !== undefined && inputs.val4 !== null) arr.push(inputs.val4);
      const sum = arr.reduce((acc, curr) => acc + curr, 0);
      const mean = PrecisionEngine.clean(sum / arr.length);
      return { mean, sum, count: arr.length };
    },
    formatResult: (result: { mean: number; sum: number; count: number }) => ({
      primary: {
        label: 'Arithmetic Mean',
        value: ResultFormatter.formatDecimal(result.mean),
        numericValue: result.mean
      },
      secondary: [
        { label: 'Sum', value: ResultFormatter.formatDecimal(result.sum) },
        { label: 'Count', value: result.count.toString() }
      ]
    })
  },

  // 17. Absolute Value
  {
    id: 'absolute-value',
    name: 'Absolute Value & Distance Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Absolute Value & 1D Distance',
      formulaExpression: '|a - b|',
      variables: [{ symbol: 'a, b', name: 'Positions' }]
    },
    inputSchema: {
      fields: [
        { name: 'coordA', label: 'Coordinate A', type: 'number', required: true, defaultValue: -14.5 },
        { name: 'coordB', label: 'Coordinate B', type: 'number', required: true, defaultValue: 8.2 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { coordA: number; coordB: number }) => {
      const absA = Math.abs(inputs.coordA);
      const absB = Math.abs(inputs.coordB);
      const distance = Math.abs(inputs.coordA - inputs.coordB);
      return { absA, absB, distance };
    },
    formatResult: (result: { absA: number; absB: number; distance: number }) => ({
      primary: {
        label: 'Distance Between A and B',
        value: ResultFormatter.formatDecimal(result.distance),
        numericValue: result.distance
      },
      secondary: [
        { label: '|A|', value: ResultFormatter.formatDecimal(result.absA) },
        { label: '|B|', value: ResultFormatter.formatDecimal(result.absB) }
      ]
    })
  },

  // 18. Round to Sig Figs
  {
    id: 'round-to-sig-figs',
    name: 'Significant Figures Rounding Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    formulaMeta: {
      formulaName: 'Significant Figures Rounding',
      formulaExpression: 'Round to N significant digits',
      variables: [{ symbol: 'x', name: 'Number' }, { symbol: 'n', name: 'Sig Figs' }]
    },
    inputSchema: {
      fields: [
        { name: 'value', label: 'Original Number', type: 'number', required: true, defaultValue: 12345.67 },
        { name: 'sigFigs', label: 'Significant Figures (1-10)', type: 'integer', required: true, defaultValue: 4, min: 1, max: 10 }
      ]
    },
    validate: (inputs: { sigFigs: number }) => {
      if (inputs.sigFigs < 1) return [{ field: 'sigFigs', code: 'RANGE_OUT_OF_BOUNDS', message: 'Sig figs must be at least 1.' }];
      return [];
    },
    calculate: (inputs: { value: number; sigFigs: number }) => {
      const rounded = PrecisionEngine.toSignificantFigures(inputs.value, inputs.sigFigs);
      return { rounded };
    },
    formatResult: (result: { rounded: number }) => ({
      primary: {
        label: 'Rounded Value',
        value: result.rounded.toString(),
        numericValue: result.rounded
      }
    })
  },

  // 19. Round to Nearest
  {
    id: 'round-to-nearest',
    name: 'Round to Nearest Multiple Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    formulaMeta: {
      formulaName: 'Nearest Multiple Rounding',
      formulaExpression: 'y = round(x / m) * m',
      variables: [{ symbol: 'x', name: 'Value' }, { symbol: 'm', name: 'Multiple' }]
    },
    inputSchema: {
      fields: [
        { name: 'value', label: 'Number to Round', type: 'number', required: true, defaultValue: 187.6 },
        { name: 'multiple', label: 'Round to Nearest Multiple', type: 'number', required: true, defaultValue: 10, min: 0.0001 }
      ]
    },
    validate: (inputs: { multiple: number }) => {
      if (inputs.multiple <= 0) return [{ field: 'multiple', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Multiple must be > 0.' }];
      return [];
    },
    calculate: (inputs: { value: number; multiple: number }) => {
      const nearest = PrecisionEngine.clean(Math.round(inputs.value / inputs.multiple) * inputs.multiple);
      const floor = PrecisionEngine.clean(Math.floor(inputs.value / inputs.multiple) * inputs.multiple);
      const ceil = PrecisionEngine.clean(Math.ceil(inputs.value / inputs.multiple) * inputs.multiple);
      return { nearest, floor, ceil };
    },
    formatResult: (result: { nearest: number; floor: number; ceil: number }) => ({
      primary: {
        label: 'Nearest Multiple',
        value: ResultFormatter.formatDecimal(result.nearest),
        numericValue: result.nearest
      },
      secondary: [
        { label: 'Floor (Round Down)', value: ResultFormatter.formatDecimal(result.floor) },
        { label: 'Ceil (Round Up)', value: ResultFormatter.formatDecimal(result.ceil) }
      ]
    })
  },

  // 20. Percent Error
  {
    id: 'percent-error',
    name: 'Percent Error Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    formulaMeta: {
      formulaName: 'Percent Error Formula',
      formulaExpression: 'Error% = (|Exp - Theo| / Theo) * 100',
      variables: [{ symbol: 'Exp', name: 'Experimental' }, { symbol: 'Theo', name: 'Theoretical' }]
    },
    inputSchema: {
      fields: [
        { name: 'experimental', label: 'Experimental (Observed) Value', type: 'number', required: true, defaultValue: 9.6 },
        { name: 'theoretical', label: 'Theoretical (Actual) Value', type: 'number', required: true, defaultValue: 9.81 }
      ]
    },
    validate: (inputs: { theoretical: number }) => {
      if (inputs.theoretical === 0) return [{ field: 'theoretical', code: 'DIVISION_BY_ZERO', message: 'Theoretical value cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { experimental: number; theoretical: number }) => {
      const absDiff = Math.abs(inputs.experimental - inputs.theoretical);
      const errorPct = PrecisionEngine.clean((absDiff / Math.abs(inputs.theoretical)) * 100);
      return { errorPct, absDiff };
    },
    formatResult: (result: { errorPct: number; absDiff: number }) => ({
      primary: {
        label: 'Percent Error',
        value: ResultFormatter.formatPercentage(result.errorPct),
        numericValue: result.errorPct
      },
      secondary: [
        { label: 'Absolute Difference', value: ResultFormatter.formatDecimal(result.absDiff, 4) }
      ]
    })
  },

  // 21. Estimation Range
  {
    id: 'estimation-range',
    name: 'Range Estimation & Bounds Calculator',
    category: 'basic-math',
    subcategoryId: 'rounding-estimation',
    formulaMeta: {
      formulaName: 'Interval Estimation',
      formulaExpression: 'Interval = [Mid - Tol, Mid + Tol]',
      variables: [{ symbol: 'Mid', name: 'Estimated Center' }, { symbol: 'Tol', name: 'Tolerance' }]
    },
    inputSchema: {
      fields: [
        { name: 'estimate', label: 'Point Estimate', type: 'number', required: true, defaultValue: 500 },
        { name: 'tolerancePct', label: 'Margin of Tolerance %', type: 'percentage', required: true, defaultValue: 10, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { estimate: number; tolerancePct: number }) => {
      const margin = inputs.estimate * (inputs.tolerancePct / 100);
      const lower = PrecisionEngine.clean(inputs.estimate - margin);
      const upper = PrecisionEngine.clean(inputs.estimate + margin);
      return { lower, upper, margin };
    },
    formatResult: (result: { lower: number; upper: number; margin: number }) => ({
      primary: {
        label: 'Estimated Range',
        value: `${ResultFormatter.formatDecimal(result.lower)} — ${ResultFormatter.formatDecimal(result.upper)}`,
        numericValue: result.margin
      },
      secondary: [
        { label: 'Margin of Uncertainty', value: `±${ResultFormatter.formatDecimal(result.margin)}` }
      ]
    })
  },

  // 22. Prime Factorization
  {
    id: 'prime-factorization',
    name: 'Prime Factorization Calculator',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Fundamental Theorem of Arithmetic',
      formulaExpression: 'n = p₁^a * p₂^b * ...',
      variables: [{ symbol: 'n', name: 'Composite Integer' }]
    },
    inputSchema: {
      fields: [
        { name: 'integer', label: 'Positive Integer', type: 'integer', required: true, defaultValue: 360, min: 2, max: 1000000 }
      ]
    },
    validate: (inputs: { integer: number }) => {
      if (inputs.integer < 2) return [{ field: 'integer', code: 'RANGE_OUT_OF_BOUNDS', message: 'Integer must be at least 2.' }];
      return [];
    },
    calculate: (inputs: { integer: number }) => {
      let n = Math.round(inputs.integer);
      const factors: number[] = [];
      for (let i = 2; i * i <= n; i++) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
      }
      if (n > 1) factors.push(n);
      const factorCounts: Record<number, number> = {};
      for (const f of factors) factorCounts[f] = (factorCounts[f] || 0) + 1;
      const canonical = Object.entries(factorCounts)
        .map(([base, exp]) => (exp > 1 ? `${base}^${exp}` : base))
        .join(' × ');
      return { factors, canonical };
    },
    formatResult: (result: { canonical: string; factors: number[] }) => ({
      primary: {
        label: 'Prime Factors',
        value: result.canonical,
        numericValue: result.factors.length
      },
      secondary: [
        { label: 'Factor List', value: result.factors.join(', ') }
      ]
    })
  },

  // 23. Factorial Calculator
  {
    id: 'factorial-calc',
    name: 'Factorial Calculator (n!)',
    category: 'basic-math',
    subcategoryId: 'arithmetic-operations',
    formulaMeta: {
      formulaName: 'Factorial Product',
      formulaExpression: 'n! = n * (n - 1) * ... * 1',
      variables: [{ symbol: 'n', name: 'Integer' }]
    },
    inputSchema: {
      fields: [
        { name: 'n', label: 'Non-negative Integer (n)', type: 'integer', required: true, defaultValue: 6, min: 0, max: 170 }
      ]
    },
    validate: (inputs: { n: number }) => {
      if (inputs.n < 0 || inputs.n > 170) return [{ field: 'n', code: 'RANGE_OUT_OF_BOUNDS', message: 'n must be between 0 and 170.' }];
      return [];
    },
    calculate: (inputs: { n: number }) => {
      const fact = FormulaEngine.factorial(inputs.n);
      return { fact };
    },
    formatResult: (result: { fact: number }) => ({
      primary: {
        label: 'Factorial Result',
        value: ResultFormatter.formatInteger(result.fact),
        numericValue: result.fact
      }
    })
  },

  // 24. Mixed Numbers
  {
    id: 'mixed-numbers',
    name: 'Mixed Number to Fraction Calculator',
    category: 'basic-math',
    subcategoryId: 'percentages-fractions',
    formulaMeta: {
      formulaName: 'Improper Fraction Conversion',
      formulaExpression: 'w + n/d = (w*d + n) / d',
      variables: [{ symbol: 'w', name: 'Whole' }, { symbol: 'n', name: 'Numerator' }, { symbol: 'd', name: 'Denominator' }]
    },
    inputSchema: {
      fields: [
        { name: 'whole', label: 'Whole Number', type: 'integer', required: true, defaultValue: 3 },
        { name: 'numerator', label: 'Fraction Numerator', type: 'integer', required: true, defaultValue: 3 },
        { name: 'denominator', label: 'Fraction Denominator', type: 'integer', required: true, defaultValue: 4 }
      ]
    },
    validate: (inputs: { denominator: number }) => {
      if (inputs.denominator === 0) return [{ field: 'denominator', code: 'DIVISION_BY_ZERO', message: 'Denominator cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { whole: number; numerator: number; denominator: number }) => {
      const improperNum = inputs.whole * inputs.denominator + inputs.numerator;
      const decimal = PrecisionEngine.clean(improperNum / inputs.denominator);
      return { improperNum, denominator: inputs.denominator, decimal };
    },
    formatResult: (result: { improperNum: number; denominator: number; decimal: number }) => ({
      primary: {
        label: 'Improper Fraction',
        value: `${result.improperNum} / ${result.denominator}`,
        numericValue: result.decimal
      },
      secondary: [
        { label: 'Decimal Equivalent', value: ResultFormatter.formatDecimal(result.decimal, 3) }
      ]
    })
  },

  // ==========================================
  // ALGEBRA (18 new)
  // ==========================================

  // 25. Linear Equation Solver
  {
    id: 'linear-equation',
    name: 'Linear Equation Solver (ax + b = c)',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    formulaMeta: {
      formulaName: 'First Degree Linear Isolation',
      formulaExpression: 'ax + b = c  =>  x = (c - b) / a',
      variables: [{ symbol: 'a, b, c', name: 'Coefficients' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Coefficient a (x)', type: 'number', required: true, defaultValue: 3 },
        { name: 'b', label: 'Constant b', type: 'number', required: true, defaultValue: 9 },
        { name: 'c', label: 'Result c', type: 'number', required: true, defaultValue: 24 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (Math.abs(inputs.a) < 1e-12) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'Coefficient a cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number }) => {
      const x = PrecisionEngine.clean((inputs.c - inputs.b) / inputs.a);
      return { x };
    },
    formatResult: (result: { x: number }) => ({
      primary: {
        label: 'Solution for x',
        value: `x = ${ResultFormatter.formatDecimal(result.x)}`,
        numericValue: result.x
      }
    })
  },

  // 26. Systems of 2 Linear Equations
  {
    id: 'two-variable-linear',
    name: 'Systems of 2 Linear Equations Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    formulaMeta: {
      formulaName: "Cramer's Rule for 2x2 System",
      formulaExpression: 'a₁x + b₁y = c₁, a₂x + b₂y = c₂',
      variables: [{ symbol: 'a, b, c', name: 'System coefficients' }]
    },
    inputSchema: {
      fields: [
        { name: 'a1', label: 'Equation 1: a₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'b1', label: 'Equation 1: b₁', type: 'number', required: true, defaultValue: 3 },
        { name: 'c1', label: 'Equation 1: c₁', type: 'number', required: true, defaultValue: 12 },
        { name: 'a2', label: 'Equation 2: a₂', type: 'number', required: true, defaultValue: 1 },
        { name: 'b2', label: 'Equation 2: b₂', type: 'number', required: true, defaultValue: -1 },
        { name: 'c2', label: 'Equation 2: c₂', type: 'number', required: true, defaultValue: 1 }
      ]
    },
    validate: (inputs: { a1: number; b1: number; a2: number; b2: number }) => {
      const det = inputs.a1 * inputs.b2 - inputs.a2 * inputs.b1;
      if (Math.abs(det) < 1e-12) {
        return [{ field: 'a1', code: 'MATHEMATICAL_DOMAIN_ERROR', message: 'System determinant is zero (parallel or coincident lines).' }];
      }
      return [];
    },
    calculate: (inputs: { a1: number; b1: number; c1: number; a2: number; b2: number; c2: number }) => {
      const D = inputs.a1 * inputs.b2 - inputs.a2 * inputs.b1;
      const Dx = inputs.c1 * inputs.b2 - inputs.c2 * inputs.b1;
      const Dy = inputs.a1 * inputs.c2 - inputs.a2 * inputs.c1;
      const x = PrecisionEngine.clean(Dx / D);
      const y = PrecisionEngine.clean(Dy / D);
      return { x, y, D };
    },
    formatResult: (result: { x: number; y: number }) => ({
      primary: {
        label: 'Intersection Point (x, y)',
        value: `(${ResultFormatter.formatDecimal(result.x)}, ${ResultFormatter.formatDecimal(result.y)})`,
        numericValue: result.x
      },
      secondary: [
        { label: 'x Value', value: ResultFormatter.formatDecimal(result.x) },
        { label: 'y Value', value: ResultFormatter.formatDecimal(result.y) }
      ]
    })
  },

  // 27. Systems of 3 Linear Equations
  {
    id: 'three-variable-linear',
    name: 'Systems of 3 Linear Equations Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    formulaMeta: {
      formulaName: "Cramer's Rule 3x3 System",
      formulaExpression: 'x = Dx/D, y = Dy/D, z = Dz/D',
      variables: [{ symbol: 'D', name: 'Determinant' }]
    },
    inputSchema: {
      fields: [
        { name: 'a1', label: 'x₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'b1', label: 'y₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'c1', label: 'z₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'd1', label: '= Constant 1', type: 'number', required: true, defaultValue: 6 },
        { name: 'a2', label: 'x₂', type: 'number', required: true, defaultValue: 0 },
        { name: 'b2', label: 'y₂', type: 'number', required: true, defaultValue: 2 },
        { name: 'c2', label: 'z₂', type: 'number', required: true, defaultValue: 5 },
        { name: 'd2', label: '= Constant 2', type: 'number', required: true, defaultValue: -4 },
        { name: 'a3', label: 'x₃', type: 'number', required: true, defaultValue: 2 },
        { name: 'b3', label: 'y₃', type: 'number', required: true, defaultValue: 5 },
        { name: 'c3', label: 'z₃', type: 'number', required: true, defaultValue: -1 },
        { name: 'd3', label: '= Constant 3', type: 'number', required: true, defaultValue: 27 }
      ]
    },
    validate: () => [],
    calculate: (inputs: any) => {
      const det3 = (m: number[][]) =>
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

      const D_mat = [
        [inputs.a1, inputs.b1, inputs.c1],
        [inputs.a2, inputs.b2, inputs.c2],
        [inputs.a3, inputs.b3, inputs.c3]
      ];
      const D = det3(D_mat);
      if (Math.abs(D) < 1e-12) throw new Error('Determinant D is zero; system has no unique solution.');

      const Dx_mat = [
        [inputs.d1, inputs.b1, inputs.c1],
        [inputs.d2, inputs.b2, inputs.c2],
        [inputs.d3, inputs.b3, inputs.c3]
      ];
      const Dy_mat = [
        [inputs.a1, inputs.d1, inputs.c1],
        [inputs.a2, inputs.d2, inputs.c2],
        [inputs.a3, inputs.d3, inputs.c3]
      ];
      const Dz_mat = [
        [inputs.a1, inputs.b1, inputs.d1],
        [inputs.a2, inputs.b2, inputs.d2],
        [inputs.a3, inputs.b3, inputs.d3]
      ];

      const x = PrecisionEngine.clean(det3(Dx_mat) / D);
      const y = PrecisionEngine.clean(det3(Dy_mat) / D);
      const z = PrecisionEngine.clean(det3(Dz_mat) / D);
      return { x, y, z };
    },
    formatResult: (result: { x: number; y: number; z: number }) => ({
      primary: {
        label: '3D Solution (x, y, z)',
        value: `(${ResultFormatter.formatDecimal(result.x)}, ${ResultFormatter.formatDecimal(result.y)}, ${ResultFormatter.formatDecimal(result.z)})`,
        numericValue: result.x
      },
      secondary: [
        { label: 'x', value: ResultFormatter.formatDecimal(result.x) },
        { label: 'y', value: ResultFormatter.formatDecimal(result.y) },
        { label: 'z', value: ResultFormatter.formatDecimal(result.z) }
      ]
    })
  },

  // 28. Polynomial Roots (Cubic)
  {
    id: 'polynomial-roots',
    name: 'Cubic Equation Root Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    formulaMeta: {
      formulaName: 'Cubic Polynomial Root Isolation',
      formulaExpression: 'ax³ + bx² + cx + d = 0',
      variables: [{ symbol: 'a, b, c, d', name: 'Coefficients' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Coefficient a (x³)', type: 'number', required: true, defaultValue: 1 },
        { name: 'b', label: 'Coefficient b (x²)', type: 'number', required: true, defaultValue: -6 },
        { name: 'c', label: 'Coefficient c (x)', type: 'number', required: true, defaultValue: 11 },
        { name: 'd', label: 'Constant d', type: 'number', required: true, defaultValue: -6 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (Math.abs(inputs.a) < 1e-12) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'Coefficient a cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number; d: number }) => {
      // Newton-Raphson to find one real root
      const f = (x: number) => inputs.a * x * x * x + inputs.b * x * x + inputs.c * x + inputs.d;
      const df = (x: number) => 3 * inputs.a * x * x + 2 * inputs.b * x + inputs.c;
      let x0 = 0.0;
      for (let i = 0; i < 50; i++) {
        const y = f(x0);
        const dy = df(x0);
        if (Math.abs(dy) < 1e-12) break;
        const x1 = x0 - y / dy;
        if (Math.abs(x1 - x0) < 1e-9) { x0 = x1; break; }
        x0 = x1;
      }
      const realRoot1 = PrecisionEngine.clean(Math.round(x0 * 1000) / 1000);
      return { realRoot1 };
    },
    formatResult: (result: { realRoot1: number }) => ({
      primary: {
        label: 'Real Root x₁',
        value: `x ≈ ${ResultFormatter.formatDecimal(result.realRoot1)}`,
        numericValue: result.realRoot1
      }
    })
  },

  // 29. Factoring Trinomials
  {
    id: 'factoring-trinomials',
    name: 'Trinomial Factoring Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    formulaMeta: {
      formulaName: 'Factoring Quadratic Trinomials',
      formulaExpression: 'ax² + bx + c = (px + q)(rx + s)',
      variables: [{ symbol: 'a, b, c', name: 'Coefficients' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'a (x²)', type: 'integer', required: true, defaultValue: 1 },
        { name: 'b', label: 'b (x)', type: 'integer', required: true, defaultValue: 5 },
        { name: 'c', label: 'c (constant)', type: 'integer', required: true, defaultValue: 6 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (inputs.a === 0) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'Coefficient a cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number }) => {
      const disc = inputs.b * inputs.b - 4 * inputs.a * inputs.c;
      if (disc < 0) {
        return { isFactorable: false, factorStr: 'Irreducible over Real Numbers' };
      }
      const sqrtD = Math.sqrt(disc);
      if (!Number.isInteger(sqrtD)) {
        return { isFactorable: false, factorStr: 'Not factorable over Integers' };
      }
      const r1 = (-inputs.b + sqrtD) / (2 * inputs.a);
      const r2 = (-inputs.b - sqrtD) / (2 * inputs.a);
      const s1 = r1 > 0 ? `- ${r1}` : `+ ${Math.abs(r1)}`;
      const s2 = r2 > 0 ? `- ${r2}` : `+ ${Math.abs(r2)}`;
      const prefix = inputs.a !== 1 ? `${inputs.a}` : '';
      return { isFactorable: true, factorStr: `${prefix}(x ${s1})(x ${s2})` };
    },
    formatResult: (result: { isFactorable: boolean; factorStr: string }) => ({
      primary: {
        label: 'Factored Form',
        value: result.factorStr,
        numericValue: result.isFactorable ? 1 : 0
      }
    })
  },

  // 30. Difference of Squares
  {
    id: 'difference-of-squares',
    name: 'Difference of Squares Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    formulaMeta: {
      formulaName: 'Difference of Squares Identity',
      formulaExpression: 'a² - b² = (a - b)(a + b)',
      variables: [{ symbol: 'a, b', name: 'Terms' }]
    },
    inputSchema: {
      fields: [
        { name: 'termA', label: 'Term A (squared: a²)', type: 'number', required: true, defaultValue: 49, min: 0 },
        { name: 'termB', label: 'Term B (squared: b²)', type: 'number', required: true, defaultValue: 16, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { termA: number; termB: number }) => {
      const rootA = Math.sqrt(inputs.termA);
      const rootB = Math.sqrt(inputs.termB);
      const diff = PrecisionEngine.clean(inputs.termA - inputs.termB);
      return { rootA, rootB, diff };
    },
    formatResult: (result: { rootA: number; rootB: number; diff: number }) => ({
      primary: {
        label: 'Factored Product',
        value: `(${ResultFormatter.formatDecimal(result.rootA)} - ${ResultFormatter.formatDecimal(result.rootB)})(${ResultFormatter.formatDecimal(result.rootA)} + ${ResultFormatter.formatDecimal(result.rootB)})`,
        numericValue: result.diff
      },
      secondary: [
        { label: 'Evaluated Difference (a² - b²)', value: ResultFormatter.formatDecimal(result.diff) }
      ]
    })
  },

  // 31. Complete the Square
  {
    id: 'complete-the-square',
    name: 'Completing the Square Calculator',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    formulaMeta: {
      formulaName: 'Completing the Square Transformation',
      formulaExpression: 'ax² + bx + c = a(x - h)² + k',
      variables: [{ symbol: 'h, k', name: 'Vertex coordinates' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'a (x²)', type: 'number', required: true, defaultValue: 1 },
        { name: 'b', label: 'b (x)', type: 'number', required: true, defaultValue: 6 },
        { name: 'c', label: 'c (constant)', type: 'number', required: true, defaultValue: 2 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (Math.abs(inputs.a) < 1e-12) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'Coefficient a cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number }) => {
      const h = PrecisionEngine.clean(-inputs.b / (2 * inputs.a));
      const k = PrecisionEngine.clean(inputs.c - (inputs.b * inputs.b) / (4 * inputs.a));
      return { h, k, a: inputs.a };
    },
    formatResult: (result: { h: number; k: number; a: number }) => {
      const hStr = result.h >= 0 ? `- ${result.h}` : `+ ${Math.abs(result.h)}`;
      const kStr = result.k >= 0 ? `+ ${result.k}` : `- ${Math.abs(result.k)}`;
      const aPrefix = result.a !== 1 ? `${result.a}` : '';
      return {
        primary: {
          label: 'Completed Square Form',
          value: `${aPrefix}(x ${hStr})² ${kStr}`,
          numericValue: result.k
        },
        secondary: [
          { label: 'Vertex (h, k)', value: `(${result.h}, ${result.k})` }
        ]
      };
    }
  },

  // 32. Vertex Form
  {
    id: 'vertex-form',
    name: 'Quadratic Vertex Form Calculator',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    formulaMeta: {
      formulaName: 'Parabola Vertex & Axis of Symmetry',
      formulaExpression: 'h = -b/(2a), k = f(h)',
      variables: [{ symbol: 'h, k', name: 'Vertex point' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'a', type: 'number', required: true, defaultValue: -2 },
        { name: 'b', label: 'b', type: 'number', required: true, defaultValue: 8 },
        { name: 'c', label: 'c', type: 'number', required: true, defaultValue: 3 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (Math.abs(inputs.a) < 1e-12) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'a cannot be 0.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number }) => {
      const h = PrecisionEngine.clean(-inputs.b / (2 * inputs.a));
      const k = PrecisionEngine.clean(inputs.a * h * h + inputs.b * h + inputs.c);
      const opens = inputs.a > 0 ? 'Upward (Minimum)' : 'Downward (Maximum)';
      return { h, k, opens };
    },
    formatResult: (result: { h: number; k: number; opens: string }) => ({
      primary: {
        label: 'Vertex Coordinate',
        value: `(${ResultFormatter.formatDecimal(result.h)}, ${ResultFormatter.formatDecimal(result.k)})`,
        numericValue: result.k
      },
      secondary: [
        { label: 'Axis of Symmetry', value: `x = ${ResultFormatter.formatDecimal(result.h)}` },
        { label: 'Orientation', value: result.opens }
      ]
    })
  },

  // 33. Discriminant Calculator
  {
    id: 'discriminant-calc',
    name: 'Discriminant Calculator (b² - 4ac)',
    category: 'algebra',
    subcategoryId: 'quadratic-equations',
    formulaMeta: {
      formulaName: 'Quadratic Discriminant',
      formulaExpression: 'Δ = b² - 4ac',
      variables: [{ symbol: 'Δ', name: 'Discriminant delta' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'a', type: 'number', required: true, defaultValue: 2 },
        { name: 'b', label: 'b', type: 'number', required: true, defaultValue: -4 },
        { name: 'c', label: 'c', type: 'number', required: true, defaultValue: 2 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { a: number; b: number; c: number }) => {
      const d = PrecisionEngine.clean(inputs.b * inputs.b - 4 * inputs.a * inputs.c);
      let nature = 'Two distinct real roots';
      if (d === 0) nature = 'One repeated real root (vertex on axis)';
      else if (d < 0) nature = 'Two complex conjugate roots (no real x-intercepts)';
      return { d, nature };
    },
    formatResult: (result: { d: number; nature: string }) => ({
      primary: {
        label: 'Discriminant (Δ)',
        value: result.d.toString(),
        numericValue: result.d
      },
      secondary: [
        { label: 'Roots Classification', value: result.nature }
      ]
    })
  },

  // 34. Midpoint Formula
  {
    id: 'midpoint-calculator',
    name: 'Midpoint Formula Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    formulaMeta: {
      formulaName: '2D Midpoint Coordinate',
      formulaExpression: 'M = ((x₁ + x₂)/2, (y₁ + y₂)/2)',
      variables: [{ symbol: 'x, y', name: 'Coordinates' }]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'x₁', type: 'number', required: true, defaultValue: -4 },
        { name: 'y1', label: 'y₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'x2', label: 'x₂', type: 'number', required: true, defaultValue: 6 },
        { name: 'y2', label: 'y₂', type: 'number', required: true, defaultValue: 8 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { x1: number; y1: number; x2: number; y2: number }) => {
      const midX = PrecisionEngine.clean((inputs.x1 + inputs.x2) / 2);
      const midY = PrecisionEngine.clean((inputs.y1 + inputs.y2) / 2);
      return { midX, midY };
    },
    formatResult: (result: { midX: number; midY: number }) => ({
      primary: {
        label: 'Midpoint (M)',
        value: `(${ResultFormatter.formatDecimal(result.midX)}, ${ResultFormatter.formatDecimal(result.midY)})`,
        numericValue: result.midX
      }
    })
  },

  // 35. 2D Coordinate Distance
  {
    id: 'distance-2d',
    name: '2D Coordinate Distance Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    formulaMeta: {
      formulaName: 'Euclidean Cartesian Distance',
      formulaExpression: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)',
      variables: [{ symbol: 'd', name: 'Distance' }]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'Point 1: x₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'y1', label: 'Point 1: y₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'x2', label: 'Point 2: x₂', type: 'number', required: true, defaultValue: 4 },
        { name: 'y2', label: 'Point 2: y₂', type: 'number', required: true, defaultValue: 6 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { x1: number; y1: number; x2: number; y2: number }) => {
      const dx = inputs.x2 - inputs.x1;
      const dy = inputs.y2 - inputs.y1;
      const dist = PrecisionEngine.clean(Math.sqrt(dx * dx + dy * dy));
      return { dist, dx, dy };
    },
    formatResult: (result: { dist: number; dx: number; dy: number }) => ({
      primary: {
        label: 'Distance (d)',
        value: ResultFormatter.formatDecimal(result.dist, 4),
        numericValue: result.dist
      },
      secondary: [
        { label: 'Δx Horizontal', value: ResultFormatter.formatDecimal(result.dx) },
        { label: 'Δy Vertical', value: ResultFormatter.formatDecimal(result.dy) }
      ]
    })
  },

  // 36. Parallel & Perpendicular Line
  {
    id: 'parallel-perpendicular',
    name: 'Parallel and Perpendicular Line Calculator',
    category: 'algebra',
    subcategoryId: 'linear-equations',
    formulaMeta: {
      formulaName: 'Linear Slopes Relationship',
      formulaExpression: 'm_parallel = m, m_perp = -1/m',
      variables: [{ symbol: 'm', name: 'Given slope' }]
    },
    inputSchema: {
      fields: [
        { name: 'slope', label: 'Original Line Slope (m)', type: 'number', required: true, defaultValue: 2 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { slope: number }) => {
      const parallelSlope = inputs.slope;
      const perpSlope = inputs.slope !== 0 ? PrecisionEngine.clean(-1 / inputs.slope) : null;
      return { parallelSlope, perpSlope };
    },
    formatResult: (result: { parallelSlope: number; perpSlope: number | null }) => ({
      primary: {
        label: 'Parallel Slope',
        value: ResultFormatter.formatDecimal(result.parallelSlope),
        numericValue: result.parallelSlope
      },
      secondary: [
        { label: 'Perpendicular Slope', value: result.perpSlope !== null ? ResultFormatter.formatDecimal(result.perpSlope) : 'Undefined (Vertical)' }
      ]
    })
  },

  // 37. Linear Inequality
  {
    id: 'linear-inequality',
    name: 'Linear Inequality Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    formulaMeta: {
      formulaName: 'Inequality Solution & Interval',
      formulaExpression: 'ax + b > c  =>  x > (c - b) / a (flips if a < 0)',
      variables: [{ symbol: 'a, b, c', name: 'Parameters' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Coefficient a (x)', type: 'number', required: true, defaultValue: -3 },
        { name: 'b', label: 'Constant b', type: 'number', required: true, defaultValue: 5 },
        {
          name: 'operator',
          label: 'Inequality Sign',
          type: 'select',
          required: true,
          defaultValue: 'gt',
          options: [
            { label: '> (Greater than)', value: 'gt' },
            { label: '≥ (Greater than or equal)', value: 'gte' },
            { label: '< (Less than)', value: 'lt' },
            { label: '≤ (Less than or equal)', value: 'lte' }
          ]
        },
        { name: 'c', label: 'Constant c', type: 'number', required: true, defaultValue: 14 }
      ]
    },
    validate: (inputs: { a: number }) => {
      if (Math.abs(inputs.a) < 1e-12) return [{ field: 'a', code: 'DIVISION_BY_ZERO', message: 'a cannot be 0.' }];
      return [];
    },
    calculate: (inputs: { a: number; b: number; c: number; operator: string }) => {
      const bound = PrecisionEngine.clean((inputs.c - inputs.b) / inputs.a);
      let op = inputs.operator;
      if (inputs.a < 0) {
        if (op === 'gt') op = 'lt';
        else if (op === 'gte') op = 'lte';
        else if (op === 'lt') op = 'gt';
        else if (op === 'lte') op = 'gte';
      }
      const symbols: Record<string, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤' };
      const intervals: Record<string, string> = {
        gt: `(${bound}, ∞)`,
        gte: `[${bound}, ∞)`,
        lt: `(-∞, ${bound})`,
        lte: `(-∞, ${bound}]`
      };
      return { bound, notation: `x ${symbols[op]} ${bound}`, interval: intervals[op] };
    },
    formatResult: (result: { bound: number; notation: string; interval: string }) => ({
      primary: {
        label: 'Inequality Solution',
        value: result.notation,
        numericValue: result.bound
      },
      secondary: [
        { label: 'Interval Notation', value: result.interval }
      ]
    })
  },

  // 38. Compound Inequality
  {
    id: 'compound-inequality',
    name: 'Compound Inequality Calculator',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    formulaMeta: {
      formulaName: 'Double Inequality Bounds',
      formulaExpression: 'a < x + b < c',
      variables: [{ symbol: 'a, b, c', name: 'Bounds' }]
    },
    inputSchema: {
      fields: [
        { name: 'lowerA', label: 'Lower Bound (a)', type: 'number', required: true, defaultValue: -2 },
        { name: 'shiftB', label: 'Shift term (+b)', type: 'number', required: true, defaultValue: 3 },
        { name: 'upperC', label: 'Upper Bound (c)', type: 'number', required: true, defaultValue: 8 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lowerA: number; shiftB: number; upperC: number }) => {
      const minX = PrecisionEngine.clean(inputs.lowerA - inputs.shiftB);
      const maxX = PrecisionEngine.clean(inputs.upperC - inputs.shiftB);
      return { minX, maxX };
    },
    formatResult: (result: { minX: number; maxX: number }) => ({
      primary: {
        label: 'Solution Interval',
        value: `${result.minX} < x < ${result.maxX}`,
        numericValue: result.minX
      },
      secondary: [
        { label: 'Interval Notation', value: `(${result.minX}, ${result.maxX})` }
      ]
    })
  },

  // 39. FOIL Binomial Multiplication
  {
    id: 'foil-calculator',
    name: 'FOIL Binomial Multiplication Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    formulaMeta: {
      formulaName: 'FOIL Binomial Expansion',
      formulaExpression: '(ax + b)(cx + d) = acx² + (ad + bc)x + bd',
      variables: [{ symbol: 'a, b, c, d', name: 'Binomial terms' }]
    },
    inputSchema: {
      fields: [
        { name: 'a', label: 'a in (ax + b)', type: 'number', required: true, defaultValue: 2 },
        { name: 'b', label: 'b in (ax + b)', type: 'number', required: true, defaultValue: 3 },
        { name: 'c', label: 'c in (cx + d)', type: 'number', required: true, defaultValue: 4 },
        { name: 'd', label: 'd in (cx + d)', type: 'number', required: true, defaultValue: -5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { a: number; b: number; c: number; d: number }) => {
      const first = PrecisionEngine.clean(inputs.a * inputs.c);
      const outer = PrecisionEngine.clean(inputs.a * inputs.d);
      const inner = PrecisionEngine.clean(inputs.b * inputs.c);
      const last = PrecisionEngine.clean(inputs.b * inputs.d);
      const middle = PrecisionEngine.clean(outer + inner);
      return { first, middle, last, outer, inner };
    },
    formatResult: (result: { first: number; middle: number; last: number; outer: number; inner: number }) => {
      const midStr = result.middle >= 0 ? `+ ${result.middle}x` : `- ${Math.abs(result.middle)}x`;
      const lastStr = result.last >= 0 ? `+ ${result.last}` : `- ${Math.abs(result.last)}`;
      return {
        primary: {
          label: 'Expanded Polynomial',
          value: `${result.first}x² ${midStr} ${lastStr}`,
          numericValue: result.first
        },
        secondary: [
          { label: 'Outer + Inner Product', value: `${result.outer} + ${result.inner} = ${result.middle}` }
        ]
      };
    }
  },

  // 40. Exponent Rules
  {
    id: 'exponent-rules',
    name: 'Exponent Rules & Power Calculator',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    formulaMeta: {
      formulaName: 'Laws of Indices & Exponents',
      formulaExpression: 'xᵃ * xᵇ = xᵃ⁺ᵇ, (xᵃ)ᵇ = xᵃᵇ',
      variables: [{ symbol: 'x', name: 'Base' }, { symbol: 'a, b', name: 'Exponents' }]
    },
    inputSchema: {
      fields: [
        { name: 'base', label: 'Base (x)', type: 'number', required: true, defaultValue: 3 },
        { name: 'expA', label: 'First Exponent (a)', type: 'number', required: true, defaultValue: 4 },
        { name: 'expB', label: 'Second Exponent (b)', type: 'number', required: true, defaultValue: 2 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { base: number; expA: number; expB: number }) => {
      const productExp = inputs.expA + inputs.expB;
      const productVal = PrecisionEngine.clean(Math.pow(inputs.base, productExp));
      const quotientExp = inputs.expA - inputs.expB;
      const quotientVal = PrecisionEngine.clean(Math.pow(inputs.base, quotientExp));
      const powerOfPowerExp = inputs.expA * inputs.expB;
      const powerOfPowerVal = PrecisionEngine.clean(Math.pow(inputs.base, powerOfPowerExp));
      return { productVal, quotientVal, powerOfPowerVal, productExp };
    },
    formatResult: (result: { productVal: number; quotientVal: number; powerOfPowerVal: number; productExp: number }) => ({
      primary: {
        label: 'Product Rule (xᵃ * xᵇ)',
        value: `${ResultFormatter.formatDecimal(result.productVal)} (x^${result.productExp})`,
        numericValue: result.productVal
      },
      secondary: [
        { label: 'Quotient Rule (xᵃ / xᵇ)', value: ResultFormatter.formatDecimal(result.quotientVal) },
        { label: 'Power of Power (xᵃ)ᵇ', value: ResultFormatter.formatDecimal(result.powerOfPowerVal) }
      ]
    })
  },

  // 41. Rational Expressions
  {
    id: 'rational-expressions',
    name: 'Rational Expression Simplifier',
    category: 'algebra',
    subcategoryId: 'polynomials-factoring',
    formulaMeta: {
      formulaName: 'Algebraic Fraction Simplification',
      formulaExpression: 'P(x) / Q(x)',
      variables: [{ symbol: 'x', name: 'Variable' }]
    },
    inputSchema: {
      fields: [
        { name: 'constantA', label: 'Numerator Constant (kx)', type: 'number', required: true, defaultValue: 12 },
        { name: 'constantB', label: 'Denominator Constant (mx)', type: 'number', required: true, defaultValue: 18 }
      ]
    },
    validate: (inputs: { constantB: number }) => {
      if (inputs.constantB === 0) return [{ field: 'constantB', code: 'DIVISION_BY_ZERO', message: 'Denominator cannot be zero.' }];
      return [];
    },
    calculate: (inputs: { constantA: number; constantB: number }) => {
      const gcd = FormulaEngine.gcd(inputs.constantA, inputs.constantB);
      const simA = inputs.constantA / gcd;
      const simB = inputs.constantB / gcd;
      return { simA, simB, gcd };
    },
    formatResult: (result: { simA: number; simB: number }) => ({
      primary: {
        label: 'Simplified Expression',
        value: `${result.simA}x / ${result.simB}x = ${result.simA} / ${result.simB}`,
        numericValue: result.simA / result.simB
      }
    })
  },

  // 42. Absolute Value Inequality
  {
    id: 'absolute-inequality',
    name: 'Absolute Value Inequality Solver',
    category: 'algebra',
    subcategoryId: 'systems-inequalities',
    formulaMeta: {
      formulaName: 'Absolute Inequality Interval',
      formulaExpression: '|x - h| < k  =>  h - k < x < h + k',
      variables: [{ symbol: 'h', name: 'Center' }, { symbol: 'k', name: 'Radius' }]
    },
    inputSchema: {
      fields: [
        { name: 'centerH', label: 'Center (h) in |x - h|', type: 'number', required: true, defaultValue: 3 },
        { name: 'radiusK', label: 'Bound (k)', type: 'number', required: true, defaultValue: 5, min: 0 }
      ]
    },
    validate: (inputs: { radiusK: number }) => {
      if (inputs.radiusK < 0) return [{ field: 'radiusK', code: 'NON_NEGATIVE_REQUIRED', message: 'Bound k must be non-negative.' }];
      return [];
    },
    calculate: (inputs: { centerH: number; radiusK: number }) => {
      const lower = PrecisionEngine.clean(inputs.centerH - inputs.radiusK);
      const upper = PrecisionEngine.clean(inputs.centerH + inputs.radiusK);
      return { lower, upper };
    },
    formatResult: (result: { lower: number; upper: number }) => ({
      primary: {
        label: 'Less-Than Interval |x - h| < k',
        value: `(${result.lower}, ${result.upper})`,
        numericValue: result.lower
      },
      secondary: [
        { label: 'Greater-Than Interval', value: `(-∞, ${result.lower}) ∪ (${result.upper}, ∞)` }
      ]
    })
  }
];
