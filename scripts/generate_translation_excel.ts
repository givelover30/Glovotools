import * as XLSX from 'xlsx';
import { CALCULATORS, CATEGORIES, SUBCATEGORIES } from '../src/data/calculators.ts';
import { CalculationRegistry } from '../src/engine/CalculationRegistry.ts';
import { TRANSLATIONS } from '../src/i18n/translations.ts';

interface RowData {
  'Translation Key': string;
  'English Source': string;
  'Spanish Translation': string;
  'Component': string;
  'Calculator ID': string;
  'Category': string;
  'Context': string;
}

const rows: RowData[] = [];
const seenKeys = new Set<string>();

function addRow(key: string, source: string, component: string, calcId: string, category: string, context: string) {
  if (!source || typeof source !== 'string') return;
  const cleanSource = source.trim();
  if (!cleanSource) return;
  const uniqueKey = `${calcId || 'GLOBAL'}:${key}`;
  if (seenKeys.has(uniqueKey)) return;
  seenKeys.add(uniqueKey);

  rows.push({
    'Translation Key': key,
    'English Source': cleanSource,
    'Spanish Translation': '',
    'Component': component,
    'Calculator ID': calcId || 'GLOBAL',
    'Category': category || 'GLOBAL',
    'Context': context
  });
}

// 1. Extract Global UI strings from TRANSLATIONS.en
const enDict = TRANSLATIONS.en || {};
for (const [k, v] of Object.entries(enDict)) {
  addRow(k, v, 'GlobalUI', 'GLOBAL', 'GLOBAL', 'Global navigation, header, footer, or UI label.');
}

// 2. Extract Categories and Subcategories
for (const cat of CATEGORIES) {
  addRow(`category.title.${cat.id}`, cat.title, 'CategoryCard', 'GLOBAL', cat.id, 'Category title. Protect numerical sort order.');
  addRow(`category.subtitle.${cat.id}`, cat.subtitle, 'CategoryCard', 'GLOBAL', cat.id, 'Category subtitle description.');
  addRow(`category.desc.${cat.id}`, cat.description, 'CategoryDetailPage', 'GLOBAL', cat.id, 'Category full description.');
}

for (const sub of SUBCATEGORIES) {
  addRow(`subcategory.name.${sub.id}`, sub.name, 'SubcategoryPill', 'GLOBAL', sub.categoryId, 'Subcategory name.');
  addRow(`subcategory.desc.${sub.id}`, sub.description, 'SubcategoryPage', 'GLOBAL', sub.categoryId, 'Subcategory description.');
}

