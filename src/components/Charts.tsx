import React, { useState } from 'react';
import { CurrencyFormatter } from '../utils/calculator';

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

interface FinancialDonutChartProps {
  slices: ChartSlice[];
  centerTitle: string;
  centerValue: string;
  size?: number;
}

export const FinancialDonutChart: React.FC<FinancialDonutChartProps> = ({
  slices,
  centerTitle,
  centerValue,
  size = 190,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = slices.reduce((acc, curr) => acc + curr.value, 0);

  const radius = 70;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90 transform">
          {total === 0 ? (
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          ) : (
            slices.map((slice, index) => {
              const percent = total > 0 ? (slice.value / total) * 100 : 0;
              const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += percent;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={slice.label}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {hoveredIndex !== null ? slices[hoveredIndex].label : centerTitle}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
            {hoveredIndex !== null
              ? CurrencyFormatter.formatInrCompact(slices[hoveredIndex].value)
              : centerValue}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        {slices.map((slice, idx) => {
          const percent = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';
          return (
            <div
              key={slice.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                hoveredIndex === idx
                  ? 'bg-slate-200 dark:bg-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span>{slice.label}:</span>
              <span className="font-bold font-mono">
                {CurrencyFormatter.formatInrCompact(slice.value)} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface YearWiseBarChartProps {
  data: { label: string; value1: number; value2?: number }[];
  label1: string;
  label2?: string;
  color1?: string;
  color2?: string;
}

export const YearWiseBarChart: React.FC<YearWiseBarChartProps> = ({
  data,
  label1,
  label2,
  color1 = '#2563EB',
  color2 = '#10B981',
}) => {
  if (data.length === 0) return null;

  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.value1, d.value2 || 0))
  );

  return (
    <div className="space-y-4">
      <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
        {data.map((item, idx) => {
          const heightPercent1 = Math.max(6, Math.round((item.value1 / maxVal) * 100));
          const heightPercent2 = item.value2
            ? Math.max(6, Math.round((item.value2 / maxVal) * 100))
            : 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                <div
                  style={{
                    height: `${heightPercent1}%`,
                    backgroundColor: color1,
                  }}
                  className="w-full max-w-[14px] rounded-t-sm transition-all duration-300 group-hover:brightness-110 relative"
                  title={`${label1}: ${CurrencyFormatter.formatInr(item.value1)}`}
                />
                {item.value2 !== undefined && (
                  <div
                    style={{
                      height: `${heightPercent2}%`,
                      backgroundColor: color2,
                    }}
                    className="w-full max-w-[14px] rounded-t-sm transition-all duration-300 group-hover:brightness-110 relative"
                    title={`${label2}: ${CurrencyFormatter.formatInr(item.value2)}`}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: color1 }} />
          <span>{label1}</span>
        </div>
        {label2 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: color2 }} />
            <span>{label2}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface GrowthLineChartProps {
  dataPoints: number[];
  labels?: string[];
  lineColor?: string;
  title?: string;
}

export const GrowthLineChart: React.FC<GrowthLineChartProps> = ({
  dataPoints,
  labels = [],
  lineColor = '#10B981',
  title,
}) => {
  if (dataPoints.length < 2) return null;

  const minVal = Math.min(...dataPoints);
  const maxVal = Math.max(...dataPoints, minVal + 1);

  const width = 500;
  const height = 150;
  const paddingX = 10;
  const paddingY = 15;

  const availableWidth = width - paddingX * 2;
  const availableHeight = height - paddingY * 2;
  const stepX = availableWidth / (dataPoints.length - 1);

  const points = dataPoints.map((val, idx) => {
    const normY = (val - minVal) / (maxVal - minVal);
    const x = paddingX + idx * stepX;
    const y = height - paddingY - normY * availableHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="space-y-2">
      {title && (
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </h4>
      )}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <path d={areaD} fill="url(#lineGrad)" />

          {/* Stroke Path */}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* End Point Dot */}
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={lineColor}
          />
        </svg>
      </div>
    </div>
  );
};
