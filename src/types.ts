/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScheduleType = 'daily' | 'weekly_days' | 'frequency' | 'interval';

export interface HabitSchedule {
  type: ScheduleType;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timesPerPeriod?: number; // e.g. 3
  period?: 'week' | 'month';
  intervalDays?: number; // e.g. 2 for every other day, 14 for every two weeks
  intervalStart?: string; // YYYY-MM-DD anchor date
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  createdAt: string; // YYYY-MM-DD
  schedule: HabitSchedule;
  reminders: string[]; // array of "HH:MM" strings
  completions: string[]; // array of "YYYY-MM-DD" strings representing checked-off days
  partials?: string[]; // array of "YYYY-MM-DD" strings representing partial checkmarks (➖)
  color: 'emerald' | 'blue' | 'indigo' | 'violet' | 'amber' | 'rose' | 'slate';
  isArchived?: boolean;
}

export interface InAppNotification {
  id: string;
  habitId: string;
  habitName: string;
  time: string; // "HH:MM"
  timestamp: string; // ISO date string of scheduled time today
  status: 'active' | 'completed' | 'snoozed' | 'dismissed';
}

export interface WidgetInstance {
  id: string;
  type: 'checklist' | 'streak' | 'grid';
  habitId?: string; // required for streak and grid
  title: string;
}
