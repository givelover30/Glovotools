import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH2_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Circle Calculator
  {
    id: 'circle-calculator',
    name: 'Circle Area & Circumference Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    formulaMeta: {
      formulaName: 'Circle Planar Geometry',
      formulaExpression: 'A = πr², C = 2πr, d = 2r',
      variables: [{ symbol: 'r', name: 'Radius' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius (r)', type: 'number', required: true, defaultValue: 7, min: 0 }
      ]
    },
    validate: (inputs: { radius: number }) => {
      if (inputs.radius <= 0) return [{ field: 'radius', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Radius must be > 0.' }];
      return [];
    },
    calculate: (inputs: { radius: number }) => {
      const area = FormulaEngine.circleArea(inputs.radius);
      const circumference = FormulaEngine.circleCircumference(inputs.radius);
      const diameter = PrecisionEngine.clean(inputs.radius * 2);
      return { area, circumference, diameter };
    },
    formatResult: (result: { area: number; circumference: number; diameter: number }) => ({
      primary: {
        label: 'Circle Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Circumference (Perimeter)', value: `${ResultFormatter.formatDecimal(result.circumference)} units` },
        { label: 'Diameter', value: `${ResultFormatter.formatDecimal(result.diameter)} units` }
      ]
    })
  },

  // 2. Triangle Area (Heron's & Standard)
  {
    id: 'triangle-area',
    name: "Triangle Area & Heron's Formula Calculator",
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: "Heron's Formula & Standard Area",
      formulaExpression: 'A = √(s(s-a)(s-b)(s-c)), s = (a+b+c)/2',
      variables: [{ symbol: 'a, b, c', name: 'Sides' }]
    },
    inputSchema: {
      fields: [
        { name: 'sideA', label: 'Side a', type: 'number', required: true, defaultValue: 5, min: 0 },
        { name: 'sideB', label: 'Side b', type: 'number', required: true, defaultValue: 6, min: 0 },
        { name: 'sideC', label: 'Side c', type: 'number', required: true, defaultValue: 7, min: 0 }
      ]
    },
    validate: (inputs: { sideA: number; sideB: number; sideC: number }) => {
      const { sideA, sideB, sideC } = inputs;
      if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) {
        return [{ field: 'sideA', code: 'MATHEMATICAL_DOMAIN_ERROR', message: 'Triangle inequality violated: sum of any 2 sides must exceed 3rd side.' }];
      }
      return [];
    },
    calculate: (inputs: { sideA: number; sideB: number; sideC: number }) => {
      const perimeter = PrecisionEngine.clean(inputs.sideA + inputs.sideB + inputs.sideC);
      const s = perimeter / 2;
      const area = PrecisionEngine.clean(Math.sqrt(s * (s - inputs.sideA) * (s - inputs.sideB) * (s - inputs.sideC)));
      return { area, perimeter, semiPerimeter: s };
    },
    formatResult: (result: { area: number; perimeter: number }) => ({
      primary: {
        label: 'Triangle Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Perimeter', value: `${ResultFormatter.formatDecimal(result.perimeter)} units` }
      ]
    })
  },

  // 3. Trapezoid Area
  {
    id: 'trapezoid-area',
    name: 'Trapezoid Area & Perimeter Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: 'Trapezoid Area',
      formulaExpression: 'A = ((a + b) / 2) * h',
      variables: [{ symbol: 'a, b', name: 'Parallel bases' }, { symbol: 'h', name: 'Height' }]
    },
    inputSchema: {
      fields: [
        { name: 'baseA', label: 'Parallel Base a', type: 'number', required: true, defaultValue: 8, min: 0 },
        { name: 'baseB', label: 'Parallel Base b', type: 'number', required: true, defaultValue: 14, min: 0 },
        { name: 'height', label: 'Height (h)', type: 'number', required: true, defaultValue: 6, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { baseA: number; baseB: number; height: number }) => {
      const area = PrecisionEngine.clean(((inputs.baseA + inputs.baseB) / 2) * inputs.height);
      const median = PrecisionEngine.clean((inputs.baseA + inputs.baseB) / 2);
      return { area, median };
    },
    formatResult: (result: { area: number; median: number }) => ({
      primary: {
        label: 'Trapezoid Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Midsegment (Median)', value: `${ResultFormatter.formatDecimal(result.median)} units` }
      ]
    })
  },

  // 4. Parallelogram Area
  {
    id: 'parallelogram-area',
    name: 'Parallelogram Area Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: 'Parallelogram Area',
      formulaExpression: 'A = b * h, P = 2(b + s)',
      variables: [{ symbol: 'b', name: 'Base' }, { symbol: 'h', name: 'Height' }]
    },
    inputSchema: {
      fields: [
        { name: 'base', label: 'Base (b)', type: 'number', required: true, defaultValue: 12, min: 0 },
        { name: 'height', label: 'Height (h)', type: 'number', required: true, defaultValue: 7, min: 0 },
        { name: 'side', label: 'Slant Side (s)', type: 'number', required: false, defaultValue: 9, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { base: number; height: number; side?: number }) => {
      const area = PrecisionEngine.clean(inputs.base * inputs.height);
      const s = inputs.side || inputs.height;
      const perimeter = PrecisionEngine.clean(2 * (inputs.base + s));
      return { area, perimeter };
    },
    formatResult: (result: { area: number; perimeter: number }) => ({
      primary: {
        label: 'Parallelogram Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Perimeter', value: `${ResultFormatter.formatDecimal(result.perimeter)} units` }
      ]
    })
  },

  // 5. Rhombus Area
  {
    id: 'rhombus-area',
    name: 'Rhombus Area & Diagonals Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: 'Rhombus Diagonals Area',
      formulaExpression: 'A = (d₁ * d₂) / 2, side = √((d₁/2)² + (d₂/2)²)',
      variables: [{ symbol: 'd₁, d₂', name: 'Diagonals' }]
    },
    inputSchema: {
      fields: [
        { name: 'diagonal1', label: 'Diagonal d₁', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'diagonal2', label: 'Diagonal d₂', type: 'number', required: true, defaultValue: 16, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { diagonal1: number; diagonal2: number }) => {
      const area = PrecisionEngine.clean((inputs.diagonal1 * inputs.diagonal2) / 2);
      const half1 = inputs.diagonal1 / 2;
      const half2 = inputs.diagonal2 / 2;
      const side = PrecisionEngine.clean(Math.sqrt(half1 * half1 + half2 * half2));
      const perimeter = PrecisionEngine.clean(4 * side);
      return { area, side, perimeter };
    },
    formatResult: (result: { area: number; side: number; perimeter: number }) => ({
      primary: {
        label: 'Rhombus Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Side Length', value: `${ResultFormatter.formatDecimal(result.side)} units` },
        { label: 'Perimeter', value: `${ResultFormatter.formatDecimal(result.perimeter)} units` }
      ]
    })
  },

  // 6. Ellipse Area
  {
    id: 'ellipse-area',
    name: 'Ellipse Area & Perimeter Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: 'Ellipse Area & Ramanujan Perimeter',
      formulaExpression: 'A = πab, P ≈ π[3(a+b) - √((3a+b)(a+3b))]',
      variables: [{ symbol: 'a', name: 'Semi-major' }, { symbol: 'b', name: 'Semi-minor' }]
    },
    inputSchema: {
      fields: [
        { name: 'semiA', label: 'Semi-major axis (a)', type: 'number', required: true, defaultValue: 8, min: 0 },
        { name: 'semiB', label: 'Semi-minor axis (b)', type: 'number', required: true, defaultValue: 5, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { semiA: number; semiB: number }) => {
      const area = PrecisionEngine.clean(Math.PI * inputs.semiA * inputs.semiB);
      const a = inputs.semiA;
      const b = inputs.semiB;
      const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
      const perimeter = PrecisionEngine.clean(Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h))));
      return { area, perimeter };
    },
    formatResult: (result: { area: number; perimeter: number }) => ({
      primary: {
        label: 'Ellipse Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Circumference (Perimeter)', value: `${ResultFormatter.formatDecimal(result.perimeter)} units` }
      ]
    })
  },

  // 7. Regular Polygon
  {
    id: 'regular-polygon',
    name: 'Regular Polygon Calculator',
    category: 'geometry',
    subcategoryId: 'plane-geometry-area',
    formulaMeta: {
      formulaName: 'Equilateral n-gon Area',
      formulaExpression: 'A = (n * s²) / (4 * tan(π/n))',
      variables: [{ symbol: 'n', name: 'Sides' }, { symbol: 's', name: 'Side length' }]
    },
    inputSchema: {
      fields: [
        { name: 'sides', label: 'Number of Sides (n)', type: 'integer', required: true, defaultValue: 6, min: 3 },
        { name: 'sideLength', label: 'Side Length (s)', type: 'number', required: true, defaultValue: 4, min: 0 }
      ]
    },
    validate: (inputs: { sides: number }) => {
      if (inputs.sides < 3) return [{ field: 'sides', code: 'RANGE_OUT_OF_BOUNDS', message: 'Polygon must have at least 3 sides.' }];
      return [];
    },
    calculate: (inputs: { sides: number; sideLength: number }) => {
      const n = inputs.sides;
      const s = inputs.sideLength;
      const apothem = PrecisionEngine.clean(s / (2 * Math.tan(Math.PI / n)));
      const perimeter = PrecisionEngine.clean(n * s);
      const area = PrecisionEngine.clean((perimeter * apothem) / 2);
      return { area, perimeter, apothem };
    },
    formatResult: (result: { area: number; perimeter: number; apothem: number }) => ({
      primary: {
        label: 'Polygon Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Perimeter', value: `${ResultFormatter.formatDecimal(result.perimeter)} units` },
        { label: 'Apothem', value: `${ResultFormatter.formatDecimal(result.apothem)} units` }
      ]
    })
  },

  // 8. Sector Area
  {
    id: 'sector-area',
    name: 'Circle Sector Area Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    formulaMeta: {
      formulaName: 'Circular Sector Area',
      formulaExpression: 'A = (θ / 360) * πr²',
      variables: [{ symbol: 'r', name: 'Radius' }, { symbol: 'θ', name: 'Central angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius (r)', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'angleDegrees', label: 'Angle (degrees)', type: 'number', required: true, defaultValue: 60, min: 0, max: 360 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { radius: number; angleDegrees: number }) => {
      const fraction = inputs.angleDegrees / 360;
      const area = PrecisionEngine.clean(fraction * Math.PI * inputs.radius * inputs.radius);
      const arc = PrecisionEngine.clean(fraction * 2 * Math.PI * inputs.radius);
      const perimeter = PrecisionEngine.clean(arc + 2 * inputs.radius);
      return { area, arc, perimeter };
    },
    formatResult: (result: { area: number; arc: number; perimeter: number }) => ({
      primary: {
        label: 'Sector Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Arc Length', value: `${ResultFormatter.formatDecimal(result.arc)} units` },
        { label: 'Sector Perimeter', value: `${ResultFormatter.formatDecimal(result.perimeter)} units` }
      ]
    })
  },

  // 9. Arc Length
  {
    id: 'arc-length',
    name: 'Circle Arc Length Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    formulaMeta: {
      formulaName: 'Arc Curvilinear Distance',
      formulaExpression: 's = r * θ_rad',
      variables: [{ symbol: 'r', name: 'Radius' }, { symbol: 'θ', name: 'Angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Circle Radius', type: 'number', required: true, defaultValue: 15, min: 0 },
        { name: 'angleDegrees', label: 'Central Angle (Degrees)', type: 'number', required: true, defaultValue: 45, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { radius: number; angleDegrees: number }) => {
      const s = PrecisionEngine.clean((inputs.angleDegrees / 360) * 2 * Math.PI * inputs.radius);
      return { arcLength: s };
    },
    formatResult: (result: { arcLength: number }) => ({
      primary: {
        label: 'Arc Length (s)',
        value: `${ResultFormatter.formatDecimal(result.arcLength)} units`,
        numericValue: result.arcLength
      }
    })
  },

  // 10. Circle Segment Area
  {
    id: 'circle-segment',
    name: 'Circular Segment Area Calculator',
    category: 'geometry',
    subcategoryId: 'circles-arcs',
    formulaMeta: {
      formulaName: 'Circular Segment Area',
      formulaExpression: 'A = ½r²(θ_rad - sin(θ_rad))',
      variables: [{ symbol: 'r', name: 'Radius' }, { symbol: 'θ', name: 'Angle in radians' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius (r)', type: 'number', required: true, defaultValue: 8, min: 0 },
        { name: 'angleDegrees', label: 'Central Angle (Degrees)', type: 'number', required: true, defaultValue: 90, min: 0, max: 360 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { radius: number; angleDegrees: number }) => {
      const rad = FormulaEngine.degToRad(inputs.angleDegrees);
      const area = PrecisionEngine.clean(0.5 * inputs.radius * inputs.radius * (rad - Math.sin(rad)));
      const chord = PrecisionEngine.clean(2 * inputs.radius * Math.sin(rad / 2));
      return { area, chord };
    },
    formatResult: (result: { area: number; chord: number }) => ({
      primary: {
        label: 'Segment Area',
        value: `${ResultFormatter.formatDecimal(result.area)} sq units`,
        numericValue: result.area
      },
      secondary: [
        { label: 'Chord Length', value: `${ResultFormatter.formatDecimal(result.chord)} units` }
      ]
    })
  },

  // 11. Rectangular Prism (Box)
  {
    id: 'rectangular-prism',
    name: 'Rectangular Prism (Box) Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Cuboid Volume & Surface Area',
      formulaExpression: 'V = lwh, SA = 2(lw + lh + wh), d = √(l² + w² + h²)',
      variables: [{ symbol: 'l, w, h', name: 'Dimensions' }]
    },
    inputSchema: {
      fields: [
        { name: 'length', label: 'Length', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'width', label: 'Width', type: 'number', required: true, defaultValue: 5, min: 0 },
        { name: 'height', label: 'Height', type: 'number', required: true, defaultValue: 4, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { length: number; width: number; height: number }) => {
      const volume = FormulaEngine.boxVolume(inputs.length, inputs.width, inputs.height);
      const surfaceArea = FormulaEngine.boxSurfaceArea(inputs.length, inputs.width, inputs.height);
      const diagonal = PrecisionEngine.clean(Math.sqrt(inputs.length ** 2 + inputs.width ** 2 + inputs.height ** 2));
      return { volume, surfaceArea, diagonal };
    },
    formatResult: (result: { volume: number; surfaceArea: number; diagonal: number }) => ({
      primary: {
        label: 'Box Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Total Surface Area', value: `${ResultFormatter.formatDecimal(result.surfaceArea)} sq units` },
        { label: 'Space Diagonal', value: `${ResultFormatter.formatDecimal(result.diagonal)} units` }
      ]
    })
  },

  // 12. Cylinder Calculator
  {
    id: 'cylinder-calc',
    name: 'Cylinder Volume & Surface Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Cylinder Solid Geometry',
      formulaExpression: 'V = πr²h, Lateral = 2πrh, Total SA = 2πr(r + h)',
      variables: [{ symbol: 'r', name: 'Radius' }, { symbol: 'h', name: 'Height' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius (r)', type: 'number', required: true, defaultValue: 4, min: 0 },
        { name: 'height', label: 'Height (h)', type: 'number', required: true, defaultValue: 10, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { radius: number; height: number }) => {
      const volume = FormulaEngine.cylinderVolume(inputs.radius, inputs.height);
      const totalSA = FormulaEngine.cylinderSurfaceArea(inputs.radius, inputs.height);
      const lateralSA = PrecisionEngine.clean(2 * Math.PI * inputs.radius * inputs.height);
      return { volume, totalSA, lateralSA };
    },
    formatResult: (result: { volume: number; totalSA: number; lateralSA: number }) => ({
      primary: {
        label: 'Cylinder Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Total Surface Area', value: `${ResultFormatter.formatDecimal(result.totalSA)} sq units` },
        { label: 'Lateral Surface Area', value: `${ResultFormatter.formatDecimal(result.lateralSA)} sq units` }
      ]
    })
  },

  // 13. Sphere Calculator
  {
    id: 'sphere-calc',
    name: 'Sphere Volume & Surface Area Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Sphere Solid Geometry',
      formulaExpression: 'V = (4/3)πr³, SA = 4πr²',
      variables: [{ symbol: 'r', name: 'Radius' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius (r)', type: 'number', required: true, defaultValue: 6, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { radius: number }) => {
      const volume = FormulaEngine.sphereVolume(inputs.radius);
      const surfaceArea = FormulaEngine.sphereSurfaceArea(inputs.radius);
      return { volume, surfaceArea };
    },
    formatResult: (result: { volume: number; surfaceArea: number }) => ({
      primary: {
        label: 'Sphere Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Surface Area', value: `${ResultFormatter.formatDecimal(result.surfaceArea)} sq units` }
      ]
    })
  },

  // 14. Cone Calculator
  {
    id: 'cone-calc',
    name: 'Cone Volume & Slant Height Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Right Circular Cone Geometry',
      formulaExpression: 'V = (1/3)πr²h, s = √(r² + h²), SA = πr(r + s)',
      variables: [{ symbol: 'r', name: 'Base radius' }, { symbol: 'h', name: 'Height' }]
    },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Base Radius (r)', type: 'number', required: true, defaultValue: 5, min: 0 },
        { name: 'height', label: 'Height (h)', type: 'number', required: true, defaultValue: 12, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { radius: number; height: number }) => {
      const volume = FormulaEngine.coneVolume(inputs.radius, inputs.height);
      const slantHeight = PrecisionEngine.clean(Math.sqrt(inputs.radius ** 2 + inputs.height ** 2));
      const totalSA = PrecisionEngine.clean(Math.PI * inputs.radius * (inputs.radius + slantHeight));
      return { volume, slantHeight, totalSA };
    },
    formatResult: (result: { volume: number; slantHeight: number; totalSA: number }) => ({
      primary: {
        label: 'Cone Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Slant Height (s)', value: `${ResultFormatter.formatDecimal(result.slantHeight)} units` },
        { label: 'Surface Area', value: `${ResultFormatter.formatDecimal(result.totalSA)} sq units` }
      ]
    })
  },

  // 15. Square Pyramid
  {
    id: 'pyramid-calc',
    name: 'Square Pyramid Volume & Surface Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Square Pyramid Geometry',
      formulaExpression: 'V = (1/3)a²h, SA = a² + 2a√(h² + (a/2)²)',
      variables: [{ symbol: 'a', name: 'Base edge' }, { symbol: 'h', name: 'Height' }]
    },
    inputSchema: {
      fields: [
        { name: 'baseEdge', label: 'Base Edge (a)', type: 'number', required: true, defaultValue: 8, min: 0 },
        { name: 'height', label: 'Pyramid Height (h)', type: 'number', required: true, defaultValue: 9, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { baseEdge: number; height: number }) => {
      const a = inputs.baseEdge;
      const h = inputs.height;
      const volume = PrecisionEngine.clean((1 / 3) * a * a * h);
      const slantHeight = PrecisionEngine.clean(Math.sqrt(h * h + (a / 2) * (a / 2)));
      const surfaceArea = PrecisionEngine.clean(a * a + 2 * a * slantHeight);
      return { volume, surfaceArea, slantHeight };
    },
    formatResult: (result: { volume: number; surfaceArea: number; slantHeight: number }) => ({
      primary: {
        label: 'Pyramid Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Total Surface Area', value: `${ResultFormatter.formatDecimal(result.surfaceArea)} sq units` },
        { label: 'Slant Height', value: `${ResultFormatter.formatDecimal(result.slantHeight)} units` }
      ]
    })
  },

  // 16. Triangular Prism
  {
    id: 'triangular-prism',
    name: 'Triangular Prism Volume Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Triangular Prism Volume',
      formulaExpression: 'V = (½ * b * h_triangle) * L_prism',
      variables: [{ symbol: 'b, h', name: 'Triangle' }, { symbol: 'L', name: 'Prism length' }]
    },
    inputSchema: {
      fields: [
        { name: 'triangleBase', label: 'Triangle Base (b)', type: 'number', required: true, defaultValue: 6, min: 0 },
        { name: 'triangleHeight', label: 'Triangle Height (h)', type: 'number', required: true, defaultValue: 4, min: 0 },
        { name: 'prismLength', label: 'Prism Length (L)', type: 'number', required: true, defaultValue: 10, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { triangleBase: number; triangleHeight: number; prismLength: number }) => {
      const baseArea = 0.5 * inputs.triangleBase * inputs.triangleHeight;
      const volume = PrecisionEngine.clean(baseArea * inputs.prismLength);
      return { volume, baseArea };
    },
    formatResult: (result: { volume: number; baseArea: number }) => ({
      primary: {
        label: 'Prism Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Cross-Sectional Base Area', value: `${ResultFormatter.formatDecimal(result.baseArea)} sq units` }
      ]
    })
  },

  // 17. Torus
  {
    id: 'torus-calc',
    name: 'Torus (Doughnut) Volume & Surface Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Torus Volume & Surface Area',
      formulaExpression: 'V = 2π²Rr², SA = 4π²Rr',
      variables: [{ symbol: 'R', name: 'Major radius' }, { symbol: 'r', name: 'Minor tube radius' }]
    },
    inputSchema: {
      fields: [
        { name: 'majorR', label: 'Major Center Radius (R)', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'minorR', label: 'Tube Radius (r)', type: 'number', required: true, defaultValue: 3, min: 0 }
      ]
    },
    validate: (inputs: { majorR: number; minorR: number }) => {
      if (inputs.minorR >= inputs.majorR) return [{ field: 'minorR', code: 'RANGE_OUT_OF_BOUNDS', message: 'Tube radius r must be strictly less than major radius R.' }];
      return [];
    },
    calculate: (inputs: { majorR: number; minorR: number }) => {
      const volume = PrecisionEngine.clean(2 * Math.PI * Math.PI * inputs.majorR * inputs.minorR * inputs.minorR);
      const surfaceArea = PrecisionEngine.clean(4 * Math.PI * Math.PI * inputs.majorR * inputs.minorR);
      return { volume, surfaceArea };
    },
    formatResult: (result: { volume: number; surfaceArea: number }) => ({
      primary: {
        label: 'Torus Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      },
      secondary: [
        { label: 'Surface Area', value: `${ResultFormatter.formatDecimal(result.surfaceArea)} sq units` }
      ]
    })
  },

  // 18. Ellipsoid
  {
    id: 'ellipsoid-calc',
    name: 'Ellipsoid 3D Volume Calculator',
    category: 'geometry',
    subcategoryId: 'solid-geometry-volume',
    formulaMeta: {
      formulaName: 'Ellipsoid 3D Solid Volume',
      formulaExpression: 'V = (4/3) * π * a * b * c',
      variables: [{ symbol: 'a, b, c', name: 'Principal semi-axes' }]
    },
    inputSchema: {
      fields: [
        { name: 'axisA', label: 'Semi-axis a', type: 'number', required: true, defaultValue: 6, min: 0 },
        { name: 'axisB', label: 'Semi-axis b', type: 'number', required: true, defaultValue: 4, min: 0 },
        { name: 'axisC', label: 'Semi-axis c', type: 'number', required: true, defaultValue: 3, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { axisA: number; axisB: number; axisC: number }) => {
      const volume = PrecisionEngine.clean((4 / 3) * Math.PI * inputs.axisA * inputs.axisB * inputs.axisC);
      return { volume };
    },
    formatResult: (result: { volume: number }) => ({
      primary: {
        label: 'Ellipsoid Volume',
        value: `${ResultFormatter.formatDecimal(result.volume)} cu units`,
        numericValue: result.volume
      }
    })
  },

  // 19. 3D Distance
  {
    id: 'distance-3d',
    name: '3D Coordinate Distance Calculator',
    category: 'geometry',
    subcategoryId: 'coordinate-geometry',
    formulaMeta: {
      formulaName: '3D Cartesian Spatial Distance',
      formulaExpression: 'd = √((x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²)',
      variables: [{ symbol: 'x, y, z', name: 'Coordinates' }]
    },
    inputSchema: {
      fields: [
        { name: 'x1', label: 'x₁', type: 'number', required: true, defaultValue: 1 },
        { name: 'y1', label: 'y₁', type: 'number', required: true, defaultValue: 2 },
        { name: 'z1', label: 'z₁', type: 'number', required: true, defaultValue: 3 },
        { name: 'x2', label: 'x₂', type: 'number', required: true, defaultValue: 5 },
        { name: 'y2', label: 'y₂', type: 'number', required: true, defaultValue: 6 },
        { name: 'z2', label: 'z₂', type: 'number', required: true, defaultValue: 7 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { x1: number; y1: number; z1: number; x2: number; y2: number; z2: number }) => {
      const dx = inputs.x2 - inputs.x1;
      const dy = inputs.y2 - inputs.y1;
      const dz = inputs.z2 - inputs.z1;
      const dist = PrecisionEngine.clean(Math.sqrt(dx * dx + dy * dy + dz * dz));
      return { dist, dx, dy, dz };
    },
    formatResult: (result: { dist: number }) => ({
      primary: {
        label: '3D Distance',
        value: ResultFormatter.formatDecimal(result.dist, 4),
        numericValue: result.dist
      }
    })
  },

  // 20. 3D Vector Magnitude & Pitch
  {
    id: 'slope-distance-3d',
    name: '3D Vector Magnitude & Pitch Calculator',
    category: 'geometry',
    subcategoryId: 'coordinate-geometry',
    formulaMeta: {
      formulaName: 'Vector Magnitude & Spherical Pitch',
      formulaExpression: '|v| = √(x² + y² + z²), pitch = arcsin(z / |v|)',
      variables: [{ symbol: 'x, y, z', name: 'Vector components' }]
    },
    inputSchema: {
      fields: [
        { name: 'vx', label: 'Vector X Component', type: 'number', required: true, defaultValue: 3 },
        { name: 'vy', label: 'Vector Y Component', type: 'number', required: true, defaultValue: 4 },
        { name: 'vz', label: 'Vector Z Component', type: 'number', required: true, defaultValue: 12 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { vx: number; vy: number; vz: number }) => {
      const mag = PrecisionEngine.clean(Math.sqrt(inputs.vx ** 2 + inputs.vy ** 2 + inputs.vz ** 2));
      const pitchDeg = mag > 0 ? PrecisionEngine.clean(FormulaEngine.radToDeg(Math.asin(inputs.vz / mag))) : 0;
      return { mag, pitchDeg };
    },
    formatResult: (result: { mag: number; pitchDeg: number }) => ({
      primary: {
        label: 'Vector Magnitude',
        value: ResultFormatter.formatDecimal(result.mag, 4),
        numericValue: result.mag
      },
      secondary: [
        { label: 'Elevation Pitch Angle', value: `${ResultFormatter.formatDecimal(result.pitchDeg, 2)}°` }
      ]
    })
  },

  // ==========================================
  // TRIGONOMETRY (10 new)
  // ==========================================

  // 21. Right Triangle Solver
  {
    id: 'right-triangle-solver',
    name: 'Right Triangle Angle & Side Solver',
    category: 'trigonometry',
    subcategoryId: 'right-triangles',
    formulaMeta: {
      formulaName: 'Right Triangle SOH CAH TOA',
      formulaExpression: 'c = √(a² + b²), A = arctan(a / b)',
      variables: [{ symbol: 'a, b', name: 'Legs' }]
    },
    inputSchema: {
      fields: [
        { name: 'legA', label: 'Opposite Leg (a)', type: 'number', required: true, defaultValue: 3, min: 0 },
        { name: 'legB', label: 'Adjacent Leg (b)', type: 'number', required: true, defaultValue: 4, min: 0 }
      ]
    },
    validate: (inputs: { legA: number; legB: number }) => {
      if (inputs.legA <= 0 || inputs.legB <= 0) return [{ field: 'legA', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Legs must be > 0.' }];
      return [];
    },
    calculate: (inputs: { legA: number; legB: number }) => {
      const hypotenuse = FormulaEngine.pythagoreanHypotenuse(inputs.legA, inputs.legB);
      const angleADeg = PrecisionEngine.clean(FormulaEngine.radToDeg(Math.atan2(inputs.legA, inputs.legB)));
      const angleBDeg = PrecisionEngine.clean(90 - angleADeg);
      const area = PrecisionEngine.clean(0.5 * inputs.legA * inputs.legB);
      return { hypotenuse, angleADeg, angleBDeg, area };
    },
    formatResult: (result: { hypotenuse: number; angleADeg: number; angleBDeg: number; area: number }) => ({
      primary: {
        label: 'Hypotenuse (c)',
        value: ResultFormatter.formatDecimal(result.hypotenuse),
        numericValue: result.hypotenuse
      },
      secondary: [
        { label: 'Angle A', value: `${ResultFormatter.formatDecimal(result.angleADeg, 2)}°` },
        { label: 'Angle B', value: `${ResultFormatter.formatDecimal(result.angleBDeg, 2)}°` },
        { label: 'Triangle Area', value: ResultFormatter.formatDecimal(result.area) }
      ]
    })
  },

  // 22. Law of Sines
  {
    id: 'law-of-sines',
    name: 'Law of Sines Triangle Calculator',
    category: 'trigonometry',
    subcategoryId: 'oblique-triangles',
    formulaMeta: {
      formulaName: 'Sine Proportion Rule',
      formulaExpression: 'b = a * sin(B) / sin(A)',
      variables: [{ symbol: 'a', name: 'Side a' }, { symbol: 'A, B', name: 'Angles' }]
    },
    inputSchema: {
      fields: [
        { name: 'sideA', label: 'Known Side (a)', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'angleADeg', label: 'Opposite Angle A (°)', type: 'number', required: true, defaultValue: 45, min: 0, max: 180 },
        { name: 'angleBDeg', label: 'Target Angle B (°)', type: 'number', required: true, defaultValue: 60, min: 0, max: 180 }
      ]
    },
    validate: (inputs: { angleADeg: number; angleBDeg: number }) => {
      if (inputs.angleADeg + inputs.angleBDeg >= 180) {
        return [{ field: 'angleADeg', code: 'RANGE_OUT_OF_BOUNDS', message: 'Sum of angles must be strictly less than 180°.' }];
      }
      return [];
    },
    calculate: (inputs: { sideA: number; angleADeg: number; angleBDeg: number }) => {
      const sinA = Math.sin(FormulaEngine.degToRad(inputs.angleADeg));
      const sinB = Math.sin(FormulaEngine.degToRad(inputs.angleBDeg));
      const sideB = PrecisionEngine.clean((inputs.sideA * sinB) / sinA);
      const angleCDeg = PrecisionEngine.clean(180 - inputs.angleADeg - inputs.angleBDeg);
      const sinC = Math.sin(FormulaEngine.degToRad(angleCDeg));
      const sideC = PrecisionEngine.clean((inputs.sideA * sinC) / sinA);
      return { sideB, sideC, angleCDeg };
    },
    formatResult: (result: { sideB: number; sideC: number; angleCDeg: number }) => ({
      primary: {
        label: 'Calculated Side (b)',
        value: ResultFormatter.formatDecimal(result.sideB),
        numericValue: result.sideB
      },
      secondary: [
        { label: 'Remaining Side (c)', value: ResultFormatter.formatDecimal(result.sideC) },
        { label: 'Angle C', value: `${result.angleCDeg}°` }
      ]
    })
  },

  // 23. Law of Cosines
  {
    id: 'law-of-cosines',
    name: 'Law of Cosines Triangle Calculator',
    category: 'trigonometry',
    subcategoryId: 'oblique-triangles',
    formulaMeta: {
      formulaName: 'Cosine Generalized Pythagorean',
      formulaExpression: 'c² = a² + b² - 2ab * cos(C)',
      variables: [{ symbol: 'a, b', name: 'Flanking sides' }, { symbol: 'C', name: 'Included angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'sideA', label: 'Side a', type: 'number', required: true, defaultValue: 7, min: 0 },
        { name: 'sideB', label: 'Side b', type: 'number', required: true, defaultValue: 10, min: 0 },
        { name: 'angleCDeg', label: 'Included Angle C (°)', type: 'number', required: true, defaultValue: 65, min: 0, max: 180 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { sideA: number; sideB: number; angleCDeg: number }) => {
      const radC = FormulaEngine.degToRad(inputs.angleCDeg);
      const cSq = inputs.sideA ** 2 + inputs.sideB ** 2 - 2 * inputs.sideA * inputs.sideB * Math.cos(radC);
      const sideC = PrecisionEngine.clean(Math.sqrt(Math.max(0, cSq)));
      return { sideC };
    },
    formatResult: (result: { sideC: number }) => ({
      primary: {
        label: 'Opposite Side (c)',
        value: ResultFormatter.formatDecimal(result.sideC),
        numericValue: result.sideC
      }
    })
  },

  // 24. Radians to Degrees
  {
    id: 'radians-to-degrees',
    name: 'Radians to Degrees Angle Calculator',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    formulaMeta: {
      formulaName: 'Angle Unit Conversion',
      formulaExpression: 'deg = rad * (180 / π), rad = deg * (π / 180)',
      variables: [{ symbol: 'θ', name: 'Angle value' }]
    },
    inputSchema: {
      fields: [
        { name: 'angle', label: 'Angle Value', type: 'number', required: true, defaultValue: Math.PI },
        {
          name: 'inputUnit',
          label: 'Input Unit',
          type: 'select',
          required: true,
          defaultValue: 'rad',
          options: [
            { label: 'Radians (rad)', value: 'rad' },
            { label: 'Degrees (°)', value: 'deg' }
          ]
        }
      ]
    },
    validate: () => [],
    calculate: (inputs: { angle: number; inputUnit: string }) => {
      let deg = 0;
      let rad = 0;
      if (inputs.inputUnit === 'rad') {
        rad = inputs.angle;
        deg = PrecisionEngine.clean(FormulaEngine.radToDeg(inputs.angle));
      } else {
        deg = inputs.angle;
        rad = PrecisionEngine.clean(FormulaEngine.degToRad(inputs.angle));
      }
      const grad = PrecisionEngine.clean(deg * (10 / 9));
      return { deg, rad, grad };
    },
    formatResult: (result: { deg: number; rad: number; grad: number }) => ({
      primary: {
        label: 'Angle in Degrees',
        value: `${ResultFormatter.formatDecimal(result.deg, 4)}°`,
        numericValue: result.deg
      },
      secondary: [
        { label: 'Angle in Radians', value: `${ResultFormatter.formatDecimal(result.rad, 5)} rad` },
        { label: 'Angle in Gradians', value: `${ResultFormatter.formatDecimal(result.grad, 4)} grad` }
      ]
    })
  },

  // 25. Inverse Trig
  {
    id: 'inverse-trig',
    name: 'Inverse Trigonometric Calculator',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    formulaMeta: {
      formulaName: 'Inverse Trigonometric Functions',
      formulaExpression: 'θ = arcsin(x), arccos(x), arctan(x)',
      variables: [{ symbol: 'x', name: 'Ratio input' }]
    },
    inputSchema: {
      fields: [
        { name: 'ratio', label: 'Ratio Value (-1 to 1 for sin/cos)', type: 'number', required: true, defaultValue: 0.5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { ratio: number }) => {
      const r = inputs.ratio;
      const asinRad = Math.abs(r) <= 1 ? Math.asin(r) : null;
      const acosRad = Math.abs(r) <= 1 ? Math.acos(r) : null;
      const atanRad = Math.atan(r);

      const asinDeg = asinRad !== null ? PrecisionEngine.clean(FormulaEngine.radToDeg(asinRad)) : null;
      const acosDeg = acosRad !== null ? PrecisionEngine.clean(FormulaEngine.radToDeg(acosRad)) : null;
      const atanDeg = PrecisionEngine.clean(FormulaEngine.radToDeg(atanRad));

      return { asinDeg, acosDeg, atanDeg };
    },
    formatResult: (result: { asinDeg: number | null; acosDeg: number | null; atanDeg: number }) => ({
      primary: {
        label: 'arcsin(x)',
        value: result.asinDeg !== null ? `${ResultFormatter.formatDecimal(result.asinDeg, 2)}°` : 'Undefined (|x| > 1)',
        numericValue: result.asinDeg || 0
      },
      secondary: [
        { label: 'arccos(x)', value: result.acosDeg !== null ? `${ResultFormatter.formatDecimal(result.acosDeg, 2)}°` : 'Undefined' },
        { label: 'arctan(x)', value: `${ResultFormatter.formatDecimal(result.atanDeg, 2)}°` }
      ]
    })
  },

  // 26. Coterminal Angles
  {
    id: 'coterminal-angles',
    name: 'Coterminal Angle Calculator',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    formulaMeta: {
      formulaName: 'Coterminal Periodic Angle',
      formulaExpression: 'θ_c = θ ± 360° * k',
      variables: [{ symbol: 'θ', name: 'Given angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'angle', label: 'Angle in Degrees', type: 'number', required: true, defaultValue: 450 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { angle: number }) => {
      let principal = inputs.angle % 360;
      if (principal < 0) principal += 360;
      const positivePlusOne = principal + 360;
      const negativeMinusOne = principal - 360;
      return { principal, positivePlusOne, negativeMinusOne };
    },
    formatResult: (result: { principal: number; positivePlusOne: number; negativeMinusOne: number }) => ({
      primary: {
        label: 'Principal Angle [0°, 360°)',
        value: `${result.principal}°`,
        numericValue: result.principal
      },
      secondary: [
        { label: '+360° Coterminal', value: `${result.positivePlusOne}°` },
        { label: '-360° Coterminal', value: `${result.negativeMinusOne}°` }
      ]
    })
  },

  // 27. Reference Angle
  {
    id: 'reference-angle',
    name: 'Reference Angle Calculator',
    category: 'trigonometry',
    subcategoryId: 'trig-functions',
    formulaMeta: {
      formulaName: 'Quadrant Reference Angle',
      formulaExpression: 'Acute angle formed with positive/negative x-axis',
      variables: [{ symbol: 'θ', name: 'Angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'angle', label: 'Angle in Degrees', type: 'number', required: true, defaultValue: 215 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { angle: number }) => {
      let norm = inputs.angle % 360;
      if (norm < 0) norm += 360;
      let ref = 0;
      let quad = 'Quadrant I';
      if (norm >= 0 && norm <= 90) {
        ref = norm;
        quad = 'Quadrant I';
      } else if (norm > 90 && norm <= 180) {
        ref = 180 - norm;
        quad = 'Quadrant II';
      } else if (norm > 180 && norm <= 270) {
        ref = norm - 180;
        quad = 'Quadrant III';
      } else {
        ref = 360 - norm;
        quad = 'Quadrant IV';
      }
      return { ref, quad, norm };
    },
    formatResult: (result: { ref: number; quad: string }) => ({
      primary: {
        label: 'Reference Angle (θ_ref)',
        value: `${ResultFormatter.formatDecimal(result.ref)}°`,
        numericValue: result.ref
      },
      secondary: [
        { label: 'Quadrant Location', value: result.quad }
      ]
    })
  },

  // 28. Angle of Elevation & Depression
  {
    id: 'angle-elevation-depression',
    name: 'Angle of Elevation & Depression Calculator',
    category: 'trigonometry',
    subcategoryId: 'right-triangles',
    formulaMeta: {
      formulaName: 'Line of Sight Elevation',
      formulaExpression: 'Height = Distance * tan(θ)',
      variables: [{ symbol: 'd', name: 'Horizontal distance' }, { symbol: 'θ', name: 'Elevation angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'distance', label: 'Horizontal Distance (d)', type: 'number', required: true, defaultValue: 50, min: 0 },
        { name: 'angleDegrees', label: 'Angle of Elevation (°)', type: 'number', required: true, defaultValue: 35, min: 0, max: 89.9 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { distance: number; angleDegrees: number }) => {
      const rad = FormulaEngine.degToRad(inputs.angleDegrees);
      const height = PrecisionEngine.clean(inputs.distance * Math.tan(rad));
      const sightDistance = PrecisionEngine.clean(inputs.distance / Math.cos(rad));
      return { height, sightDistance };
    },
    formatResult: (result: { height: number; sightDistance: number }) => ({
      primary: {
        label: 'Calculated Height',
        value: `${ResultFormatter.formatDecimal(result.height)} units`,
        numericValue: result.height
      },
      secondary: [
        { label: 'Line of Sight Distance', value: `${ResultFormatter.formatDecimal(result.sightDistance)} units` }
      ]
    })
  },

  // 29. Double Angle
  {
    id: 'double-angle',
    name: 'Double Angle Identity Calculator',
    category: 'trigonometry',
    subcategoryId: 'identities-harmonics',
    formulaMeta: {
      formulaName: 'Double Angle Harmonics',
      formulaExpression: 'sin(2θ) = 2sin(θ)cos(θ), cos(2θ) = cos²(θ) - sin²(θ)',
      variables: [{ symbol: 'θ', name: 'Angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'angleDegrees', label: 'Angle (θ in Degrees)', type: 'number', required: true, defaultValue: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { angleDegrees: number }) => {
      const rad = FormulaEngine.degToRad(inputs.angleDegrees);
      const sin2 = PrecisionEngine.clean(Math.sin(2 * rad));
      const cos2 = PrecisionEngine.clean(Math.cos(2 * rad));
      const tan2 = Math.abs(cos2) > 1e-12 ? PrecisionEngine.clean(Math.tan(2 * rad)) : null;
      return { sin2, cos2, tan2 };
    },
    formatResult: (result: { sin2: number; cos2: number; tan2: number | null }) => ({
      primary: {
        label: 'sin(2θ)',
        value: ResultFormatter.formatDecimal(result.sin2, 4),
        numericValue: result.sin2
      },
      secondary: [
        { label: 'cos(2θ)', value: ResultFormatter.formatDecimal(result.cos2, 4) },
        { label: 'tan(2θ)', value: result.tan2 !== null ? ResultFormatter.formatDecimal(result.tan2, 4) : 'Undefined' }
      ]
    })
  },

  // 30. Half Angle
  {
    id: 'half-angle',
    name: 'Half Angle Identity Calculator',
    category: 'trigonometry',
    subcategoryId: 'identities-harmonics',
    formulaMeta: {
      formulaName: 'Half Angle Formulas',
      formulaExpression: 'sin(θ/2) = ±√((1 - cos(θ)) / 2)',
      variables: [{ symbol: 'θ', name: 'Angle' }]
    },
    inputSchema: {
      fields: [
        { name: 'angleDegrees', label: 'Base Angle (θ in Degrees)', type: 'number', required: true, defaultValue: 60 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { angleDegrees: number }) => {
      const halfDeg = inputs.angleDegrees / 2;
      const rad = FormulaEngine.degToRad(halfDeg);
      const sinHalf = PrecisionEngine.clean(Math.sin(rad));
      const cosHalf = PrecisionEngine.clean(Math.cos(rad));
      const tanHalf = Math.abs(cosHalf) > 1e-12 ? PrecisionEngine.clean(Math.tan(rad)) : null;
      return { halfDeg, sinHalf, cosHalf, tanHalf };
    },
    formatResult: (result: { halfDeg: number; sinHalf: number; cosHalf: number; tanHalf: number | null }) => ({
      primary: {
        label: `sin(${result.halfDeg}°)`,
        value: ResultFormatter.formatDecimal(result.sinHalf, 4),
        numericValue: result.sinHalf
      },
      secondary: [
        { label: `cos(${result.halfDeg}°)`, value: ResultFormatter.formatDecimal(result.cosHalf, 4) },
        { label: `tan(${result.halfDeg}°)`, value: result.tanHalf !== null ? ResultFormatter.formatDecimal(result.tanHalf, 4) : 'Undefined' }
      ]
    })
  }
];
