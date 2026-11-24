import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH70_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'mammals', categoryId: 'animal-world', name: 'Mammals', slug: 'mammals', description: 'Gestation, age, feed, milk, weight, and breeding calculators for mammals.', sortOrder: 1 },
  { id: 'birds', categoryId: 'animal-world', name: 'Birds', slug: 'birds', description: 'Poultry incubation and avian lifecycle calculators.', sortOrder: 2 },
  { id: 'reptiles', categoryId: 'animal-world', name: 'Reptiles', slug: 'reptiles', description: 'Reptile care and biological calculations.', sortOrder: 3 },
  { id: 'amphibians', categoryId: 'animal-world', name: 'Amphibians', slug: 'amphibians', description: 'Amphibian metrics and life cycle tools.', sortOrder: 4 },
  { id: 'fish', categoryId: 'animal-world', name: 'Fish', slug: 'fish', description: 'Aquatic and fish biology calculators.', sortOrder: 5 },
  { id: 'insects', categoryId: 'animal-world', name: 'Insects', slug: 'insects', description: 'Insect and entomological calculation tools.', sortOrder: 6 },
  { id: 'arachnids', categoryId: 'animal-world', name: 'Arachnids', slug: 'arachnids', description: 'Arachnid and spider management metrics.', sortOrder: 7 },
  { id: 'other-invertebrates', categoryId: 'animal-world', name: 'Other Invertebrates', slug: 'other-invertebrates', description: 'Other invertebrate species calculation tools.', sortOrder: 8 }
];

export const BATCH70_METADATA: CalculatorMeta[] = [
  {
    id: 'animal-age-calc',
    name: 'Animal Age Calculator',
    shortDesc: 'Chronological and human-equivalent age models for dogs, cats, horses, and livestock',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'animals', 'age', 'dog-age', 'cat-age', 'mammals', 'veterinary'],
    formula: 'Human Age = Epigenetic Logarithmic Model / Species Multipliers',
    isPopular: true,
    iconName: 'Clock',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'livestock-feed-calc',
    name: 'Livestock Feed Calculator',
    shortDesc: 'Dry matter intake (DMI) and as-fed feed quantities for cattle, sheep, goats, and pigs',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'livestock', 'feed', 'dmi', 'nutrition', 'mammals'],
    formula: 'Daily DMI = Body Weight × DMI %; As-Fed = DMI ÷ (Dry Matter %)',
    isPopular: true,
    iconName: 'Scale',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'egg-incubation-calc',
    name: 'Poultry Egg Incubation Calculator',
    shortDesc: 'Hatch dates, lockdown schedules, and candling milestones for chicken, duck, goose, and quail eggs',
    category: 'animal-world',
    subcategoryId: 'birds',
    tags: ['animal-world', 'poultry', 'birds', 'eggs', 'incubation', 'hatch-date'],
    formula: 'Hatch Date = Setting Date + Species Incubation Period (Days)',
    isPopular: true,
    iconName: 'Egg',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'milk-production-calc',
    name: 'Milk Production Calculator',
    shortDesc: 'Daily, weekly, monthly, and 305-day standard lactation yield summaries for dairy livestock',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'dairy', 'milk', 'mammals', 'lactation', 'yield'],
    formula: 'Monthly Yield = Daily Yield per Animal × 30.44 × Herd Count',
    isPopular: true,
    iconName: 'Milk',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'livestock-weight-calc',
    name: 'Livestock Weight Estimator',
    shortDesc: 'Live body weight estimation using zoometric heart girth and body length formulas',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'livestock', 'weight', 'heart-girth', 'mammals', 'zoometric'],
    formula: 'Weight (lbs) = (Heart Girth² × Body Length) ÷ Divisor',
    isPopular: true,
    iconName: 'Scale',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'animal-breeding-interval-calc',
    name: 'Animal Breeding Interval Calculator',
    shortDesc: 'Estrous cycle heat dates, standing heat durations, and optimal re-breeding windows',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'breeding', 'reproduction', 'estrous', 'mammals', 'heat-cycle'],
    formula: 'Next Heat Date = Last Heat Date + Species Estrous Cycle Length',
    isPopular: true,
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  }
];
