# CALCTOOLS — Central Calculation Engine Architecture

## 1. Architectural Overview

The **CALCTOOLS Central Calculation Engine** is a deterministic, modular, client-side mathematical infrastructure designed to power all 24 existing calculators and scale effortlessly to 1,000+ calculators.

### Architectural Principles
- **Strict Determinism**: Zero side effects, zero non-deterministic APIs, zero paid services. Given identical numerical inputs, the engine returns identical outputs down to the exact float representation.
- **Client-Side Autonomy**: All computations, validations, conversions, and formatting execute 100% in-browser with sub-millisecond execution latency.
- **Contract-Based Interfaces**: Every calculator implements a type-safe `CalculationContract<TInput, TResult>` specifying its input schema, validation rules, pure calculation function, and formatted representation.
- **Separation of Concerns**: Mathematical logic is decoupled into 8 focused single-responsibility engine modules.
- **Scope Compliance**: Strictly adheres to the CALCTOOLS scope: 14 approved categories, zero unit converter categories or user-facing conversion tools (the internal `UnitHandler` functions exclusively as dimensional infrastructure).

```
                      ┌──────────────────────────────────────────────┐
                      │              CALCTOOLS UI                    │
                      │  (CalculatorPageLayout / Dynamic Inputs)     │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │          CalculationExecutor                 │
                      │   - Times execution (performance.now)        │
                      │   - Safe try/catch execution wrapper         │
                      └──────┬───────────────┬───────────────────────┘
                             │               │
            ┌────────────────┴┐             ┌┴────────────────────────┐
            ▼                 ▼             ▼                         ▼
   ┌─────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐
   │Calculation-     │ │Validation-   │ │FormulaEngine  │ │ResultFormatter  │
   │Registry         │ │Engine        │ │- Arithmetic   │ │- Currency ($)   │
   │- 24 Contracts   │ │- Required    │ │- Percentages  │ │- Decimals       │
   │- 14 Categories  │ │- Type checks │ │- Algebra      │ │- Percentages    │
   │- 56 Subcats     │ │- Domain/Zero │ │- Geometry     │ │- Scientific     │
   │- Duplicate audit│ │- Date logic  │ │- Trig/Stats/..│ │- Integers       │
   └─────────────────┘ └──────────────┘ └───────┬───────┘ └─────────────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                           ┌─────────────────┐     ┌─────────────────┐
                           │PrecisionEngine  │     │UnitHandler      │
                           │- Float clean()  │     │- Dimensional SI │
                           │- roundFinancial │     │- Safe matching  │
                           │- roundTo()      │     │- Non-converter  │
                           └─────────────────┘     └─────────────────┘
```

---

## 2. Module Responsibilities

The engine is partitioned into 8 cohesive modules located in `/src/engine`:

| Module | Primary Responsibility |
|---|---|
| **`CalculationRegistry`** | Central registry storing and indexing all `CalculationContract` instances. Provides retrieval by ID, category, and subcategory, duplicate ID detection, and runtime schema verification against `CALCULATORS` metadata. |
| **`CalculationExecutor`** | Orchestrates calculation pipelines. Manages schema validation, domain rule execution, benchmark timing (`performance.now()`), safe error capturing, and result formatting. |
| **`FormulaEngine`** | Reusable, pure mathematical function library covering Arithmetic, Percentages, Algebra (linear/quadratic/log/powers), Geometry (2D/3D), Trigonometry, Statistics, Financial formulas, and Engineering mechanics. |
| **`PrecisionEngine`** | Numerical stability and float rounding. Eliminates IEEE 754 precision artifacts via `clean()`, provides financial rounding (`roundFinancial`), significant figures, safe division, and numerical clamping. |
| **`ValidationEngine`** | Multi-layer input validation. Enforces required fields, data types, numerical boundaries, integers, non-zero denominators, mathematical domains (e.g. logarithms, roots), and chronological date sequences. |
| **`UnitHandler`** | Internal dimensional infrastructure for standardizing units into SI base representations. Rejects incompatible physical dimensions (e.g. length vs mass) to safeguard calculation integrity. Strictly internal. |
| **`ResultFormatter`** | Standardized display formatting for numerical outputs, localized currency (`$`), percentage signs (`%`), scientific notation, metric/imperial labels, and readable integer separators. |
| **`ErrorHandler`** | Standardized error factory and execution boundary. Catches exceptions, formats domain failure codes, and produces standardized `CalculationError` structures. |

