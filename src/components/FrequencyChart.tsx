/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Habit } from '../types';
import { getDayOfWeekDistribution } from '../utils/habitUtils';

interface FrequencyChartProps {
  habit: Habit;
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ habit }) => {
  const distribution = getDayOfWeekDistribution(habit);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const maxVal = Math.max(...distribution, 1); // Avoid division by zero

  const colorMap = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    blue: { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
    indigo: { bar: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
    violet: { bar: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    rose: { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
    slate: { bar: 'bg-slate-700', text: 'text-slate-700', bg: 'bg-slate-100' },
  };

  const theme = colorMap[habit.color] || colorMap.emerald;

  return (
    <div className="bg-neutral-50/50 p-4 border border-neutral-200/60 rounded-2xl" id="frequency-distribution-panel">
      <h4 className="font-sans font-medium text-sm text-neutral-800 mb-4">
        Weekly Session Distribution
      </h4>

      <div className="space-y-2.5">
        {days.map((day, idx) => {
          const count = distribution[idx];
          const percentage = (count / maxVal) * 100;

          return (
            <div key={day} className="flex items-center text-xs">
              <span className="w-20 font-sans font-medium text-neutral-500">
                {day.substring(0, 3)}
              </span>
              <div className="flex-1 h-5 bg-neutral-100 rounded-lg overflow-hidden relative border border-neutral-200/40">
                <div
                  className={`h-full ${theme.bar} rounded-r-md transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-neutral-600">
                  {count} {count === 1 ? 'time' : 'times'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
