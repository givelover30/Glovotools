import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export type WorkoutSplitId = 'ppl' | 'upper-lower' | 'full-body' | 'custom';

export interface WorkoutExerciseInput {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight?: number | null;
  completed: boolean;
}

export interface WorkoutDayInput {
  dayKey: string;
  dayLabel: string;
  focus: string;
  isRestDay: boolean;
  exercises: WorkoutExerciseInput[];
  notes?: string;
}

export interface FitnessWorkoutPlanInput {
  planName: string;
  split: WorkoutSplitId;
  weightUnit: 'kg' | 'lb';
  days: WorkoutDayInput[];
}

export interface FitnessWorkoutPlanResult {
  planName: string;
  split: WorkoutSplitId;
  trainingDays: number;
  restDays: number;
  totalExercises: number;
  completedExercises: number;
  completionPct: number;
  totalWeeklySets: number;
  completedWeeklySets: number;
  totalTonnageVolume: number;
  setsPerMuscleGroup: Record<string, number>;
  daysSummary: Array<{
    dayKey: string;
    dayLabel: string;
    focus: string;
    isRestDay: boolean;
    exerciseCount: number;
    completedCount: number;
    totalSets: number;
    muscleGroups: string[];
  }>;
}

export const MUSCLE_GROUP_OPTIONS = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Biceps',
  'Triceps',
  'Core',
  'Calves',
  'Cardio / Conditioning'
];

