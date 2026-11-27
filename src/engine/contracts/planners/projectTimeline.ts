import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export type ProjectTaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ProjectTaskInput {
  id: string;
  name: string;
  startDate: string;
  durationDays: number;
  progress: number;
  dependencies?: string[];
}

export interface ComputedProjectTask {
  id: string;
  name: string;
  requestedStartDate: string;
  effectiveStartDate: string;
  endDate: string;
  durationDays: number;
  progress: number;
  status: ProjectTaskStatus;
  dependencies: string[];
  startDayOffset: number;
  endDayOffset: number;
  ganttLeftPct: number;
  ganttWidthPct: number;
  slackDays: number;
  isCritical: boolean;
  isOverdue: boolean;
  isDelayedByDependency: boolean;
}

export interface ProjectTimelineInput {
  projectName: string;
  projectStartDate: string;
  tasks: ProjectTaskInput[];
  referenceDate?: string;
}

export interface ProjectTimelineResult {
  projectName: string;
  projectStartDate: string;
  projectEffectiveStartDate: string;
  projectFinishDate: string;
  totalDurationDays: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageProgress: number;
  weightedProgress: number;
  criticalPathTaskIds: string[];
  tasks: ComputedProjectTask[];
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export function parseIsoCalendarDate(dateStr: string): number | null {
  if (typeof dateStr !== 'string' || !ISO_DATE_REGEX.test(dateStr.trim())) {
    return null;
  }
  const [yStr, mStr, dStr] = dateStr.trim().split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const ms = Date.UTC(y, m - 1, d);
  const dt = new Date(ms);
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return ms;
}

export function formatIsoCalendarDate(utcMs: number): string {
  const dt = new Date(utcMs);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addIsoDays(dateStr: string, days: number): string {
  const baseMs = parseIsoCalendarDate(dateStr);
  if (baseMs === null) {
    throw new Error(`Invalid ISO calendar date: "${dateStr}"`);
  }
  return formatIsoCalendarDate(baseMs + Math.trunc(days) * MS_PER_DAY);
}

export function diffIsoDays(startDateStr: string, endDateStr: string): number {
  const startMs = parseIsoCalendarDate(startDateStr);
  const endMs = parseIsoCalendarDate(endDateStr);
  if (startMs === null || endMs === null) {
    throw new Error(`Invalid ISO date comparison: "${startDateStr}" vs "${endDateStr}"`);
  }
  return Math.round((endMs - startMs) / MS_PER_DAY);
}

export function validateProjectTimeline(input: ProjectTimelineInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!input.projectName || input.projectName.trim() === '') {
    errors.push({
      field: 'projectName',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Project name is required.'
    });
  }

  const projectStartMs = parseIsoCalendarDate(input.projectStartDate);
  if (projectStartMs === null) {
    errors.push({
      field: 'projectStartDate',
      code: 'INVALID_DATE',
      message: 'Project start date must be a valid YYYY-MM-DD calendar date.',
      invalidValue: input.projectStartDate
    });
  }

  if (input.referenceDate !== undefined && parseIsoCalendarDate(input.referenceDate) === null) {
    errors.push({
      field: 'referenceDate',
      code: 'INVALID_DATE',
      message: 'Reference date must be a valid YYYY-MM-DD calendar date.',
      invalidValue: input.referenceDate
    });
  }

  if (!Array.isArray(input.tasks)) {
    errors.push({
      field: 'tasks',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Tasks array is required.'
    });
    return errors;
  }

  const idCounts = new Map<string, number>();
  for (const t of input.tasks) {
    idCounts.set(t.id, (idCounts.get(t.id) ?? 0) + 1);
  }

  for (const t of input.tasks) {
    if (!t.id || t.id.trim() === '') {
      errors.push({
        field: 'tasks',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'Every task must have a non-empty ID.'
      });
    } else if ((idCounts.get(t.id) ?? 0) > 1) {
      errors.push({
        field: 'tasks',
        code: 'UNSUPPORTED_OPERATION',
        message: `Duplicate task ID detected: "${t.id}".`
      });
    }

    if (!t.name || t.name.trim() === '') {
      errors.push({
        field: 'tasks',
        code: 'REQUIRED_FIELD_MISSING',
        message: `Task "${t.id}" must have a name.`
      });
    }

    if (parseIsoCalendarDate(t.startDate) === null) {
      errors.push({
        field: 'tasks',
        code: 'INVALID_DATE',
        message: `Task "${t.name || t.id}" has an invalid start date "${t.startDate}".`,
        invalidValue: t.startDate
      });
    }

    if (!Number.isFinite(t.durationDays) || t.durationDays < 1 || !Number.isInteger(t.durationDays)) {
      errors.push({
        field: 'tasks',
        code: 'INTEGER_REQUIRED',
        message: `Task "${t.name || t.id}" duration must be a whole number of days >= 1.`,
        invalidValue: t.durationDays
      });
    }

    if (!Number.isFinite(t.progress) || t.progress < 0 || t.progress > 100) {
      errors.push({
        field: 'tasks',
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: `Task "${t.name || t.id}" progress must be between 0 and 100%.`,
        invalidValue: t.progress
      });
    }
  }

  const taskIds = new Set(input.tasks.map((t) => t.id));
  for (const t of input.tasks) {
    for (const depId of t.dependencies ?? []) {
      if (depId === t.id) {
        errors.push({
          field: 'dependencies',
          code: 'UNSUPPORTED_OPERATION',
          message: `Task "${t.name || t.id}" cannot depend on itself.`
        });
      } else if (!taskIds.has(depId)) {
        errors.push({
          field: 'dependencies',
          code: 'UNSUPPORTED_OPERATION',
          message: `Task "${t.name || t.id}" references missing dependency "${depId}".`
        });
      }
    }
  }

  // Stop before cycle check if structural errors already exist
  if (errors.length > 0) return errors;

  // Kahn's topological sort for dependency cycle detection
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const t of input.tasks) {
    const uniqueDeps = Array.from(new Set(t.dependencies ?? []));
    inDegree.set(t.id, uniqueDeps.length);
    for (const dep of uniqueDeps) {
      const list = dependents.get(dep) ?? [];
      list.push(t.id);
      dependents.set(dep, list);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  let visited = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    visited++;
    for (const next of dependents.get(curr) ?? []) {
      const nextDeg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, nextDeg);
      if (nextDeg === 0) queue.push(next);
    }
  }

