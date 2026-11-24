import * as XLSX from 'xlsx';
import * as fs from 'fs';

interface MasterRow {
  'Translation Key': string;
  'English Source': string;
  'Spanish Translation': string;
  'Component': string;
  'Calculator ID': string;
  'Category': string;
  'Context': string;
}

interface ManifestRow {
  'Batch Filename': string;
  'Row Count': number;
  'First Key': string;
  'Last Key': string;
  'Status': string;
}

const masterPath = 'CALCTOOLS_ENGLISH_TRANSLATION_MASTER.xlsx';
if (!fs.existsSync(masterPath)) {
  console.error(`[ERROR] Master file not found at ${masterPath}`);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(masterPath);
const masterWb = XLSX.read(fileBuffer, { type: 'buffer' });
const sheetName = masterWb.SheetNames[0];
const sheet = masterWb.Sheets[sheetName];
const rows: MasterRow[] = XLSX.utils.sheet_to_json(sheet);

console.log(`[READ SUCCESS] Loaded ${rows.length} rows from ${masterPath}`);

const BATCH_SIZE = 1000;
const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
const manifestRows: ManifestRow[] = [];

for (let i = 0; i < totalBatches; i++) {
  const start = i * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, rows.length);
  const batchRows = rows.slice(start, end);

  const batchNumStr = String(i + 1).padStart(2, '0');
  const filename = `CALCTOOLS_ES_BATCH_${batchNumStr}.xlsx`;

  const batchWb = XLSX.utils.book_new();
  const batchWs = XLSX.utils.json_to_sheet(batchRows);

  batchWs['!cols'] = [
    { wch: 35 },
    { wch: 45 },
    { wch: 30 },
    { wch: 22 },
    { wch: 25 },
    { wch: 20 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(batchWb, batchWs, `BATCH_${batchNumStr}`);
  XLSX.writeFile(batchWb, filename);

  const firstKey = batchRows[0]['Translation Key'];
  const lastKey = batchRows[batchRows.length - 1]['Translation Key'];

  manifestRows.push({
    'Batch Filename': filename,
    'Row Count': batchRows.length,
    'First Key': firstKey,
    'Last Key': lastKey,
    'Status': 'Ready for Translation'
  });

  console.log(`[BATCH CREATED] ${filename}: rows ${start + 1} to ${end} (${batchRows.length} rows). First: ${firstKey}, Last: ${lastKey}`);
}

// Create manifest workbook
const manifestWb = XLSX.utils.book_new();
const manifestWs = XLSX.utils.json_to_sheet(manifestRows);
manifestWs['!cols'] = [
  { wch: 30 },
  { wch: 15 },
  { wch: 35 },
  { wch: 35 },
  { wch: 25 },
];
XLSX.utils.book_append_sheet(manifestWb, manifestWs, 'MANIFEST');
const manifestPath = 'CALCTOOLS_ES_BATCH_MANIFEST.xlsx';
XLSX.writeFile(manifestWb, manifestPath);

// Reconciliation Check
const totalBatchRows = manifestRows.reduce((sum, r) => sum + r['Row Count'], 0);
console.log(`\n[RECONCILIATION SUMMARY]`);
console.log(`- Master Total Rows: ${rows.length}`);
console.log(`- Total Batch Rows: ${totalBatchRows}`);
console.log(`- Match: ${rows.length === totalBatchRows ? 'PASSED (100% Match)' : 'FAILED'}`);
console.log(`- Total Batches Generated: ${totalBatches}`);
console.log(`- Manifest saved to: ${manifestPath}`);
