/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Habit, HabitSchedule } from '../types';

// Convert a Date object to YYYY-MM-DD in local time
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse quick date string YYYY-MM-DD into a local Date object at midnight
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Generate an array of YYYY-MM-DD strings for the past N days, ending today
export function getPastDates(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

// Find if a specific date is scheduled for a habit
export function isDateScheduled(habit: Habit, dateStr: string): boolean {
  const { type, daysOfWeek, intervalDays, intervalStart } = habit.schedule;
  const dateObj = parseDate(dateStr);
  const creationDateObj = parseDate(habit.createdAt);

  // If the date is before checking creation, not scheduled
  if (dateObj < creationDateObj) {
    return false;
  }

  if (type === 'daily') {
    return true;
  }

  if (type === 'weekly_days') {
    const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ...
    return daysOfWeek ? daysOfWeek.includes(day) : true;
  }

  if (type === 'interval') {
    const startStr = intervalStart || habit.createdAt;
    const startObj = parseDate(startStr);
    
    // Clear time parts to get accurate day difference
    const startMidnight = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
    const dateMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    const diffTime = dateMidnight.getTime() - startMidnight.getTime();
    if (diffTime < 0) return false; // Before interval start
    
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const step = intervalDays || 1;
    return diffDays % step === 0;
  }

  if (type === 'frequency') {
    // For frequency schedules (e.g. 3 times per week), every day is a potential active day,
    // and we measure compliance over the wider calendar block (week or month)
    // rather than individual specific days.
    return true;
  }

  return true;
}

/**
 * Advanced Habit Strength Algorithm.
 * Tracks habit score day-by-day from creation date up to today.
 * Returns the final score and historical scores for line charts.
 */
export function calculateHabitStrength(habit: Habit, limitDays = 30): {
  currentScore: number;
  history: { date: string; score: number }[];
} {
  const todayStr = formatDate(new Date());
  const creationDate = parseDate(habit.createdAt);
  const todayDate = parseDate(todayStr);

  // Calculate day difference between creation and today
  const diffTime = todayDate.getTime() - creationDate.getTime();
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  // We will run the day-by-day simulation
  let runningScore = 0;
  const scoresByDate: { [dateStr: string]: number } = {};

  // For frequency checking, we group completions by week or month index
  const getWeekIndex = (d: Date) => {
    // Return year + week number to uniquely group weeks
    const firstJan = new Date(d.getFullYear(), 0, 1);
    const dayNo = Math.ceil((d.getTime() - firstJan.getTime()) / (1000 * 60 * 60 * 24));
    const weekNo = Math.ceil((dayNo + firstJan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
  };

  const getMonthIndex = (d: Date) => {
    return `${d.getFullYear()}-${d.getMonth()}`;
  };

  // Pre-aggregate completions by week and month for frequency evaluation
  const completionsByWeek: { [weekId: string]: number } = {};
  const completionsByMonth: { [monthId: string]: number } = {};

  const completionsSet = new Set(habit.completions);
  const partialsSet = new Set(habit.partials || []);

  const allComps = Array.from(new Set([...habit.completions, ...(habit.partials || [])]));
  allComps.forEach((compDateStr) => {
    try {
      const d = parseDate(compDateStr);
      const wId = getWeekIndex(d);
      const mId = getMonthIndex(d);
      const weight = completionsSet.has(compDateStr) ? 1 : 0.5;
      completionsByWeek[wId] = (completionsByWeek[wId] || 0) + weight;
      completionsByMonth[mId] = (completionsByMonth[mId] || 0) + weight;
    } catch {
      // Ignored malformed dates
    }
  });

  // Run stimulation starting from creation date up to today
  const simDate = new Date(creationDate);
  for (let i = 0; i < totalDays; i++) {
    const currentSimStr = formatDate(simDate);
    const scheduled = isDateScheduled(habit, currentSimStr);
    const completed = completionsSet.has(currentSimStr);
    const partial = partialsSet.has(currentSimStr);

    if (habit.schedule.type === 'frequency') {
      // For frequency, we evaluate status differently.
      // If completed on today/this simulated day:
      if (completed) {
        runningScore = runningScore + (100 - runningScore) * 0.15;
      } else if (partial) {
        runningScore = runningScore + (100 - runningScore) * 0.07;
      } else {
        // Did we fail the target for the prior complete week/month?
        const period = habit.schedule.period || 'week';
        const target = habit.schedule.timesPerPeriod || 1;
        
        if (period === 'week') {
          const wId = getWeekIndex(simDate);
          const compInWeek = completionsByWeek[wId] || 0;
          
          // Check if it's the end of the week (Sunday = 0)
          if (simDate.getDay() === 0 && simDate < todayDate) {
            if (compInWeek < target) {
              // Missed goal for the week, penalize based on gap
              const gap = target - compInWeek;
              runningScore = runningScore * Math.pow(0.88, gap);
            } else {
              // Met goal! Minor reward at end of week
              runningScore = runningScore + (100 - runningScore) * 0.05;
            }
          }
        } else {
          // Month-based evaluation
          const nextDay = new Date(simDate);
          nextDay.setDate(simDate.getDate() + 1);
          const isLastDayOfMonth = nextDay.getMonth() !== simDate.getMonth();
          
          if (isLastDayOfMonth && simDate < todayDate) {
            const mId = getMonthIndex(simDate);
            const compInMonth = completionsByMonth[mId] || 0;
            if (compInMonth < target) {
              const gap = target - compInMonth;
              runningScore = runningScore * Math.pow(0.85, gap);
            } else {
              runningScore = runningScore + (100 - runningScore) * 0.08;
            }
          }
        }
      }
    } else {
      // Normal schedule (daily, weekly_days, interval)
      if (completed) {
        // Base growth
        runningScore = runningScore + (100 - runningScore) * 0.15;
      } else if (partial) {
        // Partial growth (half growth, prevents decay)
        runningScore = runningScore + (100 - runningScore) * 0.07;
      } else if (scheduled && simDate < todayDate) {
        // Missed scheduled day in the past. Standard decay.
        runningScore = runningScore * 0.90;
      }
    }

    // Keep score bounded
    runningScore = Math.max(0, Math.min(100, runningScore));
    scoresByDate[currentSimStr] = Math.round(runningScore);

    // Advance 1 day
    simDate.setDate(simDate.getDate() + 1);
  }

  // Generate historical data array for graph
  const historyDates = getPastDates(limitDays);
  const history = historyDates.map((date) => {
    // If the habit wasn't created yet on this date, score is 0.
    // If it is in the future, we don't have it, but getPastDates only gives dates up to today.
    let score = 0;
    const dateObj = parseDate(date);
    if (dateObj >= creationDate) {
      // Find the score for this date or the nearest previous simulated date
      score = scoresByDate[date] !== undefined ? scoresByDate[date] : 0;
      // In case simulation gap, find last computed score
      if (scoresByDate[date] === undefined) {
        let lookupDate = new Date(dateObj);
        while (lookupDate >= creationDate) {
          const lStr = formatDate(lookupDate);
          if (scoresByDate[lStr] !== undefined) {
            score = scoresByDate[lStr];
            break;
          }
          lookupDate.setDate(lookupDate.getDate() - 1);
        }
      }
    }
    return {
      date,
      score,
    };
  });

  return {
    currentScore: Math.round(runningScore),
    history,
  };
}

/**
 * Calculate Streaks.
 * Traces backwards to calculate current and longest streaks.
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export function getStreakStats(habit: Habit): StreakData {
  const todayStr = formatDate(new Date());
  const creationDate = parseDate(habit.createdAt);
  const todayDate = parseDate(todayStr);

  const completedSet = new Set(habit.completions);
  const partialsSet = new Set(habit.partials || []);
  const activeSet = new Set([...habit.completions, ...(habit.partials || [])]);

  // 1. Completion rate (completions vs total active scheduled days from creation up to today)
  let scheduledCount = 0;
  let completedScheduledCount = 0;

  const simDate = new Date(creationDate);
  const totalDays = Math.max(1, Math.ceil((todayDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  for (let i = 0; i < totalDays; i++) {
    const curStr = formatDate(simDate);
    const isScheduled = isDateScheduled(habit, curStr);
    
    if (isScheduled) {
      scheduledCount++;
      if (completedSet.has(curStr)) {
        completedScheduledCount++;
      } else if (partialsSet.has(curStr)) {
        completedScheduledCount += 0.5; // Partials count as 0.5 towards completion rate
      }
    }
    simDate.setDate(simDate.getDate() + 1);
  }

  const completionRate = scheduledCount > 0 
    ? Math.round((completedScheduledCount / scheduledCount) * 100) 
    : 0;

  // 2. Streaks based on scheduled days or consecutive physical completed days.
  // In most trackers, physical consecutive completions is what users expect, 
  // but if the schedule is e.g. Mon-Wed-Fri, the streak shouldn't break on Tuesday.
  // Let's implement a "Schedule-Aware Streak"
  // Run trace backwards check
  let currentStreak = 0;
  let runningStreak = 0;
  let longestStreak = 0;

  // Collect scheduled days from habit inception up to today
  const scheduledDates: string[] = [];
  const streakSimDate = new Date(creationDate);
  for (let i = 0; i < totalDays; i++) {
    const curStr = formatDate(streakSimDate);
    if (isDateScheduled(habit, curStr)) {
      scheduledDates.push(curStr);
    }
    streakSimDate.setDate(streakSimDate.getDate() + 1);
  }

  // Calculate longest and current streak by stepping forward through all scheduled dates
  let streakActive = 0;
  for (let i = 0; i < scheduledDates.length; i++) {
    const sDate = scheduledDates[i];
    const isToday = sDate === todayStr;
    const completedOrPartial = activeSet.has(sDate);

    if (completedOrPartial) {
      streakActive++;
      if (streakActive > longestStreak) {
        longestStreak = streakActive;
      }
    } else {
      // If today is scheduled and not completed yet, we do NOT break the streak 
      // of currentStreak yet (user has the rest of today). 
      // But if it's in the past and missed, the streak breaks.
      if (!isToday) {
        streakActive = 0;
      }
    }
  }

  // To calculate the current interactive streak:
  // We step backwards through the scheduled dates.
  let isCurrentStreakBroken = false;
  let backwardsStreak = 0;

  for (let i = scheduledDates.length - 1; i >= 0; i--) {
    const sDate = scheduledDates[i];
    const completedOrPartial = activeSet.has(sDate);
    const isToday = sDate === todayStr;

    if (completedOrPartial) {
      backwardsStreak++;
    } else {
      // If today is scheduled but not completed, we ignore it and check yesterday.
      if (isToday) {
        continue;
      } else {
        // A missed day in the past breaks the current streak
        isCurrentStreakBroken = true;
        break;
      }
    }
  }
  currentStreak = backwardsStreak;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    completionRate,
  };
}

/**
 * Get distribution of completions by day of the week (Sunday=0 to Saturday=6).
 */
export function getDayOfWeekDistribution(habit: Habit): number[] {
  const counts = Array(7).fill(0);
  habit.completions.forEach((dateStr) => {
    try {
      const d = parseDate(dateStr);
      const day = d.getDay();
      counts[day]++;
    } catch {
      // Ignore
    }
  });
  return counts;
}

/**
 * Export Habits to JSON backup.
 */
export function exportToJSON(habits: Habit[]): string {
  return JSON.stringify({
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    habits,
  }, null, 2);
}

/**
 * Export Habits to CSV table format.
 */
export function exportToCSV(habits: Habit[]): string {
  const headers = ['ID', 'Name', 'Description', 'Created At', 'Schedule Type', 'Color', 'Completions Count', 'Current Streak', 'Completion Rate %'];
  const rows = habits.map((habit) => {
    const stats = getStreakStats(habit);
    return [
      `"${habit.id}"`,
      `"${habit.name.replace(/"/g, '""')}"`,
      `"${habit.description.replace(/"/g, '""')}"`,
      `"${habit.createdAt}"`,
      `"${habit.schedule.type}"`,
      `"${habit.color}"`,
      habit.completions.length,
      stats.currentStreak,
      stats.completionRate,
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
