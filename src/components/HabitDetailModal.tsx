/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Edit, Trash2, Flame, TrendingUp, Calendar, Percent, Archive } from 'lucide-react';
import { Habit } from '../types';
import { getStreakStats, calculateHabitStrength } from '../utils/habitUtils';
import { CalendarGrid } from './CalendarGrid';
import { StrengthChart } from './StrengthChart';
import { FrequencyChart } from './FrequencyChart';

interface HabitDetailModalProps {
  habit: Habit;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleArchive: () => void;
  onUpdateDescription?: (id: string, desc: string) => void;
  onToggleDate?: (habitId: string, dateStr: string) => void;
  onUpdateCreatedAt?: (id: string, dateStr: string) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  onClose,
  onEdit,
  onDelete,
  onToggleArchive,
  onUpdateDescription,
  onToggleDate,
  onUpdateCreatedAt,
}) => {
  const [descValue, setDescValue] = React.useState(habit.description || '');
  const [isSaved, setIsSaved] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setDescValue(habit.description || '');
    setIsDeleting(false);
  }, [habit.id, habit.description]);

  const stats = getStreakStats(habit);
  const { currentScore } = calculateHabitStrength(habit);

  const colorMap = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-50', border: 'border-indigo-200' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-700', bgLight: 'bg-violet-50', border: 'border-violet-200' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-200' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-200' },
    slate: { bg: 'bg-slate-700', text: 'text-slate-700', bgLight: 'bg-slate-100', border: 'border-slate-300' },
  };

  const theme = colorMap[habit.color] || colorMap.emerald;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in" id="habit-detail-overlay">
      <div className="bg-white border border-neutral-200 shadow-2xl rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Banner/Header */}
        <div className={`p-6 text-white ${theme.bg} relative flex flex-col justify-between min-h-[140px]`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
                {habit.schedule.type.replace('_', ' ')}
              </span>
              <h2 className="font-sans font-bold text-2xl truncate max-w-lg">
                {habit.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-2 rounded-xl text-white/75 hover:bg-white/10 hover:text-white transition"
            >
              <X className="w-5 h-5 animate-scale-up" />
            </button>
          </div>

          <p className="text-white/85 text-xs font-sans max-w-2xl truncate mt-4">
            {descValue || 'No description designated.'}
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="bg-neutral-50 border-b border-neutral-200/60 px-4 sm:px-6 py-2.5 flex justify-between items-center text-xs gap-4 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap">
          <div className="flex items-center space-x-1 flex-shrink-0 text-neutral-500">
            <span className="font-sans italic mr-1">Created:</span>
            <input
              type="date"
              value={habit.createdAt}
              onChange={(e) => {
                if (e.target.value && onUpdateCreatedAt) {
                  onUpdateCreatedAt(habit.id, e.target.value);
                }
              }}
              className="px-2 py-0.5 bg-white border border-neutral-250 rounded-lg font-mono text-xs text-neutral-800 outline-none focus:ring-1 focus:ring-neutral-400 select-all"
              title="Change the creation date of this habit"
            />
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={onToggleArchive}
              className="p-1.5 px-3 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-600 font-medium flex items-center space-x-1.5 transition"
              type="button"
            >
              <Archive className="w-3.5 h-3.5 text-neutral-400" />
              <span>{habit.isArchived ? 'Activate' : 'Archive'}</span>
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 px-3 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-600 font-medium flex items-center space-x-1.5 transition"
              type="button"
            >
              <Edit className="w-3.5 h-3.5 text-neutral-400" />
              <span>Configure</span>
            </button>
            {isDeleting ? (
              <div className="flex items-center space-x-1.5 bg-red-50 hover:bg-neutral-50/50 border border-red-200/60 p-1 rounded-xl animate-fade-in">
                <span className="text-[10px] text-red-650 font-bold px-1.5 whitespace-nowrap">Really delete?</span>
                <button
                  onClick={onDelete}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-all"
                  type="button"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-neutral-200 rounded-lg text-[10px] font-bold transition-all"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsDeleting(true)}
                className="p-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 font-semibold flex items-center space-x-1.5 transition"
                type="button"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        {/* Deep Dive Content Panels */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Bento-grid of Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Stat 1: Habit Score / Strength */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-widest">
                <span>Habit strength</span>
                <TrendingUp className={`w-4 h-4 ${theme.text}`} />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-black text-neutral-850">
                  {currentScore}%
                </span>
                <p className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Chronological scoring strength index
                </p>
              </div>
            </div>

            {/* Stat 2: Current Streak */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-widest">
                <span>Current Streak</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-black text-neutral-850">
                  {stats.currentStreak} <span className="text-sm font-sans font-medium text-neutral-400">days</span>
                </span>
                <p className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Consecutive active targets accomplished
                </p>
              </div>
            </div>

            {/* Stat 3: Best Streak */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-widest">
                <span>Longest Streak</span>
                <Flame className="w-4 h-4 text-emerald-500 fill-emerald-50" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-black text-neutral-850">
                  {stats.longestStreak} <span className="text-sm font-sans font-medium text-neutral-400">days</span>
                </span>
                <p className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Your all-time streak milestone record
                </p>
              </div>
            </div>

            {/* Stat 4: Compliance / Completion Rate */}
            <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-widest">
                <span>Completion rate</span>
                <Percent className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-black text-neutral-850">
                  {stats.completionRate}%
                </span>
                <p className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Based on target scheduled sessions
                </p>
              </div>
            </div>

          </div>

          {/* Editable Description Section */}
          <div className="bg-neutral-50/50 border border-neutral-150 rounded-2xl p-5 space-y-2.5">
            <h4 className="font-sans font-bold text-xs text-neutral-500 uppercase tracking-wider block">
              Habit Definition & Description
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                placeholder="Describe your routine, action trigger, or the core benefit of this habit..."
                rows={2}
                className="flex-1 px-3.5 py-2.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-250 transition resize-none placeholder-neutral-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (onUpdateDescription) {
                    onUpdateDescription(habit.id, descValue);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                  }
                }}
                className={`sm:self-end px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isSaved 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                {isSaved ? 'Saved! ✓' : 'Save Text'}
              </button>
            </div>
          </div>

          {/* Charts area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Habit Strength Chart */}
            <StrengthChart habit={habit} />

            {/* Day of Week distribution bar chart */}
            <FrequencyChart habit={habit} />
          </div>

          {/* Full Grid Calendar block */}
          <CalendarGrid habit={habit} onToggleDate={(dateStr) => onToggleDate?.(habit.id, dateStr)} />

        </div>

        {/* Footer info banner */}
        <div className="px-6 py-4.5 bg-neutral-50 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-400 font-sans">
          <span>Reminders alert: {habit.reminders.length > 0 ? habit.reminders.join(', ') : 'No Alarms'}</span>
          <span className="font-semibold text-neutral-500">Secure Database Offline</span>
        </div>

      </div>
    </div>
  );
};
