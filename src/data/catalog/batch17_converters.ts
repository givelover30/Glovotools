import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH17_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'universal-conversions',
    categoryId: 'converter',
    name: 'Universal & Multi-Unit',
    slug: 'universal-conversions',
    description: 'Convert values across any physical dimension with real-time multi-unit comparison',
    sortOrder: 1
  },
  {
    id: 'length-distance',
    categoryId: 'converter',
    name: 'Length & Distance',
    slug: 'length-distance',
    description: 'Convert meters, feet, inches, kilometers, miles, yards, and nautical units',
    sortOrder: 2
  },
  {
    id: 'mass-weight',
    categoryId: 'converter',
    name: 'Weight & Mass',
    slug: 'weight-mass',
    description: 'Convert kilograms, pounds, grams, ounces, stones, and metric tons',
    sortOrder: 3
  },
  {
    id: 'temperature-units',
    categoryId: 'converter',
    name: 'Temperature',
    slug: 'temperature',
    description: 'Convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K)',
    sortOrder: 4
  },
  {
    id: 'volume-capacity',
    categoryId: 'converter',
    name: 'Volume & Capacity',
    slug: 'volume-capacity',
    description: 'Convert liters, gallons, milliliters, fluid ounces, cubic meters, and cubic feet',
    sortOrder: 5
  },
  {
    id: 'area-surface',
    categoryId: 'converter',
    name: 'Area & Land Surface',
    slug: 'area-surface',
    description: 'Convert square meters, square feet, acres, hectares, and square kilometers',
    sortOrder: 6
  },
  {
    id: 'digital-storage',
    categoryId: 'converter',
    name: 'Digital Data & Storage',
    slug: 'digital-storage',
    description: 'Convert Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, and Petabytes',
    sortOrder: 7
  },
  {
    id: 'speed-velocity',
    categoryId: 'converter',
    name: 'Speed & Velocity',
    slug: 'speed-velocity',
    description: 'Convert km/h, mph, meters/second, knots, and feet/second',
    sortOrder: 8
  },
  {
    id: 'pressure-stress',
    categoryId: 'converter',
    name: 'Pressure & Stress',
    slug: 'pressure-stress',
    description: 'Convert Pascal, Bar, PSI, Standard Atmospheres (atm), and Kilopascals',
    sortOrder: 9
  },
  {
    id: 'energy-power',
    categoryId: 'converter',
    name: 'Energy & Power',
    slug: 'energy-power',
    description: 'Convert Joules, Kilowatt-hours (kWh), Calories, BTUs, and Watts',
    sortOrder: 10
  },
  {
    id: 'angle-conversion',
    categoryId: 'converter',
    name: 'Angle',
    slug: 'angle',
    description: 'Convert degrees, radians, gradians, arcminutes, and arcseconds',
    sortOrder: 11
  },
  {
    id: 'fuel-economy',
    categoryId: 'converter',
    name: 'Fuel Economy',
    slug: 'fuel-economy',
    description: 'Convert km/L, L/100km, US MPG, and Imperial MPG',
    sortOrder: 12
  },
  {
    id: 'torque-units',
    categoryId: 'converter',
    name: 'Torque',
    slug: 'torque',
    description: 'Convert Newton-meters, pound-feet, pound-inches, and kgf-meters',
    sortOrder: 13
  },
  {
    id: 'force-units',
    categoryId: 'converter',
    name: 'Force',
    slug: 'force',
    description: 'Convert Newtons, kilonewtons, pound-force, kilogram-force, and dynes',
    sortOrder: 14
  },
  {
    id: 'cooking-measurements',
    categoryId: 'converter',
    name: 'Cooking Measurement',
    slug: 'cooking',
    description: 'Convert cups, tablespoons, teaspoons, milliliters, fluid ounces, pints, and quarts',
    sortOrder: 15
  },
  {
    id: 'typography-units',
    categoryId: 'converter',
    name: 'Typography',
    slug: 'typography',
    description: 'Convert pixels (px), REM, EM, points (pt), and percentages (%)',
    sortOrder: 16
  },
  {
    id: 'data-transfer',
    categoryId: 'converter',
    name: 'Data Transfer Rate',
    slug: 'data-transfer-rate',
    description: 'Convert bps, Kbps, Mbps, Gbps, KB/s, and MB/s',
    sortOrder: 17
  },
  {
    id: 'sound-level',
    categoryId: 'converter',
    name: 'Sound Level',
    slug: 'sound-level',
    description: 'Convert decibels (dB), bels, nepers, and microbar',
    sortOrder: 18
  },
  {
    id: 'shoe-sizes',
    categoryId: 'converter',
    name: 'Shoe Size',
    slug: 'shoe-size',
    description: 'Convert US Men, US Women, UK, EU, and Centimeter foot lengths',
    sortOrder: 19
  },
  {
    id: 'clothing-sizes',
    categoryId: 'converter',
    name: 'Clothing Size',
    slug: 'clothing-size',
    description: 'Convert US, UK/AU, EU, and International apparel sizes (XS to XXL)',
    sortOrder: 20
  }
];

