import { CalculationContract } from '../types.ts';
import { ALL_CALCULATOR_CONTRACTS as BASE_24_CONTRACTS } from './calculatorContracts.ts';
import { BATCH1_CONTRACTS } from './batch1_math_algebra.ts';
import { BATCH2_CONTRACTS } from './batch2_geometry_trig.ts';
import { BATCH3_CONTRACTS } from './batch3_stats_scientific.ts';
import { BATCH4_CONTRACTS } from './batch4_financial.ts';
import { BATCH5_CONTRACTS } from './batch5_business.ts';
import { BATCH6_CONTRACTS } from './batch6_construction.ts';
import { BATCH7_CONTRACTS } from './batch7_health.ts';
import { BATCH8_CONTRACTS } from './batch8_datetime.ts';
import { BATCH9_CONTRACTS } from './batch9_electrical.ts';
import { BATCH10_CONTRACTS } from './batch10_engineering_everyday.ts';
import { BATCH11_CONTRACTS } from './batch11_expansion_batch1.ts';
import { BATCH12_CONTRACTS } from './batch12_expansion_batch2.ts';
import { BATCH13_CONTRACTS } from './batch13_expansion_batch3.ts';
import { BATCH14_CONTRACTS } from './batch14_expansion_batch4.ts';
import { BATCH15_CONTRACTS } from './batch15_expansion_batch5.ts';
import { BATCH16_CONTRACTS } from './batch16_expansion_batch6.ts';
import { BATCH17_CONTRACTS } from './batch17_converters.ts';
import { BATCH18_CONTRACTS } from './batch18_tools.ts';
import { BATCH27_CONTRACTS } from './batch27_phase12_contracts.ts';
import { BATCH28_CONTRACTS } from './batch28_phase13a_contracts.ts';
import { BATCH29_CONTRACTS } from './batch29_phase13b_contracts.ts';
import { BATCH30_CONTRACTS } from './batch30_phase13c_contracts.ts';
import { BATCH31_CONTRACTS } from './batch31_phase13d_contracts.ts';
import { BATCH32_CONTRACTS } from './batch32_phase13e_contracts.ts';
import { BATCH33_CONTRACTS } from './batch33_phase13f_contracts.ts';
import { BATCH34_CONTRACTS } from './batch34_phase15a_contracts.ts';
import { BATCH35_CONTRACTS } from './batch35_phase15b_contracts.ts';
import { BATCH36_CONTRACTS } from './batch36_phase15c_contracts.ts';
import { BATCH37_CONTRACTS } from './batch37_phase15d_contracts.ts';
import { BATCH38_CONTRACTS } from './batch38_phase15e_contracts.ts';
import { BATCH39_CONTRACTS } from './batch39_phase15f_contracts.ts';
import { BATCH40_CONTRACTS } from './batch40_phase15g_contracts.ts';
import { BATCH41_CONTRACTS } from './batch41_phase15h_contracts.ts';
import { BATCH42_CONTRACTS } from './batch42_phase15i_contracts.ts';
import { BATCH43_CONTRACTS } from './batch43_phase15j_contracts.ts';
import { BATCH44_CONTRACTS } from './batch44_phase16a_contracts.ts';
import { BATCH45_CONTRACTS } from './batch45_phase16b_contracts.ts';
import { BATCH46_CONTRACTS } from './batch46_phase16c_contracts.ts';
import { BATCH47_CONTRACTS } from './batch47_phase16d_contracts.ts';
import { BATCH48_CONTRACTS } from './batch48_phase16e_contracts.ts';
import { BATCH49_CONTRACTS } from './batch49_phase16f_contracts.ts';
import { BATCH50_CONTRACTS } from './batch50_phase16g_contracts.ts';
import { BATCH51_CONTRACTS } from './batch51_phase16h_contracts.ts';
import { BATCH52_CONTRACTS } from './batch52_phase16i_contracts.ts';
import { BATCH53_CONTRACTS } from './batch53_phase16j_contracts.ts';
import { BATCH54_CONTRACTS } from './batch54_phase17a_contracts.ts';
import { BATCH55_CONTRACTS } from './batch55_phase17b_contracts.ts';
import { BATCH56_CONTRACTS } from './batch56_phase17c_contracts.ts';
import { BATCH57_CONTRACTS } from './batch57_phase17d_contracts.ts';
import { BATCH58_CONTRACTS } from './batch58_phase17e_contracts.ts';
import { BATCH59_CONTRACTS } from './batch59_phase17f_contracts.ts';
import { BATCH60_CONTRACTS } from './batch60_phase17g_contracts.ts';
import { BATCH61_CONTRACTS } from './batch61_phase17h_contracts.ts';
import { BATCH62_CONTRACTS } from './batch62_phase17i_contracts.ts';
import { BATCH63_CONTRACTS } from './batch63_phase17j_contracts.ts';
import { PHASE18_CONTRACTS } from './phase18_technology_contracts.ts';
import { PHASE19_CONTRACTS } from './phase19_construction_contracts.ts';
import { PHASE20_CONTRACTS } from './phase20_manufacturing_contracts.ts';
import { PHASE21_CONTRACTS } from './phase21_science_contracts.ts';
import { PHASE22_CONTRACTS } from './phase22_lifestyle_contracts.ts';
import { PHASE23_CONTRACTS } from './phase23_business_productivity_contracts.ts';
import { PHASE25_CONTRACTS } from './phase25_pdf_tools_contracts.ts';
import { PHASE27_CONTRACTS } from './phase27_document_converter_contracts.ts';
import { PLANNER_P0_CONTRACTS } from './planners/index.ts';

