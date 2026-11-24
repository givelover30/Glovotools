import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH43_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15j-sub-calc', categoryId: 'business', name: 'Phase 15J Gross Margin & Leave Balance Calculators', slug: 'phase15j-margin-leave-calculators', description: 'Gross profit margin, markup comparisons, and employee leave balance calculators', sortOrder: 95 },
  { id: 'p15j-sub-conv', categoryId: 'converter', name: 'Phase 15J Frequency & Wavelength Converters', slug: 'phase15j-frequency-wavelength-converters', description: 'Electromagnetic frequency and wavelength conversion utilities', sortOrder: 95 },
  { id: 'p15j-sub-check', categoryId: 'checkers', name: 'Phase 15J Accessibility Color Contrast Checkers', slug: 'phase15j-accessibility-contrast-checkers', description: 'WCAG color contrast ratio and relative luminance validation checkers', sortOrder: 95 },
  { id: 'p15j-sub-gen', categoryId: 'generators', name: 'Phase 15J Professional Email Signature Generators', slug: 'phase15j-email-signature-generators', description: 'HTML and plain-text professional email signature generators', sortOrder: 95 },
  { id: 'p15j-sub-plan', categoryId: 'planners', name: 'Phase 15J Business Continuity & Recovery Planners', slug: 'phase15j-continuity-recovery-planners', description: 'Business continuity and disaster recovery RPO/RTO planning tools', sortOrder: 95 },
  { id: 'p15j-sub-tools', categoryId: 'additional-tools', name: 'Phase 15J Text Diff & Version Comparison Utilities', slug: 'phase15j-text-diff-comparison-utilities', description: 'Line-level and character-level text diff and version comparison utilities', sortOrder: 95 },
  { id: 'p15j-sub-track', categoryId: 'trackers', name: 'Phase 15J Personal Subscription & Membership Trackers', slug: 'phase15j-subscription-membership-trackers', description: 'Personal subscription renewal schedules and recurring expense trackers', sortOrder: 95 },
  { id: 'p15j-sub-guides', categoryId: 'guides', name: 'Phase 15J Software Licensing & Risk Management References', slug: 'phase15j-licensing-risk-management-references', description: 'Software licensing models compliance and project risk management reference guides', sortOrder: 95 }
];

