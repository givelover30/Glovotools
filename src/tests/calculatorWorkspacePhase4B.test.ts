import { describe, it, expect } from 'vitest';
import { CalculationRegistry } from '../engine/CalculationRegistry.ts';
import { translateTerm } from '../i18n/esTranslations.ts';
import { Language } from '../i18n/translations.ts';

const PILOT_CALCULATOR_IDS = [
  'percentage',
  'scientific-calc',
  'loan-mortgage',
  'compound-interest',
  'bmi',
  'speed-converter',
  'date-difference',
  'percent-change',
  'ohms-law',
  'tip-split'
];

const LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'it', 'ja', 'zh-CN', 'pl', 'pt-BR'];

describe('Phase 4B: 10-Calculator Pilot Workspace Localization', () => {
  it('verifies all 10 pilot calculator contracts exist and initialize successfully', () => {
    CalculationRegistry.initialize();
    for (const id of PILOT_CALCULATOR_IDS) {
      const contract = CalculationRegistry.get(id);
      expect(contract).toBeDefined();
      expect(contract?.inputSchema).toBeDefined();
      expect(contract?.inputSchema?.fields?.length).toBeGreaterThan(0);
      expect(typeof contract?.calculate).toBe('function');
    }
  });

  it('verifies workspace translation inputs, results, and labels across all 9 languages for pilot calculators', () => {
    CalculationRegistry.initialize();
    for (const id of PILOT_CALCULATOR_IDS) {
      const contract = CalculationRegistry.get(id);
      expect(contract).toBeDefined();
      if (!contract || !contract.inputSchema || !contract.inputSchema.fields) continue;

      for (const lang of LANGUAGES) {
        // Test field labels translation
        for (const field of contract.inputSchema.fields) {
          const locLabel = translateTerm(field.label, lang);
          expect(locLabel).toBeTruthy();
        }

        // Test sample calculation execution and formatting
        const sampleInputs: Record<string, any> = {};
        for (const field of contract.inputSchema.fields) {
          sampleInputs[field.name] = field.defaultValue !== undefined ? field.defaultValue : (field.type === 'number' ? 10 : 'test');
        }

        const result = contract.calculate(sampleInputs);
        expect(result).toBeDefined();

        const formatted = contract.formatResult(result, sampleInputs);
        expect(formatted).toBeDefined();
        if (formatted.primary) {
          const locPrimaryLabel = translateTerm(formatted.primary.label, lang);
          expect(locPrimaryLabel).toBeTruthy();
        }
      }
    }
  });
});