export const ALL_REGISTERED_CONTRACTS: CalculationContract<any, any>[] = [
  ...BASE_24_CONTRACTS,
  ...BATCH1_CONTRACTS,
  ...BATCH2_CONTRACTS,
  ...BATCH3_CONTRACTS,
  ...BATCH4_CONTRACTS,
  ...BATCH5_CONTRACTS,
  ...BATCH6_CONTRACTS,
  ...BATCH7_CONTRACTS,
  ...BATCH8_CONTRACTS,
  ...BATCH9_CONTRACTS,
  ...BATCH10_CONTRACTS,
  ...BATCH11_CONTRACTS,
  ...BATCH12_CONTRACTS,
  ...BATCH13_CONTRACTS,
  ...BATCH14_CONTRACTS,
  ...BATCH15_CONTRACTS,
  ...BATCH16_CONTRACTS,
  ...BATCH17_CONTRACTS,
  ...BATCH18_CONTRACTS,
  ...BATCH27_CONTRACTS,
  ...BATCH28_CONTRACTS,
  ...BATCH29_CONTRACTS,
  ...BATCH30_CONTRACTS,
  ...BATCH31_CONTRACTS,
  ...BATCH32_CONTRACTS,
  ...BATCH33_CONTRACTS,
  ...BATCH34_CONTRACTS,
  ...BATCH35_CONTRACTS,
  ...BATCH36_CONTRACTS,
  ...BATCH37_CONTRACTS,
  ...BATCH38_CONTRACTS,
  ...BATCH39_CONTRACTS,
  ...BATCH40_CONTRACTS,
  ...BATCH41_CONTRACTS,
  ...BATCH42_CONTRACTS,
  ...BATCH43_CONTRACTS,
  ...BATCH44_CONTRACTS,
  ...BATCH45_CONTRACTS,
  ...BATCH46_CONTRACTS,
  ...BATCH47_CONTRACTS,
  ...BATCH48_CONTRACTS,
  ...BATCH49_CONTRACTS,
  ...BATCH50_CONTRACTS,
  ...BATCH51_CONTRACTS,
  ...BATCH52_CONTRACTS,
  ...BATCH53_CONTRACTS,
  ...BATCH54_CONTRACTS,
  ...BATCH55_CONTRACTS,
  ...BATCH56_CONTRACTS,
  ...BATCH57_CONTRACTS,
  ...BATCH58_CONTRACTS,
  ...BATCH59_CONTRACTS,
  ...BATCH60_CONTRACTS,
  ...BATCH61_CONTRACTS,
  ...BATCH62_CONTRACTS,
  ...BATCH63_CONTRACTS,
  ...PHASE18_CONTRACTS,
  ...PHASE19_CONTRACTS,
  ...PHASE20_CONTRACTS,
  ...PHASE21_CONTRACTS,
  ...PHASE22_CONTRACTS,
  ...PHASE23_CONTRACTS,
  ...PHASE25_CONTRACTS,
  ...PHASE27_CONTRACTS,
  ...PLANNER_P0_CONTRACTS
];

export const ALL_300_CONTRACTS = ALL_REGISTERED_CONTRACTS;
