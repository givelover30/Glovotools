import { useState, useEffect, useId } from 'react';
import {
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  Printer,
  Download,
  Save,
  Trash2,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface WaterLog {
  id: string;
  date: string;
  amountMl: number;
}

const INITIAL_HISTORY: WaterLog[] = [
  { id: '1', date: '2026-11-10', amountMl: 2500 },
  { id: '2', date: '2026-11-11', amountMl: 2250 },
  { id: '3', date: '2026-11-12', amountMl: 1750 }
];

const STORAGE_KEY = 'calctools_water_tracker';

export default function WaterIntakeTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [dailyGoalMl, setDailyGoalMl] = useState<number>(2500);
  const [currentMl, setCurrentMl] = useState<number>(1750);
  const [history, setHistory] = useState<WaterLog[]>(INITIAL_HISTORY);
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editAmount, setEditAmount] = useState('2000');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.dailyGoalMl === 'number') setDailyGoalMl(parsed.dailyGoalMl);
        if (typeof parsed.currentMl === 'number') setCurrentMl(parsed.currentMl);
        if (Array.isArray(parsed.history)) setHistory(parsed.history);
      } catch {
        // ignore invalid storage payload
      }
    }
  }, []);

  const persistState = (nextGoal: number, nextCurrent: number, nextHistory: WaterLog[]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dailyGoalMl: nextGoal, currentMl: nextCurrent, history: nextHistory })
    );
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSave = () => {
    persistState(dailyGoalMl, currentMl, history);
  };

  const addWater = (amount: number) => {
    setCurrentMl((prev) => Math.max(0, prev + amount));
  };

  const logToday = () => {
    if (dailyGoalMl <= 0) {
      setFormError(isEs ? 'La meta diaria debe ser mayor a 0 ml.' : 'Daily goal must be greater than 0 ml.');
      return;
    }
    setFormError('');
    const todayStr = new Date().toISOString().split('T')[0];
    const existingIdx = history.findIndex((h) => h.date === todayStr);
    let nextHistory: WaterLog[];
    if (existingIdx >= 0) {
      nextHistory = history.map((item, idx) =>
        idx === existingIdx ? { ...item, amountMl: currentMl } : item
      );
    } else {
      nextHistory = [{ id: Date.now().toString(), date: todayStr, amountMl: currentMl }, ...history];
    }
    setHistory(nextHistory);
    persistState(dailyGoalMl, currentMl, nextHistory);
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const startEdit = (item: WaterLog) => {
    setEditingId(item.id);
    setEditDate(item.date);
    setEditAmount(String(item.amountMl));
  };

  const commitEdit = (id: string) => {
    const parsedAmt = Math.max(0, Number(editAmount) || 0);
    if (!editDate) return;
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, date: editDate, amountMl: parsedAmt } : item))
    );
    setEditingId(null);
  };

  const handleResetSample = () => {
    setDailyGoalMl(2500);
    setCurrentMl(1750);
    setHistory(INITIAL_HISTORY);
    setFormError('');
  };

  const percent = dailyGoalMl > 0 ? Math.min(100, Math.round((currentMl / dailyGoalMl) * 100)) : 0;
  const remainingMl = Math.max(0, dailyGoalMl - currentMl);

  const handleDownload = () => {
    const data = { dailyGoalMl, currentMl, history };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Hidratación y Agua' : 'Daily Water Intake & Hydration Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Registra tu consumo diario de líquidos en ml' : 'Track daily fluid intake toward your hydration target'}
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
          <UiButton variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />
            <span>{isEs ? 'Imprimir' : 'Print'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={handleResetSample}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Consumo de Hoy' : "Today's Intake"}
          value={`${currentMl} ml`}
          hint={`${percent}% ${isEs ? 'de la meta' : 'of daily goal'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Meta Diaria' : 'Daily Target'}
          value={`${dailyGoalMl} ml`}
          hint={isEs ? 'objetivo configurado' : 'configured goal'}
        />
        <ToolMetricTile
          label={isEs ? 'Restante' : 'Remaining'}
          value={`${remainingMl} ml`}
          hint={remainingMl === 0 ? (isEs ? '¡Meta alcanzada!' : 'Goal reached!') : (isEs ? 'por beber' : 'to target')}
        />
      </div>

      {/* Main Hydration Progress Panel */}
      <section className="ui-panel p-6 space-y-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <UiStatusLabel tone={percent >= 100 ? 'success' : 'accent'}>
            {isEs ? 'Progreso Diario de Agua' : 'Today Water Progress'}
          </UiStatusLabel>
        </div>

        <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-text-primary">
          {currentMl} <span className="text-base font-medium text-text-secondary">/ {dailyGoalMl} ml</span>
        </div>

        <div className="w-full max-w-md mx-auto h-3 rounded-full bg-surface-secondary border border-border-subtle overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-xs font-medium text-text-secondary">
          {isEs
            ? `${percent}% de la meta diaria de hidratación alcanzada`
            : `${percent}% of daily hydration goal achieved`}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <UiButton variant="primary" size="sm" onClick={() => addWater(250)}>
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? '+250 ml (Vaso)' : '+ 250 ml (Glass)'}</span>
          </UiButton>
          <UiButton variant="primary" size="sm" onClick={() => addWater(500)}>
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? '+500 ml (Botella)' : '+ 500 ml (Bottle)'}</span>
          </UiButton>
          <UiButton
            variant="secondary"
            size="sm"
            onClick={() => addWater(-250)}
            aria-label={isEs ? 'Restar 250 ml' : 'Subtract 250 ml'}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>250 ml</span>
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMl(0)}
            aria-label={isEs ? 'Reiniciar hoy a 0' : 'Reset today to 0'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Reiniciar hoy' : 'Reset today'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={logToday}>
            <Check className="w-3.5 h-3.5" />
            <span>{isEs ? 'Registrar Hoy' : 'Log Today'}</span>
          </UiButton>
        </div>
      </section>

      {/* Goal Config */}
      <section className="ui-panel p-5 sm:p-6 space-y-3">
        {formError && <UiErrorState message={formError} />}
        <ToolFieldGroup
          label={isEs ? 'Meta Diaria (ml)' : 'Daily Goal (ml)'}
          htmlFor={`${baseId}-goal`}
          unit="ml"
        >
          <UiInput
            id={`${baseId}-goal`}
            type="number"
            min={100}
            step={100}
            value={dailyGoalMl}
            onChange={(e) => {
              const val = Math.max(0, Number(e.target.value) || 0);
              setDailyGoalMl(val);
              if (val > 0) setFormError('');
            }}
            className="font-mono tabular-nums"
          />
        </ToolFieldGroup>
      </section>

      {/* History Log */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Historial de Hidratación' : 'Hydration History Log'}
          </h3>
          <span className="text-xs font-mono text-text-tertiary">{history.length}</span>
        </div>

        {history.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin registros de hidratación' : 'No hydration logs yet'}
            description={
              isEs
                ? 'Haz clic en "Registrar Hoy" arriba o restaura los registros de ejemplo.'
                : 'Click "Log Today" above or restore sample logs.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setHistory(INITIAL_HISTORY)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample logs'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/60"
              >
                {editingId === h.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="date"
                      aria-label={isEs ? 'Editar fecha' : 'Edit date'}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="ui-input w-40 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      aria-label={isEs ? 'Editar cantidad (ml)' : 'Edit amount (ml)'}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="ui-input w-28 py-1.5 text-xs font-mono"
                    />
                    <UiButton
                      variant="primary"
                      size="sm"
                      aria-label={isEs ? 'Confirmar' : 'Confirm'}
                      onClick={() => commitEdit(h.id)}
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
                    <span className="font-mono tabular-nums text-xs font-semibold text-text-secondary">
                      {h.date}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-xs font-bold text-accent">
                        {h.amountMl} ml
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(h)}
                        aria-label={isEs ? `Editar registro ${h.date}` : `Edit entry ${h.date}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHistoryItem(h.id)}
                        aria-label={isEs ? `Eliminar registro ${h.date}` : `Delete entry ${h.date}`}
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
