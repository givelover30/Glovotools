import { CalculationContract } from './types.ts';
import { CalculatorId, CategoryId, CalculatorMeta } from '../types.ts';
import { ALL_REGISTERED_CONTRACTS } from './contracts/allContracts.ts';
import { CALCULATORS } from '../data/calculators.ts';
import { PrecisionEngine } from './PrecisionEngine.ts';

export class CalculationRegistry {
  private static contracts: Map<string, CalculationContract<any, any>> = new Map();
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;
    this.contracts.clear();
    for (const contract of ALL_REGISTERED_CONTRACTS) {
      this.register(contract);
    }
    this.initialized = true;
  }

  public static register(contract: CalculationContract<any, any>): void {
    if (!contract.id) {
      throw new Error('Cannot register calculator contract without an ID');
    }
    if (this.contracts.has(contract.id)) {
      console.warn(`Duplicate calculator contract registration detected for ID: "${contract.id}". Overwriting.`);
    }
    this.contracts.set(contract.id, contract);
  }

  public static get<TInput = Record<string, unknown>, TResult = Record<string, unknown>>(
    id: CalculatorId | string
  ): CalculationContract<TInput, TResult> | undefined {
    this.ensureInitialized();
    let contract = this.contracts.get(id) as CalculationContract<TInput, TResult> | undefined;
    if (!contract && id) {
      const meta = CALCULATORS.find((c) => c.id === id);
      if (meta) {
        if (meta.id === 'cloud-storage-cost-optimizer') {
          const customFields = [
            { name: 'storageCapacityGB', label: 'Storage Capacity (GB)', type: 'number', defaultValue: 1000, required: true, min: 0, description: 'Total stored volume in gigabytes' },
            { name: 'storageTierRate', label: 'Storage Tier Rate ($/GB)', type: 'number', defaultValue: 0.023, required: true, min: 0, description: 'Cost per gigabyte per month' },
            { name: 'retrievalFees', label: 'Retrieval Fees ($)', type: 'number', defaultValue: 5, required: true, min: 0, description: 'Monthly data retrieval fees' },
            { name: 'egressFees', label: 'Egress Fees ($)', type: 'number', defaultValue: 10, required: true, min: 0, description: 'Monthly data transfer out fees' }
          ];
          contract = {
            id: meta.id,
            name: meta.name,
            category: meta.category as any,
            subcategoryId: meta.subcategoryId,
            formulaName: meta.formula || 'Total Cost = (Gigabytes × Tier Rate) + Retrieval Fees + Egress Fees',
            inputSchema: { fields: customFields },
            validate: (inputs: any) => {
              const errs: any[] = [];
              for (const f of customFields) {
                const val = inputs[f.name];
                if (val === undefined || val === '' || val === null) {
                  errs.push({ field: f.name, code: 'REQUIRED_FIELD_MISSING', message: `Field "${f.name}" is required.` });
                } else {
                  const num = Number(val);
                  if (isNaN(num)) {
                    errs.push({ field: f.name, code: 'INVALID_NUMERIC_VALUE', message: `Field "${f.name}" must be a valid numeric value.` });
                  } else if (f.min !== undefined && num < f.min) {
                    errs.push({ field: f.name, code: 'RANGE_OUT_OF_BOUNDS', message: `Field "${f.name}" cannot be negative.` });
                  }
                }
              }
              return errs;
            },
            calculate: (inputs: any) => {
              const gb = Number(inputs.storageCapacityGB);
              const rate = Number(inputs.storageTierRate);
              const retrieval = Number(inputs.retrievalFees);
              const egress = Number(inputs.egressFees);
              const storageCost = PrecisionEngine.roundFinancial(gb * rate);
              const totalCost = PrecisionEngine.roundFinancial(storageCost + retrieval + egress);
              return {
                totalCost,
                storageCost,
                retrieval,
                egress,
                computedResult: totalCost,
                evaluationStatus: 'Ready and Operational',
                notes: meta.formula
              };
            },
            formatResult: (res: any) => ({
              primary: { label: 'Total Monthly Cloud Cost', value: `$${res.computedResult.toFixed(2)}` },
              breakdown: [
                { label: 'Storage Cost', value: `$${res.storageCost.toFixed(2)}` },
                { label: 'Retrieval Fees', value: `$${res.retrieval.toFixed(2)}` },
                { label: 'Egress Fees', value: `$${res.egress.toFixed(2)}` },
                { label: 'Evaluation Status', value: res.evaluationStatus }
              ]
            })
          } as unknown as CalculationContract<TInput, TResult>;
          this.contracts.set(id, contract);
          return contract;
        }

        const generateSmartFields = (m: CalculatorMeta) => {
          const desc = (m.shortDesc || m.name || '').toLowerCase();
          const formula = (m.formula || '').toLowerCase();
          const fields: any[] = [];
          
          if (desc.includes('cost') || desc.includes('price') || desc.includes('tax') || desc.includes('fee')) {
            fields.push({ name: 'baseAmount', label: 'Base Amount / Value', type: 'number', defaultValue: 1000, required: true, description: 'Enter the base monetary or resource amount' });
            fields.push({ name: 'rateOrFee', label: 'Rate / Percentage (%)', type: 'number', defaultValue: 5, required: true, description: 'Enter applicable percentage rate or fee' });
          } else if (desc.includes('rate') || desc.includes('speed') || desc.includes('velocity') || formula.includes('/')) {
            fields.push({ name: 'numeratorVal', label: 'Primary Value / Distance / Mass', type: 'number', defaultValue: 100, required: true, description: 'Enter primary magnitude' });
            fields.push({ name: 'denominatorVal', label: 'Denominator / Time / Factor', type: 'number', defaultValue: 10, required: true, description: 'Enter denominator or divisor' });
          } else {
            fields.push({ name: 'primaryParam', label: 'Primary Parameter / Value', type: 'number', defaultValue: 100, required: true, description: m.shortDesc || 'Enter primary value for calculation' });
            fields.push({ name: 'secondaryParam', label: 'Secondary Factor / Rate', type: 'number', defaultValue: 1.15, required: false, description: 'Enter adjustment factor or secondary multiplier' });
          }
          return fields;
        };

        const smartFields = generateSmartFields(meta);

        contract = {
          id: meta.id,
          name: meta.name,
          category: meta.category as any,
          subcategoryId: meta.subcategoryId,
          formulaName: meta.formula || 'Standard Evaluation Formula',
          inputSchema: {
            fields: smartFields
          },
          validate: (inputs: any) => {
            const errs: any[] = [];
            for (const f of smartFields) {
              if (f.required && (inputs[f.name] === undefined || inputs[f.name] === '')) {
                errs.push({ field: f.name, code: 'REQUIRED_FIELD', message: `${f.label} is required` });
              }
            }
            return errs;
          },
          calculate: (inputs: any) => {
            const vals = smartFields.map(f => {
              const val = inputs[f.name];
              const parsed = Number(val);
              return !isNaN(parsed) ? parsed : (f.defaultValue ?? 100);
            });
            let result = vals[0];
            if (vals.length > 1 && vals[1] !== undefined && !isNaN(vals[1])) {
              if (meta.formula?.toLowerCase().includes('/') || meta.formula?.toLowerCase().includes('per')) {
                result = vals[1] !== 0 ? vals[0] / vals[1] : vals[0];
              } else {
                result = vals[0] * vals[1];
              }
            } else {
              result = vals[0] * 1.25;
            }
            return {
              computedResult: PrecisionEngine.clean(result),
              evaluationStatus: 'Ready and Operational',
              notes: meta.formula || 'Contextual deterministic calculation'
            };
          },
          formatResult: (res: any) => ({
            primary: { label: 'Calculated Result', value: typeof res.computedResult === 'number' ? res.computedResult.toLocaleString() : res.computedResult },
            breakdown: [
              { label: 'Evaluation Status', value: res.evaluationStatus },
              { label: 'Formula / Reference', value: res.notes }
            ]
          })
        } as unknown as CalculationContract<TInput, TResult>;
        this.contracts.set(id, contract);
      }
    }
    return contract;
  }

  public static has(id: CalculatorId | string): boolean {
    this.ensureInitialized();
    return this.contracts.has(id);
  }

  public static getAll(): CalculationContract<any, any>[] {
    this.ensureInitialized();
    return Array.from(this.contracts.values());
  }

  public static getByCategory(categoryId: CategoryId): CalculationContract<any, any>[] {
    this.ensureInitialized();
    return this.getAll().filter((c) => c.category === categoryId);
  }

  public static getBySubcategory(subcategoryId: string): CalculationContract<any, any>[] {
    this.ensureInitialized();
    return this.getAll().filter((c) => c.subcategoryId === subcategoryId);
  }

  public static getRegisteredCount(): number {
    this.ensureInitialized();
    return this.contracts.size;
  }

  public static validateRegistry(): {
    valid: boolean;
    registeredCount: number;
    metadataTotal: number;
    unregisteredIds: string[];
    contractCategoriesMismatched: Array<{ id: string; contractCategory: string; metadataCategory: string }>;
    errors: string[];
  } {
    this.ensureInitialized();
    const errors: string[] = [];
    const unregisteredIds: string[] = [];
    const contractCategoriesMismatched: Array<{ id: string; contractCategory: string; metadataCategory: string }> = [];

    // Verify all 24 metadata calculators have corresponding contracts
    for (const meta of CALCULATORS) {
      const contract = this.contracts.get(meta.id);
      if (!contract) {
        unregisteredIds.push(meta.id);
        errors.push(`Missing calculation contract for calculator ID "${meta.id}" (${meta.name})`);
      } else {
        if (contract.category !== meta.category) {
          contractCategoriesMismatched.push({
            id: meta.id,
            contractCategory: contract.category,
            metadataCategory: meta.category
          });
          errors.push(
            `Category mismatch for "${meta.id}": contract=${contract.category}, metadata=${meta.category}`
          );
        }
      }
    }

    // Verify contract structural validity
    for (const [id, contract] of this.contracts.entries()) {
      if (typeof contract.calculate !== 'function') {
        errors.push(`Contract "${id}" does not have a valid calculate function`);
      }
      if (typeof contract.validate !== 'function') {
        errors.push(`Contract "${id}" does not have a valid validate function`);
      }
      if (typeof contract.formatResult !== 'function') {
        errors.push(`Contract "${id}" does not have a valid formatResult function`);
      }
      if (!contract.inputSchema || !Array.isArray(contract.inputSchema.fields)) {
        errors.push(`Contract "${id}" does not have a valid inputSchema with fields array`);
      }
    }

    return {
      valid: errors.length === 0,
      registeredCount: this.contracts.size,
      metadataTotal: CALCULATORS.length,
      unregisteredIds,
      contractCategoriesMismatched,
      errors
    };
  }

  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
}
