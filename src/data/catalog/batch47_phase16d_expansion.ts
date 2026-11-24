import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH47_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16d-sub-calc', categoryId: 'engineering', name: 'Phase 16D Pressure Vessel & Pump Power Calculators', slug: 'phase16d-vessel-pump-calculators', description: 'Thin-wall pressure vessel stress and pump hydraulic power efficiency calculators', sortOrder: 99 },
  { id: 'p16d-sub-conv', categoryId: 'converter', name: 'Phase 16D Thermal Conductivity Converters', slug: 'phase16d-thermal-conductivity-converters', description: 'Thermal conductivity unit conversion utilities', sortOrder: 99 },
  { id: 'p16d-sub-check', categoryId: 'checkers', name: 'Phase 16D CAD Drawing Scale Checkers', slug: 'phase16d-cad-scale-checkers', description: 'CAD drawing scale and dimension consistency validation checkers', sortOrder: 99 },
  { id: 'p16d-sub-gen', categoryId: 'generators', name: 'Phase 16D Engineering Test Report Generators', slug: 'phase16d-test-report-generators', description: 'Structured engineering test report and summary generators', sortOrder: 99 },
  { id: 'p16d-sub-plan', categoryId: 'planners', name: 'Phase 16D Preventive Maintenance Schedulers', slug: 'phase16d-maintenance-schedulers', description: 'Equipment and machinery preventive maintenance interval planners', sortOrder: 99 },
  { id: 'p16d-sub-tools', categoryId: 'additional-tools', name: 'Phase 16D Engineering Data Interpolation Utilities', slug: 'phase16d-interpolation-utilities', description: 'Linear and bilinear numerical interpolation utilities for engineering datasets', sortOrder: 99 },
  { id: 'p16d-sub-track', categoryId: 'trackers', name: 'Phase 16D Engineering Change Order Trackers', slug: 'phase16d-eco-trackers', description: 'Engineering Change Order (ECO) review, approval, and lifecycle trackers', sortOrder: 99 },
  { id: 'p16d-sub-guides', categoryId: 'guides', name: 'Phase 16D NDT Methods & Metrology References', slug: 'phase16d-ndt-metrology-references', description: 'Non-Destructive Testing methods and metrology measurement uncertainty references', sortOrder: 99 }
];

