import { CalculatorMeta } from '../../types';

export const BATCH69_ANIMAL_GESTATION_METADATA: CalculatorMeta[] = [
  {
    id: 'animal-gestation-calc',
    name: 'Universal Animal Gestation Calculator',
    shortDesc: 'Calculate estimated delivery dates and expected delivery windows for farm livestock, equines, companion animals, and camelids',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'animals', 'gestation', 'pregnancy', 'mammals', 'veterinary', 'breeding'],
    formula: 'Due Date = Breeding Date + Average Species Gestation Duration (Days)',
    isPopular: true,
    iconName: 'HeartPulse',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  }
];
