import { useState, useMemo, useId } from 'react';
import { Heart, Plus, Trash2, AlertTriangle, Users } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerProgressBar,
  PlannerDisclaimer
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  DEFAULT_WEDDING_CATEGORIES,
  WeddingBudgetCategoryInput,
  WeddingBudgetInput,
  WeddingPaymentStatus,
  calculateWeddingBudget,
  validateWeddingBudgetInput
} from '../../engine/contracts/planners/weddingBudget.ts';

const DEFAULT_WEDDING_STATE: WeddingBudgetInput = {
  totalBudget: 30000,
  guestCount: 100,
  categories: DEFAULT_WEDDING_CATEGORIES
};

const EMPTY_WEDDING_STATE: WeddingBudgetInput = {
  totalBudget: 25000,
  guestCount: 80,
  categories: []
};

function sanitizeWeddingState(raw: unknown): WeddingBudgetInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<WeddingBudgetInput>;
  if (
    typeof obj.totalBudget !== 'number' ||
    typeof obj.guestCount !== 'number' ||
    !Array.isArray(obj.categories)
  ) {
    return null;
  }
  const categories: WeddingBudgetCategoryInput[] = [];
  for (const c of obj.categories) {
    if (!c || typeof c !== 'object') return null;
    const item = c as Partial<WeddingBudgetCategoryInput>;
    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.targetPct !== 'number' ||
      typeof item.estimatedCost !== 'number' ||
      typeof item.actualCost !== 'number'
    ) {
      return null;
    }
    const status: WeddingPaymentStatus =
      item.paymentStatus === 'Paid in Full' || item.paymentStatus === 'Deposit Paid'
        ? item.paymentStatus
        : 'Unpaid';
    categories.push({
      id: item.id,
      name: item.name,
      targetPct: Math.max(0, Math.min(100, item.targetPct)),
      estimatedCost: Math.max(0, item.estimatedCost),
      actualCost: Math.max(0, item.actualCost),
      vendorName: typeof item.vendorName === 'string' ? item.vendorName : '',
      paymentStatus: status,
      notes: typeof item.notes === 'string' ? item.notes : ''
    });
  }
  return {
    totalBudget: Math.max(0, obj.totalBudget),
    guestCount: Math.max(1, Math.round(obj.guestCount)),
    categories
  };
}

