import { CalculatorId, CalculatorMeta } from '../types.ts';
import { CALCULATORS } from './calculators.ts';

export interface CalculatorDetail {
  id: CalculatorId;
  formulaName: string;
  formulaLatex: string;
  variables: Array<{
    symbol: string;
    name: string;
    unit?: string;
    description: string;
  }>;
  methodology: string[];
  workedExample: {
    title: string;
    scenario: string;
    inputs: Record<string, string>;
    steps: string[];
    result: string;
  };
  assumptions: string[];
  limitations: string[];
  disclaimerType: 'financial' | 'health' | 'construction' | 'engineering' | 'standard';
  disclaimerText: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const CALCULATOR_DETAILS: Record<CalculatorId, CalculatorDetail> = {
  // 1. Basic Math - Percentage & Fraction
  percentage: {
    id: 'percentage',
    formulaName: 'Percentage and Relative Proportion Equations',
    formulaLatex: 'P = \\frac{X \\times Y}{100}, \\quad \\Delta\\% = \\frac{Y - X}{|X|} \\times 100',
    variables: [
      { symbol: 'X', name: 'Base Value', description: 'The starting number or percentage rate.' },
      { symbol: 'Y', name: 'Target Value', description: 'The total amount or final comparative number.' },
      { symbol: 'P', name: 'Percentage Amount', description: 'The computed proportion of the base value.' },
      { symbol: 'Δ%', name: 'Percentage Change', unit: '%', description: 'Relative increase or decrease between two values.' }
    ],
    methodology: [
      'Identify whether you are finding a percentage of a total, comparing two values for percentage difference, or reducing fractions.',
      'Multiply the percentage rate by the base number and divide by 100.',
      'For percentage change, subtract original from new, divide by the absolute original value, and multiply by 100.',
      'For fractions, determine the Greatest Common Divisor (GCD) using the Euclidean algorithm to reduce to simplest terms.'
    ],
    workedExample: {
      title: 'Calculating 18% Tip on a $120.00 Dinner',
      scenario: 'You want to compute an 18% gratuity on a restaurant bill totaling $120.00.',
      inputs: { 'Rate (X)': '18%', 'Total (Y)': '$120.00' },
      steps: [
        'Formula: P = (18 × 120) / 100',
        'Numerator product: 18 × 120 = 2,160',
        'Divide by 100: 2,160 / 100 = 21.60',
        'Add to base: $120.00 + $21.60 = $141.60'
      ],
      result: '$21.60 tip ($141.60 total)'
    },
    assumptions: ['Standard decimal arithmetic with IEEE 754 precision.', 'Divisions by zero are flagged and blocked.'],
    limitations: ['Does not account for compounding percentage tiers unless chained iteratively.'],
    disclaimerType: 'standard',
    disclaimerText: 'Standardized mathematical proportion formulas. Rounding is performed to 2 decimal places.',
    faqs: [
      { question: 'How is percentage increase different from percentage decrease?', answer: 'Percentage increase measures how much a value grows relative to its starting point, while percentage decrease measures reduction. A 50% increase followed by a 50% decrease does not return to the original value.' },
      { question: 'What is the easiest way to compute percentages mentally?', answer: 'Find 10% by shifting the decimal point one place left, halve that to get 5%, or double it for 20%, then combine.' }
    ]
  },

  // 2. Algebra - Quadratic Equation
  quadratic: {
    id: 'quadratic',
    formulaName: 'Quadratic Formula and Parabola Vertex',
    formulaLatex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}, \\quad V_x = -\\frac{b}{2a}',
    variables: [
      { symbol: 'a', name: 'Quadratic Coefficient', description: 'Non-zero coefficient of x² term.' },
      { symbol: 'b', name: 'Linear Coefficient', description: 'Coefficient of the linear x term.' },
      { symbol: 'c', name: 'Constant Term', description: 'Scalar constant in ax² + bx + c = 0.' },
      { symbol: 'Δ', name: 'Discriminant', description: 'Value of b² - 4ac determining root character.' }
    ],
    methodology: [
      'Standardize the polynomial equation into standard form: ax² + bx + c = 0.',
      'Calculate the discriminant: Δ = b² - 4ac.',
      'If Δ > 0, compute two distinct real roots.',
      'If Δ = 0, compute one repeated real root (tangent to x-axis).',
      'If Δ < 0, compute conjugate complex roots in the form u ± vi.',
      'Compute parabola vertex coordinate: (x_v = -b/(2a), y_v = f(x_v)).'
    ],
    workedExample: {
      title: 'Solving 2x² - 8x - 24 = 0',
      scenario: 'Find the roots and vertex of 2x² - 8x - 24 = 0.',
      inputs: { 'a': '2', 'b': '-8', 'c': '-24' },
      steps: [
        'Discriminant: Δ = (-8)² - 4(2)(-24) = 64 + 192 = 256',
        'Square root of discriminant: √256 = 16',
        'Root 1: (8 + 16) / (2 × 2) = 24 / 4 = 6.00',
        'Root 2: (8 - 16) / (2 × 2) = -8 / 4 = -2.00',
        'Vertex X: -(-8) / (2 × 2) = 8 / 4 = 2.00',
        'Vertex Y: 2(2)² - 8(2) - 24 = 8 - 16 - 24 = -32.00'
      ],
      result: 'Roots: x₁ = 6.00, x₂ = -2.00; Vertex: (2.00, -32.00)'
    },
    assumptions: ['The leading coefficient "a" cannot equal 0 (otherwise the equation degrades to linear).'],
    limitations: ['Complex solutions express imaginary roots with standard "i" notation rounded to 2 decimal places.'],
    disclaimerType: 'standard',
    disclaimerText: 'Strict algebraic closed-form evaluation adhering to standard polynomial roots theorem.',
    faqs: [
      { question: 'What does a negative discriminant mean in practical terms?', answer: 'A negative discriminant means the parabola never intersects the x-axis, producing two complex roots with imaginary components.' },
      { question: 'What does the vertex represent?', answer: 'The vertex is the extreme point of the parabola: the minimum point if a > 0, or maximum point if a < 0.' }
    ]
  },

  // 3. Algebra - Slope-Intercept
  'slope-intercept': {
    id: 'slope-intercept',
    formulaName: 'Slope-Intercept Linear Equation and Euclidean Distance',
    formulaLatex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad y = mx + b, \\quad d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
    variables: [
      { symbol: '(x₁, y₁)', name: 'Point 1 Coordinates', description: 'Cartesian coordinates of first point.' },
      { symbol: '(x₂, y₂)', name: 'Point 2 Coordinates', description: 'Cartesian coordinates of second point.' },
      { symbol: 'm', name: 'Slope', description: 'Gradient or rate of change of the line.' },
      { symbol: 'b', name: 'Y-Intercept', description: 'Y-coordinate where the line crosses the y-axis.' },
      { symbol: 'd', name: 'Euclidean Distance', description: 'Straight-line segment distance between points.' }
    ],
    methodology: [
      'Compute the vertical delta Δy = y₂ - y₁ and horizontal delta Δx = x₂ - x₁.',
      'Evaluate slope m = Δy / Δx. If Δx = 0, the line is vertical with undefined slope.',
      'Substitute point 1 into y = mx + b to isolate y-intercept: b = y₁ - m(x₁).',
      'Compute straight-line distance via Pythagorean Euclidean formula: d = √(Δx² + Δy²).'
    ],
    workedExample: {
      title: 'Line passing through (1, 2) and (4, 8)',
      scenario: 'Determine the slope, equation of the line, and distance between (1, 2) and (4, 8).',
      inputs: { 'Point 1': '(1, 2)', 'Point 2': '(4, 8)' },
      steps: [
        'Δx = 4 - 1 = 3, Δy = 8 - 2 = 6',
        'Slope m = 6 / 3 = 2.00',
        'Intercept b = 2 - (2.00 × 1) = 0.00',
        'Equation: y = 2.00x + 0.00',
        'Distance d = √(3² + 6²) = √(9 + 36) = √45 ≈ 6.71'
      ],
      result: 'Slope m = 2.00, Equation: y = 2x, Distance = 6.71 units'
    },
    assumptions: ['2D Cartesian plane with uniform orthogonal scaling on both axes.'],
    limitations: ['Vertical lines (x₁ = x₂) have infinite/undefined slope and an equation of form x = c.'],
    disclaimerType: 'standard',
    disclaimerText: 'Analytical Cartesian geometry formulas computed to high floating-point precision.',
    faqs: [
      { question: 'What does a zero slope indicate?', answer: 'A slope of zero indicates a perfectly horizontal line parallel to the x-axis, with equation y = b.' },
      { question: 'How is the y-intercept used in graphing?', answer: 'The y-intercept provides the exact anchor point (0, b) from which slope increments (rise over run) can be plotted.' }
    ]
  },

