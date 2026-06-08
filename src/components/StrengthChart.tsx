/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Habit } from '../types';
import { calculateHabitStrength, parseDate } from '../utils/habitUtils';

interface StrengthChartProps {
  habit: Habit;
}

export const StrengthChart: React.FC<StrengthChartProps> = ({ habit }) => {
  const { history } = calculateHabitStrength(habit, 15); // Show last 15 days for a clean, non-cluttered look
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);

  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const width = 500;
  const height = 180;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Max score is 100, min is 0
  const maxVal = 100;
  const minVal = 0;

  const pointsCount = history.length;
  
  // Calculate X and Y coordinates for our points
  const points = history.map((item, index) => {
    const x = padding.left + (index / (pointsCount - 1)) * chartWidth;
    // Map score (0 to 100) to Y space (bottom to top)
    const yPercent = (item.score - minVal) / (maxVal - minVal);
    const y = padding.top + chartHeight - yPercent * chartHeight;
    return { x, y, score: item.score, date: item.date };
  });

  // Color maps
  const colorMap = {
    emerald: { line: '#10b981', gradient: 'url(#gradient-emerald)', hex: '#10b981' },
    blue: { line: '#3b82f6', gradient: 'url(#gradient-blue)', hex: '#3b82f6' },
    indigo: { line: '#6366f1', gradient: 'url(#gradient-indigo)', hex: '#6366f1' },
    violet: { line: '#8b5cf6', gradient: 'url(#gradient-violet)', hex: '#8b5cf6' },
    amber: { line: '#f59e0b', gradient: 'url(#gradient-amber)', hex: '#f59e0b' },
    rose: { line: '#f43f5e', gradient: 'url(#gradient-rose)', hex: '#f43f5e' },
    slate: { line: '#475569', gradient: 'url(#gradient-slate)', hex: '#475569' },
  };

  const colors = colorMap[habit.color] || colorMap.emerald;

  // Build the path SVG line
  let linePath = '';
  let fillPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    fillPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  }

  // Format axis labels for dates (e.g. "Jun 8")
  const formatXLabel = (dateStr: string) => {
    try {
      const d = parseDate(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-neutral-50/50 p-4 border border-neutral-200/60 rounded-2xl relative" id="strength-chart-wrapper">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-sans font-medium text-sm text-neutral-800">
          Habit Strength / Score Curve
        </h4>
        <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
          <span>Last 15 Days</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[320px] select-none pointer-events-auto"
        >
          <defs>
            {/* Define color gradients */}
            <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-indigo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-violet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-rose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-slate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((grid, index) => {
            const hPercent = grid / 100;
            const y = padding.top + chartHeight - hPercent * chartHeight;
            return (
              <g key={`grid-${grid}`} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-neutral-400 font-semibold"
                >
                  {grid}%
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          {points.length > 0 && (
            <path
              d={fillPath}
              fill={colors.gradient}
              className="transition-all duration-300"
            />
          )}

          {/* Line Path */}
          {points.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke={colors.line}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Interaction Overlay Circles */}
          {points.map((p, index) => (
            <g key={`point-hotspot-${index}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#ffffff"
                stroke={colors.line}
                strokeWidth="2.5"
                className="transition-all duration-200 hover:scale-150"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint({ index, x: p.x, y: p.y })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint({ index, x: p.x, y: p.y })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {/* Dynamic Tooltip inside SVG */}
          {hoveredPoint && (
            <g>
              <rect
                x={Math.max(padding.left, Math.min(hoveredPoint.x - 55, width - padding.right - 110))}
                y={Math.max(5, hoveredPoint.y - 45)}
                width="110"
                height="32"
                rx="6"
                fill="#1f2937"
                className="shadow-md"
              />
              <text
                x={Math.max(padding.left + 55, Math.min(hoveredPoint.x, width - padding.right - 55))}
                y={Math.max(5, hoveredPoint.y - 45) + 13}
                fill="#ffffff"
                textAnchor="middle"
                className="font-mono text-[9px] font-semibold"
              >
                {formatXLabel(points[hoveredPoint.index].date)}
              </text>
              <text
                x={Math.max(padding.left + 55, Math.min(hoveredPoint.x, width - padding.right - 55))}
                y={Math.max(5, hoveredPoint.y - 45) + 25}
                fill="#10b981"
                textAnchor="middle"
                className="font-sans text-[10px] font-bold"
                style={{ fill: colors.line }}
              >
                Score: {points[hoveredPoint.index].score}%
              </text>
            </g>
          )}

          {/* X Axis Labels */}
          {points.filter((_, idx) => idx % 3 === 0 || idx === pointsCount - 1).map((p, index) => (
            <text
              key={`x-label-${index}`}
              x={p.x}
              y={height - 10}
              className="font-mono text-[9px] fill-neutral-400 font-semibold align-middle"
              textAnchor="middle"
            >
              {formatXLabel(p.date)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
