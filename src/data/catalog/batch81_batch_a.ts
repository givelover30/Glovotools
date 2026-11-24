import { CalculatorMeta } from '../../types';

export const BATCH81_BATCH_A_METADATA: CalculatorMeta[] = [
  {
    id: 'pet-energy-food-calc',
    name: 'Pet Daily Energy & Food Calculator',
    shortDesc: 'Calculate Resting Energy Requirement (RER), DER, and daily food portions for dogs and cats',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'pets', 'dogs', 'cats', 'energy', 'food', 'nutrition', 'mammals'],
    formula: 'DER = 70 × (Weight in kg)^0.75 × Life Stage Activity Factor',
    isPopular: true,
    iconName: 'Bone',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'pet-growth-tracker-calc',
    name: 'Pet Growth Tracker',
    shortDesc: 'Track puppy and kitten weight progression over time with local browser storage',
    category: 'animal-world',
    subcategoryId: 'mammals',
    tags: ['animal-world', 'pets', 'puppy', 'kitten', 'growth', 'weight', 'tracker', 'mammals'],
    formula: 'Weight Progression Logging & Historical Log Analysis',
    isPopular: true,
    iconName: 'LineChart',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'aquarium-volume-calc',
    name: 'Aquarium Volume Calculator',
    shortDesc: 'Calculate gross capacity and net usable water volume for rectangular and cylindrical fish tanks',
    category: 'animal-world',
    subcategoryId: 'fish',
    tags: ['animal-world', 'fish', 'aquarium', 'tank', 'volume', 'gallons', 'liters'],
    formula: 'Volume = Length × Width × Height ÷ 231 (Gallons)',
    isPopular: true,
    iconName: 'Droplets',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'pond-volume-calc',
    name: 'Pond Volume Calculator',
    shortDesc: 'Estimate water capacity for garden ponds, koi ponds, and water features',
    category: 'animal-world',
    subcategoryId: 'fish',
    tags: ['animal-world', 'fish', 'pond', 'koi', 'water-feature', 'volume'],
    formula: 'Volume (gal) = Length × Width × Depth × Shape Multiplier × 7.48',
    isPopular: true,
    iconName: 'Waves',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  }
];
