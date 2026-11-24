/**
 * Automated Test Suite for Date Difference Calculator
 * Validates leap-year transitions (Feb 29th) and month-end boundary calculations.
 */

export interface DateDiffTestCase {
  name: string;
  startDate: string;
  endDate: string;
  expectedDays: number;
  expectedYears: number;
  expectedMonths: number;
  expectedDaysRemainder: number;
}

export const DATE_DIFF_TEST_CASES: DateDiffTestCase[] = [
  {
    name: 'Leap Year Transition (Feb 28 to Mar 1, 2024)',
    startDate: '2024-02-28',
    endDate: '2024-03-01',
    expectedDays: 2,
    expectedYears: 0,
    expectedMonths: 0,
    expectedDaysRemainder: 2
  },
  {
    name: 'Leap Year Exact Day (Feb 29, 2024 to Mar 1, 2024)',
    startDate: '2024-02-29',
    endDate: '2024-03-01',
    expectedDays: 1,
    expectedYears: 0,
    expectedMonths: 0,
    expectedDaysRemainder: 1
  },
  {
    name: 'Non-Leap Year Transition (Feb 28 to Mar 1, 2023)',
    startDate: '2023-02-28',
    endDate: '2023-03-01',
    expectedDays: 1,
    expectedYears: 0,
    expectedMonths: 0,
    expectedDaysRemainder: 1
  },
  {
    name: 'Full Leap Year Duration (2024-01-01 to 2025-01-01)',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    expectedDays: 366,
    expectedYears: 1,
    expectedMonths: 0,
    expectedDaysRemainder: 0
  },
  {
    name: 'Month-End Boundary (Jan 31 to Feb 28, 2023)',
    startDate: '2023-01-31',
    endDate: '2023-02-28',
    expectedDays: 28,
    expectedYears: 0,
    expectedMonths: 0,
    expectedDaysRemainder: 28
  },
  {
    name: 'Month-End Boundary (Jan 31 to Mar 31)',
    startDate: '2026-01-31',
    endDate: '2026-03-31',
    expectedDays: 59,
    expectedYears: 0,
    expectedMonths: 2,
    expectedDaysRemainder: 0
  },
  {
    name: 'Year-End Boundary (Dec 31, 2026 to Jan 1, 2027)',
    startDate: '2026-12-31',
    endDate: '2027-01-01',
    expectedDays: 1,
    expectedYears: 0,
    expectedMonths: 0,
    expectedDaysRemainder: 1
  }
];

export function calculateDateDiff(startDateStr: string, endDateStr: string) {
  const d1 = new Date(startDateStr);
  const d2 = new Date(endDateStr);
  const start = d1 <= d2 ? d1 : d2;
  const end = d1 <= d2 ? d2 : d1;

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonthDate.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { totalDays, years, months, days };
}

export function runDateDifferenceTestSuite() {
  const results = DATE_DIFF_TEST_CASES.map(tc => {
    const res = calculateDateDiff(tc.startDate, tc.endDate);
    const passed =
      res.totalDays === tc.expectedDays &&
      res.years === tc.expectedYears &&
      res.months === tc.expectedMonths &&
      res.days === tc.expectedDaysRemainder;

    return {
      testName: tc.name,
      passed,
      expected: { days: tc.expectedDays, y: tc.expectedYears, m: tc.expectedMonths, d: tc.expectedDaysRemainder },
      actual: { days: res.totalDays, y: res.years, m: res.months, d: res.days }
    };
  });

  const allPassed = results.every(r => r.passed);
  return { allPassed, results };
}
