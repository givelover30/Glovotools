export type CategoryId = 
  | 'basic-math'
  | 'algebra'
  | 'geometry'
  | 'trigonometry'
  | 'statistics'
  | 'scientific'
  | 'financial'
  | 'business'
  | 'construction'
  | 'health-fitness'
  | 'datetime'
  | 'electrical'
  | 'engineering'
  | 'everyday'
  | 'tax-accounting'
  | 'real-estate'
  | 'ecommerce'
  | 'energy-solar'
  | 'insurance-risk'
  | 'automotive'
  | 'education-finance'
  | 'salary-compensation'
  | 'banking-savings'
  | 'business-operations'
  | 'logistics-shipping'
  | 'manufacturing-inventory'
  | 'agriculture-farming'
  | 'animal-world'
  | 'healthcare-operations'
  | 'telecom-internet'
  | 'personal-productivity'
  | 'environmental-sustainability'
  | 'food-service'
  | 'aviation-transport'
  | 'cybersecurity-data'
  | 'legal-compliance'
  | 'real-estate-dev'
  | 'retail-supply-chain'
  | 'sports-athletics'
  | 'converter'
  | 'calculators'
  | 'converters'
  | 'tools'
  | 'generators'
  | 'planners'
  | 'trackers'
  | 'counters'
  | 'analyzers'
  | 'checkers'
  | 'validators'
  | 'estimators'
  | 'finders'
  | 'comparators'
  | 'optimizers'
  | 'simulators'
  | 'testers'
  | 'document-pdf'
  | 'editors'
  | 'formatters'
  | 'organizers'
  | 'business-management'
  | 'finance-accounting'
  | 'construction-property'
  | 'engineering-manufacturing'
  | 'developer-it'
  | 'data-analytics'
  | 'image-design'
  | 'text-writing'
  | 'education-science'
  | 'health-fitness-lifestyle'
  | 'guides'
  | 'additional-tools'
  | 'pdf-tools'
  | 'document-converters'
  | 'all';

export type CalculatorId = string;

export interface SubcategoryMeta {
  id: string;
  categoryId: CategoryId;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  count: number;
}

export interface CategoryMeta {
  id: CategoryId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  borderColor?: string;
  sortOrder: number;
  isActive: boolean;
  count: number;
}

export interface CalculatorMeta {
  id: CalculatorId;
  name: string;
  shortDesc: string;
  category: CategoryId;
  subcategoryId: string;
  tags?: string[];
  formula: string;
  isPopular?: boolean;
  iconName: string;
  iconColor: string;
  iconBg: string;
}

export type AppView = 'home' | 'categories' | 'category-detail' | 'calculator' | 'all-calculators' | 'favorites';