  if (visited < input.tasks.length) {
    const cyclicNames = input.tasks
      .filter((t) => (inDegree.get(t.id) ?? 0) > 0)
      .map((t) => t.name || t.id);
    errors.push({
      field: 'dependencies',
      code: 'UNSUPPORTED_OPERATION',
      message: `Circular dependency detected involving: ${cyclicNames.join(', ')}.`
    });
  }

  return errors;
}

export function solveProjectTimeline(input: ProjectTimelineInput): ProjectTimelineResult {
  const errors = validateProjectTimeline(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const referenceDate =
    input.referenceDate ?? new Date().toISOString().slice(0, 10);

  if (input.tasks.length === 0) {
    return {
      projectName: input.projectName.trim(),
      projectStartDate: input.projectStartDate,
      projectEffectiveStartDate: input.projectStartDate,
      projectFinishDate: input.projectStartDate,
      totalDurationDays: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      averageProgress: 0,
      weightedProgress: 0,
      criticalPathTaskIds: [],
      tasks: []
    };
  }

  const taskMap = new Map<string, ProjectTaskInput>();
  const depsMap = new Map<string, string[]>();
  const succsMap = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const t of input.tasks) {
    taskMap.set(t.id, t);
    const deps = Array.from(new Set(t.dependencies ?? []));
    depsMap.set(t.id, deps);
    inDegree.set(t.id, deps.length);
    if (!succsMap.has(t.id)) succsMap.set(t.id, []);
    for (const d of deps) {
      const list = succsMap.get(d) ?? [];
      list.push(t.id);
      succsMap.set(d, list);
    }
  }

  // Topological ordering
  const topoOrder: string[] = [];
  const queue: string[] = [];
  for (const t of input.tasks) {
    if ((inDegree.get(t.id) ?? 0) === 0) queue.push(t.id);
  }
  while (queue.length > 0) {
    const id = queue.shift()!;
    topoOrder.push(id);
    for (const s of succsMap.get(id) ?? []) {
      const next = (inDegree.get(s) ?? 0) - 1;
      inDegree.set(s, next);
      if (next === 0) queue.push(s);
    }
  }

  // Forward pass (offsets in integer days relative to projectStartDate)
  const esOffset = new Map<string, number>();
  const efOffset = new Map<string, number>();
  const delayedByDep = new Map<string, boolean>();

  for (const id of topoOrder) {
    const task = taskMap.get(id)!;
    const requestedOffset = Math.max(0, diffIsoDays(input.projectStartDate, task.startDate));
    let maxPredFinish = 0;
    for (const depId of depsMap.get(id) ?? []) {
      const predEf = efOffset.get(depId) ?? 0;
      if (predEf > maxPredFinish) maxPredFinish = predEf;
    }
    const effectiveEs = Math.max(requestedOffset, maxPredFinish);
    esOffset.set(id, effectiveEs);
    efOffset.set(id, effectiveEs + task.durationDays);
    delayedByDep.set(id, maxPredFinish > requestedOffset);
  }

  const minStartOffset = Math.min(...Array.from(esOffset.values()));
  const projectEndOffset = Math.max(...Array.from(efOffset.values()));
  const totalSpanDays = Math.max(1, projectEndOffset - minStartOffset);

  // Backward pass (CPM slack & critical path)
  const lsOffset = new Map<string, number>();
  const lfOffset = new Map<string, number>();
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i];
    const task = taskMap.get(id)!;
    const succs = succsMap.get(id) ?? [];
    const lf =
      succs.length === 0
        ? projectEndOffset
        : Math.min(...succs.map((s) => lsOffset.get(s) ?? projectEndOffset));
    lfOffset.set(id, lf);
    lsOffset.set(id, lf - task.durationDays);
  }

  const computedTasks: ComputedProjectTask[] = input.tasks.map((task) => {
    const es = esOffset.get(task.id) ?? 0;
    const ef = efOffset.get(task.id) ?? task.durationDays;
    const ls = lsOffset.get(task.id) ?? es;
    const slackDays = Math.max(0, ls - es);
    const effectiveStartDate = addIsoDays(input.projectStartDate, es);
    const endDate = addIsoDays(effectiveStartDate, task.durationDays - 1);
    const progress = Math.round(task.progress);
    const status: ProjectTaskStatus =
      progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
    const isOverdue = progress < 100 && endDate < referenceDate;

    const ganttLeftPct = PrecisionEngine.roundTo(((es - minStartOffset) / totalSpanDays) * 100, 2);
    const ganttWidthPct = PrecisionEngine.roundTo((task.durationDays / totalSpanDays) * 100, 2);

    return {
      id: task.id,
      name: task.name.trim(),
      requestedStartDate: task.startDate,
      effectiveStartDate,
      endDate,
      durationDays: task.durationDays,
      progress,
      status,
      dependencies: depsMap.get(task.id) ?? [],
      startDayOffset: es,
      endDayOffset: ef,
      ganttLeftPct,
      ganttWidthPct,
      slackDays,
      isCritical: slackDays === 0,
      isOverdue,
      isDelayedByDependency: delayedByDep.get(task.id) ?? false
    };
  });

  const completedTasks = computedTasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = computedTasks.filter((t) => t.isOverdue).length;
  const averageProgress = Math.round(
    computedTasks.reduce((acc, t) => acc + t.progress, 0) / computedTasks.length
  );
  const totalTaskDays = computedTasks.reduce((acc, t) => acc + t.durationDays, 0);
  const weightedProgress =
    totalTaskDays > 0
      ? Math.round(
          computedTasks.reduce((acc, t) => acc + t.progress * t.durationDays, 0) / totalTaskDays
        )
      : 0;

  return {
    projectName: input.projectName.trim(),
    projectStartDate: input.projectStartDate,
    projectEffectiveStartDate: addIsoDays(input.projectStartDate, minStartOffset),
    projectFinishDate: addIsoDays(input.projectStartDate, Math.max(0, projectEndOffset - 1)),
    totalDurationDays: projectEndOffset - minStartOffset,
    totalTasks: computedTasks.length,
    completedTasks,
    overdueTasks,
    averageProgress,
    weightedProgress,
    criticalPathTaskIds: computedTasks.filter((t) => t.isCritical).map((t) => t.id),
    tasks: computedTasks
  };
}

