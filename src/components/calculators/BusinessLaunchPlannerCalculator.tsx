import { useState, useMemo, useId } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Download,
  RotateCcw,
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
  UiCheckbox,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface LaunchTask {
  id: string;
  category: string;
  task: string;
  cost: number;
  completed: boolean;
}

const INITIAL_TASKS: LaunchTask[] = [
  { id: '1', category: 'Legal', task: 'LLC Formation & Registered Agent', cost: 350, completed: true },
  { id: '2', category: 'Branding', task: 'Logo & Brand Identity Design', cost: 600, completed: true },
  { id: '3', category: 'Product', task: 'MVP Software Development & Hosting', cost: 1200, completed: false },
  { id: '4', category: 'Marketing', task: 'Launch Ad Campaign & Landing Page', cost: 800, completed: false }
];

const CATEGORIES = ['Legal', 'Branding', 'Product', 'Marketing'];

const CATEGORY_ES: Record<string, string> = {
  Legal: 'Legal y Cumplimiento',
  Branding: 'Marca y Diseño',
  Product: 'Producto y Tecnología',
  Marketing: 'Marketing y Crecimiento'
};

const CATEGORY_EN: Record<string, string> = {
  Legal: 'Legal & Compliance',
  Branding: 'Branding & Design',
  Product: 'Product & Tech',
  Marketing: 'Marketing & Growth'
};

export default function BusinessLaunchPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<LaunchTask[]>(INITIAL_TASKS);
  const [newTaskName, setNewTaskName] = useState('');
  const [newCategory, setNewCategory] = useState('Marketing');
  const [newCost, setNewCost] = useState(250);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState('Marketing');
  const [editTask, setEditTask] = useState('');
  const [editCost, setEditCost] = useState(0);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa una tarea de lanzamiento.' : 'Please enter a launch task.');
      return;
    }
    if (!Number.isFinite(newCost) || newCost < 0) {
      setFormError(isEs ? 'El costo no puede ser negativo.' : 'Cost cannot be negative.');
      return;
    }
    setFormError('');
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        category: newCategory,
        task: trimmed,
        cost: Number(newCost) || 0,
        completed: false
      }
    ]);
    setNewTaskName('');
  };

  const startEdit = (t: LaunchTask) => {
    setEditingId(t.id);
    setEditCat(t.category);
    setEditTask(t.task);
    setEditCost(t.cost);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed || editCost < 0) return;
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, category: editCat, task: trimmed, cost: Number(editCost) } : t
      )
    );
    setEditingId(null);
  };

  const totalCost = useMemo(() => tasks.reduce((acc, t) => acc + t.cost, 0), [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business_launch.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Lanzamiento de Negocio' : 'Business Launch Checklist & Capital'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Presupuesta requisitos legales, producto y marketing inicial'
                : 'Budget legal setup, product build, and go-to-market launch tasks'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Plan (JSON)' : 'Export Business Plan (JSON)'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Costo Total de Lanzamiento' : 'Total Launch Capital Needed'}
          value={fmtMoney(totalCost)}
          hint={`${tasks.length} ${isEs ? 'partidas' : 'items'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Tareas Completadas' : 'Completed Launch Tasks'}
          value={`${completedCount} / ${tasks.length}`}
          hint={isEs ? 'hitos listos' : 'tasks done'}
        />
        <ToolMetricTile
          label={isEs ? 'Avance de Preparación' : 'Launch Readiness'}
          value={`${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%`}
          hint={isEs ? 'progreso general' : 'overall progress'}
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form
          onSubmit={addTask}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
        >
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {isEs ? CATEGORY_ES[c] : CATEGORY_EN[c]}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup
              label={isEs ? 'Tarea de Lanzamiento' : 'Launch Task'}
              htmlFor={`${baseId}-task`}
            >
              <UiInput
                id={`${baseId}-task`}
                type="text"
                placeholder={
                  isEs ? 'Ej. Registro de marca comercial' : 'e.g. Trademark registration'
                }
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Costo (${currencyMeta.symbol})` : `Cost (${currencyMeta.symbol})`} htmlFor={`${baseId}-cost`}>
              <UiInput
                id={`${baseId}-cost`}
                type="number"
                min={0}
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
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

        {tasks.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay tareas de lanzamiento' : 'No launch tasks yet'}
            description={
              isEs
                ? 'Agrega una tarea arriba o restaura el plan inicial.'
                : 'Add a launch task above or restore the starter checklist.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample plan'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const displayCat = isEs
                ? CATEGORY_ES[task.category] || task.category
                : CATEGORY_EN[task.category] || task.category;

              return (
                <div
                  key={task.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                    task.completed
                      ? 'bg-surface-secondary/40 border-border-subtle opacity-75'
                      : 'bg-surface border-border-main'
                  }`}
                >
                  {editingId === task.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <select
                        aria-label={isEs ? 'Editar categoría' : 'Edit category'}
                        value={editCat}
                        onChange={(e) => setEditCat(e.target.value)}
                        className="ui-select w-36 py-1.5 text-xs"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {isEs ? CATEGORY_ES[c] : CATEGORY_EN[c]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar tarea' : 'Edit task'}
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        className="ui-input flex-1 min-w-[150px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar costo' : 'Edit cost'}
                        value={editCost}
                        onChange={(e) => setEditCost(Number(e.target.value))}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(task.id)}
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
                          aria-label={isEs ? `Marcar ${task.task}` : `Toggle ${task.task}`}
                          checked={task.completed}
                          onChange={(e) =>
                            setTasks(
                              tasks.map((t) =>
                                t.id === task.id ? { ...t, completed: e.target.checked } : t
                              )
                            )
                          }
                        />
                        <div className="min-w-0">
                          <span
                            className={`font-semibold text-sm block truncate ${
                              task.completed
                                ? 'line-through text-text-secondary'
                                : 'text-text-primary'
                            }`}
                          >
                            {task.task}
                          </span>
                          <div className="text-xs text-text-secondary">{displayCat}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-sm font-bold text-text-primary">
                          {fmtMoney(task.cost)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          aria-label={isEs ? `Editar ${task.task}` : `Edit ${task.task}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
                          aria-label={isEs ? `Eliminar ${task.task}` : `Remove ${task.task}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
