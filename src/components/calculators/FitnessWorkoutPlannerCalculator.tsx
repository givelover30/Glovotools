import { useState, useMemo, useId } from 'react';
import { Dumbbell, Plus, Trash2, CheckSquare, Square, BedDouble } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup, ToolSegmentedControl } from '../calculator/ToolWorkspacePrimitives.tsx';
import { UiButton, UiInput, UiStatusLabel, UiErrorState } from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerProgressBar,
  PlannerDisclaimer
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  FitnessWorkoutPlanInput,
  MUSCLE_GROUP_OPTIONS,
  WorkoutDayInput,
  WorkoutSplitId,
  analyzeFitnessWorkoutPlan,
  buildSplitPresetDays,
  validateFitnessWorkoutInput
} from '../../engine/contracts/planners/fitnessWorkout.ts';

const DEFAULT_WORKOUT_STATE: FitnessWorkoutPlanInput = {
  planName: 'Weekly Push / Pull / Legs Split',
  split: 'ppl',
  weightUnit: 'kg',
  days: buildSplitPresetDays('ppl')
};

const EMPTY_WORKOUT_STATE: FitnessWorkoutPlanInput = {
  planName: 'Custom Weekly Routine',
  split: 'custom',
  weightUnit: 'kg',
  days: buildSplitPresetDays('custom')
};

function sanitizeWorkoutState(raw: unknown): FitnessWorkoutPlanInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<FitnessWorkoutPlanInput>;
  if (typeof obj.planName !== 'string' || !Array.isArray(obj.days) || obj.days.length === 0) {
    return null;
  }
  const split: WorkoutSplitId =
    obj.split === 'ppl' || obj.split === 'upper-lower' || obj.split === 'full-body'
      ? obj.split
      : 'custom';
  const days: WorkoutDayInput[] = [];
  for (const d of obj.days) {
    if (!d || typeof d !== 'object' || typeof d.dayKey !== 'string' || !Array.isArray(d.exercises)) {
      return null;
    }
    days.push({
      dayKey: d.dayKey,
      dayLabel: typeof d.dayLabel === 'string' ? d.dayLabel : d.dayKey,
      focus: typeof d.focus === 'string' ? d.focus : '',
      isRestDay: Boolean(d.isRestDay),
      notes: typeof d.notes === 'string' ? d.notes : '',
      exercises: d.exercises
        .filter((e) => e && typeof e === 'object' && typeof e.name === 'string')
        .map((e) => ({
          id: typeof e.id === 'string' ? e.id : `ex-${Math.random().toString(36).slice(2)}`,
          name: e.name,
          muscleGroup: typeof e.muscleGroup === 'string' ? e.muscleGroup : 'Chest',
          sets: typeof e.sets === 'number' && Number.isFinite(e.sets) ? Math.max(1, Math.round(e.sets)) : 3,
          reps: typeof e.reps === 'string' ? e.reps : '8-12',
          weight: typeof e.weight === 'number' && Number.isFinite(e.weight) && e.weight >= 0 ? e.weight : null,
          completed: Boolean(e.completed)
        }))
    });
  }
  return {
    planName: obj.planName,
    split,
    weightUnit: obj.weightUnit === 'lb' ? 'lb' : 'kg',
    days
  };
}

