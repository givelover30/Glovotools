import { OracleDefinition } from '../types.ts';
import { MATH_ALGEBRA_ORACLES } from './math_algebra_oracles.ts';
import { GEOMETRY_TRIG_ORACLES } from './geometry_trig_oracles.ts';
import { STATS_SCIENTIFIC_ORACLES } from './stats_scientific_oracles.ts';
import { FINANCIAL_ORACLES } from './financial_oracles.ts';
import { BUSINESS_CONSTRUCTION_ORACLES } from './business_construction_oracles.ts';
import { HEALTH_DATETIME_ORACLES } from './health_datetime_oracles.ts';
import { ELECTRICAL_ENGINEERING_EVERYDAY_ORACLES } from './electrical_engineering_everyday_oracles.ts';

export const ALL_ORACLES_RECORD: Record<string, OracleDefinition> = {
  ...MATH_ALGEBRA_ORACLES,
  ...GEOMETRY_TRIG_ORACLES,
  ...STATS_SCIENTIFIC_ORACLES,
  ...FINANCIAL_ORACLES,
  ...BUSINESS_CONSTRUCTION_ORACLES,
  ...HEALTH_DATETIME_ORACLES,
  ...ELECTRICAL_ENGINEERING_EVERYDAY_ORACLES
};

export const ALL_300_ORACLES: OracleDefinition[] = Object.values(ALL_ORACLES_RECORD);

export const ORACLE_MAP = new Map<string, OracleDefinition>(
  ALL_300_ORACLES.map(o => [o.id, o])
);

export function getOracleById(id: string): OracleDefinition | undefined {
  return ORACLE_MAP.get(id);
}

export function getOraclesByCategory(categoryId: string): OracleDefinition[] {
  return ALL_300_ORACLES.filter(o => o.category === categoryId);
}
