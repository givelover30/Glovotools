import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH6_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Concrete Footing & Pier Calculator
  {
    id: 'concrete-footing-calc',
    name: 'Concrete Footing & Pier Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Footing Concrete Volume',
      formulaExpression: 'Yards³ = (Length ft × Width ft × Depth ft) / 27',
      variables: [{ symbol: 'Yards³', name: 'Cubic Yards' }]
    },
    inputSchema: {
      fields: [
        { name: 'lengthFeet', label: 'Continuous Footing Length (ft)', type: 'number', required: true, defaultValue: 40, min: 1 },
        { name: 'widthInches', label: 'Footing Width (inches)', type: 'number', required: true, defaultValue: 16, min: 6 },
        { name: 'depthInches', label: 'Footing Depth (inches)', type: 'number', required: true, defaultValue: 12, min: 4 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lengthFeet: number; widthInches: number; depthInches: number }) => {
      const cuFt = inputs.lengthFeet * (inputs.widthInches / 12) * (inputs.depthInches / 12);
      const cuYards = cuFt / 27;
      const yardsWithWaste = cuYards * 1.10;
      const bags80lb = Math.ceil(cuFt / 0.60);
      const bags60lb = Math.ceil(cuFt / 0.45);
      return { cuYards, yardsWithWaste, bags80lb, bags60lb };
    },
    formatResult: (res: { cuYards: number; yardsWithWaste: number; bags80lb: number; bags60lb: number }) => ({
      primary: {
        label: 'Concrete Volume Needed',
        value: `${res.yardsWithWaste.toFixed(2)} yd³`,
        numericValue: res.yardsWithWaste
      },
      secondary: [
        { label: 'Exact Net Volume', value: `${res.cuYards.toFixed(2)} yd³` },
        { label: 'Pre-Mix 80lb Bags', value: `${res.bags80lb} bags` },
        { label: 'Pre-Mix 60lb Bags', value: `${res.bags60lb} bags` }
      ]
    })
  },

  // 2. Concrete Sonotube & Column Calculator
  {
    id: 'concrete-column-calc',
    name: 'Concrete Sonotube & Column Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Cylinder Volume',
      formulaExpression: 'V = π × r² × h',
      variables: [{ symbol: 'V', name: 'Cylinder Volume' }]
    },
    inputSchema: {
      fields: [
        { name: 'diameterInches', label: 'Sonotube Diameter (inches)', type: 'number', required: true, defaultValue: 12, min: 6, max: 36 },
        { name: 'depthFeet', label: 'Column Depth / Height (ft)', type: 'number', required: true, defaultValue: 4, min: 1 },
        { name: 'quantity', label: 'Number of Tubes/Piers', type: 'integer', required: true, defaultValue: 4, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { diameterInches: number; depthFeet: number; quantity: number }) => {
      const radiusFt = inputs.diameterInches / 2 / 12;
      const cuFtPerTube = Math.PI * radiusFt * radiusFt * inputs.depthFeet;
      const totalCuFt = cuFtPerTube * inputs.quantity;
      const totalYards = totalCuFt / 27;
      const bags80 = Math.ceil(totalCuFt / 0.60);
      return { totalYards, totalCuFt, bags80, quantity: inputs.quantity };
    },
    formatResult: (res: { totalYards: number; totalCuFt: number; bags80: number; quantity: number }) => ({
      primary: {
        label: 'Total Concrete Volume',
        value: `${res.totalYards.toFixed(2)} yd³`,
        numericValue: res.totalYards
      },
      secondary: [
        { label: 'Pre-Mix 80lb Bags', value: `${res.bags80} bags` },
        { label: 'Total Cubic Feet', value: `${res.totalCuFt.toFixed(1)} cu ft for ${res.quantity} tubes` }
      ]
    })
  },

  // 3. CMU Cinder Block Wall Calculator
  {
    id: 'cinder-block-calc',
    name: 'CMU Cinder Block Wall Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'CMU Block Estimator (8x8x16)',
      formulaExpression: 'Blocks = Wall Sq Ft × 1.125 blocks/sq ft',
      variables: [{ symbol: 'Blocks', name: 'Standard CMU Units' }]
    },
    inputSchema: {
      fields: [
        { name: 'wallLength', label: 'Wall Length (ft)', type: 'number', required: true, defaultValue: 30, min: 1 },
        { name: 'wallHeight', label: 'Wall Height (ft)', type: 'number', required: true, defaultValue: 6, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { wallLength: number; wallHeight: number }) => {
      const sqFt = inputs.wallLength * inputs.wallHeight;
      const baseBlocks = sqFt * 1.125;
      const totalBlocks = Math.ceil(baseBlocks * 1.05);
      const mortarBags = Math.ceil(totalBlocks / 30);
      return { totalBlocks, mortarBags, sqFt };
    },
    formatResult: (res: { totalBlocks: number; mortarBags: number; sqFt: number }) => ({
      primary: {
        label: '8x8x16 CMU Blocks Needed',
        value: `${res.totalBlocks} blocks`,
        numericValue: res.totalBlocks
      },
      secondary: [
        { label: 'Mortar Bags (70lb Type S)', value: `${res.mortarBags} bags` },
        { label: 'Total Wall Surface', value: `${res.sqFt.toFixed(0)} sq ft (includes 5% waste)` }
      ]
    })
  },

  // 4. Brick Masonry & Mortar Calculator
  {
    id: 'brick-masonry-calc',
    name: 'Brick Masonry & Mortar Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Modular Brick Estimator',
      formulaExpression: 'Bricks = Area × 6.85 modular units/sq ft',
      variables: [{ symbol: 'Bricks', name: 'Standard Modular Bricks' }]
    },
    inputSchema: {
      fields: [
        { name: 'wallArea', label: 'Net Wall Area (sq ft)', type: 'number', required: true, defaultValue: 200, min: 10 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { wallArea: number }) => {
      const baseBricks = inputs.wallArea * 6.85;
      const totalBricks = Math.ceil(baseBricks * 1.08);
      const mortarBags = Math.ceil(totalBricks / 140);
      return { totalBricks, mortarBags, area: inputs.wallArea };
    },
    formatResult: (res: { totalBricks: number; mortarBags: number; area: number }) => ({
      primary: {
        label: 'Standard Modular Bricks',
        value: `${res.totalBricks} bricks`,
        numericValue: res.totalBricks
      },
      secondary: [
        { label: 'Mortar Bags Needed', value: `${res.mortarBags} bags (70lb)` },
        { label: 'Net Wall Surface', value: `${res.area} sq ft (includes 8% waste)` }
      ]
    })
  },

  // 5. Rebar Grid & Weight Calculator
  {
    id: 'rebar-grid-calc',
    name: 'Rebar Grid & Weight Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Rebar Grid Formula',
      formulaExpression: 'Length = (L/spacing + 1)W + (W/spacing + 1)L',
      variables: [{ symbol: 'Length', name: 'Total Linear Feet of Rebar' }]
    },
    inputSchema: {
      fields: [
        { name: 'slabLength', label: 'Slab Length (ft)', type: 'number', required: true, defaultValue: 24, min: 2 },
        { name: 'slabWidth', label: 'Slab Width (ft)', type: 'number', required: true, defaultValue: 20, min: 2 },
        { name: 'spacingInches', label: 'Grid Spacing (inches)', type: 'number', required: true, defaultValue: 12, min: 6, max: 24 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { slabLength: number; slabWidth: number; spacingInches: number }) => {
      const spacingFt = inputs.spacingInches / 12;
      const numLongitudinal = Math.floor(inputs.slabWidth / spacingFt) + 1;
      const numTransverse = Math.floor(inputs.slabLength / spacingFt) + 1;
      const totalLinearFt = (numLongitudinal * inputs.slabLength + numTransverse * inputs.slabWidth) * 1.10;
      const bars20ft = Math.ceil(totalLinearFt / 20);
      const weightLbs = totalLinearFt * 0.668;
      return { totalLinearFt, bars20ft, weightLbs };
    },
    formatResult: (res: { totalLinearFt: number; bars20ft: number; weightLbs: number }) => ({
      primary: {
        label: 'Total #4 Rebar Length',
        value: `${Math.round(res.totalLinearFt)} linear ft`,
        numericValue: res.totalLinearFt
      },
      secondary: [
        { label: 'Standard 20ft Rebar Sticks', value: `${res.bars20ft} bars` },
        { label: 'Total Steel Weight (#4 1/2")', value: `${Math.round(res.weightLbs)} lbs` }
      ]
    })
  },

  // 6. Gravel & Crushed Stone Calculator
  {
    id: 'gravel-aggregate-calc',
    name: 'Gravel & Crushed Stone Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Aggregate Weight',
      formulaExpression: 'Tons = (Sq Ft × Depth/12 / 27) × 1.4',
      variables: [{ symbol: 'Tons', name: 'Tons of Gravel' }]
    },
    inputSchema: {
      fields: [
        { name: 'lengthFt', label: 'Area Length (ft)', type: 'number', required: true, defaultValue: 30, min: 1 },
        { name: 'widthFt', label: 'Area Width (ft)', type: 'number', required: true, defaultValue: 10, min: 1 },
        { name: 'depthInches', label: 'Layer Depth (inches)', type: 'number', required: true, defaultValue: 4, min: 1, max: 24 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lengthFt: number; widthFt: number; depthInches: number }) => {
      const cuFt = inputs.lengthFt * inputs.widthFt * (inputs.depthInches / 12);
      const cuYds = cuFt / 27;
      const tons = cuYds * 1.4;
      return { cuYds, tons };
    },
    formatResult: (res: { cuYds: number; tons: number }) => ({
      primary: {
        label: 'Gravel Required',
        value: `${res.tons.toFixed(2)} tons`,
        numericValue: res.tons
      },
      secondary: [
        { label: 'Volume in Cubic Yards', value: `${res.cuYds.toFixed(2)} yd³` }
      ]
    })
  },

  // 7. Paver Sand & Base Bedding Calculator
  {
    id: 'sand-screed-calc',
    name: 'Paver Sand & Base Bedding Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    formulaMeta: {
      formulaName: 'Bedding Sand Volume',
      formulaExpression: 'Yards = (Area sq ft × Depth in) / 324',
      variables: [{ symbol: 'Yards', name: 'Cubic Yards' }]
    },
    inputSchema: {
      fields: [
        { name: 'patioArea', label: 'Patio / Walkway Area (sq ft)', type: 'number', required: true, defaultValue: 300, min: 10 },
        { name: 'sandDepth', label: 'Bedding Depth (inches, standard 1")', type: 'number', required: true, defaultValue: 1.0, min: 0.5, max: 3 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { patioArea: number; sandDepth: number }) => {
      const cuYds = (inputs.patioArea * inputs.sandDepth) / 324;
      const tons = cuYds * 1.35;
      const bags50lb = Math.ceil((tons * 2000) / 50);
      return { cuYds, tons, bags50lb };
    },
    formatResult: (res: { cuYds: number; tons: number; bags50lb: number }) => ({
      primary: {
        label: 'Coarse Sand Required',
        value: `${res.cuYds.toFixed(2)} yd³`,
        numericValue: res.cuYds
      },
      secondary: [
        { label: 'Weight in Tons', value: `${res.tons.toFixed(2)} tons` },
        { label: 'Or 50lb Quikrete Bags', value: `${res.bags50lb} bags` }
      ]
    })
  },

  // 8. Hardwood & Laminate Flooring Calculator
  {
    id: 'hardwood-flooring-calc',
    name: 'Hardwood & Laminate Flooring Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'Flooring Box Calculator',
      formulaExpression: 'Boxes = Ceil((Area × 1.10) / Box Coverage)',
      variables: [{ symbol: 'Boxes', name: 'Cartons of Flooring' }]
    },
    inputSchema: {
      fields: [
        { name: 'roomLength', label: 'Room Length (ft)', type: 'number', required: true, defaultValue: 18, min: 1 },
        { name: 'roomWidth', label: 'Room Width (ft)', type: 'number', required: true, defaultValue: 14, min: 1 },
        { name: 'boxCoverage', label: 'Sq Ft per Box / Carton', type: 'number', required: true, defaultValue: 22.5, min: 5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { roomLength: number; roomWidth: number; boxCoverage: number }) => {
      const roomSqFt = inputs.roomLength * inputs.roomWidth;
      const withWaste = roomSqFt * 1.10;
      const boxes = Math.ceil(withWaste / inputs.boxCoverage);
      const totalPurchasedSqFt = boxes * inputs.boxCoverage;
      return { roomSqFt, withWaste, boxes, totalPurchasedSqFt };
    },
    formatResult: (res: { roomSqFt: number; withWaste: number; boxes: number; totalPurchasedSqFt: number }) => ({
      primary: {
        label: 'Cartons / Boxes to Buy',
        value: `${res.boxes} boxes`,
        numericValue: res.boxes
      },
      secondary: [
        { label: 'Actual Room Area', value: `${res.roomSqFt.toFixed(0)} sq ft` },
        { label: 'Area with 10% Waste', value: `${res.withWaste.toFixed(1)} sq ft` },
        { label: 'Total Coverage Purchased', value: `${res.totalPurchasedSqFt.toFixed(1)} sq ft` }
      ]
    })
  },

  // 9. Tile & Grout Volume Calculator
  {
    id: 'tile-grout-calc',
    name: 'Tile & Grout Volume Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'Tile Piece and Grout Math',
      formulaExpression: 'Tiles = (Area / Tile Area) × 1.10',
      variables: [{ symbol: 'Tiles', name: 'Tile Count' }]
    },
    inputSchema: {
      fields: [
        { name: 'areaSqFt', label: 'Tiled Area (sq ft)', type: 'number', required: true, defaultValue: 120, min: 5 },
        { name: 'tileLengthInches', label: 'Tile Length (inches)', type: 'number', required: true, defaultValue: 12, min: 1 },
        { name: 'tileWidthInches', label: 'Tile Width (inches)', type: 'number', required: true, defaultValue: 12, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { areaSqFt: number; tileLengthInches: number; tileWidthInches: number }) => {
      const tileAreaSqFt = (inputs.tileLengthInches * inputs.tileWidthInches) / 144;
      const baseTiles = inputs.areaSqFt / tileAreaSqFt;
      const totalTiles = Math.ceil(baseTiles * 1.10);
      const groutLbs = Math.ceil(inputs.areaSqFt * 0.35);
      return { totalTiles, groutLbs, tileAreaSqFt };
    },
    formatResult: (res: { totalTiles: number; groutLbs: number; tileAreaSqFt: number }) => ({
      primary: {
        label: 'Total Tiles Needed',
        value: `${res.totalTiles} tiles`,
        numericValue: res.totalTiles
      },
      secondary: [
        { label: 'Dry Grout Required', value: `~${res.groutLbs} lbs (1/8" joint)` },
        { label: 'Buffer Margin', value: '10% waste for perimeter cuts' }
      ]
    })
  },

  // 10. Carpet Square Yardage Calculator
  {
    id: 'carpet-roll-calc',
    name: 'Carpet Square Yardage Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'Carpet Square Yards',
      formulaExpression: 'SY = (Length ft × Width ft) / 9',
      variables: [{ symbol: 'SY', name: 'Square Yards' }]
    },
    inputSchema: {
      fields: [
        { name: 'lengthFt', label: 'Room Length (ft)', type: 'number', required: true, defaultValue: 20, min: 1 },
        { name: 'widthFt', label: 'Room Width (ft)', type: 'number', required: true, defaultValue: 15, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lengthFt: number; widthFt: number }) => {
      const sqFt = inputs.lengthFt * inputs.widthFt;
      const sy = sqFt / 9;
      const syWithWaste = sy * 1.10;
      return { sqFt, sy, syWithWaste };
    },
    formatResult: (res: { sqFt: number; sy: number; syWithWaste: number }) => ({
      primary: {
        label: 'Carpet Square Yards (SY)',
        value: `${res.syWithWaste.toFixed(1)} yd²`,
        numericValue: res.syWithWaste
      },
      secondary: [
        { label: 'Net Square Footage', value: `${res.sqFt.toFixed(0)} sq ft` },
        { label: 'Exact Square Yards', value: `${res.sy.toFixed(1)} yd²` }
      ]
    })
  },

  // 11. Luxury Vinyl Plank (LVP) Calculator
  {
    id: 'vinyl-plank-calc',
    name: 'Luxury Vinyl Plank (LVP) Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'LVP Box Estimator',
      formulaExpression: 'Boxes = Ceil((Sq Ft × 1.10) / Box Coverage)',
      variables: [{ symbol: 'Boxes', name: 'LVP Cartons' }]
    },
    inputSchema: {
      fields: [
        { name: 'sqFt', label: 'Total Floor Area (sq ft)', type: 'number', required: true, defaultValue: 450, min: 10 },
        { name: 'boxSqFt', label: 'Sq Ft per Box', type: 'number', required: true, defaultValue: 19.8, min: 5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { sqFt: number; boxSqFt: number }) => {
      const neededSqFt = PrecisionEngine.clean(inputs.sqFt * 1.10);
      const boxes = Math.ceil(PrecisionEngine.clean(neededSqFt / inputs.boxSqFt));
      return { boxes, neededSqFt, actualSqFt: inputs.sqFt };
    },
    formatResult: (res: { boxes: number; neededSqFt: number; actualSqFt: number }) => ({
      primary: {
        label: 'LVP Boxes to Purchase',
        value: `${res.boxes} boxes`,
        numericValue: res.boxes
      },
      secondary: [
        { label: 'Total Ordered Coverage', value: `${(res.boxes * 19.8).toFixed(1)} sq ft` },
        { label: 'Required with 10% Waste', value: `${res.neededSqFt.toFixed(1)} sq ft` }
      ]
    })
  },

  // 12. Baseboard & Trim Molding Calculator
  {
    id: 'baseboard-trim-calc',
    name: 'Baseboard & Trim Molding Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'Perimeter Trim Formula',
      formulaExpression: 'Linear Ft = [2(L + W) - Doors] × 1.10',
      variables: [{ symbol: 'Linear Ft', name: 'Total Trim Footage' }]
    },
    inputSchema: {
      fields: [
        { name: 'roomLength', label: 'Room Length (ft)', type: 'number', required: true, defaultValue: 16, min: 1 },
        { name: 'roomWidth', label: 'Room Width (ft)', type: 'number', required: true, defaultValue: 12, min: 1 },
        { name: 'doorsCount', label: 'Standard Door Openings (3ft each)', type: 'integer', required: true, defaultValue: 2, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { roomLength: number; roomWidth: number; doorsCount: number }) => {
      const perimeter = 2 * (inputs.roomLength + inputs.roomWidth);
      const netPerimeter = Math.max(0, perimeter - inputs.doorsCount * 3);
      const totalLinearFt = netPerimeter * 1.10;
      const pieces8ft = Math.ceil(totalLinearFt / 8);
      const pieces12ft = Math.ceil(totalLinearFt / 12);
      return { totalLinearFt, pieces8ft, pieces12ft, netPerimeter };
    },
    formatResult: (res: { totalLinearFt: number; pieces8ft: number; pieces12ft: number; netPerimeter: number }) => ({
      primary: {
        label: 'Baseboard Linear Feet',
        value: `${Math.round(res.totalLinearFt)} linear ft`,
        numericValue: res.totalLinearFt
      },
      secondary: [
        { label: 'In 8ft Sticks', value: `${res.pieces8ft} boards` },
        { label: 'In 12ft Sticks', value: `${res.pieces12ft} boards` }
      ]
    })
  },

  // 13. Flooring Underlayment Calculator
  {
    id: 'floor-underlayment-calc',
    name: 'Flooring Underlayment Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'Underlayment Rolls',
      formulaExpression: 'Rolls = Ceil(Area / Roll Coverage)',
      variables: [{ symbol: 'Rolls', name: 'Roll Count' }]
    },
    inputSchema: {
      fields: [
        { name: 'areaSqFt', label: 'Total Floor Area (sq ft)', type: 'number', required: true, defaultValue: 550, min: 10 },
        { name: 'rollCoverage', label: 'Sq Ft per Roll (standard 100 sq ft)', type: 'number', required: true, defaultValue: 100, min: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { areaSqFt: number; rollCoverage: number }) => {
      const rolls = Math.ceil((inputs.areaSqFt * 1.05) / inputs.rollCoverage);
      return { rolls, totalArea: inputs.areaSqFt };
    },
    formatResult: (res: { rolls: number; totalArea: number }) => ({
      primary: {
        label: 'Underlayment Rolls Needed',
        value: `${res.rolls} rolls`,
        numericValue: res.rolls
      },
      secondary: [
        { label: 'Total Covered Area', value: `${res.totalArea} sq ft + 5% overlap` }
      ]
    })
  },

  // 14. Decking Board & Fastener Calculator
  {
    id: 'deck-boards-calc',
    name: 'Decking Board & Fastener Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    formulaMeta: {
      formulaName: 'Decking Board Count',
      formulaExpression: 'Runs = Ceil(Deck Width / (Board Width + Gap))',
      variables: [{ symbol: 'Runs', name: 'Deck Board Rows' }]
    },
    inputSchema: {
      fields: [
        { name: 'deckLength', label: 'Deck Length (ft)', type: 'number', required: true, defaultValue: 16, min: 4 },
        { name: 'deckWidth', label: 'Deck Width (ft)', type: 'number', required: true, defaultValue: 12, min: 4 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { deckLength: number; deckWidth: number }) => {
      const boardWidthInches = 5.5 + 0.125;
      const rows = Math.ceil((inputs.deckWidth * 12) / boardWidthInches);
      const totalBoards = rows;
      const joistCount = Math.ceil(inputs.deckLength / 1.333) + 1;
      const screws = rows * joistCount * 2;
      return { totalBoards, screws, joistCount };
    },
    formatResult: (res: { totalBoards: number; screws: number; joistCount: number }) => ({
      primary: {
        label: 'Full-Length Deck Boards',
        value: `${res.totalBoards} boards`,
        numericValue: res.totalBoards
      },
      secondary: [
        { label: 'Deck Screws Needed', value: `~${res.screws} screws (2 per joist)` },
        { label: 'Joist Penetrations', value: `${res.joistCount} joists at 16" O.C.` }
      ]
    })
  },

  // 15. Wall Stud Calculator
  {
    id: 'wall-stud-calc',
    name: 'Wall Stud Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: 'Stud and Plate Count',
      formulaExpression: 'Studs = Ceil(Length × 12 / Spacing) + Corners(4) + Plates',
      variables: [{ symbol: 'Studs', name: 'Total 2x4 Framing Studs' }]
    },
    inputSchema: {
      fields: [
        { name: 'wallLength', label: 'Wall Length (ft)', type: 'number', required: true, defaultValue: 24, min: 2 },
        { name: 'spacing', label: 'Stud Spacing', type: 'select', required: true, defaultValue: '16', options: [
          { label: '16 inches on-center (Standard)', value: '16' },
          { label: '24 inches on-center (Advanced)', value: '24' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { wallLength: number; spacing: string }) => {
      const spaceInches = parseInt(inputs.spacing, 10);
      const wallInches = inputs.wallLength * 12;
      const verticalStuds = Math.ceil(wallInches / spaceInches) + 1 + 4;
      const plateLinearFt = inputs.wallLength * 3;
      const totalStudsWithPlates = verticalStuds + Math.ceil(plateLinearFt / 8);
      return { verticalStuds, totalStudsWithPlates, plateLinearFt };
    },
    formatResult: (res: { verticalStuds: number; totalStudsWithPlates: number; plateLinearFt: number }) => ({
      primary: {
        label: 'Vertical Framing Studs',
        value: `${res.verticalStuds} studs`,
        numericValue: res.verticalStuds
      },
      secondary: [
        { label: 'Total 2x4s Including Plates', value: `${res.totalStudsWithPlates} pieces (8ft)` },
        { label: 'Plate Footage (Double Top, Single Bottom)', value: `${res.plateLinearFt} linear ft` }
      ]
    })
  },

  // 16. Drywall Sheet & Mud Calculator
  {
    id: 'drywall-sheet-calc',
    name: 'Drywall Sheet & Mud Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: 'Drywall Sheets Formula',
      formulaExpression: 'Sheets = Ceil(Total Sq Ft / Sheet Sq Ft)',
      variables: [{ symbol: 'Sheets', name: 'Panel Count' }]
    },
    inputSchema: {
      fields: [
        { name: 'roomLength', label: 'Room Length (ft)', type: 'number', required: true, defaultValue: 14, min: 2 },
        { name: 'roomWidth', label: 'Room Width (ft)', type: 'number', required: true, defaultValue: 12, min: 2 },
        { name: 'ceilingHeight', label: 'Ceiling Height (ft)', type: 'number', required: true, defaultValue: 8, min: 7, max: 16 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { roomLength: number; roomWidth: number; ceilingHeight: number }) => {
      const wallArea = 2 * (inputs.roomLength + inputs.roomWidth) * inputs.ceilingHeight;
      const ceilingArea = inputs.roomLength * inputs.roomWidth;
      const totalArea = wallArea + ceilingArea - 60;
      const sheets4x8 = Math.ceil(totalArea / 32);
      const compoundGallons = Math.ceil(totalArea / 100);
      const screwsLbs = Math.ceil(sheets4x8 * 0.15);
      return { totalArea, sheets4x8, compoundGallons, screwsLbs };
    },
    formatResult: (res: { totalArea: number; sheets4x8: number; compoundGallons: number; screwsLbs: number }) => ({
      primary: {
        label: '4x8 Drywall Sheets Needed',
        value: `${res.sheets4x8} sheets`,
        numericValue: res.sheets4x8
      },
      secondary: [
        { label: 'Joint Compound Mud', value: `~${res.compoundGallons} gallons` },
        { label: 'Drywall Screws', value: `~${res.screwsLbs} lbs (1-1/4" screws)` },
        { label: 'Total Surface Area', value: `${Math.round(res.totalArea)} sq ft` }
      ]
    })
  },

  // 17. Lumber Board Feet (BF) Calculator
  {
    id: 'board-feet-calc',
    name: 'Lumber Board Feet (BF) Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: 'Hardwood Board Feet',
      formulaExpression: 'BF = (Thickness in × Width in × Length ft) / 12',
      variables: [{ symbol: 'BF', name: 'Board Feet Volume' }]
    },
    inputSchema: {
      fields: [
        { name: 'thickness', label: 'Thickness (inches)', type: 'number', required: true, defaultValue: 2, min: 0.25 },
        { name: 'width', label: 'Width (inches)', type: 'number', required: true, defaultValue: 6, min: 1 },
        { name: 'length', label: 'Length (feet)', type: 'number', required: true, defaultValue: 8, min: 1 },
        { name: 'quantity', label: 'Number of Pieces', type: 'integer', required: true, defaultValue: 5, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { thickness: number; width: number; length: number; quantity: number }) => {
      const bfPerPiece = (inputs.thickness * inputs.width * inputs.length) / 12;
      const totalBF = bfPerPiece * inputs.quantity;
      return { bfPerPiece, totalBF, quantity: inputs.quantity };
    },
    formatResult: (res: { bfPerPiece: number; totalBF: number; quantity: number }) => ({
      primary: {
        label: 'Total Board Feet (BF)',
        value: `${res.totalBF.toFixed(2)} BF`,
        numericValue: res.totalBF
      },
      secondary: [
        { label: 'Per Piece Volume', value: `${res.bfPerPiece.toFixed(2)} BF` },
        { label: 'Total Boards Measured', value: `${res.quantity} pieces` }
      ]
    })
  },

  // 18. Ceiling Joist & Rafter Calculator
  {
    id: 'ceiling-joist-calc',
    name: 'Ceiling Joist & Rafter Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: 'Joist Count Formula',
      formulaExpression: 'Joists = Ceil(Building Length / Spacing) + 1',
      variables: [{ symbol: 'Joists', name: 'Total Joist Count' }]
    },
    inputSchema: {
      fields: [
        { name: 'buildingLength', label: 'Span Along Building (ft)', type: 'number', required: true, defaultValue: 32, min: 4 },
        { name: 'spacingInches', label: 'Joist Spacing', type: 'select', required: true, defaultValue: '16', options: [
          { label: '16" on-center', value: '16' },
          { label: '24" on-center', value: '24' },
          { label: '12" on-center', value: '12' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { buildingLength: number; spacingInches: string }) => {
      const spacingFt = parseInt(inputs.spacingInches, 10) / 12;
      const joists = Math.ceil(inputs.buildingLength / spacingFt) + 1;
      return { joists, buildingLength: inputs.buildingLength };
    },
    formatResult: (res: { joists: number; buildingLength: number }) => ({
      primary: {
        label: 'Ceiling Joists / Rafters Needed',
        value: `${res.joists} pieces`,
        numericValue: res.joists
      },
      secondary: [
        { label: 'Framed Building Span', value: `${res.buildingLength} ft` }
      ]
    })
  },

  // 19. Plywood & OSB Sheathing Calculator
  {
    id: 'plywood-sheathing-calc',
    name: 'Plywood & OSB Sheathing Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: '4x8 Panel Estimator',
      formulaExpression: 'Panels = Ceil((Area sq ft × 1.10) / 32)',
      variables: [{ symbol: 'Panels', name: '4x8 Sheet Count' }]
    },
    inputSchema: {
      fields: [
        { name: 'sheathingArea', label: 'Subfloor or Roof Deck Area (sq ft)', type: 'number', required: true, defaultValue: 800, min: 32 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { sheathingArea: number }) => {
      const withWaste = inputs.sheathingArea * 1.10;
      const panels = Math.ceil(withWaste / 32);
      return { panels, withWaste, area: inputs.sheathingArea };
    },
    formatResult: (res: { panels: number; withWaste: number; area: number }) => ({
      primary: {
        label: '4x8 OSB / Plywood Sheets',
        value: `${res.panels} sheets`,
        numericValue: res.panels
      },
      secondary: [
        { label: 'Gross Coverage with 10% Waste', value: `${res.withWaste.toFixed(0)} sq ft` },
        { label: 'Net Floor/Roof Area', value: `${res.area} sq ft` }
      ]
    })
  },

  // 20. Stair Stringer Rise & Run Calculator
  {
    id: 'stair-rise-run-calc',
    name: 'Stair Stringer Rise & Run Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: 'Stair Geometry Formula',
      formulaExpression: 'Steps = Round(Rise / 7.5); Riser Height = Rise / Steps',
      variables: [{ symbol: 'Riser Height', name: 'Unit Riser Dimension' }]
    },
    inputSchema: {
      fields: [
        { name: 'totalRise', label: 'Total Floor-to-Floor Rise (inches)', type: 'number', required: true, defaultValue: 108, min: 12, max: 200 },
        { name: 'treadDepth', label: 'Target Tread Depth (inches, standard 10-11")', type: 'number', required: true, defaultValue: 10.5, min: 9, max: 14 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalRise: number; treadDepth: number }) => {
      const numRisers = Math.round(inputs.totalRise / 7.5);
      const riserHeight = inputs.totalRise / numRisers;
      const numTreads = numRisers - 1;
      const totalRun = numTreads * inputs.treadDepth;
      const stringerLength = Math.sqrt(Math.pow(inputs.totalRise, 2) + Math.pow(totalRun, 2));
      return { numRisers, riserHeight, numTreads, totalRun, stringerLengthFt: stringerLength / 12 };
    },
    formatResult: (res: { numRisers: number; riserHeight: number; numTreads: number; totalRun: number; stringerLengthFt: number }) => ({
      primary: {
        label: 'Riser Height per Step',
        value: `${res.riserHeight.toFixed(2)} inches`,
        numericValue: res.riserHeight
      },
      secondary: [
        { label: 'Number of Risers / Steps', value: `${res.numRisers} risers (${res.numTreads} treads)` },
        { label: 'Total Horizontal Run', value: `${(res.totalRun / 12).toFixed(1)} ft (${res.totalRun.toFixed(0)} inches)` },
        { label: 'Approximate Stringer Board', value: `${res.stringerLengthFt.toFixed(1)} ft (buy 2x12)` }
      ]
    })
  },

  // 21. Wood Fence Pickets & Posts Calculator
  {
    id: 'fence-picket-calc',
    name: 'Wood Fence Pickets & Posts Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    formulaMeta: {
      formulaName: 'Fence Component Formulas',
      formulaExpression: 'Posts = Ceil(L / 8) + 1; Pickets = Ceil(L × 12 / Width)',
      variables: [{ symbol: 'Pickets', name: 'Total Privacy Pickets' }]
    },
    inputSchema: {
      fields: [
        { name: 'fenceLength', label: 'Total Fence Length (linear ft)', type: 'number', required: true, defaultValue: 150, min: 8 },
        { name: 'picketWidthInches', label: 'Picket Width (inches, standard 5.5")', type: 'number', required: true, defaultValue: 5.5, min: 3, max: 8 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { fenceLength: number; picketWidthInches: number }) => {
      const posts = Math.ceil(inputs.fenceLength / 8) + 1;
      const rails = (posts - 1) * 3;
      const pickets = Math.ceil((inputs.fenceLength * 12) / inputs.picketWidthInches);
      const postConcreteBags = posts * 2;
      return { posts, rails, pickets, postConcreteBags };
    },
    formatResult: (res: { posts: number; rails: number; pickets: number; postConcreteBags: number }) => ({
      primary: {
        label: 'Fence Pickets Needed',
        value: `${res.pickets} pickets`,
        numericValue: res.pickets
      },
      secondary: [
        { label: '4x4 Posts (8ft spacing)', value: `${res.posts} posts` },
        { label: '2x4 Horizontal Rails', value: `${res.rails} rails (3 per section)` },
        { label: 'Concrete Bags for Post Holes', value: `${res.postConcreteBags} bags (50lb fast-set)` }
      ]
    })
  },

  // 22. Interior Wall Paint Calculator
  {
    id: 'interior-paint-calc',
    name: 'Interior Wall Paint Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Interior Paint Coverage',
      formulaExpression: 'Gallons = Ceil((Net Area × Coats) / 350)',
      variables: [{ symbol: 'Gallons', name: 'Paint Cans Needed' }]
    },
    inputSchema: {
      fields: [
        { name: 'roomLength', label: 'Room Length (ft)', type: 'number', required: true, defaultValue: 15, min: 2 },
        { name: 'roomWidth', label: 'Room Width (ft)', type: 'number', required: true, defaultValue: 12, min: 2 },
        { name: 'wallHeight', label: 'Wall Height (ft)', type: 'number', required: true, defaultValue: 9, min: 7 },
        { name: 'coats', label: 'Number of Paint Coats', type: 'integer', required: true, defaultValue: 2, min: 1, max: 4 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { roomLength: number; roomWidth: number; wallHeight: number; coats: number }) => {
      const grossArea = 2 * (inputs.roomLength + inputs.roomWidth) * inputs.wallHeight;
      const netArea = Math.max(0, grossArea - 42);
      const coveragePerGallon = 350;
      const gallons = Math.ceil((netArea * inputs.coats) / coveragePerGallon);
      return { grossArea, netArea, gallons, coats: inputs.coats };
    },
    formatResult: (res: { grossArea: number; netArea: number; gallons: number; coats: number }) => ({
      primary: {
        label: 'Paint Gallons to Purchase',
        value: `${res.gallons} gallons`,
        numericValue: res.gallons
      },
      secondary: [
        { label: 'Net Wall Area', value: `${Math.round(res.netArea)} sq ft (${res.coats} coats applied)` },
        { label: 'Deductions', value: 'Includes standard door & window offsets' }
      ]
    })
  },

  // 23. Deck & Exterior Stain Calculator
  {
    id: 'exterior-stain-calc',
    name: 'Deck & Exterior Stain Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Deck Stain Coverage',
      formulaExpression: 'Gallons = Ceil(Deck Area / 225)',
      variables: [{ symbol: 'Gallons', name: 'Stain Gallons' }]
    },
    inputSchema: {
      fields: [
        { name: 'deckSqFt', label: 'Deck Flooring Surface (sq ft)', type: 'number', required: true, defaultValue: 350, min: 20 },
        { name: 'hasRailings', label: 'Include Handrails & Balusters', type: 'select', required: true, defaultValue: 'yes', options: [
          { label: 'Yes (Add 40% surface area)', value: 'yes' },
          { label: 'No (Flooring only)', value: 'no' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { deckSqFt: number; hasRailings: string }) => {
      const multiplier = inputs.hasRailings === 'yes' ? 1.40 : 1.0;
      const totalArea = inputs.deckSqFt * multiplier;
      const gallons = Math.ceil(totalArea / 225);
      return { totalArea, gallons };
    },
    formatResult: (res: { totalArea: number; gallons: number }) => ({
      primary: {
        label: 'Exterior Stain Gallons',
        value: `${res.gallons} gallons`,
        numericValue: res.gallons
      },
      secondary: [
        { label: 'Total Finish Area', value: `${Math.round(res.totalArea)} sq ft` }
      ]
    })
  },

  // 24. Roofing Shingles & Bundles Calculator
  {
    id: 'roof-shingle-calc',
    name: 'Roofing Shingles & Bundles Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Roofing Squares Formula',
      formulaExpression: 'Squares = (Roof Sq Ft / 100) × 1.10; Bundles = Squares × 3',
      variables: [{ symbol: 'Bundles', name: 'Shingle Bundles' }]
    },
    inputSchema: {
      fields: [
        { name: 'roofSqFt', label: 'Total Sloped Roof Surface (sq ft)', type: 'number', required: true, defaultValue: 2400, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { roofSqFt: number }) => {
      const exactSquares = inputs.roofSqFt / 100;
      const squaresWithWaste = exactSquares * 1.10;
      const bundles = Math.ceil(squaresWithWaste * 3);
      const underlaymentRolls = Math.ceil((inputs.roofSqFt * 1.05) / 400);
      return { exactSquares, squaresWithWaste, bundles, underlaymentRolls };
    },
    formatResult: (res: { exactSquares: number; squaresWithWaste: number; bundles: number; underlaymentRolls: number }) => ({
      primary: {
        label: 'Shingle Bundles to Order',
        value: `${res.bundles} bundles`,
        numericValue: res.bundles
      },
      secondary: [
        { label: 'Roofing Squares (100 sq ft each)', value: `${res.squaresWithWaste.toFixed(1)} squares` },
        { label: 'Felt / Synthetic Underlayment', value: `${res.underlaymentRolls} rolls (4-sq rolls)` }
      ]
    })
  },

  // 25. Roof Pitch & Slope Multiplier Calculator
  {
    id: 'roof-pitch-calc',
    name: 'Roof Pitch & Slope Multiplier Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Pitch Multiplier Formula',
      formulaExpression: 'Factor = √(1 + (Rise/12)²); Angle = arctan(Rise/12)',
      variables: [{ symbol: 'Factor', name: 'Slope Area Factor' }]
    },
    inputSchema: {
      fields: [
        { name: 'pitchRise', label: 'Pitch Rise in 12 (e.g. 4, 6, 8, 12)', type: 'number', required: true, defaultValue: 6, min: 1, max: 24 },
        { name: 'flatArea', label: 'Building Footprint Flat Area (sq ft)', type: 'number', required: true, defaultValue: 1800, min: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { pitchRise: number; flatArea: number }) => {
      const factor = Math.sqrt(1 + Math.pow(inputs.pitchRise / 12, 2));
      const degrees = Math.atan(inputs.pitchRise / 12) * (180 / Math.PI);
      const trueRoofArea = inputs.flatArea * factor * 1.10;
      return { factor, degrees, trueRoofArea, flatArea: inputs.flatArea };
    },
    formatResult: (res: { factor: number; degrees: number; trueRoofArea: number; flatArea: number }) => ({
      primary: {
        label: 'True Sloped Roof Area',
        value: `${Math.round(res.trueRoofArea)} sq ft`,
        numericValue: res.trueRoofArea
      },
      secondary: [
        { label: 'Slope Factor Multiplier', value: `${res.factor.toFixed(3)}x` },
        { label: 'Roof Pitch Angle', value: `${res.degrees.toFixed(1)}°` }
      ]
    })
  },

  // 26. Fiberglass Insulation Batt Calculator
  {
    id: 'insulation-batt-calc',
    name: 'Fiberglass Insulation Batt Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Insulation Package Estimator',
      formulaExpression: 'Bags = Ceil(Cavity Area / Coverage per Bag)',
      variables: [{ symbol: 'Bags', name: 'Insulation Packages' }]
    },
    inputSchema: {
      fields: [
        { name: 'cavitySqFt', label: 'Wall / Ceiling Cavity Area (sq ft)', type: 'number', required: true, defaultValue: 600, min: 20 },
        { name: 'rValue', label: 'Target Insulation Type', type: 'select', required: true, defaultValue: 'R13', options: [
          { label: 'R-13 2x4 Walls (106 sq ft / bag)', value: 'R13' },
          { label: 'R-19 2x6 Walls (87 sq ft / bag)', value: 'R19' },
          { label: 'R-30 Attics (58 sq ft / bag)', value: 'R30' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { cavitySqFt: number; rValue: string }) => {
      let coverage = 106;
      if (inputs.rValue === 'R19') coverage = 87;
      if (inputs.rValue === 'R30') coverage = 58;
      const bags = Math.ceil(inputs.cavitySqFt / coverage);
      return { bags, coverage, cavitySqFt: inputs.cavitySqFt };
    },
    formatResult: (res: { bags: number; coverage: number; cavitySqFt: number }) => ({
      primary: {
        label: 'Insulation Bags to Buy',
        value: `${res.bags} bags / bundles`,
        numericValue: res.bags
      },
      secondary: [
        { label: 'Coverage per Bag', value: `${res.coverage} sq ft` },
        { label: 'Total Cavity Area', value: `${res.cavitySqFt} sq ft` }
      ]
    })
  },

  // 27. Seamless Rain Gutter Calculator
  {
    id: 'gutter-downspout-calc',
    name: 'Seamless Rain Gutter Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Eaves and Downspout Drainage',
      formulaExpression: 'Downspouts = Ceil(Linear Ft / 35)',
      variables: [{ symbol: 'Downspouts', name: 'Downspout Outlets' }]
    },
    inputSchema: {
      fields: [
        { name: 'eavesLength', label: 'Total Roof Eaves Length (linear ft)', type: 'number', required: true, defaultValue: 120, min: 10 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { eavesLength: number }) => {
      const downspouts = Math.ceil(inputs.eavesLength / 35);
      const hangers = Math.ceil(inputs.eavesLength / 2);
      return { downspouts, hangers, eavesLength: inputs.eavesLength };
    },
    formatResult: (res: { downspouts: number; hangers: number; eavesLength: number }) => ({
      primary: {
        label: 'Downspout Drops Needed',
        value: `${res.downspouts} downspouts`,
        numericValue: res.downspouts
      },
      secondary: [
        { label: 'Hidden Fascia Hangers', value: `${res.hangers} hangers (24" spacing)` },
        { label: 'Total Gutter Trough', value: `${res.eavesLength} linear ft` }
      ]
    })
  },

  // 28. Vinyl & Hardie Siding Squares Calculator
  {
    id: 'siding-square-calc',
    name: 'Vinyl & Hardie Siding Squares Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Siding Squares Formula',
      formulaExpression: 'Squares = Ceil((Net Area × 1.10) / 100)',
      variables: [{ symbol: 'Squares', name: 'Siding Squares (100 sq ft each)' }]
    },
    inputSchema: {
      fields: [
        { name: 'wallSqFt', label: 'Net Exterior Wall Area (sq ft)', type: 'number', required: true, defaultValue: 1850, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { wallSqFt: number }) => {
      const grossArea = inputs.wallSqFt * 1.10;
      const squares = Math.ceil(grossArea / 100);
      return { squares, grossArea, wallSqFt: inputs.wallSqFt };
    },
    formatResult: (res: { squares: number; grossArea: number; wallSqFt: number }) => ({
      primary: {
        label: 'Siding Squares to Order',
        value: `${res.squares} squares`,
        numericValue: res.squares
      },
      secondary: [
        { label: 'Includes 10% Waste', value: `${Math.round(res.grossArea)} sq ft` },
        { label: 'Net Wall Surface', value: `${res.wallSqFt} sq ft` }
      ]
    })
  },

  // 29. Mulch & Topsoil Landscaping Calculator
  {
    id: 'mulch-landscaping-calc',
    name: 'Mulch & Topsoil Landscaping Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    formulaMeta: {
      formulaName: 'Landscape Bedding Volume',
      formulaExpression: 'Yards = (Bed Area sq ft × Depth inches) / 324',
      variables: [{ symbol: 'Yards', name: 'Cubic Yards' }]
    },
    inputSchema: {
      fields: [
        { name: 'bedArea', label: 'Garden Bed Area (sq ft)', type: 'number', required: true, defaultValue: 400, min: 10 },
        { name: 'depthInches', label: 'Mulch / Soil Depth (inches, standard 3")', type: 'number', required: true, defaultValue: 3, min: 1, max: 12 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { bedArea: number; depthInches: number }) => {
      const cuYds = (inputs.bedArea * inputs.depthInches) / 324;
      const bags2cuft = Math.ceil((cuYds * 27) / 2);
      return { cuYds, bags2cuft };
    },
    formatResult: (res: { cuYds: number; bags2cuft: number }) => ({
      primary: {
        label: 'Bulk Material Needed',
        value: `${res.cuYds.toFixed(2)} yd³`,
        numericValue: res.cuYds
      },
      secondary: [
        { label: 'Or 2 Cu Ft Bags', value: `${res.bags2cuft} bags` }
      ]
    })
  }
];