export default function FitnessWorkoutPlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<FitnessWorkoutPlanInput>({
    storageKey: 'calctools_fitness_workout_planner_v1',
    version: 1,
    defaultValue: DEFAULT_WORKOUT_STATE,
    sanitize: sanitizeWorkoutState
  });

  const [selectedDayKey, setSelectedDayKey] = useState<string>(state.days[0]?.dayKey ?? 'mon');
  const [exName, setExName] = useState('');
  const [exMuscle, setExMuscle] = useState('Chest');
  const [exSets, setExSets] = useState(3);
  const [exReps, setExReps] = useState('8-12');
  const [exWeight, setExWeight] = useState('');
  const [formError, setFormError] = useState('');

  const validationErrors = useMemo(() => validateFitnessWorkoutInput(state), [state]);
  const analysis = useMemo(() => {
    if (validationErrors.length > 0) return null;
    try {
      return analyzeFitnessWorkoutPlan(state);
    } catch {
      return null;
    }
  }, [state, validationErrors]);

  const activeDay = useMemo(
    () => state.days.find((d) => d.dayKey === selectedDayKey) ?? state.days[0],
    [state.days, selectedDayKey]
  );

  const applySplitTemplate = (split: WorkoutSplitId) => {
    const labelMap: Record<WorkoutSplitId, string> = {
      ppl: 'Push / Pull / Legs Split',
      'upper-lower': 'Upper / Lower Split',
      'full-body': 'Full Body 3-Day Split',
      custom: 'Custom Weekly Routine'
    };
    setState((prev) => ({
      ...prev,
      split,
      planName: labelMap[split],
      days: buildSplitPresetDays(split)
    }));
  };

  const toggleRestDay = (dayKey: string) => {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.dayKey === dayKey ? { ...d, isRestDay: !d.isRestDay } : d))
    }));
  };

  const updateDayFocus = (dayKey: string, focus: string) => {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.dayKey === dayKey ? { ...d, focus } : d))
    }));
  };

  const addExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDay) return;
    const trimmed = exName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del ejercicio.' : 'Please enter an exercise name.');
      return;
    }
    const setsNum = Math.trunc(Number(exSets));
    if (!Number.isFinite(setsNum) || setsNum < 1) {
      setFormError(isEs ? 'Las series deben ser >= 1.' : 'Sets must be a whole number >= 1.');
      return;
    }
    const parsedWeight = exWeight.trim() === '' ? null : Number(exWeight);
    if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
      setFormError(isEs ? 'El peso no puede ser negativo.' : 'Weight cannot be negative.');
      return;
    }
    setFormError('');
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayKey === activeDay.dayKey
          ? {
              ...d,
              isRestDay: false,
              exercises: [
                ...d.exercises,
                {
                  id: `ex-${Date.now()}`,
                  name: trimmed,
                  muscleGroup: exMuscle,
                  sets: setsNum,
                  reps: exReps.trim() || '8-12',
                  weight: parsedWeight,
                  completed: false
                }
              ]
            }
          : d
      )
    }));
    setExName('');
    setExWeight('');
  };

  const toggleExerciseCompleted = (dayKey: string, exId: string) => {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayKey === dayKey
          ? {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.id === exId ? { ...ex, completed: !ex.completed } : ex
              )
            }
          : d
      )
    }));
  };

  const deleteExercise = (dayKey: string, exId: string) => {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayKey === dayKey
          ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) }
          : d
      )
    }));
  };

  const handleExportCsv = () => {
    const rows: Array<Array<string | number>> = [];
    for (const day of state.days) {
      if (day.isRestDay || day.exercises.length === 0) {
        rows.push([day.dayLabel, day.isRestDay ? 'Rest / Recovery' : day.focus, '—', '—', 0, '—', '—', '—']);
      } else {
        for (const ex of day.exercises) {
          rows.push([
            day.dayLabel,
            day.focus,
            ex.name,
            ex.muscleGroup,
            ex.sets,
            ex.reps,
            ex.weight !== null && ex.weight !== undefined ? `${ex.weight} ${state.weightUnit}` : 'Bodyweight',
            ex.completed ? 'Completed' : 'Planned'
          ]);
        }
      }
    }
    downloadCsvFile(
      'weekly_fitness_routine.csv',
      ['Day', 'Focus', 'Exercise', 'Muscle Group', 'Sets', 'Reps', 'Load', 'Status'],
      rows
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('weekly_fitness_routine.json', { plan: state, summary: analysis });
  };

  const copySummary = analysis
    ? `${analysis.planName} | ${analysis.trainingDays} training days / ${analysis.restDays} rest days | ${analysis.totalWeeklySets} weekly sets (${analysis.completedWeeklySets} completed, ${analysis.completionPct}%)`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<Dumbbell className="w-4 h-4" />}
        title={isEs ? 'Planificador Semanal de Entrenamiento' : 'Weekly Fitness Routine & Split Planner'}
        subtitle={
          isEs
            ? 'Organiza rutinas Push/Pull/Legs, Upper/Lower o Full Body con volumen semanal por grupo muscular'
            : 'Organize Push/Pull/Legs, Upper/Lower, or Full Body splits with weekly sets & recovery days'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_WORKOUT_STATE)}
      />

      {/* Split Selector + Plan Metadata */}
      <section className="ui-panel p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-6 space-y-1.5">
            <span className="ui-label block">
              {isEs ? 'Plantilla de División Semanal' : 'Weekly Split Template'}
            </span>
            <ToolSegmentedControl
              ariaLabel={isEs ? 'División semanal' : 'Workout split template'}
              value={state.split}
              onChange={applySplitTemplate}
              options={[
                { value: 'ppl', label: 'Push / Pull / Legs' },
                { value: 'upper-lower', label: 'Upper / Lower' },
                { value: 'full-body', label: 'Full Body' },
                { value: 'custom', label: isEs ? 'Personalizado' : 'Custom' }
              ]}
            />
          </div>
          <div className="lg:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre de la Rutina' : 'Routine Name'} htmlFor={`${baseId}-plan-name`}>
              <UiInput
                id={`${baseId}-plan-name`}
                type="text"
                value={state.planName}
                onChange={(e) => setState((prev) => ({ ...prev, planName: e.target.value }))}
              />
            </ToolFieldGroup>
          </div>
          <div className="lg:col-span-2">
            <ToolFieldGroup label={isEs ? 'Unidad de Peso' : 'Load Unit'} htmlFor={`${baseId}-unit`}>
              <select
                id={`${baseId}-unit`}
                value={state.weightUnit}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    weightUnit: e.target.value === 'lb' ? 'lb' : 'kg'
                  }))
                }
                className="ui-input cursor-pointer text-xs"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </ToolFieldGroup>
          </div>
        </div>
      </section>

      {validationErrors.length > 0 && <UiErrorState message={validationErrors[0].message} />}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Días Activos vs. Descanso' : 'Training / Rest Split'}
          value={analysis ? `${analysis.trainingDays} / ${analysis.restDays}` : '—'}
          hint={isEs ? 'días por semana' : 'days per week'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Series Semanales Totales' : 'Weekly Planned Sets'}
          value={analysis ? String(analysis.totalWeeklySets) : '—'}
          hint={analysis ? `${analysis.totalExercises} ${isEs ? 'ejercicios' : 'exercises'}` : ''}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Cumplimiento Semanal' : 'Weekly Completion'}
          value={analysis ? `${analysis.completionPct}%` : '0%'}
          hint={
            analysis
              ? `${analysis.completedExercises}/${analysis.totalExercises} ${isEs ? 'completados' : 'done'}`
              : ''
          }
        />
        <ToolMetricTile
          label={isEs ? 'Volumen Total Movido' : 'Planned Load Volume'}
          value={
            analysis && analysis.totalTonnageVolume > 0
              ? `${analysis.totalTonnageVolume.toLocaleString()} ${state.weightUnit}`
              : '—'
          }
          hint={isEs ? 'series × reps × peso' : 'sets × reps × entered load'}
        />
      </div>

      {/* Muscle Group Volume Overview */}
      {analysis && Object.keys(analysis.setsPerMuscleGroup).length > 0 && (
        <section className="ui-panel p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {isEs ? 'Volumen Semanal por Grupo Muscular' : 'Weekly Sets per Muscle Group'}
            </h3>
            <span className="text-xs font-mono text-text-secondary">
              {analysis.totalWeeklySets} {isEs ? 'series' : 'total sets'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.setsPerMuscleGroup)
              .sort((a, b) => b[1] - a[1])
              .map(([muscle, sets]) => (
                <div
                  key={muscle}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-secondary/60 text-xs flex items-center gap-2"
                >
                  <span className="font-medium text-text-primary">{muscle}</span>
                  <span className="font-mono font-bold text-accent">{sets}</span>
                </div>
              ))}
          </div>
          <PlannerProgressBar
            label={isEs ? 'Progreso de Entrenamientos de la Semana' : 'Weekly Exercise Completion'}
            percent={analysis.completionPct}
            valueLabel={`${analysis.completedWeeklySets} / ${analysis.totalWeeklySets} ${isEs ? 'series' : 'sets'}`}
            tone={analysis.completionPct === 100 ? 'success' : 'accent'}
          />
        </section>
      )}

      {/* Day Tabs + Active Day Workspace */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {state.days.map((day) => {
            const active = activeDay?.dayKey === day.dayKey;
            return (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => setSelectedDayKey(day.dayKey)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-accent bg-accent-light/30 shadow-xs'
                    : 'border-border-subtle bg-surface-secondary/40 hover:bg-surface-hover'
                }`}
              >
                <div className="text-xs font-bold text-text-primary">{day.dayLabel}</div>
                <div className="text-[11px] text-text-secondary truncate mt-0.5">
                  {day.isRestDay ? (isEs ? 'Descanso' : 'Rest Day') : `${day.exercises.length} ${isEs ? 'ejerc.' : 'ex.'}`}
                </div>
              </button>
            );
          })}
        </div>

        {activeDay && (
          <div className="space-y-4 pt-3 border-t border-border-subtle">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[220px]">
                <ToolFieldGroup
                  label={isEs ? `Enfoque de ${activeDay.dayLabel}` : `${activeDay.dayLabel} Session Focus`}
                  htmlFor={`${baseId}-day-focus`}
                >
                  <UiInput
                    id={`${baseId}-day-focus`}
                    type="text"
                    value={activeDay.focus}
                    onChange={(e) => updateDayFocus(activeDay.dayKey, e.target.value)}
                  />
                </ToolFieldGroup>
              </div>
              <div className="no-print">
                <UiButton
                  variant={activeDay.isRestDay ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => toggleRestDay(activeDay.dayKey)}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>
                    {activeDay.isRestDay
                      ? isEs
                        ? 'Marcado como Descanso (Cambiar a Entreno)'
                        : 'Rest Day Active (Switch to Training)'
                      : isEs
                      ? 'Marcar como Día de Descanso'
                      : 'Mark as Rest Day'}
                  </span>
                </UiButton>
              </div>
            </div>

            {activeDay.isRestDay ? (
              <div className="p-5 rounded-xl border border-dashed border-border-main bg-surface-secondary/40 text-center space-y-2">
                <p className="text-sm font-semibold text-text-primary">
                  {isEs ? 'Día de Recuperación y Descanso' : 'Scheduled Recovery / Rest Day'}
                </p>
                <p className="text-xs text-text-secondary">
                  {isEs
                    ? 'Aprovecha para movilidad ligera, caminata o hidratación. Puedes reactivar ejercicios arriba cuando quieras.'
                    : 'Use this day for rest, walking, or light mobility. Switch back to Training above anytime.'}
                </p>
              </div>
            ) : (
              <>
                {formError && <UiErrorState message={formError} />}
                <form
                  onSubmit={addExercise}
                  className="no-print grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end pb-4 border-b border-border-subtle"
                >
                  <div className="sm:col-span-4">
                    <ToolFieldGroup label={isEs ? 'Ejercicio' : 'Exercise Name'} htmlFor={`${baseId}-ex-name`}>
                      <UiInput
                        id={`${baseId}-ex-name`}
                        type="text"
                        placeholder={isEs ? 'Ej. Press Inclinado' : 'e.g. Incline Bench Press'}
                        value={exName}
                        onChange={(e) => setExName(e.target.value)}
                      />
                    </ToolFieldGroup>
                  </div>
                  <div className="sm:col-span-2">
                    <ToolFieldGroup label={isEs ? 'Grupo Muscular' : 'Muscle Group'} htmlFor={`${baseId}-ex-mg`}>
                      <select
                        id={`${baseId}-ex-mg`}
                        value={exMuscle}
                        onChange={(e) => setExMuscle(e.target.value)}
                        className="ui-input cursor-pointer text-xs"
                      >
                        {MUSCLE_GROUP_OPTIONS.map((mg) => (
                          <option key={mg} value={mg}>
                            {mg}
                          </option>
                        ))}
                      </select>
                    </ToolFieldGroup>
                  </div>
                  <div className="sm:col-span-1">
                    <ToolFieldGroup label={isEs ? 'Series' : 'Sets'} htmlFor={`${baseId}-ex-sets`}>
                      <UiInput
                        id={`${baseId}-ex-sets`}
                        type="number"
                        min={1}
                        step={1}
                        value={exSets}
                        onChange={(e) => setExSets(Number(e.target.value))}
                        className="font-mono"
                      />
                    </ToolFieldGroup>
                  </div>
                  <div className="sm:col-span-2">
                    <ToolFieldGroup label={isEs ? 'Reps' : 'Reps'} htmlFor={`${baseId}-ex-reps`}>
                      <UiInput
                        id={`${baseId}-ex-reps`}
                        type="text"
                        value={exReps}
                        onChange={(e) => setExReps(e.target.value)}
                        className="font-mono"
                        placeholder="8-12"
                      />
                    </ToolFieldGroup>
                  </div>
                  <div className="sm:col-span-1">
                    <ToolFieldGroup label={state.weightUnit} htmlFor={`${baseId}-ex-wt`}>
                      <UiInput
                        id={`${baseId}-ex-wt`}
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="—"
                        value={exWeight}
                        onChange={(e) => setExWeight(e.target.value)}
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

                {activeDay.exercises.length === 0 ? (
                  <p className="text-xs text-text-secondary py-3 text-center">
                    {isEs
                      ? 'Sin ejercicios agregados para este día todavía.'
                      : 'No exercises scheduled for this day yet. Add one above.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeDay.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleExerciseCompleted(activeDay.dayKey, ex.id)}
                            aria-label={
                              ex.completed
                                ? `Mark ${ex.name} incomplete`
                                : `Mark ${ex.name} complete`
                            }
                            className="text-accent cursor-pointer shrink-0"
                          >
                            {ex.completed ? (
                              <CheckSquare className="w-5 h-5 text-status-success" />
                            ) : (
                              <Square className="w-5 h-5 text-text-tertiary" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <span
                              className={`font-semibold text-sm block truncate ${
                                ex.completed
                                  ? 'line-through text-text-tertiary'
                                  : 'text-text-primary'
                              }`}
                            >
                              {ex.name}
                            </span>
                            <div className="text-xs font-mono text-text-secondary flex flex-wrap gap-x-3">
                              <span>
                                {ex.sets} × {ex.reps}
                              </span>
                              {ex.weight !== null && ex.weight !== undefined && (
                                <span>
                                  {ex.weight} {state.weightUnit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <UiStatusLabel tone="neutral">{ex.muscleGroup}</UiStatusLabel>
                          <button
                            type="button"
                            onClick={() => deleteExercise(activeDay.dayKey, ex.id)}
                            aria-label={`Remove ${ex.name}`}
                            className="no-print p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <PlannerDisclaimer
        tone="info"
        title={isEs ? 'Aviso General de Entrenamiento' : 'General Fitness Planning Note'}
        message={
          isEs
            ? 'Esta herramienta organiza rutinas semanales y volumen de entrenamiento. No ofrece diagnóstico médico ni rehabilitación física; consulta a un profesional certificado si tienes lesiones o condiciones previas.'
            : 'This planner organizes weekly workout splits and set volume only. It does not provide medical, physical therapy, or injury-rehabilitation advice.'
        }
      />
    </div>
  );
}