export default function WeddingBudgetPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtMoney = (val: number) =>
    formatCurrency(val, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<WeddingBudgetInput>({
    storageKey: 'calctools_wedding_budget_planner_v1',
    version: 1,
    defaultValue: DEFAULT_WEDDING_STATE,
    sanitize: sanitizeWeddingState
  });

  const [newCatName, setNewCatName] = useState('');
  const [newTargetPct, setNewTargetPct] = useState(5);
  const [newEstimated, setNewEstimated] = useState(1500);
  const [formError, setFormError] = useState('');

  const validationErrors = useMemo(() => validateWeddingBudgetInput(state), [state]);

  const result = useMemo(() => {
    if (validationErrors.length > 0) return null;
    try {
      return calculateWeddingBudget(state);
    } catch {
      return null;
    }
  }, [state, validationErrors]);

  const applyTargetPercentagesToEstimates = () => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => ({
        ...c,
        estimatedCost: Math.round(prev.totalBudget * (c.targetPct / 100))
      }))
    }));
  };

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la categoría.' : 'Please enter a category name.');
      return;
    }
    if (newTargetPct < 0 || newTargetPct > 100 || newEstimated < 0) {
      setFormError(
        isEs
          ? 'El porcentaje debe estar entre 0% y 100% y el estimado no puede ser negativo.'
          : 'Allocation % must be 0–100% and estimated cost cannot be negative.'
      );
      return;
    }
    setFormError('');
    setState((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: `wed-${Date.now()}`,
          name: trimmed,
          targetPct: Number(newTargetPct) || 0,
          estimatedCost: Number(newEstimated) || 0,
          actualCost: 0,
          vendorName: '',
          paymentStatus: 'Unpaid',
          notes: ''
        }
      ]
    }));
    setNewCatName('');
  };

  const updateCategory = (id: string, patch: Partial<WeddingBudgetCategoryInput>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...patch } : c))
    }));
  };

  const deleteCategory = (id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id)
    }));
  };

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'wedding_budget_plan.csv',
      [
        'Category',
        'Target (%)',
        'Target Amount',
        'Estimated Cost',
        'Actual Spend',
        'Variance (Target - Actual)',
        'Vendor',
        'Payment Status',
        'Notes'
      ],
      result.categories.map((c) => [
        c.name,
        c.targetPct,
        c.targetAmount,
        c.estimatedCost,
        c.actualCost,
        c.varianceTargetVsActual,
        c.vendorName ?? '',
        c.paymentStatus,
        c.notes ?? ''
      ])
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('wedding_budget_plan.json', { inputs: state, summary: result });
  };

  const copySummary = result
    ? `Wedding Budget: ${fmtMoney(result.totalBudget)} (${result.guestCount} guests, ${fmtMoney(result.costPerGuestBudget)}/guest) | Estimated: ${fmtMoney(result.totalEstimated)} | Actual Paid/Committed: ${fmtMoney(result.totalActual)} | Remaining: ${fmtMoney(result.remainingVsBudgetActual)}`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<Heart className="w-4 h-4" />}
        title={isEs ? 'Planificador de Presupuesto de Boda' : 'Wedding Budget & Expense Allocation Planner'}
        subtitle={
          isEs
            ? 'Asigna porcentajes por partida, compara estimado vs. gasto real, costo por invitado y estado de proveedores'
            : 'Allocate category targets, compare estimated vs. actual spend, cost per guest & vendor status'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={result && result.categories.length > 0 ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_WEDDING_STATE)}
        canClear={state.categories.length > 0}
      />

      {/* Budget & Guest Controls */}
      <section className="ui-panel p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        <div className="sm:col-span-4">
          <ToolFieldGroup
            label={isEs ? `Presupuesto Total (${currencyMeta.symbol})` : `Total Wedding Budget (${currencyMeta.symbol})`}
            htmlFor={`${baseId}-budget`}
          >
            <UiInput
              id={`${baseId}-budget`}
              type="number"
              min={0}
              step={500}
              value={state.totalBudget}
              onChange={(e) =>
                setState((prev) => ({ ...prev, totalBudget: Math.max(0, Number(e.target.value) || 0) }))
              }
              className="font-mono font-bold"
            />
          </ToolFieldGroup>
        </div>
        <div className="sm:col-span-4">
          <ToolFieldGroup
            label={isEs ? 'Número de Invitados' : 'Estimated Guest Count'}
            htmlFor={`${baseId}-guests`}
          >
            <UiInput
              id={`${baseId}-guests`}
              type="number"
              min={1}
              step={1}
              value={state.guestCount}
              onChange={(e) =>
                setState((prev) => ({ ...prev, guestCount: Math.max(1, Math.round(Number(e.target.value) || 1)) }))
              }
              className="font-mono"
            />
          </ToolFieldGroup>
        </div>
        <div className="sm:col-span-4 no-print">
          <UiButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={applyTargetPercentagesToEstimates}
            disabled={state.categories.length === 0}
          >
            <span>
              {isEs ? 'Recalcular Estimados según %' : 'Sync Estimates to Target %'}
            </span>
          </UiButton>
        </div>
      </section>

      {validationErrors.length > 0 && <UiErrorState message={validationErrors[0].message} />}

      {/* Allocation % Warning */}
      {result && Math.abs(result.allocationGapPct) > 0.01 && state.categories.length > 0 && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-amber-50/75 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isEs
              ? `Las asignaciones actuales suman ${result.totalAllocatedPct}% (${result.allocationGapPct > 0 ? `falta ${result.allocationGapPct}% por asignar` : `excede en ${Math.abs(result.allocationGapPct)}%`}).`
              : `Category target percentages currently sum to ${result.totalAllocatedPct}% (${result.allocationGapPct > 0 ? `${result.allocationGapPct}% unallocated` : `${Math.abs(result.allocationGapPct)}% over 100%`}).`}
          </span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Saldo Disponible Real' : 'Remaining vs. Actual'}
          value={result ? fmtMoney(result.remainingVsBudgetActual) : '—'}
          hint={
            result?.isOverTotalBudget
              ? isEs
                ? 'Presupuesto excedido'
                : 'Over total budget'
              : isEs
              ? 'dentro del presupuesto'
              : 'under budget limit'
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Total Estimado' : 'Total Estimated'}
          value={result ? fmtMoney(result.totalEstimated) : '—'}
          hint={result ? `${result.totalAllocatedPct}% ${isEs ? 'asignado' : 'allocated'}` : ''}
        />
        <ToolMetricTile
          label={isEs ? 'Gasto Real / Comprometido' : 'Total Actual Spend'}
          value={result ? fmtMoney(result.totalActual) : '—'}
          hint={
            result
              ? `${result.paidFullCount} ${isEs ? 'pagados' : 'paid'} · ${result.depositCount} ${isEs ? 'señados' : 'deposits'}`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Costo por Invitado' : 'Cost per Guest'}
          value={result ? fmtMoney(result.costPerGuestBudget) : '—'}
          hint={
            result
              ? `${isEs ? 'Real:' : 'Actual:'} ${fmtMoney(result.costPerGuestActual)} · ${state.guestCount} ${isEs ? 'inv.' : 'guests'}`
              : ''
          }
        />
      </div>

      {/* Utilization Bar */}
      {result && state.totalBudget > 0 && (
        <section className="ui-panel p-4 sm:p-5 space-y-2.5">
          <PlannerProgressBar
            label={isEs ? 'Ejecución del Presupuesto (Gasto Real / Total)' : 'Budget Utilization (Actual Spend / Total Budget)'}
            percent={(result.totalActual / state.totalBudget) * 100}
            valueLabel={`${fmtMoney(result.totalActual)} / ${fmtMoney(state.totalBudget)} (${Math.round((result.totalActual / state.totalBudget) * 100)}%)`}
            tone={result.isOverTotalBudget ? 'error' : 'accent'}
          />
        </section>
      )}

      {/* Add Category Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4 no-print">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Añadir Partida o Categoría' : 'Add Budget Category'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addCategory} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category Name'} htmlFor={`${baseId}-cat-name`}>
              <UiInput
                id={`${baseId}-cat-name`}
                type="text"
                placeholder={isEs ? 'Ej. Iluminación y Mobiliario' : 'e.g. Lighting & Lounge Rentals'}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Meta (%)' : 'Target (%)'} htmlFor={`${baseId}-cat-pct`}>
              <UiInput
                id={`${baseId}-cat-pct`}
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={newTargetPct}
                onChange={(e) => setNewTargetPct(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? `Estimado (${currencyMeta.symbol})` : `Estimated (${currencyMeta.symbol})`} htmlFor={`${baseId}-cat-est`}>
              <UiInput
                id={`${baseId}-cat-est`}
                type="number"
                min={0}
                value={newEstimated}
                onChange={(e) => setNewEstimated(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Añadir' : 'Add'}</span>
            </UiButton>
          </div>
        </form>
      </section>

      {/* Categories List */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Partidas, Proveedores y Seguimiento Real' : 'Categories, Vendors & Spend Tracking'}
          </h3>
          <span className="text-xs text-text-secondary flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent" />
            {state.guestCount} {isEs ? 'invitados' : 'guests'}
          </span>
        </div>

        {state.categories.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay categorías definidas' : 'No wedding budget categories'}
            description={
              isEs
                ? 'Agrega una categoría arriba o restaura la estructura estándar.'
                : 'Add a category above or restore the standard industry wedding allocation.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={resetToDefault}>
                {isEs ? 'Restaurar plantilla' : 'Restore preset categories'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {(result?.categories ?? []).map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm text-text-primary">{cat.name}</span>
                    <UiStatusLabel tone="neutral">
                      {isEs ? 'Meta:' : 'Target:'} {fmtMoney(cat.targetAmount)} ({cat.targetPct}%)
                    </UiStatusLabel>
                    {cat.isOverTarget && (
                      <UiStatusLabel tone="error">
                        {isEs ? 'Excede meta' : 'Over target'}
                      </UiStatusLabel>
                    )}
                  </div>
                  <div className="no-print flex items-center gap-2">
                    <select
                      aria-label={isEs ? `Estado de pago de ${cat.name}` : `Payment status for ${cat.name}`}
                      value={cat.paymentStatus}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          paymentStatus: e.target.value as WeddingPaymentStatus
                        })
                      }
                      className="ui-input py-1 px-2 text-xs cursor-pointer"
                    >
                      <option value="Unpaid">{isEs ? 'Sin pagar' : 'Unpaid'}</option>
                      <option value="Deposit Paid">{isEs ? 'Seña / Depósito' : 'Deposit Paid'}</option>
                      <option value="Paid in Full">{isEs ? 'Pagado 100%' : 'Paid in Full'}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      aria-label={isEs ? `Eliminar ${cat.name}` : `Delete ${cat.name}`}
                      className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-text-secondary block mb-1">
                      {isEs ? 'Meta %' : 'Target %'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={cat.targetPct}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          targetPct: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        })
                      }
                      className="ui-input py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-text-secondary block mb-1">
                      {isEs ? `Estimado (${currencyMeta.symbol})` : `Estimated (${currencyMeta.symbol})`}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cat.estimatedCost}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          estimatedCost: Math.max(0, Number(e.target.value) || 0)
                        })
                      }
                      className="ui-input py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-text-secondary block mb-1">
                      {isEs ? `Real (${currencyMeta.symbol})` : `Actual (${currencyMeta.symbol})`}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cat.actualCost}
                      onChange={(e) =>
                        updateCategory(cat.id, {
                          actualCost: Math.max(0, Number(e.target.value) || 0)
                        })
                      }
                      className="ui-input py-1.5 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-medium text-text-secondary block mb-1">
                      {isEs ? 'Proveedor' : 'Vendor Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEs ? 'Nombre proveedor...' : 'Vendor / contact...'}
                      value={cat.vendorName ?? ''}
                      onChange={(e) => updateCategory(cat.id, { vendorName: e.target.value })}
                      className="ui-input py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-medium text-text-secondary block mb-1">
                      {isEs ? 'Notas' : 'Notes'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEs ? 'Fecha saldo / detalle...' : 'Balance due / notes...'}
                      value={cat.notes ?? ''}
                      onChange={(e) => updateCategory(cat.id, { notes: e.target.value })}
                      className="ui-input py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PlannerDisclaimer
        tone="info"
        title={isEs ? 'Guía Orientativa' : 'Planning Guideline'}
        message={
          isEs
            ? 'Los porcentajes iniciales reflejan distribuciones de referencia habituales y son 100% editables según prioridades locales.'
            : 'Starter percentages reflect common event allocation benchmarks and can be adjusted freely to fit your priorities and guest count.'
        }
      />
    </div>
  );
}