export function buildSplitPresetDays(split: WorkoutSplitId): WorkoutDayInput[] {
  if (split === 'ppl') {
    return [
      {
        dayKey: 'mon',
        dayLabel: 'Monday',
        focus: 'Push (Chest / Shoulders / Triceps)',
        isRestDay: false,
        exercises: [
          { id: 'ppl-1', name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '6-8', weight: 60, completed: false },
          { id: 'ppl-2', name: 'Overhead Dumbbell Press', muscleGroup: 'Shoulders', sets: 3, reps: '8-10', weight: 18, completed: false },
          { id: 'ppl-3', name: 'Cable Triceps Pushdown', muscleGroup: 'Triceps', sets: 3, reps: '10-12', weight: 25, completed: false }
        ],
        notes: ''
      },
      {
        dayKey: 'tue',
        dayLabel: 'Tuesday',
        focus: 'Pull (Back / Biceps)',
        isRestDay: false,
        exercises: [
          { id: 'ppl-4', name: 'Lat Pulldown or Pull-Ups', muscleGroup: 'Back', sets: 4, reps: '8-10', weight: 55, completed: false },
          { id: 'ppl-5', name: 'Seated Cable Row', muscleGroup: 'Back', sets: 3, reps: '10-12', weight: 50, completed: false },
          { id: 'ppl-6', name: 'Dumbbell Hammer Curl', muscleGroup: 'Biceps', sets: 3, reps: '10-12', weight: 14, completed: false }
        ],
        notes: ''
      },
      {
        dayKey: 'wed',
        dayLabel: 'Wednesday',
        focus: 'Legs (Quads / Hamstrings / Calves)',
        isRestDay: false,
        exercises: [
          { id: 'ppl-7', name: 'Back Squat or Goblet Squat', muscleGroup: 'Quads', sets: 4, reps: '6-8', weight: 80, completed: false },
          { id: 'ppl-8', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', sets: 3, reps: '8-10', weight: 70, completed: false },
          { id: 'ppl-9', name: 'Standing Calf Raise', muscleGroup: 'Calves', sets: 3, reps: '12-15', weight: 40, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'thu', dayLabel: 'Thursday', focus: 'Active Recovery / Rest', isRestDay: true, exercises: [], notes: 'Light walking or mobility work' },
      {
        dayKey: 'fri',
        dayLabel: 'Friday',
        focus: 'Push B (Volume)',
        isRestDay: false,
        exercises: [
          { id: 'ppl-10', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '8-10', weight: 24, completed: false },
          { id: 'ppl-11', name: 'Lateral Raises', muscleGroup: 'Shoulders', sets: 4, reps: '12-15', weight: 10, completed: false }
        ],
        notes: ''
      },
      {
        dayKey: 'sat',
        dayLabel: 'Saturday',
        focus: 'Pull & Core',
        isRestDay: false,
        exercises: [
          { id: 'ppl-12', name: 'Chest-Supported Row', muscleGroup: 'Back', sets: 4, reps: '8-10', weight: 45, completed: false },
          { id: 'ppl-13', name: 'Hanging Knee Raises', muscleGroup: 'Core', sets: 3, reps: '12-15', weight: null, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'sun', dayLabel: 'Sunday', focus: 'Rest Day', isRestDay: true, exercises: [], notes: '' }
    ];
  }

  if (split === 'upper-lower') {
    return [
      {
        dayKey: 'mon',
        dayLabel: 'Monday',
        focus: 'Upper Body A',
        isRestDay: false,
        exercises: [
          { id: 'ul-1', name: 'Dumbbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '8-10', weight: 25, completed: false },
          { id: 'ul-2', name: 'Bent-Over Barbell Row', muscleGroup: 'Back', sets: 4, reps: '8-10', weight: 60, completed: false },
          { id: 'ul-3', name: 'Lateral Raises', muscleGroup: 'Shoulders', sets: 3, reps: '12-15', weight: 10, completed: false }
        ],
        notes: ''
      },
      {
        dayKey: 'tue',
        dayLabel: 'Tuesday',
        focus: 'Lower Body A',
        isRestDay: false,
        exercises: [
          { id: 'ul-4', name: 'Leg Press or Squat', muscleGroup: 'Quads', sets: 4, reps: '8-10', weight: 100, completed: false },
          { id: 'ul-5', name: 'Seated Leg Curl', muscleGroup: 'Hamstrings', sets: 3, reps: '10-12', weight: 45, completed: false },
          { id: 'ul-6', name: 'Plank Holds', muscleGroup: 'Core', sets: 3, reps: '45s', weight: null, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'wed', dayLabel: 'Wednesday', focus: 'Rest & Recovery', isRestDay: true, exercises: [], notes: '' },
      {
        dayKey: 'thu',
        dayLabel: 'Thursday',
        focus: 'Upper Body B',
        isRestDay: false,
        exercises: [
          { id: 'ul-7', name: 'Overhead Press', muscleGroup: 'Shoulders', sets: 3, reps: '8-10', weight: 40, completed: false },
          { id: 'ul-8', name: 'Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10-12', weight: 55, completed: false },
          { id: 'ul-9', name: 'Triceps Overhead Extension', muscleGroup: 'Triceps', sets: 3, reps: '12', weight: 20, completed: false }
        ],
        notes: ''
      },
      {
        dayKey: 'fri',
        dayLabel: 'Friday',
        focus: 'Lower Body B',
        isRestDay: false,
        exercises: [
          { id: 'ul-10', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', sets: 4, reps: '8-10', weight: 70, completed: false },
          { id: 'ul-11', name: 'Walking Lunges', muscleGroup: 'Glutes', sets: 3, reps: '10/leg', weight: 15, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'sat', dayLabel: 'Saturday', focus: 'Optional Conditioning / Walk', isRestDay: true, exercises: [], notes: '' },
      { dayKey: 'sun', dayLabel: 'Sunday', focus: 'Rest Day', isRestDay: true, exercises: [], notes: '' }
    ];
  }

  if (split === 'full-body') {
    return [
      {
        dayKey: 'mon',
        dayLabel: 'Monday',
        focus: 'Full Body A',
        isRestDay: false,
        exercises: [
          { id: 'fb-1', name: 'Goblet Squat', muscleGroup: 'Quads', sets: 3, reps: '10', weight: 24, completed: false },
          { id: 'fb-2', name: 'Push-Ups or Bench Press', muscleGroup: 'Chest', sets: 3, reps: '10-12', weight: 50, completed: false },
          { id: 'fb-3', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 3, reps: '10', weight: 22, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'tue', dayLabel: 'Tuesday', focus: 'Rest Day', isRestDay: true, exercises: [], notes: '' },
      {
        dayKey: 'wed',
        dayLabel: 'Wednesday',
        focus: 'Full Body B',
        isRestDay: false,
        exercises: [
          { id: 'fb-4', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', sets: 3, reps: '8-10', weight: 65, completed: false },
          { id: 'fb-5', name: 'Overhead Dumbbell Press', muscleGroup: 'Shoulders', sets: 3, reps: '10', weight: 16, completed: false },
          { id: 'fb-6', name: 'Dead Bug Core Series', muscleGroup: 'Core', sets: 3, reps: '12', weight: null, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'thu', dayLabel: 'Thursday', focus: 'Rest Day', isRestDay: true, exercises: [], notes: '' },
      {
        dayKey: 'fri',
        dayLabel: 'Friday',
        focus: 'Full Body C',
        isRestDay: false,
        exercises: [
          { id: 'fb-7', name: 'Split Squat', muscleGroup: 'Glutes', sets: 3, reps: '10/leg', weight: 14, completed: false },
          { id: 'fb-8', name: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10-12', weight: 50, completed: false },
          { id: 'fb-9', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '10', weight: 20, completed: false }
        ],
        notes: ''
      },
      { dayKey: 'sat', dayLabel: 'Saturday', focus: 'Active Recovery', isRestDay: true, exercises: [], notes: '' },
      { dayKey: 'sun', dayLabel: 'Sunday', focus: 'Rest Day', isRestDay: true, exercises: [], notes: '' }
    ];
  }

  return [
    { dayKey: 'mon', dayLabel: 'Monday', focus: 'Day 1', isRestDay: false, exercises: [], notes: '' },
    { dayKey: 'tue', dayLabel: 'Tuesday', focus: 'Day 2', isRestDay: true, exercises: [], notes: '' },
    { dayKey: 'wed', dayLabel: 'Wednesday', focus: 'Day 3', isRestDay: false, exercises: [], notes: '' },
    { dayKey: 'thu', dayLabel: 'Thursday', focus: 'Day 4', isRestDay: true, exercises: [], notes: '' },
    { dayKey: 'fri', dayLabel: 'Friday', focus: 'Day 5', isRestDay: false, exercises: [], notes: '' },
    { dayKey: 'sat', dayLabel: 'Saturday', focus: 'Day 6', isRestDay: true, exercises: [], notes: '' },
    { dayKey: 'sun', dayLabel: 'Sunday', focus: 'Day 7', isRestDay: true, exercises: [], notes: '' }
  ];
}

function parseLeadingReps(repsStr: string): number {
  const m = String(repsStr).match(/\d+/);
  return m ? Number(m[0]) : 0;
}

export function validateFitnessWorkoutInput(input: FitnessWorkoutPlanInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!Array.isArray(input.days) || input.days.length === 0) {
    errors.push({
      field: 'days',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Weekly workout schedule days are required.'
    });
    return errors;
  }

  for (const day of input.days) {
    for (const ex of day.exercises) {
      if (!ex.name || ex.name.trim() === '') {
        errors.push({
          field: 'exercises',
          code: 'REQUIRED_FIELD_MISSING',
          message: `An exercise in ${day.dayLabel} is missing a name.`
        });
      }
      if (!Number.isFinite(ex.sets) || ex.sets < 1 || !Number.isInteger(ex.sets)) {
        errors.push({
          field: 'sets',
          code: 'INTEGER_REQUIRED',
          message: `Exercise "${ex.name || ex.id}" sets must be a whole number >= 1.`,
          invalidValue: ex.sets
        });
      }
      if (ex.weight !== undefined && ex.weight !== null && (!Number.isFinite(ex.weight) || ex.weight < 0)) {
        errors.push({
          field: 'weight',
          code: 'NON_NEGATIVE_REQUIRED',
          message: `Exercise "${ex.name || ex.id}" weight cannot be negative.`,
          invalidValue: ex.weight
        });
      }
    }
  }
  return errors;
}

export function analyzeFitnessWorkoutPlan(input: FitnessWorkoutPlanInput): FitnessWorkoutPlanResult {
  const errors = validateFitnessWorkoutInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  let trainingDays = 0;
  let restDays = 0;
  let totalExercises = 0;
  let completedExercises = 0;
  let totalWeeklySets = 0;
  let completedWeeklySets = 0;
  let totalTonnageVolume = 0;
  const setsPerMuscleGroup: Record<string, number> = {};

  const daysSummary = input.days.map((day) => {
    if (day.isRestDay) {
      restDays++;
    } else {
      trainingDays++;
    }

    const activeExercises = day.isRestDay ? [] : day.exercises;
    let daySets = 0;
    let dayCompleted = 0;
    const muscles = new Set<string>();

    for (const ex of activeExercises) {
      totalExercises++;
      totalWeeklySets += ex.sets;
      daySets += ex.sets;
      const mg = ex.muscleGroup.trim() || 'General';
      muscles.add(mg);
      setsPerMuscleGroup[mg] = (setsPerMuscleGroup[mg] ?? 0) + ex.sets;

      if (ex.completed) {
        completedExercises++;
        completedWeeklySets += ex.sets;
        dayCompleted++;
      }

      if (ex.weight && ex.weight > 0) {
        const repNum = parseLeadingReps(ex.reps);
        totalTonnageVolume += ex.sets * Math.max(1, repNum) * ex.weight;
      }
    }

    return {
      dayKey: day.dayKey,
      dayLabel: day.dayLabel,
      focus: day.focus,
      isRestDay: day.isRestDay,
      exerciseCount: activeExercises.length,
      completedCount: dayCompleted,
      totalSets: daySets,
      muscleGroups: Array.from(muscles)
    };
  });

  const completionPct =
    totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return {
    planName: input.planName.trim() || 'Weekly Training Split',
    split: input.split,
    trainingDays,
    restDays,
    totalExercises,
    completedExercises,
    completionPct,
    totalWeeklySets,
    completedWeeklySets,
    totalTonnageVolume: PrecisionEngine.roundTo(totalTonnageVolume, 1),
    setsPerMuscleGroup,
    daysSummary
  };
}

export interface FitnessContractInput {
  split: WorkoutSplitId;
  weightUnit?: 'kg' | 'lb';
  days?: WorkoutDayInput[];
}

function coerceFitnessContractInput(raw: FitnessContractInput): FitnessWorkoutPlanInput {
  const split = raw.split || 'ppl';
  return {
    planName: `Weekly ${split.toUpperCase()} Routine`,
    split,
    weightUnit: raw.weightUnit === 'lb' ? 'lb' : 'kg',
    days: Array.isArray(raw.days) ? raw.days : buildSplitPresetDays(split)
  };
}

export const FITNESS_WORKOUT_PLANNER_CONTRACT: CalculationContract<
  FitnessContractInput,
  FitnessWorkoutPlanResult
> = {
  id: 'fitness-workout-planner',
  name: 'Weekly Fitness Routine & Split Planner',
  category: 'planners',
  subcategoryId: 'p12-plan',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Weekly Training Split Volume, Muscle Frequency & Recovery Balance',
    formulaExpression:
      'WeeklySets = sum(Sets_e); MuscleVolume_m = sum_{e in m} Sets_e; RecoveryDays = 7 - TrainingDays',
    variables: [
      { symbol: 'WeeklySets', name: 'Total Planned Weekly Sets', unit: 'sets' },
      { symbol: 'MuscleVolume_m', name: 'Sets per Muscle Group', unit: 'sets' },
      { symbol: 'RecoveryDays', name: 'Scheduled Rest Days', unit: 'days' }
    ]
  },
  inputSchema: {
    fields: [
      {
        name: 'split',
        label: 'Training Split Template',
        type: 'select',
        required: true,
        defaultValue: 'ppl',
        options: [
          { label: 'Push / Pull / Legs (5 days)', value: 'ppl' },
          { label: 'Upper / Lower (4 days)', value: 'upper-lower' },
          { label: 'Full Body (3 days)', value: 'full-body' }
        ]
      },
      {
        name: 'weightUnit',
        label: 'Load Unit',
        type: 'select',
        required: false,
        defaultValue: 'kg',
        options: [
          { label: 'Kilograms (kg)', value: 'kg' },
          { label: 'Pounds (lb)', value: 'lb' }
        ]
      }
    ]
  },
  validate: (inputs) => validateFitnessWorkoutInput(coerceFitnessContractInput(inputs)),
  calculate: (inputs) => analyzeFitnessWorkoutPlan(coerceFitnessContractInput(inputs)),
  formatResult: (res) => ({
    primary: {
      label: 'Weekly Planned Training Volume',
      value: `${res.totalWeeklySets} sets`,
      numericValue: res.totalWeeklySets,
      unit: 'sets'
    },
    secondary: [
      {
        label: 'Training vs. Rest Days',
        value: `${res.trainingDays} active / ${res.restDays} rest`,
        numericValue: res.trainingDays
      },
      {
        label: 'Weekly Completion',
        value: `${res.completionPct}%`,
        numericValue: res.completionPct,
        unit: '%'
      }
    ],
    breakdown: [
      { label: 'Total Exercises', value: String(res.totalExercises) },
      ...Object.entries(res.setsPerMuscleGroup).map(([muscle, sets]) => ({
        label: `${muscle} Sets`,
        value: `${sets} sets`
      }))
    ]
  })
};
