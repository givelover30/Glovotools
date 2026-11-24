export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'COSMETIC';
export type DefectStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';

export interface AuditDefect {
  id: string;
  calculatorId: string;
  calculatorName: string;
  category: string;
  subcategoryId?: string;
  severity: DefectSeverity;
  description: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionInputs?: Record<string, any>;
  testCaseInputs?: Record<string, any>;
  expectedOutput?: number | string;
  actualOutput?: number | string;
  rootCause?: string;
  status: DefectStatus;
  resolution?: string;
  resolutionNotes?: string;
  dateReported?: string;
  dateResolved?: string;
}

export interface OracleTestCase {
  name: string;
  inputs: Record<string, any>;
  expectedPrimary: number;
  tolerance?: number; // default 1e-4 or 0.01 for currency/percentages
  expectedSecondary?: Record<string, number | string>;
  isBoundary?: boolean;
}

export interface OracleDefinition {
  id: string;
  name: string;
  category: string;
  subcategoryId: string;
  governingFormula?: string;
  independentDerivation?: string;
  independentCalculate: (inputs: Record<string, any>) => number | Record<string, any>;
  testCases: OracleTestCase[];
  boundaryTests?: OracleTestCase[];
}

export interface CalculatorAuditRecord {
  calculatorId: string;
  calculatorName: string;
  category: string;
  subcategoryId: string;
  formula: string;
  formulaVerified: boolean;
  inputSchemaVerified: boolean;
  unitConsistencyVerified: boolean;
  standardTestPassed: boolean;
  boundaryTestPassed: boolean;
  precisionVerified: boolean;
  numericDiscrepancy: number; // max absolute difference between prod and oracle
  productionPrimaryValue: number;
  oraclePrimaryValue: number;
  status: 'CERTIFIED' | 'DEFECT_FOUND' | 'RETESTED_PASS';
  notes?: string;
}

export interface CategoryAuditSummary {
  categoryId: string;
  categoryName: string;
  totalCalculators: number;
  verifiedCount: number;
  passedCount: number;
  defectsCount: number;
  maxDiscrepancy: number;
  allPassing: boolean;
  testsExecuted: number;
}

export interface Phase7AuditReport {
  timestamp: string;
  totalCalculatorsAudited: number;
  totalCalculatorsTarget: number;
  categoriesAudited: number;
  subcategoriesAudited: number;
  categorySummaries: CategoryAuditSummary[];
  defectsIdentified: AuditDefect[];
  unresolvedDefects: number;
  certificationDecision: 'PASSED_CERTIFIED' | 'REJECTED';
}
