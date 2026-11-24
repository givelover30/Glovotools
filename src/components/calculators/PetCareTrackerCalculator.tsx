import { useState, useId } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Download,
  RotateCcw,
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

interface PetTask {
  id: string;
  petName: string;
  task: string;
  dueDate: string;
  completed: boolean;
}

const INITIAL_TASKS: PetTask[] = [
  { id: '1', petName: 'Max (Dog)', task: 'Annual Rabies Vaccination & Checkup', dueDate: '2026-11-20', completed: false },
  { id: '2', petName: 'Luna (Cat)', task: 'Flea & Tick Prevention Treatment', dueDate: '2026-11-25', completed: true },
  { id: '3', petName: 'Max (Dog)', task: 'Professional Grooming Session', dueDate: '2026-12-02', completed: false }
];

export default function PetCareTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<PetTask[]>(INITIAL_TASKS);
  const [petName, setPetName] = useState('Max');
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPet, setEditPet] = useState('');
  const [editTask, setEditTask] = useState('');
  const [editDate, setEditDate] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = taskName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa una tarea de cuidado.' : 'Please enter a care task.');
      return;
    }
    setFormError('');
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        petName: petName.trim() || (isEs ? 'Mascota' : 'Pet'),
        task: trimmed,
        dueDate,
        completed: false
      }
    ]);
    setTaskName('');
  };

  const startEdit = (t: PetTask) => {
    setEditingId(t.id);
    setEditPet(t.petName);
    setEditTask(t.task);
    setEditDate(t.dueDate);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, petName: editPet.trim() || t.petName, task: trimmed, dueDate: editDate }
          : t
      )
    );
    setEditingId(null);
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pet_care.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Agenda de Cuidado para Mascotas' : 'Pet Care & Veterinary Schedule Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Coordina vacunas, desparasitación y citas veterinarias' : 'Coordinate vaccinations, grooming, and veterinary reminders'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Cuidado (JSON)' : 'Export Pet Care (JSON)'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Tareas de Cuidado Pendientes' : 'Pending Care Tasks'}
          value={String(pendingCount)}
          hint={isEs ? 'por completar' : 'upcoming reminders'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Total de Cuidados' : 'Total Tasks Logged'}
          value={String(tasks.length)}
          hint={isEs ? `${tasks.length - pendingCount} completadas` : `${tasks.length - pendingCount} completed`}
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Mascota' : 'Pet Name'} htmlFor={`${baseId}-pet`}>
              <UiInput
                id={`${baseId}-pet`}
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Actividad / Cuidado' : 'Care Task'} htmlFor={`${baseId}-task`}>
              <UiInput
                id={`${baseId}-task`}
                type="text"
                placeholder={isEs ? 'Ej. Medicación antiparasitaria' : 'e.g. Heartworm medication'}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Fecha' : 'Due Date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton type="submit" variant="primary" className="w-full" aria-label={isEs ? 'Añadir cuidado' : 'Add task'}>
              <Plus className="w-4 h-4" />
            </UiButton>
          </div>
        </form>

        {tasks.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin tareas de cuidado' : 'No pet care tasks yet'}
            description={
              isEs
                ? 'Agrega un recordatorio arriba o restaura las tareas iniciales.'
                : 'Add a care reminder above or restore starter tasks.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample tasks'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === t.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar mascota' : 'Edit pet'}
                      value={editPet}
                      onChange={(e) => setEditPet(e.target.value)}
                      className="ui-input w-32 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar tarea' : 'Edit task'}
                      value={editTask}
                      onChange={(e) => setEditTask(e.target.value)}
                      className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                    />
                    <input
                      type="date"
                      aria-label={isEs ? 'Editar fecha' : 'Edit date'}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="ui-input w-36 py-1.5 text-xs font-mono"
                    />
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(t.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={(e) =>
                          setTasks((prev) =>
                            prev.map((x) => (x.id === t.id ? { ...x, completed: e.target.checked } : x))
                          )
                        }
                        aria-label={t.task}
                        className="w-4 h-4 accent-[#159B69] dark:accent-[#10B981] rounded cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <span
                          className={`font-semibold text-sm block truncate ${
                            t.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                          }`}
                        >
                          {t.task}
                        </span>
                        <div className="text-xs text-text-secondary font-mono">
                          {t.petName} • {isEs ? 'Fecha:' : 'Due:'} {t.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <UiStatusLabel tone={t.completed ? 'success' : 'accent'}>
                        {t.completed ? (isEs ? 'Listo' : 'Done') : (isEs ? 'Pendiente' : 'Pending')}
                      </UiStatusLabel>
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        aria-label={isEs ? `Editar ${t.task}` : `Edit ${t.task}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))}
                        aria-label={isEs ? `Eliminar ${t.task}` : `Remove ${t.task}`}
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
