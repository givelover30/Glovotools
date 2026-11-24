# Phase 7A: Audit Inventory Report
## CALCTOOLS Comprehensive Calculator Catalog Audit

- **Total Calculators Discovered:** 300
- **Total Calculation Contracts Registered:** 300
- **Total Categories:** 14
- **Total Subcategories:** 56
- **Duplicate IDs:** 0 (Verified Unique)
- **Placeholder Calculators:** 0 (100% Functional)
- **Converter Categories:** 0 (Strictly Math & Calculators)

## 1. Category Allocation Summary

| Category ID | Display Name | Target Count | Actual Contract Count | Status |
|---|---|---|---|---|
| `basic-math` | BASIC MATH | 25 | 25 | PASS |
| `algebra` | ALGEBRA | 20 | 20 | PASS |
| `geometry` | GEOMETRY | 22 | 22 | PASS |
| `trigonometry` | TRIGONOMETRY | 12 | 12 | PASS |
| `statistics` | STATISTICS | 24 | 24 | PASS |
| `scientific` | SCIENTIFIC | 12 | 12 | PASS |
| `financial` | FINANCIAL | 42 | 42 | PASS |
| `business` | BUSINESS | 20 | 20 | PASS |
| `construction` | CONSTRUCTION | 30 | 30 | PASS |
| `health-fitness` | HEALTH FITNESS | 25 | 25 | PASS |
| `datetime` | DATETIME | 16 | 16 | PASS |
| `electrical` | ELECTRICAL | 18 | 18 | PASS |
| `engineering` | ENGINEERING | 20 | 20 | PASS |
| `everyday` | EVERYDAY | 14 | 14 | PASS |

## 2. Complete Calculator-by-Calculator Inventory (300 Calculators)

