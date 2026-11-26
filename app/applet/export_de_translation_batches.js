import fs from 'fs';
import path from 'path';
import { TRANSLATIONS } from './src/i18n/translations.ts';

const enDict = TRANSLATIONS.en;
const entries = Object.entries(enDict);
const totalKeys = entries.length;

console.log('Total English translation keys:', totalKeys);

const batchSize = Math.ceil(totalKeys / 7);
const batches = [];
for (let i = 0; i < 7; i++) {
  const start = i * batchSize;
  const end = Math.min(start + batchSize, totalKeys);
  batches.push(entries.slice(start, end));
}

const dir = './translation-batches/de';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const batchInfo = [];

batches.forEach((batch, idx) => {
  const batchNum = String(idx + 1).padStart(3, '0');
  const filename = `DE_BATCH_${batchNum}.csv`;
  const filepath = path.join(dir, filename);
  
  let csvContent = 'key,english,german\n';
  batch.forEach(([key, english]) => {
    const escapedKey = `"${key.replace(/"/g, '""')}"`;
    const escapedEnglish = `"${String(english).replace(/"/g, '""')}"`;
    const german = '""';
    csvContent += `${escapedKey},${escapedEnglish},${german}\n`;
  });
  
  fs.writeFileSync(filepath, csvContent, 'utf8');
  
  batchInfo.push({
    filename,
    count: batch.length,
    firstKey: batch[0][0],
    lastKey: batch[batch.length - 1][0]
  });
});

let manifest = `# Glovotools German Translation Manifest (DE-TRANSLATION-01)\n\n`;
manifest += `- **Target Language:** German (DE)\n`;
manifest += `- **Source Language:** English (EN)\n`;
manifest += `- **English Source Files Used:** \`src/i18n/translations.ts\`\n`;
manifest += `- **Total English Translation Keys:** ${totalKeys}\n`;
manifest += `- **Total Batches Generated:** 7\n\n`;
manifest += `## Batch Summary\n\n`;
manifest += `| Batch File | Key Count | First Key | Last Key |\n`;
manifest += `|---|---|---|---|\n`;

batchInfo.forEach(b => {
  manifest += `| \`${b.filename}\` | ${b.count} | \`${b.firstKey}\` | \`${b.lastKey}\` |\n`;
});

manifest += `\n## Validations & Confirmations\n\n`;
manifest += `- **Omitted Keys:** None. Every key from the English master inventory was included.\n`;
manifest += `- **Duplicate Keys:** None. Every key was exported exactly once.\n`;
manifest += `- **German Column:** Completely empty for all keys, ready for the upcoming translation phase.\n`;
manifest += `- **Encoding:** UTF-8 CSV with proper escaping for commas and quotes.\n`;

fs.writeFileSync('./DE_TRANSLATION_MANIFEST.md', manifest, 'utf8');
console.log('Successfully generated 7 batches and DE_TRANSLATION_MANIFEST.md');
