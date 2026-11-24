import { PrecisionEngine } from './PrecisionEngine.ts';

export class FormulaEngine {
  // =========================================================================
  // 1. ARITHMETIC
  // =========================================================================

  public static add(a: number, b: number): number {
    return PrecisionEngine.clean(a + b);
  }

  public static subtract(a: number, b: number): number {
    return PrecisionEngine.clean(a - b);
  }

  public static multiply(a: number, b: number): number {
    return PrecisionEngine.clean(a * b);
  }

  public static divide(numerator: number, denominator: number, fallback?: number | null): number | null {
    if (Math.abs(denominator) < 1e-12) {
      if (fallback !== undefined) return fallback;
      throw new Error('Division by zero encountered.');
    }
    return PrecisionEngine.clean(numerator / denominator);
  }

  public static modulo(dividend: number, divisor: number): number {
    if (divisor === 0) throw new Error('Modulo by zero encountered.');
    return PrecisionEngine.clean(dividend % divisor);
  }

  public static abs(value: number): number {
    return Math.abs(value);
  }

  public static gcd(a: number, b: number): number {
    if (isNaN(a) || isNaN(b) || !isFinite(a) || !isFinite(b)) return 1;
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0 && !isNaN(y)) {
      const temp = y;
      y = x % y;
      x = temp;
    }
    return x;
  }

  public static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(Math.round((a * b) / this.gcd(a, b)));
  }

  // =========================================================================
  // 2. PERCENTAGES
  // =========================================================================

  public static percentageOf(percent: number, total: number): number {
    return PrecisionEngine.clean((percent / 100) * total);
  }

  public static percentageChange(fromValue: number, toValue: number): number {
    if (Math.abs(fromValue) < 1e-12) {
      throw new Error('Cannot calculate percentage change from a base of zero.');
    }
    const diff = toValue - fromValue;
    return PrecisionEngine.clean((diff / Math.abs(fromValue)) * 100);
  }

  public static percentageDifference(val1: number, val2: number): number {
    const avg = (Math.abs(val1) + Math.abs(val2)) / 2;
    if (avg < 1e-12) return 0;
    return PrecisionEngine.clean((Math.abs(val1 - val2) / avg) * 100);
  }

  public static percentageIncrease(fromValue: number, toValue: number): number {
    return this.percentageChange(fromValue, toValue);
  }

  public static percentageDecrease(fromValue: number, toValue: number): number {
    return this.percentageChange(fromValue, toValue);
  }

  public static reversePercentage(amount: number, percent: number): number {
    if (percent === 0) throw new Error('Cannot compute reverse percentage with zero percent.');
    return PrecisionEngine.clean((amount / percent) * 100);
  }

  // =========================================================================
  // 3. ALGEBRA
  // =========================================================================

  public static solveLinear(a: number, b: number): { solution: number } {
    if (Math.abs(a) < 1e-12) {
      throw new Error('Coefficient "a" cannot be zero in linear equation ax + b = 0');
    }
    return { solution: PrecisionEngine.clean(-b / a) };
  }

  public static solveQuadratic(a: number, b: number, c: number): {
    discriminant: number;
    roots: number[] | null;
    type: 'real' | 'complex';
  } {
    const res = this.quadratic(a, b, c);
    if (!res.hasRealRoots) {
      return { discriminant: res.discriminant, roots: null, type: 'complex' };
    }
    return {
      discriminant: res.discriminant,
      roots: [res.root1 as number, res.root2 as number],
      type: 'real'
    };
  }

  public static nthRoot(value: number, n: number): number {
    return this.root(value, n);
  }

  public static logarithm(value: number, base = 10): number {
    return this.log(value, base);
  }

  public static linearSlopeIntercept(x1: number, y1: number, x2: number, y2: number): {
    slope: number;
    interceptB: number;
    distance: number;
    isVertical: boolean;
  } {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (Math.abs(dx) < 1e-12) {
      return { slope: Infinity, interceptB: NaN, distance, isVertical: true };
    }

    const slope = PrecisionEngine.clean(dy / dx);
    const interceptB = PrecisionEngine.clean(y1 - slope * x1);
    return { slope, interceptB, distance, isVertical: false };
  }

  public static quadratic(a: number, b: number, c: number): {
    discriminant: number;
    hasRealRoots: boolean;
    root1: number | string;
    root2: number | string;
    vertexX: number;
    vertexY: number;
  } {
    if (Math.abs(a) < 1e-12) {
      throw new Error('Coefficient "a" cannot be zero in a quadratic equation.');
    }

    const discriminant = PrecisionEngine.clean(b * b - 4 * a * c);
    const vertexX = PrecisionEngine.clean(-b / (2 * a));
    const vertexY = PrecisionEngine.clean(a * vertexX * vertexX + b * vertexX + c);

    if (discriminant > 1e-12) {
      const sqrtD = Math.sqrt(discriminant);
      const root1 = PrecisionEngine.clean((-b + sqrtD) / (2 * a));
      const root2 = PrecisionEngine.clean((-b - sqrtD) / (2 * a));
      return { discriminant, hasRealRoots: true, root1, root2, vertexX, vertexY };
    } else if (Math.abs(discriminant) <= 1e-12) {
      const root = vertexX;
      return { discriminant: 0, hasRealRoots: true, root1: root, root2: root, vertexX, vertexY };
    } else {
      const realPart = vertexX.toFixed(2);
      const imagPart = (Math.sqrt(Math.abs(discriminant)) / (2 * Math.abs(a))).toFixed(2);
      return {
        discriminant,
        hasRealRoots: false,
        root1: `${realPart} + ${imagPart}i`,
        root2: `${realPart} - ${imagPart}i`,
        vertexX,
        vertexY
      };
    }
  }

  public static power(base: number, exponent: number): number {
    return PrecisionEngine.clean(Math.pow(base, exponent));
  }

  public static root(value: number, n = 2): number {
    if (n === 0) throw new Error('Root degree "n" cannot be zero.');
    if (value < 0 && n % 2 === 0) {
      throw new Error('Even root of a negative number is non-real.');
    }
    if (value < 0) {
      return -PrecisionEngine.clean(Math.pow(-value, 1 / n));
    }
    return PrecisionEngine.clean(Math.pow(value, 1 / n));
  }

  public static log(value: number, base = 10): number {
    if (value <= 0) throw new Error('Logarithm input must be strictly positive.');
    if (base <= 0 || base === 1) throw new Error('Logarithm base must be positive and not equal to 1.');
    return PrecisionEngine.clean(Math.log(value) / Math.log(base));
  }

  public static ln(value: number): number {
    if (value <= 0) throw new Error('Natural logarithm input must be strictly positive.');
    return PrecisionEngine.clean(Math.log(value));
  }

  // =========================================================================
  // 4. GEOMETRY
  // =========================================================================

  public static rectangleArea(length: number, width: number): number {
    return PrecisionEngine.clean(length * width);
  }

  public static rectanglePerimeter(length: number, width: number): number {
    return PrecisionEngine.clean(2 * (length + width));
  }

  public static circleArea(radius: number): number {
    return PrecisionEngine.clean(Math.PI * radius * radius);
  }

  public static circleCircumference(radius: number): number {
    return PrecisionEngine.clean(2 * Math.PI * radius);
  }

  public static triangleArea(base: number, height: number): number {
    return PrecisionEngine.clean(0.5 * base * height);
  }

  public static cylinderVolume(radius: number, height: number): number {
    return PrecisionEngine.clean(Math.PI * radius * radius * height);
  }

  public static cylinderSurfaceArea(radius: number, height: number): number {
    return PrecisionEngine.clean(2 * Math.PI * radius * (radius + height));
  }

  public static sphereVolume(radius: number): number {
    return PrecisionEngine.clean((4 / 3) * Math.PI * Math.pow(radius, 3));
  }

  public static sphereSurfaceArea(radius: number): number {
    return PrecisionEngine.clean(4 * Math.PI * radius * radius);
  }

  public static boxVolume(length: number, width: number, height: number): number {
    return PrecisionEngine.clean(length * width * height);
  }

  public static boxSurfaceArea(length: number, width: number, height: number): number {
    return PrecisionEngine.clean(2 * (length * width + length * height + width * height));
  }

  public static coneVolume(radius: number, height: number): number {
    return PrecisionEngine.clean((1 / 3) * Math.PI * radius * radius * height);
  }

  public static circle(radius: number): { area: number; perimeter: number } {
    return {
      area: this.circleArea(radius),
      perimeter: this.circleCircumference(radius)
    };
  }

  public static cylinder(radius: number, height: number): { volume: number; surfaceArea: number } {
    return {
      volume: this.cylinderVolume(radius, height),
      surfaceArea: this.cylinderSurfaceArea(radius, height)
    };
  }

  // =========================================================================
  // 5. TRIGONOMETRY
  // =========================================================================

  public static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  public static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  public static pythagoreanHypotenuse(legA: number, legB: number): number {
    return PrecisionEngine.clean(Math.sqrt(legA * legA + legB * legB));
  }

  public static hypotenuse(legA: number, legB: number): number {
    return this.pythagoreanHypotenuse(legA, legB);
  }

  public static pythagoreanLeg(hypotenuse: number, leg: number): number {
    if (hypotenuse < leg) {
      throw new Error('Hypotenuse cannot be shorter than a triangle leg.');
    }
    return PrecisionEngine.clean(Math.sqrt(hypotenuse * hypotenuse - leg * leg));
  }

  public static trigSin(angle: number, inDegrees = true): number {
    const rad = inDegrees ? this.degToRad(angle) : angle;
    return PrecisionEngine.clean(Math.sin(rad));
  }

  public static trigCos(angle: number, inDegrees = true): number {
    const rad = inDegrees ? this.degToRad(angle) : angle;
    return PrecisionEngine.clean(Math.cos(rad));
  }

  public static trigTan(angle: number, inDegrees = true): number {
    const rad = inDegrees ? this.degToRad(angle) : angle;
    const cosVal = Math.cos(rad);
    if (Math.abs(cosVal) < 1e-12) {
      throw new Error('Tangent is undefined at odd multiples of 90 degrees.');
    }
    return PrecisionEngine.clean(Math.tan(rad));
  }

  public static trigValues(angle: number, unit: 'deg' | 'rad' = 'deg'): { sin: number; cos: number; tan: number | null } {
    const isDeg = unit === 'deg';
    let tanVal: number | null = null;
    try {
      tanVal = this.trigTan(angle, isDeg);
    } catch {
      tanVal = null;
    }
    return {
      sin: this.trigSin(angle, isDeg),
      cos: this.trigCos(angle, isDeg),
      tan: tanVal
    };
  }

  // =========================================================================
  // 6. STATISTICS
  // =========================================================================

  public static mean(values: number[]): number {
    if (values.length === 0) throw new Error('Cannot calculate mean of empty dataset.');
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return PrecisionEngine.clean(sum / values.length);
  }

  public static median(values: number[]): number {
    if (values.length === 0) throw new Error('Cannot calculate median of empty dataset.');
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
      return sorted[mid];
    }
    return PrecisionEngine.clean((sorted[mid - 1] + sorted[mid]) / 2);
  }

  public static mode(values: number[]): number[] {
    if (values.length === 0) return [];
    const counts = new Map<number, number>();
    let maxFreq = 0;

    for (const v of values) {
      const c = (counts.get(v) || 0) + 1;
      counts.set(v, c);
      if (c > maxFreq) maxFreq = c;
    }

    if (maxFreq === 1 && values.length > 1) return []; // No distinct mode
    const modes: number[] = [];
    for (const [val, count] of counts.entries()) {
      if (count === maxFreq) modes.push(val);
    }
    return modes.sort((a, b) => a - b);
  }

  public static variance(values: number[], isSample = true): number {
    if (values.length < (isSample ? 2 : 1)) {
      throw new Error(`Variance requires at least ${isSample ? 2 : 1} data point(s).`);
    }
    const avg = this.mean(values);
    const sqDiffSum = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
    const divisor = isSample ? values.length - 1 : values.length;
    return PrecisionEngine.clean(sqDiffSum / divisor);
  }

  public static standardDeviation(values: number[], isSample = true): number {
    return PrecisionEngine.clean(Math.sqrt(this.variance(values, isSample)));
  }

  public static factorial(n: number): number {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('Factorial requires a non-negative integer.');
    }
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  public static permutations(n: number, r: number): number {
    if (n < 0 || r < 0 || r > n) {
      throw new Error('Permutations require 0 <= r <= n.');
    }
    return PrecisionEngine.clean(this.factorial(n) / this.factorial(n - r));
  }

  public static combinations(n: number, r: number): number {
    if (n < 0 || r < 0 || r > n) {
      throw new Error('Combinations require 0 <= r <= n.');
    }
    return PrecisionEngine.clean(this.factorial(n) / (this.factorial(r) * this.factorial(n - r)));
  }

  public static statistics(values: number[]): {
    mean: number;
    median: number;
    mode: number[];
    min: number;
    max: number;
    stdDev: number;
  } {
    return {
      mean: this.mean(values),
      median: this.median(values),
      mode: this.mode(values),
      min: Math.min(...values),
      max: Math.max(...values),
      stdDev: this.standardDeviation(values)
    };
  }

  // =========================================================================
  // 7. FINANCIAL
  // =========================================================================

  public static loanPayment(principal: number, annualRatePct: number, years: number): { monthlyPayment: number } {
    return {
      monthlyPayment: this.loanMonthlyPayment(principal, annualRatePct, Math.round(years * 12))
    };
  }

  public static loanMonthlyPayment(principal: number, annualRatePct: number, totalMonths: number): number {
    if (principal <= 0 || totalMonths <= 0) return 0;
    if (annualRatePct <= 0) return PrecisionEngine.clean(principal / totalMonths);

    const monthlyRate = annualRatePct / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const payment = principal * (monthlyRate * factor) / (factor - 1);
    return PrecisionEngine.roundFinancial(payment);
  }

  public static compoundInterest(
    principal: number,
    annualRatePct: number,
    compoundingsPerYear: number,
    years: number,
    monthlyContribution = 0
  ): {
    futureValue: number;
    totalPrincipalInvested: number;
    totalInterestEarned: number;
  } {
    const r = annualRatePct / 100;
    const n = compoundingsPerYear > 0 ? compoundingsPerYear : 12;
    const t = years;
    const totalMonths = Math.round(t * 12);

    // Initial principal compounding
    const initialFutureValue = principal * Math.pow(1 + r / n, n * t);

    // Regular contributions compounding (end of period annuity)
    let contributionsFutureValue = 0;
    if (monthlyContribution > 0) {
      const monthlyRate = r / 12;
      if (monthlyRate > 0) {
        contributionsFutureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      } else {
        contributionsFutureValue = monthlyContribution * totalMonths;
      }
    }

    const futureValue = PrecisionEngine.roundFinancial(initialFutureValue + contributionsFutureValue);
    const totalPrincipalInvested = PrecisionEngine.roundFinancial(principal + (monthlyContribution * totalMonths));
    const totalInterestEarned = PrecisionEngine.roundFinancial(futureValue - totalPrincipalInvested);

    return { futureValue, totalPrincipalInvested, totalInterestEarned };
  }

  // =========================================================================
  // 8. ENGINEERING & ELECTRICAL
  // =========================================================================

  public static hydraulicPistonForce(pressurePsi: number, boreDiameterInches: number): {
    areaSqIn: number;
    forceLbs: number;
    forceTons: number;
  } {
    const radius = boreDiameterInches / 2;
    const areaSqIn = PrecisionEngine.clean(Math.PI * radius * radius);
    const forceLbs = PrecisionEngine.clean(pressurePsi * areaSqIn);
    const forceTons = PrecisionEngine.clean(forceLbs / 2000);
    return { areaSqIn, forceLbs, forceTons };
  }

  public static kineticEnergy(massKg: number, velocityMps: number): number {
    return PrecisionEngine.clean(0.5 * massKg * velocityMps * velocityMps);
  }

  public static potentialEnergy(massKg: number, heightMeters: number, gravity = 9.80665): number {
    return PrecisionEngine.clean(massKg * gravity * heightMeters);
  }

  public static ohmsLawSolve(v?: number, i?: number, r?: number, p?: number): {
    voltage: number;
    current: number;
    resistance: number;
    power: number;
  } {
    let volt = v;
    let curr = i;
    let res = r;
    let pow = p;

    // Solve from V and I
    if (volt !== undefined && curr !== undefined && volt > 0 && curr > 0) {
      res = volt / curr;
      pow = volt * curr;
    }
    // Solve from V and R
    else if (volt !== undefined && res !== undefined && volt > 0 && res > 0) {
      curr = volt / res;
      pow = (volt * volt) / res;
    }
    // Solve from I and R
    else if (curr !== undefined && res !== undefined && curr > 0 && res > 0) {
      volt = curr * res;
      pow = curr * curr * res;
    }
    // Solve from P and V
    else if (pow !== undefined && volt !== undefined && pow > 0 && volt > 0) {
      curr = pow / volt;
      res = (volt * volt) / pow;
    }
    // Solve from P and I
    else if (pow !== undefined && curr !== undefined && pow > 0 && curr > 0) {
      volt = pow / curr;
      res = pow / (curr * curr);
    }
    // Solve from P and R
    else if (pow !== undefined && res !== undefined && pow > 0 && res > 0) {
      volt = Math.sqrt(pow * res);
      curr = Math.sqrt(pow / res);
    }

    return {
      voltage: PrecisionEngine.clean(volt || 0),
      current: PrecisionEngine.clean(curr || 0),
      resistance: PrecisionEngine.clean(res || 0),
      power: PrecisionEngine.clean(pow || 0)
    };
  }

  public static electricityCost(watts: number, hoursPerDay: number, ratePerKwh: number, days = 30): {
    kwhPerDay: number;
    kwhTotal: number;
    totalCost: number;
  } {
    const kwhPerDay = PrecisionEngine.clean((watts * hoursPerDay) / 1000);
    const kwhTotal = PrecisionEngine.clean(kwhPerDay * days);
    const totalCost = PrecisionEngine.roundFinancial(kwhTotal * ratePerKwh);
    return { kwhPerDay, kwhTotal, totalCost };
  }

  public static ohmsLawVoltage(current: number, resistance: number): number {
    return PrecisionEngine.clean(current * resistance);
  }

  public static electricalPower(voltage: number, current: number): number {
    return PrecisionEngine.clean(voltage * current);
  }

  public static torque(forceN: number, radiusM: number, angleDegrees = 90): number {
    const rad = this.degToRad(angleDegrees);
    return PrecisionEngine.clean(forceN * radiusM * Math.sin(rad));
  }
}