export const BATCH43_METADATA: CalculatorMeta[] = [
  // 1. Gross Margin & Markup Comparison Calculator
  {
    id: 'gross-margin-markup-comparison-calculator',
    name: 'Gross Margin & Markup Comparison Calculator',
    shortDesc: 'Calculate gross profit, gross margin percentage, and selling price markup side-by-side with target price solvers',
    category: 'business',
    subcategoryId: 'p15j-sub-calc',
    tags: ['business', 'gross-margin', 'markup', 'profit-margin', 'pricing', 'commerce'],
    formula: 'Margin = (Price - Cost) / Price × 100%; Markup = (Price - Cost) / Cost × 100%',
    isPopular: false,
    iconName: 'Briefcase',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 2. Employee Absence & Leave Balance Calculator
  {
    id: 'employee-absence-leave-balance-calculator',
    name: 'Employee Absence & Leave Balance Calculator',
    shortDesc: 'Calculate employee leave balances, accrual rates, time off taken, carryover limits, and remaining working days',
    category: 'business',
    subcategoryId: 'p15j-sub-calc',
    tags: ['business', 'employee-absence', 'leave-balance', 'accrual', 'hr', 'pto'],
    formula: 'Remaining Leave = Opening Balance + (Accrual Rate × Periods Elapsed) - Leave Taken + Carryover',
    isPopular: false,
    iconName: 'Briefcase',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 3. Frequency & Wavelength Converter
  {
    id: 'frequency-wavelength-converter',
    name: 'Frequency & Wavelength Converter',
    shortDesc: 'Convert between electromagnetic frequency (Hz to GHz) and wavelength (meters to nanometers) across media speeds',
    category: 'converter',
    subcategoryId: 'p15j-sub-conv',
    tags: ['converter', 'frequency', 'wavelength', 'speed-of-light', 'electromagnetic', 'physics'],
    formula: 'Wavelength (λ) = Propagation Speed (v) / Frequency (f)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Accessibility Color Contrast & WCAG Checker
  {
    id: 'accessibility-color-contrast-wcag-checker',
    name: 'Accessibility Color Contrast & WCAG Checker',
    shortDesc: 'Calculate WCAG relative luminance, contrast ratios, and AAA/AA compliance thresholds for foreground and background colors',
    category: 'checkers',
    subcategoryId: 'p15j-sub-check',
    tags: ['checkers', 'wcag', 'color-contrast', 'accessibility', 'luminance', 'a11y'],
    formula: 'Contrast Ratio = (L1 + 0.05) / (L2 + 0.05) where L is relative luminance',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Professional Email Signature Generator
  {
    id: 'professional-email-signature-generator',
    name: 'Professional Email Signature Generator',
    shortDesc: 'Generate formatted HTML and plain-text professional email signatures with customizable typography, titles, and social links',
    category: 'generators',
    subcategoryId: 'p15j-sub-gen',
    tags: ['generators', 'email-signature', 'html', 'professional', 'branding', 'communication'],
    formula: 'Sanitized table-based HTML layout interpolation with inline CSS styles',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Business Continuity & Disaster Recovery Planner
  {
    id: 'business-continuity-disaster-recovery-planner',
    name: 'Business Continuity & Disaster Recovery Planner',
    shortDesc: 'Plan critical business operations, disruption scenarios, RPO/RTO recovery targets, and mitigation procedures',
    category: 'planners',
    subcategoryId: 'p15j-sub-plan',
    tags: ['planners', 'business-continuity', 'disaster-recovery', 'rpo-rto', 'risk-management', 'planning'],
    formula: 'RTO (Recovery Time Objective) and RPO (Recovery Point Objective) timeline alignment analysis',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Text Diff & Version Comparison Utility
  {
    id: 'text-diff-version-comparison-utility',
    name: 'Text Diff & Version Comparison Utility',
    shortDesc: 'Compare two text snippets side-by-side or unified, highlighting insertions, deletions, and unchanged line differences',
    category: 'additional-tools',
    subcategoryId: 'p15j-sub-tools',
    tags: ['tools', 'text-diff', 'version-comparison', 'comparator', 'developer', 'diff'],
    formula: 'Longest Common Subsequence (LCS) line-level and character-level difference algorithm',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Personal Subscription & Membership Tracker
  {
    id: 'personal-subscription-membership-tracker',
    name: 'Personal Subscription & Membership Tracker',
    shortDesc: 'Track recurring subscriptions, monthly/annual fees, renewal dates, and active streaming or software memberships',
    category: 'trackers',
    subcategoryId: 'p15j-sub-track',
    tags: ['trackers', 'subscription-tracker', 'membership', 'recurring-costs', 'budget', 'spending'],
    formula: 'Normalized Monthly Cost = Annual Price / 12 or Quarterly Price / 3; Total Spending = Sum(Monthly Costs)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Software Licensing Models & Compliance Reference
  {
    id: 'software-licensing-compliance-reference',
    name: 'Software Licensing Models & Compliance Reference',
    shortDesc: 'Reference guide covering permissive (MIT, Apache), copyleft (GPL, AGPL), proprietary, and source-available licenses',
    category: 'guides',
    subcategoryId: 'p15j-sub-guides',
    tags: ['guides', 'software-licensing', 'compliance', 'open-source', 'mit-gpl', 'reference'],
    formula: 'Open source license obligation matrix (attribution, distribution, patent grant, copyleft propagation)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Project Risk Management & Mitigation Reference
  {
    id: 'project-risk-management-mitigation-reference',
    name: 'Project Risk Management & Mitigation Reference',
    shortDesc: 'Reference guide for risk identification, qualitative/quantitative analysis, probability-impact matrices, and mitigation strategies',
    category: 'guides',
    subcategoryId: 'p15j-sub-guides',
    tags: ['guides', 'project-risk', 'risk-management', 'mitigation', 'pmp', 'reference'],
    formula: 'Risk Score = Probability (P) × Impact (I); Response Strategies (Avoid, Mitigate, Transfer, Accept)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
