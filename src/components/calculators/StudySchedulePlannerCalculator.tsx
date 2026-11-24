import { useState, useEffect, useId } from 'react';
import {
  GraduationCap,
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
  UiCheckbox,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface StudySubject {
  id: string;
  subject: string;
  examDate: string;
  hoursPerWeek: number;
  completed: boolean;
}

const STORAGE_KEY = 'calctools_study_schedule';

const INITIAL_SUBJECTS: StudySubject[] = [
  { id: '1', subject: 'Advanced Calculus & Differential Equations', examDate: '2026-12-10', hoursPerWeek: 6, completed: false },
  { id: '2', subject: 'Data Structures & Algorithms', examDate: '2026-12-14', hoursPerWeek: 8, completed: true },
  { id: '3', subject: 'Organic Chemistry II', examDate: '2026-12-18', hoursPerWeek: 5, completed: false },
  { id: '4', subject: 'Macroeconomics & Fiscal Policy', examDate: '2026-12-08', hoursPerWeek: 4, completed: false }
];

export default function StudySchedulePlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [subjects, setSubjects] = useState<StudySubject[]>(INITIAL_SUBJECTS);
  const [newSubj, setNewSubj] = useState('');
  const [newDate, setNewDate] = useState('2026-12-15');
  const [newHours, setNewHours] = useState('5');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubj, setEditSubj] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editHours, setEditHours] = useState('5');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSubjects(parsed);
      } catch {
        // Ignore malformed localStorage payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const toggleComplete = (id: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const addSubject = () => {
    const trimmed = newSubj.trim();
    const hours = Number(newHours);
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la asignatura.' : 'Please enter a subject name.');
      return;
    }
    if (!Number.isFinite(hours) || hours <= 0) {
      setFormError(isEs ? 'Las horas semanales deben ser positivas.' : 'Weekly hours must be positive.');
      return;
    }
    setFormError('');
    setSubjects([
      ...subjects,
      {
        id: Date.now().toString(),
        subject: trimmed,
        examDate: newDate,
        hoursPerWeek: hours,
        completed: false
      }
    ]);
    setNewSubj('');
    setNewHours('5');
  };

  const startEdit = (item: StudySubject) => {
    setEditingId(item.id);
    setEditSubj(item.subject);
    setEditDate(item.examDate);
    setEditHours(String(item.hoursPerWeek));
  };

  const commitEdit = (id: string) => {
    const trimmed = editSubj.trim();
    const hours = Number(editHours);
    if (!trimmed || !Number.isFinite(hours) || hours <= 0) return;
    setSubjects(
      subjects.map((s) =>
        s.id === id ? { ...s, subject: trimmed, examDate: editDate, hoursPerWeek: hours } : s
      )
    );
    setEditingId(null);
  };

  const removeSubject = (id: string) => setSubjects(subjects.filter((s) => s.id !== id));

  const totalWeeklyStudyHours = subjects.reduce(
    (sum, item) => sum + (Number(item.hoursPerWeek) || 0),
    0
  );
  const completedCount = subjects.filter((s) => s.completed).length;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(subjects, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-schedule-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Estudio y Exámenes' : 'Study Schedule & Exam Prep Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Asigna horas de estudio por asignatura y sigue tus fechas de examen'
                : 'Allocate weekly study hours per course and track exam readiness'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">
              {isEs ? 'Guardado localmente' : 'Saved locally'}
            </UiStatusLabel>
          )}
          <UiButton variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar' : 'Save')}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setSubjects(INITIAL_SUBJECTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Horas Totales de Estudio Semanal' : 'Total Weekly Study Hours'}
          value={`${totalWeeklyStudyHours} ${isEs ? 'h / sem' : 'hrs / wk'}`}
          hint={isEs ? 'carga semanal planificada' : 'planned weekly load'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Asignaturas Cubiertas' : 'Subjects Covered'}
          value={`${completedCount} / ${subjects.length}`}
          hint={isEs ? 'completadas' : 'completed'}
        />
        <ToolMetricTile
          label={isEs ? 'Promedio por Materia' : 'Avg Hours / Subject'}
          value={`${subjects.length > 0 ? (totalWeeklyStudyHours / subjects.length).toFixed(1) : '0.0'} ${isEs ? 'h' : 'hrs'}`}
          hint={isEs ? 'por semana' : 'per week'}
        />
      </div>

      {/* Add Subject Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Asignatura o Examen' : 'Add Study Subject & Exam'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Asignatura' : 'Subject name'} htmlFor={`${baseId}-subj`}>
              <UiInput
                id={`${baseId}-subj`}
                type="text"
                placeholder={isEs ? 'Ej. Física II' : 'e.g. Physics II'}
                value={newSubj}
                onChange={(e) => setNewSubj(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Fecha de examen' : 'Exam date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Horas / sem' : 'Hours / wk'} htmlFor={`${baseId}-hours`}>
              <UiInput
                id={`${baseId}-hours`}
                type="number"
                min={1}
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton variant="primary" onClick={addSubject} className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Agregar' : 'Add'}</span>
            </UiButton>
          </div>
        </div>
      </section>

      {/* Study Plan List */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Plan de Estudio' : 'Study Plan & Exam Schedule'}
          </h3>
          {subjects.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setSubjects([])}>
              {isEs ? 'Vaciar plan' : 'Clear plan'}
            </UiButton>
          )}
        </div>

        {subjects.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay asignaturas registradas' : 'No study subjects yet'}
            description={
              isEs
                ? 'Agrega una asignatura arriba o restaura las materias de ejemplo.'
                : 'Add a study subject above or restore the starter exam schedule.'
            }
            action={
              <UiButton
                variant="secondary"
                size="sm"
                onClick={() => setSubjects(INITIAL_SUBJECTS)}
              >
                {isEs ? 'Restaurar ejemplo' : 'Restore sample plan'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {subjects.map((item) => (
              <div
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                  item.completed
                    ? 'bg-surface-secondary/40 border-border-subtle opacity-75'
                    : 'bg-surface border-border-main'
                }`}
              >
                {editingId === item.id ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar asignatura' : 'Edit subject'}
                      value={editSubj}
                      onChange={(e) => setEditSubj(e.target.value)}
                      className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                    />
                    <input
                      type="date"
                      aria-label={isEs ? 'Editar fecha de examen' : 'Edit exam date'}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="ui-input w-36 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      min={1}
                      aria-label={isEs ? 'Editar horas semanales' : 'Edit weekly hours'}
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      className="ui-input w-20 py-1.5 text-xs font-mono"
                    />
                    <UiButton
                      variant="primary"
                      size="sm"
                      aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                      onClick={() => commitEdit(item.id)}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="sm"
                      aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UiCheckbox
                        label=""
                        aria-label={isEs ? `Marcar ${item.subject}` : `Toggle ${item.subject}`}
                        checked={item.completed}
                        onChange={() => toggleComplete(item.id)}
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-semibold block truncate ${
                            item.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                          }`}
                        >
                          {item.subject}
                        </span>
                        <span className="text-[11px] text-text-secondary font-mono">
                          {isEs ? 'Examen:' : 'Exam Date:'} {item.examDate} • {item.hoursPerWeek}{' '}
                          {isEs ? 'h/sem' : 'hrs/week'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={isEs ? `Editar ${item.subject}` : `Edit ${item.subject}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubject(item.id)}
                        aria-label={isEs ? `Eliminar ${item.subject}` : `Remove ${item.subject}`}
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
