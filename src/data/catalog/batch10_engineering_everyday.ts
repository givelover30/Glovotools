import { CalculatorMeta } from '../../types';

export const BATCH10_METADATA: CalculatorMeta[] = [
  // ==========================================
  // ENGINEERING CALCULATORS (18 new, target 20 total with hydraulic-force & kinetic-potential)
  // ==========================================

  // Subcategory: hydraulics-fluid (5)
  {
    id: 'reynolds-number-calc',
    name: 'Reynolds Number Fluid Flow Calculator',
    shortDesc: 'Determine laminar, transient, or turbulent flow regime in pipes: Re = (ρ × v × D) / μ',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    tags: ['engineering', 'reynolds-number', 'fluid-mechanics', 'laminar-flow', 'turbulent-flow'],
    formula: 'Re = (ρ × v × D) / μ',
    isPopular: true,
    iconName: 'Droplet',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'pipe-flow-velocity-calc',
    name: 'Pipe Flow Rate & Velocity Calculator',
    shortDesc: 'Calculate volumetric flow rate in GPM / CFM and fluid velocity through circular pipes',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    tags: ['engineering', 'flow-rate', 'pipe-velocity', 'gpm', 'continuity-equation'],
    formula: 'Q = A × v = (π × D² / 4) × v',
    isPopular: true,
    iconName: 'Wind',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'bernoulli-pressure-calc',
    name: 'Bernoulli Dynamic Pressure & Velocity Head Calculator',
    shortDesc: 'Calculate dynamic fluid pressure head: P_dynamic = 0.5 × ρ × v²',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    tags: ['engineering', 'bernoulli', 'fluid-pressure', 'velocity-head', 'venturi'],
    formula: 'P_dyn = 0.5 × ρ × v²',
    isPopular: false,
    iconName: 'Activity',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'hydraulic-pump-hp-calc',
    name: 'Hydraulic Pump Power (HP) Calculator',
    shortDesc: 'Calculate input mechanical horsepower needed to drive a hydraulic pump: HP = (PSI × GPM) / 1714',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    tags: ['engineering', 'hydraulic-power', 'pump-hp', 'psi', 'gpm', 'hydraulics'],
    formula: 'HP = (Pressure PSI × Flow GPM) / (1714 × Efficiency)',
    isPopular: true,
    iconName: 'Zap',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'poiseuille-flow-calc',
    name: 'Poiseuille Pipe Flow Resistance Calculator',
    shortDesc: 'Calculate viscous laminar flow pressure drop along pipe length: ΔP = (8 × μ × L × Q) / (π × r⁴)',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    tags: ['engineering', 'poiseuille', 'pressure-drop', 'viscosity', 'pipe-loss'],
    formula: 'ΔP = (8 × μ × L × Q) / (π × r⁴)',
    isPopular: false,
    iconName: 'Sliders',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },

  // Subcategory: mechanics-energy (5)
  {
    id: 'torque-hp-rpm-calc',
    name: 'Torque, Horsepower & RPM Calculator',
    shortDesc: 'Convert rotational mechanical power: Horsepower = (Torque lb-ft × RPM) / 5252',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    tags: ['engineering', 'torque', 'horsepower', 'rpm', 'motor-power', 'drivetrain'],
    formula: 'HP = (Torque lb-ft × RPM) / 5252; Torque = (HP × 5252) / RPM',
    isPopular: true,
    iconName: 'RotateCw',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'centrifugal-force-calc',
    name: 'Centripetal Force & Acceleration Calculator',
    shortDesc: 'Calculate inward radial acceleration and G-force in circular motion: Fc = (m × v²) / r',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    tags: ['engineering', 'centripetal-force', 'centrifugal', 'g-force', 'rotational-physics'],
    formula: 'Fc = (m × v²) / r; a = v² / r',
    isPopular: false,
    iconName: 'Compass',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'mechanical-spring-calc',
    name: "Hooke's Law Spring Force & Energy Calculator",
    shortDesc: "Calculate spring restoring force (F = -k × x) and stored elastic potential energy (PE = 0.5 × k × x²)",
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    tags: ['engineering', 'hookes-law', 'spring-constant', 'elastic-energy', 'mechanics'],
    formula: 'F = k × x; PE = 0.5 × k × x²',
    isPopular: true,
    iconName: 'Minimize2',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'gear-ratio-calc',
    name: 'Gear Ratio & Mechanical Advantage Calculator',
    shortDesc: 'Calculate driver-to-driven gear ratio, speed multiplication, and mechanical torque amplification',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    tags: ['engineering', 'gear-ratio', 'mechanical-advantage', 'gearbox', 'teeth-ratio'],
    formula: 'Ratio = Driven Teeth / Driver Teeth; Output RPM = Input RPM / Ratio',
    isPopular: true,
    iconName: 'Settings',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'pendulum-period-calc',
    name: 'Simple Pendulum Oscillation Period Calculator',
    shortDesc: 'Calculate harmonic oscillation period and frequency: T = 2 × π × √(L / g)',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    tags: ['engineering', 'pendulum', 'oscillation', 'harmonic-motion', 'gravity'],
    formula: 'T = 2 × π × √(L / g); f = 1 / T',
    isPopular: false,
    iconName: 'Clock',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },

  // Subcategory: structural-beam (4)
  {
    id: 'beam-bending-stress-calc',
    name: 'Beam Bending Stress (Flexure) Calculator',
    shortDesc: 'Calculate extreme fiber flexural bending stress in structural beams: σ = (M × y) / I',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    tags: ['engineering', 'bending-stress', 'flexure', 'beam-mechanics', 'structural-design'],
    formula: 'σ = (M × y) / I',
    isPopular: true,
    iconName: 'Divide',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'cantilever-deflection-calc',
    name: 'Cantilever Beam Deflection Calculator',
    shortDesc: 'Calculate maximum tip deflection under end point load: δ = (P × L³) / (3 × E × I)',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    tags: ['engineering', 'cantilever', 'beam-deflection', 'modulus-elasticity', 'structures'],
    formula: 'δ_max = (P × L³) / (3 × E × I)',
    isPopular: false,
    iconName: 'TrendingDown',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'euler-column-buckling-calc',
    name: 'Euler Critical Column Buckling Calculator',
    shortDesc: 'Determine critical compressive buckling threshold before column failure: P_cr = (π² × E × I) / (K × L)²',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    tags: ['engineering', 'euler-buckling', 'column-buckling', 'critical-load', 'compressive-failure'],
    formula: 'P_cr = (π² × E × I) / (K × L)²',
    isPopular: false,
    iconName: 'Columns',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'moment-of-inertia-calc',
    name: 'Area Moment of Inertia Calculator',
    shortDesc: 'Calculate second moment of area for rectangular beams (b×h³/12) and solid circular shafts (π×d⁴/64)',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    tags: ['engineering', 'moment-of-inertia', 'second-moment', 'cross-section', 'stiffness'],
    formula: 'Rectangle: I = (b × h³) / 12; Round: I = (π × d⁴) / 64',
    isPopular: true,
    iconName: 'Maximize2',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },

  // Subcategory: thermodynamics (4)
  {
    id: 'heat-transfer-q-calc',
    name: 'Sensible Heat Transfer (Q = mcΔT) Calculator',
    shortDesc: 'Calculate thermal energy required to change material temperature: Q = m × c × ΔT',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    tags: ['engineering', 'heat-transfer', 'specific-heat', 'thermal-energy', 'btu-joules'],
    formula: 'Q = m × c × (T_final - T_initial)',
    isPopular: true,
    iconName: 'Flame',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'thermal-expansion-calc',
    name: 'Linear Thermal Expansion Calculator',
    shortDesc: 'Calculate elongation of steel, aluminum, and copper pipes under temperature swing: ΔL = α × L × ΔT',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    tags: ['engineering', 'thermal-expansion', 'expansion-joint', 'elongation', 'metallurgy'],
    formula: 'ΔL = α × L × ΔT',
    isPopular: false,
    iconName: 'Maximize',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'ideal-gas-law-calc',
    name: 'Ideal Gas Law (PV = nRT) Solver',
    shortDesc: 'Solve pressure, volume, moles, or temperature in ideal gas thermodynamic systems',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    tags: ['engineering', 'ideal-gas-law', 'thermodynamics', 'pressure-volume', 'moles'],
    formula: 'P × V = n × R × T',
    isPopular: true,
    iconName: 'Box',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'carnot-efficiency-calc',
    name: 'Carnot Heat Engine Maximum Efficiency Calculator',
    shortDesc: 'Calculate theoretical maximum thermodynamic efficiency between hot and cold reservoirs: η = 1 - (T_cold / T_hot)',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    tags: ['engineering', 'carnot-efficiency', 'heat-engine', 'thermodynamics', 'thermal-efficiency'],
    formula: 'η = 1 - (T_C / T_H) [in Kelvin]',
    isPopular: false,
    iconName: 'Percent',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },

  // ==========================================
  // EVERYDAY CALCULATORS (12 new, target 14 total with tip-calculator & sales-tax-discount)
  // ==========================================

  // Subcategory: dining-tipping (3)
  {
    id: 'group-split-bill-calc',
    name: 'Group Restaurant Bill & Tax Split Calculator',
    shortDesc: 'Evenly or proportionally split dinner checks among party guests with tip and sales tax',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    tags: ['everyday', 'split-bill', 'restaurant-check', 'party-split', 'group-dining'],
    formula: 'Per Person = [Bill × (1 + Tax% + Tip%)] / Guests',
    isPopular: true,
    iconName: 'Users',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'food-delivery-tip-calc',
    name: 'Food Delivery Driver Tip Calculator',
    shortDesc: 'Calculate fair gratuity for delivery couriers based on miles driven, weather, and order value',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    tags: ['everyday', 'food-delivery', 'delivery-tip', 'doordash-tip', 'courier-gratuity'],
    formula: 'Tip = Max($4, Order × 15% + $1.50 × Miles Over 3)',
    isPopular: true,
    iconName: 'Car',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'bar-tab-drink-calc',
    name: 'Bar Tab & Per-Drink Gratuity Calculator',
    shortDesc: 'Calculate bartender gratuity ($1-$2 per beer/wine or 20% on cocktails) and drink total',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    tags: ['everyday', 'bar-tab', 'bartender-tip', 'cocktail-gratuity', 'drinks'],
    formula: 'Total = Bar Subtotal + (Subtotal × Tip Rate)',
    isPopular: false,
    iconName: 'Wine',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },

  // Subcategory: shopping-discounts (3)
  {
    id: 'double-discount-calc',
    name: 'Stackable Double Discount & Markdown Calculator',
    shortDesc: 'Calculate combined savings from stacked coupons (e.g. 30% off clearance plus extra 15% VIP)',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    tags: ['everyday', 'double-discount', 'stacked-coupons', 'sale-markdown', 'clearance'],
    formula: 'Final = Price × (1 - D1) × (1 - D2)',
    isPopular: true,
    iconName: 'Tag',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'unit-price-comparison-calc',
    name: 'Grocery Unit Price & Best Value Comparison',
    shortDesc: 'Compare two different size packages to find the lower cost per ounce, pound, or gram',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    tags: ['everyday', 'unit-price', 'grocery-savings', 'price-per-ounce', 'smart-shopping'],
    formula: 'Unit Price = Package Cost / Total Units',
    isPopular: true,
    iconName: 'ShoppingCart',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'cash-back-rebate-calc',
    name: 'Credit Card Cash Back & Rebate Calculator',
    shortDesc: 'Calculate annual dollar earnings from category reward credit cards (1.5% - 5%)',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    tags: ['everyday', 'cash-back', 'credit-card-rewards', 'rebates', 'shopping-rewards'],
    formula: 'Cash Back = Annual Spend × (Reward % / 100)',
    isPopular: false,
    iconName: 'CreditCard',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },

  // Subcategory: automotive-fuel (3)
  {
    id: 'road-trip-fuel-calc',
    name: 'Road Trip Gas Cost & Passenger Split Calculator',
    shortDesc: 'Calculate total gas gallons, highway travel fuel expenditure, and equal passenger cost split',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    tags: ['everyday', 'road-trip', 'gas-cost', 'passenger-split', 'travel-budget'],
    formula: 'Cost = (Miles / MPG) × Gas Price; Per Person = Cost / Travelers',
    isPopular: true,
    iconName: 'Compass',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'mpg-cost-per-mile-calc',
    name: 'Fuel Economy & Cost per Mile Calculator',
    shortDesc: 'Determine your vehicle exact fuel cost per mile driven based on MPG and pump gas prices',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    tags: ['everyday', 'cost-per-mile', 'fuel-economy', 'mpg', 'commuting-cost'],
    formula: 'Cost per Mile = Gas Price per Gallon / Vehicle MPG',
    isPopular: true,
    iconName: 'Gauge',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'ev-vs-gas-savings-calc',
    name: 'EV vs Gas Car Annual Fuel Savings Calculator',
    shortDesc: 'Compare annual electric vehicle charging utility cost against traditional internal combustion gasoline',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    tags: ['everyday', 'ev-savings', 'electric-vehicle', 'gas-vs-ev', 'commute-savings'],
    formula: 'Savings = (Annual Miles / MPG × Gas Price) - (Annual Miles × kWh/mi × Power Rate)',
    isPopular: true,
    iconName: 'Zap',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },

  // Subcategory: cooking-baking-ratios (3)
  {
    id: 'recipe-multiplier-calc',
    name: 'Recipe Serving Scaling & Multiplier Calculator',
    shortDesc: 'Scale recipe ingredient quantities up or down precisely based on original and desired servings',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    tags: ['everyday', 'recipe-scaler', 'cooking-math', 'portion-sizes', 'ingredient-scaling'],
    formula: 'New Ingredient = Original Amount × (Target Servings / Original Servings)',
    isPopular: true,
    iconName: 'Utensils',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'bakers-percentage-calc',
    name: "Baker's Percentage & Bread Hydration Calculator",
    shortDesc: 'Calculate sourdough water hydration %, salt, and yeast ratios where total flour equals 100%',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    tags: ['everyday', 'bakers-percentage', 'sourdough', 'bread-hydration', 'baking-math'],
    formula: 'Hydration % = (Water Weight / Flour Weight) × 100',
    isPopular: true,
    iconName: 'PieChart',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'cooking-time-per-pound-calc',
    name: 'Roast Cooking Time per Pound Calculator',
    shortDesc: 'Calculate oven roasting minutes and doneness resting time for turkey, chicken, prime rib, and ham',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    tags: ['everyday', 'roast-calculator', 'turkey-cooking-time', 'prime-rib', 'oven-time'],
    formula: 'Total Minutes = (Weight lbs × Minutes per lb) + Resting Buffer (15 min)',
    isPopular: true,
    iconName: 'Flame',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  }
];
