import { useState, useMemo, useId } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface Subscription {
  id: string;
  name: string;
  cost: number;
  cycle: 'monthly' | 'yearly';
  renewalDate: string;
  category: string;
}

const INITIAL_SUBS: Subscription[] = [
  { id: '1', name: 'Netflix', cost: 15.99, cycle: 'monthly', renewalDate: '2026-12-01', category: 'Entertainment' },
  { id: '2', name: 'Spotify', cost: 10.99, cycle: 'monthly', renewalDate: '2026-11-25', category: 'Entertainment' },
  { id: '3', name: 'GitHub Copilot', cost: 100, cycle: 'yearly', renewalDate: '2027-05-12', category: 'Developer' },
  { id: '4', name: 'AWS Cloud Hosting', cost: 45.0, cycle: 'monthly', renewalDate: '2026-11-30', category: 'Cloud' }
];

export default function SubscriptionTrackerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const [subs, setSubs] = useState<Subscription[]>(INITIAL_SUBS);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('9.99');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Entertainment');
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCost, setEditCost] = useState('0');
  const [editCycle, setEditCycle] = useState<'monthly' | 'yearly'>('monthly');

  const addSub = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del servicio.' : 'Please enter a service name.');
      return;
    }
    const numCost = Math.max(0, Number(cost) || 0);
    setFormError('');
    setSubs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: trimmed,
        cost: numCost,
        cycle,
        renewalDate,
        category: category.trim() || 'General'
      }
    ]);
    setName('');
  };

  const startEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditCost(String(sub.cost));
    setEditCycle(sub.cycle);
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setSubs((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, name: trimmed, cost: Math.max(0, Number(editCost) || 0), cycle: editCycle } : s
      )
    );
    setEditingId(null);
  };

  const summary = useMemo(() => {
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    subs.forEach((s) => {
      if (s.cycle === 'monthly') {
        monthlyTotal += s.cost;
        yearlyTotal += s.cost * 12;
      } else {
        monthlyTotal += s.cost / 12;
        yearlyTotal += s.cost;
      }
    });
    return {
      count: subs.length,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(yearlyTotal * 100) / 100
    };
  }, [subs]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(subs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subscriptions.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Suscripciones' : 'Subscription & Recurring Spend Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Controla cobros mensuales y anuales recurrentes' : 'Monitor recurring monthly and annual subscriptions'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar JSON' : 'Export JSON'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setSubs([])}>
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEs ? 'Limpiar Todo' : 'Clear All'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setSubs(INITIAL_SUBS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Suscripciones Activas' : 'Active Subscriptions'}
          value={String(summary.count)}
          hint={isEs ? 'servicios registrados' : 'tracked services'}
        />
        <ToolMetricTile
          label={isEs ? 'Gasto Mensual Estimado' : 'Estimated Monthly Cost'}
          value={formatCurrency(summary.monthlyTotal)}
          hint={isEs ? 'promedio por mes' : 'normalized monthly'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Gasto Anual Proyectado' : 'Projected Annual Cost'}
          value={formatCurrency(summary.yearlyTotal)}
          hint={isEs ? 'proyección 12 meses' : '12-month total'}
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addSub} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre del Servicio' : 'Service Name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder="e.g. Disney+"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Costo (${currencyMeta.symbol})` : `Cost (${currencyMeta.symbol})`} htmlFor={`${baseId}-cost`}>
              <UiInput
                id={`${baseId}-cost`}
                type="number"
                step="0.01"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Ciclo' : 'Billing Cycle'} htmlFor={`${baseId}-cycle`}>
              <UiSelect
                id={`${baseId}-cycle`}
                value={cycle}
                onChange={(e) => setCycle(e.target.value as 'monthly' | 'yearly')}
              >
                <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                <option value="yearly">{isEs ? 'Anual' : 'Yearly'}</option>
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Renovación' : 'Renewal'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
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

        {subs.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay suscripciones registradas' : 'No subscriptions tracked'}
            description={
              isEs
                ? 'Agrega una suscripción arriba o restaura la lista inicial.'
                : 'Add a subscription above or restore sample subscriptions.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setSubs(INITIAL_SUBS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample data'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {subs.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === sub.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar servicio' : 'Edit service'}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      step="0.01"
                      aria-label={isEs ? 'Editar costo' : 'Edit cost'}
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <select
                      aria-label={isEs ? 'Editar ciclo' : 'Edit cycle'}
                      value={editCycle}
                      onChange={(e) => setEditCycle(e.target.value as 'monthly' | 'yearly')}
                      className="ui-select w-28 py-1.5 text-xs"
                    >
                      <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                      <option value="yearly">{isEs ? 'Anual' : 'Yearly'}</option>
                    </select>
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(sub.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-text-primary block truncate">{sub.name}</span>
                      <div className="text-xs text-text-secondary font-mono">
                        {sub.category} • {isEs ? 'Renueva:' : 'Renews:'} {sub.renewalDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums text-sm font-bold text-accent">
                        {formatCurrency(sub.cost)} / {sub.cycle === 'monthly' ? (isEs ? 'mes' : 'mo') : (isEs ? 'año' : 'yr')}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(sub)}
                        aria-label={isEs ? `Editar ${sub.name}` : `Edit ${sub.name}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubs((prev) => prev.filter((s) => s.id !== sub.id))}
                        aria-label={isEs ? `Eliminar ${sub.name}` : `Remove ${sub.name}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