export const BATCH17_METADATA: CalculatorMeta[] = [
  // 1. Universal Unit Converter
  {
    id: 'universal-unit-converter',
    name: 'Universal Unit Converter & Comparison Matrix',
    shortDesc: 'Instant multi-unit conversion and side-by-side comparison matrix across all measurement dimensions',
    category: 'converter',
    subcategoryId: 'universal-conversions',
    tags: ['converter', 'units', 'universal', 'measurement', 'matrix', 'metric', 'imperial'],
    formula: 'TargetValue = (SourceValue × SourceFactor + SourceOffset - TargetOffset) / TargetFactor',
    isPopular: true,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 2. Length & Distance Converter
  {
    id: 'length-converter',
    name: 'Length & Distance Unit Converter',
    shortDesc: 'Convert metric and imperial lengths: meters, kilometers, feet, inches, yards, and miles',
    category: 'converter',
    subcategoryId: 'length-distance',
    tags: ['converter', 'length', 'distance', 'meters', 'feet', 'inches', 'miles', 'metric'],
    formula: 'Length_target = Length_base × Multiplier',
    isPopular: true,
    iconName: 'Ruler',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 3. Weight & Mass Converter
  {
    id: 'weight-mass-converter',
    name: 'Weight & Mass Unit Converter',
    shortDesc: 'Convert metric and imperial mass: kilograms, pounds (lbs), grams, ounces, stones, and metric tons',
    category: 'converter',
    subcategoryId: 'mass-weight',
    tags: ['converter', 'weight', 'mass', 'kg', 'pounds', 'lbs', 'grams', 'ounces'],
    formula: 'Mass_target = Mass_base × Multiplier',
    isPopular: true,
    iconName: 'Scale',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 4. Temperature Converter
  {
    id: 'temperature-converter',
    name: 'Temperature Unit Converter (°C, °F, K)',
    shortDesc: 'Convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K) temperature scales',
    category: 'converter',
    subcategoryId: 'temperature-units',
    tags: ['converter', 'temperature', 'celsius', 'fahrenheit', 'kelvin', 'thermal'],
    formula: '°F = (°C × 9/5) + 32; K = °C + 273.15',
    isPopular: true,
    iconName: 'Flame',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // 5. Volume & Capacity Converter
  {
    id: 'volume-converter',
    name: 'Volume & Liquid Capacity Converter',
    shortDesc: 'Convert fluid capacity: liters, milliliters, US gallons, imperial gallons, cubic meters, and fluid ounces',
    category: 'converter',
    subcategoryId: 'volume-capacity',
    tags: ['converter', 'volume', 'capacity', 'liters', 'gallons', 'fluid-ounces', 'liquid'],
    formula: 'Volume_target = Volume_base × Multiplier',
    isPopular: false,
    iconName: 'Droplet',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 6. Area & Land Surface Converter
  {
    id: 'area-converter',
    name: 'Area & Land Surface Unit Converter',
    shortDesc: 'Convert planar and land surface areas: square meters, square feet, acres, hectares, and square kilometers',
    category: 'converter',
    subcategoryId: 'area-surface',
    tags: ['converter', 'area', 'land', 'acres', 'hectares', 'sqft', 'sqm'],
    formula: 'Area_target = Area_base × Multiplier',
    isPopular: false,
    iconName: 'Shapes',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  // 7. Digital Storage Converter
  {
    id: 'digital-storage-converter',
    name: 'Digital Data & Byte Storage Converter',
    shortDesc: 'Convert digital storage: Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, Petabytes, and Bits',
    category: 'converter',
    subcategoryId: 'digital-storage',
    tags: ['converter', 'digital', 'storage', 'bytes', 'mb', 'gb', 'tb', 'bits'],
    formula: 'Bytes_target = Value × 1024^(PowerFrom - PowerTo)',
    isPopular: false,
    iconName: 'Binary',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 8. Speed & Velocity Converter
  {
    id: 'speed-converter',
    name: 'Speed & Velocity Unit Converter',
    shortDesc: 'Convert speeds: kilometers per hour (km/h), miles per hour (mph), meters/sec, and knots',
    category: 'converter',
    subcategoryId: 'speed-velocity',
    tags: ['converter', 'speed', 'velocity', 'kmh', 'mph', 'knots', 'meters-per-sec'],
    formula: 'Speed_target = Speed_base × Multiplier',
    isPopular: false,
    iconName: 'Gauge',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 9. Pressure & Stress Converter
  {
    id: 'pressure-converter',
    name: 'Pressure & Atmospheric Stress Converter',
    shortDesc: 'Convert pressure: Pascal (Pa), Kilopascals (kPa), Bar, PSI, and Standard Atmospheres (atm)',
    category: 'converter',
    subcategoryId: 'pressure-stress',
    tags: ['converter', 'pressure', 'psi', 'bar', 'pascal', 'kpa', 'atm'],
    formula: 'Pressure_target = Pressure_base × Multiplier',
    isPopular: false,
    iconName: 'Minimize2',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 10. Energy & Power Converter
  {
    id: 'energy-power-converter',
    name: 'Energy, Work & Power Converter',
    shortDesc: 'Convert energy and mechanical work: Joules, Kilowatt-hours (kWh), Calories, BTUs, and foot-pounds',
    category: 'converter',
    subcategoryId: 'energy-power',
    tags: ['converter', 'energy', 'power', 'joules', 'kwh', 'calories', 'btu'],
    formula: 'Energy_target = Energy_base × Multiplier',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 11. Time & Frequency Converter
  {
    id: 'time-frequency-converter',
    name: 'Time Duration & Frequency Converter',
    shortDesc: 'Convert time durations: seconds, minutes, hours, days, weeks, months, years, and Hertz frequency',
    category: 'converter',
    subcategoryId: 'universal-conversions',
    tags: ['converter', 'time', 'duration', 'frequency', 'seconds', 'hours', 'hertz'],
    formula: 'Time_target = Time_base × Multiplier; Frequency f = 1/T',
    isPopular: false,
    iconName: 'Clock',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  },
  // Phase 9A Converters (10 new)
  {
    id: 'angle-converter',
    name: 'Angle Unit Converter',
    shortDesc: 'Convert angular measurements: degrees, radians, gradians, arcminutes, and arcseconds',
    category: 'converter',
    subcategoryId: 'angle-conversion',
    tags: ['converter', 'angle', 'degrees', 'radians', 'gradians', 'geometry'],
    formula: 'Radians = Degrees × (π / 180)',
    isPopular: false,
    iconName: 'Compass',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'fuel-economy-converter',
    name: 'Fuel Economy Converter (km/L, L/100km, MPG)',
    shortDesc: 'Convert vehicle fuel efficiency: km/L, liters per 100km, US MPG, and Imperial MPG',
    category: 'converter',
    subcategoryId: 'fuel-economy',
    tags: ['converter', 'fuel', 'mpg', 'l100km', 'efficiency', 'car'],
    formula: 'L/100km = 100 / (km/L)',
    isPopular: true,
    iconName: 'Gauge',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'torque-converter',
    name: 'Torque Unit Converter',
    shortDesc: 'Convert rotational torque: Newton-meters (N·m), pound-feet (lb·ft), pound-inches, and kgf·m',
    category: 'converter',
    subcategoryId: 'torque-units',
    tags: ['converter', 'torque', 'nm', 'lbft', 'mechanics', 'engine'],
    formula: 'Torque_target = Torque_base × Multiplier',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF'
  },
  {
    id: 'force-converter',
    name: 'Force Unit Converter',
    shortDesc: 'Convert physical force: Newtons, kilonewtons, pound-force (lbf), kilogram-force, and dynes',
    category: 'converter',
    subcategoryId: 'force-units',
    tags: ['converter', 'force', 'newtons', 'lbf', 'physics'],
    formula: 'Force_target = Force_base × Multiplier',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#A855F7',
    iconBg: '#FAF5FF'
  },
  {
    id: 'cooking-measurement-converter',
    name: 'Cooking & Baking Measurement Converter',
    shortDesc: 'Convert culinary volumes: cups, tablespoons, teaspoons, milliliters, fluid ounces, pints, and quarts',
    category: 'converter',
    subcategoryId: 'cooking-measurements',
    tags: ['converter', 'cooking', 'cups', 'tablespoons', 'recipe', 'kitchen', 'baking'],
    formula: 'Volume_target = Volume_base × Multiplier',
    isPopular: true,
    iconName: 'Utensils',
    iconColor: '#10B981',
    iconBg: '#ECFDF5'
  },
  {
    id: 'typography-converter',
    name: 'Typography Unit Converter (PX, REM, EM, PT)',
    shortDesc: 'Convert web typography units: pixels (px), REM, EM, points (pt), and percentage (%)',
    category: 'converter',
    subcategoryId: 'typography-units',
    tags: ['converter', 'typography', 'px', 'rem', 'em', 'pt', 'css', 'web'],
    formula: 'REM = Pixels / 16',
    isPopular: true,
    iconName: 'Type',
    iconColor: '#6366F1',
    iconBg: '#EEF2FF'
  },
  {
    id: 'data-transfer-rate-converter',
    name: 'Data Transfer Rate Converter',
    shortDesc: 'Convert internet and network speeds: bps, Kbps, Mbps, Gbps, KB/s, and MB/s',
    category: 'converter',
    subcategoryId: 'data-transfer',
    tags: ['converter', 'network', 'mbps', 'bandwidth', 'internet', 'speed'],
    formula: 'Rate_target = Rate_base × Multiplier',
    isPopular: false,
    iconName: 'Wifi',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'sound-level-converter',
    name: 'Sound Level & Acoustic Converter',
    shortDesc: 'Convert acoustic levels: decibels (dB), bels, nepers, and microbar pressure',
    category: 'converter',
    subcategoryId: 'sound-level',
    tags: ['converter', 'sound', 'decibels', 'db', 'audio', 'acoustics'],
    formula: 'Bels = Decibels / 10',
    isPopular: false,
    iconName: 'Volume2',
    iconColor: '#EC4899',
    iconBg: '#FFF1F2'
  },
  {
    id: 'shoe-size-converter',
    name: 'Shoe Size International Converter',
    shortDesc: 'Convert footwear sizes across US Men, US Women, UK, EU, and centimeter foot lengths',
    category: 'converter',
    subcategoryId: 'shoe-sizes',
    tags: ['converter', 'shoe', 'size', 'us', 'uk', 'eu', 'footwear', 'fashion'],
    formula: 'EU_Size = (Foot_Length_cm × 1.5) + 2',
    isPopular: true,
    iconName: 'Footprints',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'clothing-size-converter',
    name: 'Clothing & Apparel Size Converter',
    shortDesc: 'Convert apparel sizes across US, UK/AU, EU, and International formats (XS to XXL)',
    category: 'converter',
    subcategoryId: 'clothing-sizes',
    tags: ['converter', 'clothing', 'apparel', 'size', 'fashion', 'international'],
    formula: 'Size mapping across US, UK, EU, and Intl scales',
    isPopular: false,
    iconName: 'Shirt',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  }
];
