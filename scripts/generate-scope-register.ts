import fs from 'node:fs';
import { CALCULATORS } from '../src/data/calculators.ts';

function run() {
  const csvText = fs.readFileSync('PLANNERS_ORGANIZERS_DEFECT_REGISTER.csv', 'utf8');
  const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
  const defectMap = new Map<string, any>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j+1] === '"') {
          cur += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    const [id, name, status, issue, remedy, priority, files] = cols;
    if (id && priority === 'P1') {
      defectMap.set(id, { name, status, issue, remedy, priority, files });
    }
  }

  const planners = CALCULATORS.filter(c => c.category === 'planners');
  const uniqueMap = new Map<string, any>();
  for (const c of planners) {
    if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
  }

  const p1ToolIds = Array.from(defectMap.keys());
  console.log('Exact P1 count in defect register:', p1ToolIds.length);

  const rows: string[] = [];
  rows.push([
    'Tool ID',
    'Tool Name',
    'Priority',
    'Category',
    'Subcategory',
    'Source Batch',
    'Current Status',
    'Existing Component',
    'Required Functionality',
    'Planned Contract',
    'Planned Workspace',
    'Planned Tests',
    'Implementation Batch',
    'Status'
  ].map(h => `"${h}"`).join(','));

  for (let idx = 0; idx < p1ToolIds.length; idx++) {
    const id = p1ToolIds[idx];
    const def = defectMap.get(id);
    const meta = uniqueMap.get(id);
    const name = meta ? meta.name : def.name;
    const subcategory = meta ? meta.subcategoryId : 'planners';
    const status = def.status;
    const isPartial = status.includes('PARTIALLY');
    const batchNum = isPartial ? 'Batch 1 (Partials)' : `Batch ${Math.floor(idx / 12) + 2}`;

    rows.push([
      id,
      name,
      'P1',
      'planners',
      subcategory,
      def.files.split(';')[0]?.trim() || 'catalog',
      status,
      isPartial ? 'Existing partial UI component' : 'Generic EngineCalculatorView fallback',
      def.remedy,
      `Dedicated CalculationContract for ${name}`,
      `Dedicated React Workspace component for ${id}`,
      'Vitest unit/contract test suite',
      batchNum,
      'Pending Implementation'
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  }

  fs.writeFileSync('PLANNER_IMPLEMENTATION_02_SCOPE_REGISTER.csv', rows.join('\r\n'), 'utf8');
  console.log('Successfully generated PLANNER_IMPLEMENTATION_02_SCOPE_REGISTER.csv with', p1ToolIds.length, 'rows.');
}

run();
