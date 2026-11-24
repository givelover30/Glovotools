import { useState, useEffect, useId } from 'react';
import {
  Smile,
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
  UiSelect,
  UiEmptyState
} from '../ui/AppPrimitives.tsx';

type MoodOption = '😊 Happy' | '😌 Calm' | '😐 Neutral' | '😰 Stressed' | '🌧️ Sad';

interface MoodLog {
  id: string;
  date: string;
  mood: MoodOption;
  note: string;
}

const INITIAL_MOODS: MoodLog[] = [
  { id: '1', date: '2026-11-10', mood: '😊 Happy', note: 'Completed project milestone successfully.' },
  { id: '2', date: '2026-11-11', mood: '😌 Calm', note: 'Enjoyed a relaxing weekend walk in the park.' },
  { id: '3', date: '2026-11-12', mood: '😊 Happy', note: 'Productive coding session and great coffee.' }
];

const MOOD_OPTIONS: MoodOption[] = ['😊 Happy', '😌 Calm', '😐 Neutral', '😰 Stressed', '🌧️ Sad'];
const STORAGE_KEY = 'calctools_mood_tracker';

export default function MoodWellnessTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [moods, setMoods] = useState<MoodLog[]>(INITIAL_MOODS);
  const [selectedMood, setSelectedMood] = useState<MoodOption>('😊 Happy');
  const [note, setNote] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMood, setEditMood] = useState<MoodOption>('😊 Happy');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMoods(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moods));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addMood = (e: React.FormEvent) => {
    e.preventDefault();
    setMoods((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        note: note.trim() || (isEs ? 'Registro diario' : 'Daily check-in')
      },
      ...prev
    ]);
    setNote('');
  };

  const removeMood = (id: string) => setMoods((prev) => prev.filter((m) => m.id !== id));

  const startEdit = (m: MoodLog) => {
    setEditingId(m.id);
    setEditMood(m.mood);
    setEditNote(m.note);
  };

  const commitEdit = (id: string) => {
    setMoods((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, mood: editMood, note: editNote.trim() || m.note } : m
      )
    );
    setEditingId(null);
  };

  const positiveDays = moods.filter((m) => m.mood === '😊 Happy' || m.mood === '😌 Calm').length;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(moods, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Smile className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Estado de Ánimo y Bienestar' : 'Mood & Mental Wellness Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Registra tu estado emocional diario y notas de reflexión' : 'Record daily emotional check-ins and reflection notes'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setMoods(INITIAL_MOODS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Registros Totales' : 'Total Check-ins'}
          value={String(moods.length)}
          hint={isEs ? 'entradas guardadas' : 'mood logs'}
        />
        <ToolMetricTile
          label={isEs ? 'Estado Más Reciente' : 'Latest Mood'}
          value={moods.length > 0 ? moods[0].mood : '—'}
          hint={moods.length > 0 ? moods[0].date : undefined}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Días Positivos' : 'Positive Days'}
          value={String(positiveDays)}
          hint={isEs ? 'feliz o en calma' : 'happy or calm'}
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <form onSubmit={addMood} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup
              label={isEs ? '¿Cómo te sientes hoy?' : 'How are you feeling today?'}
              htmlFor={`${baseId}-mood`}
            >
              <UiSelect
                id={`${baseId}-mood`}
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as MoodOption)}
              >
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-6">
            <ToolFieldGroup label={isEs ? 'Nota (opcional)' : 'Journal Note (optional)'} htmlFor={`${baseId}-note`}>
              <UiInput
                id={`${baseId}-note`}
                type="text"
                placeholder={isEs ? 'Nota breve del día' : 'Journal note (optional)'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Registrar' : 'Log Mood'}</span>
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Historial de Estado de Ánimo' : 'Mood History Log'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{moods.length}</span>
          </div>

          {moods.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin registros de estado de ánimo' : 'No mood check-ins yet'}
              description={
                isEs
                  ? 'Registra cómo te sientes arriba o restaura los ejemplos iniciales.'
                  : 'Log how you feel above or restore sample entries.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setMoods(INITIAL_MOODS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample entries'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {moods.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === m.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <select
                        aria-label={isEs ? 'Editar estado de ánimo' : 'Edit mood'}
                        value={editMood}
                        onChange={(e) => setEditMood(e.target.value as MoodOption)}
                        className="ui-select w-40 py-1.5 text-xs"
                      >
                        {MOOD_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nota' : 'Edit note'}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(m.id)}
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
                          {m.date}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-text-primary block">{m.mood}</span>
                          <span className="text-xs text-text-secondary block truncate">{m.note}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          aria-label={isEs ? `Editar registro ${m.date}` : `Edit entry ${m.date}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMood(m.id)}
                          aria-label={isEs ? `Eliminar registro ${m.date}` : `Remove entry ${m.date}`}
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