  // 4. Geometry - Area & Perimeter
  'area-shapes': {
    id: 'area-shapes',
    formulaName: '2D Planar Geometric Area and Perimeter',
    formulaLatex: 'A_{rect} = l \\cdot w, \\quad A_{circ} = \\pi r^2, \\quad A_{tri} = \\frac{1}{2} b h',
    variables: [
      { symbol: 'l, w', name: 'Length & Width', unit: 'units', description: 'Orthogonal side lengths of rectangle.' },
      { symbol: 'r', name: 'Radius', unit: 'units', description: 'Distance from circle center to outer perimeter.' },
      { symbol: 'b, h', name: 'Base & Height', unit: 'units', description: 'Triangle base length and perpendicular altitude.' },
      { symbol: 'A', name: 'Area', unit: 'units²', description: 'Two-dimensional planar surface area.' },
      { symbol: 'P / C', name: 'Perimeter / Circumference', unit: 'units', description: 'Total boundary perimeter length.' }
    ],
    methodology: [
      'Select shape: rectangle, circle, triangle, or trapezoid.',
      'Measure orthogonal planar dimensions in consistent units.',
      'Apply standard verified Euclidean formulas.',
      'Multiply base by height for rectangles, square radius by π for circles, or half base times height for triangles.'
    ],
    workedExample: {
      title: 'Area and Circumference of a Circular Patio with Radius 7m',
      scenario: 'Find surface area and edge perimeter for a circular patio of radius 7 meters.',
      inputs: { 'Shape': 'Circle', 'Radius (r)': '7 meters' },
      steps: [
        'Area: A = π × r² = 3.14159 × 7² = 3.14159 × 49 ≈ 153.94 m²',
        'Circumference: C = 2 × π × r = 2 × 3.14159 × 7 ≈ 43.98 m'
      ],
      result: 'Area: 153.94 m², Circumference: 43.98 m'
    },
    assumptions: ['Flat 2D Euclidean plane.', 'Dimensions are entered in homogeneous units.'],
    limitations: ['Does not calculate irregular curved boundaries requiring numerical integration.'],
    disclaimerType: 'standard',
    disclaimerText: 'Rigorous Euclidean geometry based on exact mathematical constants (π ≈ 3.1415926535).',
    faqs: [
      { question: 'Why does doubling radius quadruple the area?', answer: 'Because radius is squared in the area formula (A = πr²), scaling the radius by a factor of k scales the area by k² (2² = 4).' }
    ]
  },

  // 5. Geometry - Volume & Surface
  'volume-surface': {
    id: 'volume-surface',
    formulaName: '3D Solid Solid Volume and Total Surface Area',
    formulaLatex: 'V_{cyl} = \\pi r^2 h, \\quad V_{sph} = \\frac{4}{3} \\pi r^3, \\quad V_{box} = l \\cdot w \\cdot h',
    variables: [
      { symbol: 'r', name: 'Radius', unit: 'units', description: 'Radius of circular cross-section or sphere.' },
      { symbol: 'h', name: 'Height', unit: 'units', description: 'Perpendicular height of solid.' },
      { symbol: 'V', name: 'Volume', unit: 'units³', description: 'Total three-dimensional internal space.' },
      { symbol: 'SA', name: 'Surface Area', unit: 'units²', description: 'Total exterior boundary surface area.' }
    ],
    methodology: [
      'Identify 3D geometry: cylinder, sphere, rectangular prism, or cone.',
      'Compute base cross-sectional area and integrate along longitudinal height.',
      'For spheres, evaluate (4/3)πr³ for volume and 4πr² for total surface area.'
    ],
    workedExample: {
      title: 'Volume of a Water Storage Cylinder (r=3m, h=5m)',
      scenario: 'Calculate holding capacity and steel surface area of a cylindrical tank.',
      inputs: { 'Radius (r)': '3 m', 'Height (h)': '5 m' },
      steps: [
        'Base area: A_base = π × 3² = 9π ≈ 28.27 m²',
        'Volume: V = 28.27 × 5 = 141.37 m³',
        'Lateral surface: 2πrh = 2 × π × 3 × 5 = 30π ≈ 94.25 m²',
        'Total surface area (with 2 end caps): 94.25 + 2(28.27) = 150.80 m²'
      ],
      result: 'Volume: 141.37 m³ (141,372 Liters), Surface: 150.80 m²'
    },
    assumptions: ['Uniform solid with unwarped boundaries.', 'Homogeneous unit measurements.'],
    limitations: ['Assumes regular convex solids without internal cavities.'],
    disclaimerType: 'standard',
    disclaimerText: 'Solid geometry calculations compliant with standard stereometric theorems.',
    faqs: [
      { question: 'How do cubic meters convert to liters?', answer: 'One cubic meter (1 m³) equals exactly 1,000 liters of fluid capacity.' }
    ]
  },

  // 6. Trigonometry - Pythagorean
  pythagorean: {
    id: 'pythagorean',
    formulaName: 'Pythagorean Theorem and Right Triangle Solver',
    formulaLatex: 'a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}, \\quad a = \\sqrt{c^2 - b^2}',
    variables: [
      { symbol: 'a', name: 'Leg A', unit: 'units', description: 'First perpendicular leg.' },
      { symbol: 'b', name: 'Leg B', unit: 'units', description: 'Second perpendicular leg.' },
      { symbol: 'c', name: 'Hypotenuse', unit: 'units', description: 'Side opposite the 90° right angle.' },
      { symbol: 'A', name: 'Area', unit: 'units²', description: 'Right triangle area: (a × b) / 2.' }
    ],
    methodology: [
      'Confirm the triangle contains a 90° right angle.',
      'If solving for hypotenuse, sum squares of both legs and take square root: c = √(a² + b²).',
      'If solving for a missing leg, subtract square of known leg from hypotenuse squared: a = √(c² - b²).'
    ],
    workedExample: {
      title: 'Determining Diagonal Brace for a 6ft by 8ft Wall',
      scenario: 'Find diagonal timber length required for a rectangular frame measuring 6 feet by 8 feet.',
      inputs: { 'Leg a': '6 ft', 'Leg b': '8 ft' },
      steps: [
        'Square leg a: 6² = 36',
        'Square leg b: 8² = 64',
        'Sum squares: 36 + 64 = 100',
        'Take square root: √100 = 10.00 ft'
      ],
      result: 'Hypotenuse c = 10.00 ft (Classic 3-4-5 Pythagorean triple)'
    },
    assumptions: ['Angle between legs a and b is exactly 90 degrees.'],
    limitations: ['Applicable only to right-angled triangles in flat Euclidean space.'],
    disclaimerType: 'standard',
    disclaimerText: 'Classic Pythagorean theorem verified through Euclidean geometric proof.',
    faqs: [
      { question: 'What is a Pythagorean triple?', answer: 'A Pythagorean triple consists of three positive integers a, b, and c that satisfy a² + b² = c² (such as 3, 4, 5 and 5, 12, 13).' }
    ]
  },

