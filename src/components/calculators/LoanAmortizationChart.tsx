import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ScheduleItem {
  month: number;
  balance: number;
  principal: number;
  interest: number;
}

interface LoanAmortizationChartProps {
  schedule: ScheduleItem[];
  principal: number;
  formatCurrency: (val: number) => string;
}

export default function LoanAmortizationChart({
  schedule,
  principal,
  formatCurrency
}: LoanAmortizationChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; month: number; balance: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current || schedule.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 30, left: 50, width: container.clientWidth || 500, height: 220 };
    const width = margin.width - margin.left - margin.right;
    const height = margin.height - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${margin.width} ${margin.height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('overflow', 'visible');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleLinear()
      .domain([0, schedule.length])
      .range([0, width]);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, principal])
      .nice()
      .range([height, 0]);

    // Area gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'balance-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#22C55E').attr('stop-opacity', 0.35);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#22C55E').attr('stop-opacity', 0.0);

    const chartData: ScheduleItem[] = [
      { month: 0, balance: principal, principal: 0, interest: 0 },
      ...schedule
    ];

    // Area generator
    const area = d3
      .area<ScheduleItem>()
      .x((d) => x(d.month))
      .y0(height)
      .y1((d) => y(d.balance))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3
      .line<ScheduleItem>()
      .x((d) => x(d.month))
      .y((d) => y(d.balance))
      .curve(d3.curveMonotoneX);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickSize(-height)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.06);

    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(4)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.06);

    // Add Area
    g.append('path')
      .datum(chartData)
      .attr('fill', 'url(#balance-gradient)')
      .attr('d', area);

    // Add Line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#22C55E')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(6)
          .tickFormat((d) => `Mo ${d}`)
      );
    xAxis.selectAll('text').attr('font-size', '10px').attr('fill', 'currentColor').style('opacity', 0.7);
    xAxis.select('.domain').attr('stroke', 'currentColor').style('opacity', 0.2);
    xAxis.selectAll('.tick line').attr('stroke', 'currentColor').style('opacity', 0.2);

    const yAxis = g.append('g').call(
      d3.axisLeft(y)
        .ticks(4)
        .tickFormat((d) => {
          const val = Number(d);
          if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
          return `$${val}`;
        })
    );
    yAxis.selectAll('text').attr('font-size', '10px').attr('fill', 'currentColor').style('opacity', 0.7);
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line').attr('stroke', 'currentColor').style('opacity', 0.2);

    // Interactive overlay for hover
    const bisect = d3.bisector((d: ScheduleItem) => d.month).left;

    const focus = g.append('g').style('display', 'none');

    focus.append('circle').attr('r', 4.5).attr('fill', '#22C55E').attr('stroke', '#fff').attr('stroke-width', 2);

    const overlay = g
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    overlay
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        setTooltip(null);
      })
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event, this);
        const xVal = x.invert(mx);
        const i = bisect(chartData, xVal, 1);
        const d0 = chartData[i - 1];
        const d1 = chartData[i];
        if (!d0 || !d1) return;
        const d = xVal - d0.month > d1.month - xVal ? d1 : d0;

        focus.attr('transform', `translate(${x(d.month)},${y(d.balance)})`);
        setTooltip({
          x: x(d.month) + margin.left,
          y: y(d.balance) + margin.top,
          month: d.month,
          balance: d.balance
        });
      });
  }, [schedule, principal]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full h-[220px]" />
      {tooltip && (
        <div
          className="absolute z-20 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border-main shadow-lg text-[11px] font-mono pointer-events-none -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-semibold text-text-primary">Month {tooltip.month}</div>
          <div className="text-emerald-500 font-bold">{formatCurrency(tooltip.balance)}</div>
        </div>
      )}
    </div>
  );
}