| # | ID | Name | Category | Subcategory | Formula Name | Formula Expression | Inputs Count |
|---|---|---|---|---|---|---|---|
| 1 | `percentage` | Percentage & Fraction Calculator | `basic-math` | `percentages-fractions` | Percentage of Number and Difference | `P = (X * Y) / 100` | 2 |
| 2 | `quadratic` | Quadratic Equation Solver | `algebra` | `quadratic-equations` | Quadratic Formula | `x = (-b ± √(b² - 4ac)) / (2a)` | 3 |
| 3 | `slope-intercept` | Slope-Intercept Linear Calculator | `algebra` | `linear-equations` | Slope-Intercept Form | `m = (y₂ - y₁) / (x₂ - x₁), y = mx + b` | 4 |
| 4 | `area-shapes` | Area & Perimeter Calculator | `geometry` | `plane-geometry-area` | 2D Geometric Area | `Rectangle: l * w, Circle: π * r²` | 2 |
| 5 | `volume-surface` | Volume & Surface Area Calculator | `geometry` | `solid-geometry-volume` | Solid Geometry Formulas | `V = π * r² * h, V = (4/3) * π * r³` | 2 |
| 6 | `pythagorean` | Pythagorean Theorem Calculator | `trigonometry` | `right-triangles` | Pythagorean Theorem | `a² + b² = c²` | 2 |
| 7 | `trig-solver` | Trigonometric Functions Calculator | `trigonometry` | `trig-functions` | Trigonometric Ratios | `sin(θ), cos(θ), tan(θ)` | 1 |
| 8 | `stats-summary` | Statistics & Probability Calculator | `statistics` | `descriptive-statistics` | Descriptive Central Tendency | `μ = Σx / N, σ = √(Σ(x - μ)² / N)` | 1 |
| 9 | `scientific-calc` | Scientific Calculator | `scientific` | `precision-scientific` | Transcendental Operations | `f(x) = { log, ln, x^y, √x }` | 2 |
| 10 | `loan-mortgage` | Loan & Mortgage Calculator | `financial` | `loans-mortgages` | Fixed-Rate Loan Amortization | `M = P[r(1+r)ⁿ] / [(1+r)ⁿ - 1]` | 3 |
| 11 | `compound-interest` | Compound Interest Calculator | `financial` | `compound-investments` | Compound Interest with Annuity Additions | `A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]` | 4 |
| 12 | `break-even` | Break-Even Analysis Calculator | `business` | `break-even-analysis` | Break-Even Unit Volume | `Q = Fixed Costs / (Price - Variable Cost)` | 3 |
| 13 | `profit-margin` | Profit Margin & Markup Calculator | `business` | `profit-margins-markup` | Gross Margin and Markup | `Margin% = (P - C) / P, Markup% = (P - C) / C` | 2 |
| 14 | `construction-calc` | Construction Material & Concrete Calculator | `construction` | `concrete-masonry` | Concrete Volume Sizing | `Yards = (L_ft * W_ft * D_in / 12) / 27` | 3 |
| 15 | `bmi` | BMI Calculator | `health-fitness` | `body-composition` | Body Mass Index | `BMI = weight_kg / (height_m)²` | 2 |
| 16 | `bmr-tdee` | BMR & TDEE Calorie Calculator | `health-fitness` | `metabolic-energy` | Mifflin-St Jeor Metabolic Equations | `BMR = 10w + 6.25h - 5a + s` | 4 |
| 17 | `exact-age` | Age Calculator | `datetime` | `chronological-age` | Chronological Gregorian Span | `Age = Target Date - Date of Birth` | 1 |
| 18 | `date-difference` | Date Difference & Business Days Calculator | `datetime` | `date-math-differences` | Calendar & Business Days Delta | `Days = Date₂ - Date₁` | 2 |
| 19 | `ohms-law` | Ohm's Law & Power Calculator | `electrical` | `ohms-law-power` | Ohm's Law | `V = I * R, P = V * I` | 2 |
| 20 | `electricity-cost` | Electricity Appliance Cost Calculator | `electrical` | `energy-consumption` | Kilowatt-Hour Cost Evaluation | `Cost = (Watts * Hours / 1000) * Rate` | 3 |
| 21 | `hydraulic-force` | Hydraulic Cylinder Force Calculator | `engineering` | `hydraulics-fluid` | Pascal's Law Piston Force | `F = P * A = P * π(d/2)²` | 2 |
| 22 | `kinetic-energy` | Kinetic & Potential Energy Calculator | `engineering` | `mechanics-energy` | Newtonian Mechanical Energy | `KE = 1/2 * m * v², PE = m * g * h` | 2 |
| 23 | `tip-split` | Tip & Bill Split Calculator | `everyday` | `dining-tipping` | Gratuity & Bill Split | `Tip = Bill * (t / 100), Per Person = (Bill + Tip) / N` | 3 |
| 24 | `discount-tax` | Discount & Sales Tax Calculator | `everyday` | `shopping-discounts` | Retail Markdown and Tax | `P_final = (P_orig - Discount) * (1 + Tax Rate)` | 3 |
| 25 | `fraction-arithmetic` | Fraction Arithmetic Calculator | `basic-math` | `arithmetic-operations` | Fraction Arithmetic Operations | `a/b ± c/d = (ad ± bc)/bd, (a/b) * (c/d) = ac/bd` | 5 |
| 26 | `fraction-reducer` | Fraction Reducer & Simplifier | `basic-math` | `percentages-fractions` | Euclidean GCD Reduction | `Simplified = (a / GCD) / (b / GCD)` | 2 |
| 27 | `percent-change` | Percentage Increase & Decrease Calculator | `basic-math` | `percentages-fractions` | Relative Percentage Change | `Δ% = ((New - Old) / Old) * 100` | 2 |
| 28 | `percent-difference` | Percentage Difference Calculator | `basic-math` | `percentages-fractions` | Symmetric Percent Difference | `Diff% = (\|A - B\| / ((A + B) / 2)) * 100` | 2 |
| 29 | `reverse-percentage` | Reverse Percentage Calculator | `basic-math` | `percentages-fractions` | Reverse Base Value | `Base = Final / (1 ± (Rate / 100))` | 3 |
| 30 | `fraction-to-percent` | Fraction to Percentage Calculator | `basic-math` | `percentages-fractions` | Fraction to Percentage Conversion | `P = (Num / Den) * 100` | 2 |
| 31 | `decimal-to-fraction` | Decimal to Fraction Calculator | `basic-math` | `percentages-fractions` | Decimal to Exact Fraction | `x = (x * 10ⁿ) / 10ⁿ` | 1 |
| 32 | `ratio-simplifier` | Ratio Simplifier Calculator | `basic-math` | `ratios-proportions` | GCD Ratio Simplification | `A/GCD : B/GCD` | 2 |
| 33 | `proportion-solver` | Proportion & Cross Multiplication Calculator | `basic-math` | `ratios-proportions` | Cross Multiplication | `A / B = C / x  =>  x = (B * C) / A` | 3 |
| 34 | `golden-ratio` | Golden Ratio Calculator (Phi) | `basic-math` | `ratios-proportions` | Divine Proportion (φ) | `φ = (1 + √5)/2 ≈ 1.6180339887` | 1 |
| 35 | `scale-factor` | Scale Factor & Dimension Calculator | `basic-math` | `ratios-proportions` | Geometric Scaling Ratios | `L_new = L * k, A_new = A * k², V_new = V * k³` | 2 |
| 36 | `aspect-ratio` | Aspect Ratio & Resolution Calculator | `basic-math` | `ratios-proportions` | Aspect Ratio Resolution | `H = (W * R_H) / R_W` | 3 |
| 37 | `gcd-lcm` | GCD & LCM Calculator | `basic-math` | `arithmetic-operations` | Euclidean GCD & LCM | `LCM(a, b) = \|a * b\| / GCD(a, b)` | 2 |
| 38 | `long-division` | Long Division & Remainder Calculator | `basic-math` | `arithmetic-operations` | Division with Remainder | `Dividend = (Divisor * Quotient) + Remainder` | 2 |
| 39 | `modulo-calculator` | Modulo (Mod) Calculator | `basic-math` | `arithmetic-operations` | Euclidean Modulo | `r = a mod n` | 2 |
| 40 | `average-calculator` | Average & Arithmetic Mean Calculator | `basic-math` | `arithmetic-operations` | Arithmetic Mean | `Mean = Σx / N` | 4 |
| 41 | `absolute-value` | Absolute Value & Distance Calculator | `basic-math` | `arithmetic-operations` | Absolute Value & 1D Distance | `\|a - b\|` | 2 |
| 42 | `round-to-sig-figs` | Significant Figures Rounding Calculator | `basic-math` | `rounding-estimation` | Significant Figures Rounding | `Round to N significant digits` | 2 |
| 43 | `round-to-nearest` | Round to Nearest Multiple Calculator | `basic-math` | `rounding-estimation` | Nearest Multiple Rounding | `y = round(x / m) * m` | 2 |
| 44 | `percent-error` | Percent Error Calculator | `basic-math` | `rounding-estimation` | Percent Error Formula | `Error% = (\|Exp - Theo\| / Theo) * 100` | 2 |
| 45 | `estimation-range` | Range Estimation & Bounds Calculator | `basic-math` | `rounding-estimation` | Interval Estimation | `Interval = [Mid - Tol, Mid + Tol]` | 2 |
| 46 | `prime-factorization` | Prime Factorization Calculator | `basic-math` | `arithmetic-operations` | Fundamental Theorem of Arithmetic | `n = p₁^a * p₂^b * ...` | 1 |
| 47 | `factorial-calc` | Factorial Calculator (n!) | `basic-math` | `arithmetic-operations` | Factorial Product | `n! = n * (n - 1) * ... * 1` | 1 |
| 48 | `mixed-numbers` | Mixed Number to Fraction Calculator | `basic-math` | `percentages-fractions` | Improper Fraction Conversion | `w + n/d = (w*d + n) / d` | 3 |
| 49 | `linear-equation` | Linear Equation Solver (ax + b = c) | `algebra` | `linear-equations` | First Degree Linear Isolation | `ax + b = c  =>  x = (c - b) / a` | 3 |
| 50 | `two-variable-linear` | Systems of 2 Linear Equations Solver | `algebra` | `systems-inequalities` | Cramer's Rule for 2x2 System | `a₁x + b₁y = c₁, a₂x + b₂y = c₂` | 6 |
| 51 | `three-variable-linear` | Systems of 3 Linear Equations Solver | `algebra` | `systems-inequalities` | Cramer's Rule 3x3 System | `x = Dx/D, y = Dy/D, z = Dz/D` | 12 |
| 52 | `polynomial-roots` | Cubic Equation Root Calculator | `algebra` | `polynomials-factoring` | Cubic Polynomial Root Isolation | `ax³ + bx² + cx + d = 0` | 4 |
| 53 | `factoring-trinomials` | Trinomial Factoring Calculator | `algebra` | `polynomials-factoring` | Factoring Quadratic Trinomials | `ax² + bx + c = (px + q)(rx + s)` | 3 |
| 54 | `difference-of-squares` | Difference of Squares Calculator | `algebra` | `polynomials-factoring` | Difference of Squares Identity | `a² - b² = (a - b)(a + b)` | 2 |
| 55 | `complete-the-square` | Completing the Square Calculator | `algebra` | `quadratic-equations` | Completing the Square Transformation | `ax² + bx + c = a(x - h)² + k` | 3 |
| 56 | `vertex-form` | Quadratic Vertex Form Calculator | `algebra` | `quadratic-equations` | Parabola Vertex & Axis of Symmetry | `h = -b/(2a), k = f(h)` | 3 |
| 57 | `discriminant-calc` | Discriminant Calculator (b² - 4ac) | `algebra` | `quadratic-equations` | Quadratic Discriminant | `Δ = b² - 4ac` | 3 |
| 58 | `midpoint-calculator` | Midpoint Formula Calculator | `algebra` | `linear-equations` | 2D Midpoint Coordinate | `M = ((x₁ + x₂)/2, (y₁ + y₂)/2)` | 4 |
| 59 | `distance-2d` | 2D Coordinate Distance Calculator | `algebra` | `linear-equations` | Euclidean Cartesian Distance | `d = √((x₂ - x₁)² + (y₂ - y₁)²)` | 4 |
| 60 | `parallel-perpendicular` | Parallel and Perpendicular Line Calculator | `algebra` | `linear-equations` | Linear Slopes Relationship | `m_parallel = m, m_perp = -1/m` | 1 |
| 61 | `linear-inequality` | Linear Inequality Solver | `algebra` | `systems-inequalities` | Inequality Solution & Interval | `ax + b > c  =>  x > (c - b) / a (flips if a < 0)` | 4 |
| 62 | `compound-inequality` | Compound Inequality Calculator | `algebra` | `systems-inequalities` | Double Inequality Bounds | `a < x + b < c` | 3 |
| 63 | `foil-calculator` | FOIL Binomial Multiplication Calculator | `algebra` | `polynomials-factoring` | FOIL Binomial Expansion | `(ax + b)(cx + d) = acx² + (ad + bc)x + bd` | 4 |
| 64 | `exponent-rules` | Exponent Rules & Power Calculator | `algebra` | `polynomials-factoring` | Laws of Indices & Exponents | `xᵃ * xᵇ = xᵃ⁺ᵇ, (xᵃ)ᵇ = xᵃᵇ` | 3 |
| 65 | `rational-expressions` | Rational Expression Simplifier | `algebra` | `polynomials-factoring` | Algebraic Fraction Simplification | `P(x) / Q(x)` | 2 |
| 66 | `absolute-inequality` | Absolute Value Inequality Solver | `algebra` | `systems-inequalities` | Absolute Inequality Interval | `\|x - h\| < k  =>  h - k < x < h + k` | 2 |
| 67 | `circle-calculator` | Circle Area & Circumference Calculator | `geometry` | `circles-arcs` | Circle Planar Geometry | `A = πr², C = 2πr, d = 2r` | 1 |
| 68 | `triangle-area` | Triangle Area & Heron's Formula Calculator | `geometry` | `plane-geometry-area` | Heron's Formula & Standard Area | `A = √(s(s-a)(s-b)(s-c)), s = (a+b+c)/2` | 3 |
| 69 | `trapezoid-area` | Trapezoid Area & Perimeter Calculator | `geometry` | `plane-geometry-area` | Trapezoid Area | `A = ((a + b) / 2) * h` | 3 |
| 70 | `parallelogram-area` | Parallelogram Area Calculator | `geometry` | `plane-geometry-area` | Parallelogram Area | `A = b * h, P = 2(b + s)` | 3 |
| 71 | `rhombus-area` | Rhombus Area & Diagonals Calculator | `geometry` | `plane-geometry-area` | Rhombus Diagonals Area | `A = (d₁ * d₂) / 2, side = √((d₁/2)² + (d₂/2)²)` | 2 |
| 72 | `ellipse-area` | Ellipse Area & Perimeter Calculator | `geometry` | `plane-geometry-area` | Ellipse Area & Ramanujan Perimeter | `A = πab, P ≈ π[3(a+b) - √((3a+b)(a+3b))]` | 2 |
| 73 | `regular-polygon` | Regular Polygon Calculator | `geometry` | `plane-geometry-area` | Equilateral n-gon Area | `A = (n * s²) / (4 * tan(π/n))` | 2 |
| 74 | `sector-area` | Circle Sector Area Calculator | `geometry` | `circles-arcs` | Circular Sector Area | `A = (θ / 360) * πr²` | 2 |
| 75 | `arc-length` | Circle Arc Length Calculator | `geometry` | `circles-arcs` | Arc Curvilinear Distance | `s = r * θ_rad` | 2 |
| 76 | `circle-segment` | Circular Segment Area Calculator | `geometry` | `circles-arcs` | Circular Segment Area | `A = ½r²(θ_rad - sin(θ_rad))` | 2 |
| 77 | `rectangular-prism` | Rectangular Prism (Box) Calculator | `geometry` | `solid-geometry-volume` | Cuboid Volume & Surface Area | `V = lwh, SA = 2(lw + lh + wh), d = √(l² + w² + h²)` | 3 |
| 78 | `cylinder-calc` | Cylinder Volume & Surface Calculator | `geometry` | `solid-geometry-volume` | Cylinder Solid Geometry | `V = πr²h, Lateral = 2πrh, Total SA = 2πr(r + h)` | 2 |
| 79 | `sphere-calc` | Sphere Volume & Surface Area Calculator | `geometry` | `solid-geometry-volume` | Sphere Solid Geometry | `V = (4/3)πr³, SA = 4πr²` | 1 |
| 80 | `cone-calc` | Cone Volume & Slant Height Calculator | `geometry` | `solid-geometry-volume` | Right Circular Cone Geometry | `V = (1/3)πr²h, s = √(r² + h²), SA = πr(r + s)` | 2 |
| 81 | `pyramid-calc` | Square Pyramid Volume & Surface Calculator | `geometry` | `solid-geometry-volume` | Square Pyramid Geometry | `V = (1/3)a²h, SA = a² + 2a√(h² + (a/2)²)` | 2 |
| 82 | `triangular-prism` | Triangular Prism Volume Calculator | `geometry` | `solid-geometry-volume` | Triangular Prism Volume | `V = (½ * b * h_triangle) * L_prism` | 3 |
| 83 | `torus-calc` | Torus (Doughnut) Volume & Surface Calculator | `geometry` | `solid-geometry-volume` | Torus Volume & Surface Area | `V = 2π²Rr², SA = 4π²Rr` | 2 |
| 84 | `ellipsoid-calc` | Ellipsoid 3D Volume Calculator | `geometry` | `solid-geometry-volume` | Ellipsoid 3D Solid Volume | `V = (4/3) * π * a * b * c` | 3 |
| 85 | `distance-3d` | 3D Coordinate Distance Calculator | `geometry` | `coordinate-geometry` | 3D Cartesian Spatial Distance | `d = √((x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²)` | 6 |
| 86 | `slope-distance-3d` | 3D Vector Magnitude & Pitch Calculator | `geometry` | `coordinate-geometry` | Vector Magnitude & Spherical Pitch | `\|v\| = √(x² + y² + z²), pitch = arcsin(z / \|v\|)` | 3 |
| 87 | `right-triangle-solver` | Right Triangle Angle & Side Solver | `trigonometry` | `right-triangles` | Right Triangle SOH CAH TOA | `c = √(a² + b²), A = arctan(a / b)` | 2 |
| 88 | `law-of-sines` | Law of Sines Triangle Calculator | `trigonometry` | `oblique-triangles` | Sine Proportion Rule | `b = a * sin(B) / sin(A)` | 3 |
| 89 | `law-of-cosines` | Law of Cosines Triangle Calculator | `trigonometry` | `oblique-triangles` | Cosine Generalized Pythagorean | `c² = a² + b² - 2ab * cos(C)` | 3 |
| 90 | `radians-to-degrees` | Radians to Degrees Angle Calculator | `trigonometry` | `trig-functions` | Angle Unit Conversion | `deg = rad * (180 / π), rad = deg * (π / 180)` | 2 |
| 91 | `inverse-trig` | Inverse Trigonometric Calculator | `trigonometry` | `trig-functions` | Inverse Trigonometric Functions | `θ = arcsin(x), arccos(x), arctan(x)` | 1 |
| 92 | `coterminal-angles` | Coterminal Angle Calculator | `trigonometry` | `trig-functions` | Coterminal Periodic Angle | `θ_c = θ ± 360° * k` | 1 |
| 93 | `reference-angle` | Reference Angle Calculator | `trigonometry` | `trig-functions` | Quadrant Reference Angle | `Acute angle formed with positive/negative x-axis` | 1 |
| 94 | `angle-elevation-depression` | Angle of Elevation & Depression Calculator | `trigonometry` | `right-triangles` | Line of Sight Elevation | `Height = Distance * tan(θ)` | 2 |
| 95 | `double-angle` | Double Angle Identity Calculator | `trigonometry` | `identities-harmonics` | Double Angle Harmonics | `sin(2θ) = 2sin(θ)cos(θ), cos(2θ) = cos²(θ) - sin²(θ)` | 1 |
| 96 | `half-angle` | Half Angle Identity Calculator | `trigonometry` | `identities-harmonics` | Half Angle Formulas | `sin(θ/2) = ±√((1 - cos(θ)) / 2)` | 1 |
| 97 | `variance-calc` | Variance Calculator | `statistics` | `descriptive-statistics` | Statistical Variance | `s² = Σ(x - x̄)² / (n - 1)` | 5 |
| 98 | `standard-deviation` | Standard Deviation Calculator | `statistics` | `descriptive-statistics` | Standard Deviation | `s = √(Σ(x - x̄)² / (n - 1))` | 5 |
| 99 | `mean-median-mode` | Mean, Median & Mode Calculator | `statistics` | `descriptive-statistics` | Measures of Central Tendency | `Mean = Σx/n, Median = middle, Mode = frequency` | 5 |
| 100 | `geometric-mean` | Geometric Mean Calculator | `statistics` | `descriptive-statistics` | Geometric Mean | `GM = (x₁ * x₂ * ... * xₙ)^(1/n)` | 3 |
| 101 | `harmonic-mean` | Harmonic Mean Calculator | `statistics` | `descriptive-statistics` | Harmonic Reciprocal Mean | `H = n / Σ(1 / xᵢ)` | 2 |
| 102 | `weighted-average` | Weighted Average & Grade Calculator | `statistics` | `descriptive-statistics` | Weighted Arithmetic Mean | `x̄_w = Σ(wᵢ * xᵢ) / Σwᵢ` | 6 |
| 103 | `interquartile-range` | Interquartile Range (IQR) Calculator | `statistics` | `descriptive-statistics` | Interquartile Range (IQR) | `IQR = Q₃ - Q₁` | 2 |
| 104 | `z-score` | Z-Score & Standard Normal Score Calculator | `statistics` | `distributions` | Standard Score Transformation | `z = (x - μ) / σ` | 3 |
| 105 | `normal-distribution` | Normal Distribution Probability Calculator | `statistics` | `distributions` | Gaussian Probability Density Function | `f(x) = (1 / (σ√(2π))) * e^(-½((x-μ)/σ)²)` | 3 |
| 106 | `binomial-distribution` | Binomial Probability Calculator | `statistics` | `distributions` | Binomial Mass Function | `P(X = k) = C(n, k) * p^k * (1-p)^(n-k)` | 3 |
| 107 | `poisson-distribution` | Poisson Distribution Calculator | `statistics` | `distributions` | Poisson Probability Function | `P(X = k) = (λ^k * e^-λ) / k!` | 2 |
| 108 | `permutations-calc` | Permutations Calculator (nPr) | `statistics` | `combinatorics-probability` | Permutations Without Repetition | `nPr = n! / (n - r)!` | 2 |
| 109 | `combinations-calc` | Combinations Calculator (nCr) | `statistics` | `combinatorics-probability` | Combinations Without Repetition | `nCr = n! / (r! * (n - r)!)` | 2 |
| 110 | `probability-calc` | Single Event Probability & Odds Calculator | `statistics` | `combinatorics-probability` | Classical Theoretical Probability | `P(E) = n(E) / n(S)` | 2 |
| 111 | `bayes-theorem` | Bayes' Theorem Probability Calculator | `statistics` | `combinatorics-probability` | Bayes' Rule for Conditional Probability | `P(A\|B) = (P(B\|A) * P(A)) / P(B)` | 3 |
| 112 | `odds-converter` | Odds & Probability Converter Calculator | `statistics` | `combinatorics-probability` | Implied Probability from Decimal Odds | `Probability% = (1 / Decimal) * 100` | 1 |
| 113 | `expected-value` | Expected Value Calculator E(X) | `statistics` | `combinatorics-probability` | Discrete Expectation | `E(X) = Σ(xᵢ * P(xᵢ))` | 4 |
| 114 | `linear-regression` | Linear Regression Trendline Calculator | `statistics` | `regression-correlation` | Least Squares Linear Fit | `y = mx + b` | 6 |
| 115 | `correlation-coefficient` | Pearson Correlation & R² Calculator | `statistics` | `regression-correlation` | Pearson Product-Moment Correlation | `r = Σ((x - x̄)(y - ȳ)) / (√(Σ(x - x̄)²) * √(Σ(y - ȳ)²))` | 6 |
| 116 | `covariance-calc` | Covariance Calculator | `statistics` | `regression-correlation` | Sample Covariance | `Cov(X, Y) = Σ((x - x̄)(y - ȳ)) / (n - 1)` | 6 |
| 117 | `confidence-interval` | Confidence Interval Calculator | `statistics` | `distributions` | Normal Mean Confidence Interval | `CI = x̄ ± z * (s / √n)` | 4 |
| 118 | `margin-of-error` | Margin of Error Survey Calculator | `statistics` | `distributions` | Survey Margin of Error | `MOE = z * √(p(1-p)/n)` | 1 |
| 119 | `sample-size` | Sample Size Determination Calculator | `statistics` | `distributions` | Cochran Minimum Sample Size | `n = (z² * p(1-p)) / e²` | 1 |
| 120 | `scientific-notation` | Scientific & Engineering Notation Calculator | `scientific` | `precision-scientific` | Scientific Exponential Notation | `N = m * 10ⁿ` | 1 |
| 121 | `logarithm-base-n` | Logarithm Calculator (Any Base) | `scientific` | `logarithms` | Arbitrary Base Logarithm | `log_b(x) = ln(x) / ln(b)` | 2 |
| 122 | `natural-log` | Natural Logarithm (ln) & e^x Calculator | `scientific` | `logarithms` | Natural Log & Euler Exponential | `ln(x) = log_e(x), exp(x) = e^x` | 1 |
| 123 | `exponential-growth` | Exponential Growth & Decay Calculator | `scientific` | `powers-exponents` | Continuous Exponential Function | `N(t) = N₀ * e^(kt)` | 3 |
| 124 | `half-life` | Half-Life & Radioactive Decay Calculator | `scientific` | `powers-exponents` | Exponential Half-Life Decay | `N(t) = N₀ * (1/2)^(t / t_half)` | 3 |
| 125 | `power-function` | Power Function & Exponents Calculator (xʸ) | `scientific` | `powers-exponents` | General Power Function | `y = xⁿ` | 2 |
| 126 | `root-calculator` | Nth Root & Radical Calculator (ⁿ√x) | `scientific` | `powers-exponents` | Nth Radical Extraction | `ⁿ√x = x^(1/n)` | 2 |
| 127 | `sig-figs-counter` | Significant Figures Counter & Identifier | `scientific` | `precision-scientific` | Significant Figures Metric | `Count of scientifically significant digits` | 1 |
| 128 | `fibonacci-sequence` | Fibonacci Sequence & Golden Spiral Calculator | `scientific` | `constants-sequences` | Binet's Formula | `F_n = (φⁿ - ψⁿ) / √5` | 1 |
| 129 | `arithmetic-sequence` | Arithmetic Sequence & Series Calculator | `scientific` | `constants-sequences` | Arithmetic Progression (A.P.) | `a_n = a₁ + (n - 1)d, S_n = (n/2)(a₁ + a_n)` | 3 |
| 130 | `geometric-sequence` | Geometric Sequence & Series Calculator | `scientific` | `constants-sequences` | Geometric Progression (G.P.) | `a_n = a₁ * r^(n-1), S_n = a₁(1 - rⁿ) / (1 - r)` | 3 |
| 131 | `auto-loan-calc` | Auto Loan Calculator | `financial` | `loans-mortgages` | Auto Loan Amortization Formula | `PMT = P × [r(1+r)^n] / [(1+r)^n - 1]` | 4 |
| 132 | `amortization-schedule-calc` | Loan Amortization Calculator | `financial` | `loans-mortgages` | Amortization Split | `Interest = Balance × r; Principal = PMT - Interest` | 3 |
| 133 | `debt-to-income-calc` | Debt-to-Income (DTI) Calculator | `financial` | `loans-mortgages` | Back-End DTI Ratio | `DTI = (Total Monthly Debt / Gross Monthly Income) × 100` | 3 |
| 134 | `refinance-mortgage-calc` | Mortgage Refinance Calculator | `financial` | `loans-mortgages` | Refinance Break-Even | `Months = Closing Costs / Monthly Savings` | 3 |
| 135 | `extra-payment-calc` | Mortgage Extra Payment Calculator | `financial` | `loans-mortgages` | Extra Principal Amortization | `Savings = TotalInterest(standard) - TotalInterest(accelerated)` | 4 |
| 136 | `personal-loan-calc` | Personal Loan Calculator | `financial` | `loans-mortgages` | Personal Loan Payment | `PMT = P × [r(1+r)^n] / [(1+r)^n - 1]` | 3 |
| 137 | `boat-rv-loan-calc` | Boat & RV Loan Calculator | `financial` | `loans-mortgages` | Recreational Vehicle Loan Formula | `PMT = (P - Down) × [r(1+r)^n] / [(1+r)^n - 1]` | 4 |
| 138 | `balloon-payment-calc` | Balloon Loan Calculator | `financial` | `loans-mortgages` | Balloon Payment Balance | `Balloon = P(1+r)^k - PMT × [((1+r)^k - 1)/r]` | 4 |
| 139 | `biweekly-mortgage-calc` | Bi-Weekly Mortgage Calculator | `financial` | `loans-mortgages` | Bi-Weekly Mortgage Payment Schedule | `Biweekly PMT = Monthly PMT / 2 (26 payments/yr)` | 3 |
| 140 | `interest-only-loan-calc` | Interest-Only Loan Calculator | `financial` | `loans-mortgages` | Interest Only Payment | `IO PMT = Principal × (Annual Rate / 12)` | 4 |
| 141 | `simple-interest-calc` | Simple Interest Calculator | `financial` | `compound-investments` | Simple Interest Formula | `I = P × r × t; A = P + I` | 3 |
| 142 | `apr-to-apy-calc` | APR to APY Converter & Calculator | `financial` | `compound-investments` | Effective Annual Yield Formula | `APY = (1 + APR / n)^n - 1` | 2 |
| 143 | `certificate-deposit-calc` | Certificate of Deposit (CD) Calculator | `financial` | `compound-investments` | CD Maturity Compounding | `A = P × (1 + r/12)^(12 × t)` | 3 |
| 144 | `rule-of-72-calc` | Rule of 72 Calculator | `financial` | `compound-investments` | Rule of 72 Doubling Time | `Years to Double ≈ 72 / Interest Rate (%)` | 2 |
| 145 | `dividend-yield-calc` | Dividend Yield Calculator | `financial` | `compound-investments` | Stock Dividend Yield Formula | `Yield % = (Annual Dividend / Stock Price) × 100` | 3 |
| 146 | `future-value-calc` | Future Value (FV) Calculator | `financial` | `compound-investments` | Future Value of Lump Sum | `FV = PV × (1 + r)^t` | 3 |
| 147 | `present-value-calc` | Present Value (PV) Calculator | `financial` | `compound-investments` | Present Value Discount Formula | `PV = FV / (1 + r)^t` | 3 |
| 148 | `annuity-payout-calc` | Annuity Value Calculator | `financial` | `compound-investments` | Future Value of Ordinary Annuity | `FV = PMT × [((1 + r)^n - 1) / r]` | 3 |
| 149 | `treasury-bond-yield-calc` | Bond Yield to Maturity (YTM) Calculator | `financial` | `compound-investments` | Approximate YTM Formula | `YTM ≈ [C + (F - P)/n] / [(F + P)/2]` | 4 |
| 150 | `mutual-fund-fee-calc` | Mutual Fund Expense Drag Calculator | `financial` | `compound-investments` | Fee Drag Formula | `Drag = FV(gross) - FV(net)` | 4 |
| 151 | `401k-savings-calc` | 401(k) Retirement Calculator | `financial` | `retirement-savings` | 401k Compounding with Match | `FV = Initial(1+r)^n + (Employee + Match) × [((1+r)^n - 1)/r]` | 6 |
| 152 | `roth-ira-calc` | Roth IRA Growth Calculator | `financial` | `retirement-savings` | Roth IRA Tax-Free Compounding | `FV = PMT × [((1+r)^n - 1)/r]` | 4 |
| 153 | `traditional-ira-calc` | Traditional IRA Calculator | `financial` | `retirement-savings` | Tax-Deferred Compounding | `FV = Initial(1+r)^n + Annual × [((1+r)^n - 1)/r]` | 4 |
| 154 | `safe-withdrawal-rate-calc` | Safe Withdrawal Rate (4% Rule) Calculator | `financial` | `retirement-savings` | Safe Withdrawal Rate (SWR) | `Annual Income = Portfolio × (SWR % / 100)` | 2 |
| 155 | `pension-annuity-calc` | Pension Lump Sum vs Monthly Calculator | `financial` | `retirement-savings` | Present Value of Pension Stream | `PV = Monthly × [1 - (1+r)^(-n)] / r` | 4 |
| 156 | `fire-calculator` | FIRE (Financial Independence) Calculator | `financial` | `retirement-savings` | FIRE Number (25x Rule) | `FIRE Number = Annual Expenses × 25` | 4 |
| 157 | `social-security-estimate-calc` | Social Security Breakeven Calculator | `financial` | `retirement-savings` | Breakeven Claiming Age | `Breakeven = Age where cumulative delayed benefits exceed early benefits` | 2 |
| 158 | `college-savings-529-calc` | 529 College Savings Calculator | `financial` | `retirement-savings` | College Sinking Fund | `Required Monthly = Goal / AnnuityFactor` | 4 |
| 159 | `hsa-growth-calc` | HSA Triple-Tax Advantage Calculator | `financial` | `retirement-savings` | HSA Compound Growth | `FV = Initial(1+r)^n + Annual × [((1+r)^n - 1)/r]` | 4 |
| 160 | `retirement-shortfall-calc` | Retirement Gap & Shortfall Calculator | `financial` | `retirement-savings` | Retirement Deficit Calculation | `Shortfall = Needed Capital - Projected Capital` | 3 |
| 161 | `straight-line-depreciation-calc` | Straight-Line Depreciation Calculator | `financial` | `depreciation-tax` | Straight-Line Depreciation | `Depreciation = (Cost - Salvage) / Useful Life` | 3 |
| 162 | `declining-balance-depreciation-calc` | Double Declining Balance Depreciation Calculator | `financial` | `depreciation-tax` | Double Declining Balance | `Rate = 200% / Life; Year 1 = Cost × Rate` | 3 |
| 163 | `sum-of-years-digits-calc` | Sum-of-Years-Digits Depreciation Calculator | `financial` | `depreciation-tax` | Sum of the Years Digits (SYD) | `SYD = n(n+1)/2; Dep = (Cost - Salvage) × (Remaining/SYD)` | 3 |
| 164 | `macrs-depreciation-calc` | MACRS Depreciation Calculator | `financial` | `depreciation-tax` | IRS MACRS 5-Year Property Schedule | `Rates: Y1: 20%, Y2: 32%, Y3: 19.2%, Y4: 11.52%, Y5: 11.52%, Y6: 5.76%` | 1 |
| 165 | `capital-gains-tax-calc` | Capital Gains Tax Calculator | `financial` | `depreciation-tax` | Net Capital Gain and Tax | `Gain = Selling Price - Purchase Cost; Tax = Gain × Rate` | 3 |
| 166 | `sales-tax-deduction-calc` | Sales Tax Deduction Calculator | `financial` | `depreciation-tax` | Itemized Sales Tax Deduction | `Deduction = Major Purchases × Combined Tax Rate` | 2 |
| 167 | `effective-tax-rate-calc` | Effective Tax Rate Calculator | `financial` | `depreciation-tax` | Effective Tax Rate Formula | `Effective Rate = (Total Tax / Gross Income) × 100` | 2 |
| 168 | `fica-payroll-tax-calc` | FICA Payroll Tax Calculator | `financial` | `depreciation-tax` | FICA Social Security & Medicare | `SS = 6.2% up to cap; Medicare = 1.45% (Total = 7.65%)` | 1 |
| 169 | `bonus-depreciation-calc` | Section 179 & Bonus Depreciation Calculator | `financial` | `depreciation-tax` | Immediate First-Year Equipment Expensing | `Tax Savings = Purchase Cost × Marginal Tax Rate` | 2 |
| 170 | `net-paycheck-calc` | Take-Home Paycheck Calculator | `financial` | `depreciation-tax` | Net Paycheck Calculation | `Net = Gross - Federal - State - FICA` | 3 |
| 171 | `target-profit-calc` | Target Profit Sales Calculator | `business` | `break-even-analysis` | Target Profit Sales Volume | `Units = (Fixed Costs + Target Profit) / (Price - Variable Cost)` | 4 |
| 172 | `contribution-margin-calc` | Contribution Margin Calculator | `business` | `break-even-analysis` | Contribution Margin Formula | `CM = Revenue - Variable Costs; Ratio % = (CM / Revenue) × 100` | 2 |
| 173 | `margin-of-safety-calc` | Margin of Safety Calculator | `business` | `break-even-analysis` | Margin of Safety (MOS) | `MOS % = [(Actual Sales - Break-Even Sales) / Actual Sales] × 100` | 2 |
| 174 | `operating-leverage-calc` | Degree of Operating Leverage (DOL) Calculator | `business` | `break-even-analysis` | Operating Leverage Factor | `DOL = Contribution Margin / Operating Income` | 2 |
| 175 | `markup-to-margin-calc` | Markup to Margin Converter & Calculator | `business` | `profit-margins-markup` | Markup and Margin Interconversion | `Margin % = Markup / (1 + Markup); Price = Cost × (1 + Markup)` | 2 |
| 176 | `operating-margin-calc` | Operating Profit Margin (EBIT) Calculator | `business` | `profit-margins-markup` | Operating Margin Formula | `Operating Margin % = (Operating Income / Net Revenue) × 100` | 3 |
| 177 | `ebitda-margin-calc` | EBITDA & EBITDA Margin Calculator | `business` | `profit-margins-markup` | EBITDA Calculation | `EBITDA = EBIT + Depreciation + Amortization` | 3 |
| 178 | `gross-margin-pricing-calc` | Target Gross Margin Price Solver | `business` | `profit-margins-markup` | Target Margin Pricing Formula | `Price = Cost / (1 - Target Margin)` | 2 |
| 179 | `npv-calculator` | Net Present Value (NPV) Calculator | `business` | `roi-npv` | Discounted Cash Flow NPV | `NPV = Σ [CF_t / (1 + r)^t] - Initial Outlay` | 6 |
| 180 | `irr-calculator` | Internal Rate of Return (IRR) Calculator | `business` | `roi-npv` | IRR Solver | `NPV(IRR) = 0` | 5 |
| 181 | `payback-period-calc` | Payback Period Calculator | `business` | `roi-npv` | Capital Payback Period | `Payback = Initial Outlay / Annual Cash Flow` | 2 |
| 182 | `annualized-roi-calc` | Annualized ROI & CAGR Calculator | `business` | `roi-npv` | Compound Annual Growth Rate | `CAGR = (End / Start)^(1/Years) - 1` | 3 |
| 183 | `customer-acquisition-cost-calc` | CAC & Customer LTV Ratio Calculator | `business` | `roi-npv` | Unit Economics LTV:CAC | `CAC = Spend / Customers; LTV:CAC = LTV / CAC` | 3 |
| 184 | `inventory-turnover-calc` | Inventory Turnover & Days on Hand Calculator | `business` | `valuation-ratios` | Inventory Efficiency | `Turnover = COGS / Avg Inventory; Days = 365 / Turnover` | 2 |
| 185 | `current-ratio-calc` | Current Ratio & Quick Ratio (Acid Test) | `business` | `valuation-ratios` | Working Capital Ratios | `Current = Assets / Liab; Quick = (Assets - Inventory) / Liab` | 3 |
| 186 | `debt-to-equity-calc` | Debt-to-Equity (D/E) Ratio Calculator | `business` | `valuation-ratios` | Financial Leverage Ratio | `D/E = Total Liabilities / Total Shareholders Equity` | 2 |
| 187 | `accounts-receivable-turnover-calc` | Accounts Receivable Turnover & DSO Calculator | `business` | `valuation-ratios` | Receivables Collection Velocity | `Turnover = Credit Sales / Avg AR; DSO = 365 / Turnover` | 2 |
| 188 | `churn-rate-calc` | Customer Churn & Retention Calculator | `business` | `valuation-ratios` | Churn & Lifespan Formula | `Churn % = (Lost / Start) × 100; Lifespan = 1 / Churn` | 2 |
| 189 | `concrete-footing-calc` | Concrete Footing & Pier Calculator | `construction` | `concrete-masonry` | Footing Concrete Volume | `Yards³ = (Length ft × Width ft × Depth ft) / 27` | 3 |
| 190 | `concrete-column-calc` | Concrete Sonotube & Column Calculator | `construction` | `concrete-masonry` | Cylinder Volume | `V = π × r² × h` | 3 |
| 191 | `cinder-block-calc` | CMU Cinder Block Wall Calculator | `construction` | `concrete-masonry` | CMU Block Estimator (8x8x16) | `Blocks = Wall Sq Ft × 1.125 blocks/sq ft` | 2 |
| 192 | `brick-masonry-calc` | Brick Masonry & Mortar Calculator | `construction` | `concrete-masonry` | Modular Brick Estimator | `Bricks = Area × 6.85 modular units/sq ft` | 1 |
| 193 | `rebar-grid-calc` | Rebar Grid & Weight Calculator | `construction` | `concrete-masonry` | Rebar Grid Formula | `Length = (L/spacing + 1)W + (W/spacing + 1)L` | 3 |
| 194 | `gravel-aggregate-calc` | Gravel & Crushed Stone Calculator | `construction` | `concrete-masonry` | Aggregate Weight | `Tons = (Sq Ft × Depth/12 / 27) × 1.4` | 3 |
| 195 | `sand-screed-calc` | Paver Sand & Base Bedding Calculator | `construction` | `concrete-masonry` | Bedding Sand Volume | `Yards = (Area sq ft × Depth in) / 324` | 2 |
| 196 | `hardwood-flooring-calc` | Hardwood & Laminate Flooring Calculator | `construction` | `flooring-materials` | Flooring Box Calculator | `Boxes = Ceil((Area × 1.10) / Box Coverage)` | 3 |
| 197 | `tile-grout-calc` | Tile & Grout Volume Calculator | `construction` | `flooring-materials` | Tile Piece and Grout Math | `Tiles = (Area / Tile Area) × 1.10` | 3 |
| 198 | `carpet-roll-calc` | Carpet Square Yardage Calculator | `construction` | `flooring-materials` | Carpet Square Yards | `SY = (Length ft × Width ft) / 9` | 2 |
| 199 | `vinyl-plank-calc` | Luxury Vinyl Plank (LVP) Calculator | `construction` | `flooring-materials` | LVP Box Estimator | `Boxes = Ceil((Sq Ft × 1.10) / Box Coverage)` | 2 |
| 200 | `baseboard-trim-calc` | Baseboard & Trim Molding Calculator | `construction` | `flooring-materials` | Perimeter Trim Formula | `Linear Ft = [2(L + W) - Doors] × 1.10` | 3 |
| 201 | `floor-underlayment-calc` | Flooring Underlayment Calculator | `construction` | `flooring-materials` | Underlayment Rolls | `Rolls = Ceil(Area / Roll Coverage)` | 2 |
| 202 | `deck-boards-calc` | Decking Board & Fastener Calculator | `construction` | `flooring-materials` | Decking Board Count | `Runs = Ceil(Deck Width / (Board Width + Gap))` | 2 |
| 203 | `wall-stud-calc` | Wall Stud Calculator | `construction` | `framing-lumber` | Stud and Plate Count | `Studs = Ceil(Length × 12 / Spacing) + Corners(4) + Plates` | 2 |
| 204 | `drywall-sheet-calc` | Drywall Sheet & Mud Calculator | `construction` | `framing-lumber` | Drywall Sheets Formula | `Sheets = Ceil(Total Sq Ft / Sheet Sq Ft)` | 3 |
| 205 | `board-feet-calc` | Lumber Board Feet (BF) Calculator | `construction` | `framing-lumber` | Hardwood Board Feet | `BF = (Thickness in × Width in × Length ft) / 12` | 4 |
| 206 | `ceiling-joist-calc` | Ceiling Joist & Rafter Calculator | `construction` | `framing-lumber` | Joist Count Formula | `Joists = Ceil(Building Length / Spacing) + 1` | 2 |
| 207 | `plywood-sheathing-calc` | Plywood & OSB Sheathing Calculator | `construction` | `framing-lumber` | 4x8 Panel Estimator | `Panels = Ceil((Area sq ft × 1.10) / 32)` | 1 |
| 208 | `stair-rise-run-calc` | Stair Stringer Rise & Run Calculator | `construction` | `framing-lumber` | Stair Geometry Formula | `Steps = Round(Rise / 7.5); Riser Height = Rise / Steps` | 2 |
| 209 | `fence-picket-calc` | Wood Fence Pickets & Posts Calculator | `construction` | `framing-lumber` | Fence Component Formulas | `Posts = Ceil(L / 8) + 1; Pickets = Ceil(L × 12 / Width)` | 2 |
| 210 | `interior-paint-calc` | Interior Wall Paint Calculator | `construction` | `paint-roofing` | Interior Paint Coverage | `Gallons = Ceil((Net Area × Coats) / 350)` | 4 |
| 211 | `exterior-stain-calc` | Deck & Exterior Stain Calculator | `construction` | `paint-roofing` | Deck Stain Coverage | `Gallons = Ceil(Deck Area / 225)` | 2 |
| 212 | `roof-shingle-calc` | Roofing Shingles & Bundles Calculator | `construction` | `paint-roofing` | Roofing Squares Formula | `Squares = (Roof Sq Ft / 100) × 1.10; Bundles = Squares × 3` | 1 |
| 213 | `roof-pitch-calc` | Roof Pitch & Slope Multiplier Calculator | `construction` | `paint-roofing` | Pitch Multiplier Formula | `Factor = √(1 + (Rise/12)²); Angle = arctan(Rise/12)` | 2 |
| 214 | `insulation-batt-calc` | Fiberglass Insulation Batt Calculator | `construction` | `paint-roofing` | Insulation Package Estimator | `Bags = Ceil(Cavity Area / Coverage per Bag)` | 2 |
| 215 | `gutter-downspout-calc` | Seamless Rain Gutter Calculator | `construction` | `paint-roofing` | Eaves and Downspout Drainage | `Downspouts = Ceil(Linear Ft / 35)` | 1 |
| 216 | `siding-square-calc` | Vinyl & Hardie Siding Squares Calculator | `construction` | `paint-roofing` | Siding Squares Formula | `Squares = Ceil((Net Area × 1.10) / 100)` | 1 |
| 217 | `mulch-landscaping-calc` | Mulch & Topsoil Landscaping Calculator | `construction` | `paint-roofing` | Landscape Bedding Volume | `Yards = (Bed Area sq ft × Depth inches) / 324` | 2 |
| 218 | `body-fat-navy-calc` | US Navy Body Fat Calculator | `health-fitness` | `body-composition` | US Navy Circumference Method | `BF % = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76` | 5 |
| 219 | `ideal-body-weight-calc` | Ideal Body Weight (IBW) Calculator | `health-fitness` | `body-composition` | Devine & Robinson Formulas | `Devine Male: 50kg + 2.3kg/in > 5ft; Female: 45.5kg + 2.3kg/in` | 2 |
| 220 | `lean-body-mass-calc` | Lean Body Mass (LBM) Calculator | `health-fitness` | `body-composition` | Boer Equation | `Boer Male: 0.407W + 0.267H - 19.2` | 3 |
| 221 | `waist-to-hip-calc` | Waist-to-Hip Ratio (WHR) Calculator | `health-fitness` | `body-composition` | WHO WHR Metric | `WHR = Waist / Hip` | 3 |
| 222 | `waist-to-height-calc` | Waist-to-Height Ratio (WHtR) Calculator | `health-fitness` | `body-composition` | Ashwell WHtR Benchmark | `WHtR = Waist / Height` | 2 |
| 223 | `body-surface-area-calc` | Body Surface Area (BSA) Calculator | `health-fitness` | `body-composition` | Mosteller BSA Equation | `BSA (m²) = √((Height cm × Weight kg) / 3600)` | 2 |
| 224 | `calorie-deficit-calc` | Calorie Deficit & Weight Loss Date Calculator | `health-fitness` | `metabolic-energy` | Fat Loss Timeline | `Days = (Pounds to Lose × 3500) / Daily Deficit` | 3 |
| 225 | `calories-burned-activity-calc` | Exercise Calories Burned (MET) Calculator | `health-fitness` | `metabolic-energy` | Metabolic Equivalent of Task | `Calories = (MET × 3.5 × Weight kg / 200) × Duration min` | 3 |
| 226 | `intermittent-fasting-calc` | Intermittent Fasting Schedule Calculator | `health-fitness` | `metabolic-energy` | Intermittent Fasting Window | `Fast End = Last Meal Time + Fasting Duration` | 2 |
| 227 | `harris-benedict-calc` | Harris-Benedict BMR Calculator | `health-fitness` | `metabolic-energy` | Revised Harris-Benedict Equation | `BMR = 88.362 + (13.397×W) + (4.799×H) - (5.677×Age)` | 4 |
| 228 | `resting-heart-rate-vo2-calc` | Heart Rate Ratio VO2 Max Calculator | `health-fitness` | `metabolic-energy` | Uth-Sørensen Equation | `VO2 Max ≈ 15.3 × (HRmax / HRrest)` | 2 |
| 229 | `karvonen-heart-rate-calc` | Karvonen Heart Rate Zone Calculator | `health-fitness` | `target-heart-rate` | Heart Rate Reserve (HRR) Method | `Target = ((HRmax - HRrest) × Intensity) + HRrest` | 2 |
| 230 | `zone-2-cardio-calc` | Zone 2 Heart Rate Endurance Calculator | `health-fitness` | `target-heart-rate` | Zone 2 Metabolic Window | `Zone 2 = 60% to 70% of HRmax` | 1 |
| 231 | `vo2-max-running-calc` | Cooper 12-Minute Run VO2 Max Calculator | `health-fitness` | `target-heart-rate` | Cooper Test Formula | `VO2 Max = (Distance in meters - 504.9) / 44.73` | 1 |
| 232 | `one-rep-max-calc` | One-Rep Max (1RM) Calculator | `health-fitness` | `target-heart-rate` | Epley & Brzycki 1RM Formulas | `1RM = Weight × (1 + Reps / 30)` | 2 |
| 233 | `running-pace-calc` | Running Pace & Race Time Calculator | `health-fitness` | `target-heart-rate` | Pace & Split Calculations | `Pace = Time / Distance; Finish Time = Pace × Distance` | 2 |
| 234 | `wilks-score-calc` | Wilks & DOTS Powerlifting Calculator | `health-fitness` | `target-heart-rate` | DOTS Strength Score | `Score = Total Lifted × DOTS Coefficient` | 2 |
| 235 | `macro-protein-calc` | Daily Protein Requirement Calculator | `health-fitness` | `macronutrients-nutrition` | Protein by Body Weight and Goal | `Protein Grams = Weight lbs × Goal Factor` | 2 |
| 236 | `keto-macro-calc` | Ketogenic Diet Macro Calculator | `health-fitness` | `macronutrients-nutrition` | Standard Keto Ratios | `Fat: 70%, Protein: 25%, Net Carbs: 5%` | 1 |
| 237 | `water-intake-calc` | Daily Water Intake & Hydration Calculator | `health-fitness` | `macronutrients-nutrition` | Hydration Formula | `Fluid Oz = (Weight lbs × 0.5) + (Exercise min / 30 × 12)` | 2 |
| 238 | `carb-cycling-calc` | Carbohydrate Cycling Macro Calculator | `health-fitness` | `macronutrients-nutrition` | Carb Cycling Calorie Distribution | `High Day: Maintenance + 15%; Low Day: Maintenance - 20%` | 1 |
| 239 | `bodybuilding-prep-calc` | Bodybuilding Contest Prep Macro Calculator | `health-fitness` | `macronutrients-nutrition` | Contest Prep Deficit | `Weekly Deficit = Target Fat Loss × 3500 kcal` | 3 |
| 240 | `fiber-intake-calc` | Daily Dietary Fiber Calculator | `health-fitness` | `macronutrients-nutrition` | Dietary Fiber Recommendation | `Fiber = (Total Calories / 1000) × 14g` | 1 |
| 241 | `pet-age-dog-cat-calc` | Pet Age Calculator (Dog & Cat to Human Years) | `datetime` | `chronological-age` | AVMA Veterinary Age Conversion | `Y1 = 15 human yrs; Y2 = +9 yrs; Y3+ = +4-5 yrs` | 2 |
| 242 | `half-birthday-calc` | Half-Birthday & Milestone Calculator | `datetime` | `chronological-age` | Half Birthday Math | `Half Birthday = Birth Date + 6 Months (~182.5 days)` | 2 |
| 243 | `chronological-gestational-age-calc` | Corrected Gestational Age Calculator | `datetime` | `chronological-age` | Pediatric Corrected Age | `Corrected Age = Chronological Weeks - (40 - Gestational Weeks)` | 2 |
| 244 | `add-subtract-days-calc` | Add or Subtract Days from Date Calculator | `datetime` | `date-math-differences` | Date Arithmetic | `Target Timestamp = Base Timestamp ± (Days × 86,400,000 ms)` | 2 |
| 245 | `countdown-timer-calc` | Event Countdown & Days Until Calculator | `datetime` | `date-math-differences` | Countdown Duration | `Days = (Target - Now) / (1000 × 60 × 60 × 24)` | 1 |
| 246 | `day-of-week-calc` | Day of the Week Calculator (Zeller Algorithm) | `datetime` | `date-math-differences` | Zeller's Congruence | `Day of Week from Year, Month, Day` | 3 |
| 247 | `working-days-calc` | Business Working Days Calculator | `datetime` | `business-working-days` | Net Working Days | `Business Days = Calendar Days - Weekend Days` | 1 |
| 248 | `add-business-days-calc` | Add Business Days Deadline Calculator | `datetime` | `business-working-days` | Business Days Offset | `Calendar Days ≈ Business Days × (7/5)` | 1 |
| 249 | `billable-hours-calc` | Billable Hours & Fee Calculator | `datetime` | `business-working-days` | Billable Timesheet Invoice | `Total = (Hours + Minutes/60) × Hourly Rate` | 3 |
| 250 | `work-anniversary-calc` | Years of Service & Work Anniversary Calculator | `datetime` | `business-working-days` | Tenure Calculation | `Tenure Years = Months / 12` | 1 |
| 251 | `time-duration-calc` | Time Duration & Elapsed Hours Calculator | `datetime` | `time-durations` | Elapsed Clock Time | `Duration = End Time - Start Time` | 4 |
| 252 | `military-time-calc` | Military Time 24-Hour Calculator & Math | `datetime` | `time-durations` | 24-Hour Military Time Addition | `New Time = (Start Minutes + Add Minutes) mod 1440` | 3 |
| 253 | `time-card-payroll-calc` | Weekly Employee Timecard & Overtime Calculator | `datetime` | `time-durations` | Weekly Payroll Overtime | `Gross = Regular(40) × Rate + Overtime × 1.5 × Rate` | 2 |
| 254 | `sleep-cycle-calc` | 90-Minute Sleep Cycle Alarm Calculator | `datetime` | `time-durations` | Circadian Sleep Cycle Multiplier | `Wake Times = Bedtime + (N × 90 min) + 15 min latency` | 2 |
| 255 | `electric-power-kw-calc` | Electrical Power (Watts, Volts & Amps) Calculator | `electrical` | `ohms-law-power` | Single-Phase Electric Power | `P (Watts) = V (Volts) × I (Amperes)` | 2 |
| 256 | `three-phase-power-calc` | Three-Phase Electric Power (kW & kVA) Calculator | `electrical` | `ohms-law-power` | 3-Phase AC Power | `kW = (√3 × V_LL × I × PF) / 1000` | 3 |
| 257 | `ac-apparent-reactive-power-calc` | AC Power Triangle (Real, Reactive & Apparent) Calculator | `electrical` | `ohms-law-power` | Power Triangle Geometry | `S = √(P² + Q²); PF = P / S` | 2 |
| 258 | `joules-to-watts-calc` | Energy to Power (Joules to Watts) Calculator | `electrical` | `ohms-law-power` | Joules to Watts | `Watts = Joules / Seconds` | 2 |
| 259 | `appliance-daily-kwh-calc` | Appliance Daily & Annual Energy Usage Calculator | `electrical` | `energy-consumption` | Appliance kWh and Cost | `kWh = (Watts × Hours) / 1000; Cost = kWh × Rate` | 3 |
| 260 | `electric-vehicle-charging-calc` | Electric Vehicle (EV) Charging Time & Cost Calculator | `electrical` | `energy-consumption` | EV Charge Duration | `Time = Needed kWh / (Charger kW × 0.90 efficiency)` | 5 |
| 261 | `solar-panel-output-calc` | Solar Panel Daily Energy Output Calculator | `electrical` | `energy-consumption` | Solar PV Yield | `Daily kWh = Array kW × Peak Sun Hours × 0.82` | 3 |
| 262 | `generator-sizing-calc` | Standby Generator Wattage Sizing Calculator | `electrical` | `energy-consumption` | Generator Capacity | `Sized kW = (Running Watts + Largest Motor Surge) / 1000 × 1.20` | 2 |
| 263 | `voltage-drop-awg-calc` | AWG Wire Voltage Drop Calculator | `electrical` | `wire-sizing-drop` | Single-Phase Voltage Drop | `V_drop = (2 × K × I × L) / Circular Mils (K=12.9 for copper)` | 4 |
| 264 | `wire-ampacity-calc` | NEC Conductor Wire Gauge & Ampacity Calculator | `electrical` | `wire-sizing-drop` | NEC Table 310.16 Ampacity | `14 AWG = 15A, 12 AWG = 20A, 10 AWG = 30A, 8 AWG = 40A, 6 AWG = 55A` | 1 |
| 265 | `conduit-fill-calc` | NEC Conduit Fill Capacity Calculator | `electrical` | `wire-sizing-drop` | 40% Conduit Fill Rule | `Fill % = (Total Wire Area / Conduit Area) × 100` | 2 |
| 266 | `circuit-breaker-calc` | Circuit Breaker Sizing (80% Continuous Rule) Calculator | `electrical` | `wire-sizing-drop` | NEC Breaker Rating Rule | `Rating = NonContinuous + (Continuous × 1.25)` | 2 |
| 267 | `series-parallel-resistors-calc` | Series & Parallel Resistors Calculator | `electrical` | `circuits-impedance` | Equivalent Resistance | `Series: R1 + R2; Parallel: (R1 × R2) / (R1 + R2)` | 2 |
| 268 | `capacitive-reactance-calc` | Capacitive Reactance (Xc) Calculator | `electrical` | `circuits-impedance` | Capacitive Reactance Formula | `Xc = 1 / (2 × π × f × C)` | 2 |
| 269 | `inductive-reactance-calc` | Inductive Reactance (XL) Calculator | `electrical` | `circuits-impedance` | Inductive Reactance Formula | `XL = 2 × π × f × L` | 2 |
| 270 | `led-resistor-calc` | LED Series Current Limiting Resistor Calculator | `electrical` | `circuits-impedance` | LED Dropping Resistor | `R = (V_supply - V_led) / I_led; Power = I² × R` | 3 |
| 271 | `reynolds-number-calc` | Reynolds Number Fluid Flow Calculator | `engineering` | `hydraulics-fluid` | Reynolds Number | `Re = (ρ × v × D) / μ` | 4 |
| 272 | `pipe-flow-velocity-calc` | Pipe Flow Rate & Velocity Calculator | `engineering` | `hydraulics-fluid` | Pipe Volumetric Flow | `Q = A × v = (π × D² / 4) × v` | 2 |
| 273 | `bernoulli-pressure-calc` | Bernoulli Dynamic Pressure & Velocity Head Calculator | `engineering` | `hydraulics-fluid` | Bernoulli Dynamic Pressure | `P_dyn = 0.5 × ρ × v²` | 2 |
| 274 | `hydraulic-pump-hp-calc` | Hydraulic Pump Power (HP) Calculator | `engineering` | `hydraulics-fluid` | Hydraulic Horsepower | `HP = (PSI × GPM) / (1714 × Efficiency)` | 3 |
| 275 | `poiseuille-flow-calc` | Poiseuille Pipe Flow Resistance Calculator | `engineering` | `hydraulics-fluid` | Hagen-Poiseuille Equation | `ΔP = (8 × μ × L × Q) / (π × r⁴)` | 4 |
| 276 | `torque-hp-rpm-calc` | Torque, Horsepower & RPM Calculator | `engineering` | `mechanics-energy` | Rotational Mechanical Power | `HP = (Torque lb-ft × RPM) / 5252` | 2 |
| 277 | `centrifugal-force-calc` | Centripetal Force & Acceleration Calculator | `engineering` | `mechanics-energy` | Centripetal Dynamics | `Fc = (m × v²) / r; a = v² / r` | 3 |
| 278 | `mechanical-spring-calc` | Hooke's Law Spring Force & Energy Calculator | `engineering` | `mechanics-energy` | Hooke's Law | `F = k × x; PE = 0.5 × k × x²` | 2 |
| 279 | `gear-ratio-calc` | Gear Ratio & Mechanical Advantage Calculator | `engineering` | `mechanics-energy` | Gear Train Ratio | `Ratio = N_driven / N_driver; Output Speed = Input RPM / Ratio` | 3 |
| 280 | `pendulum-period-calc` | Simple Pendulum Oscillation Period Calculator | `engineering` | `mechanics-energy` | Harmonic Pendulum Period | `T = 2 × π × √(L / g)` | 2 |
| 281 | `beam-bending-stress-calc` | Beam Bending Stress (Flexure) Calculator | `engineering` | `structural-beam` | Flexure Formula | `σ = (M × y) / I` | 3 |
| 282 | `cantilever-deflection-calc` | Cantilever Beam Deflection Calculator | `engineering` | `structural-beam` | Tip Load Deflection | `δ_max = (P × L³) / (3 × E × I)` | 4 |
| 283 | `euler-column-buckling-calc` | Euler Critical Column Buckling Calculator | `engineering` | `structural-beam` | Euler Buckling Formula | `P_cr = (π² × E × I) / (K × L)²` | 4 |
| 284 | `moment-of-inertia-calc` | Area Moment of Inertia Calculator | `engineering` | `structural-beam` | Second Moment of Area | `Rectangle: I = (b × h³) / 12; Section Modulus: S = (b × h²) / 6` | 2 |
| 285 | `heat-transfer-q-calc` | Sensible Heat Transfer (Q = mcΔT) Calculator | `engineering` | `thermodynamics` | Specific Heat Formula | `Q = m × c × (T_final - T_initial)` | 4 |
| 286 | `thermal-expansion-calc` | Linear Thermal Expansion Calculator | `engineering` | `thermodynamics` | Linear Thermal Expansion | `ΔL = α × L × ΔT` | 3 |
| 287 | `ideal-gas-law-calc` | Ideal Gas Law (PV = nRT) Solver | `engineering` | `thermodynamics` | Ideal Gas Equation | `P = (n × R × T) / V (R = 8.314 J/mol·K)` | 3 |
| 288 | `carnot-efficiency-calc` | Carnot Heat Engine Maximum Efficiency Calculator | `engineering` | `thermodynamics` | Carnot Efficiency | `η = 1 - (T_cold / T_hot) [in Kelvin]` | 2 |
| 289 | `group-split-bill-calc` | Group Restaurant Bill & Tax Split Calculator | `everyday` | `dining-tipping` | Group Dining Cost Split | `Per Person = [Subtotal × (1 + Tax% + Tip%)] / Guests` | 4 |
| 290 | `food-delivery-tip-calc` | Food Delivery Driver Tip Calculator | `everyday` | `dining-tipping` | Delivery Courier Tip Formula | `Tip = Base + ($1.50 × Miles) + Weather Buffer` | 3 |
| 291 | `bar-tab-drink-calc` | Bar Tab & Per-Drink Gratuity Calculator | `everyday` | `dining-tipping` | Bar Gratuity Benchmark | `Tip = $1-$2 per beer/wine or 20% on craft cocktails` | 2 |
| 292 | `double-discount-calc` | Stackable Double Discount & Markdown Calculator | `everyday` | `shopping-discounts` | Compound Markdown | `Final = Original × (1 - D1) × (1 - D2)` | 3 |
| 293 | `unit-price-comparison-calc` | Grocery Unit Price & Best Value Comparison | `everyday` | `shopping-discounts` | Unit Price Comparison | `Unit Price = Cost / Quantity` | 4 |
| 294 | `cash-back-rebate-calc` | Credit Card Cash Back & Rebate Calculator | `everyday` | `shopping-discounts` | Rewards Cash Back | `Cash Back = Spend × (Reward % / 100)` | 2 |
| 295 | `road-trip-fuel-calc` | Road Trip Gas Cost & Passenger Split Calculator | `everyday` | `automotive-fuel` | Road Trip Fuel Expense | `Cost = (Miles / MPG) × Gas Price; Per Person = Cost / Travelers` | 4 |
| 296 | `mpg-cost-per-mile-calc` | Fuel Economy & Cost per Mile Calculator | `everyday` | `automotive-fuel` | Cost per Mile Formula | `Cost per Mile = Gas Price / Vehicle MPG` | 3 |
| 297 | `ev-vs-gas-savings-calc` | EV vs Gas Car Annual Fuel Savings Calculator | `everyday` | `automotive-fuel` | EV vs Gasoline Savings | `Savings = Gas Car Fuel Cost - EV Charging Cost` | 4 |
| 298 | `recipe-multiplier-calc` | Recipe Serving Scaling & Multiplier Calculator | `everyday` | `cooking-baking-ratios` | Recipe Yield Scaling Factor | `Multiplier = Desired Servings / Original Servings` | 3 |
| 299 | `bakers-percentage-calc` | Baker's Percentage & Bread Hydration Calculator | `everyday` | `cooking-baking-ratios` | Baker's Hydration Ratios | `Hydration % = (Water Weight / Flour Weight) × 100 (Flour = 100%)` | 3 |
| 300 | `cooking-time-per-pound-calc` | Roast Cooking Time per Pound Calculator | `everyday` | `cooking-baking-ratios` | Oven Roasting Timeline | `Cook Time = (Weight lbs × Minutes per lb) + Resting Buffer` | 2 |

