import { CALCULATORS, CATEGORIES, SUBCATEGORIES } from '../data/calculators.ts';
import { CalculationRegistry } from './CalculationRegistry.ts';
import { ALL_300_CONTRACTS } from './contracts/allContracts.ts';

console.log('====================================================');
console.log('CALCTOOLS PHASE 6 — 300 CALCULATORS VERIFICATION AUDIT');
console.log('====================================================\n');

CalculationRegistry.initialize();

const totalMeta = CALCULATORS.length;
const totalContracts = ALL_300_CONTRACTS.length;
const registryCount = CalculationRegistry.getRegisteredCount();

console.log(`1. Total Calculators in Catalog: ${totalMeta} (Target: 300)`);
console.log(`2. Total Calculation Contracts: ${totalContracts} (Target: 300)`);
console.log(`3. CalculationRegistry Registered Count: ${registryCount} (Target: 300)`);

if (totalMeta !== 300 || totalContracts !== 300 || registryCount !== 300) {
  console.error(`❌ FAILED: Count mismatch! Meta=${totalMeta}, Contracts=${totalContracts}, Registry=${registryCount}`);
  process.exit(1);
}

// Check duplicates
const metaIds = new Set<string>();
const duplicateMeta: string[] = [];
for (const c of CALCULATORS) {
  if (metaIds.has(c.id)) duplicateMeta.push(c.id);
  metaIds.add(c.id);
}

const contractIds = new Set<string>();
const duplicateContracts: string[] = [];
for (const c of ALL_300_CONTRACTS) {
  if (contractIds.has(c.id)) duplicateContracts.push(c.id);
  contractIds.add(c.id);
}

console.log(`\nDuplicate Metadata IDs: ${duplicateMeta.length === 0 ? 'None (PASS)' : duplicateMeta.join(', ')}`);
console.log(`Duplicate Contract IDs: ${duplicateContracts.length === 0 ? 'None (PASS)' : duplicateContracts.join(', ')}`);

if (duplicateMeta.length > 0 || duplicateContracts.length > 0) {
  console.error('❌ FAILED: Duplicate IDs found!');
  process.exit(1);
}

// Category Allocations
const TARGET_ALLOCATIONS: Record<string, { name: string; target: number }> = {
  'basic-math': { name: 'Basic Math', target: 25 },
  'algebra': { name: 'Algebra', target: 20 },
  'geometry': { name: 'Geometry', target: 22 },
  'trigonometry': { name: 'Trigonometry', target: 12 },
  'statistics': { name: 'Statistics & Probability', target: 24 },
  'scientific': { name: 'Scientific', target: 12 },
  'financial': { name: 'Financial', target: 42 },
  'business': { name: 'Business', target: 20 },
  'construction': { name: 'Construction', target: 30 },
  'health-fitness': { name: 'Health & Fitness', target: 25 },
  'datetime': { name: 'Date & Time', target: 16 },
  'electrical': { name: 'Electrical', target: 18 },
  'engineering': { name: 'Engineering', target: 20 },
  'everyday': { name: 'Everyday', target: 14 }
};

console.log('\n--- CATEGORY ALLOCATION AUDIT ---');
let allAllocationsPass = true;
let grandTotal = 0;

for (const [catId, spec] of Object.entries(TARGET_ALLOCATIONS)) {
  const metaCount = CALCULATORS.filter(c => c.category === catId).length;
  const contractCount = ALL_300_CONTRACTS.filter(c => c.category === catId).length;
  const catObj = CATEGORIES.find(c => c.id === catId);
  const pass = metaCount === spec.target && contractCount === spec.target && catObj?.count === spec.target;
  if (!pass) allAllocationsPass = false;
  grandTotal += metaCount;
  console.log(`- ${spec.name.padEnd(26)}: Actual = ${metaCount} | Contracts = ${contractCount} | Target = ${spec.target} [${pass ? 'PASS' : 'FAIL'}]`);
}

console.log(`\nTotal Across All 14 Categories: ${grandTotal} [${grandTotal === 300 ? 'EXACT 300 PASS' : 'FAIL'}]`);

if (!allAllocationsPass) {
  console.error('❌ FAILED: Category allocation discrepancy detected!');
  process.exit(1);
}

// Subcategory Audit
console.log(`\nTotal Subcategories defined: ${SUBCATEGORIES.length} (Target: 56)`);
let subcatsPass = true;
for (const sub of SUBCATEGORIES) {
  if (sub.count === 0) {
    console.warn(`⚠️ Warning: Subcategory "${sub.name}" (${sub.id}) has 0 calculators.`);
    subcatsPass = false;
  }
}
console.log(`All 56 Subcategories Populated: ${subcatsPass ? 'PASS' : 'WARN'}`);

// Execute all 300 calculations with default inputs
console.log('\n--- EXECUTING CONTRACTS SANITY CHECK (Default Inputs) ---');
let execPassed = 0;
let execFailed = 0;
for (const contract of ALL_300_CONTRACTS) {
  try {
    const defaultInputs: Record<string, any> = {};
    for (const field of contract.inputSchema.fields) {
      defaultInputs[field.name] = field.defaultValue ?? (field.type === 'number' || field.type === 'integer' || field.type === 'currency' || field.type === 'percentage' ? 10 : 'test');
    }
    const result = contract.calculate(defaultInputs);
    const formatted = contract.formatResult(result, defaultInputs);
    if (!formatted.primary || !formatted.primary.value) {
      console.error(`Contract ${contract.id} returned invalid formatted result`);
      execFailed++;
    } else {
      execPassed++;
    }
  } catch (err: any) {
    console.error(`Contract execution failed for ${contract.id}:`, err.message);
    execFailed++;
  }
}

console.log(`Contracts Executed Successfully: ${execPassed} / 300`);
if (execFailed > 0) {
  console.error(`❌ FAILED: ${execFailed} contracts failed execution!`);
  process.exit(1);
}

console.log('\n🎉 ALL 300 CALCULATOR AUDIT CHECKS PASSED WITH 100% SUCCESS!');
