import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList
} from 'recharts';
import { BarChart3, Search, Trash2 } from 'lucide-react';
import { CalculatorId } from '../../types.ts';
import { CALCULATORS, CATEGORIES } from '../../data/calculators.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';
import { UiButton, UiEmptyState } from '../ui/AppPrimitives.tsx';

export interface PopularToolsChartProps {
  recentUsageCounts: Record<string, number>;
  recentIds?: CalculatorId[];
  onSelectCalculator: (id: CalculatorId) => void;
  onClearRecent?: () => void;
  onOpenSearch?: () => void;
  maxItems?: number;
}

interface ChartDatum {
  id: CalculatorId;
  name: string;
  shortName: string;
  categoryTitle: string;
  count: number;
  sharePercent: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: ChartDatum }>;
  isEs: boolean;
}

function truncateLabel(text: string, maxLen = 24): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}

function PopularToolsTooltip({ active, payload, isEs }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl border border-border-main bg-surface-elevated px-3.5 py-2.5 shadow-md text-xs max-w-[260px]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-semibold text-text-primary leading-snug">
          {item.name}
        </span>
      </div>
      <div className="text-[11px] text-text-tertiary mb-1.5">{item.categoryTitle}</div>
      <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-border-subtle">
        <span className="text-text-secondary">
          {isEs ? 'Usos registrados' : 'Recorded uses'}
        </span>
        <span className="font-mono font-bold text-text-primary tabular-nums">
          {item.count} ({item.sharePercent}%)
        </span>
      </div>
      <div className="text-[11px] text-accent mt-1 font-medium">
        {isEs ? 'Haz clic en la barra para abrir' : 'Click bar to open tool'}
      </div>
    </div>
  );
}

export default function PopularToolsChart({
  recentUsageCounts,
  recentIds = [],
  onSelectCalculator,
  onClearRecent,
  onOpenSearch,
  maxItems = 5
}: PopularToolsChartProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const calculatorMap = useMemo(() => {
    const map = new Map<string, (typeof CALCULATORS)[number]>();
    for (const calc of CALCULATORS) {
      if (!map.has(calc.id)) map.set(calc.id, calc);
    }
    return map;
  }, []);

  const categoryTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const rawCat of CATEGORIES) {
      map.set(rawCat.id, getLocalizedCategory(rawCat, language).title);
    }
    return map;
  }, [language]);

  const { chartData, totalUses, trackedToolCount } = useMemo(() => {
    const recentOrder = new Map<string, number>();
    recentIds.forEach((id, idx) => {
      if (!recentOrder.has(id)) recentOrder.set(id, idx);
    });

    const validEntries: Array<{
      id: CalculatorId;
      name: string;
      categoryTitle: string;
      count: number;
      color: string;
      order: number;
    }> = [];

    let sum = 0;

    for (const [id, rawCount] of Object.entries(recentUsageCounts)) {
      if (typeof rawCount !== 'number' || !Number.isFinite(rawCount) || rawCount <= 0) {
        continue;
      }
      const calc = calculatorMap.get(id);
      if (!calc) continue;

      const localized = getLocalizedCalculator(calc, language);
      const count = Math.round(rawCount);
      sum += count;

      validEntries.push({
        id: calc.id,
        name: localized.name,
        categoryTitle: categoryTitleMap.get(calc.category) || calc.category,
        count,
        color: calc.iconColor || '#2563EB',
        order: recentOrder.get(id) ?? Number.MAX_SAFE_INTEGER
      });
    }

    validEntries.sort(
      (a, b) => b.count - a.count || a.order - b.order || a.name.localeCompare(b.name)
    );

    const topEntries: ChartDatum[] = validEntries.slice(0, maxItems).map((entry) => ({
      id: entry.id,
      name: entry.name,
      shortName: truncateLabel(entry.name, 24),
      categoryTitle: entry.categoryTitle,
      count: entry.count,
      sharePercent: sum > 0 ? Math.round((entry.count / sum) * 100) : 0,
      color: entry.color
    }));

    return {
      chartData: topEntries,
      totalUses: sum,
      trackedToolCount: validEntries.length
    };
  }, [recentUsageCounts, recentIds, calculatorMap, categoryTitleMap, language, maxItems]);

  const chartHeight = Math.max(176, chartData.length * 44 + 28);

  const handleBarClick = (barData: unknown) => {
    const item = barData as { id?: CalculatorId; payload?: ChartDatum } | undefined;
    const targetId = item?.payload?.id ?? item?.id;
    if (targetId) {
      onSelectCalculator(targetId);
    }
  };

  return (
    <section
      aria-labelledby="home-popular-tools-chart-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent shrink-0" />
            <h2
              id="home-popular-tools-chart-heading"
              className="ui-section-title text-lg sm:text-xl"
            >
              {isEs ? 'Top 5 Calculadoras Más Usadas' : 'Top 5 Most Used Calculators'}
            </h2>
          </div>
          <p className="ui-supporting mt-0.5">
            {isEs
              ? 'Resumen visual en tiempo real de tus calculadoras más populares.'
              : 'Live visual summary of your top 5 calculators ranked by usage count.'}
          </p>
        </div>

        {chartData.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs text-text-tertiary tabular-nums">
              {isEs
                ? `${totalUses} ${totalUses === 1 ? 'uso' : 'usos'} · ${trackedToolCount} ${trackedToolCount === 1 ? 'herramienta' : 'herramientas'}`
                : `${totalUses} ${totalUses === 1 ? 'use' : 'uses'} · ${trackedToolCount} ${trackedToolCount === 1 ? 'tool' : 'tools'}`}
            </span>
            {onClearRecent && (
              <button
                type="button"
                onClick={onClearRecent}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-status-error transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEs ? 'Reiniciar' : 'Reset'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <UiEmptyState
          icon={<BarChart3 className="w-5 h-5 text-text-tertiary" />}
          title={isEs ? 'Aún no hay estadísticas de uso' : 'No usage activity recorded yet'}
          description={
            isEs
              ? 'Abre cualquier calculadora o utilidad para ver aquí tus 5 herramientas más usadas.'
              : 'Open any calculator or utility to populate your top 5 popular tools chart.'
          }
          action={
            onOpenSearch ? (
              <UiButton variant="secondary" size="sm" onClick={onOpenSearch}>
                <Search className="w-3.5 h-3.5" />
                <span>{isEs ? 'Explorar herramientas' : 'Find a tool'}</span>
              </UiButton>
            ) : undefined
          }
        />
      ) : (
        <div className="ui-card p-4 sm:p-5">
          <div
            className="w-full min-w-0"
            style={{ height: chartHeight }}
            role="img"
            aria-label={
              isEs
                ? 'Gráfico de barras horizontales con las 5 calculadoras más usadas'
                : 'Horizontal bar chart displaying the top 5 most used calculators'
            }
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 44, left: 4, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--border-subtle)"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={168}
                  tick={{ fill: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--bg-hover)', opacity: 0.65 }}
                  content={<PopularToolsTooltip isEs={isEs} />}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                  onClick={handleBarClick}
                  className="cursor-pointer"
                  isAnimationActive={true}
                  animationDuration={320}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} fillOpacity={0.88} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    style={{
                      fill: 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