export interface ProjectTimelineContractInput {
  projectName?: string;
  projectStartDate: string;
  taskCount: number;
  durationPerTaskDays: number;
  completedTasks?: number;
  tasks?: ProjectTaskInput[];
  referenceDate?: string;
}

function coerceTimelineInput(raw: ProjectTimelineContractInput): ProjectTimelineInput {
  if (Array.isArray(raw.tasks)) {
    return {
      projectName: raw.projectName || 'Project Timeline',
      projectStartDate: raw.projectStartDate,
      tasks: raw.tasks,
      referenceDate: raw.referenceDate
    };
  }
  const count = Math.max(1, Math.min(50, Math.trunc(Number(raw.taskCount) || 1)));
  const dur = Math.max(1, Math.trunc(Number(raw.durationPerTaskDays) || 1));
  const done = Math.max(0, Math.min(count, Math.trunc(Number(raw.completedTasks) || 0)));
  const tasks: ProjectTaskInput[] = [];
  for (let i = 0; i < count; i++) {
    const startOffset = i * dur;
    tasks.push({
      id: `task-${i + 1}`,
      name: `Phase ${i + 1}`,
      startDate:
        parseIsoCalendarDate(raw.projectStartDate) !== null
          ? addIsoDays(raw.projectStartDate, startOffset)
          : raw.projectStartDate,
      durationDays: dur,
      progress: i < done ? 100 : 0,
      dependencies: i > 0 ? [`task-${i}`] : []
    });
  }
  return {
    projectName: raw.projectName || 'Project Timeline',
    projectStartDate: raw.projectStartDate,
    tasks,
    referenceDate: raw.referenceDate
  };
}

