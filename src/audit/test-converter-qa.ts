import { CalculationRegistry } from '../engine/CalculationRegistry.ts';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';
import { BATCH17_METADATA, BATCH17_SUBCATEGORIES } from '../data/catalog/batch17_converters.ts';
import { CATEGORIES, SUBCATEGORIES, CALCULATORS } from '../data/calculators.ts';
import { ES_CALCULATOR_OVERRIDES, ES_UI_STRINGS } from '../i18n/esTranslations.ts';

// Initialize central engine
CalculationRegistry.initialize();

interface TestReport {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const reports: TestReport[] = [];

function assert(suite: string, name: string, condition: boolean, error?: string) {
  reports.push({
    suite,
    name,
    passed: condition,
    error: condition ? undefined : (error || 'Assertion failed')
  });
}

console.log('====================================================');
console.log('   CALCTOOLS QA AUDIT: UNIT & MEASUREMENT CONVERTERS');
console.log('====================================================\n');

// 1. Category & Subcategory Integrity
const cat = CATEGORIES.find(c => c.id === 'converter');
assert('CategoryIntegrity', 'Converter category registered in CATEGORIES', !!cat);
assert('CategoryIntegrity', 'Converter category slug is "converter"', cat?.slug === 'converter');
assert('CategoryIntegrity', 'Converter category has active status', cat?.isActive === true);
assert('CategoryIntegrity', 'Converter category count matches 11 tools', cat?.count === 11);

for (const sub of BATCH17_SUBCATEGORIES) {
  const registeredSub = SUBCATEGORIES.find(s => s.id === sub.id);
  assert('SubcategoryIntegrity', `Subcategory "${sub.id}" registered in SUBCATEGORIES`, !!registeredSub);
  assert('SubcategoryIntegrity', `Subcategory "${sub.id}" belongs to "converter"`, registeredSub?.categoryId === 'converter');
}

// 2. All 11 Calculators Registered & Contract Alignment
for (const meta of BATCH17_METADATA) {
  const contract = CalculationRegistry.get(meta.id);
  assert('ContractRegistry', `Contract for "${meta.id}" is registered`, !!contract);
  assert('ContractRegistry', `Contract category for "${meta.id}" is "converter"`, contract?.category === 'converter');
  assert('ContractRegistry', `Contract subcategoryId matches metadata for "${meta.id}"`, contract?.subcategoryId === meta.subcategoryId);
}

// 3. Execution & Formula Testing on All 11 Converters

// 3.1 Universal Unit Converter
const rUniversal1 = CalculationExecutor.execute('universal-unit-converter', { value: 10, dimension: 'length', fromUnit: 'm', toUnit: 'ft' });
assert('UniversalConverter', '10 m to ft ≈ 32.8084 ft', rUniversal1.success && Math.abs((rUniversal1.data as any).convertedValue - 32.8084) < 0.001);

const rUniversal2 = CalculationExecutor.execute('universal-unit-converter', { value: 100, dimension: 'mass', fromUnit: 'kg', toUnit: 'lb' });
assert('UniversalConverter', '100 kg to lb ≈ 220.462 lbs', rUniversal2.success && Math.abs((rUniversal2.data as any).convertedValue - 220.462) < 0.01);

const rUniversal3 = CalculationExecutor.execute('universal-unit-converter', { value: 0, dimension: 'temperature', fromUnit: 'c', toUnit: 'f' });
assert('UniversalConverter', '0 °C to °F = 32 °F', rUniversal3.success && (rUniversal3.data as any).convertedValue === 32);

// 3.2 Length Converter
const rLen1 = CalculationExecutor.execute('length-converter', { length: 1, fromUnit: 'mi', toUnit: 'km' });
assert('LengthConverter', '1 mile = 1.609344 km', rLen1.success && Math.abs((rLen1.data as any).converted - 1.609344) < 0.0001);

const rLen2 = CalculationExecutor.execute('length-converter', { length: 0, fromUnit: 'm', toUnit: 'ft' });
assert('LengthConverter', '0 length converts to 0', rLen2.success && (rLen2.data as any).converted === 0);

const rLenNeg = CalculationExecutor.execute('length-converter', { length: -5, fromUnit: 'm', toUnit: 'ft' });
assert('LengthConverter', 'Negative length rejected', !rLenNeg.success && (rLenNeg.errors?.[0]?.code === 'RANGE_OUT_OF_BOUNDS' || rLenNeg.errors?.[0]?.code === 'NON_NEGATIVE_REQUIRED'));

// 3.3 Weight & Mass Converter
const rMass1 = CalculationExecutor.execute('weight-mass-converter', { mass: 1, fromUnit: 'kg', toUnit: 'g' });
assert('MassConverter', '1 kg = 1000 g', rMass1.success && (rMass1.data as any).converted === 1000);

const rMass2 = CalculationExecutor.execute('weight-mass-converter', { mass: 1, fromUnit: 'lb', toUnit: 'oz' });
assert('MassConverter', '1 lb = 16 oz', rMass1.success && Math.abs((rMass2.data as any).converted - 16) < 0.001);

const rMassNeg = CalculationExecutor.execute('weight-mass-converter', { mass: -10, fromUnit: 'kg', toUnit: 'lb' });
assert('MassConverter', 'Negative mass rejected', !rMassNeg.success && (rMassNeg.errors?.[0]?.code === 'RANGE_OUT_OF_BOUNDS' || rMassNeg.errors?.[0]?.code === 'NON_NEGATIVE_REQUIRED'));

// 3.4 Temperature Converter
const rTemp1 = CalculationExecutor.execute('temperature-converter', { temperature: 100, scale: 'C' });
assert('TemperatureConverter', '100 °C = 212 °F and 373.15 K', rTemp1.success && (rTemp1.data as any).fahrenheit === 212 && (rTemp1.data as any).kelvin === 373.15);

const rTempParity = CalculationExecutor.execute('temperature-converter', { temperature: -40, scale: 'C' });
assert('TemperatureConverter', '-40 °C parity = -40 °F', rTempParity.success && (rTempParity.data as any).fahrenheit === -40);

const rTempAbsZero = CalculationExecutor.execute('temperature-converter', { temperature: 0, scale: 'K' });
assert('TemperatureConverter', '0 K = -273.15 °C', rTempAbsZero.success && (rTempAbsZero.data as any).celsius === -273.15);

const rTempBelowAbsZero = CalculationExecutor.execute('temperature-converter', { temperature: -5, scale: 'K' });
assert('TemperatureConverter', 'Negative Kelvin rejected', !rTempBelowAbsZero.success && rTempBelowAbsZero.errors?.[0]?.code === 'RANGE_OUT_OF_BOUNDS');

const rTempBelowAbsZeroC = CalculationExecutor.execute('temperature-converter', { temperature: -300, scale: 'C' });
assert('TemperatureConverter', '< -273.15 °C rejected', !rTempBelowAbsZeroC.success && rTempBelowAbsZeroC.errors?.[0]?.code === 'RANGE_OUT_OF_BOUNDS');

// 3.5 Volume Converter
const rVol1 = CalculationExecutor.execute('volume-converter', { volume: 1, fromUnit: 'm3', toUnit: 'l' });
assert('VolumeConverter', '1 m³ = 1000 L', rVol1.success && (rVol1.data as any).converted === 1000);

const rVol2 = CalculationExecutor.execute('volume-converter', { volume: 1, fromUnit: 'gal', toUnit: 'l' });
assert('VolumeConverter', '1 US Gal ≈ 3.78541 L', rVol2.success && Math.abs((rVol2.data as any).converted - 3.78541) < 0.001);

const rVolNeg = CalculationExecutor.execute('volume-converter', { volume: -2, fromUnit: 'l', toUnit: 'gal' });
assert('VolumeConverter', 'Negative volume rejected', !rVolNeg.success && (rVolNeg.errors?.[0]?.code === 'RANGE_OUT_OF_BOUNDS' || rVolNeg.errors?.[0]?.code === 'NON_NEGATIVE_REQUIRED'));

// 3.6 Area Converter
const rArea1 = CalculationExecutor.execute('area-converter', { area: 1, fromUnit: 'ha', toUnit: 'm2' });
assert('AreaConverter', '1 Hectare = 10,000 m²', rArea1.success && (rArea1.data as any).converted === 10000);

const rArea2 = CalculationExecutor.execute('area-converter', { area: 1, fromUnit: 'acre', toUnit: 'sqft' });
assert('AreaConverter', '1 Acre ≈ 43,560 sq ft', rArea2.success && Math.abs((rArea2.data as any).converted - 43560) < 1);

const rAreaNeg = CalculationExecutor.execute('area-converter', { area: -50, fromUnit: 'sqft', toUnit: 'm2' });
assert('AreaConverter', 'Negative area rejected', !rAreaNeg.success && (rAreaNeg.errors?.[0]?.code === 'RANGE_OUT_OF_BOUNDS' || rAreaNeg.errors?.[0]?.code === 'NON_NEGATIVE_REQUIRED'));

// 3.7 Digital Storage Converter
const rDig1 = CalculationExecutor.execute('digital-storage-converter', { dataSize: 1, fromUnit: 'GB', toUnit: 'MB' });
assert('DigitalStorageConverter', '1 GB = 1024 MB', rDig1.success && (rDig1.data as any).converted === 1024);

const rDig2 = CalculationExecutor.execute('digital-storage-converter', { dataSize: 1, fromUnit: 'TB', toUnit: 'GB' });
assert('DigitalStorageConverter', '1 TB = 1024 GB', rDig2.success && (rDig2.data as any).converted === 1024);

const rDig3 = CalculationExecutor.execute('digital-storage-converter', { dataSize: 1, fromUnit: 'B', toUnit: 'b' });
assert('DigitalStorageConverter', '1 Byte = 8 bits', rDig3.success && (rDig3.data as any).converted === 8);

// 3.8 Speed Converter
const rSpeed1 = CalculationExecutor.execute('speed-converter', { speed: 60, fromUnit: 'mph', toUnit: 'kmh' });
assert('SpeedConverter', '60 mph ≈ 96.56 km/h', rSpeed1.success && Math.abs((rSpeed1.data as any).converted - 96.56) < 0.1);

const rSpeed2 = CalculationExecutor.execute('speed-converter', { speed: 1, fromUnit: 'knot', toUnit: 'kmh' });
assert('SpeedConverter', '1 knot = 1.852 km/h', rSpeed2.success && Math.abs((rSpeed2.data as any).converted - 1.852) < 0.01);

// 3.9 Pressure Converter
const rPress1 = CalculationExecutor.execute('pressure-converter', { pressure: 1, fromUnit: 'atm', toUnit: 'psi' });
assert('PressureConverter', '1 atm ≈ 14.696 PSI', rPress1.success && Math.abs((rPress1.data as any).converted - 14.696) < 0.01);

const rPress2 = CalculationExecutor.execute('pressure-converter', { pressure: 1, fromUnit: 'bar', toUnit: 'kpa' });
assert('PressureConverter', '1 bar = 100 kPa', rPress2.success && Math.abs((rPress2.data as any).converted - 100) < 0.01);

// 3.10 Energy Converter
const rEnergy1 = CalculationExecutor.execute('energy-power-converter', { energy: 1, fromUnit: 'kwh', toUnit: 'j' });
assert('EnergyConverter', '1 kWh = 3,600,000 J', rEnergy1.success && (rEnergy1.data as any).converted === 3600000);

const rEnergy2 = CalculationExecutor.execute('energy-power-converter', { energy: 1, fromUnit: 'kcal', toUnit: 'j' });
assert('EnergyConverter', '1 kcal = 4,184 J', rEnergy2.success && (rEnergy2.data as any).converted === 4184);

// 3.11 Time Duration Converter
const rTime1 = CalculationExecutor.execute('time-frequency-converter', { timeValue: 1, fromUnit: 'days', toUnit: 'hours' });
assert('TimeConverter', '1 day = 24 hours', rTime1.success && (rTime1.data as any).converted === 24);

const rTime2 = CalculationExecutor.execute('time-frequency-converter', { timeValue: 1, fromUnit: 'hours', toUnit: 'seconds' });
assert('TimeConverter', '1 hour = 3,600 seconds', rTime2.success && (rTime2.data as any).converted === 3600);

// 4. Spanish Localization Verification
assert('Localization', 'Category translation exists in ES_UI_STRINGS', !!ES_UI_STRINGS['cat.converter']);

for (const sub of BATCH17_SUBCATEGORIES) {
  assert('Localization', `Subcategory translation exists for "subcat.${sub.id}"`, !!ES_UI_STRINGS[`subcat.${sub.id}`]);
}

for (const meta of BATCH17_METADATA) {
  assert('Localization', `Spanish override exists for "${meta.id}"`, !!ES_CALCULATOR_OVERRIDES[meta.id]);
  assert('Localization', `Spanish override name is non-empty for "${meta.id}"`, !!ES_CALCULATOR_OVERRIDES[meta.id]?.name);
  assert('Localization', `Spanish override description is non-empty for "${meta.id}"`, !!ES_CALCULATOR_OVERRIDES[meta.id]?.description);
}

// 5. Round-trip Conversion Symmetry (A -> B -> A)
const testPairs: Array<{ calc: string; inputKey: string; from: string; to: string; val: number }> = [
  { calc: 'length-converter', inputKey: 'length', from: 'm', to: 'ft', val: 125.5 },
  { calc: 'weight-mass-converter', inputKey: 'mass', from: 'kg', to: 'lb', val: 78.4 },
  { calc: 'volume-converter', inputKey: 'volume', from: 'gal', to: 'l', val: 15.2 },
  { calc: 'area-converter', inputKey: 'area', from: 'acre', to: 'm2', val: 4.5 },
  { calc: 'digital-storage-converter', inputKey: 'dataSize', from: 'GB', to: 'MB', val: 64 },
  { calc: 'speed-converter', inputKey: 'speed', from: 'mph', to: 'kmh', val: 55 },
  { calc: 'pressure-converter', inputKey: 'pressure', from: 'psi', to: 'bar', val: 34 },
  { calc: 'energy-power-converter', inputKey: 'energy', from: 'kwh', to: 'btu', val: 12 }
];

for (const pair of testPairs) {
  const step1 = CalculationExecutor.execute(pair.calc, { [pair.inputKey]: pair.val, fromUnit: pair.from, toUnit: pair.to });
  const intermediate = (step1.data as any).converted;
  const step2 = CalculationExecutor.execute(pair.calc, { [pair.inputKey]: intermediate, fromUnit: pair.to, toUnit: pair.from });
  const finalVal = (step2.data as any).converted;
  const diffPercent = Math.abs((finalVal - pair.val) / pair.val) * 100;
  assert('SymmetryTest', `Round-trip symmetry for ${pair.calc} (${pair.from} <-> ${pair.to}) error < 0.01%`, diffPercent < 0.01);
}

// Summary Report
const passed = reports.filter(r => r.passed).length;
const failed = reports.filter(r => !r.passed).length;

console.log(`\n====================================================`);
console.log(`Total QA Test Assertions: ${reports.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`====================================================\n`);

if (failed > 0) {
  console.error('FAILED ASSERTIONS:');
  for (const r of reports.filter(r => !r.passed)) {
    console.error(`❌ [${r.suite}] ${r.name}: ${r.error}`);
  }
  process.exit(1);
} else {
  console.log('✅ ALL QA AUDIT SUITES PASSED PERFECTLY!\n');
  process.exit(0);
}
