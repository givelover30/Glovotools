import { CalculationContract, CalculationError } from '../../types.ts';

export interface ElectricalCircuitItem {
  id: string;
  circuitName: string;
  voltage: number;
  amperage: number;
  estimatedLoadWatts: number;
  cableType: string;
  status: 'Planned' | 'Installed' | 'Inspected';
}

export interface ElectricalInstallInput {
  projectName: string;
  circuits: ElectricalCircuitItem[];
}

export interface ElectricalInstallResult {
  projectName: string;
  totalCircuitsCount: number;
  totalEstimatedWatts: number;
  inspectedCount: number;
  installedCount: number;
}

export const DEFAULT_ELECTRICAL_CIRCUITS: ElectricalCircuitItem[] = [
  { id: '1', circuitName: 'Main Kitchen Appliances', voltage: 240, amperage: 50, estimatedLoadWatts: 9600, cableType: '6/3 Romex', status: 'Inspected' },
  { id: '2', circuitName: 'Living Room Outlets & Lighting', voltage: 120, amperage: 20, estimatedLoadWatts: 1800, cableType: '12/2 Romex', status: 'Installed' },
  { id: '3', circuitName: 'HVAC Sub-Panel Feed', voltage: 240, amperage: 60, estimatedLoadWatts: 11500, cableType: '4/3 THHN Conduit', status: 'Planned' }
];

export function validateElectricalInput(input: ElectricalInstallInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.projectName || input.projectName.trim() === '') {
    errors.push({ field: 'projectName', code: 'REQUIRED_FIELD_MISSING', message: 'Project name is required.' });
  }
  input.circuits.forEach((c, idx) => {
    if (c.voltage <= 0 || c.amperage <= 0 || c.estimatedLoadWatts < 0) {
      errors.push({ field: `circuits[${idx}]`, code: 'POSITIVE_NUMBER_REQUIRED', message: 'Electrical values must be positive.' });
    }
  });
  return errors;
}

export function calculateElectrical(input: ElectricalInstallInput): ElectricalInstallResult {
  const circuits = input.circuits || DEFAULT_ELECTRICAL_CIRCUITS;
  let totalEstimatedWatts = 0;
  let inspectedCount = 0;
  let installedCount = 0;

  for (const c of circuits) {
    totalEstimatedWatts += Number(c.estimatedLoadWatts) || 0;
    if (c.status === 'Inspected') inspectedCount++;
    else if (c.status === 'Installed') installedCount++;
  }

  return {
    projectName: input.projectName || 'Electrical Installation',
    totalCircuitsCount: circuits.length,
    totalEstimatedWatts,
    inspectedCount,
    installedCount
  };
}

export const ELECTRICAL_INSTALL_CONTRACT: CalculationContract<any, any> = {
  id: 'electrical-install-planner',
  name: 'Electrical Installation Project Planner',
  category: 'planners',
  validate: validateElectricalInput,
  calculate: calculateElectrical
} as CalculationContract<any, any>;
