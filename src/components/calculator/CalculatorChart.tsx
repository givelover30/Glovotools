import { BarChart3 } from 'lucide-react';
import { CalculatorId } from '../../types.ts';

interface CalculatorChartProps {
  calculatorId: CalculatorId;
}

export default function CalculatorChart({ calculatorId }: CalculatorChartProps) {
  // BMI and Loan-Mortgage now render live reactive visual breakdowns directly in their redesigned workspaces
  if (calculatorId === 'bmi' || calculatorId === 'loan-mortgage') {
    return null;
  }

  // Compound Interest Growth Reference
  if (calculatorId === 'compound-interest') {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span>Compound Growth Acceleration Reference</span>
          </span>
          <span className="text-text-tertiary">10+ Years</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1">
              <span>Cumulative Deposits</span>
              <span className="font-mono font-semibold tabular-nums">Base Capital (50%)</span>
            </div>
            <div className="h-2.5 w-full bg-surface border border-border-subtle rounded-full overflow-hidden">
              <div className="h-full bg-text-secondary/60 w-[50%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1">
              <span>Compound Interest Multiplier</span>
              <span className="font-mono font-semibold text-accent tabular-nums">
                Reinvested Growth (+100%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-surface border border-border-subtle rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[100%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Electrical Ohm's Law Relationships
  if (calculatorId === 'ohms-law') {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span>Ohm&apos;s Law Proportionality Reference</span>
          </span>
          <span className="font-mono text-text-tertiary">V = I · R</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-xl bg-surface border border-border-main">
            <div className="font-bold text-accent font-mono">Voltage (V)</div>
            <div className="text-[11px] text-text-secondary mt-1 font-mono">V = I × R</div>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border-main">
            <div className="font-bold text-accent font-mono">Current (I)</div>
            <div className="text-[11px] text-text-secondary mt-1 font-mono">I = V / R</div>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border-main">
            <div className="font-bold text-accent font-mono">Resistance (R)</div>
            <div className="text-[11px] text-text-secondary mt-1 font-mono">R = V / I</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
