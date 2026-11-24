import { useId, useState } from 'react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  currentAge: '35',
  retireAge: '65',
  currentBalance: '45000',
  currentSalary: '80000',
  contributionPct: '6',
  employerMatchPct: '100',
  employerMatchLimit: '5',
  salaryIncreasePct: '2.5',
  expectedReturn: '7',
  inflationRate: '2.5',
  frequency: '12' // monthly
};

interface ScheduleRow {
  year: number;
  age: number;
  salary: number;
  employeeContrib: number;
  employerMatch: number;
  totalContrib: number;
  investmentGrowth: number;
  endingBalance: number;
}

export default function RetirementPlanningCalculator() {
  const { currency, formatCurrency: fmtCurrency } = useCurrency();

  const [currentAgeStr, setCurrentAgeStr] = useState(DEFAULTS.currentAge);
  const [retireAgeStr, setRetireAgeStr] = useState(DEFAULTS.retireAge);
  const [balanceStr, setBalanceStr] = useState(DEFAULTS.currentBalance);
  const [salaryStr, setSalaryStr] = useState(DEFAULTS.currentSalary);
  const [contribPctStr, setContribPctStr] = useState(DEFAULTS.contributionPct);
  const [matchPctStr, setMatchPctStr] = useState(DEFAULTS.employerMatchPct);
  const [matchLimitStr, setMatchLimitStr] = useState(DEFAULTS.employerMatchLimit);
  const [salaryIncStr, setSalaryIncStr] = useState(DEFAULTS.salaryIncreasePct);
  const [returnStr, setReturnStr] = useState(DEFAULTS.expectedReturn);
  const [inflationStr, setInflationStr] = useState(DEFAULTS.inflationRate);
  const [frequency, setFrequency] = useState<number>(Number(DEFAULTS.frequency));

  const ageId = useId();
  const retireAgeId = useId();
  const balanceId = useId();
  const salaryId = useId();
  const contribId = useId();
  const matchPctId = useId();
  const matchLimitId = useId();
  const salaryIncId = useId();
  const returnId = useId();
  const inflationId = useId();
  const freqId = useId();

  const handleReset = () => {
    setCurrentAgeStr(DEFAULTS.currentAge);
    setRetireAgeStr(DEFAULTS.retireAge);
    setBalanceStr(DEFAULTS.currentBalance);
    setSalaryStr(DEFAULTS.currentSalary);
    setContribPctStr(DEFAULTS.contributionPct);
    setMatchPctStr(DEFAULTS.employerMatchPct);
    setMatchLimitStr(DEFAULTS.employerMatchLimit);
    setSalaryIncStr(DEFAULTS.salaryIncreasePct);
    setReturnStr(DEFAULTS.expectedReturn);
    setInflationStr(DEFAULTS.inflationRate);
    setFrequency(Number(DEFAULTS.frequency));
  };

  const handleClear = () => {
    setCurrentAgeStr('');
    setRetireAgeStr('');
    setBalanceStr('');
    setSalaryStr('');
    setContribPctStr('');
    setMatchPctStr('');
    setMatchLimitStr('');
    setSalaryIncStr('');
    setReturnStr('');
    setInflationStr('');
  };

  const isEmpty =
    currentAgeStr.trim() === '' ||
    retireAgeStr.trim() === '' ||
    balanceStr.trim() === '' ||
    salaryStr.trim() === '' ||
    contribPctStr.trim() === '' ||
    matchPctStr.trim() === '' ||
    matchLimitStr.trim() === '' ||
    salaryIncStr.trim() === '' ||
    returnStr.trim() === '' ||
    inflationStr.trim() === '';

  const errors: Record<string, string> = {};
  const currentAge = Number(currentAgeStr);
  const retireAge = Number(retireAgeStr);
  const currentBalance = Number(balanceStr);
  const currentSalary = Number(salaryStr);
  const contributionPct = Number(contribPctStr);
  const employerMatchPct = Number(matchPctStr);
  const employerMatchLimit = Number(matchLimitStr);
  const salaryIncreasePct = Number(salaryIncStr);
  const expectedReturn = Number(returnStr);
  const inflationRate = Number(inflationStr);

  const yearsUntilRetire = Math.max(0, retireAge - currentAge);

  if (!isEmpty) {
    if (!Number.isFinite(currentAge) || currentAge < 16 || currentAge > 90) {
      errors.currentAge = 'Current age must be between 16 and 90.';
    }
    if (!Number.isFinite(retireAge) || retireAge <= currentAge || retireAge > 100) {
      errors.retireAge = 'Retirement age must be greater than current age and up to 100.';
    }
    if (!Number.isFinite(currentBalance) || currentBalance < 0) {
      errors.currentBalance = 'Current 401(k) balance cannot be negative.';
    }
    if (!Number.isFinite(currentSalary) || currentSalary < 0) {
      errors.currentSalary = 'Current salary cannot be negative.';
    }
    if (!Number.isFinite(contributionPct) || contributionPct < 0 || contributionPct > 100) {
      errors.contributionPct = 'Contribution rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(employerMatchPct) || employerMatchPct < 0 || employerMatchPct > 500) {
      errors.employerMatchPct = 'Employer match rate must be between 0% and 500%.';
    }
    if (!Number.isFinite(employerMatchLimit) || employerMatchLimit < 0 || employerMatchLimit > 100) {
      errors.employerMatchLimit = 'Match limit must be between 0% and 100%.';
    }
    if (!Number.isFinite(salaryIncreasePct) || salaryIncreasePct < 0 || salaryIncreasePct > 25) {
      errors.salaryIncreasePct = 'Annual salary increase must be between 0% and 25%.';
    }
    if (!Number.isFinite(expectedReturn) || expectedReturn < 0 || expectedReturn > 30) {
      errors.expectedReturn = 'Expected annual return must be between 0% and 30%.';
    }
    if (!Number.isFinite(inflationRate) || inflationRate < 0 || inflationRate > 20) {
      errors.inflationRate = 'Inflation rate must be between 0% and 20%.';
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  let projectedBalance = 0;
  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;
  let totalInvestmentGrowth = 0;
  let totalContributions = 0;
  let inflationAdjustedBalance = 0;
  let finalSalary = currentSalary;
  let monthlyEmployeeContribution = 0;
  let monthlyEmployerContribution = 0;
  const schedule: ScheduleRow[] = [];

  if (!isEmpty && !hasErrors) {
    let balance = currentBalance;
    let salary = currentSalary;
    const periodsPerYear = frequency;
    const rAnnual = expectedReturn / 100;
    const rPeriod = rAnnual / periodsPerYear;
    const inflationAnnual = inflationRate / 100;

    const periods = yearsUntilRetire * periodsPerYear;

    let yearEmployeeContrib = 0;
    let yearEmployerContrib = 0;
    let yearInvestmentGrowth = 0;

    for (let p = 1; p <= periods; p++) {
      const currentYearNum = Math.floor((p - 1) / periodsPerYear) + 1;
      const isNewYearStart = (p - 1) % periodsPerYear === 0;

      if (isNewYearStart && currentYearNum > 1) {
        salary = salary * (1 + salaryIncreasePct / 100);
      }

      const periodSalary = salary / periodsPerYear;
      const empContrib = periodSalary * (contributionPct / 100);

      const effectiveMatchPct = Math.min(contributionPct, employerMatchLimit) / 100;
      const matchRateDecimal = employerMatchPct / 100;
      const employerContrib = periodSalary * effectiveMatchPct * matchRateDecimal;

      const periodContribution = empContrib + employerContrib;
      const startPeriodBalance = balance;

      const periodGrowth = (startPeriodBalance + periodContribution) * rPeriod;
      balance = startPeriodBalance + periodContribution + periodGrowth;

      totalEmployeeContrib += empContrib;
      totalEmployerContrib += employerContrib;

      yearEmployeeContrib += empContrib;
      yearEmployerContrib += employerContrib;
      yearInvestmentGrowth += periodGrowth;

      if (p % periodsPerYear === 0 || p === periods) {
        const yearNum = Math.ceil(p / periodsPerYear);
        const endingBalance = balance;
        const totalContribYear = yearEmployeeContrib + yearEmployerContrib;

        schedule.push({
          year: yearNum,
          age: currentAge + yearNum,
          salary: Math.round(salary),
          employeeContrib: Math.round(yearEmployeeContrib),
          employerMatch: Math.round(yearEmployerContrib),
          totalContrib: Math.round(totalContribYear),
          investmentGrowth: Math.round(yearInvestmentGrowth),
          endingBalance: Math.round(endingBalance)
        });

        yearEmployeeContrib = 0;
        yearEmployerContrib = 0;
        yearInvestmentGrowth = 0;
      }
    }

    projectedBalance = balance;
    totalContributions = totalEmployeeContrib + totalEmployerContrib;
    totalInvestmentGrowth = Math.max(0, projectedBalance - currentBalance - totalContributions);
    finalSalary = salary;

    inflationAdjustedBalance = projectedBalance / Math.pow(1 + inflationAnnual, yearsUntilRetire);

    monthlyEmployeeContribution = (currentSalary * (contributionPct / 100)) / 12;
    const effectiveMatchPctMonthly = Math.min(contributionPct, employerMatchLimit) / 100;
    monthlyEmployerContribution = (currentSalary / 12) * effectiveMatchPctMonthly * (employerMatchPct / 100);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Projected 401(k) Balance: ${fmtCurrency(projectedBalance)} | Inflation-Adjusted Balance: ${fmtCurrency(inflationAdjustedBalance)} | Total Employee Contributions: ${fmtCurrency(totalEmployeeContrib)} | Total Employer Match: ${fmtCurrency(totalEmployerContrib)} | Investment Growth: ${fmtCurrency(totalInvestmentGrowth)}`;

  const csvContent = [
    ['Year', 'Age', 'Salary', 'Employee Contribution', 'Employer Match', 'Total Contribution', 'Investment Growth', 'Ending Balance'],
    ...schedule.map((row) => [
      row.year,
      row.age,
      row.salary,
      row.employeeContrib,
      row.employerMatch,
      row.totalContrib,
      row.investmentGrowth,
      row.endingBalance
    ])
  ]
    .map((e) => e.join(','))
    .join('\n');

  const handleDownloadCsv = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '401k_retirement_projection.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="401(k) Retirement Calculator"
          subtitle="Project future retirement savings with clean minimalist precision."
          onReset={handleReset}
          onClear={handleClear}
        >
          {/* A. Retirement Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              A. Retirement Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ToolFieldGroup label="Current Age" htmlFor={ageId} unit="Years" error={errors.currentAge}>
                <input
                  id={ageId}
                  type="number"
                  min="16"
                  max="90"
                  value={currentAgeStr}
                  onChange={(e) => setCurrentAgeStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="35"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Retirement Age" htmlFor={retireAgeId} unit="Years" error={errors.retireAge}>
                <input
                  id={retireAgeId}
                  type="number"
                  min="18"
                  max="100"
                  value={retireAgeStr}
                  onChange={(e) => setRetireAgeStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="65"
                />
              </ToolFieldGroup>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-secondary/60 border border-border-subtle flex items-center justify-between text-xs">
              <span className="text-text-secondary">Years Until Retirement:</span>
              <span className="font-bold font-mono tabular-nums text-accent">{yearsUntilRetire} Years</span>
            </div>
          </div>

          {/* B. Financial Information */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              B. Financial Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ToolFieldGroup label="Current 401(k) Balance" htmlFor={balanceId} unit={currency} error={errors.currentBalance}>
                <input
                  id={balanceId}
                  type="number"
                  min="0"
                  step="1000"
                  value={balanceStr}
                  onChange={(e) => setBalanceStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="45000"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Current Annual Salary" htmlFor={salaryId} unit={currency} error={errors.currentSalary}>
                <input
                  id={salaryId}
                  type="number"
                  min="0"
                  step="1000"
                  value={salaryStr}
                  onChange={(e) => setSalaryStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="80000"
                />
              </ToolFieldGroup>
            </div>
          </div>

          {/* C. Contribution Settings */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              C. Contribution Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <ToolFieldGroup label="Employee Contrib." htmlFor={contribId} unit="%" error={errors.contributionPct}>
                <input
                  id={contribId}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={contribPctStr}
                  onChange={(e) => setContribPctStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Match Rate" htmlFor={matchPctId} unit="%" error={errors.employerMatchPct}>
                <input
                  id={matchPctId}
                  type="number"
                  min="0"
                  max="500"
                  step="10"
                  value={matchPctStr}
                  onChange={(e) => setMatchPctStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="100"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Match Limit" htmlFor={matchLimitId} unit="%" error={errors.employerMatchLimit}>
                <input
                  id={matchLimitId}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={matchLimitStr}
                  onChange={(e) => setMatchLimitStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="5"
                />
              </ToolFieldGroup>
            </div>
          </div>

          {/* D. Investment Assumptions */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              D. Investment Assumptions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <ToolFieldGroup label="Expected Return" htmlFor={returnId} unit="%" error={errors.expectedReturn}>
                <input
                  id={returnId}
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={returnStr}
                  onChange={(e) => setReturnStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="7"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Salary Increase" htmlFor={salaryIncId} unit="%" error={errors.salaryIncreasePct}>
                <input
                  id={salaryIncId}
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={salaryIncStr}
                  onChange={(e) => setSalaryIncStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="2.5"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Inflation Rate" htmlFor={inflationId} unit="%" error={errors.inflationRate}>
                <input
                  id={inflationId}
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={inflationStr}
                  onChange={(e) => setInflationStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="2.5"
                />
              </ToolFieldGroup>
            </div>

            <div className="pt-2">
              <ToolFieldGroup label="Contribution Frequency" htmlFor={freqId}>
                <select
                  id={freqId}
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="ui-input cursor-pointer text-xs"
                >
                  <option value={12}>Monthly (12x / yr)</option>
                  <option value={26}>Bi-weekly (26x / yr)</option>
                  <option value={24}>Semi-monthly (24x / yr)</option>
                  <option value={1}>Annual (1x / yr)</option>
                </select>
              </ToolFieldGroup>
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Retirement Projections"
          state={resultState}
          emptyTitle="Enter 401(k) details to calculate"
          emptyDescription="Specify your financial parameters on the left to view clean minimalist projections."
          copyText={copyText}
        >
          <div className="space-y-4 min-w-0 w-full box-border">
            {/* A. Main Projection */}
            <div className="rounded-2xl border border-result-border bg-result-bg p-5 sm:p-6 space-y-1 min-w-0 w-full box-border shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-result-icon block">
                Projected Retirement Balance
              </span>
              <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-result-text tracking-tight break-all py-1">
                {fmtCurrency(projectedBalance)}
              </div>
              <p className="text-xs text-result-text-secondary leading-relaxed">
                Expected portfolio value at age {retireAge} after {yearsUntilRetire} years of compounding.
              </p>
            </div>

            {/* B. Secondary Financial Metrics (Clean 2-column grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 w-full">
              <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                <span className="text-[11px] font-semibold text-text-secondary block break-words">Inflation-Adjusted Value</span>
                <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                  {fmtCurrency(inflationAdjustedBalance)}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 block">Today's purchasing power</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                <span className="text-[11px] font-semibold text-text-secondary block break-words">Employee Contributions</span>
                <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                  {fmtCurrency(totalEmployeeContrib)}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 block">{fmtCurrency(monthlyEmployeeContribution)} / mo</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                <span className="text-[11px] font-semibold text-text-secondary block break-words">Employer Match</span>
                <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                  {fmtCurrency(totalEmployerContrib)}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 block">{fmtCurrency(monthlyEmployerContribution)} / mo</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                <span className="text-[11px] font-semibold text-text-secondary block break-words">Investment Growth</span>
                <span className="text-lg font-bold font-mono tabular-nums text-status-success mt-1 block break-all">
                  +{fmtCurrency(totalInvestmentGrowth)}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 block">Compound returns</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full sm:col-span-2 box-border">
                <span className="text-[11px] font-semibold text-text-secondary block break-words">Final Annual Salary</span>
                <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                  {fmtCurrency(finalSalary)}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 block">At retirement age</span>
              </div>
            </div>

            {/* C. Detailed Breakdown */}
            <div className="pt-2">
              <ToolBreakdownList
                items={[
                  { label: 'Starting 401(k) Balance', value: fmtCurrency(currentBalance) },
                  { label: 'Total Employee Contributions', value: fmtCurrency(totalEmployeeContrib) },
                  { label: 'Total Employer Match Contributions', value: fmtCurrency(totalEmployerContrib) },
                  { label: 'Total Principal Invested', value: fmtCurrency(currentBalance + totalContributions) },
                  { label: 'Total Compound Investment Growth', value: fmtCurrency(totalInvestmentGrowth), highlight: true },
                  { label: 'Gross Projected Balance', value: fmtCurrency(projectedBalance), highlight: true }
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="ui-btn ui-btn-secondary text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Download CSV Schedule</span>
              </button>
            </div>

            {/* D. Projection Schedule Table */}
            {schedule.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border-subtle min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Annual Projection Schedule
                  </h4>
                  <span className="text-xs text-text-secondary font-mono">{schedule.length} Years</span>
                </div>

                <div className="overflow-x-auto max-h-72 rounded-xl border border-border-main bg-surface min-w-0">
                  <table className="w-full text-left text-xs font-mono tabular-nums whitespace-nowrap">
                    <thead className="bg-surface-secondary text-text-secondary sticky top-0 border-b border-border-main">
                      <tr>
                        <th className="p-2.5 font-semibold">Yr</th>
                        <th className="p-2.5 font-semibold">Age</th>
                        <th className="p-2.5 font-semibold">Salary</th>
                        <th className="p-2.5 font-semibold">You</th>
                        <th className="p-2.5 font-semibold">Match</th>
                        <th className="p-2.5 font-semibold">Growth</th>
                        <th className="p-2.5 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-text-primary">
                      {schedule.map((row) => (
                        <tr key={row.year} className="hover:bg-surface-hover">
                          <td className="p-2.5">{row.year}</td>
                          <td className="p-2.5">{row.age}</td>
                          <td className="p-2.5">{fmtCurrency(row.salary)}</td>
                          <td className="p-2.5 text-accent">+{fmtCurrency(row.employeeContrib)}</td>
                          <td className="p-2.5 text-status-success">+{fmtCurrency(row.employerMatch)}</td>
                          <td className="p-2.5 text-status-success">+{fmtCurrency(row.investmentGrowth)}</td>
                          <td className="p-2.5 font-bold">{fmtCurrency(row.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </ToolResultsPanel>
      }
    />
  );
}
