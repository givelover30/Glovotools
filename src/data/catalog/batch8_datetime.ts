import { CalculatorMeta } from '../../types.ts';

export const BATCH8_METADATA: CalculatorMeta[] = [
  // ==========================================
  // DATE & TIME CALCULATORS (14 new, target 16 total with age-calculator & date-difference)
  // ==========================================

  // Subcategory: chronological-age (3)
  {
    id: 'pet-age-dog-cat-calc',
    name: 'Pet Age Calculator (Dog & Cat to Human Years)',
    shortDesc: 'Convert canine and feline physiological age into exact equivalent human years',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    tags: ['datetime', 'pet-age', 'dog-years', 'cat-years', 'animal-age'],
    formula: 'Year 1 = 15 human yrs; Year 2 = 9 human yrs; Year 3+ = +4-5 yrs/yr',
    isPopular: true,
    iconName: 'Heart',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'half-birthday-calc',
    name: 'Half-Birthday & Milestone Calculator',
    shortDesc: 'Calculate your exact half-birthday date (6 calendar months later) and planetary age',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    tags: ['datetime', 'half-birthday', 'milestones', 'birthday-math'],
    formula: 'Half Birthday = Birth Date + 6 Months',
    isPopular: false,
    iconName: 'Gift',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'chronological-gestational-age-calc',
    name: 'Corrected Gestational Age Calculator',
    shortDesc: 'Calculate pediatric developmental corrected age for premature infant development',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    tags: ['datetime', 'corrected-age', 'gestational-age', 'preemie', 'pediatric'],
    formula: 'Corrected Age = Chronological Age - (40 weeks - Gestational Age)',
    isPopular: false,
    iconName: 'Smile',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },

  // Subcategory: date-math-differences (3)
  {
    id: 'add-subtract-days-calc',
    name: 'Add or Subtract Days from Date Calculator',
    shortDesc: 'Compute forward or backward calendar date by adding or subtracting calendar days/weeks',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    tags: ['datetime', 'add-days', 'subtract-days', 'calendar-date', 'future-date'],
    formula: 'Target Date = Start Date ± N Days',
    isPopular: true,
    iconName: 'Calendar',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'countdown-timer-calc',
    name: 'Event Countdown & Days Until Calculator',
    shortDesc: 'Calculate exact days, hours, minutes, and weekends remaining until a future date',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    tags: ['datetime', 'countdown', 'days-until', 'event-timer', 'calendar-countdown'],
    formula: 'Days Until = (Target Timestamp - Current Timestamp) / 86400000',
    isPopular: true,
    iconName: 'Clock',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'day-of-week-calc',
    name: 'Day of the Week Calculator (Zeller Algorithm)',
    shortDesc: 'Determine the exact weekday (Monday-Sunday) for any historical or future calendar date',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    tags: ['datetime', 'day-of-week', 'weekday-finder', 'zeller-congruence', 'calendar'],
    formula: "Zeller's Congruence algorithm: h = (q + 13(m+1)/5 + K + K/4 + J/4 - 2J) mod 7",
    isPopular: false,
    iconName: 'Sun',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },

  // Subcategory: business-working-days (4)
  {
    id: 'working-days-calc',
    name: 'Business Working Days Calculator',
    shortDesc: 'Calculate net workdays between dates excluding Saturday/Sunday weekends',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    tags: ['datetime', 'working-days', 'business-days', 'workdays', 'timesheet'],
    formula: 'Business Days = Total Days - (Weekends + Holidays)',
    isPopular: true,
    iconName: 'Briefcase',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'add-business-days-calc',
    name: 'Add Business Days Deadline Calculator',
    shortDesc: 'Calculate contractual legal deadline dates by adding N business working days',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    tags: ['datetime', 'add-business-days', 'deadline-calculator', 'contract-days'],
    formula: 'Skip weekends until N business days elapse',
    isPopular: true,
    iconName: 'CalendarCheck',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'billable-hours-calc',
    name: 'Billable Hours & Fee Calculator',
    shortDesc: 'Calculate total decimal billable hours worked and gross client invoicing charges',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    tags: ['datetime', 'billable-hours', 'invoicing', 'consulting-fees', 'timesheet'],
    formula: 'Total Fee = (Hours + Minutes/60) × Hourly Rate',
    isPopular: true,
    iconName: 'DollarSign',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'work-anniversary-calc',
    name: 'Years of Service & Work Anniversary Calculator',
    shortDesc: 'Calculate exact tenure in years, months, and days for employment milestones',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    tags: ['datetime', 'tenure', 'work-anniversary', 'years-of-service', 'employment-milestone'],
    formula: 'Tenure = Current Date - Hire Date',
    isPopular: false,
    iconName: 'Award',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },

  // Subcategory: time-durations (4)
  {
    id: 'time-duration-calc',
    name: 'Time Duration & Elapsed Hours Calculator',
    shortDesc: 'Calculate hours, minutes, and seconds between two clock times across midnight',
    category: 'datetime',
    subcategoryId: 'time-durations',
    tags: ['datetime', 'time-duration', 'elapsed-time', 'hours-minutes', 'clock-math'],
    formula: 'Duration = End Time - Start Time (adjust +24h if crossing midnight)',
    isPopular: true,
    iconName: 'Watch',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'military-time-calc',
    name: 'Military Time 24-Hour Calculator & Math',
    shortDesc: 'Add or subtract hours and minutes in 24-hour military format (0000 to 2359)',
    category: 'datetime',
    subcategoryId: 'time-durations',
    tags: ['datetime', 'military-time', '24-hour-time', 'clock-math', 'time-add'],
    formula: 'Military 24h = (Start Minutes + Added Minutes) % 1440',
    isPopular: false,
    iconName: 'Compass',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'time-card-payroll-calc',
    name: 'Weekly Employee Timecard & Overtime Calculator',
    shortDesc: 'Sum daily clock-in/out hours, lunch breaks, regular 40h pay, and 1.5x overtime',
    category: 'datetime',
    subcategoryId: 'time-durations',
    tags: ['datetime', 'timecard', 'payroll', 'overtime-calculator', 'timesheet'],
    formula: 'Overtime = Max(0, Total Hours - 40); Gross = (Regular × Rate) + (OT × 1.5 × Rate)',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'sleep-cycle-calc',
    name: '90-Minute Sleep Cycle Alarm Calculator',
    shortDesc: 'Calculate optimal wake-up or bedtimes matching natural 90-minute REM sleep cycles',
    category: 'datetime',
    subcategoryId: 'time-durations',
    tags: ['datetime', 'sleep-cycle', 'rem-sleep', 'wake-up-time', 'circadian-rhythm'],
    formula: 'Cycle Times = Bedtime + (N × 90 min) + 15 min latency',
    isPopular: true,
    iconName: 'Moon',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  }
];