  // 7. Trigonometry - Trig Functions
  'trig-solver': {
    id: 'trig-solver',
    formulaName: 'Trigonometric Function Ratios and Angular Relationships',
    formulaLatex: '\\sin(\\theta) = \\frac{\\text{opp}}{\\text{hyp}}, \\quad \\cos(\\theta) = \\frac{\\text{adj}}{\\text{hyp}}, \\quad \\tan(\\theta) = \\frac{\\text{opp}}{\\text{adj}}',
    variables: [
      { symbol: 'θ', name: 'Angle', unit: 'degrees / radians', description: 'Angle of interest.' },
      { symbol: 'sin(θ)', name: 'Sine', description: 'Ratio of opposite side to hypotenuse.' },
      { symbol: 'cos(θ)', name: 'Cosine', description: 'Ratio of adjacent side to hypotenuse.' },
      { symbol: 'tan(θ)', name: 'Tangent', description: 'Ratio of opposite side to adjacent side (sin/cos).' }
    ],
    methodology: [
      'Select angle mode: degrees or radians.',
      'Convert degrees to radians where required: rad = deg × (π / 180).',
      'Compute primary ratios (sine, cosine, tangent).',
      'Derive reciprocal functions: cosecant (1/sin), secant (1/cos), and cotangent (1/tan).'
    ],
    workedExample: {
      title: 'Evaluating Trigonometric Ratios for 30° (π/6 rad)',
      scenario: 'Compute standard trigonometric values for a 30 degree angle.',
      inputs: { 'Angle (θ)': '30°' },
      steps: [
        'sin(30°) = 0.5000',
        'cos(30°) = √3 / 2 ≈ 0.8660',
        'tan(30°) = sin(30°) / cos(30°) = 0.5 / 0.8660 ≈ 0.5774',
        'sec(30°) = 1 / 0.8660 ≈ 1.1547, csc(30°) = 1 / 0.5 = 2.0000'
      ],
      result: 'sin=0.5000, cos=0.8660, tan=0.5774'
    },
    assumptions: ['Standard unit circle geometry.', 'Angle domain excludes singularities (e.g. tan 90°).'],
    limitations: ['Undefined at asymptotes (e.g., tan at odd multiples of 90°).'],
    disclaimerType: 'standard',
    disclaimerText: 'High precision IEEE 754 transcendental function evaluation.',
    faqs: [
      { question: 'Why does tangent approach infinity at 90 degrees?', answer: 'Because cosine equals zero at 90°, and tangent is defined as sine divided by cosine (1 / 0), causing an asymptotic division by zero.' }
    ]
  },

  // 8. Statistics - Summary Stats
  'stats-summary': {
    id: 'stats-summary',
    formulaName: 'Descriptive Central Tendency and Sample/Population Variance',
    formulaLatex: '\\mu = \\frac{\\sum x_i}{N}, \\quad \\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}, \\quad s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n - 1}}',
    variables: [
      { symbol: 'N / n', name: 'Sample / Population Size', description: 'Total count of data observations.' },
      { symbol: 'μ / x̄', name: 'Mean (Average)', description: 'Sum of values divided by count.' },
      { symbol: 'Median', name: 'Median', description: 'Middle observation when sorted in ascending order.' },
      { symbol: 's / σ', name: 'Standard Deviation', description: 'Measure of dispersion around the mean.' }
    ],
    methodology: [
      'Parse raw dataset, validate numbers, and compute sample size N.',
      'Sum all observations and divide by N to evaluate arithmetic mean.',
      'Sort dataset to identify median (middle index or average of middle two) and modal frequency.',
      'Compute squared deviations from mean.',
      'Divide by N for population variance or (N - 1) for unbiased sample variance (Bessel correction).'
    ],
    workedExample: {
      title: 'Analysis of Test Scores: [70, 80, 85, 90, 100]',
      scenario: 'Find mean, median, range, and sample standard deviation for 5 exam grades.',
      inputs: { 'Data': '70, 80, 85, 90, 100' },
      steps: [
        'Count n = 5',
        'Sum = 70 + 80 + 85 + 90 + 100 = 425',
        'Mean = 425 / 5 = 85.00',
        'Sorted array middle element: Median = 85.00',
        'Deviations: (70-85)²=225, (80-85)²=25, (85-85)²=0, (90-85)²=25, (100-85)²=225',
        'Sum of squared deviations = 500',
        'Sample variance s² = 500 / (5 - 1) = 500 / 4 = 125.00',
        'Sample std dev s = √125 ≈ 11.18'
      ],
      result: 'Mean: 85.00, Median: 85.00, Sample StDev: 11.18, Range: 30.00'
    },
    assumptions: ['Numerical continuous or discrete real dataset.', 'Sample size n ≥ 2 for sample variance.'],
    limitations: ['Extreme outliers skew mean; median should be examined concurrently.'],
    disclaimerType: 'standard',
    disclaimerText: 'Unbiased statistical estimation using standard Bessel correction for sample statistics.',
    faqs: [
      { question: 'When should I use sample vs population standard deviation?', answer: 'Use population (N) when you have every member of a group; use sample (n - 1) when drawing inferences about a larger population from a subset.' }
    ]
  },

  // 9. Scientific - Scientific Calculator
  'scientific-calc': {
    id: 'scientific-calc',
    formulaName: 'Transcendental, Exponential, and Logarithmic Evaluation',
    formulaLatex: 'y = \\log_b(x) = \\frac{\\ln(x)}{\\ln(b)}, \\quad x^y = e^{y \\ln(x)}, \\quad \\sqrt[n]{x} = x^{1/n}',
    variables: [
      { symbol: 'x, y', name: 'Operands', description: 'Base and power operands.' },
      { symbol: 'ln(x)', name: 'Natural Logarithm', description: 'Logarithm to base e (Euler number ≈ 2.71828).' },
      { symbol: 'log(x)', name: 'Common Logarithm', description: 'Logarithm to base 10.' },
      { symbol: 'n!', name: 'Factorial', description: 'Product of all positive integers ≤ n.' }
    ],
    methodology: [
      'Parse operator precedence using standard algebraic notation (PEMDAS).',
      'Compute mathematical functions using high-precision native floating point engines.',
      'Check domain bounds (e.g., logarithms strictly require positive arguments x > 0).'
    ],
    workedExample: {
      title: 'Evaluating 2⁸, √144, and log₁₀(1000)',
      scenario: 'Compute standard power, root, and logarithm functions.',
      inputs: { 'Operations': '2^8, √144, log10(1000)' },
      steps: [
        '2^8 = 256.00',
        '√144 = 12.00',
        'log10(1000) = 3.00 (since 10³ = 1000)'
      ],
      result: '256, 12, and 3'
    },
    assumptions: ['Standard IEEE 754 double-precision floating point standard.'],
    limitations: ['Logarithms of negative numbers and zero are undefined in real numbers.'],
    disclaimerType: 'standard',
    disclaimerText: 'Verified mathematical algorithms executed strictly client-side on your device.',
    faqs: [
      { question: 'What is Euler constant e?', answer: 'e is an irrational constant approximately equal to 2.71828, representing the natural growth rate of continuously compounding systems.' }
    ]
  },