export const BATCH47_METADATA: CalculatorMeta[] = [
  // 1. Thin-Wall Pressure Vessel Stress & Thickness Calculator
  {
    id: 'thin-wall-pressure-vessel-stress-thickness-calculator',
    name: 'Thin-Wall Pressure Vessel Stress & Thickness Calculator',
    shortDesc: 'Calculate hoop (circumferential) stress, longitudinal stress, and minimum wall thickness for thin-wall cylindrical pressure vessels',
    category: 'engineering',
    subcategoryId: 'p16d-sub-calc',
    tags: ['engineering', 'pressure-vessel', 'hoop-stress', 'longitudinal-stress', 'wall-thickness', 'calculators'],
    formula: 'Hoop Stress (σ_h) = P × r / t; Longitudinal Stress (σ_l) = P × r / (2t); Min Thickness (t) = P × r / (σ_allow - 0.6P)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 2. Pump Hydraulic Power & Efficiency Calculator
  {
    id: 'pump-hydraulic-power-efficiency-calculator',
    name: 'Pump Hydraulic Power & Efficiency Calculator',
    shortDesc: 'Calculate pump hydraulic output power and required shaft input power using fluid density, flow rate, total head, and efficiency',
    category: 'engineering',
    subcategoryId: 'p16d-sub-calc',
    tags: ['engineering', 'pump-power', 'hydraulic-power', 'efficiency', 'fluid-mechanics', 'calculators'],
    formula: 'Hydraulic Power (P_hyd) = ρ × g × Q × H; Shaft Power (P_shaft) = P_hyd / η',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 3. Thermal Conductivity Unit Converter
  {
    id: 'thermal-conductivity-unit-converter',
    name: 'Thermal Conductivity Unit Converter',
    shortDesc: 'Convert thermal conductivity between W/(m·K), W/(m·°C), and Btu/(h·ft·°F) with precision control',
    category: 'converter',
    subcategoryId: 'p16d-sub-conv',
    tags: ['converter', 'thermal-conductivity', 'heat-transfer', 'units', 'engineering', 'thermodynamics'],
    formula: 'Conversion between W/m·K and Btu/h·ft·°F (1 W/m·K = 0.5778 Btu/h·ft·°F)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. CAD Drawing Scale & Dimension Consistency Checker
  {
    id: 'cad-drawing-scale-dimension-consistency-checker',
    name: 'CAD Drawing Scale & Dimension Consistency Checker',
    shortDesc: 'Verify CAD drawing scales, compare measured drawing lengths against stated real-world dimensions, and compute discrepancy percentages',
    category: 'checkers',
    subcategoryId: 'p16d-sub-check',
    tags: ['checkers', 'cad-scale', 'dimension-consistency', 'blueprint', 'architectural', 'validation'],
    formula: 'Expected Dimension = Measured Length × Scale Ratio; Discrepancy % = |Actual - Expected| / Expected × 100%',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Engineering Test Report Generator
  {
    id: 'engineering-test-report-generator',
    name: 'Engineering Test Report Generator',
    shortDesc: 'Generate professional engineering test report summaries including project details, objectives, test procedures, and observations',
    category: 'generators',
    subcategoryId: 'p16d-sub-gen',
    tags: ['generators', 'test-report', 'engineering', 'documentation', 'qa', 'report-generator'],
    formula: 'Structured document layout combining project metadata, test steps, measurements, and conclusions',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Preventive Maintenance Schedule Planner
  {
    id: 'batch47-preventive-maintenance-schedule-planner',
    name: 'Preventive Maintenance Schedule Planner',
    shortDesc: 'Plan equipment and machinery preventive maintenance intervals, daily/weekly/monthly tasks, durations, and responsible personnel',
    category: 'planners',
    subcategoryId: 'p16d-sub-plan',
    tags: ['planners', 'preventive-maintenance', 'maintenance-schedule', 'equipment', 'manufacturing', 'planning'],
    formula: 'Scheduled Maintenance Due Date = Last Service Date + Maintenance Interval Days',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Engineering Data Interpolation Utility
  {
    id: 'engineering-data-interpolation-utility',
    name: 'Engineering Data Interpolation Utility',
    shortDesc: 'Perform deterministic linear and bilinear numerical interpolation for tabulated engineering datasets and experimental values',
    category: 'additional-tools',
    subcategoryId: 'p16d-sub-tools',
    tags: ['tools', 'interpolation', 'numerical-methods', 'tabulated-data', 'engineering', 'math'],
    formula: 'Linear Interpolation: y = y₁ + (x - x₁) × (y₂ - y₁) / (x₂ - x₁)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Engineering Change Order (ECO) Tracker
  {
    id: 'engineering-change-order-tracker',
    name: 'Engineering Change Order (ECO) Tracker',
    shortDesc: 'Track engineering change orders from proposal through review, approval, implementation, and closure with status summaries',
    category: 'trackers',
    subcategoryId: 'p16d-sub-track',
    tags: ['trackers', 'eco-tracker', 'engineering-change-order', 'lifecycle', 'revision-control', 'tracking'],
    formula: 'ECO Status Lifecycle: Proposed -> Under Review -> Approved -> Implemented -> Closed',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Non-Destructive Testing (NDT) Methods Reference
  {
    id: 'non-destructive-testing-methods-reference',
    name: 'Non-Destructive Testing (NDT) Methods Reference',
    shortDesc: 'Reference guide for visual, liquid penetrant, magnetic particle, ultrasonic, radiographic, and eddy current NDT methods',
    category: 'guides',
    subcategoryId: 'p16d-sub-guides',
    tags: ['guides', 'ndt', 'non-destructive-testing', 'inspection', 'quality-control', 'reference'],
    formula: 'NDT inspection principle taxonomy, applications, strengths, and limitations',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Metrology Instruments & Measurement Uncertainty Reference
  {
    id: 'metrology-instruments-measurement-uncertainty-reference',
    name: 'Metrology Instruments & Measurement Uncertainty Reference',
    shortDesc: 'Reference guide for metrology instruments (calipers, micrometers, dial indicators), resolution, accuracy, and measurement uncertainty',
    category: 'guides',
    subcategoryId: 'p16d-sub-guides',
    tags: ['guides', 'metrology', 'measurement-uncertainty', 'calibration', 'precision', 'reference'],
    formula: 'Metrological definitions (Accuracy vs Precision, Resolution, Expanded Uncertainty U = k·u_c)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