export const PROJECT_TIMELINE_CONTRACT: CalculationContract<
  ProjectTimelineContractInput,
  ProjectTimelineResult
> = {
  id: 'project-timeline-planner',
  name: 'Project Timeline & Gantt Planner',
  category: 'planners',
  subcategoryId: 'planners-expansion-projects',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Forward/Backward Critical Path Method (CPM) Timeline Scheduling',
    formulaExpression:
      'ES_i = max(RequestedStart_i, max_{p in Pred(i)} EF_p); EF_i = ES_i + Duration_i; Slack_i = LS_i - ES_i',
    variables: [
      { symbol: 'ES_i', name: 'Earliest Start Offset', unit: 'days' },
      { symbol: 'EF_i', name: 'Earliest Finish Offset', unit: 'days' },
      { symbol: 'Slack_i', name: 'Total Float / Slack', unit: 'days' }
    ]
  },
  inputSchema: {
    fields: [
      {
        name: 'projectStartDate',
        label: 'Project Start Date',
        type: 'date',
        required: true,
        defaultValue: '2026-11-01'
      },
      {
        name: 'taskCount',
        label: 'Sequential Milestones',
        type: 'integer',
        required: true,
        defaultValue: 5,
        min: 1,
        max: 50
      },
      {
        name: 'durationPerTaskDays',
        label: 'Days per Milestone',
        type: 'integer',
        required: true,
        defaultValue: 5,
        min: 1,
        max: 365
      },
      {
        name: 'completedTasks',
        label: 'Completed Milestones',
        type: 'integer',
        required: false,
        defaultValue: 1,
        min: 0,
        max: 50
      }
    ]
  },
  validate: (inputs) => {
    const timelineInput = coerceTimelineInput(inputs);
    return validateProjectTimeline(timelineInput);
  },
  calculate: (inputs) => {
    return solveProjectTimeline(coerceTimelineInput(inputs));
  },
  formatResult: (res) => ({
    primary: {
      label: 'Project Finish Date',
      value: res.projectFinishDate,
      numericValue: res.totalDurationDays
    },
    secondary: [
      {
        label: 'Total Duration',
        value: `${res.totalDurationDays} days`,
        numericValue: res.totalDurationDays,
        unit: 'days'
      },
      {
        label: 'Weighted Progress',
        value: `${res.weightedProgress}%`,
        numericValue: res.weightedProgress,
        unit: '%'
      }
    ],
    breakdown: [
      { label: 'Project Start', value: res.projectEffectiveStartDate },
      { label: 'Critical Path Tasks', value: String(res.criticalPathTaskIds.length) },
      { label: 'Completed Tasks', value: `${res.completedTasks} / ${res.totalTasks}` },
      { label: 'Overdue Tasks', value: String(res.overdueTasks) }
    ]
  })
};
