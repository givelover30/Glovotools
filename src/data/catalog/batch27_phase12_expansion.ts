import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH27_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Calculators subcategories
  { id: 'p12-calc-fin', categoryId: 'financial', name: 'Advanced Financial & Investment Calculators', slug: 'advanced-financial', description: 'Compound frequency, inflation, lease, and dividend calculators', sortOrder: 10 },
  { id: 'p12-calc-sci', categoryId: 'scientific', name: 'Advanced Mathematical & Thermal Calculators', slug: 'advanced-math-thermal', description: 'Navy body fat, matrix determinants, surface integrals, and thermal resistance', sortOrder: 10 },
  { id: 'p12-calc-con', categoryId: 'construction', name: 'Structural & Footing Calculators', slug: 'structural-footing', description: 'Concrete footings and structural calculations', sortOrder: 10 },

  // Converters subcategories
  { id: 'p12-conv', categoryId: 'converter', name: 'Specialized Engineering & Physical Converters', slug: 'specialized-converters', description: 'Fuel economy, torque, pressure head, illuminance, viscosity, and radiation units', sortOrder: 10 },

  // Checkers subcategories
  { id: 'p12-check', categoryId: 'checkers', name: 'Developer & Protocol Security Checkers', slug: 'dev-protocol-checkers', description: 'MAC address, SemVer, CSS selectors, ARIA accessibility, JSON schema, and port validators', sortOrder: 10 },

  // Generators subcategories
  { id: 'p12-gen', categoryId: 'generators', name: 'Advanced Code & Data Generators', slug: 'advanced-generators', description: 'Test credit cards, Markdown lorem, SQL inserts, and CSS flexbox generators', sortOrder: 10 },

  // Planners subcategories
  { id: 'p12-plan', categoryId: 'planners', name: 'Specialized Lifestyle & Business Planners', slug: 'specialized-planners', description: 'Freelance rate, wedding budget, fitness, meal prep, and side hustle planners', sortOrder: 10 },

  // Tools subcategories
  { id: 'p12-tools', categoryId: 'tools', name: 'Advanced Developer Utilities & Formatters', slug: 'advanced-dev-tools', description: 'SQL formatters, live markdown previewer, color shades, SVG path inspector, and ASCII art', sortOrder: 10 },

  // Trackers subcategories
  { id: 'p12-track', categoryId: 'trackers', name: 'Health, Focus & Milestone Trackers', slug: 'health-focus-trackers', description: 'Caffeine intake, savings goals, blood pressure, study sessions, and book reading', sortOrder: 10 },

  // Guides subcategories
  { id: 'p12-guides', categoryId: 'guides', name: 'Engineering & DevOps Reference Guides', slug: 'devops-engineering-guides', description: 'Git, Docker, Linux CLI, IDE shortcuts, HTTP methods, and Regex cheat sheets', sortOrder: 10 }
];