  // 10. Financial - Loan & Mortgage
  'loan-mortgage': {
    id: 'loan-mortgage',
    formulaName: 'Fixed-Rate Loan Amortization Formula',
    formulaLatex: 'M = P \\frac{r(1+r)^n}{(1+r)^n - 1}',
    variables: [
      { symbol: 'P', name: 'Principal Amount', unit: '$', description: 'Total loan balance borrowed.' },
      { symbol: 'r', name: 'Periodic Interest Rate', description: 'Annual interest rate divided by 12 months.' },
      { symbol: 'n', name: 'Total Number of Payments', unit: 'months', description: 'Loan term in years multiplied by 12.' },
      { symbol: 'M', name: 'Monthly Payment', unit: '$', description: 'Fixed monthly installment covering principal & interest.' }
    ],
    methodology: [
      'Convert annual percentage rate (APR) to monthly periodic decimal rate: r = APR / 12 / 100.',
      'Calculate total payment periods: n = years × 12.',
      'Evaluate annuity formula compound factor: (1 + r)ⁿ.',
      'Solve monthly payment: M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1].',
      'Compute total lifetime interest: Total Interest = (M × n) - P.'
    ],
    workedExample: {
      title: '$300,000 30-Year Mortgage at 6.0% APR',
      scenario: 'Calculate monthly principal and interest payment on a $300,000 fixed-rate home mortgage.',
      inputs: { 'Principal (P)': '$300,000', 'APR': '6.0%', 'Term': '30 years (360 months)' },
      steps: [
        'Monthly rate r = 0.06 / 12 = 0.005',
        'Number of payments n = 30 × 12 = 360',
        'Factor (1 + 0.005)³⁶⁰ ≈ 6.022575',
        'Numerator = 300,000 × 0.005 × 6.022575 = 9,033.86',
        'Denominator = 6.022575 - 1 = 5.022575',
        'Monthly Payment M = 9,033.86 / 5.022575 ≈ $1,798.65',
        'Total Repayment: $1,798.65 × 360 = $647,514.57',
        'Total Interest Paid: $647,514.57 - $300,000 = $347,514.57'
      ],
      result: 'Monthly Payment: $1,798.65 | Total Interest: $347,514.57'
    },
    assumptions: [
      'Fixed interest rate remains unchanged for the entire duration of the loan.',
      'Payments occur monthly on a regular 30/360 or actual/365 banking calendar.',
      'Does not include escrow for property taxes, private mortgage insurance (PMI), or homeowner insurance.'
    ],
    limitations: [
      'Estimates are informational; actual lender quotes vary based on points, credit score, and origination fees.'
    ],
    disclaimerType: 'financial',
    disclaimerText: 'This calculation is an estimate for educational planning purposes. It does not constitute a formal loan offer or lender commitment. Actual interest rates, closing costs, and terms will depend on your lender.',
    faqs: [
      { question: 'Why does early mortgage amortization pay mostly interest?', answer: 'Because interest is assessed on the outstanding loan balance. In early years, the principal balance is at its highest, so interest consumes the bulk of each payment.' },
      { question: 'How much do extra principal payments save?', answer: 'Extra payments directly reduce the principal balance, eliminating the future compound interest that would have accrued on that amount over the remaining term.' }
    ]
  },

  // 11. Financial - Compound Interest
  'compound-interest': {
    id: 'compound-interest',
    formulaName: 'Compound Interest with Regular Monthly Contributions',
    formulaLatex: 'A = P\\left(1 + \\frac{r}{n}\\right)^{nt} + PMT \\times \\left[\\frac{\\left(1 + \\frac{r}{n}\\right)^{nt} - 1}{\\frac{r}{n}}\\right]',
    variables: [
      { symbol: 'P', name: 'Initial Principal', unit: '$', description: 'Initial deposit or investment balance.' },
      { symbol: 'PMT', name: 'Monthly Addition', unit: '$', description: 'Recurring contribution deposited each month.' },
      { symbol: 'r', name: 'Annual Interest Rate', description: 'Nominal annual return rate as a decimal.' },
      { symbol: 'n', name: 'Compounding Frequency', description: 'Times compounded per year (e.g. 12 = monthly).' },
      { symbol: 't', name: 'Time Horizon', unit: 'years', description: 'Number of years the investment grows.' },
      { symbol: 'A', name: 'Future Value', unit: '$', description: 'Total accumulated balance at the end of the period.' }
    ],
    methodology: [
      'Calculate the compound growth of the initial lump sum deposit: P × (1 + r/n)^(nt).',
      'Calculate the future value of the series of recurring monthly deposits using the annuity factor.',
      'Sum the two portions to obtain final future value.',
      'Subtract total contributions to isolate total interest earned.'
    ],
    workedExample: {
      title: '$10,000 Invested for 10 Years at 7.0% with $200/mo Contribution',
      scenario: 'Project the future wealth accumulated in an index fund averaging 7% annual returns.',
      inputs: { 'Principal': '$10,000', 'Monthly Contribution': '$200', 'Annual Return': '7.0%', 'Time': '10 years' },
      steps: [
        'Initial deposit growth: $10,000 × (1 + 0.07/12)¹²⁰ ≈ $20,096.61',
        'Future value of contributions: $200 × [((1 + 0.07/12)¹²⁰ - 1) / (0.07/12)] ≈ $34,616.96',
        'Total Future Value: $20,096.61 + $34,616.96 = $54,713.57',
        'Total Out-of-Pocket Invested: $10,000 + ($200 × 120) = $34,000.00',
        'Compound Growth Earned: $54,713.57 - $34,000.00 = $20,713.57'
      ],
      result: 'Future Value: $54,713.57 | Interest Earned: $20,713.57'
    },
    assumptions: ['Constant annual rate of return with regular scheduled compounding.', 'Contributions made at the end of each period.'],
    limitations: ['Market investments fluctuate in value; calculations do not model market volatility or inflation.'],
    disclaimerType: 'financial',
    disclaimerText: 'Hypothetical projections for planning. Past market performance does not guarantee future investment returns. Tax liabilities and inflation are not deducted.',
    faqs: [
      { question: 'What is the Rule of 72?', answer: 'The Rule of 72 estimates how many years it takes to double your money: divide 72 by the annual interest rate (e.g. 72 / 7% ≈ 10.3 years).' }
    ]
  },

  // 12. Business - Break-Even
  'break-even': {
    id: 'break-even',
    formulaName: 'Break-Even Sales Volume and Revenue Equation',
    formulaLatex: 'Q_{BE} = \\frac{\\text{Fixed Costs}}{\\text{Price per Unit} - \\text{Variable Cost per Unit}}, \\quad R_{BE} = Q_{BE} \\times \\text{Price}',
    variables: [
      { symbol: 'FC', name: 'Fixed Costs', unit: '$', description: 'Overhead expenses (rent, salaries, software) independent of sales.' },
      { symbol: 'P', name: 'Unit Price', unit: '$', description: 'Selling price per individual unit.' },
      { symbol: 'VC', name: 'Variable Cost', unit: '$', description: 'Direct cost to produce or deliver one unit.' },
      { symbol: 'CM', name: 'Contribution Margin', unit: '$', description: 'Price minus variable cost (P - VC).' },
      { symbol: 'Q_BE', name: 'Break-Even Units', unit: 'units', description: 'Minimum unit volume required to reach zero profit.' }
    ],
    methodology: [
      'Compute unit contribution margin: CM = Unit Price - Variable Cost per Unit.',
      'Divide total fixed overhead costs by unit contribution margin.',
      'Multiply break-even units by unit selling price to obtain break-even revenue.'
    ],
    workedExample: {
      title: 'Coffee Roastery with $5,000/mo Rent and $15 Bags',
      scenario: 'Find break-even volume for coffee sold at $15/bag with $5/bag variable bean and packaging cost.',
      inputs: { 'Fixed Costs': '$5,000', 'Selling Price': '$15.00', 'Variable Cost': '$5.00' },
      steps: [
        'Contribution Margin = $15.00 - $5.00 = $10.00/bag',
        'Break-Even Units = $5,000 / $10.00 = 500 bags',
        'Break-Even Revenue = 500 × $15.00 = $7,500.00'
      ],
      result: 'Break-Even: 500 units ($7,500.00 monthly revenue)'
    },
    assumptions: ['Linear cost behavior where unit variable costs remain constant across volume tiers.'],
    limitations: ['Does not account for bulk volume discounts or tiered production capacity increases.'],
    disclaimerType: 'financial',
    disclaimerText: 'Standard managerial accounting equation for operational break-even analysis.',
    faqs: [
      { question: 'What is a contribution margin ratio?', answer: 'The contribution margin ratio is contribution margin divided by price (e.g. $10 / $15 = 66.7%), representing the percentage of each revenue dollar available to cover fixed costs.' }
    ]
  },

