/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, LayoutGrid, CheckCircle2, Flame, Award, ShieldAlert } from 'lucide-react';
import { Habit } from '../types';
import { formatDate, getStreakStats, calculateHabitStrength, isDateScheduled, getPastDates, parseDate } from '../utils/habitUtils';

interface WidgetPanelProps {
  habits: Habit[];
  onToggleDate: (habitId: string, dateStr: string) => void;
}

export const WidgetPanel: React.FC<WidgetPanelProps> = ({ habits, onToggleDate }) => {
  const [selectedHabitIdForStreak, setSelectedHabitIdForStreak] = useState<string>(habits[0]?.id || '');
  const [selectedHabitIdForGrid, setSelectedHabitIdForGrid] = useState<string>(habits[0]?.id || '');

  const todayStr = formatDate(new Date());
  
  // Find active habits for today
  const todayHabits = habits.filter(h => isDateScheduled(h, todayStr) && !h.isArchived);

  // Fallback selected habit if current does not exist
  const currentStreakHabit = habits.find(h => h.id === selectedHabitIdForStreak) || habits[0];
  const currentGridHabit = habits.find(h => h.id === selectedHabitIdForGrid) || habits[0];

  const past7Days = getPastDates(7);

  // Return formatted day labels
  const getDayLetter = (dateStr: string) => {
    try {
      const d = parseDate(dateStr);
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return days[d.getDay()];
    } catch {
      return '';
    }
  };

  const colorMap = {
    emerald: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-emerald-500 border-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-blue-50 border-blue-500/10 text-blue-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-indigo-50 border-indigo-500/10 text-indigo-600',
    violet: 'bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-violet-50 border-violet-500/10 text-violet-700',
    amber: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-amber-50 border-amber-500/10 text-amber-600',
    rose: 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-rose-50 border-rose-500/10 text-rose-600',
    slate: 'bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-slate-50 border-slate-500/10 text-slate-700',
  };

  return (
    <div className="space-y-6" id="widgets-simulator-section">
      <div className="flex items-center space-x-2 pb-1 border-b border-neutral-100">
        <Smartphone className="w-4.5 h-4.5 text-neutral-500" />
        <h3 className="font-sans font-medium text-sm text-neutral-800 uppercase tracking-tight">
          Home Screen Widgets Simulator
        </h3>
      </div>
      
      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
        Preview and interact with Habittos widgets as they would appear on a device home screen. Changes synchronized instantly with the app tracking logs.
      </p>

      {habits.length === 0 ? (
        <div className="p-6 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-7 h-7 text-neutral-400 mb-2" />
          <span className="font-sans font-medium text-xs text-neutral-500">
            Create habits to activate widgets simulator
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Widget 1: Checklist widget */}
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-[28px] p-4.5 shadow-sm space-y-4 widget-container relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-neutral-400 font-sans font-semibold text-[10px] tracking-wider uppercase">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Habittos Quick Checklist</span>
              </div>
              <span className="font-mono text-[9px] bg-neutral-200/60 text-neutral-600 px-1.5 py-0.5 rounded-md font-semibold">
                Size 2x2
              </span>
            </div>

            <div className="bg-white border border-neutral-150 rounded-2xl p-3 shadow-inner min-h-[140px] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                  <span>Today's Actions</span>
                  <span>{todayHabits.length} total</span>
                </div>
                
                {todayHabits.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 italic py-4 text-center">
                    No scheduled habits for today!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {todayHabits.map((habit) => {
                      const completed = habit.completions.includes(todayStr);
                      const t = colorMap[habit.color] || colorMap.emerald;
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/40 rounded-xl px-2.5 py-2 text-xs transition"
                        >
                          <span className={`font-sans font-medium text-neutral-700 ${completed ? 'line-through text-neutral-400' : ''}`}>
                            {habit.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleDate(habit.id, todayStr)}
                            className="focus:outline-none"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 transition-transform active:scale-90 ${
                                completed 
                                  ? 'text-emerald-500 fill-emerald-50' 
                                  : 'text-neutral-300 hover:text-neutral-400'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-400 font-sans">
                <span>Habits tracked: {habits.length}</span>
                <span className="font-semibold text-neutral-600">Pure Utility</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Streak circular ring widget */}
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-[28px] p-4.5 shadow-sm space-y-4 widget-container flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-neutral-400 font-sans font-semibold text-[10px] tracking-wider uppercase font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Habit Streak Ring</span>
              </div>
              <select
                value={selectedHabitIdForStreak}
                onChange={(e) => setSelectedHabitIdForStreak(e.target.value)}
                className="font-sans text-[10px] bg-white border border-neutral-200 p-0.5 px-2 rounded-lg"
              >
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {currentStreakHabit && (
              <div className="bg-white border border-neutral-150 rounded-2xl p-3 shadow-inner flex items-center justify-around space-x-4 min-h-[140px]">
                {/* SVG Ring */}
                {(() => {
                  const { currentScore } = calculateHabitStrength(currentStreakHabit);
                  const stats = getStreakStats(currentStreakHabit);
                  const radius = 32;
                  const strokeWidth = 6.5;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (currentScore / 100) * circumference;
                  
                  const colorsHex: Record<string, string> = {
                    emerald: '#10b981',
                    blue: '#3b82f6',
                    indigo: '#6366f1',
                    violet: '#8b5cf6',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                    slate: '#475569',
                  };

                  const activeHex = colorsHex[currentStreakHabit.color] || colorsHex.emerald;

                  return (
                    <>
                      <div className="relative flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="#f3f4f6"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke={activeHex}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="font-mono text-sm font-bold text-neutral-800 leading-none">
                            {currentScore}%
                          </span>
                          <span className="text-[8px] text-neutral-400 font-sans tracking-tight">STRENGTH</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5 py-1">
                        <h4 className="font-sans font-bold text-xs text-neutral-800 truncate max-w-[120px]">
                          {currentStreakHabit.name}
                        </h4>
                        <div className="flex items-center space-x-1 font-mono text-xs text-neutral-600 font-semibold bg-amber-50 border border-amber-200/50 rounded-lg px-2 py-0.5 w-fit">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-50" />
                          <span>{stats.currentStreak} day streak</span>
                        </div>
                        <p className="text-[9px] text-neutral-400 uppercase font-mono font-semibold">
                          BEST: {stats.longestStreak} DAYS
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Widget 3: Mini Progress Grid Widget */}
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-[28px] p-4.5 shadow-sm space-y-4 widget-container col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-neutral-400 font-sans font-semibold text-[10px] tracking-wider uppercase font-mono">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>7-Day Mini Calendar</span>
              </div>
              <select
                value={selectedHabitIdForGrid}
                onChange={(e) => setSelectedHabitIdForGrid(e.target.value)}
                className="font-sans text-[10px] bg-white border border-neutral-200 p-0.5 px-2 rounded-lg"
              >
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {currentGridHabit && (
              <div className="bg-white border border-neutral-150 rounded-2xl p-4.5 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4 min-h-[100px]">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-sans font-bold text-xs text-neutral-800">
                    {currentGridHabit.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 leading-snug">
                    Schedule: {currentGridHabit.schedule.type.replace('_', ' ')}
                  </p>
                </div>

                {/* 7 dots */}
                <div className="flex items-center gap-3">
                  {past7Days.map((dateStr) => {
                    const completed = currentGridHabit.completions.includes(dateStr);
                    const isSch = isDateScheduled(currentGridHabit, dateStr);
                    const isToday = dateStr === todayStr;
                    
                    const colorSwatches: Record<string, string> = {
                      emerald: 'bg-emerald-500 border-emerald-500 text-emerald-500',
                      blue: 'bg-blue-500 border-blue-500 text-blue-500',
                      indigo: 'bg-indigo-500 border-indigo-500 text-indigo-500',
                      violet: 'bg-violet-500 border-violet-500 text-violet-500',
                      amber: 'bg-amber-500 border-amber-500 text-amber-500',
                      rose: 'bg-rose-500 border-rose-500 text-rose-500',
                      slate: 'bg-slate-700 border-slate-700 text-slate-700',
                    };

                    const sw = colorSwatches[currentGridHabit.color] || colorSwatches.emerald;

                    let c = "w-9 h-11 rounded-xl flex flex-col items-center justify-center border transition-all text-[9px] font-mono ";
                    if (completed) {
                      c += `${sw} text-white font-bold`;
                    } else if (isToday) {
                      c += "border-dashed border-neutral-400 text-neutral-700 bg-neutral-50 font-bold";
                    } else if (isSch) {
                      c += "border-red-200 bg-red-50/40 text-red-600";
                    } else {
                      c += "border-neutral-200 text-neutral-400 hover:bg-neutral-50";
                    }

                    return (
                      <div key={dateStr} className="flex flex-col items-center space-y-1">
                        <div className={c}>
                          <span>{getDayLetter(dateStr)}</span>
                          <span className="font-bold text-[10px]">{parseDate(dateStr).getDate()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