// 3. Extract all 360 calculators metadata and contract details
for (const calc of CALCULATORS) {
  const cat = calc.category;
  addRow(`calc.name.${calc.id}`, calc.name, 'CalculatorCard', calc.id, cat, 'Calculator main display title.');
  addRow(`calc.shortDesc.${calc.id}`, calc.shortDesc, 'CalculatorCard', calc.id, cat, 'Calculator short description card snippet.');
  addRow(`calc.formula.${calc.id}`, calc.formula, 'CalculatorCard', calc.id, cat, 'Mathematical formula expression. KEEP MATHEMATICAL SYMBOLS INTACT.');

  if (calc.tags) {
    calc.tags.forEach((tag, idx) => {
      addRow(`calc.tag.${calc.id}.${idx}`, tag, 'CalculatorCard', calc.id, cat, 'Search tag keyword.');
    });
  }

  // Contract details (inputs, outputs, documentation, FAQs)
  const contract = CalculationRegistry.get(calc.id);
  if (contract) {
    if (contract.inputSchema && contract.inputSchema.fields) {
      contract.inputSchema.fields.forEach((field) => {
        addRow(`calc.input.label.${calc.id}.${field.name}`, field.label, 'EngineCalculatorView', calc.id, cat, 'Input parameter label.');
        if (field.description) {
          addRow(`calc.input.desc.${calc.id}.${field.name}`, field.description, 'EngineCalculatorView', calc.id, cat, 'Input parameter help text.');
        }
        if (field.unit) {
          addRow(`calc.input.unit.${calc.id}.${field.name}`, field.unit, 'EngineCalculatorView', calc.id, cat, 'Input parameter unit. DO NOT TRANSLATE IF SYMBOL (e.g. %, $, kg).');
        }
        if (field.options) {
          field.options.forEach((opt, oIdx) => {
            addRow(`calc.input.opt.${calc.id}.${field.name}.${oIdx}`, opt.label, 'EngineCalculatorView', calc.id, cat, 'Select dropdown option label.');
          });
        }
      });
    }

    if (contract.formulaMeta) {
      addRow(`calc.formulaMeta.expr.${calc.id}`, contract.formulaMeta.formulaExpression, 'FormulaExplanation', calc.id, cat, 'Core mathematical formula. PROTECT MATH CONSTANTS & VARIABLES.');
      if (contract.formulaMeta.variables) {
        contract.formulaMeta.variables.forEach((v, vIdx) => {
          addRow(`calc.variable.symbol.${calc.id}.${vIdx}`, v.symbol, 'FormulaExplanation', calc.id, cat, 'Variable symbol (keep invariant).');
          addRow(`calc.variable.name.${calc.id}.${vIdx}`, v.name, 'FormulaExplanation', calc.id, cat, 'Variable parameter name.');
          addRow(`calc.variable.desc.${calc.id}.${vIdx}`, v.description, 'FormulaExplanation', calc.id, cat, 'Variable description.');
          if (v.unit) {
            addRow(`calc.variable.unit.${calc.id}.${vIdx}`, v.unit, 'FormulaExplanation', calc.id, cat, 'Variable unit.');
          }
        });
      }
    }

    if (contract.documentation) {
      const doc = contract.documentation;
      if (doc.methodologySteps) {
        doc.methodologySteps.forEach((step, sIdx) => {
          addRow(`calc.doc.step.${calc.id}.${sIdx}`, step, 'StepByStepGuide', calc.id, cat, 'Methodology step-by-step instruction.');
        });
      }
      if (doc.workedExamples) {
        doc.workedExamples.forEach((ex, eIdx) => {
          addRow(`calc.doc.ex.scenario.${calc.id}.${eIdx}`, ex.scenario, 'WorkedExamples', calc.id, cat, 'Worked example scenario.');
          if (ex.solutionSummary) {
            addRow(`calc.doc.ex.summary.${calc.id}.${eIdx}`, ex.solutionSummary, 'WorkedExamples', calc.id, cat, 'Worked example solution summary.');
          }
        });
      }
      if (doc.assumptionsAndStandards) {
        doc.assumptionsAndStandards.forEach((asp, aIdx) => {
          addRow(`calc.doc.assumption.${calc.id}.${aIdx}`, asp, 'CalculatorDisclaimer', calc.id, cat, 'Assumption & standard requirement.');
        });
      }
      if (doc.modelLimitations) {
        doc.modelLimitations.forEach((lim, lIdx) => {
          addRow(`calc.doc.limitation.${calc.id}.${lIdx}`, lim, 'CalculatorDisclaimer', calc.id, cat, 'Model limitation advisory.');
        });
      }
      if (doc.faqs) {
        doc.faqs.forEach((faq, fIdx) => {
          addRow(`calc.faq.q.${calc.id}.${fIdx}`, faq.question, 'CalculatorFAQ', calc.id, cat, 'Frequently asked question title.');
          addRow(`calc.faq.a.${calc.id}.${fIdx}`, faq.answer, 'CalculatorFAQ', calc.id, cat, 'Frequently asked question answer.');
        });
      }
    }
  }
}

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(rows);

ws['!cols'] = [
  { wch: 35 },
  { wch: 45 },
  { wch: 30 },
  { wch: 22 },
  { wch: 25 },
  { wch: 20 },
  { wch: 40 },
];

XLSX.utils.book_append_sheet(wb, ws, 'CALCTOOLS_MASTER');

const outputPath = 'CALCTOOLS_ENGLISH_TRANSLATION_MASTER.xlsx';
XLSX.writeFile(wb, outputPath);

console.log(`[EXPORT SUCCESS] Generated ${outputPath} with ${rows.length} strings extracted.`);
