import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH8_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Pet Age Calculator
  {
    id: 'pet-age-dog-cat-calc',
    name: 'Pet Age Calculator (Dog & Cat to Human Years)',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    formulaMeta: {
      formulaName: 'AVMA Veterinary Age Conversion',
      formulaExpression: 'Y1 = 15 human yrs; Y2 = +9 yrs; Y3+ = +4-5 yrs',
      variables: [{ symbol: 'Age', name: 'Human Equivalent Years' }]
    },
    inputSchema: {
      fields: [
        { name: 'petType', label: 'Pet Species', type: 'select', required: true, defaultValue: 'dog-medium', options: [
          { label: 'Dog - Small (Under 20 lbs)', value: 'dog-small' },
          { label: 'Dog - Medium (21 - 50 lbs)', value: 'dog-medium' },
          { label: 'Dog - Large (Over 50 lbs)', value: 'dog-large' },
          { label: 'Cat', value: 'cat' }
        ]},
        { name: 'petYears', label: 'Pet Age (Calendar Years)', type: 'number', required: true, defaultValue: 4, min: 0.5, max: 25 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { petType: string; petYears: number }) => {
      let humanYears = 0;
      const yrs = inputs.petYears;
      if (yrs <= 1) {
        humanYears = yrs * 15;
      } else if (yrs <= 2) {
        humanYears = 15 + (yrs - 1) * 9;
      } else {
        let mult = 4.5;
        if (inputs.petType === 'dog-small') mult = 4.0;
        if (inputs.petType === 'dog-large') mult = 5.5;
        humanYears = 24 + (yrs - 2) * mult;
      }
      return { humanYears: Math.round(humanYears * 10) / 10, petYears: inputs.petYears };
    },
    formatResult: (res: { humanYears: number; petYears: number }) => ({
      primary: {
        label: 'Equivalent Human Age',
        value: `${res.humanYears} human years`,
        numericValue: res.humanYears
      },
      secondary: [
        { label: 'Pet Calendar Age', value: `${res.petYears} years old` }
      ]
    })
  },

  // 2. Half-Birthday & Milestone Calculator
  {
    id: 'half-birthday-calc',
    name: 'Half-Birthday & Milestone Calculator',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    formulaMeta: {
      formulaName: 'Half Birthday Math',
      formulaExpression: 'Half Birthday = Birth Date + 6 Months (~182.5 days)',
      variables: [{ symbol: 'Date', name: 'Half Birthday Date' }]
    },
    inputSchema: {
      fields: [
        { name: 'birthMonth', label: 'Birth Month (1-12)', type: 'integer', required: true, defaultValue: 4, min: 1, max: 12 },
        { name: 'birthDay', label: 'Birth Day (1-31)', type: 'integer', required: true, defaultValue: 15, min: 1, max: 31 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { birthMonth: number; birthDay: number }) => {
      const halfMonth = ((inputs.birthMonth - 1 + 6) % 12) + 1;
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = months[halfMonth - 1];
      return { halfMonth, halfDay: inputs.birthDay, halfDateStr: `${monthName} ${inputs.birthDay}` };
    },
    formatResult: (res: { halfMonth: number; halfDay: number; halfDateStr: string }) => ({
      primary: {
        label: 'Annual Half-Birthday Date',
        value: res.halfDateStr,
        numericValue: res.halfMonth
      },
      secondary: [
        { label: 'Cycle Offset', value: 'Exactly 6 calendar months (182.5 days) from your birthday' }
      ]
    })
  },

  // 3. Corrected Gestational Age Calculator
  {
    id: 'chronological-gestational-age-calc',
    name: 'Corrected Gestational Age Calculator',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    formulaMeta: {
      formulaName: 'Pediatric Corrected Age',
      formulaExpression: 'Corrected Age = Chronological Weeks - (40 - Gestational Weeks)',
      variables: [{ symbol: 'Age', name: 'Adjusted Developmental Age' }]
    },
    inputSchema: {
      fields: [
        { name: 'chronologicalMonths', label: 'Chronological Age (Months since birth)', type: 'number', required: true, defaultValue: 6, min: 0.5, max: 36 },
        { name: 'gestationalWeeksBorn', label: 'Gestational Weeks at Birth (e.g. 32 weeks)', type: 'number', required: true, defaultValue: 32, min: 23, max: 39 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { chronologicalMonths: number; gestationalWeeksBorn: number }) => {
      const weeksPremature = 40 - inputs.gestationalWeeksBorn;
      const monthsPremature = weeksPremature / 4.348;
      const correctedMonths = Math.max(0, inputs.chronologicalMonths - monthsPremature);
      return { correctedMonths: Math.round(correctedMonths * 10) / 10, weeksPremature };
    },
    formatResult: (res: { correctedMonths: number; weeksPremature: number }) => ({
      primary: {
        label: 'Corrected Developmental Age',
        value: `${res.correctedMonths} months`,
        numericValue: res.correctedMonths
      },
      secondary: [
        { label: 'Prematurity Offset', value: `${res.weeksPremature} weeks premature` },
        { label: 'Clinical Guidance', value: 'Use corrected age for growth percentiles and developmental milestones' }
      ]
    })
  },

  // 4. Add or Subtract Days from Date Calculator
  {
    id: 'add-subtract-days-calc',
    name: 'Add or Subtract Days from Date Calculator',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    formulaMeta: {
      formulaName: 'Date Arithmetic',
      formulaExpression: 'Target Timestamp = Base Timestamp ± (Days × 86,400,000 ms)',
      variables: [{ symbol: 'Target', name: 'Computed Calendar Date' }]
    },
    inputSchema: {
      fields: [
        { name: 'daysToAdd', label: 'Number of Days to Offset', type: 'integer', required: true, defaultValue: 45, min: 1, max: 3650 },
        { name: 'direction', label: 'Operation', type: 'select', required: true, defaultValue: 'add', options: [
          { label: 'Add Days (+)', value: 'add' },
          { label: 'Subtract Days (-)', value: 'subtract' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { daysToAdd: number; direction: string }) => {
      const now = new Date();
      const mult = inputs.direction === 'add' ? 1 : -1;
      const targetTime = new Date(now.getTime() + mult * inputs.daysToAdd * 86400000);
      const dateStr = targetTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      const weeks = (inputs.daysToAdd / 7).toFixed(1);
      return { dateStr, days: inputs.daysToAdd, weeks, direction: inputs.direction };
    },
    formatResult: (res: { dateStr: string; days: number; weeks: string; direction: string }) => ({
      primary: {
        label: res.direction === 'add' ? `Date +${res.days} Days Ahead` : `Date -${res.days} Days Ago`,
        value: res.dateStr,
        numericValue: res.days
      },
      secondary: [
        { label: 'Time Span', value: `${res.days} days (~${res.weeks} weeks)` }
      ]
    })
  },

  // 5. Event Countdown & Days Until Calculator
  {
    id: 'countdown-timer-calc',
    name: 'Event Countdown & Days Until Calculator',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    formulaMeta: {
      formulaName: 'Countdown Duration',
      formulaExpression: 'Days = (Target - Now) / (1000 × 60 × 60 × 24)',
      variables: [{ symbol: 'Days', name: 'Days Remaining' }]
    },
    inputSchema: {
      fields: [
        { name: 'futureDays', label: 'Target Event Days in Future', type: 'integer', required: true, defaultValue: 100, min: 1, max: 2000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { futureDays: number }) => {
      const days = inputs.futureDays;
      const hours = days * 24;
      const minutes = hours * 60;
      const weeks = Math.floor(days / 7);
      const remDays = days % 7;
      const weekends = Math.floor(days / 7) * 2;
      return { days, hours, minutes, weeks, remDays, weekends };
    },
    formatResult: (res: { days: number; hours: number; minutes: number; weeks: number; remDays: number; weekends: number }) => ({
      primary: {
        label: 'Days Remaining',
        value: `${res.days} days (${res.weeks} wks, ${res.remDays} days)`,
        numericValue: res.days
      },
      secondary: [
        { label: 'Hours Remaining', value: `${ResultFormatter.formatInteger(res.hours)} hours` },
        { label: 'Weekend Days Included', value: `${res.weekends} weekend days` }
      ]
    })
  },

  // 6. Day of the Week Calculator
  {
    id: 'day-of-week-calc',
    name: 'Day of the Week Calculator (Zeller Algorithm)',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    formulaMeta: {
      formulaName: "Zeller's Congruence",
      formulaExpression: 'Day of Week from Year, Month, Day',
      variables: [{ symbol: 'Day', name: 'Weekday Name' }]
    },
    inputSchema: {
      fields: [
        { name: 'year', label: 'Year', type: 'integer', required: true, defaultValue: 2026, min: 1800, max: 2100 },
        { name: 'month', label: 'Month (1-12)', type: 'integer', required: true, defaultValue: 7, min: 1, max: 12 },
        { name: 'day', label: 'Day of Month (1-31)', type: 'integer', required: true, defaultValue: 4, min: 1, max: 31 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { year: number; month: number; day: number }) => {
      const d = new Date(inputs.year, inputs.month - 1, inputs.day);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekdayName = daysOfWeek[d.getDay()];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      return { weekdayName, isWeekend, formatted: `${weekdayName}, ${inputs.month}/${inputs.day}/${inputs.year}` };
    },
    formatResult: (res: { weekdayName: string; isWeekend: boolean; formatted: string }) => ({
      primary: {
        label: 'Day of the Week',
        value: res.weekdayName,
        numericValue: 1
      },
      secondary: [
        { label: 'Full Calendar Date', value: res.formatted },
        { label: 'Day Classification', value: res.isWeekend ? 'Weekend' : 'Weekday / Business Day' }
      ]
    })
  },

  // 7. Business Working Days Calculator
  {
    id: 'working-days-calc',
    name: 'Business Working Days Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    formulaMeta: {
      formulaName: 'Net Working Days',
      formulaExpression: 'Business Days = Calendar Days - Weekend Days',
      variables: [{ symbol: 'Days', name: 'Workdays' }]
    },
    inputSchema: {
      fields: [
        { name: 'totalCalendarDays', label: 'Total Calendar Days Span', type: 'integer', required: true, defaultValue: 30, min: 1, max: 365 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalCalendarDays: number }) => {
      const weeks = Math.floor(inputs.totalCalendarDays / 7);
      const remDays = inputs.totalCalendarDays % 7;
      const weekendDays = weeks * 2 + Math.min(2, Math.max(0, remDays - 5));
      const workDays = inputs.totalCalendarDays - weekendDays;
      const workHours = workDays * 8;
      return { workDays, weekendDays, workHours, totalDays: inputs.totalCalendarDays };
    },
    formatResult: (res: { workDays: number; weekendDays: number; workHours: number; totalDays: number }) => ({
      primary: {
        label: 'Net Working Days',
        value: `${res.workDays} business days`,
        numericValue: res.workDays
      },
      secondary: [
        { label: 'Standard Working Hours (8h/day)', value: `${res.workHours} hours` },
        { label: 'Weekend Days Subtracted', value: `${res.weekendDays} weekend days` }
      ]
    })
  },

  // 8. Add Business Days Deadline Calculator
  {
    id: 'add-business-days-calc',
    name: 'Add Business Days Deadline Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    formulaMeta: {
      formulaName: 'Business Days Offset',
      formulaExpression: 'Calendar Days ≈ Business Days × (7/5)',
      variables: [{ symbol: 'Deadline', name: 'Target Calendar Days' }]
    },
    inputSchema: {
      fields: [
        { name: 'businessDays', label: 'Number of Business Days (e.g. 10 or 30 days)', type: 'integer', required: true, defaultValue: 15, min: 1, max: 250 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { businessDays: number }) => {
      const fullWeeks = Math.floor(inputs.businessDays / 5);
      const remDays = inputs.businessDays % 5;
      const calendarDays = fullWeeks * 7 + remDays;
      return { calendarDays, businessDays: inputs.businessDays };
    },
    formatResult: (res: { calendarDays: number; businessDays: number }) => ({
      primary: {
        label: 'Total Calendar Days to Elapsed Deadline',
        value: `${res.calendarDays} calendar days`,
        numericValue: res.calendarDays
      },
      secondary: [
        { label: 'Net Working Days Added', value: `${res.businessDays} business days` }
      ]
    })
  },

  // 9. Billable Hours & Fee Calculator
  {
    id: 'billable-hours-calc',
    name: 'Billable Hours & Fee Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    formulaMeta: {
      formulaName: 'Billable Timesheet Invoice',
      formulaExpression: 'Total = (Hours + Minutes/60) × Hourly Rate',
      variables: [{ symbol: 'Total', name: 'Invoice Amount', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'hours', label: 'Logged Hours', type: 'integer', required: true, defaultValue: 37, min: 0 },
        { name: 'minutes', label: 'Logged Minutes', type: 'integer', required: true, defaultValue: 45, min: 0, max: 59 },
        { name: 'hourlyRate', label: 'Billing Rate ($/hr)', type: 'currency', required: true, defaultValue: 125, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { hours: number; minutes: number; hourlyRate: number }) => {
      const decimalHours = inputs.hours + inputs.minutes / 60;
      const totalFee = decimalHours * inputs.hourlyRate;
      return { decimalHours, totalFee, rate: inputs.hourlyRate };
    },
    formatResult: (res: { decimalHours: number; totalFee: number; rate: number }) => ({
      primary: {
        label: 'Total Invoiced Fee',
        value: ResultFormatter.formatCurrency(res.totalFee),
        numericValue: res.totalFee
      },
      secondary: [
        { label: 'Decimal Hours Logged', value: `${res.decimalHours.toFixed(2)} hours` },
        { label: 'Billing Rate', value: `${ResultFormatter.formatCurrency(res.rate)} / hr` }
      ]
    })
  },

  // 10. Years of Service & Work Anniversary Calculator
  {
    id: 'work-anniversary-calc',
    name: 'Years of Service & Work Anniversary Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    formulaMeta: {
      formulaName: 'Tenure Calculation',
      formulaExpression: 'Tenure Years = Months / 12',
      variables: [{ symbol: 'Years', name: 'Completed Years of Service' }]
    },
    inputSchema: {
      fields: [
        { name: 'completedMonths', label: 'Total Completed Months with Company', type: 'integer', required: true, defaultValue: 42, min: 1, max: 600 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { completedMonths: number }) => {
      const years = Math.floor(inputs.completedMonths / 12);
      const remMonths = inputs.completedMonths % 12;
      const nextMilestoneYears = Math.ceil((years + 1) / 5) * 5;
      const monthsToNextMilestone = nextMilestoneYears * 12 - inputs.completedMonths;
      return { years, remMonths, nextMilestoneYears, monthsToNextMilestone };
    },
    formatResult: (res: { years: number; remMonths: number; nextMilestoneYears: number; monthsToNextMilestone: number }) => ({
      primary: {
        label: 'Total Service Tenure',
        value: `${res.years} years, ${res.remMonths} months`,
        numericValue: res.years
      },
      secondary: [
        { label: 'Next Major Milestone', value: `${res.nextMilestoneYears}-Year Anniversary (in ${res.monthsToNextMilestone} months)` }
      ]
    })
  },

  // 11. Time Duration & Elapsed Hours Calculator
  {
    id: 'time-duration-calc',
    name: 'Time Duration & Elapsed Hours Calculator',
    category: 'datetime',
    subcategoryId: 'time-durations',
    formulaMeta: {
      formulaName: 'Elapsed Clock Time',
      formulaExpression: 'Duration = End Time - Start Time',
      variables: [{ symbol: 'Duration', name: 'Elapsed Time' }]
    },
    inputSchema: {
      fields: [
        { name: 'startHour', label: 'Start Hour (0-23)', type: 'integer', required: true, defaultValue: 9, min: 0, max: 23 },
        { name: 'startMin', label: 'Start Minute (0-59)', type: 'integer', required: true, defaultValue: 15, min: 0, max: 59 },
        { name: 'endHour', label: 'End Hour (0-23)', type: 'integer', required: true, defaultValue: 17, min: 0, max: 23 },
        { name: 'endMin', label: 'End Minute (0-59)', type: 'integer', required: true, defaultValue: 45, min: 0, max: 59 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { startHour: number; startMin: number; endHour: number; endMin: number }) => {
      let startTotal = inputs.startHour * 60 + inputs.startMin;
      let endTotal = inputs.endHour * 60 + inputs.endMin;
      if (endTotal < startTotal) {
        endTotal += 24 * 60;
      }
      const elapsedMinutes = endTotal - startTotal;
      const hours = Math.floor(elapsedMinutes / 60);
      const minutes = elapsedMinutes % 60;
      const decimalHours = elapsedMinutes / 60;
      return { hours, minutes, decimalHours, elapsedMinutes };
    },
    formatResult: (res: { hours: number; minutes: number; decimalHours: number; elapsedMinutes: number }) => ({
      primary: {
        label: 'Elapsed Time Duration',
        value: `${res.hours}h ${res.minutes}m`,
        numericValue: res.decimalHours
      },
      secondary: [
        { label: 'Decimal Hours', value: `${res.decimalHours.toFixed(2)} hours` },
        { label: 'Total Minutes', value: `${res.elapsedMinutes} minutes` }
      ]
    })
  },

  // 12. Military Time 24-Hour Calculator & Math
  {
    id: 'military-time-calc',
    name: 'Military Time 24-Hour Calculator & Math',
    category: 'datetime',
    subcategoryId: 'time-durations',
    formulaMeta: {
      formulaName: '24-Hour Military Time Addition',
      formulaExpression: 'New Time = (Start Minutes + Add Minutes) mod 1440',
      variables: [{ symbol: 'Time', name: 'Military Time' }]
    },
    inputSchema: {
      fields: [
        { name: 'militaryTime', label: 'Starting Military Time (e.g. 1430 for 14:30)', type: 'integer', required: true, defaultValue: 1430, min: 0, max: 2359 },
        { name: 'addHours', label: 'Hours to Add', type: 'integer', required: true, defaultValue: 7, min: 0, max: 48 },
        { name: 'addMinutes', label: 'Minutes to Add', type: 'integer', required: true, defaultValue: 45, min: 0, max: 59 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { militaryTime: number; addHours: number; addMinutes: number }) => {
      const curH = Math.floor(inputs.militaryTime / 100);
      const curM = inputs.militaryTime % 100;
      const totalStartMin = curH * 60 + curM;
      const totalAddMin = inputs.addHours * 60 + inputs.addMinutes;
      const finalMinOfDay = (totalStartMin + totalAddMin) % 1440;
      const finalH = Math.floor(finalMinOfDay / 60);
      const finalM = finalMinOfDay % 60;
      const milStr = `${finalH.toString().padStart(2, '0')}${finalM.toString().padStart(2, '0')} hrs`;
      const civH = finalH % 12 === 0 ? 12 : finalH % 12;
      const civAmPm = finalH >= 12 ? 'PM' : 'AM';
      const civStr = `${civH}:${finalM.toString().padStart(2, '0')} ${civAmPm}`;
      return { milStr, civStr, finalH };
    },
    formatResult: (res: { milStr: string; civStr: string; finalH: number }) => ({
      primary: {
        label: 'Resulting Military Time',
        value: res.milStr,
        numericValue: res.finalH
      },
      secondary: [
        { label: 'Standard 12-Hour Time', value: res.civStr }
      ]
    })
  },

  // 13. Weekly Employee Timecard & Overtime Calculator
  {
    id: 'time-card-payroll-calc',
    name: 'Weekly Employee Timecard & Overtime Calculator',
    category: 'datetime',
    subcategoryId: 'time-durations',
    formulaMeta: {
      formulaName: 'Weekly Payroll Overtime',
      formulaExpression: 'Gross = Regular(40) × Rate + Overtime × 1.5 × Rate',
      variables: [{ symbol: 'Gross', name: 'Weekly Pay' }]
    },
    inputSchema: {
      fields: [
        { name: 'totalHours', label: 'Total Hours Worked in Week', type: 'number', required: true, defaultValue: 48.5, min: 1, max: 100 },
        { name: 'hourlyRate', label: 'Regular Hourly Wage ($/hr)', type: 'currency', required: true, defaultValue: 24, min: 7.25 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalHours: number; hourlyRate: number }) => {
      const regularHours = Math.min(40, inputs.totalHours);
      const overtimeHours = Math.max(0, inputs.totalHours - 40);
      const regularPay = regularHours * inputs.hourlyRate;
      const overtimeRate = inputs.hourlyRate * 1.5;
      const overtimePay = overtimeHours * overtimeRate;
      const grossWeeklyPay = regularPay + overtimePay;
      return { regularHours, overtimeHours, regularPay, overtimePay, grossWeeklyPay, overtimeRate };
    },
    formatResult: (res: { regularHours: number; overtimeHours: number; regularPay: number; overtimePay: number; grossWeeklyPay: number; overtimeRate: number }) => ({
      primary: {
        label: 'Gross Weekly Pay',
        value: ResultFormatter.formatCurrency(res.grossWeeklyPay),
        numericValue: res.grossWeeklyPay
      },
      secondary: [
        { label: 'Regular Pay (40h max)', value: ResultFormatter.formatCurrency(res.regularPay) },
        { label: `Overtime Pay (${res.overtimeHours.toFixed(1)}h at ${ResultFormatter.formatCurrency(res.overtimeRate)}/hr)`, value: ResultFormatter.formatCurrency(res.overtimePay) }
      ]
    })
  },

  // 14. 90-Minute Sleep Cycle Alarm Calculator
  {
    id: 'sleep-cycle-calc',
    name: '90-Minute Sleep Cycle Alarm Calculator',
    category: 'datetime',
    subcategoryId: 'time-durations',
    formulaMeta: {
      formulaName: 'Circadian Sleep Cycle Multiplier',
      formulaExpression: 'Wake Times = Bedtime + (N × 90 min) + 15 min latency',
      variables: [{ symbol: 'Times', name: 'Optimal Wake Times' }]
    },
    inputSchema: {
      fields: [
        { name: 'sleepHour', label: 'Bedtime Hour (0-23, e.g. 23 for 11 PM)', type: 'integer', required: true, defaultValue: 23, min: 0, max: 23 },
        { name: 'sleepMin', label: 'Bedtime Minute (0-59)', type: 'integer', required: true, defaultValue: 0, min: 0, max: 59 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { sleepHour: number; sleepMin: number }) => {
      const baseMin = inputs.sleepHour * 60 + inputs.sleepMin + 15;
      const getWake = (cycles: number) => {
        const total = (baseMin + cycles * 90) % 1440;
        const h = Math.floor(total / 60);
        const m = total % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
      };
      const c5 = getWake(5);
      const c6 = getWake(6);
      const c4 = getWake(4);
      return { c5, c6, c4 };
    },
    formatResult: (res: { c5: string; c6: string; c4: string }) => ({
      primary: {
        label: 'Optimal Wake-Up Time (5 Cycles / 7.5 hrs)',
        value: res.c5,
        numericValue: 5
      },
      secondary: [
        { label: 'Long Rest (6 Cycles / 9 hrs)', value: res.c6 },
        { label: 'Minimum Rest (4 Cycles / 6 hrs)', value: res.c4 }
      ]
    })
  }
];
