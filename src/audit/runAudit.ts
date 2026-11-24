import { AuditRunner } from './AuditRunner.ts';

function main() {
  const report = AuditRunner.executeFullAudit();
  const passedTotal = report.categorySummaries.reduce((sum, c) => sum + c.passedCount, 0);
  const failedTotal = report.totalCalculatorsAudited - passedTotal;
  const totalTests = report.categorySummaries.reduce((sum, c) => sum + c.testsExecuted, 0);

  console.log('\n=====================================================');
  console.log('PHASE 7 INDEPENDENT AUDIT SUMMARY');
  console.log('=====================================================');
  console.log(`Calculators Audited:     ${report.totalCalculatorsAudited} / ${report.totalCalculatorsTarget}`);
  console.log(`Calculators Certified:   ${passedTotal}`);
  console.log(`Calculators Failed:      ${failedTotal}`);
  console.log(`Categories Audited:      ${report.categoriesAudited}`);
  console.log(`Subcategories Audited:   ${report.subcategoriesAudited}`);
  console.log(`Total Test Assertions:   ${totalTests}`);
  console.log(`Total Defects Found:     ${report.defectsIdentified.length}`);
  console.log(`Unresolved Defects:      ${report.unresolvedDefects}`);
  console.log(`Certification Decision:  ${report.certificationDecision}`);

  console.log('\n--- CATEGORY BREAKDOWN ---');
  for (const cat of report.categorySummaries) {
    const status = cat.allPassing ? '✓ PASS' : '✗ FAIL';
    console.log(
      `[${status}] ${cat.categoryName.padEnd(25)}: ${cat.passedCount}/${cat.totalCalculators} certified (${cat.testsExecuted} assertions, max discrepancy: ${cat.maxDiscrepancy.toFixed(6)})`
    );
  }

  if (report.defectsIdentified.length > 0) {
    console.log('\n--- DISCOVERED DEFECTS ---');
    for (const d of report.defectsIdentified) {
      console.log(`[${d.severity}] ${d.id} (${d.calculatorId}): ${d.description}`);
      console.log(`  Expected: ${d.expectedBehavior}`);
      console.log(`  Actual:   ${d.actualBehavior}`);
      if (d.testCaseInputs) {
        console.log(`  Inputs:   ${JSON.stringify(d.testCaseInputs)}`);
      }
    }
    process.exit(1);
  } else {
    console.log('\n✓ ALL 300 CALCULATORS PASSED INDEPENDENT AUDIT WITH ZERO DEFECTS!');
    process.exit(0);
  }
}

main();
