import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface WeddingBudgetItem {
  id: string;
  category: string;
  item: string;
  estimatedCost: number;
  actualCost: number;
}

export interface WeddingGuestItem {
  id: string;
  name: string;
  partySize: number;
  rsvp: 'Confirmed' | 'Declined' | 'Pending';
  tableNumber: string;
}

export interface WeddingPlanningOrganizerInput {
  weddingTitle: string;
  budgetItems: WeddingBudgetItem[];
  guests: WeddingGuestItem[];
}

export interface WeddingPlanningOrganizerResult {
  weddingTitle: string;
  totalEstimatedBudget: number;
  totalActualCost: number;
  budgetVariance: number;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
}

export const DEFAULT_WEDDING_BUDGET: WeddingBudgetItem[] = [
  { id: '1', category: 'Venue', item: 'Grand Ballroom Rental', estimatedCost: 5000, actualCost: 4800 },
  { id: '2', category: 'Catering', item: 'Dinner & Open Bar (120 guests)', estimatedCost: 6000, actualCost: 6200 },
  { id: '3', category: 'Photography', item: 'Full Day Photo & Video', estimatedCost: 3000, actualCost: 3000 },
  { id: '4', category: 'Attire', item: 'Wedding Dress & Suit', estimatedCost: 2500, actualCost: 2400 }
];

export const DEFAULT_WEDDING_GUESTS: WeddingGuestItem[] = [
  { id: '1', name: 'John & Mary Smith', partySize: 2, rsvp: 'Confirmed', tableNumber: 'Table 1' },
  { id: '2', name: 'Robert Johnson', partySize: 1, rsvp: 'Confirmed', tableNumber: 'Table 1' },
  { id: '3', name: 'Emily Davis', partySize: 2, rsvp: 'Pending', tableNumber: 'Unassigned' }
];

export function validateWeddingPlanningInput(input: WeddingPlanningOrganizerInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.weddingTitle || input.weddingTitle.trim() === '') {
    errors.push({ field: 'weddingTitle', code: 'REQUIRED_FIELD_MISSING', message: 'Wedding title is required.' });
  }
  input.budgetItems.forEach((b, idx) => {
    if (b.estimatedCost < 0 || b.actualCost < 0) {
      errors.push({ field: `budgetItems[${idx}]`, code: 'NON_NEGATIVE_REQUIRED', message: 'Costs cannot be negative.' });
    }
  });
  input.guests.forEach((g, idx) => {
    if (g.partySize < 1) {
      errors.push({ field: `guests[${idx}].partySize`, code: 'POSITIVE_NUMBER_REQUIRED', message: 'Party size must be at least 1.' });
    }
  });
  return errors;
}

export function calculateWeddingPlanning(input: WeddingPlanningOrganizerInput): WeddingPlanningOrganizerResult {
  const budgetItems = input.budgetItems || DEFAULT_WEDDING_BUDGET;
  const guests = input.guests || DEFAULT_WEDDING_GUESTS;

  let totalEstimatedBudget = 0;
  let totalActualCost = 0;
  for (const b of budgetItems) {
    totalEstimatedBudget += Number(b.estimatedCost) || 0;
    totalActualCost += Number(b.actualCost) || 0;
  }
  const budgetVariance = totalActualCost - totalEstimatedBudget;

  let totalGuests = 0;
  let confirmedGuests = 0;
  let pendingGuests = 0;
  let declinedGuests = 0;

  for (const g of guests) {
    const size = Number(g.partySize) || 1;
    totalGuests += size;
    if (g.rsvp === 'Confirmed') confirmedGuests += size;
    else if (g.rsvp === 'Pending') pendingGuests += size;
    else if (g.rsvp === 'Declined') declinedGuests += size;
  }

  return {
    weddingTitle: input.weddingTitle || 'Wedding Planning',
    totalEstimatedBudget,
    totalActualCost,
    budgetVariance,
    totalGuests,
    confirmedGuests,
    pendingGuests,
    declinedGuests
  };
}

export const WEDDING_PLANNING_ORGANIZER_CONTRACT: CalculationContract<any, any> = {
  id: 'wedding-planning-organizer',
  name: 'Wedding Planning Organizer',
  category: 'planners',
  validate: validateWeddingPlanningInput,
  calculate: calculateWeddingPlanning
} as CalculationContract<any, any>;
