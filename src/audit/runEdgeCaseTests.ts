import { CalculationRegistry } from '../engine/CalculationRegistry.ts';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';

export function runEdgeCaseAudit() {
  CalculationRegistry.initialize();
  const contracts = CalculationRegistry.getAll();

  console.log('=====================================================');
  console.log('CALCTOOLS — PHASE 8C: EDGE-CASE VALIDATION AUDIT');
  console.log(`Target: ${contracts.length} Registered Calculators`);
  console.log('=====================================================\n');

  let totalTestsExecuted = 0;
  let passedTests = 0;
  let failedTests = 0;

  const results: Array<{ calculatorId: string; testName: string; passed: boolean; message?: string }> = [];

  for (const contract of contracts) {
    const fields = contract.inputSchema?.fields || [];
    if (fields.length === 0) continue;

    // Test 1: NaN input injection on first numeric field
    const numericField = fields.find(f => ['number', 'integer', 'decimal', 'percentage', 'currency'].includes(f.type)) || fields[0];
    
    // Generate valid default inputs
    const defaultInputs: Record<string, any> = {};
    for (const f of fields) {
      defaultInputs[f.name] = f.defaultValue !== undefined ? f.defaultValue : (f.min !== undefined ? f.min : 10);
    }

    // 1. Test NaN rejection
    totalTestsExecuted++;
    const nanInputs = { ...defaultInputs, [numericField.name]: NaN };
    const nanRes = CalculationExecutor.executeContract(contract, nanInputs);
    if (!nanRes.success && nanRes.errors && nanRes.errors.length > 0) {
      passedTests++;
      results.push({ calculatorId: contract.id, testName: 'NaN Input Rejection', passed: true });
    } else {
      failedTests++;
      results.push({ calculatorId: contract.id, testName: 'NaN Input Rejection', passed: false, message: 'NaN was not rejected by validation' });
    }

    // 2. Test Infinity rejection
    totalTestsExecuted++;
    const infInputs = { ...defaultInputs, [numericField.name]: Infinity };
    const infRes = CalculationExecutor.executeContract(contract, infInputs);
    if (!infRes.success && infRes.errors && infRes.errors.length > 0) {
      passedTests++;
      results.push({ calculatorId: contract.id, testName: 'Infinity Input Rejection', passed: true });
    } else {
      failedTests++;
      results.push({ calculatorId: contract.id, testName: 'Infinity Input Rejection', passed: false, message: 'Infinity was not rejected by validation' });
    }

    // 3. Test valid default inputs preservation
    totalTestsExecuted++;
    const validRes = CalculationExecutor.executeContract(contract, defaultInputs);
    if (validRes.success) {
      passedTests++;
      results.push({ calculatorId: contract.id, testName: 'Valid Default Input Preservation', passed: true });
    } else {
      failedTests++;
      results.push({ calculatorId: contract.id, testName: 'Valid Default Input Preservation', passed: false, message: `Valid default inputs failed: ${JSON.stringify(validRes.errors)}` });
    }
  }

  console.log(`\nEdge-Case Testing Summary:`);
  console.log(`Total Calculators Tested: ${contracts.length}`);
  console.log(`Total Edge-Case Tests Executed: ${totalTestsExecuted}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);

  return {
    totalCalculators: contracts.length,
    totalTestsExecuted,
    passedTests,
    failedTests,
    results
  };
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runEdgeCaseTests')) {
  runEdgeCaseAudit();
}
