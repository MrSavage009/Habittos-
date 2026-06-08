/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Habit } from '../types';
import { formatDate, isDateScheduled, parseDate } from '../utils/habitUtils';

interface CalendarGridProps {
  habit: Habit;
  onToggleDate?: (dateStr: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ habit, onToggleDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  // Start of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Previous and next month triggers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month labels
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Color theme map
  const colorMap = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30', lightBg: 'bg-blue-500/10' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/30', lightBg: 'bg-indigo-500/10' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500/30', lightBg: 'bg-violet-500/10' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', lightBg: 'bg-amber-500/10' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30', lightBg: 'bg-rose-500/10' },
    slate: { bg: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-500/30', lightBg: 'bg-slate-500/10' },
  };

  const theme = colorMap[habit.color] || colorMap.emerald;

  // Build grid blocks
  const blocks: React.ReactNode[] = [];

  // Empty spaces for padding before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    blocks.push(
      <div key={`padding-${i}`} className="h-9 w-9" />
    );
  }

  const todayStr = formatDate(new Date());

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const activeDate = new Date(year, month, day);
    const activeStr = formatDate(activeDate);
    const creationStr = habit.createdAt;
    
    const isCompleted = habit.completions.includes(activeStr);
    const isPartial = habit.partials?.includes(activeStr) || false;
    const isScheduled = isDateScheduled(habit, activeStr);
    const isToday = activeStr === todayStr;
    const isBeforeCreation = activeDate < parseDate(creationStr);
    const isFuture = activeDate > new Date() && activeStr !== todayStr;

    let cellClass = "relative h-9 w-9 flex items-center justify-center text-xs rounded-lg transition-all ";
    let cellContent = <span>{day}</span>;

    if (isBeforeCreation) {
      cellClass += "text-neutral-400 opacity-30 select-none cursor-default";
    } else if (isCompleted) {
      cellClass += `${theme.bg} text-white shadow-sm font-semibold cursor-pointer`;
      cellContent = (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] leading-none mb-0.5">{day}</span>
          <Check className="w-2.5 h-2.5" strokeWidth={3} />
        </div>
      );
    } else if (isPartial) {
      cellClass += `bg-amber-500 text-white shadow-sm font-semibold cursor-pointer`;
      cellContent = (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] leading-none mb-0.5">{day}</span>
          <span className="text-[10px] font-black leading-none mt-0.5">➖</span>
        </div>
      );
    } else if (isToday) {
      cellClass += `border-2 border-dashed ${theme.border} font-bold text-neutral-800 ${theme.lightBg} cursor-pointer`;
    } else if (isFuture) {
      cellClass += "text-neutral-400 opacity-40 select-none cursor-default";
    } else if (isScheduled) {
      // Scheduled day but missed (since not completed and in past)
      cellClass += "border border-red-500/30 text-red-700 bg-red-500/5 hover:bg-neutral-100 font-medium cursor-pointer";
    } else {
      // Unscheduled day in past
      cellClass += "text-neutral-500 bg-neutral-100 hover:bg-neutral-200 cursor-pointer";
    }

    blocks.push(
      <div key={`day-${day}`} className="flex items-center justify-center">
        <button
          type="button"
          disabled={isBeforeCreation || isFuture}
          onClick={() => onToggleDate?.(activeStr)}
          className={`${cellClass} select-none outline-none focus:ring-2 focus:ring-black/5 hover:scale-110 active:scale-95`}
          title={`${activeStr}${isCompleted ? ' (Completed)' : isPartial ? ' (Partial Buffer)' : (isScheduled ? ' (Scheduled)' : ' (Not Scheduled)')} • Tap to toggle`}
        >
          {cellContent}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50/50 p-4 border border-neutral-200/60 rounded-2xl" id="calendar-view-container">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h4 className="font-sans font-medium text-sm text-neutral-800">
            Calendar Completion History
          </h4>
          <p className="text-[10px] text-neutral-450">
            Tap any active date square to cycle completions
          </p>
        </div>
        <div className="flex items-center space-x-1.5 bg-white border border-neutral-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600 transition"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs font-semibold px-2 min-w-[100px] text-center text-neutral-700">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600 transition"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1 max-w-[320px] mx-auto">
        {daysOfWeekLabels.map((lbl) => (
          <div key={lbl} className="text-center text-[11px] font-mono font-medium text-neutral-400 py-1">
            {lbl}
          </div>
        ))}
        {blocks}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-neutral-200/55 text-[11px] text-neutral-500">
        <div className="flex items-center space-x-1.5">
          <div className={`h-3 w-3 rounded-md ${theme.bg}`} />
          <span>Completed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="h-3 w-3 rounded bg-amber-500" />
          <span>Partial (Buffer)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="h-3 w-3 rounded-md border border-red-500/30 bg-red-500/5" />
          <span>Missed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="h-3 w-3 rounded-md bg-neutral-100" />
          <span>Unscheduled</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`h-3 w-3 rounded-md border-2 border-dashed ${theme.border} ${theme.lightBg}`} />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
