import { useState, useEffect, useId } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Download,
  Save,
  RotateCcw,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct: number;
}

const INITIAL_WEIGHTS: WeightLog[] = [
  { id: '1', date: '2026-10-15', weightKg: 78.5, bodyFatPct: 18.2 },
  { id: '2', date: '2026-10-30', weightKg: 77.8, bodyFatPct: 17.8 },
  { id: '3', date: '2026-11-12', weightKg: 77.2, bodyFatPct: 17.4 }
];

const STORAGE_KEY = 'calctools_weight_tracker';

export default function WeightBodyMetricsTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [weights, setWeights] = useState<WeightLog[]>(INITIAL_WEIGHTS);
  const [weightInput, setWeightInput] = useState('77.0');
  const [fatInput, setFatInput] = useState('17.0');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('77.0');
  const [editFat, setEditFat] = useState('17.0');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setWeights(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(weightInput);
    const f = Number(fatInput);
    if (!weightInput || isNaN(w) || w <= 0) {
      setFormError(isEs ? 'Ingresa un peso válido mayor a 0 kg.' : 'Please enter a valid weight greater than 0 kg.');
      return;
    }
    setFormError('');
    setWeights((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        weightKg: w,
        bodyFatPct: isNaN(f) ? 0 : Math.max(0, f)
      },
      ...prev
    ]);
  };

  const removeWeight = (id: string) => setWeights((prev) => prev.filter((w) => w.id !== id));

  const startEdit = (item: WeightLog) => {
    setEditingId(item.id);
    setEditWeight(String(item.weightKg));
    setEditFat(String(item.bodyFatPct));
  };

  const commitEdit = (id: string) => {
    const w = Number(editWeight);
    if (isNaN(w) || w <= 0) return;
    const f = Math.max(0, Number(editFat) || 0);
    setWeights((prev) =>
      prev.map((item) => (item.id === id ? { ...item, weightKg: w, bodyFatPct: f } : item))
    );
    setEditingId(null);
  };

  const startingWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : 0;
  const currentWeight = weights.length > 0 ? weights[0].weightKg : 0;
  const delta = (currentWeight - startingWeight).toFixed(1);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(weights, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weight-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Peso y Métricas Corporales' : 'Weight & Body Metrics Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Registra peso corporal, grasa % y variación neta' : 'Track body weight, body fat percentage, and net change'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar' : 'Save')}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setWeights(INITIAL_WEIGHTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Peso Actual' : 'Current Weight'}
          value={`${currentWeight} kg`}
          hint={isEs ? 'registro más reciente' : 'latest check-in'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Peso Inicial' : 'Starting Weight'}
          value={`${startingWeight} kg`}
          hint={isEs ? 'primer registro' : 'baseline entry'}
        />
        <ToolMetricTile
          label={isEs ? 'Cambio Total' : 'Total Progress Delta'}
          value={`${Number(delta) > 0 ? `+${delta}` : delta} kg`}
          hint={isEs ? 'respecto al inicio' : 'since baseline'}
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addWeight} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pb-5 border-b border-border-subtle">
          <div>
            <ToolFieldGroup label={isEs ? 'Peso (kg)' : 'Weight (kg)'} htmlFor={`${baseId}-weight`} unit="kg">
              <UiInput
                id={`${baseId}-weight`}
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div>
            <ToolFieldGroup
              label={isEs ? 'Grasa Corporal % (opcional)' : 'Body Fat % (optional)'}
              htmlFor={`${baseId}-fat`}
              unit="%"
            >
              <UiInput
                id={`${baseId}-fat`}
                type="number"
                step="0.1"
                value={fatInput}
                onChange={(e) => setFatInput(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div>
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Registrar' : 'Log Weight'}</span>
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Historial de Peso' : 'Weight History Log'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{weights.length}</span>
          </div>

          {weights.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin mediciones registradas' : 'No weight entries logged yet'}
              description={
                isEs
                  ? 'Registra tu peso arriba o restaura las mediciones de ejemplo.'
                  : 'Log your weight above or restore sample measurements.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setWeights(INITIAL_WEIGHTS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample entries'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {weights.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === w.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="number"
                        step="0.1"
                        aria-label={isEs ? 'Editar peso' : 'Edit weight'}
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="ui-input w-28 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        step="0.1"
                        aria-label={isEs ? 'Editar grasa corporal' : 'Edit body fat'}
                        value={editFat}
                        onChange={(e) => setEditFat(e.target.value)}
                        className="ui-input w-28 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(w.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar' : 'Cancel'}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono tabular-nums text-xs text-text-secondary shrink-0">
                          {w.date}
                        </span>
                        <div>
                          <span className="text-xs font-bold font-mono tabular-nums text-text-primary block">
                            {w.weightKg} kg
                          </span>
                          <span className="text-[11px] text-text-secondary font-mono tabular-nums">
                            {isEs ? 'Grasa corporal:' : 'Body Fat:'} {w.bodyFatPct}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(w)}
                          aria-label={isEs ? `Editar registro ${w.date}` : `Edit entry ${w.date}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWeight(w.id)}
                          aria-label={isEs ? `Eliminar registro ${w.date}` : `Remove entry ${w.date}`}
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
        </div>
      </section>
    </div>
  );
}