  // 13. Business - Profit Margin & Markup
  'profit-margin': {
    id: 'profit-margin',
    formulaName: 'Gross Profit Margin and Cost Markup Percentage',
    formulaLatex: '\\text{Margin}\\% = \\frac{\\text{Revenue} - \\text{COGS}}{\\text{Revenue}} \\times 100, \\quad \\text{Markup}\\% = \\frac{\\text{Revenue} - \\text{COGS}}{\\text{COGS}} \\times 100',
    variables: [
      { symbol: 'Revenue', name: 'Gross Revenue', unit: '$', description: 'Total sales proceeds received from customers.' },
      { symbol: 'COGS', name: 'Cost of Goods Sold', unit: '$', description: 'Direct material and labor costs to create the product.' },
      { symbol: 'Gross Profit', name: 'Gross Profit', unit: '$', description: 'Revenue minus COGS.' },
      { symbol: 'Margin %', name: 'Gross Margin %', unit: '%', description: 'Profit expressed as percentage of total revenue.' },
      { symbol: 'Markup %', name: 'Markup %', unit: '%', description: 'Profit expressed as percentage of wholesale cost.' }
    ],
    methodology: [
      'Calculate raw gross profit: Profit = Revenue - COGS.',
      'Divide gross profit by Revenue and multiply by 100 for Margin %.',
      'Divide gross profit by COGS and multiply by 100 for Markup %.'
    ],
    workedExample: {
      title: 'Item Bought for $40.00 and Sold for $100.00',
      scenario: 'Determine profit margin and markup on a retail product.',
      inputs: { 'Cost (COGS)': '$40.00', 'Selling Price (Revenue)': '$100.00' },
      steps: [
        'Gross Profit = $100.00 - $40.00 = $60.00',
        'Margin % = ($60.00 / $100.00) × 100 = 60.0%',
        'Markup % = ($60.00 / $40.00) × 100 = 150.0%'
      ],
      result: 'Gross Profit: $60.00 | Margin: 60.0% | Markup: 150.0%'
    },
    assumptions: ['Direct accounting relationship between wholesale cost and final sale price.'],
    limitations: ['Does not include operating overhead (SGA, marketing, taxes) unless substituted into cost.'],
    disclaimerType: 'standard',
    disclaimerText: 'Standard corporate financial ratios for pricing strategy and inventory valuation.',
    faqs: [
      { question: 'Why is markup always higher than margin?', answer: 'Because markup divides profit by cost (the smaller denominator), while margin divides profit by revenue (the larger denominator).' }
    ]
  },

  // 14. Construction - Material & Concrete
  'construction-calc': {
    id: 'construction-calc',
    formulaName: 'Concrete Slab Yardage and Tile/Flooring Area with Waste',
    formulaLatex: 'V_{yd^3} = \\frac{L_{ft} \\times W_{ft} \\times D_{in} / 12}{27}, \\quad A_{total} = A_{net} \\times (1 + \\text{waste}\\%)',
    variables: [
      { symbol: 'L, W', name: 'Length & Width', unit: 'feet', description: 'Dimensions of the room or slab.' },
      { symbol: 'D', name: 'Depth / Thickness', unit: 'inches', description: 'Depth of concrete slab (typically 4 or 6 inches).' },
      { symbol: 'V', name: 'Concrete Volume', unit: 'cubic yards', description: 'Standard ordering unit for ready-mix concrete.' },
      { symbol: 'Waste', name: 'Waste Allowance', unit: '%', description: 'Standard 10% to 15% allowance for offcuts and spillage.' }
    ],
    methodology: [
      'Multiply length (ft) by width (ft) to get square footage.',
      'Convert thickness inches to feet (divide by 12) and multiply to obtain cubic feet.',
      'Divide cubic feet by 27 to convert into cubic yards.',
      'Add 10% safety and spillage margin for concrete pouring.'
    ],
    workedExample: {
      title: 'Poured Concrete Patio 20ft × 15ft × 4in Thick',
      scenario: 'Calculate ready-mix concrete yardage and 80lb bags for a patio slab.',
      inputs: { 'Length': '20 ft', 'Width': '15 ft', 'Depth': '4 in' },
      steps: [
        'Area = 20 × 15 = 300 sq ft',
        'Depth in feet = 4 / 12 = 0.333 ft',
        'Cubic feet = 300 × 0.333 = 100 cu ft',
        'Cubic yards = 100 / 27 ≈ 3.70 cubic yards',
        'With 10% waste: 3.70 × 1.10 ≈ 4.07 cubic yards',
        'Number of 80lb premix bags (0.6 cu ft/bag): 110 cu ft / 0.6 ≈ 184 bags'
      ],
      result: 'Volume: 4.1 cubic yards (or ~184 80lb premix bags)'
    },
    assumptions: ['Subgrade soil is properly compacted and leveled.', 'Standard 10% allowance for excavation irregularities.'],
    limitations: ['Does not include rebar displacement or structural engineering load calculations.'],
    disclaimerType: 'construction',
    disclaimerText: 'Material estimates are guidelines. Concrete delivery trucks, uneven ground depths, and tile cutting patterns (diagonal or herringbone) frequently require a 10% to 15% contingency reserve.',
    faqs: [
      { question: 'Why is 4 inches standard for residential concrete?', answer: 'Four inches (4") provides sufficient compressive strength for standard walkways, patios, and light passenger vehicle driveways.' }
    ]
  },

  // 15. Health - BMI Calculator
  bmi: {
    id: 'bmi',
    formulaName: 'World Health Organization Quetelet Index Formula',
    formulaLatex: '\\text{BMI} = \\frac{\\text{weight (kg)}}{[\\text{height (m)}]^2} = 703 \\times \\frac{\\text{weight (lbs)}}{[\\text{height (in)}]^2}',
    variables: [
      { symbol: 'weight', name: 'Body Weight', unit: 'kg or lbs', description: 'Total gravitational body weight.' },
      { symbol: 'height', name: 'Stature Height', unit: 'm or inches', description: 'Standing vertical height.' },
      { symbol: 'BMI', name: 'Body Mass Index', unit: 'kg/m²', description: 'Anthropometric screening metric.' }
    ],
    methodology: [
      'Record body weight and standing height in either metric (kg, cm) or imperial (lbs, inches).',
      'For metric: convert height to meters (cm / 100) and square it. Divide weight by height squared.',
      'For imperial: multiply weight by 703 and divide by height in inches squared.',
      'Compare resulting index against standard clinical classification tiers.'
    ],
    workedExample: {
      title: 'Individual Weighing 72 kg and 175 cm Tall',
      scenario: 'Determine BMI index and classification tier.',
      inputs: { 'Weight': '72 kg', 'Height': '175 cm (1.75 m)' },
      steps: [
        'Height in meters = 1.75 m',
        'Height squared = 1.75 × 1.75 = 3.0625 m²',
        'BMI = 72 / 3.0625 ≈ 23.51 kg/m²',
        'Category: 18.5 – 24.9 is classified as Normal / Healthy weight.'
      ],
      result: 'BMI: 23.5 kg/m² (Normal weight range)'
    },
    assumptions: ['Standard population-level adult anthropometric screening formula.'],
    limitations: ['Does not differentiate between muscle mass, bone density, and adipose fat tissue.'],
    disclaimerType: 'health',
    disclaimerText: 'This calculator provides informational estimates only. BMI is a screening metric, not a medical diagnosis of health, cardiovascular fitness, or body composition. Consult a qualified healthcare professional for clinical advice.',
    faqs: [
      { question: 'Why does BMI overestimate risk for muscular athletes?', answer: 'Muscle tissue is denser than fat. Athletic individuals with high lean muscle mass may have a BMI in the "overweight" range despite very low body fat.' }
    ]
  },

