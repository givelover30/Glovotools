import { CalculationRegistry } from './CalculationRegistry.ts';
import { CalculationExecutor } from './CalculationExecutor.ts';
import { FormulaEngine } from './FormulaEngine.ts';
import { PrecisionEngine } from './PrecisionEngine.ts';
import { UnitHandler } from './UnitHandler.ts';
import { ValidationEngine } from './ValidationEngine.ts';
import { ErrorHandler } from './ErrorHandler.ts';

interface TestCaseResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}

export class EngineTestSuite {
  private results: TestCaseResult[] = [];

  private assert(suite: string, name: string, condition: boolean, message?: string) {
    this.results.push({
      suite,
      name,
      passed: condition,
      message: condition ? undefined : (message ?? 'Assertion failed'),
      durationMs: 0
    });
  }

  public runAll(): { total: number; passed: number; failed: number; results: TestCaseResult[] } {
    console.log('\n========================================');
    console.log('  CALCTOOLS CENTRAL ENGINE TEST SUITE');
    console.log('========================================\n');

    this.testArithmeticFormulas();
    this.testPercentageFormulas();
    this.testAlgebraFormulas();
    this.testGeometryFormulas();
    this.testTrigonometryFormulas();
    this.testStatisticsFormulas();
    this.testFinancialFormulas();
    this.testEngineeringFormulas();
    this.testPrecisionAndRounding();
    this.testUnitCompatibility();
    this.testValidationAndErrors();
    this.testRegistryValidation();
    this.testAll24Calculators();

    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log(`\nTest Execution Summary:`);
    console.log(`Total assertions: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      console.error('\nFAILED TESTS:');
      this.results.filter((r) => !r.passed).forEach((r) => {
        console.error(`❌ [${r.suite}] ${r.name}: ${r.message}`);
      });
    } else {
      console.log('\n✅ ALL MATHEMATICAL ENGINE TESTS PASSED PERFECTLY!\n');
    }

    return { total, passed, failed, results: this.results };
  }

  private testArithmeticFormulas() {
    const s = 'FormulaEngine.Arithmetic';
    this.assert(s, 'Addition: 12.5 + 3.2 = 15.7', FormulaEngine.add(12.5, 3.2) === 15.7);
    this.assert(s, 'Subtraction: 10 - 4.3 = 5.7', FormulaEngine.subtract(10, 4.3) === 5.7);
    this.assert(s, 'Multiplication: 2.5 * 4 = 10', FormulaEngine.multiply(2.5, 4) === 10);
    this.assert(s, 'Division: 15 / 3 = 5', FormulaEngine.divide(15, 3) === 5);
    this.assert(s, 'Division by zero returns null when fallback provided', FormulaEngine.divide(15, 0, null) === null);
    let threw = false;
    try { FormulaEngine.divide(15, 0); } catch { threw = true; }
    this.assert(s, 'Division by zero throws when no fallback', threw);
    this.assert(s, 'Modulo: 10 % 3 = 1', FormulaEngine.modulo(10, 3) === 1);
    this.assert(s, 'Absolute value: abs(-42.5) = 42.5', FormulaEngine.abs(-42.5) === 42.5);
  }

  private testPercentageFormulas() {
    const s = 'FormulaEngine.Percentages';
    this.assert(s, 'Percentage of: 15% of 200 = 30', FormulaEngine.percentageOf(15, 200) === 30);
    this.assert(s, 'Percentage increase: 100 to 125 = +25%', FormulaEngine.percentageIncrease(100, 125) === 25);
    this.assert(s, 'Percentage decrease: 100 to 80 = -20%', FormulaEngine.percentageDecrease(100, 80) === -20);
    this.assert(s, 'Percentage difference: between 50 and 70', Math.abs(FormulaEngine.percentageDifference(50, 70) - 33.333333) < 0.001);
    this.assert(s, 'Reverse percentage: 30 is 15% of 200', FormulaEngine.reversePercentage(30, 15) === 200);
  }

  private testAlgebraFormulas() {
    const s = 'FormulaEngine.Algebra';
    // Linear: 2x + 6 = 0 => x = -3
    this.assert(s, 'Linear solver: 2x + 6 = 0', FormulaEngine.solveLinear(2, 6).solution === -3);
    
    // Quadratic: x^2 - 5x + 6 = 0 => roots 3 and 2
    const quad = FormulaEngine.solveQuadratic(1, -5, 6);
    this.assert(s, 'Quadratic discriminant: (-5)^2 - 4(1)(6) = 1', quad.discriminant === 1);
    this.assert(s, 'Quadratic roots: x1=3, x2=2', Boolean(quad.roots?.includes(3) && quad.roots?.includes(2)));

    // Complex roots
    const quadComplex = FormulaEngine.solveQuadratic(1, 0, 1);
    this.assert(s, 'Quadratic no real roots: x^2 + 1 = 0', quadComplex.roots === null && quadComplex.type === 'complex');

    // Power, Root, Log
    this.assert(s, 'Power: 2^8 = 256', FormulaEngine.power(2, 8) === 256);
    this.assert(s, 'Nth root: cbrt(27) = 3', Math.abs((FormulaEngine.nthRoot(27, 3) ?? 0) - 3) < 1e-9);
    this.assert(s, 'Logarithm base 10: log10(1000) = 3', Math.abs((FormulaEngine.logarithm(1000, 10) ?? 0) - 3) < 1e-9);
  }

  private testGeometryFormulas() {
    const s = 'FormulaEngine.Geometry';
    // Circle: radius 7 => area ~ 153.938, circum ~ 43.982
    const circle = FormulaEngine.circle(7);
    this.assert(s, 'Circle area r=7', Math.abs(circle.area - 153.938) < 0.01);
    this.assert(s, 'Circle perimeter r=7', Math.abs(circle.perimeter - 43.982) < 0.01);

    // Cylinder: r=3, h=5 => volume ~ 141.3716
    const cyl = FormulaEngine.cylinder(3, 5);
    this.assert(s, 'Cylinder volume r=3, h=5', Math.abs(cyl.volume - 141.37) < 0.02);

    // Pythagorean: 3, 4 => 5
    this.assert(s, 'Pythagorean hypotenuse: 3, 4 => 5', FormulaEngine.hypotenuse(3, 4) === 5);
  }

  private testTrigonometryFormulas() {
    const s = 'FormulaEngine.Trigonometry';
    const trig30 = FormulaEngine.trigValues(30, 'deg');
    this.assert(s, 'sin(30 deg) = 0.5', Math.abs(trig30.sin - 0.5) < 1e-9);
    this.assert(s, 'cos(30 deg) = sqrt(3)/2 ~ 0.866025', Math.abs(trig30.cos - 0.866025) < 1e-5);
    this.assert(s, 'tan(45 deg) = 1.0', Math.abs(FormulaEngine.trigValues(45, 'deg').tan! - 1.0) < 1e-9);
    this.assert(s, 'tan(90 deg) is null/undefined due to asymptote', FormulaEngine.trigValues(90, 'deg').tan === null);
  }

  private testStatisticsFormulas() {
    const s = 'FormulaEngine.Statistics';
    const data = [10, 20, 20, 30, 40];
    const stats = FormulaEngine.statistics(data);
    this.assert(s, 'Mean of [10,20,20,30,40] = 24', stats.mean === 24);
    this.assert(s, 'Median = 20', stats.median === 20);
    this.assert(s, 'Mode = [20]', stats.mode.includes(20) && stats.mode.length === 1);
    this.assert(s, 'Min = 10, Max = 40', stats.min === 10 && stats.max === 40);
  }

  private testFinancialFormulas() {
    const s = 'FormulaEngine.Financial';
    // Mortgage payment: 320k loan, 6.5%, 30 years => $2022.62
    const mort = FormulaEngine.loanPayment(320000, 6.5, 30);
    this.assert(s, 'Mortgage payment $320k @ 6.5% 30yr = $2022.62', Math.abs(mort.monthlyPayment - 2022.62) < 0.05);

    // Compound interest: 10000 @ 7% for 10 years monthly compound => $20,096.61
    const comp = FormulaEngine.compoundInterest(10000, 7, 12, 10);
    this.assert(s, 'Compound interest $10k @ 7% 10yr = $20096.61', Math.abs(comp.futureValue - 20096.61) < 0.1);
  }

  private testEngineeringFormulas() {
    const s = 'FormulaEngine.Engineering';
    this.assert(s, "Ohm's Law V = I * R (2A * 10Ω = 20V)", FormulaEngine.ohmsLawVoltage(2, 10) === 20);
    this.assert(s, 'Power P = V * I (120V * 5A = 600W)', FormulaEngine.electricalPower(120, 5) === 600);
    this.assert(s, 'Torque T = F * r * sin(90) (50N * 0.4m = 20 N·m)', FormulaEngine.torque(50, 0.4, 90) === 20);
  }

  private testPrecisionAndRounding() {
    const s = 'PrecisionEngine';
    // Floating point fix: 0.1 + 0.2 === 0.3
    this.assert(s, 'Float stabilization: clean(0.1 + 0.2) === 0.3', PrecisionEngine.clean(0.1 + 0.2) === 0.3);
    this.assert(s, 'Round to 2 decimals: roundTo(12.3456, 2) === 12.35', PrecisionEngine.roundTo(12.3456, 2) === 12.35);
    this.assert(s, 'Financial rounding: roundFinancial(199.999) === 200.00', PrecisionEngine.roundFinancial(199.999) === 200.00);
    this.assert(s, 'Significant figures: toSignificantFigures(12345, 3) === 12300', PrecisionEngine.toSignificantFigures(12345, 3) === 12300);
    this.assert(s, 'Approx equal: approxEqual(1.0000001, 1.0, 1e-5) is true', PrecisionEngine.approxEqual(1.0000001, 1.0, 1e-5));
    this.assert(s, 'Safe divide by zero returns fallback', PrecisionEngine.safeDivide(10, 0, -1) === -1);
    this.assert(s, 'Clamp within range', PrecisionEngine.clamp(150, 0, 100) === 100 && PrecisionEngine.clamp(-10, 0, 100) === 0);
  }

  private testUnitCompatibility() {
    const s = 'UnitHandler';
    this.assert(s, 'Internal convert 1 m to cm = 100', UnitHandler.convert(1, 'm', 'cm') === 100);
    this.assert(s, 'Internal convert 1000 g to kg = 1', UnitHandler.convert(1000, 'g', 'kg') === 1);
    this.assert(s, 'Are length units compatible: m and ft', UnitHandler.areCompatible('m', 'ft') === true);
    this.assert(s, 'Incompatible units rejection: m and kg', UnitHandler.areCompatible('m', 'kg') === false);
    
    let caughtMismatched = false;
    try {
      UnitHandler.convert(10, 'm', 'kg');
    } catch {
      caughtMismatched = true;
    }
    this.assert(s, 'Throws on dimension mismatch: m to kg', caughtMismatched);
  }

  private testValidationAndErrors() {
    const s = 'ValidationEngine & ErrorHandler';
    const reqErr = ValidationEngine.validateRequired('fieldName', undefined);
    this.assert(s, 'Required validation catches undefined', reqErr !== null && reqErr.code === 'REQUIRED_FIELD_MISSING');

    const numErr = ValidationEngine.validateNumeric('price', 'abc');
    this.assert(s, 'Numeric validation catches string', numErr !== null && numErr.code === 'INVALID_NUMERIC_VALUE');

    const posErr = ValidationEngine.validatePositive('dimension', -5);
    this.assert(s, 'Positive validation catches negative', posErr !== null && posErr.code === 'POSITIVE_NUMBER_REQUIRED');

    const zeroErr = ValidationEngine.validateNonZero('divisor', 0);
    this.assert(s, 'Zero validation catches 0 for divisor', zeroErr !== null && zeroErr.code === 'DIVISION_BY_ZERO');

    const rangeErr = ValidationEngine.validateRange('percentage', 150, 0, 100);
    this.assert(s, 'Range validation catches > max', rangeErr !== null && rangeErr.code === 'RANGE_OUT_OF_BOUNDS');

    const safeRes = ErrorHandler.safeExecute(() => {
      throw new Error('Test math failure');
    });
    this.assert(s, 'ErrorHandler.safeExecute catches unexpected exceptions', safeRes.success === false && safeRes.errors?.length === 1);
  }

  private testRegistryValidation() {
    const s = 'CalculationRegistry';
    const report = CalculationRegistry.validateRegistry();
    const allContracts = CalculationRegistry.getAll();
    this.assert(s, 'CalculationRegistry initializes successfully with explicit contracts', allContracts.length >= 400);
    this.assert(s, 'CalculationRegistry metadataTotal matches catalog length (4400 raw)', report.metadataTotal === 4400);
    this.assert(s, 'CalculationRegistry registeredCount is >= 400', report.registeredCount >= 400);
    this.assert(s, 'CalculationRegistry dynamic fallback retrieval succeeds for catalog tool', Boolean(CalculationRegistry.get('moving-planner')));
  }

  private testAll24Calculators() {
    const s = 'All24CalculatorFixtures';

    // 1. Percentage & Fraction Calculator
    const r1 = CalculationExecutor.execute('percentage', { percentX: 15, totalY: 200 });
    this.assert(s, '1. percentage: 15% of 200 = 30', r1.success && (r1.data as any).result === 30);

    // 2. Quadratic Equation Solver
    const r2 = CalculationExecutor.execute('quadratic', { a: 1, b: -5, c: 6 });
    this.assert(s, '2. quadratic: x^2 - 5x + 6 = 0 roots [3, 2]', r2.success && (r2.data as any).root1 === 3 && (r2.data as any).root2 === 2);

    // 3. Slope-Intercept Linear Calculator
    const r3 = CalculationExecutor.execute('slope-intercept', { x1: 1, y1: 2, x2: 4, y2: 8 });
    this.assert(s, '3. slope-intercept: (1,2) to (4,8) slope=2', r3.success && (r3.data as any).slope === 2);

    // 4. Area & Perimeter Calculator
    const r4 = CalculationExecutor.execute('area-shapes', { length: 10, width: 5 });
    this.assert(s, '4. area-shapes: 10x5 rectArea=50', r4.success && (r4.data as any).rectArea === 50);

    // 5. Volume & Surface Area Calculator
    const r5 = CalculationExecutor.execute('volume-surface', { radius: 3, height: 5 });
    this.assert(s, '5. volume-surface: r=3 h=5 cylVol ~ 141.37', r5.success && Math.abs((r5.data as any).cylVol - 141.37) < 0.1);

    // 6. Pythagorean Theorem Calculator
    const r6 = CalculationExecutor.execute('pythagorean', { legA: 6, legB: 8 });
    this.assert(s, '6. pythagorean: 6, 8 => hypotenuse 10', r6.success && (r6.data as any).hypotenuse === 10);

    // 7. Trigonometric Functions Calculator
    const r7 = CalculationExecutor.execute('trig-solver', { angle: 30 });
    this.assert(s, '7. trig-solver: sin(30) = 0.5', r7.success && Math.abs((r7.data as any).sinVal - 0.5) < 1e-4);

    // 8. Statistics & Probability Calculator
    const r8 = CalculationExecutor.execute('stats-summary', { data: [10, 20, 20, 30, 40] });
    this.assert(s, '8. stats-summary: mean=24', r8.success && (r8.data as any).mean === 24);

    // 9. Scientific Calculator
    const r9 = CalculationExecutor.execute('scientific-calc', { base: 2, exponent: 8 });
    this.assert(s, '9. scientific-calc: 2^8 = 256', r9.success && (r9.data as any).powVal === 256);

    // 10. Loan & Mortgage Calculator
    const r10 = CalculationExecutor.execute('loan-mortgage', { principal: 320000, rate: 6.5, years: 30 });
    this.assert(s, '10. loan-mortgage: payment ~ 2022.62', r10.success && Math.abs((r10.data as any).monthlyPayment - 2022.62) < 0.1);

    // 11. Compound Interest Calculator
    const r12 = CalculationExecutor.execute('compound-interest', { principal: 10000, rate: 7.0, years: 10, monthlyAddition: 0 });
    this.assert(s, '11. compound-interest: ~ $20,096.61', r12.success && Math.abs((r12.data as any).futureValue - 20096.61) < 0.5);

    // 12. Break-Even Analysis Calculator
    const r12b = CalculationExecutor.execute('break-even', { fixedCosts: 10000, pricePerUnit: 50, variableCost: 30 });
    this.assert(s, '12. break-even: 500 units', r12b.success && (r12b.data as any).breakEvenUnits === 500);

    // 13. Profit Margin & Markup Calculator
    const r13 = CalculationExecutor.execute('profit-margin', { cost: 65000, revenue: 100000 });
    this.assert(s, '13. profit-margin: profit=35k, margin=35%', r13.success && (r13.data as any).grossProfit === 35000 && (r13.data as any).marginPct === 35);

    // 14. Construction Material & Concrete Calculator
    const r14 = CalculationExecutor.execute('construction-calc', { length: 20, width: 10, depthInches: 4 });
    this.assert(s, '14. construction-calc: ~ 2.72 cu yds with waste', r14.success && Math.abs((r14.data as any).cuYdsWithWaste - 2.72) < 0.05);

    // 15. BMI Calculator
    const r15 = CalculationExecutor.execute('bmi', { heightCm: 175, weightKg: 70 });
    this.assert(s, '15. bmi: 175cm / 70kg ~ 22.86 Normal', r15.success && (r15.data as any).category === 'Normal weight');

    // 16. BMR & TDEE Calorie Calculator
    const r16 = CalculationExecutor.execute('bmr-tdee', { weightKg: 80, heightCm: 180, age: 30, gender: 'male' });
    this.assert(s, '16. bmr-tdee: BMR = 1780', r16.success && (r16.data as any).bmr === 1780);

    // 17. Age Calculator
    const r17 = CalculationExecutor.execute('exact-age', { birthDate: '2000-01-01' });
    this.assert(s, '17. exact-age: birthDate 2000-01-01 returns years >= 25', r17.success && (r17.data as any).years >= 25);

    // 18. Date Difference & Business Days Calculator
    const r18 = CalculationExecutor.execute('date-difference', { startDate: '2026-10-05', endDate: '2026-10-16' });
    this.assert(s, '18. date-difference: 11 calendar days, 10 business days', r18.success && (r18.data as any).totalDays === 11 && (r18.data as any).businessDays === 10);

    // 19. Ohm's Law & Power Calculator
    const r19 = CalculationExecutor.execute('ohms-law', { voltage: 120, current: 5 });
    this.assert(s, '19. ohms-law: 120V * 5A = 600W', r19.success && (r19.data as any).power === 600);

    // 20. Electricity Appliance Cost Calculator
    const r20 = CalculationExecutor.execute('electricity-cost', { watts: 1200, hoursPerDay: 8, ratePerKwh: 0.15 });
    this.assert(s, '20. electricity-cost: 30-day cost = $43.20', r20.success && (r20.data as any).totalCost === 43.20);

    // 21. Hydraulic Cylinder Force Calculator
    const r21 = CalculationExecutor.execute('hydraulic-force', { pressurePsi: 2500, boreDiameterInches: 3.0 });
    this.assert(s, '21. hydraulic-force: forceTons > 8', r21.success && (r21.data as any).forceTons > 8);

    // 22. Kinetic & Potential Energy Calculator
    const r22 = CalculationExecutor.execute('kinetic-energy', { massKg: 1000, velocityMps: 20 });
    this.assert(s, '22. kinetic-energy: KE = 200,000 J', r22.success && (r22.data as any).keJoules === 200000);

    // 23. Tip & Bill Split Calculator
    const r23 = CalculationExecutor.execute('tip-split', { billAmount: 84.0, tipPercent: 20, guests: 3 });
    this.assert(s, '23. tip-split: tip=$16.80, perPerson=$33.60', r23.success && (r23.data as any).tip === 16.80 && (r23.data as any).perPerson === 33.60);

    // 24. Discount & Sales Tax Calculator
    const r24 = CalculationExecutor.execute('discount-tax', { originalPrice: 80, discountPercent: 25, taxPercent: 8.25 });
    this.assert(s, '24. discount-tax: save=$20, final=$64.95', r24.success && (r24.data as any).discountAmount === 20 && (r24.data as any).finalPrice === 64.95);
  }
}

// Direct CLI execution support
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('test-suite')) {
  const suite = new EngineTestSuite();
  const summary = suite.runAll();
  if (summary.failed > 0) {
    process.exit(1);
  }
}
