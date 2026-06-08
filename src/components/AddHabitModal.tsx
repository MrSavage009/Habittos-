/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Trash2 } from 'lucide-react';
import { Habit, ScheduleType, HabitSchedule } from '../types';
import { formatDate } from '../utils/habitUtils';

interface AddHabitModalProps {
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  editingHabit?: Habit;
}

const COLORS: Habit['color'][] = ['emerald', 'blue', 'indigo', 'violet', 'amber', 'rose', 'slate'];

const DAYS_OF_WEEK = [
  { label: 'S', dayIndex: 0, fullName: 'Sunday' },
  { label: 'M', dayIndex: 1, fullName: 'Monday' },
  { label: 'T', dayIndex: 2, fullName: 'Tuesday' },
  { label: 'W', dayIndex: 3, fullName: 'Wednesday' },
  { label: 'T', dayIndex: 4, fullName: 'Thursday' },
  { label: 'F', dayIndex: 5, fullName: 'Friday' },
  { label: 'S', dayIndex: 6, fullName: 'Saturday' },
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onSave, editingHabit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<Habit['color']>('emerald');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  
  // Specific Days values
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default weekdays
  
  // Frequency values
  const [timesPerPeriod, setTimesPerPeriod] = useState(3);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // Interval values
  const [intervalDays, setIntervalDays] = useState(2);
  const [intervalStart, setIntervalStart] = useState(formatDate(new Date()));

  // Reminders
  const [newReminder, setNewReminder] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);

  // Setup form with existing values if editing
  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description);
      setColor(editingHabit.color);
      setScheduleType(editingHabit.schedule.type);
      setReminders(editingHabit.reminders || []);

      const sched = editingHabit.schedule;
      if (sched.daysOfWeek) setSelectedDays(sched.daysOfWeek);
      if (sched.timesPerPeriod) setTimesPerPeriod(sched.timesPerPeriod);
      if (sched.period) setPeriod(sched.period);
      if (sched.intervalDays) setIntervalDays(sched.intervalDays);
      if (sched.intervalStart) setIntervalStart(sched.intervalStart);
    }
  }, [editingHabit]);

  const handleAddReminder = () => {
    if (!newReminder) return;
    if (reminders.includes(newReminder)) return;
    setReminders([...reminders, newReminder].sort());
    setNewReminder('');
  };

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, idx) => idx !== index));
  };

  const handleDayToggle = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const schedule: HabitSchedule = {
      type: scheduleType,
    };

    if (scheduleType === 'weekly_days') {
      schedule.daysOfWeek = selectedDays.length > 0 ? selectedDays : [1, 2, 3, 4, 5, 6, 0];
    } else if (scheduleType === 'frequency') {
      schedule.timesPerPeriod = timesPerPeriod;
      schedule.period = period;
    } else if (scheduleType === 'interval') {
      schedule.intervalDays = intervalDays;
      schedule.intervalStart = intervalStart || formatDate(new Date());
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      schedule,
      reminders,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" id="add-edit-modal-backdrop">
      <div className="bg-white border border-neutral-200 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100">
          <h3 className="font-sans font-semibold text-lg text-neutral-900">
            {editingHabit ? 'Modify Habit Parameters' : 'Establish New Habit'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 px-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Name & Desc */}
          <div className="space-y-4">
            <div>
              <label htmlFor="habit-name-input" className="block text-xs font-mono font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
                Habit Title
              </label>
              <input
                id="habit-name-input"
                type="text"
                required
                placeholder="e.g., Morning Deep Breaths"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
              />
            </div>
            
            <div>
              <label htmlFor="habit-desc-input" className="block text-xs font-mono font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
                Purpose / Description
              </label>
              <textarea
                id="habit-desc-input"
                placeholder="Declare why you plan to build this habit..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition resize-none"
              />
            </div>
          </div>

          {/* Color swatches */}
          <div>
            <span className="block text-xs font-mono font-semibold text-neutral-400 mb-2.5 uppercase tracking-wider">
              Visual Color Accent
            </span>
            <div className="flex items-center gap-3">
              {COLORS.map((col) => {
                const colorClasses: Record<string, string> = {
                  emerald: 'bg-emerald-500 ring-emerald-300',
                  blue: 'bg-blue-500 ring-blue-300',
                  indigo: 'bg-indigo-500 ring-indigo-300',
                  violet: 'bg-violet-500 ring-violet-300',
                  amber: 'bg-amber-500 ring-amber-300',
                  rose: 'bg-rose-500 ring-rose-300',
                  slate: 'bg-slate-700 ring-slate-400',
                };
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`w-8 h-8 rounded-full border-2 border-white transition-all transform hover:scale-110 active:scale-95 ${colorClasses[col]} ${
                      color === col ? 'ring-4 shadow' : 'opacity-80'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Flexible Scheduling Options */}
          <div className="bg-neutral-50/50 p-4 border border-neutral-200/50 rounded-2xl space-y-4">
            <div>
              <label htmlFor="schedule-type-select" className="block text-xs font-mono font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Schedule Engine
              </label>
              <select
                id="schedule-type-select"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="daily">Every single day</option>
                <option value="weekly_days">Specific days of the week</option>
                <option value="frequency">Flexible times per week/month</option>
                <option value="interval">Repeating interval (every N days)</option>
              </select>
            </div>

            {/* Sub-panels depending on scheduleType */}
            {scheduleType === 'weekly_days' && (
              <div className="animate-fade-in space-y-2">
                <span className="block text-[11px] font-sans font-medium text-neutral-500">
                  Select Days of Active Tracking:
                </span>
                <div className="flex justify-between max-w-sm">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.dayIndex);
                    return (
                      <button
                        key={day.dayIndex}
                        type="button"
                        onClick={() => handleDayToggle(day.dayIndex)}
                        className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition ${
                          isSelected
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                        }`}
                        title={day.fullName}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {scheduleType === 'frequency' && (
              <div className="animate-fade-in flex items-center space-x-3 text-xs text-neutral-600">
                <span>Repeat</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={timesPerPeriod}
                  onChange={(e) => setTimesPerPeriod(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 px-2 py-1 bg-white border border-neutral-200 rounded-lg text-center font-mono font-bold"
                />
                <span>time(s) per</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
                  className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            )}

            {scheduleType === 'interval' && (
              <div className="animate-fade-in space-y-3 text-xs text-neutral-600">
                <div className="flex items-center space-x-2">
                  <span>Repeat once every</span>
                  <input
                    type="number"
                    min={2}
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-14 px-2 py-1 bg-white border border-neutral-200 rounded-lg text-center font-mono font-bold"
                  />
                  <span>days</span>
                </div>
                <div className="space-y-1">
                  <label htmlFor="interval-start-input" className="block text-[11px] font-sans font-medium text-neutral-500">
                    Anchor/Start Date:
                  </label>
                  <input
                    id="interval-start-input"
                    type="date"
                    value={intervalStart}
                    onChange={(e) => setIntervalStart(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interactive Reminders */}
          <div className="space-y-3">
            <span className="block text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
              Interactive Reminders
            </span>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                />
              </div>
              <button
                type="button"
                onClick={handleAddReminder}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-2xl text-neutral-700 text-xs font-sans font-medium flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Alert</span>
              </button>
            </div>

            {/* Active alerts display list */}
            {reminders.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 mt-2">
                {reminders.map((rem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-1.5 bg-neutral-100 border border-neutral-200/60 rounded-xl px-3 py-1 font-mono text-xs text-neutral-700 animate-scale-up"
                  >
                    <span>{rem}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReminder(idx)}
                      className="text-neutral-400 hover:text-red-500 transition p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400 italic">
                No reminders established yet (silent checklist mode).
              </p>
            )}
          </div>

        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <p className="text-[11px] text-neutral-400 font-sans italic">
            Privacy Guaranteed: stored offline.
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-2xl text-xs font-sans font-medium hover:bg-neutral-100 text-neutral-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-4 py-2 bg-neutral-900 border border-neutral-950 text-white rounded-2xl text-xs font-sans font-medium hover:bg-neutral-800 disabled:opacity-40 transition shadow-sm"
            >
              {editingHabit ? 'Save' : 'Establish'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