---

## 3. Standard Calculator Contract

Each calculator is registered via a `CalculationContract<TInput, TResult>`:

```typescript
export interface CalculationContract<TInput = Record<string, unknown>, TResult = Record<string, unknown>> {
  id: CalculatorId;
  name: string;
  category: CategoryId;
  subcategoryId: string;
  inputSchema: InputSchema;
  validate: (inputs: TInput) => CalculationError[];
  calculate: (inputs: TInput) => TResult;
  formatResult: (result: TResult, inputs: TInput) => FormattedResult;
  formulaMeta: {
    formulaName: string;
    formulaExpression: string;
    variables: Array<{ symbol: string; name: string; unit?: string }>;
  };
}
```

### Standard Input Field Schema
```typescript
export interface InputFieldSchema {
  name: string;
  label: string;
  type: 'number' | 'integer' | 'decimal' | 'percentage' | 'currency' | 'date' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
  description?: string;
}
```

---

## 4. Validation Standards

Validation occurs in two deterministic tiers:
1. **Schema-Level Validation (`ValidationEngine.validateSchema`)**:
   - Required input presence (`REQUIRED_FIELD_MISSING`)
   - Numerical format validity (`INVALID_NUMERIC_VALUE`)
   - Integer constraints (`INTEGER_REQUIRED`)
   - Range bounds (`RANGE_OUT_OF_BOUNDS`, `min`, `max`)
   - Valid calendar dates (`INVALID_DATE`)
2. **Domain-Level Validation (`contract.validate`)**:
   - Zero-denominator prevention (`DIVISION_BY_ZERO`)
   - Negative value prohibitions on physical measurements (`NON_NEGATIVE_REQUIRED`, `POSITIVE_NUMBER_REQUIRED`)
   - Mathematical domain constraints (e.g., non-negative discriminant in real quadratic roots, positive logarithm arguments)
   - Chronological ordering (`DATE_ORDER_INVALID`)

All errors conform to the standardized error schema:
```typescript
export interface CalculationError {
  field?: string;
  code: ErrorCode;
  message: string;
  invalidValue?: unknown;
}
```

---

## 5. Precision & Rounding Policies

Floating-point operations in JavaScript naturally suffer from IEEE 754 precision drift (e.g., `0.1 + 0.2 = 0.30000000000000004`). The engine enforces the following policies:

1. **Internal Clean Buffer**:
   All formulas wrap intermediate and final floating computations in `PrecisionEngine.clean(value, precision = 12)`:
   ```typescript
   public static clean(value: number, precision = 12): number {
     if (!this.isValidNumber(value)) return value;
     return parseFloat(value.toPrecision(precision));
   }
   ```
2. **Financial Precision**:
   Financial and monetary values are strictly rounded to 2 decimal places using `roundFinancial()` to avoid fractional penny inaccuracies:
   ```typescript
   PrecisionEngine.roundFinancial(payment); // 2022.62
   ```
3. **Display Rounding**:
   User-facing formatting is handled solely by `ResultFormatter`, leaving raw numeric outputs intact in `ExecutionResult.data` for downstream operations or charting.

---

## 6. Error Handling Strategy

1. **No Throw Policy in Production**:
   Runtime calculations are executed within `CalculationExecutor.executeContract()` inside a guarded try/catch block. Exceptions never bubble up to crash React components.
2. **Standardized Failure Object**:
   Calculations with validation or execution failures return an `ExecutionResult` with `success: false` and structured `errors` array:
   ```typescript
   {
     success: false,
     calculatorId: 'percentage',
     errors: [
       { field: 'percentX', code: 'RANGE_OUT_OF_BOUNDS', message: 'Field "percentX" must be at least 0.' }
     ],
     executionTimeMs: 0.12,
     timestamp: '2026-11-09T20:15:00.000Z'
   }
   ```
3. **Zero Division Safeguard**:
   All formulas dividing by a variable check `Math.abs(denominator) < 1e-12` and return either structured errors or fallbacks (`safeDivide`).

---

## 7. Guide: How to Add a New Calculator