  // 16. Health - BMR & TDEE
  'bmr-tdee': {
    id: 'bmr-tdee',
    formulaName: 'Mifflin-St Jeor Equation for Basal Metabolic Rate and TDEE',
    formulaLatex: '\\text{BMR}_{men} = 10w + 6.25h - 5a + 5, \\quad \\text{BMR}_{women} = 10w + 6.25h - 5a - 161',
    variables: [
      { symbol: 'w', name: 'Weight', unit: 'kg', description: 'Body weight.' },
      { symbol: 'h', name: 'Height', unit: 'cm', description: 'Standing height in centimeters.' },
      { symbol: 'a', name: 'Age', unit: 'years', description: 'Chronological age in years.' },
      { symbol: 'PAL', name: 'Physical Activity Level', description: 'Multiplier ranging from 1.2 (sedentary) to 1.9 (athlete).' }
    ],
    methodology: [
      'Compute resting Basal Metabolic Rate (BMR) using validated Mifflin-St Jeor equation coefficients.',
      'Multiply resting BMR by user Physical Activity Level (PAL) to compute Total Daily Energy Expenditure (TDEE).',
      'For weight loss: subtract 500 kcal/day for ~1 lb/week fat loss.',
      'For muscle gain: add 250-500 kcal/day for a caloric surplus.'
    ],
    workedExample: {
      title: '30-Year-Old Male, 80 kg, 180 cm, Moderately Active',
      scenario: 'Calculate baseline BMR and maintenance TDEE.',
      inputs: { 'Weight': '80 kg', 'Height': '180 cm', 'Age': '30', 'Activity': 'Moderate (1.55x)' },
      steps: [
        'BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5',
        'BMR = 800 + 1,125 - 150 + 5 = 1,780 kcal/day',
        'TDEE = 1,780 × 1.55 ≈ 2,759 kcal/day'
      ],
      result: 'BMR: 1,780 kcal/day | Maintenance TDEE: 2,759 kcal/day'
    },
    assumptions: ['Standard clinical metabolic estimation for healthy adults.'],
    limitations: ['Individual metabolic rates vary due to genetics, thyroid function, and lean body mass.'],
    disclaimerType: 'health',
    disclaimerText: 'Energy expenditure estimations are informational guidelines. Caloric requirements differ across individuals. Consult a registered dietitian or physician before undertaking significant dietary changes.',
    faqs: [
      { question: 'What is the difference between BMR and TDEE?', answer: 'BMR is the energy your body burns at complete rest just to keep organs functioning. TDEE includes all daily movement, exercise, and the thermic effect of food.' }
    ]
  },

  // 17. Date & Time - Exact Age
  'exact-age': {
    id: 'exact-age',
    formulaName: 'Gregorian Chronological Age Delta Calculation',
    formulaLatex: '\\Delta t = \\text{Target Date} - \\text{Date of Birth}',
    variables: [
      { symbol: 'DOB', name: 'Birth Date', description: 'Calendar date of birth.' },
      { symbol: 'Today', name: 'Current Date', description: 'Reference calendar comparison date.' },
      { symbol: 'Y, M, D', name: 'Years, Months, Days', description: 'Calendar age broken down by calendar month lengths.' }
    ],
    methodology: [
      'Determine leap year adjustments for February (29 days in leap years).',
      'Subtract birth day from current day, borrowing days from preceding calendar month if needed.',
      'Subtract birth month from current month, borrowing 12 months from year if needed.',
      'Calculate total days elapsed and countdown to next birthday.'
    ],
    workedExample: {
      title: 'Age for Person Born June 15, 1995 on March 15, 2026',
      scenario: 'Calculate exact years, months, and days.',
      inputs: { 'DOB': '1995-06-15', 'Current Date': '2026-03-15' },
      steps: [
        'Years difference: 2026 - 1995 = 31 years (unadjusted)',
        'Since March is before June, subtract 1 year: 30 years',
        'Months remaining from June to March: 9 months',
        'Days difference: 15 - 15 = 0 days'
      ],
      result: '30 years, 9 months, 0 days (11,231 days lived)'
    },
    assumptions: ['Standard Gregorian calendar rules including 4-year leap years.'],
    limitations: ['Does not adjust for historical timezone shifts before 1970 UTC standardization.'],
    disclaimerType: 'standard',
    disclaimerText: 'Calendar mathematics accounting for variable month lengths and leap years.',
    faqs: [
      { question: 'How are leap year birthdays counted?', answer: 'People born on February 29 legally age on March 1 in non-leap years under most standard jurisdictions.' }
    ]
  },

  // 18. Date & Time - Date Difference
  'date-difference': {
    id: 'date-difference',
    formulaName: 'Calendar Span and Business Working Days Algorithm',
    formulaLatex: '\\text{Elapsed Days} = \\text{Date}_2 - \\text{Date}_1, \\quad \\text{Business Days} = \\text{Days} - \\text{Weekends}',
    variables: [
      { symbol: 'D1, D2', name: 'Anchor Dates', description: 'Start and end calendar dates.' },
      { symbol: 'Calendar Days', name: 'Total Days', unit: 'days', description: 'Every consecutive calendar day elapsed.' },
      { symbol: 'Business Days', name: 'Working Days', unit: 'days', description: 'Days excluding Saturdays and Sundays.' }
    ],
    methodology: [
      'Convert both dates to UTC timestamps in milliseconds and divide by 86,400,000.',
      'Iterate through the calendar span or apply modulo 7 integer division to subtract weekends.',
      'Compute weekly and monthly equivalents.'
    ],
    workedExample: {
      title: 'Working Days Between Monday Oct 5 and Friday Oct 16',
      scenario: 'Count total calendar days and business days in a two-week sprint.',
      inputs: { 'Start': 'Oct 5', 'End': 'Oct 16' },
      steps: [
        'Total calendar days: 11 days (inclusive of end date)',
        'Saturdays and Sundays in span: 2 weekends (4 days)',
        'Business working days: 11 - 4 = 7 business days'
      ],
      result: '11 Calendar Days | 7 Business Working Days'
    },
    assumptions: ['Standard 5-day Monday through Friday workweek.'],
    limitations: ['Does not automatically deduct regional public bank holidays unless specified.'],
    disclaimerType: 'standard',
    disclaimerText: 'Astronomical calendar day calculations independent of server clock timezone drifts.',
    faqs: [
      { question: 'Is the end date inclusive or exclusive?', answer: 'In our calculation engine, both start and end dates are counted inclusively for clear planning transparency.' }
    ]
  },

  // 19. Electrical - Ohm's Law & Power
  'ohms-law': {
    id: 'ohms-law',
    formulaName: "Ohm's Law and Joule-Watt Electrical Power Relationships",
    formulaLatex: 'V = I \\times R, \\quad P = V \\times I = I^2 R = \\frac{V^2}{R}',
    variables: [
      { symbol: 'V', name: 'Voltage', unit: 'Volts (V)', description: 'Electrical potential difference.' },
      { symbol: 'I', name: 'Current', unit: 'Amperes (A)', description: 'Flow of electrical charge.' },
      { symbol: 'R', name: 'Resistance', unit: 'Ohms (Ω)', description: 'Opposition to electrical current flow.' },
      { symbol: 'P', name: 'Power', unit: 'Watts (W)', description: 'Rate of electrical energy dissipation.' }
    ],
    methodology: [
      'Provide any two of the four variables (V, I, R, P).',
      'Use algebraic substitution to solve for the remaining two values.',
      'For power: P = V × I, P = I²R, or P = V² / R.',
      'For resistance: R = V / I or R = V² / P.'
    ],
    workedExample: {
      title: '120V Electric Heater Drawing 12.5 Amps',
      scenario: 'Calculate heating element resistance and power rating.',
      inputs: { 'Voltage (V)': '120 V', 'Current (I)': '12.5 A' },
      steps: [
        'Resistance R = V / I = 120 / 12.5 = 9.60 Ω',
        'Power P = V × I = 120 × 12.5 = 1,500 Watts (1.5 kW)'
      ],
      result: 'Resistance: 9.60 Ω | Power: 1,500 Watts (1.5 kW)'
    },
    assumptions: ['Direct current (DC) or purely resistive AC circuits with unity power factor (PF = 1.0).'],
    limitations: ['Does not include complex AC impedance, inductive reactance, or phase angle shifts.'],
    disclaimerType: 'engineering',
    disclaimerText: 'Engineering calculations for purely resistive electrical circuits. Real-world electrical wiring must comply with the National Electrical Code (NEC) and certified safety standards.',
    faqs: [
      { question: 'What is a Watt?', answer: 'One Watt is one Joule of energy consumed per second, equivalent to one Volt pushing one Ampere of current.' }
    ]
  },

