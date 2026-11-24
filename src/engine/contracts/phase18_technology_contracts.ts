import { CalculationContract, CalculationError } from '../types.ts';

export const urlSlugValidityContract: CalculationContract<{ slugInput: string }, { isValid: boolean; normalizedSlug: string; length: number; issues: string[] }> = {
  id: 'url-slug-validity-checker',
  name: 'URL Slug & URI Path Validity Checker',
  category: 'checkers',
  subcategoryId: 'p18-sub-check',
  formulaMeta: {
    formulaName: 'SEO Slug Regular Expression & Sanitization',
    formulaExpression: '/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
    variables: [
      { symbol: 'slug', name: 'URL Slug Input', unit: 'string' }
    ]
  },
  inputSchema: {
    fields: [
      {
        name: 'slugInput',
        label: 'URL Slug to Validate',
        type: 'text',
        defaultValue: 'my-first-blog-post',
        required: true,
        description: 'Enter the URL slug string (e.g. my-product-page)'
      }
    ]
  },
  validate: (inputs) => {
    const errors: CalculationError[] = [];
    if (!inputs.slugInput || typeof inputs.slugInput !== 'string') {
      errors.push({ field: 'slugInput', code: 'REQUIRED_FIELD_MISSING', message: 'Slug input is required' });
    }
    return errors;
  },
  calculate: (inputs) => {
    const raw = String(inputs.slugInput || '').trim();
    const normalized = raw
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const issues: string[] = [];
    if (/[A-Z]/.test(raw)) issues.push('Contains uppercase letters (should be lowercase for SEO)');
    if (/\s/.test(raw)) issues.push('Contains spaces (should be hyphenated)');
    if (/[^a-z0-9\s-_]/i.test(raw)) issues.push('Contains special characters or forbidden punctuation');
    if (raw !== normalized && issues.length === 0) issues.push('Formatting can be optimized');

    const isValid = raw.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw);

    return {
      isValid,
      normalizedSlug: normalized,
      length: raw.length,
      issues: issues.length > 0 ? issues : ['Slug is 100% SEO friendly and valid']
    };
  },
  formatResult: (result: any) => ({
    primary: {
      label: 'Slug Validity Status',
      value: result.isValid ? 'Valid SEO Slug ✓' : 'Invalid Slug Format ✗',
      numericValue: result.isValid ? 1 : 0
    },
    breakdown: [
      { label: 'Normalized Slug', value: result.normalizedSlug },
      { label: 'Character Length', value: String(result.length) },
      { label: 'SEO Assessment', value: result.issues.join('; ') }
    ]
  })
};

export const PHASE18_CONTRACTS: CalculationContract<any, any>[] = [
  urlSlugValidityContract
];