export const BATCH27_METADATA: CalculatorMeta[] = [
  // --- CALCULATORS (10) ---
  {
    id: 'compound-frequency-calc',
    name: 'Compound Frequency Converter & Calculator',
    shortDesc: 'Compare investment growth across daily, monthly, quarterly, and annual compounding frequencies',
    category: 'financial',
    subcategoryId: 'p12-calc-fin',
    tags: ['financial', 'compound-interest', 'frequency', 'investment', 'growth'],
    formula: 'A = P × (1 + r/n)^(nt)',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'inflation-purchasing-calc',
    name: 'Inflation & Purchasing Power Calculator',
    shortDesc: 'Calculate future purchasing power degradation and cost adjustments over multi-year inflation rates',
    category: 'financial',
    subcategoryId: 'p12-calc-fin',
    tags: ['financial', 'inflation', 'purchasing-power', 'money', 'cost'],
    formula: 'Future Cost = Present Cost × (1 + inflation)^years',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'car-lease-calc',
    name: 'Car Lease Payment & Residual Calculator',
    shortDesc: 'Estimate monthly automobile lease payments including depreciation, finance fee, and sales tax',
    category: 'financial',
    subcategoryId: 'p12-calc-fin',
    tags: ['financial', 'car-lease', 'depreciation', 'auto', 'payment'],
    formula: 'Monthly Payment = (Net Cap Cost - Residual) / Term + (Net Cap Cost + Residual) × Money Factor',
    isPopular: false,
    iconName: 'Car',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'p12-dividend-yield-calc',
    name: 'Stock Dividend Yield & Return Calculator',
    shortDesc: 'Calculate annual dividend yield, payout ratios, and projected dividend reinvestment growth',
    category: 'financial',
    subcategoryId: 'p12-calc-fin',
    tags: ['financial', 'stocks', 'dividend', 'yield', 'investing'],
    formula: 'Dividend Yield = (Annual Dividend / Share Price) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'p12-body-fat-navy-calc',
    name: 'US Navy Body Fat Percentage Calculator',
    shortDesc: 'Estimate body fat percentage using standard US Navy circumference tape measurements',
    category: 'health-fitness',
    subcategoryId: 'p12-calc-sci',
    tags: ['health', 'body-fat', 'navy', 'fitness', 'metrics'],
    formula: 'US Navy Circumference regression formula',
    isPopular: false,
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'p12-concrete-footing-calc',
    name: 'Concrete Footing & Pier Calculator',
    shortDesc: 'Calculate cubic yards and premix bags required for square or circular concrete footings and piers',
    category: 'construction',
    subcategoryId: 'p12-calc-con',
    tags: ['construction', 'concrete', 'footing', 'pier', 'foundation'],
    formula: 'Volume = Length × Width × Depth / 27',
    isPopular: false,
    iconName: 'Hammer',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  {
    id: 'triangle-solver-calc',
    name: 'Advanced Triangle Angle & Side Solver',
    shortDesc: 'Solve missing sides and angles of any triangle using Law of Sines and Law of Cosines',
    category: 'scientific',
    subcategoryId: 'p12-calc-sci',
    tags: ['math', 'triangle', 'geometry', 'trigonometry', 'solver'],
    formula: 'c² = a² + b² - 2ab cos(C)',
    isPopular: false,
    iconName: 'Triangle',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'matrix-determinant-calc',
    name: '2x2 & 3x3 Matrix Determinant & Inverse Calculator',
    shortDesc: 'Compute determinants, transpose, and inverse matrices for 2x2 and 3x3 arrays',
    category: 'scientific',
    subcategoryId: 'p12-calc-sci',
    tags: ['math', 'matrix', 'determinant', 'inverse', 'algebra'],
    formula: 'det(A) = ad - bc for 2x2 matrix',
    isPopular: false,
    iconName: 'Binary',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF'
  },
  {
    id: 'surface-integral-calc',
    name: 'Surface Area & Flux Estimation Calculator',
    shortDesc: 'Estimate parametric surface areas and vector field flux integrals numerically',
    category: 'scientific',
    subcategoryId: 'p12-calc-sci',
    tags: ['math', 'calculus', 'surface-integral', 'flux', 'scientific'],
    formula: '∬ S F · dS = ∬ F(r(u,v)) · (r_u × r_v) du dv',
    isPopular: false,
    iconName: 'Atom',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'thermal-resistance-calc',
    name: 'R-Value & Thermal Resistance Wall Calculator',
    shortDesc: 'Calculate total R-value, U-factor, and heat transfer rate across multi-layer walls',
    category: 'scientific',
    subcategoryId: 'p12-calc-sci',
    tags: ['engineering', 'thermal', 'r-value', 'insulation', 'heat-transfer'],
    formula: 'R_total = R1 + R2 + ... + Rn; U = 1 / R_total',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },

  // --- CONVERTERS (6) ---
  {
    id: 'p12-fuel-economy-converter',
    name: 'Fuel Economy (MPG, L/100km, km/L) Converter',
    shortDesc: 'Convert fuel efficiency between Miles per Gallon (US/Imp), Liters per 100km, and Kilometers per Liter',
    category: 'converter',
    subcategoryId: 'p12-conv',
    tags: ['converter', 'fuel', 'mpg', 'l100km', 'automotive'],
    formula: 'L/100km = 235.215 / MPG (US)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p12-torque-converter',
    name: 'Torque & Moment of Force Unit Converter',
    shortDesc: 'Convert rotational torque between Nm, lb-ft, lb-in, kgf-m, and oz-in',
    category: 'converter',
    subcategoryId: 'p12-conv',
    tags: ['converter', 'torque', 'moment', 'engineering', 'units'],
    formula: '1 lb-ft = 1.355818 Nm',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'pressure-head-converter',
    name: 'Pressure Head & Hydraulic Head Converter',
    shortDesc: 'Convert fluid pressure between meters/feet of head, psi, kPa, and bar',
    category: 'converter',
    subcategoryId: 'p12-conv',
    tags: ['converter', 'pressure', 'hydraulic', 'head', 'fluid'],
    formula: 'Head (m) = Pressure (Pa) / (Density × Gravity)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'illuminance-converter',
    name: 'Illuminance & Luminance Unit Converter',
    shortDesc: 'Convert lighting units between Lux, Foot-candles, Phot, Nox, and Lumens/m²',
    category: 'converter',
    subcategoryId: 'p12-conv',
    tags: ['converter', 'illuminance', 'lux', 'foot-candle', 'lighting'],
    formula: '1 Foot-candle = 10.764 Lux',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'viscosity-converter',
    name: 'Dynamic & Kinematic Viscosity Converter',
    shortDesc: 'Convert fluid viscosity between Centipoise, Pascal-seconds, Stokes, and Centistokes',
    category: 'converter',
    subcategoryId: 'p12-conv',
    tags: ['converter', 'viscosity', 'fluid', 'physics', 'units'],
    formula: '1 Poise = 0.1 Pa·s',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'radiation-dose-converter',
    name: 'Radiation Dose & Activity Unit Converter',
    shortDesc: 'Convert ionizing radiation between Grays, Sieverts, Rads, Rems, Becquerels, and Curies',
    category: 'converter',
    subcategoryId: 'p12-conv',
    tags: ['converter', 'radiation', 'sievert', 'gray', 'physics'],
    formula: '1 Sv = 100 rem',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // --- CHECKERS (6) ---
  {
    id: 'mac-address-checker',
    name: 'MAC Address Format & OUI Validator',
    shortDesc: 'Validate MAC address formatting (colon, hyphen, dot notation) and extract manufacturer OUI vendor info',
    category: 'checkers',
    subcategoryId: 'p12-check',
    tags: ['checker', 'mac-address', 'networking', 'oui', 'hardware'],
    formula: 'Regex match ^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'semver-checker',
    name: 'Semantic Version (SemVer) Compatibility Checker',
    shortDesc: 'Validate semantic version strings (MAJOR.MINOR.PATCH) and test caret (^) and tilde (~) range matching',
    category: 'checkers',
    subcategoryId: 'p12-check',
    tags: ['checker', 'semver', 'version', 'developer', 'npm'],
    formula: 'SemVer 2.0.0 specification matching rules',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'css-selector-checker',
    name: 'CSS Selector Syntax & Specificity Checker',
    shortDesc: 'Analyze CSS selector specificity scores (ID, class, element counts) and validate syntax',
    category: 'checkers',
    subcategoryId: 'p12-check',
    tags: ['checker', 'css', 'selector', 'specificity', 'frontend'],
    formula: 'Specificity tuple (a, b, c) evaluation',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'html-accessibility-checker',
    name: 'Basic HTML Accessibility (ARIA) Checker',
    shortDesc: 'Audit HTML snippets for missing alt attributes, unlabelled form controls, and ARIA compliance',
    category: 'checkers',
    subcategoryId: 'p12-check',
    tags: ['checker', 'accessibility', 'aria', 'html', 'wcag'],
    formula: 'DOM attribute audit heuristic rules',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'json-schema-checker',
    name: 'JSON Schema Structure Validator',
    shortDesc: 'Validate JSON payload structures against defined type schemas and required properties',
    category: 'checkers',
    subcategoryId: 'p12-check',
    tags: ['checker', 'json', 'schema', 'validation', 'developer'],
    formula: 'Type and property constraint matching',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'port-number-checker',
    name: 'TCP/UDP Port Number & Service Validator',
    shortDesc: 'Verify standard port assignments, well-known ports (0-1023), registered ports, and ephemeral ranges',
    category: 'checkers',
    subcategoryId: 'p12-check',
    tags: ['checker', 'port', 'networking', 'tcp', 'udp'],
    formula: 'Port range 0 <= port <= 65535 classification',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },

  // --- GENERATORS (6) ---
  {
    id: 'dummy-credit-card-generator',
    name: 'Test Credit Card Number Generator (Luhn-compliant)',
    shortDesc: 'Generate valid test credit card numbers for Visa, Mastercard, Amex, and Discover passing Luhn check',
    category: 'generators',
    subcategoryId: 'p12-gen',
    tags: ['generator', 'credit-card', 'luhn', 'testing', 'dummy'],
    formula: 'Luhn algorithm checksum generation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'lorem-markdown-generator',
    name: 'Markdown Lorem Ipsum & Dummy Article Generator',
    shortDesc: 'Generate structured Markdown placeholder text including headings, lists, blockquotes, and code blocks',
    category: 'generators',
    subcategoryId: 'p12-gen',
    tags: ['generator', 'lorem-ipsum', 'markdown', 'placeholder', 'text'],
    formula: 'Markdown syntax template expansion',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'slugify-generator',
    name: 'Advanced URL Slug & Identifier Generator',
    shortDesc: 'Convert titles and phrases into clean URL slugs with custom separators and accent folding',
    category: 'generators',
    subcategoryId: 'p12-gen',
    tags: ['generator', 'slug', 'url', 'seo', 'text'],
    formula: 'Normalize unicode -> remove non-alphanumeric -> replace spaces with separator',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'sql-insert-generator',
    name: 'SQL INSERT Statement Generator from Data',
    shortDesc: 'Transform CSV or tabular text rows into ready-to-run SQL INSERT statements',
    category: 'generators',
    subcategoryId: 'p12-gen',
    tags: ['generator', 'sql', 'insert', 'database', 'developer'],
    formula: 'Row tokenization -> SQL string formatting',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'css-flexbox-generator',
    name: 'CSS Flexbox Code & Layout Generator',
    shortDesc: 'Configure flex-direction, justify-content, align-items, and gap interactively, exporting clean CSS',
    category: 'generators',
    subcategoryId: 'p12-gen',
    tags: ['generator', 'css', 'flexbox', 'layout', 'frontend'],
    formula: 'CSS property composition',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'box-shadow-css-generator',
    name: 'Advanced Multi-Layer CSS Box-Shadow Generator',
    shortDesc: 'Design layered drop shadows with adjustable blur, spread, offset, opacity, and color',
    category: 'generators',
    subcategoryId: 'p12-gen',
    tags: ['generator', 'css', 'box-shadow', 'shadow', 'design'],
    formula: 'box-shadow: x y blur spread color composition',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },

  // --- PLANNERS (5) ---
  {
    id: 'freelance-rate-planner',
    name: 'Freelancer Hourly Rate & Billable Hours Planner',
    shortDesc: 'Calculate target hourly and daily freelance rates based on desired salary, overhead, and billable hours',
    category: 'planners',
    subcategoryId: 'p12-plan',
    tags: ['planner', 'freelance', 'hourly-rate', 'business', 'income'],
    formula: 'Hourly Rate = (Desired Income + Expenses + Taxes) / Billable Hours',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'wedding-budget-planner',
    name: 'Wedding Budget & Expense Allocation Planner',
    shortDesc: 'Plan wedding expenses across venue, catering, photography, attire, and floral allocations',
    category: 'planners',
    subcategoryId: 'p12-plan',
    tags: ['planner', 'wedding', 'budget', 'event', 'expenses'],
    formula: 'Category Budget = Total Budget × Industry Percentage',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'fitness-workout-planner',
    name: 'Weekly Fitness Routine & Split Planner',
    shortDesc: 'Organize a balanced weekly exercise split (Push/Pull/Legs, Upper/Lower, Full Body) with recovery days',
    category: 'planners',
    subcategoryId: 'p12-plan',
    tags: ['planner', 'fitness', 'workout', 'routine', 'health'],
    formula: 'Training volume and frequency scheduling',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'meal-prep-planner',
    name: 'Weekly Meal Prep & Grocery Schedule Planner',
    shortDesc: 'Plan breakfast, lunch, dinner, and snacks for the week and auto-generate aggregated grocery lists',
    category: 'planners',
    subcategoryId: 'p12-plan',
    tags: ['planner', 'meal-prep', 'grocery', 'food', 'nutrition'],
    formula: 'Ingredient aggregation and meal matrix',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'side-hustle-planner',
    name: 'Side Business Milestone & Launch Planner',
    shortDesc: 'Structure side hustle launch phases, revenue goals, marketing tasks, and weekly time commitments',
    category: 'planners',
    subcategoryId: 'p12-plan',
    tags: ['planner', 'side-hustle', 'business', 'launch', 'startup'],
    formula: 'Milestone timeline scheduling',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },

  // --- TOOLS & UTILITIES (6) ---
  {
    id: 'sql-formatter',
    name: 'SQL Query Formatter & Minifier',
    shortDesc: 'Format messy SQL queries with proper capitalization, indentation, and clause line breaks',
    category: 'tools',
    subcategoryId: 'p12-tools',
    tags: ['tools', 'sql', 'formatter', 'database', 'developer'],
    formula: 'Keyword parsing and indentation algorithm',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'markdown-preview-tool',
    name: 'Live Markdown Previewer & HTML Exporter',
    shortDesc: 'Type markdown in real-time and view rendered HTML output with instant copy and export options',
    category: 'tools',
    subcategoryId: 'p12-tools',
    tags: ['tools', 'markdown', 'preview', 'html', 'editor'],
    formula: 'Markdown parser to DOM renderer',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'color-shade-tint-tool',
    name: 'CSS Color Palette Shade & Tint Generator',
    shortDesc: 'Input any hex or RGB color and generate a complete spectrum of 10 shades and tints',
    category: 'tools',
    subcategoryId: 'p12-tools',
    tags: ['tools', 'color', 'palette', 'shades', 'design'],
    formula: 'RGB interpolation towards black (shades) and white (tints)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'svg-path-inspector',
    name: 'SVG Path Data Inspector & Bounding Box Tool',
    shortDesc: 'Analyze SVG path command strings (`M`, `L`, `C`, `Q`, `Z`), count nodes, and inspect coordinates',
    category: 'tools',
    subcategoryId: 'p12-tools',
    tags: ['tools', 'svg', 'path', 'graphics', 'developer'],
    formula: 'SVG path command tokenization',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'text-statistics-analyzer',
    name: 'Advanced Text Readability & Syllable Analyzer',
    shortDesc: 'Calculate Flesch-Kincaid readability scores, sentence length, and syllable counts',
    category: 'tools',
    subcategoryId: 'p12-tools',
    tags: ['tools', 'text', 'readability', 'flesch-kincaid', 'analysis'],
    formula: '0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'ascii-banner-generator',
    name: 'ASCII Art Text Banner & Font Generator',
    shortDesc: 'Convert standard text strings into large ASCII art banner typography for terminal headers',
    category: 'tools',
    subcategoryId: 'p12-tools',
    tags: ['tools', 'ascii', 'art', 'banner', 'typography'],
    formula: 'Glyph matrix font mapping',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },

  // --- TRACKERS (5) ---
  {
    id: 'caffeine-intake-tracker',
    name: 'Daily Caffeine Consumption & Half-Life Tracker',
    shortDesc: 'Track daily coffee, tea, and energy drink caffeine intake and model body elimination half-life curves',
    category: 'trackers',
    subcategoryId: 'p12-track',
    tags: ['trackers', 'caffeine', 'health', 'coffee', 'half-life'],
    formula: 'Remaining Caffeine = Initial × (0.5)^(elapsed / 5 hours)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'saving-goal-tracker',
    name: 'Financial Savings Milestone & Progress Tracker',
    shortDesc: 'Track progress toward financial savings milestones with percentage completion and time remaining',
    category: 'trackers',
    subcategoryId: 'p12-track',
    tags: ['trackers', 'savings', 'goals', 'finance', 'milestone'],
    formula: 'Progress % = (Saved Amount / Target Goal) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'blood-pressure-tracker',
    name: 'Blood Pressure & Pulse Log Tracker',
    shortDesc: 'Log systolic and diastolic blood pressure readings and classify hypertension categories (Normal, Stage 1/2)',
    category: 'trackers',
    subcategoryId: 'p12-track',
    tags: ['trackers', 'blood-pressure', 'health', 'pulse', 'medical'],
    formula: 'AHA hypertension classification rules',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'study-session-tracker',
    name: 'Pomodoro & Study Focus Session Tracker',
    shortDesc: 'Track daily study sessions, completed Pomodoro intervals, and cumulative focus hours',
    category: 'trackers',
    subcategoryId: 'p12-track',
    tags: ['trackers', 'study', 'pomodoro', 'focus', 'productivity'],
    formula: 'Total Focus Hours = Completed Sessions × 25 minutes',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'book-reading-tracker',
    name: 'Book Chapter & Reading Progress Tracker',
    shortDesc: 'Log current page and chapter reading progress across active books with percentage completion',
    category: 'trackers',
    subcategoryId: 'p12-track',
    tags: ['trackers', 'reading', 'books', 'chapters', 'progress'],
    formula: 'Progress % = (Current Page / Total Pages) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },

  // --- GUIDES & REFERENCES (6) ---
  {
    id: 'git-commands-reference',
    name: 'Essential Git Version Control Commands Cheat Sheet',
    shortDesc: 'Comprehensive quick reference for Git branching, merging, rebasing, stash, and cherry-pick commands',
    category: 'guides',
    subcategoryId: 'p12-guides',
    tags: ['guides', 'git', 'version-control', 'developer', 'cheatsheet'],
    formula: 'Git CLI command documentation',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'docker-commands-reference',
    name: 'Docker Container & CLI Reference Guide',
    shortDesc: 'Quick reference guide for Docker build, run, exec, compose, volumes, and network commands',
    category: 'guides',
    subcategoryId: 'p12-guides',
    tags: ['guides', 'docker', 'containers', 'devops', 'cheatsheet'],
    formula: 'Docker CLI command reference',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'linux-cli-reference',
    name: 'Common Linux Terminal & File Permissions Reference',
    shortDesc: 'Quick reference for chmod octal permissions, grep, awk, sed, find, and process management commands',
    category: 'guides',
    subcategoryId: 'p12-guides',
    tags: ['guides', 'linux', 'terminal', 'permissions', 'cheatsheet'],
    formula: 'Linux shell command reference',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'keyboard-shortcuts-reference',
    name: 'Pro IDE Keyboard Shortcuts Cheat Sheet',
    shortDesc: 'Essential keyboard shortcuts for VS Code, JetBrains, Sublime Text, and Vim navigation',
    category: 'guides',
    subcategoryId: 'p12-guides',
    tags: ['guides', 'keyboard-shortcuts', 'ide', 'vscode', 'cheatsheet'],
    formula: 'IDE shortcut mapping guide',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'http-methods-reference',
    name: 'RESTful HTTP Methods & Status Codes Guide',
    shortDesc: 'Complete reference guide for GET, POST, PUT, DELETE, PATCH and HTTP status codes (2xx, 3xx, 4xx, 5xx)',
    category: 'guides',
    subcategoryId: 'p12-guides',
    tags: ['guides', 'http', 'rest', 'api', 'status-codes'],
    formula: 'RFC 7231 HTTP protocol specification',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'regex-cheatsheet-reference',
    name: 'Regular Expressions Pattern Syntax Cheat Sheet',
    shortDesc: 'Comprehensive reference for regex quantifiers, anchors, character classes, groups, and lookaheads',
    category: 'guides',
    subcategoryId: 'p12-guides',
    tags: ['guides', 'regex', 'regular-expressions', 'syntax', 'cheatsheet'],
    formula: 'Regular expression engine pattern guide',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