  // 20. Electrical - Appliance Electricity Cost
  'electricity-cost': {
    id: 'electricity-cost',
    formulaName: 'Kilowatt-Hour Energy Consumption and Utility Cost Equation',
    formulaLatex: '\\text{kWh} = \\frac{\\text{Watts} \\times \\text{Hours}}{1000}, \\quad \\text{Cost} = \\text{kWh} \\times \\text{Utility Rate (\\$/kWh)}',
    variables: [
      { symbol: 'W', name: 'Appliance Wattage', unit: 'Watts', description: 'Nameplate electrical power draw.' },
      { symbol: 'h', name: 'Usage Hours', unit: 'hours/day', description: 'Active running hours per 24-hour cycle.' },
      { symbol: 'kWh', name: 'Energy Consumed', unit: 'kWh', description: 'Kilowatt-hours of electricity used.' },
      { symbol: 'Rate', name: 'Electricity Rate', unit: '$/kWh', description: 'Local utility provider cost per kilowatt-hour.' }
    ],
    methodology: [
      'Multiply appliance rated wattage by daily operational hours to get Watt-hours.',
      'Divide by 1,000 to convert into billing kilowatt-hours (kWh).',
      'Multiply kWh by local utility electric rate to obtain daily cost.',
      'Multiply daily cost by 30 for monthly cost, or by 365 for annual cost.'
    ],
    workedExample: {
      title: '1,200W Space Heater Running 8 Hours/Day at $0.15/kWh',
      scenario: 'Estimate monthly winter electricity bill impact.',
      inputs: { 'Wattage': '1,200 W', 'Hours/Day': '8 hrs', 'Rate': '$0.15/kWh' },
      steps: [
        'Daily energy = (1,200 × 8) / 1,000 = 9.60 kWh/day',
        'Daily cost = 9.60 × $0.15 = $1.44/day',
        'Monthly cost (30 days) = $1.44 × 30 = $43.20/month',
        'Annual cost = $1.44 × 365 = $525.60/year'
      ],
      result: '$1.44/day | $43.20/month | $525.60/year'
    },
    assumptions: ['Constant flat electricity utility rate per kWh without tiered peak-demand penalties.'],
    limitations: ['Appliances with cycling thermostats (refrigerators, AC units) do not draw maximum wattage continuously.'],
    disclaimerType: 'engineering',
    disclaimerText: 'Utility cost estimations. Actual electric bills vary based on seasonal tiered rates, grid connection delivery charges, and local sales taxes.',
    faqs: [
      { question: 'How can I find my appliance wattage?', answer: 'Check the manufacturer label on the back or bottom of the device, or use a plug-in kilowatt power meter.' }
    ]
  },

  // 21. Engineering - Hydraulic Cylinder Force
  'hydraulic-force': {
    id: 'hydraulic-force',
    formulaName: "Pascal's Law and Hydraulic Piston Output Force",
    formulaLatex: 'F = P \\times A = P \\times \\pi \\left(\\frac{d}{2}\\right)^2',
    variables: [
      { symbol: 'P', name: 'System Pressure', unit: 'PSI or Bar', description: 'Hydraulic fluid operating pressure.' },
      { symbol: 'd', name: 'Piston Bore Diameter', unit: 'inches or mm', description: 'Internal bore diameter of cylinder barrel.' },
      { symbol: 'A', name: 'Piston Area', unit: 'sq inches or mm²', description: 'Effective cross-sectional fluid face.' },
      { symbol: 'F', name: 'Force Generated', unit: 'lbs or kN', description: 'Linear push force exerted by the piston rod.' }
    ],
    methodology: [
      'Compute piston face area: A = π × (d / 2)².',
      'Multiply fluid pressure by effective piston surface area.',
      'For pull stroke: subtract rod cross-sectional area to compute net annular retract force.'
    ],
    workedExample: {
      title: '3-Inch Bore Hydraulic Cylinder at 2,500 PSI',
      scenario: 'Calculate thrust force produced by a log splitter or industrial press cylinder.',
      inputs: { 'Bore Diameter': '3.0 in', 'Pressure': '2,500 PSI' },
      steps: [
        'Radius r = 3.0 / 2 = 1.5 in',
        'Piston area A = π × (1.5)² = 2.25π ≈ 7.0686 sq in',
        'Thrust force F = 2,500 PSI × 7.0686 sq in ≈ 17,671.5 lbs',
        'Convert to tons: 17,671.5 / 2,000 ≈ 8.84 tons of force'
      ],
      result: 'Force: 17,671 lbs (8.84 Tons)'
    },
    assumptions: ['Incompressible fluid with uniform hydrostatic pressure across piston surface.'],
    limitations: ['Friction losses across seals and mechanical cylinder linkages are not deducted (~3-5% in real hardware).'],
    disclaimerType: 'engineering',
    disclaimerText: 'Theoretical mechanical force calculations. Engineering design must incorporate safety margins, seal friction, and manufacturer pressure tolerances.',
    faqs: [
      { question: 'Why is pull force less than push force?', answer: 'Because on the retraction stroke, the steel rod occupies space inside the cylinder, reducing the effective hydraulic surface area pushing back.' }
    ]
  },

  // 22. Engineering - Kinetic & Potential Energy
  'kinetic-energy': {
    id: 'kinetic-energy',
    formulaName: 'Classical Newtonian Kinetic and Gravitational Potential Energy',
    formulaLatex: 'KE = \\frac{1}{2} m v^2, \\quad PE = m \\cdot g \\cdot h',
    variables: [
      { symbol: 'm', name: 'Mass', unit: 'kg or lbs', description: 'Mass of the moving or elevated body.' },
      { symbol: 'v', name: 'Velocity', unit: 'm/s or mph', description: 'Linear speed of the body.' },
      { symbol: 'g', name: 'Gravitational Acceleration', unit: '9.80665 m/s²', description: 'Standard Earth gravity constant.' },
      { symbol: 'h', name: 'Elevation Height', unit: 'meters or ft', description: 'Height relative to datum reference.' },
      { symbol: 'E', name: 'Energy', unit: 'Joules (J)', description: 'Work capacity expressed in Joules.' }
    ],
    methodology: [
      'Ensure mass is expressed in kilograms and velocity in meters per second (1 m/s ≈ 2.237 mph).',
      'Square the velocity and multiply by mass, then divide by 2 for Kinetic Energy (KE).',
      'Multiply mass by gravity acceleration (9.81 m/s²) and height for Potential Energy (PE).'
    ],
    workedExample: {
      title: '1,500 kg Car Traveling at 20 m/s (~45 mph)',
      scenario: 'Calculate vehicle kinetic energy.',
      inputs: { 'Mass (m)': '1,500 kg', 'Velocity (v)': '20 m/s' },
      steps: [
        'v² = 20 × 20 = 400 m²/s²',
        'KE = 0.5 × 1,500 kg × 400 = 300,000 Joules (300 kJ)'
      ],
      result: 'Kinetic Energy: 300,000 Joules (300 kJ)'
    },
    assumptions: ['Non-relativistic velocities (v << speed of light c).', 'Uniform standard Earth gravity.'],
    limitations: ['Does not include aerodynamic drag friction or rotational rotational inertia.'],
    disclaimerType: 'engineering',
    disclaimerText: 'Classical Newtonian mechanics equations computed to verified mathematical precision.',
    faqs: [
      { question: 'Why does doubling speed quadruple kinetic energy?', answer: 'Because velocity is squared in the formula KE = ½mv². When velocity doubles (2x), kinetic energy increases by 2² = 4x, drastically increasing required braking distance.' }
    ]
  },