To add a new calculator (e.g., `compound-annual-growth-rate`):

### Step 1: Define Metadata
In `/src/data/calculators.ts`, add the calculator metadata entry to `CALCULATORS`:
```typescript
{
  id: 'cagr',
  name: 'Compound Annual Growth Rate (CAGR) Calculator',
  shortDesc: 'Calculate annualized investment growth rate',
  category: 'financial',
  subcategoryId: 'investment-returns',
  tags: ['finance', 'cagr', 'investment', 'growth'],
  formula: 'CAGR = (EV / BV)^(1/n) - 1',
  isPopular: false,
  iconName: 'TrendingUp',
  iconColor: '#7C3AED',
  iconBg: '#F3E8FF'
}
```

### Step 2: Implement CalculationContract
In `/src/engine/contracts/calculatorContracts.ts`, append the contract to `ALL_CALCULATOR_CONTRACTS`:
```typescript
{
  id: 'cagr',
  name: 'CAGR Calculator',
  category: 'financial',
  subcategoryId: 'investment-returns',
  formulaMeta: {
    formulaName: 'Compound Annual Growth Rate',
    formulaExpression: 'CAGR = (EV / BV)^(1/n) - 1',
    variables: [
      { symbol: 'BV', name: 'Beginning Value', unit: '$' },
      { symbol: 'EV', name: 'Ending Value', unit: '$' },
      { symbol: 'n', name: 'Number of Years', unit: 'years' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'beginningValue', label: 'Initial Value', type: 'currency', required: true, defaultValue: 10000, min: 1 },
      { name: 'endingValue', label: 'Final Value', type: 'currency', required: true, defaultValue: 25000, min: 1 },
      { name: 'years', label: 'Number of Years', type: 'number', required: true, defaultValue: 5, min: 0.1 }
    ]
  },
  validate: (inputs: { beginningValue: number; endingValue: number; years: number }) => {
    const errors: CalculationError[] = [];
    if (inputs.beginningValue <= 0) errors.push({ field: 'beginningValue', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Initial value must be > 0.' });
    if (inputs.years <= 0) errors.push({ field: 'years', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Years must be > 0.' });
    return errors;
  },
  calculate: (inputs: { beginningValue: number; endingValue: number; years: number }) => {
    const ratio = inputs.endingValue / inputs.beginningValue;
    const cagr = PrecisionEngine.clean((Math.pow(ratio, 1 / inputs.years) - 1) * 100);
    const totalGrowth = PrecisionEngine.clean(((inputs.endingValue - inputs.beginningValue) / inputs.beginningValue) * 100);
    return { cagr, totalGrowth };
  },
  formatResult: (result: { cagr: number; totalGrowth: number }) => ({
    primary: {
      label: 'Compound Annual Growth Rate (CAGR)',
      value: ResultFormatter.formatPercentage(result.cagr),
      numericValue: result.cagr
    },
    secondary: [
      { label: 'Total Growth', value: ResultFormatter.formatPercentage(result.totalGrowth) }
    ]
  })
}
```

### Step 3: Verify Registration and Test
Add a test fixture in `/src/engine/test-suite.ts`:
```typescript
const r = CalculationExecutor.execute('cagr', { beginningValue: 10000, endingValue: 20000, years: 5 });
this.assert('CAGR Test', 'CAGR 10k to 20k in 5yrs ~ 14.87%', r.success && Math.abs((r.data as any).cagr - 14.87) < 0.05);
```
Run `npx tsx src/engine/test-suite.ts` to ensure 100% test pass.

---

## 8. Guide: How to Add a New Mathematical Function

To add a new mathematical capability to `FormulaEngine`:

1. Locate the appropriate category section in `/src/engine/FormulaEngine.ts` (e.g. `Arithmetic`, `Percentages`, `Algebra`, `Geometry`, `Trigonometry`, `Statistics`, `Financial`, `Engineering`).
2. Implement as a pure static method:
   - Validate numerical preconditions (e.g., `Math.abs(denominator) < 1e-12`, non-negative roots).
   - Compute the result using standard ECMAScript Math operations.
   - Clean floating-point artifacts using `PrecisionEngine.clean()`.
3. Add unit test coverage in `/src/engine/test-suite.ts`.
4. Export and utilize within relevant calculation contracts.