## 3. Documentation Coverage & Quality Metrics

- **Formula Metadata Coverage:** 300 / 300 (100.0%)
- **Input Schema Coverage:** 300 / 300 (100.0%)
- **Validation Rules Defined:** 100% of contracts implement input validation or domain checks.
- **Result Formatting Defined:** 100% of contracts implement `formatResult` with primary numeric values and structured secondary breakdowns.

## 4. Identified Documentation Gaps & Risk Assessment

1. **Edge-Case Domain Bounds:** While all 300 calculators validate basic positive/non-negative ranges, advanced thermodynamic and structural engineering equations require continuous monitoring for physical domain boundaries (e.g., division by zero in fluid viscosity or extreme column buckling lengths).
2. **Unit Consistency:** Most engineering and electrical calculators assume standard imperial or SI units as defined in input labels; explicit unit conversion toggles are delegated to standardized input schemas.
3. **Precision Rounding:** Financial calculators utilize `PrecisionEngine.roundFinancial()`, while scientific calculators maintain double-precision floating point accuracy.

## 5. Recommended Priorities for Phase 7B (Independent Accuracy Audit)

1. Execute independent mathematical oracle validation against all 300 expected-result fixtures.
2. Perform boundary and stress test validation (zero inputs, upper limits, degenerate geometric shapes).
3. Verify numerical stability and rounding precision across financial, scientific, and engineering domains.
4. Finalize Phase 7 audit certification report with zero unresolved defects.