  // 23. Everyday - Tip & Bill Split
  'tip-split': {
    id: 'tip-split',
    formulaName: 'Restaurant Gratuity and Group Guest Expense Allocation',
    formulaLatex: '\\text{Tip} = \\text{Bill} \\times \\frac{\\text{Tip}\\%}{100}, \\quad \\text{Per Person} = \\frac{\\text{Bill} + \\text{Tip}}{\\text{Guests}}',
    variables: [
      { symbol: 'Bill', name: 'Pre-Tip Subtotal', unit: '$', description: 'Base dining invoice total.' },
      { symbol: 'Tip %', name: 'Gratuity Percentage', unit: '%', description: 'Desired tip rate (e.g. 15%, 18%, 20%).' },
      { symbol: 'Guests', name: 'Number of People', description: 'Headcount splitting the check evenly.' },
      { symbol: 'Share', name: 'Per Person Amount', unit: '$', description: 'Each guest individual payment portion.' }
    ],
    methodology: [
      'Multiply pre-tip check by gratuity percentage to determine total tip.',
      'Add tip to bill subtotal to obtain grand total.',
      'Divide grand total evenly by the number of guests.'
    ],
    workedExample: {
      title: '$84.00 Dinner Split Between 3 Friends with 20% Tip',
      scenario: 'Calculate tip and individual split payment.',
      inputs: { 'Bill': '$84.00', 'Tip': '20%', 'Guests': '3' },
      steps: [
        'Tip amount = $84.00 × 0.20 = $16.80',
        'Total bill = $84.00 + $16.80 = $100.80',
        'Per person share = $100.80 / 3 = $33.60 each'
      ],
      result: 'Tip: $16.80 | Total: $100.80 | Per Person: $33.60'
    },
    assumptions: ['Equal cost distribution among all guests.'],
    limitations: ['Does not itemize individual dishes or separate alcohol checks.'],
    disclaimerType: 'standard',
    disclaimerText: 'Practical hospitality expense allocation with standard currency rounding.',
    faqs: [
      { question: 'Should you tip on tax or subtotal?', answer: 'Etiquette standards recommend tipping on the pre-tax food and beverage subtotal, though tipping on the post-tax amount is also common.' }
    ]
  },

  // 24. Everyday - Discount & Sales Tax
  'discount-tax': {
    id: 'discount-tax',
    formulaName: 'Retail Markdown Discount and Post-Sales Tax Final Price',
    formulaLatex: 'P_{net} = P_0 \\times \\left(1 - \\frac{d}{100}\\right), \\quad P_{final} = P_{net} \\times \\left(1 + \\frac{t}{100}\\right)',
    variables: [
      { symbol: 'P₀', name: 'Original Price', unit: '$', description: 'Sticker retail price before discounts.' },
      { symbol: 'd', name: 'Discount Rate', unit: '%', description: 'Sale markdown percentage.' },
      { symbol: 't', name: 'Sales Tax Rate', unit: '%', description: 'State or local municipality sales tax.' },
      { symbol: 'Savings', name: 'Net Money Saved', unit: '$', description: 'Original price minus discounted price.' },
      { symbol: 'P_final', name: 'Final Out-of-Pocket Price', unit: '$', description: 'Total paid at register.' }
    ],
    methodology: [
      'Apply markdown discount percentage to original price: Discount = Price × (d / 100).',
      'Subtract discount from original price to get net sale price.',
      'Calculate sales tax on the discounted net price: Tax = Net Price × (t / 100).',
      'Add sales tax to net price to determine register checkout price.'
    ],
    workedExample: {
      title: '$80.00 Jacket at 25% Off with 8.25% Sales Tax',
      scenario: 'Determine final out-of-pocket register payment.',
      inputs: { 'Original Price': '$80.00', 'Discount': '25%', 'Sales Tax': '8.25%' },
      steps: [
        'Discount amount = $80.00 × 0.25 = $20.00 savings',
        'Sale price = $80.00 - $20.00 = $60.00',
        'Sales tax = $60.00 × 0.0825 ≈ $4.95',
        'Final price = $60.00 + $4.95 = $64.95'
      ],
      result: 'You Save: $20.00 | Tax: $4.95 | Final Price: $64.95'
    },
    assumptions: ['Discount is applied before sales tax in accordance with standard retail tax regulations.'],
    limitations: ['Does not calculate tiered manufacturer mail-in rebates or multi-buy coupons.'],
    disclaimerType: 'standard',
    disclaimerText: 'Standard commercial retail discount and consumer sales tax calculations.',
    faqs: [
      { question: 'Is sales tax calculated before or after discounts?', answer: 'In most jurisdictions, sales tax is legally assessed only on the actual discounted purchase price paid by the customer.' }
    ]
  }
};

function generateDynamicDetail(meta: CalculatorMeta): CalculatorDetail {
  const name = meta.name;
  const formula = meta.formula;
  const desc = meta.shortDesc;

  return {
    id: meta.id,
    formulaName: `${name} Mathematical Model`,
    formulaLatex: formula,
    variables: [
      { symbol: 'v1', name: 'Primary Input', description: `Primary variable for ${name}.` },
      { symbol: 'v2', name: 'Secondary Input', description: `Secondary factor for ${name}.` }
    ],
    methodology: [
      `Parse validated input fields for ${name}.`,
      `Apply formula expression: ${formula}.`,
      `Compute results with high precision.`,
      `Format output according to ${name} standards.`
    ],
    workedExample: {
      title: `Practical Evaluation of ${name}`,
      scenario: `Evaluating ${name} for typical user inputs.`,
      inputs: { 'Input Field': 'Standard Value' },
      steps: [
        `Load parameters into ${formula}`,
        `Execute computation`
      ],
      result: `Illustrative sample result for ${name}`
    },
    assumptions: [`Assumes standard valid numeric inputs for ${name}.`],
    limitations: [`Applicable within the standard domain of ${name}.`],
    disclaimerType: 'standard',
    disclaimerText: `Informational summary for ${name}. Verify critical financial, health, engineering, or construction outputs independently.`,
    faqs: [
      {
        question: `What is the primary purpose of the ${name} calculator?`,
        answer: `The ${name} calculator is designed to ${desc.toLowerCase()} efficiently using the governing mathematical formula ${formula}.`
      },
      {
        question: `How do I enter parameters into the ${name}?`,
        answer: `Enter your specific numerical values into the designated input fields for ${name}. The system automatically validates numeric types and domain boundaries before computing.`
      },
      {
        question: `What formula is utilized by the ${name}?`,
        answer: `The ${name} tool evaluates the mathematical expression ${formula} to derive precise analytical results.`
      },
      {
        question: `How do I interpret the output produced by the ${name}?`,
        answer: `The computed output represents the exact solution for ${name} based on your provided inputs, formatted for immediate practical or technical use.`
      },
      {
        question: `Are there specific input restrictions for the ${name}?`,
        answer: `Yes, inputs for ${name} must adhere to valid mathematical domains (avoiding division by zero, invalid negative roots, or out-of-bounds parameters) as enforced by the validation engine.`
      }
    ]
  };
}

export function getCalculatorDetail(id: CalculatorId): CalculatorDetail {
  const meta = CALCULATORS.find(c => c.id === id);
  if (CALCULATOR_DETAILS[id]) {
    const detail = CALCULATOR_DETAILS[id];
    if (detail.faqs && detail.faqs.length >= 5) {
      return detail;
    }
    const dynamic = meta ? generateDynamicDetail(meta) : null;
    const existingFaqs = detail.faqs || [];
    const needed = 5 - existingFaqs.length;
    const padding = dynamic ? dynamic.faqs.slice(0, needed) : [];
    return {
      ...detail,
      faqs: [...existingFaqs, ...padding]
    };
  }

  if (!meta) {
    return CALCULATOR_DETAILS.percentage;
  }

  return generateDynamicDetail(meta);
}
