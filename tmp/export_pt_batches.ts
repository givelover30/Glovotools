import * as fs from 'fs';
import * as XLSX from 'xlsx';

async function runExport() {
  const translationsModule = await import('../src/i18n/translations.ts');
  const esignModule = await import('../src/i18n/esignTranslations.ts');
  const docConvModule = await import('../src/i18n/docConverterTranslations.ts');
  const pdfErrorsModule = await import('../src/services/pdf/v2/pdfErrors.ts');
  const calculatorsModule = await import('../src/data/calculators.ts');
  const categoryRegistryModule = await import('../src/data/categories/categoryRegistry.ts');
  const pdfWorkspaceModule = await import('../src/services/pdf/v2/pdfWorkspaceIntegration.ts');
  const contractsModule = await import('../src/engine/contracts/allContracts.ts');
  const calcDetailsModule = await import('../src/data/calculatorDetails.ts');
  const esTranslationsModule = await import('../src/i18n/esTranslations.ts');

  const entriesMap = new Map();

  function addEntry(key: string, source: string, category: string, context: string, namespace: string) {
    if (!key || !source) return;
    const cleanKey = String(key).trim();
    const cleanSource = String(source).trim();
    if (!cleanKey || !cleanSource) return;
    if (/^\$\{/.test(cleanSource) || /console\.|className=|xmlns/.test(cleanSource)) return;
    if (!entriesMap.has(cleanKey)) {
      entriesMap.set(cleanKey, {
        key: cleanKey,
        source: cleanSource,
        category: category || 'General',
        context: context || 'User-facing UI string',
        namespace: namespace || 'general',
        status: 'PENDING'
      });
    }
  }

  // 1. TRANSLATIONS.en
  const enDict = translationsModule.TRANSLATIONS?.en || {};
  for (const [k, v] of Object.entries(enDict)) {
    if (typeof v === 'string') {
      const ns = k.includes('.') ? k.split('.')[0] : 'general';
      addEntry(k, v, 'UI & Navigation', `Core translation dictionary (${ns})`, ns);
    }
  }

  // 2. ESIGN_TRANSLATIONS.en
  const esignDict = esignModule.ESIGN_TRANSLATIONS?.en || {};
  for (const [k, v] of Object.entries(esignDict)) {
    if (typeof v === 'string') {
      addEntry(k, v, 'E-Signature Suite', 'E-Signature translation dictionary', 'esign');
    }
  }

  // 3. DOC_CONVERTER_LOCALE.en
  const docDict = docConvModule.DOC_CONVERTER_LOCALE?.en || {};
  for (const [k, v] of Object.entries(docDict)) {
    if (typeof v === 'string') {
      addEntry(k, v, 'Document Converters', 'Document converter dictionary', 'docConverter');
    }
  }

  // 4. ERROR_CATALOG
  const errCatalog = pdfErrorsModule.ERROR_CATALOG || {};
  for (const [errCode, def] of Object.entries(errCatalog)) {
    if (def && typeof def === 'object') {
      if ((def as any).message) {
        addEntry(`pdfError.message.${errCode}`, (def as any).message, 'PDF Errors', 'PDF engine error message', 'errors');
      }
      if ((def as any).recoverableHint) {
        addEntry(`pdfError.hint.${errCode}`, (def as any).recoverableHint, 'PDF Errors', 'PDF recovery hint', 'errors');
      }
    }
  }

  // 5. CATEGORIES
  const categories = calculatorsModule.CATEGORIES || [];
  for (const cat of categories) {
    if (cat.id) {
      addEntry(`category.name.${cat.id}`, cat.name, 'Categories', 'Category display name', 'categories');
      addEntry(`category.desc.${cat.id}`, cat.shortDesc, 'Categories', 'Category description', 'categories');
    }
  }

  // 6. SUBCATEGORIES
  const subcategories = calculatorsModule.SUBCATEGORIES || [];
  for (const sub of subcategories) {
    if (sub.id) {
      addEntry(`subcategory.name.${sub.id}`, sub.name, 'Subcategories', 'Subcategory display name', 'subcategories');
      addEntry(`subcategory.desc.${sub.id}`, sub.description, 'Subcategories', 'Subcategory description', 'subcategories');
    }
  }

  // 7. CALCULATORS
  const calculators = calculatorsModule.CALCULATORS || [];
  for (const calc of calculators) {
    if (calc.id) {
      addEntry(`calc.name.${calc.id}`, calc.name, calc.category || 'calculators', `Tool display title (${calc.category})`, 'calculators');
      addEntry(`calc.shortDesc.${calc.id}`, calc.shortDesc, calc.category || 'calculators', `Tool card & header description (${calc.category})`, 'calculators');
    }
  }

  // 8. MAIN_CATEGORIES_REGISTRY
  const mainReg = categoryRegistryModule.MAIN_CATEGORIES_REGISTRY || [];
  for (const hub of mainReg) {
    if (hub.id) {
      addEntry(`hub.title.${hub.id}`, hub.title, 'Tool Hubs', 'Tool hub title', 'hubs');
      addEntry(`hub.subtitle.${hub.id}`, hub.subtitle, 'Tool Hubs', 'Tool hub subtitle', 'hubs');
    }
  }

  // 9. PDF_TOOL_OPERATION_REGISTRY
  const pdfToolReg = pdfWorkspaceModule.PDF_TOOL_OPERATION_REGISTRY || {};
  for (const [toolId, cfg] of Object.entries(pdfToolReg)) {
    if (cfg && typeof cfg === 'object') {
      if ((cfg as any).textInputLabel) {
        addEntry(`pdfTool.label.${toolId}`, (cfg as any).textInputLabel, 'PDF Tools', 'Custom PDF tool input label', 'pdfTools');
      }
      if ((cfg as any).textInputPlaceholder) {
        addEntry(`pdfTool.placeholder.${toolId}`, (cfg as any).textInputPlaceholder, 'PDF Tools', 'Custom PDF tool input placeholder', 'pdfTools');
      }
      if ((cfg as any).disclosedLimitations) {
        (cfg as any).disclosedLimitations.forEach((lim: string, idx: number) => {
          addEntry(`pdfTool.limitation.${toolId}.${idx}`, lim, 'PDF Tools', 'Disclosed operational limitation', 'pdfTools');
        });
      }
    }
  }

  // 10. ALL_REGISTERED_CONTRACTS
  const contracts = contractsModule.ALL_REGISTERED_CONTRACTS || [];
  for (const contract of contracts) {
    if (contract.id && contract.inputSchema && Array.isArray(contract.inputSchema.fields)) {
      for (const field of contract.inputSchema.fields) {
        if (field.label) {
          addEntry(`calc.input.label.${contract.id}.${field.name}`, field.label, 'Calculator Inputs', 'Calculator input field label', 'calculatorInputs');
        }
        if (field.description) {
          addEntry(`calc.input.desc.${contract.id}.${field.name}`, field.description, 'Calculator Inputs', 'Calculator input field description', 'calculatorInputs');
        }
        if (Array.isArray(field.options)) {
          for (const opt of field.options) {
            if (opt && opt.label) {
              addEntry(`calc.input.option.${contract.id}.${field.name}.${opt.value}`, opt.label, 'Calculator Inputs', 'Calculator input select option label', 'calculatorInputs');
            }
          }
        }
      }
    }
    if (contract.id && contract.formulaMeta && Array.isArray(contract.formulaMeta.variables)) {
      for (const v of contract.formulaMeta.variables) {
        if (v.description) {
          addEntry(`calc.variable.desc.${contract.id}.${v.name}`, v.description, 'Calculator Documentation', 'Formula variable description', 'calculatorDocs');
        }
      }
    }
  }

  // 11. CALCULATOR_DETAILS
  const calcDetails = calcDetailsModule.CALCULATOR_DETAILS || {};
  for (const [calcId, details] of Object.entries(calcDetails)) {
    if (details && typeof details === 'object') {
      if ((details as any).formulaName) {
        addEntry(`calc.doc.formulaName.${calcId}`, (details as any).formulaName, 'Calculator Documentation', 'Curated formula display name', 'calculatorDocs');
      }
      if ((details as any).methodology) {
        addEntry(`calc.doc.methodology.${calcId}`, (details as any).methodology, 'Calculator Documentation', 'Curated methodology explanation', 'calculatorDocs');
      }
      if ((details as any).disclaimer) {
        addEntry(`calc.doc.disclaimer.${calcId}`, (details as any).disclaimer, 'Calculator Documentation', 'Curated legal/financial disclaimer', 'calculatorDocs');
      }
    }
  }

  // 12. ES_TERMS (shared domain terms)
  const esTerms = esTranslationsModule.ES_TERMS || {};
  for (const [k, v] of Object.entries(esTerms)) {
    if (typeof v === 'string') {
      addEntry(`term.${k}`, v, 'Domain Terms', 'Shared domain terminology dictionary', 'terms');
    }
  }

  const allEntries = Array.from(entriesMap.values());
  console.log(`Total unique extracted translation entries: ${allEntries.length}`);

  // Divide into 7 balanced batches
  const batchSize = Math.ceil(allEntries.length / 7);
  const batches = [];
  for (let i = 0; i < 7; i++) {
    batches.push(allEntries.slice(i * batchSize, (i + 1) * batchSize));
  }

  const summaryRows: any[] = [];
  const keyIndexRows: any[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batchNum = i + 1;
    const batchData = batches[i];
    const filename = `GLOVOTOOLS_PT_BATCH_0${batchNum}.xlsx`;

    const sheetRows = batchData.map(e => ({
      "Translation Key": e.key,
      "English Source": e.source,
      "Portuguese Translation": "",
      "Category": e.category,
      "Context": e.context,
      "Namespace": e.namespace,
      "Status": "PENDING"
    }));

    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `PT_BATCH_0${batchNum}`);

    // Resolve workspace absolute root path for writing
    const outPath = path.resolve(process.cwd(), filename);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(outPath, buf);

    const firstKey = batchData[0]?.key || '';
    const lastKey = batchData[batchData.length - 1]?.key || '';
    const namespaces = Array.from(new Set(batchData.map(e => e.namespace))).join(', ');

    summaryRows.push({
      "Batch Filename": filename,
      "Batch Number": batchNum,
      "Entry Count": batchData.length,
      "First Key": firstKey,
      "Last Key": lastKey,
      "Namespaces Included": namespaces,
      "Status": "Pending Translation"
    });

    for (const e of batchData) {
      keyIndexRows.push({
        "Translation Key": e.key,
        "Batch Filename": filename,
        "Batch Number": batchNum,
        "Namespace": e.namespace,
        "Category": e.category
      });
    }

    console.log(`Generated ${filename}: ${batchData.length} entries (${firstKey} .. ${lastKey})`);
  }

  // Total summary row
  summaryRows.push({
    "Batch Filename": "TOTAL (ALL 7 BATCHES)",
    "Batch Number": 7,
    "Entry Count": allEntries.length,
    "First Key": allEntries[0]?.key || '',
    "Last Key": allEntries[allEntries.length - 1]?.key || '',
    "Namespaces Included": "All namespaces",
    "Status": "Reconciled"
  });

  const manifestWb = XLSX.utils.book_new();
  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  const keyIndexWs = XLSX.utils.json_to_sheet(keyIndexRows);
  XLSX.utils.book_append_sheet(manifestWb, summaryWs, "BATCH_SUMMARY");
  XLSX.utils.book_append_sheet(manifestWb, keyIndexWs, "KEY_INDEX");

  const manifestOutPath = path.resolve(process.cwd(), "GLOVOTOOLS_PT_BATCH_MANIFEST.xlsx");
  const manifestBuf = XLSX.write(manifestWb, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(manifestOutPath, manifestBuf);
  console.log(`Generated GLOVOTOOLS_PT_BATCH_MANIFEST.xlsx with ${keyIndexRows.length} indexed keys.`);
}

runExport().catch(err => {
  console.error("Export failed:", err);
  process.exit(1);
});
