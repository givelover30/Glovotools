import { OracleDefinition } from '../types.ts';

export const GEOMETRY_TRIG_ORACLES: Record<string, OracleDefinition> = {
  // 1. Area Calculator (Base)
  'area-calc': {
    id: 'area-calc',
    name: 'Area & Perimeter Calculator (2D)',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => {
      const w = Number(inp.width);
      const l = Number(inp.length);
      return w * l;
    },
    testCases: [
      { name: 'Rectangle 12 x 8 = 96', inputs: { shape: 'rectangle', width: 12, length: 8 }, expectedPrimary: 96 }
    ]
  },

  // 2. Volume Calculator (Base)
  'volume-calc': {
    id: 'volume-calc',
    name: '3D Solid Volume & Surface Area',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => {
      const l = Number(inp.length), w = Number(inp.width), h = Number(inp.height);
      return l * w * h;
    },
    testCases: [
      { name: 'Box 10 x 5 x 4 = 200', inputs: { shape: 'rectangular_prism', length: 10, width: 5, height: 4 }, expectedPrimary: 200 }
    ]
  },

  // 3. Perimeter Calculator
  'perimeter-calculator': {
    id: 'perimeter-calculator',
    name: '2D Perimeter Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => 2 * (Number(inp.sideA) + Number(inp.sideB)),
    testCases: [
      { name: 'Rectangle 10 by 5 perimeter = 30', inputs: { shape: 'rectangle', sideA: 10, sideB: 5 }, expectedPrimary: 30 }
    ]
  },

  // 4. Circle Area & Perimeter
  'circle-area-perimeter': {
    id: 'circle-area-perimeter',
    name: 'Circle Area, Circumference & Diameter',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => Math.PI * Math.pow(Number(inp.radius), 2),
    testCases: [
      { name: 'Radius 10 -> Area = 314.159', inputs: { radius: 10 }, expectedPrimary: Math.PI * 100, tolerance: 0.01 }
    ]
  },

  // 5. Trapezoid Area
  'trapezoid-area': {
    id: 'trapezoid-area',
    name: 'Trapezoid Area Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => 0.5 * (Number(inp.baseA) + Number(inp.baseB)) * Number(inp.height),
    testCases: [
      { name: 'Bases 10, 6, height 4 -> 32', inputs: { baseA: 10, baseB: 6, height: 4 }, expectedPrimary: 32 }
    ]
  },

  // 6. Rhombus Area
  'rhombus-area': {
    id: 'rhombus-area',
    name: 'Rhombus Area & Perimeter Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => 0.5 * Number(inp.d1) * Number(inp.d2),
    testCases: [
      { name: 'Diagonals 8 and 6 -> Area = 24', inputs: { d1: 8, d2: 6 }, expectedPrimary: 24 }
    ]
  },

  // 7. Parallelogram
  'parallelogram-calc': {
    id: 'parallelogram-calc',
    name: 'Parallelogram Area & Perimeter',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => Number(inp.base) * Number(inp.height),
    testCases: [
      { name: 'Base 12, height 5 -> Area = 60', inputs: { base: 12, height: 5, side: 6 }, expectedPrimary: 60 }
    ]
  },

  // 8. Regular Polygon
  'regular-polygon-area': {
    id: 'regular-polygon-area',
    name: 'Regular Polygon Area Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => {
      const n = Number(inp.sides), s = Number(inp.sideLength);
      return (n * Math.pow(s, 2)) / (4 * Math.tan(Math.PI / n));
    },
    testCases: [
      { name: 'Hexagon side 6 -> Area = 93.53', inputs: { sides: 6, sideLength: 6 }, expectedPrimary: (6 * 36) / (4 * Math.tan(Math.PI / 6)), tolerance: 0.05 }
    ]
  },

  // 9. Ellipse Area & Perimeter
  'ellipse-area-perimeter': {
    id: 'ellipse-area-perimeter',
    name: 'Ellipse Area & Circumference',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    independentCalculate: (inp) => Math.PI * Number(inp.semiMajor) * Number(inp.semiMinor),
    testCases: [
      { name: 'a=5, b=3 -> Area = 47.12', inputs: { semiMajor: 5, semiMinor: 3 }, expectedPrimary: Math.PI * 15, tolerance: 0.01 }
    ]
  },

  // 10. Cylinder
  'cylinder-volume-surface': {
    id: 'cylinder-volume-surface',
    name: 'Cylinder Volume & Surface Area',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => Math.PI * Math.pow(Number(inp.radius), 2) * Number(inp.height),
    testCases: [
      { name: 'r=4, h=10 -> Vol = 502.65', inputs: { radius: 4, height: 10 }, expectedPrimary: Math.PI * 16 * 10, tolerance: 0.01 }
    ]
  },

  // 11. Sphere
  'sphere-volume-surface': {
    id: 'sphere-volume-surface',
    name: 'Sphere Volume & Surface Area',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => (4 / 3) * Math.PI * Math.pow(Number(inp.radius), 3),
    testCases: [
      { name: 'r=3 -> Vol = 113.10', inputs: { radius: 3 }, expectedPrimary: (4 / 3) * Math.PI * 27, tolerance: 0.01 }
    ]
  },

  // 12. Cone
  'cone-volume-surface': {
    id: 'cone-volume-surface',
    name: 'Cone Volume & Slant Height',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => (1 / 3) * Math.PI * Math.pow(Number(inp.radius), 2) * Number(inp.height),
    testCases: [
      { name: 'r=3, h=4 -> Vol = 37.70', inputs: { radius: 3, height: 4 }, expectedPrimary: (1 / 3) * Math.PI * 9 * 4, tolerance: 0.01 }
    ]
  },

  // 13. Pyramid
  'pyramid-volume-calc': {
    id: 'pyramid-volume-calc',
    name: 'Square Pyramid Volume & Surface Area',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => (1 / 3) * Math.pow(Number(inp.baseEdge), 2) * Number(inp.height),
    testCases: [
      { name: 'Base edge 6, height 10 -> Vol = 120', inputs: { baseEdge: 6, height: 10 }, expectedPrimary: 120 }
    ]
  },

  // 14. Triangular Prism
  'triangular-prism-calc': {
    id: 'triangular-prism-calc',
    name: 'Triangular Prism Volume & Area',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => 0.5 * Number(inp.triangleBase) * Number(inp.triangleHeight) * Number(inp.prismLength),
    testCases: [
      { name: 'b=4, h=3, length=10 -> Vol = 60', inputs: { triangleBase: 4, triangleHeight: 3, prismLength: 10 }, expectedPrimary: 60 }
    ]
  },

  // 15. Torus
  'torus-volume-surface': {
    id: 'torus-volume-surface',
    name: 'Torus Volume & Surface Area',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    independentCalculate: (inp) => 2 * Math.pow(Math.PI, 2) * Number(inp.majorR) * Math.pow(Number(inp.minorR), 2),
    testCases: [
      { name: 'R=10, r=2 -> Vol = 789.57', inputs: { majorR: 10, minorR: 2 }, expectedPrimary: 2 * Math.PI * Math.PI * 10 * 4, tolerance: 0.05 }
    ]
  },

  // 16. Circle Sector Area
  'circle-sector-area': {
    id: 'circle-sector-area',
    name: 'Circle Sector Area Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    independentCalculate: (inp) => 0.5 * Math.pow(Number(inp.radius), 2) * (Number(inp.angleDegrees) * (Math.PI / 180)),
    testCases: [
      { name: 'r=6, angle=60 -> Area = 18.85', inputs: { radius: 6, angleDegrees: 60 }, expectedPrimary: (60 / 360) * Math.PI * 36, tolerance: 0.01 }
    ]
  },

  // 17. Arc Length
  'arc-length-calc': {
    id: 'arc-length-calc',
    name: 'Arc Length Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    independentCalculate: (inp) => Number(inp.radius) * (Number(inp.angleDegrees) * (Math.PI / 180)),
    testCases: [
      { name: 'r=10, angle=90 -> Arc = 15.71', inputs: { radius: 10, angleDegrees: 90 }, expectedPrimary: (90 / 360) * 2 * Math.PI * 10, tolerance: 0.01 }
    ]
  },

  // 18. Chord Length
  'chord-length-calc': {
    id: 'chord-length-calc',
    name: 'Circle Chord Length Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    independentCalculate: (inp) => 2 * Number(inp.radius) * Math.sin((Number(inp.angleDegrees) * (Math.PI / 180)) / 2),
    testCases: [
      { name: 'r=10, angle=60 -> chord = 10', inputs: { radius: 10, angleDegrees: 60 }, expectedPrimary: 10, tolerance: 0.01 }
    ]
  },

  // 19. Circle Segment
  'circle-segment-calc': {
    id: 'circle-segment-calc',
    name: 'Circle Segment Area Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    independentCalculate: (inp) => {
      const r = Number(inp.radius);
      const rad = Number(inp.angleDegrees) * (Math.PI / 180);
      return 0.5 * Math.pow(r, 2) * (rad - Math.sin(rad));
    },
    testCases: [
      { name: 'r=10, angle=90 -> 28.54', inputs: { radius: 10, angleDegrees: 90 }, expectedPrimary: 0.5 * 100 * (Math.PI / 2 - 1), tolerance: 0.01 }
    ]
  },

  // 20. 2D Distance
  'cartesian-distance-2d': {
    id: 'cartesian-distance-2d',
    name: '2D Cartesian Distance Calculator',
    category: 'geometry',
    subcategoryId: 'coordinate-geometry',
    independentCalculate: (inp) => Math.hypot(Number(inp.x2) - Number(inp.x1), Number(inp.y2) - Number(inp.y1)),
    testCases: [
      { name: '(1,1) to (4,5) = 5', inputs: { x1: 1, y1: 1, x2: 4, y2: 5 }, expectedPrimary: 5 }
    ]
  },

  // 21. 2D Midpoint
  'cartesian-midpoint-2d': {
    id: 'cartesian-midpoint-2d',
    name: '2D Coordinate Midpoint Calculator',
    category: 'geometry',
    subcategoryId: 'coordinate-geometry',
    independentCalculate: (inp) => (Number(inp.x1) + Number(inp.x2)) / 2,
    testCases: [
      { name: '(2,4) and (6,8) -> midX = 4', inputs: { x1: 2, y1: 4, x2: 6, y2: 8 }, expectedPrimary: 4 }
    ]
  },

  // 22. Triangle Centroid
  'triangle-centroid-calc': {
    id: 'triangle-centroid-calc',
    name: 'Triangle Centroid (Geometric Center)',
    category: 'geometry',
    subcategoryId: 'coordinate-geometry',
    independentCalculate: (inp) => (Number(inp.x1) + Number(inp.x2) + Number(inp.x3)) / 3,
    testCases: [
      { name: 'x-coords 0, 3, 6 -> centroidX = 3', inputs: { x1: 0, y1: 0, x2: 3, y2: 3, x3: 6, y3: 0 }, expectedPrimary: 3 }
    ]
  },

  // ==========================================
  // TRIGONOMETRY CALCULATORS (12)
  // ==========================================

  // 23. Pythagorean Theorem (Base)
  'pythagorean-theorem': {
    id: 'pythagorean-theorem',
    name: 'Pythagorean Theorem Calculator',
    category: 'trigonometry',
    subcategoryId: 'right-triangles',
    independentCalculate: (inp) => Math.sqrt(Math.pow(Number(inp.a), 2) + Math.pow(Number(inp.b), 2)),
    testCases: [
      { name: '3-4-5 Triangle', inputs: { a: 3, b: 4 }, expectedPrimary: 5 },
      { name: '5-12-13 Triangle', inputs: { a: 5, b: 12 }, expectedPrimary: 13 }
    ]
  },

  // 24. Right Triangle Trig (Base)
  'right-triangle-trig': {
    id: 'right-triangle-trig',
    name: 'Right Triangle Trig & Angle Solver',
    category: 'trigonometry',
    subcategoryId: 'right-triangles',
    independentCalculate: (inp) => Math.sqrt(Math.pow(Number(inp.a), 2) + Math.pow(Number(inp.b), 2)),
    testCases: [
      { name: 'Legs 6 and 8 -> Hypotenuse 10', inputs: { a: 6, b: 8 }, expectedPrimary: 10 }
    ]
  },

  // 25. Sin Cos Tan
  'sin-cos-tan-calc': {
    id: 'sin-cos-tan-calc',
    name: 'Trig Functions (sin, cos, tan)',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    independentCalculate: (inp) => Math.sin(Number(inp.angleDegrees) * (Math.PI / 180)),
    testCases: [
      { name: 'sin(30°) = 0.5', inputs: { angleDegrees: 30 }, expectedPrimary: 0.5, tolerance: 0.001 },
      { name: 'sin(90°) = 1.0', inputs: { angleDegrees: 90 }, expectedPrimary: 1.0, isBoundary: true }
    ]
  },

  // 26. Sec Csc Cot
  'sec-csc-cot-calc': {
    id: 'sec-csc-cot-calc',
    name: 'Reciprocal Trig (sec, csc, cot)',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    independentCalculate: (inp) => 1 / Math.cos(Number(inp.angleDegrees) * (Math.PI / 180)),
    testCases: [
      { name: 'sec(60°) = 2.0', inputs: { angleDegrees: 60 }, expectedPrimary: 2.0, tolerance: 0.001 }
    ]
  },

  // 27. Inverse Trig
  'inverse-trig-calc': {
    id: 'inverse-trig-calc',
    name: 'Inverse Trig (arcsin, arccos, arctan)',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    independentCalculate: (inp) => Math.asin(Number(inp.ratioValue)) * (180 / Math.PI),
    testCases: [
      { name: 'arcsin(0.5) = 30°', inputs: { ratioValue: 0.5 }, expectedPrimary: 30, tolerance: 0.01 }
    ]
  },

  // 28. Degrees to Radians
  'degrees-radians-calc': {
    id: 'degrees-radians-calc',
    name: 'Degrees to Radians Angle Converter',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    independentCalculate: (inp) => Number(inp.degrees) * (Math.PI / 180),
    testCases: [
      { name: '180° = π rad', inputs: { degrees: 180 }, expectedPrimary: Math.PI, tolerance: 0.001 }
    ]
  },

  // 29. Law of Sines
  'law-of-sines-calc': {
    id: 'law-of-sines-calc',
    name: 'Law of Sines Triangle Solver',
    category: 'trigonometry',
    subcategoryId: 'oblique-triangles',
    independentCalculate: (inp) => {
      const a = Number(inp.sideA);
      const A = Number(inp.angleA) * (Math.PI / 180);
      const B = Number(inp.angleB) * (Math.PI / 180);
      return (a * Math.sin(B)) / Math.sin(A);
    },
    testCases: [
      { name: 'a=10, A=30°, B=45° -> b = 14.14', inputs: { sideA: 10, angleA: 30, angleB: 45 }, expectedPrimary: (10 * Math.sin(Math.PI / 4)) / Math.sin(Math.PI / 6), tolerance: 0.01 }
    ]
  },

  // 30. Law of Cosines
  'law-of-cosines-calc': {
    id: 'law-of-cosines-calc',
    name: 'Law of Cosines (SAS / SSS) Solver',
    category: 'trigonometry',
    subcategoryId: 'oblique-triangles',
    independentCalculate: (inp) => {
      const a = Number(inp.sideA);
      const b = Number(inp.sideB);
      const C = Number(inp.angleC) * (Math.PI / 180);
      return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) - 2 * a * b * Math.cos(C));
    },
    testCases: [
      { name: 'a=5, b=7, C=60° -> c = 6.24', inputs: { sideA: 5, sideB: 7, angleC: 60 }, expectedPrimary: Math.sqrt(25 + 49 - 35), tolerance: 0.01 }
    ]
  },

  // 31. Heron's Formula
  'heron-triangle-area': {
    id: 'heron-triangle-area',
    name: 'Heron’s Formula Triangle Area',
    category: 'trigonometry',
    subcategoryId: 'oblique-triangles',
    independentCalculate: (inp) => {
      const a = Number(inp.a), b = Number(inp.b), c = Number(inp.c);
      const s = (a + b + c) / 2;
      return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    },
    testCases: [
      { name: '3-4-5 Triangle Area = 6', inputs: { a: 3, b: 4, c: 5 }, expectedPrimary: 6 }
    ]
  },

  // 32. Double Angle
  'double-angle-calc': {
    id: 'double-angle-calc',
    name: 'Double Angle Formulas (sin 2θ, cos 2θ)',
    category: 'trigonometry',
    subcategoryId: 'identities-harmonics',
    independentCalculate: (inp) => Math.sin(2 * Number(inp.angleDegrees) * (Math.PI / 180)),
    testCases: [
      { name: 'sin(2 * 15°) = sin(30°) = 0.5', inputs: { angleDegrees: 15 }, expectedPrimary: 0.5, tolerance: 0.001 }
    ]
  },

  // 33. Half Angle
  'half-angle-calc': {
    id: 'half-angle-calc',
    name: 'Half Angle Formulas (sin θ/2, cos θ/2)',
    category: 'trigonometry',
    subcategoryId: 'identities-harmonics',
    independentCalculate: (inp) => Math.sin((Number(inp.angleDegrees) * (Math.PI / 180)) / 2),
    testCases: [
      { name: 'sin(60°/2) = sin(30°) = 0.5', inputs: { angleDegrees: 60 }, expectedPrimary: 0.5, tolerance: 0.001 }
    ]
  },

  // 34. Polar to Cartesian
  'polar-to-cartesian-calc': {
    id: 'polar-to-cartesian-calc',
    name: 'Polar to Cartesian Coordinates',
    category: 'trigonometry',
    subcategoryId: 'identities-harmonics',
    independentCalculate: (inp) => Number(inp.r) * Math.cos(Number(inp.thetaDeg) * (Math.PI / 180)),
    testCases: [
      { name: 'r=10, theta=0° -> x = 10', inputs: { r: 10, thetaDeg: 0 }, expectedPrimary: 10 },
      { name: 'r=10, theta=90° -> x = 0', inputs: { r: 10, thetaDeg: 90 }, expectedPrimary: 0, tolerance: 0.001, isBoundary: true }
    ]
  }
};
