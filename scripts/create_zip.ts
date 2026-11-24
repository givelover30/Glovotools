import AdmZip from 'adm-zip';
import * as fs from 'fs';

const zip = new AdmZip();
const files = [
  'CALCTOOLS_ENGLISH_TRANSLATION_MASTER.xlsx',
  'CALCTOOLS_ES_BATCH_01.xlsx',
  'CALCTOOLS_ES_BATCH_02.xlsx',
  'CALCTOOLS_ES_BATCH_03.xlsx',
  'CALCTOOLS_ES_BATCH_04.xlsx',
  'CALCTOOLS_ES_BATCH_05.xlsx',
  'CALCTOOLS_ES_BATCH_06.xlsx',
  'CALCTOOLS_ES_BATCH_07.xlsx',
  'CALCTOOLS_ES_BATCH_MANIFEST.xlsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    zip.addLocalFile(file);
    console.log(`[ADDED TO ZIP] ${file}`);
  } else {
    console.warn(`[WARNING] File not found: ${file}`);
  }
}

const zipPath = '/.aistudio/artifacts/brain/10a33712-0a1b-4982-bf73-dfb9cb6ecefb/CALCTOOLS_SPANISH_TRANSLATION_BATCHES.zip';
zip.writeZip(zipPath);
console.log(`[ZIP SUCCESS] Created ${zipPath} successfully.`);
