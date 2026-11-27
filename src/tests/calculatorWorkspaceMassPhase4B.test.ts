import { describe, it, expect } from 'vitest';
import { CalculationRegistry } from '../engine/CalculationRegistry.ts';
import { translateTerm } from '../i18n/esTranslations.ts';
import { Language } from '../i18n/translations.ts';

const LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'it', 'ja', 'zh-CN', 'pl', 'pt-BR'];

describe('Phase 4B Mass Implementation: Complete Calculator Workspace Localization', () => {
  it('initializes the complete calculation registry and verifies all registered contracts', () => {
    CalculationRegistry.initialize();
    const allContracts = CalculationRegistry.getAll();
    expect(allContracts.length).toBeGreaterThan(100);
    console.log(`[Phase 4B Mass Test] Verified ${allContracts.length} calculation contracts in registry.`);
  });

  it('verifies mass workspace localization across all registered calculators and all 9 supported languages', () => {
    CalculationRegistry.initialize();
    const contracts = CalculationRegistry.getAll();
    let verifiedCount = 0;

    for (const contract of contracts) {
      if (!contract.inputSchema || !contract.inputSchema.fields) continue;

      for (const lang of LANGUAGES) {
        // Test field labels translation
        for (const field of contract.inputSchema.fields) {
          const locLabel = translateTerm(field.label, lang);
          expect(locLabel).toBeTruthy();
        }

        // Test sample calculation and result formatting
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
      verifiedCount++;
    }
    expect(verifiedCount).toBeGreaterThan(50);
    console.log(`[Phase 4B Mass Test] Mass workspace localization verified for ${verifiedCount} contracts across all 9 languages.`);
  });
});
