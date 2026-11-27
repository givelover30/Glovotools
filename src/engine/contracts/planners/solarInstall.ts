import { CalculationContract, CalculationError } from '../../types.ts';

export interface SolarPanelGroup {
  id: string;
  panelModel: string;
  wattagePerPanel: number;
  quantity: number;
  tiltAngleDegrees: number;
}

export interface SolarInstallInput {
  projectName: string;
  sunPeakHoursDaily: number;
  efficiencyRatio: number;
  panels: SolarPanelGroup[];
}

export interface SolarInstallResult {
  projectName: string;
  totalPanelsCount: number;
  totalSystemCapacityWatts: number;
  totalSystemCapacityKw: number;
  estimatedDailyKwh: number;
  estimatedAnnualKwh: number;
}

export const DEFAULT_SOLAR_PANELS: SolarPanelGroup[] = [
  { id: '1', panelModel: 'REC Alpha Pure-R 430W', wattagePerPanel: 430, quantity: 24, tiltAngleDegrees: 25 }
];

export function validateSolarInput(input: SolarInstallInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.projectName || input.projectName.trim() === '') {
    errors.push({ field: 'projectName', code: 'REQUIRED_FIELD_MISSING', message: 'Project name is required.' });
  }
  if (input.sunPeakHoursDaily <= 0 || input.sunPeakHoursDaily > 12) {
    errors.push({ field: 'sunPeakHoursDaily', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Sun peak hours must be between 0 and 12.' });
  }
  return errors;
}

export function calculateSolar(input: SolarInstallInput): SolarInstallResult {
  const panels = input.panels || DEFAULT_SOLAR_PANELS;
  let totalPanelsCount = 0;
  let totalSystemCapacityWatts = 0;

  for (const p of panels) {
    const qty = Number(p.quantity) || 0;
    const wat = Number(p.wattagePerPanel) || 0;
    totalPanelsCount += qty;
    totalSystemCapacityWatts += qty * wat;
  }

  const totalSystemCapacityKw = totalSystemCapacityWatts / 1000;
  const peakHours = Number(input.sunPeakHoursDaily) || 4.5;
  const eff = (Number(input.efficiencyRatio) || 80) / 100;
  const estimatedDailyKwh = totalSystemCapacityKw * peakHours * eff;
  const estimatedAnnualKwh = estimatedDailyKwh * 365;

  return {
    projectName: input.projectName || 'Solar PV Installation',
    totalPanelsCount,
    totalSystemCapacityWatts,
    totalSystemCapacityKw,
    estimatedDailyKwh: Math.round(estimatedDailyKwh * 10) / 10,
    estimatedAnnualKwh: Math.round(estimatedAnnualKwh)
  };
}

export const SOLAR_INSTALL_CONTRACT: CalculationContract<any, any> = {
  id: 'solar-install-planner',
  name: 'Solar PV Installation Project Planner',
  category: 'planners',
  validate: validateSolarInput,
  calculate: calculateSolar
} as CalculationContract<any, any>;
