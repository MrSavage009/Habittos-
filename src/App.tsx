/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Download, 
  Upload, 
  Archive, 
  BookOpen, 
  Bell, 
  Check, 
  Heart,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Habit, InAppNotification } from './types';
import { 
  formatDate, 
  getPastDates, 
  isDateScheduled, 
  getStreakStats, 
  calculateHabitStrength, 
  exportToJSON, 
  exportToCSV,
  parseDate
} from './utils/habitUtils';

// Modular Component imports
import { AddHabitModal } from './components/AddHabitModal';
import { HabitDetailModal } from './components/HabitDetailModal';
import { WidgetPanel } from './components/WidgetPanel';
import { NotificationCenter } from './components/NotificationCenter';

// Pre-packaged seed data logic based on local date (2026-06-08)
function generateSeeds(): Habit[] {
  const seeds: Habit[] = [
    {
      id: 'seed-1',
      name: 'Mindful Meditation',
      description: 'Strengthen focus, lower stress, and enhance mindful awareness in daily moments.',
      createdAt: '2026-05-15',
      schedule: { type: 'daily' },
      reminders: ['08:00', '21:30'],
      completions: [
        '2026-05-15', '2026-05-16', '2026-05-18', '2026-05-19', '2026-05-20',
        '2026-05-21', '2026-05-22', '2026-05-24', '2026-05-25', '2026-05-26',
        '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01',
        '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06',
        '2026-06-07', '2026-06-08'
      ],
      color: 'emerald',
    },
    {
      id: 'seed-2',
      name: 'Structured Gym Workout',
      description: 'Resistance training for joint health, physical strength, and general stamina.',
      createdAt: '2026-05-10',
      schedule: {
        type: 'weekly_days',
        daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
      },
      reminders: ['17:30'],
      completions: [
        '2026-05-11', '2026-05-13', '2026-05-15', '2026-05-18', '2026-05-20',
        '2026-05-22', '2026-05-25', '2026-05-27', '2026-05-29', '2026-06-01',
        '2026-06-03', '2026-06-05', '2026-06-08'
      ],
      color: 'blue',
    },
    {
      id: 'seed-3',
      name: 'High Intensity Reading',
      description: 'Expose mind to new concepts, deep philosophy, and active non-fiction material.',
      createdAt: '2026-05-20',
      schedule: {
        type: 'interval',
        intervalDays: 2, // Every other day
        intervalStart: '2026-05-20'
      },
      reminders: ['09:00'],
      completions: [
        '2026-05-20', '2026-05-22', '2026-05-24', '2026-05-26', '2026-05-28',
        '2026-05-30', '2026-06-01', '2026-06-03', '2026-06-05', '2026-06-07'
      ],
      color: 'violet',
    }
  ];

  // Adjust dates relative to the user's actual current local year & month if necessary, 
  // but since we hardcode local date to 2026-06-08 in this environment, this matches perfectly!
  return seeds;
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'analytics' | 'simulator'>('habits');

  // Dynamic Design Studio Theme States
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('habittos_theme_mode') as 'light' | 'dark') || 'light';
  });
  const [colorTheme, setColorTheme] = useState<'classic' | 'cyber' | 'sunset' | 'ocean' | 'orchid'>(() => {
    return (localStorage.getItem('habittos_color_theme') as 'classic' | 'cyber' | 'sunset' | 'ocean' | 'orchid') || 'classic';
  });
  const [glowMode, setGlowMode] = useState<'none' | 'subtle' | 'surge'>(() => {
    return (localStorage.getItem('habittos_glow_mode') as 'none' | 'subtle' | 'surge') || 'subtle';
  });
  const [showThemeStudio, setShowThemeStudio] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState<boolean>(() => {
    return localStorage.getItem('habittos_show_descriptions') !== 'false';
  });

  // Sync design states with browser cache
  useEffect(() => {
    localStorage.setItem('habittos_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('habittos_color_theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('habittos_glow_mode', glowMode);
  }, [glowMode]);

  useEffect(() => {
    localStorage.setItem('habittos_show_descriptions', String(showDescriptions));
  }, [showDescriptions]);

  // Modal States
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load state on mount
  useEffect(() => {
    const cached = localStorage.getItem('habittos_db');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.habits)) {
          setHabits(parsed.habits);
        } else {
          const seeds = generateSeeds();
          setHabits(seeds);
          saveToCache(seeds);
        }
      } catch {
        const seeds = generateSeeds();
        setHabits(seeds);
        saveToCache(seeds);
      }
    } else {
      const seeds = generateSeeds();
      setHabits(seeds);
      saveToCache(seeds);
    }

    const cachedNotifs = localStorage.getItem('habittos_notifs');
    if (cachedNotifs) {
      try {
        setNotifications(JSON.parse(cachedNotifs));
      } catch {
        // Ignore
      }
    }
  }, []);

  const saveToCache = (newHabits: Habit[]) => {
    localStorage.setItem('habittos_db', JSON.stringify({ habits: newHabits }));
  };

  const saveNotifsToCache = (newNotifs: InAppNotification[]) => {
    localStorage.setItem('habittos_notifs', JSON.stringify(newNotifs));
  };

  // Toggle completion on a date
  const handleToggleCompletion = (habitId: string, dateStr: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        let completions = [...h.completions];
        let partials = h.partials ? [...h.partials] : [];

        const hasComp = completions.includes(dateStr);
        const hasPart = partials.includes(dateStr);

        if (!hasComp && !hasPart) {
          // Unmarked -> Completed (✅)
          completions.push(dateStr);
        } else if (hasComp) {
          // Completed (✅) -> Partial (➖)
          completions = completions.filter(d => d !== dateStr);
          partials.push(dateStr);
        } else if (hasPart) {
          // Partial (➖) -> Unmarked (❌)
          partials = partials.filter(d => d !== dateStr);
        }

        return {
          ...h,
          completions,
          partials,
        };
      }
      return h;
    });

    setHabits(updated);
    saveToCache(updated);

    // If detail modal is open for this habit, refresh it
    if (selectedHabitForDetail && selectedHabitForDetail.id === habitId) {
      const match = updated.find((h) => h.id === habitId);
      if (match) {
        setSelectedHabitForDetail(match);
      }
    }
  };

  // Add or Edit Habit Callback
  const handleSaveHabit = (data: Partial<Habit>) => {
    if (editingHabit) {
      // Modify
      const updated = habits.map((h) => {
        if (h.id === editingHabit.id) {
          return {
            ...h,
            ...data,
          } as Habit;
        }
        return h;
      });
      setHabits(updated);
      saveToCache(updated);
      setEditingHabit(undefined);

      // Refresh opened detail
      if (selectedHabitForDetail && selectedHabitForDetail.id === editingHabit.id) {
        const match = updated.find(h => h.id === editingHabit.id);
        if (match) setSelectedHabitForDetail(match);
      }
    } else {
      // Create
      const newHabit: Habit = {
        id: 'habit-' + Date.now().toString(),
        name: data.name || 'Untitled Habit',
        description: data.description || '',
        createdAt: formatDate(new Date()),
        schedule: data.schedule || { type: 'daily' },
        reminders: data.reminders || [],
        completions: [],
        color: data.color || 'emerald',
      };
      const updated = [newHabit, ...habits];
      setHabits(updated);
      saveToCache(updated);
    }
    setIsAddingHabit(false);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    saveToCache(updated);
    setSelectedHabitForDetail(null);
  };

  const handleToggleArchive = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        return { ...h, isArchived: !h.isArchived };
      }
      return h;
    });
    setHabits(updated);
    saveToCache(updated);
    
    const refreshedMatch = updated.find(h => h.id === id);
    if (refreshedMatch && selectedHabitForDetail?.id === id) {
      setSelectedHabitForDetail(refreshedMatch);
    }
  };

  // Notification Shade Controllers
  const triggerDemoNotification = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newNotif: InAppNotification = {
      id: 'notif-' + Date.now().toString(),
      habitId: habit.id,
      habitName: habit.name,
      time: habit.reminders[0] || '08:00',
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveNotifsToCache(updated);
  };

  const updateNotificationStatus = (notifId: string, status: InAppNotification['status']) => {
    const updated = notifications.map((n) => {
      if (n.id === notifId) {
        return { ...n, status };
      }
      return n;
    });
    setNotifications(updated);
    saveNotifsToCache(updated);
  };

  // Export File backup triggers
  const handleExportJSON = () => {
    const jsonStr = exportToJSON(habits);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habittos_backup_${formatDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(habits);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habittos_report_${formatDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.habits)) {
          setHabits(parsed.habits);
          saveToCache(parsed.habits);
          alert('Backup restored successfully!');
        } else if (Array.isArray(parsed)) {
          setHabits(parsed);
          saveToCache(parsed);
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup structure.');
        }
      } catch (err) {
        console.error(err);
        alert('Invalid backup file formatting.');
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateDescription = (id: string, description: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        return { ...h, description };
      }
      return h;
    });
    setHabits(updated);
    saveToCache(updated);
    const refreshedMatch = updated.find(h => h.id === id);
    if (refreshedMatch && selectedHabitForDetail?.id === id) {
      setSelectedHabitForDetail(refreshedMatch);
    }
  };

  const handleUpdateCreatedAt = (id: string, createdAt: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        return { ...h, createdAt };
      }
      return h;
    });
    setHabits(updated);
    saveToCache(updated);
    const refreshedMatch = updated.find(h => h.id === id);
    if (refreshedMatch && selectedHabitForDetail?.id === id) {
      setSelectedHabitForDetail(refreshedMatch);
    }
  };

  // Helper selectors
  const filteredHabits = habits.filter(h => showArchived ? h.isArchived : !h.isArchived);
  const activeHabitsCount = habits.filter(h => !h.isArchived).length;
  const averageStrength = activeHabitsCount > 0
    ? Math.round(habits.filter(h => !h.isArchived).reduce((acc, h) => acc + calculateHabitStrength(h).currentScore, 0) / activeHabitsCount)
    : 0;
  const trackingDates = getPastDates(21); // Past 21 days for checklist track

  // Map theme colors
  const borderRingMap: Record<string, string> = {
    emerald: 'border-emerald-200 text-emerald-600 bg-emerald-50/50',
    blue: 'border-blue-200 text-blue-600 bg-blue-50/50',
    violet: 'border-violet-200 text-violet-600 bg-violet-50/50',
    rose: 'border-rose-200 text-rose-600 bg-rose-50/50',
    amber: 'border-amber-200 text-amber-600 bg-amber-50/50',
  };

  const badgeThemeMap: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-150 text-emerald-700',
    blue: 'bg-blue-50 border-blue-150 text-blue-700',
    violet: 'bg-violet-50 border-violet-150 text-violet-700',
    rose: 'bg-rose-50 border-rose-150 text-rose-700',
    amber: 'bg-amber-50 border-amber-150 text-amber-700',
  };

  const themeStyles = React.useMemo(() => {
    const isDark = themeMode === 'dark';
    const darkClass = isDark ? 'dark-mode-override' : '';
    let brandColor = '#10b981';
    let glowShadow = 'none';

    switch (colorTheme) {
      case 'cyber':
        brandColor = '#f43f5e';
        break;
      case 'sunset':
        brandColor = '#f97316';
        break;
      case 'ocean':
        brandColor = '#06b6d4';
        break;
      case 'orchid':
        brandColor = '#d946ef';
        break;
      default:
        brandColor = '#10b981';
    }

    if (glowMode === 'subtle') {
      glowShadow = `0 4px 12px rgba(0, 0, 0, 0.05)`;
    } else if (glowMode === 'surge') {
      glowShadow = `0 8px 24px rgba(0, 0, 0, 0.12), 0 0 16px -2px ${brandColor}40`;
    }

    const styleString = `
      #main-scaffold {
        --brand-color: ${brandColor};
        --glow-shadow: ${glowShadow};
        --bg-main: ${isDark ? '#0e0e11' : '#f5f5f7'};
        --bg-card: ${isDark ? '#16161a' : '#ffffff'};
        --bg-neutral-50: ${isDark ? '#1c1c22' : '#fafafa'};
        --bg-neutral-100: ${isDark ? '#23232c' : '#f4f4f5'};
        --bg-neutral-150: ${isDark ? '#2c2c37' : '#e4e4e7'};
        --bg-neutral-200: ${isDark ? '#363645' : '#e4e4e7'};
        --text-primary: ${isDark ? '#f4f4f5' : '#18181b'};
        --text-secondary: ${isDark ? '#a1a1aa' : '#71717a'};
        --text-subtle: ${isDark ? '#71717a' : '#a1a1aa'};
        --border-main: ${isDark ? '#2a2a35' : '#e4e4e7'};

        /* Extreme High Contrast Checklist states for dark mode */
        --cell-done-bg: ${isDark ? 'rgba(16, 185, 129, 0.22)' : '#ecfdf5'};
        --cell-done-border: ${isDark ? '#10b981' : '#a7f3d0'};
        --cell-done-text: ${isDark ? '#34d399' : '#064e3b'};

        --cell-partial-bg: ${isDark ? 'rgba(245, 158, 11, 0.22)' : '#fffbeb'};
        --cell-partial-border: ${isDark ? '#f59e0b' : '#fde68a'};
        --cell-partial-text: ${isDark ? '#fbbf24' : '#78350f'};

        --cell-unmarked-bg: ${isDark ? '#16161a' : '#fafafa'};
        --cell-unmarked-border: ${isDark ? '#2a2a35' : '#e4e4e7'};
        --cell-unmarked-text: ${isDark ? '#a1a1aa' : '#71717a'};

        --cell-unscheduled-bg: ${isDark ? 'rgba(255, 255, 255, 0.03)' : '#f5f5f7'};
        --cell-unscheduled-border: ${isDark ? '#1c1c22' : '#e4e4e7'};
        --cell-unscheduled-text: ${isDark ? '#4b5563' : '#a1a1aa'};
      }
      #main-scaffold.dark-mode-override {
        background-color: var(--bg-main) !important;
        color: var(--text-primary) !important;
      }
      #main-scaffold.dark-mode-override .bg-white,
      #main-scaffold.dark-mode-override article,
      #main-scaffold.dark-mode-override #theme-design-studio,
      #main-scaffold.dark-mode-override #habits-list-panel {
        background-color: var(--bg-card) !important;
        border-color: var(--border-main) !important;
        color: var(--text-primary) !important;
      }
      #main-scaffold.dark-mode-override header.bg-white {
        background-color: var(--bg-card) !important;
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-50,
      #main-scaffold.dark-mode-override .bg-neutral-50\\/50,
      #main-scaffold.dark-mode-override .bg-neutral-53\\/10,
      #calendar-view-container {
        background-color: var(--bg-neutral-50) !important;
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-100,
      #main-scaffold.dark-mode-override #app-tab-navigation,
      #main-scaffold.dark-mode-override #theme-design-studio .grid .bg-neutral-100 {
        background-color: var(--bg-neutral-100) !important;
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-150 {
        background-color: var(--bg-neutral-150) !important;
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-200,
      #main-scaffold.dark-mode-override .bg-neutral-200\\/60 {
        background-color: var(--bg-neutral-200) !important;
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override input,
      #main-scaffold.dark-mode-override select,
      #main-scaffold.dark-mode-override textarea {
        background-color: var(--bg-neutral-100) !important;
        border-color: var(--border-main) !important;
        color: var(--text-primary) !important;
      }
      #main-scaffold.dark-mode-override .text-neutral-900,
      #main-scaffold.dark-mode-override .text-neutral-800,
      #main-scaffold.dark-mode-override .text-neutral-850,
      #main-scaffold.dark-mode-override h1,
      #main-scaffold.dark-mode-override h2,
      #main-scaffold.dark-mode-override h3,
      #main-scaffold.dark-mode-override h4 {
        color: var(--text-primary) !important;
      }
      #main-scaffold.dark-mode-override .text-neutral-500,
      #main-scaffold.dark-mode-override .text-neutral-600,
      #main-scaffold.dark-mode-override .text-neutral-550,
      #main-scaffold.dark-mode-override .text-neutral-450 {
        color: var(--text-secondary) !important;
      }
      #main-scaffold.dark-mode-override .text-neutral-400 {
        color: var(--text-subtle) !important;
      }
      #main-scaffold.dark-mode-override .border-neutral-200,
      #main-scaffold.dark-mode-override .border-neutral-250,
      #main-scaffold.dark-mode-override .border-neutral-150,
      #main-scaffold.dark-mode-override .border-neutral-100 {
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-900 {
        background-color: var(--text-primary) !important;
        color: var(--bg-main) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-900:hover {
        background-color: #ffffff !important;
      }
      #main-scaffold.dark-mode-override button.bg-white,
      #main-scaffold.dark-mode-override a.bg-white {
        background-color: var(--bg-neutral-100) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-main) !important;
      }
      #main-scaffold.dark-mode-override button.bg-white:hover,
      #main-scaffold.dark-mode-override a.bg-white:hover {
        background-color: var(--bg-neutral-150) !important;
      }

      /* Navigation high contrast tabs active override */
      #main-scaffold.dark-mode-override #app-tab-navigation button.bg-white {
        background-color: var(--bg-card) !important;
        color: var(--text-primary) !important;
        border-color: var(--brand-color) !important;
        border-width: 1px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45) !important;
      }

      /* Hover states overlays */
      #main-scaffold.dark-mode-override .hover\\:bg-neutral-50:hover,
      #main-scaffold.dark-mode-override .hover\\:bg-neutral-100:hover {
        background-color: var(--bg-neutral-150) !important;
        color: var(--text-primary) !important;
      }

      /* Overriding 3-state tick cells inside Checklist tracker */
      #main-scaffold.dark-mode-override .bg-emerald-50,
      #main-scaffold.dark-mode-override .bg-emerald-50\\/50 {
        background-color: var(--cell-done-bg) !important;
        border-color: var(--cell-done-border) !important;
        color: var(--cell-done-text) !important;
      }
      #main-scaffold.dark-mode-override .bg-amber-50,
      #main-scaffold.dark-mode-override .bg-amber-50\\/50 {
        background-color: var(--cell-partial-bg) !important;
        border-color: var(--cell-partial-border) !important;
        color: var(--cell-partial-text) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-50:not(button, section, option),
      #main-scaffold.dark-mode-override .bg-neutral-50\\/50:not(button, section) {
        background-color: var(--cell-unmarked-bg) !important;
        border-color: var(--cell-unmarked-border) !important;
        color: var(--text-primary) !important;
      }
      #main-scaffold.dark-mode-override .bg-neutral-100\\/60 {
        background-color: var(--cell-unscheduled-bg) !important;
        border-color: var(--cell-unscheduled-border) !important;
        color: var(--cell-unscheduled-text) !important;
        opacity: 0.8 !important;
      }

      /* Overriding CalendarGrid date labels & tiles */
      #main-scaffold.dark-mode-override #calendar-view-container button {
        color: var(--text-primary) !important;
      }
      #main-scaffold.dark-mode-override #calendar-view-container button:disabled {
        opacity: 0.25 !important;
      }
      #main-scaffold.dark-mode-override .text-red-700 {
        color: #fca5a5 !important;
      }
      #main-scaffold.dark-mode-override .bg-red-500\\/5 {
        background-color: rgba(239, 68, 68, 0.25) !important;
        border-color: rgba(239, 68, 68, 0.45) !important;
      }
      #main-scaffold.dark-mode-override .text-amber-600 {
        color: #fbbf24 !important;
      }
      #main-scaffold.dark-mode-override .text-blue-600 {
        color: #60a5fa !important;
      }
      #main-scaffold.dark-mode-override .text-emerald-600 {
        color: #34d399 !important;
      }

      /* Dialog Overlays and Modals and backdrop */
      #main-scaffold.dark-mode-override #habit-detail-overlay,
      #main-scaffold.dark-mode-override #add-edit-modal-backdrop {
        background-color: rgba(0, 0, 0, 0.75) !important;
        backdrop-filter: blur(8px) !important;
      }
      #main-scaffold.dark-mode-override #habit-detail-overlay .bg-white,
      #main-scaffold.dark-mode-override #add-edit-modal-backdrop .bg-white {
        background-color: var(--bg-card) !important;
        border-color: var(--border-main) !important;
        color: var(--text-primary) !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
      }

      #main-scaffold .bg-white,
      #main-scaffold article,
      #habits-list-panel {
        background-color: var(--bg-card) !important;
        border-color: var(--border-main) !important;
        box-shadow: var(--glow-shadow) !important;
      }
      #habits-list-panel .habit-row {
        border-color: var(--border-main) !important;
        transition: all 0.2s ease !important;
      }
      #habits-list-panel .habit-row:not(:last-child) {
        border-bottom: 1.5px solid var(--border-main) !important;
      }
      #habits-list-panel .habit-row:hover {
        background-color: rgba(100, 100, 100, 0.02) !important;
      }
      #main-scaffold.dark-mode-override #habits-list-panel .habit-row:hover {
        background-color: rgba(255, 255, 255, 0.015) !important;
      }
      #habit-detail-overlay .bg-white,
      #add-edit-modal-backdrop .bg-white {
        box-shadow: var(--glow-shadow) !important;
      }
    `;

    return { darkClass, styleString, brandColor };
  }, [themeMode, colorTheme, glowMode]);

  return (
    <div className={`min-h-screen bg-neutral-100 text-neutral-850 flex flex-col items-center py-4 sm:py-6 px-3 sm:px-4 select-none ${themeStyles.darkClass}`} id="main-scaffold" style={{ fontFamily: 'var(--font-sans)', fontSmoothing: 'antialiased' }}>
      <style dangerouslySetInnerHTML={{ __html: themeStyles.styleString }} />

      {/* Container Wrapper */}
      <div className="w-full max-w-6xl space-y-3">

        {/* Header toolbar */}
        <header className="bg-white border border-neutral-200 shadow-sm rounded-[24px] px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col gap-2.5" id="main-header">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <h1 className="font-sans font-black text-lg tracking-tight text-neutral-900 flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-stone-700 fill-stone-50 animate-spin-slow" />
                <span>Habittos</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              <button
                onClick={() => {
                  setEditingHabit(undefined);
                  setIsAddingHabit(true);
                }}
                className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-xs font-sans font-bold flex items-center space-x-1 transition shadow-sm select-none"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>

              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium border flex items-center space-x-1 transition ${
                  showArchived
                    ? 'bg-neutral-200 border-neutral-300 text-neutral-850 font-bold'
                    : 'bg-white border-neutral-250 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Archive className="w-3 h-3" />
                <span>{showArchived ? 'Active' : 'Archived'}</span>
              </button>

              <button
                onClick={() => setShowThemeStudio(!showThemeStudio)}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold border flex items-center space-x-1 transition ${
                  showThemeStudio
                    ? 'bg-neutral-200 border-neutral-300 btn-glow-active'
                    : 'bg-white border-neutral-250 hover:bg-neutral-50'
                }`}
                style={{ borderColor: showThemeStudio ? 'var(--brand-color)' : '' }}
              >
                <span>Design</span>
              </button>

              {/* Backup controllers */}
              <div className="flex items-center space-x-0.5 border border-neutral-250 rounded-lg bg-white p-0.5">
                <button
                  onClick={handleExportJSON}
                  className="p-1 hover:bg-neutral-150 rounded text-neutral-500 hover:text-neutral-700 transition"
                  title="Backup XML-safe database to JSON"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="p-1 hover:bg-neutral-150 rounded text-neutral-450 hover:text-neutral-700 transition"
                  title="Export spreadsheet CSV table"
                >
                  <TrendingUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-neutral-150 rounded text-neutral-450 hover:text-neutral-700 transition border-l border-neutral-150"
                  title="Restore JSON template backup"
                >
                  <Upload className="w-3 h-3" />
                </button>
                <input
                  id="file-import-trigger"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  className="hidden"
                  accept=".json"
                />
              </div>
            </div>
          </div>

          {/* Connected Navigation Tab Segment Control kept inside the header top box directly with compact styles */}
          <nav className="flex bg-neutral-100 p-0.5 rounded-lg w-full border border-neutral-200/50 text-[10.5px] font-sans font-bold" id="app-tab-navigation">
            <button
              type="button"
              onClick={() => setActiveTab('habits')}
              className={`flex-1 py-0.5 sm:py-1 px-1.5 text-center rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'habits'
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/20'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              style={{
                color: activeTab === 'habits' ? 'var(--text-primary)' : ''
              }}
            >
              📋 {activeTab === 'habits' ? 'Checklist Tracker' : 'List'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-0.5 sm:py-1 px-1.5 text-center rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'analytics'
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/20'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              style={{
                color: activeTab === 'analytics' ? 'var(--text-primary)' : ''
              }}
            >
              📊 {activeTab === 'analytics' ? 'Progress Analytics' : 'Stats'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-0.5 sm:py-1 px-1.5 text-center rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'simulator'
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/20'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              style={{
                color: activeTab === 'simulator' ? 'var(--text-primary)' : ''
              }}
            >
              ⚙️ {activeTab === 'simulator' ? 'Simulator Sandbox' : 'Sim'}
            </button>
          </nav>
        </header>

        {/* Collapsible Design Studio Settings Panel */}
        {showThemeStudio && (
          <section className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-5 space-y-4 animate-fade-in animate-duration-150" id="theme-design-studio">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-150 pb-3 gap-2">
              <div>
                <h3 className="font-sans font-extrabold text-sm flex items-center gap-2">
                  <span>🎨 Design & Glow Override Studio</span>
                  <span className="text-[8px] bg-indigo-500 text-white rounded-full px-1.5 py-0.5 uppercase tracking-wider font-mono">Real-Time</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Select background modes, preset color palettes, and glow strengths.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setThemeMode('light');
                  setColorTheme('classic');
                  setGlowMode('subtle');
                }}
                className="text-[10px] font-mono font-bold text-neutral-400 hover:text-neutral-600 transition underline tracking-wider"
              >
                RESET VALUES
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Sector 1: Brightness Mode */}
              <div className="space-y-2.5 pb-3 md:pb-0 md:border-r md:pr-5 border-neutral-150">
                <span className="block text-[9px] font-mono font-bold tracking-widest uppercase text-neutral-400">
                  1. Mode Override
                </span>

                <div className="flex p-0.5 rounded-xl border border-neutral-200 bg-neutral-100">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                      themeMode === 'light'
                        ? 'bg-white text-neutral-900 border border-neutral-200/50 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    LIGHT
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                      themeMode === 'dark'
                        ? 'bg-neutral-850 text-white'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    DARK
                  </button>
                </div>
              </div>

              {/* Sector 2: Preset Color Palette */}
              <div className="space-y-2.5 pb-3 md:pb-0 md:border-r md:pr-5 border-neutral-150">
                <span className="block text-[9px] font-mono font-bold tracking-widest uppercase text-neutral-400">
                  2. Aura Presets
                </span>

                <div className="grid grid-cols-5 gap-1 bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                  {(['classic', 'cyber', 'sunset', 'ocean', 'orchid'] as const).map((thm) => {
                    const presetLabelMap: Record<string, string> = {
                      classic: 'GRN',
                      cyber: 'PIN',
                      sunset: 'ORN',
                      ocean: 'CYN',
                      orchid: 'FUC'
                    };
                    return (
                      <button
                        key={thm}
                        type="button"
                        onClick={() => setColorTheme(thm)}
                        className={`py-1.5 text-center text-[9px] font-mono font-bold rounded-lg transition-all ${
                          colorTheme === thm
                            ? 'bg-white text-neutral-900 border border-neutral-200/50 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {presetLabelMap[thm]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sector 3: Glow Strengths */}
              <div className="space-y-2.5">
                <span className="block text-[9px] font-mono font-bold tracking-widest uppercase text-neutral-400">
                  3. Bloom/Glow Intensity
                </span>

                <div className="flex p-0.5 rounded-xl border border-neutral-200 bg-neutral-100">
                  {(['none', 'subtle', 'surge'] as const).map((glw) => (
                    <button
                      key={glw}
                      type="button"
                      onClick={() => setGlowMode(glw)}
                      className={`flex-1 py-1.5 text-center text-[9px] font-bold rounded-lg transition-all ${
                        glowMode === glw
                          ? 'bg-white text-neutral-900 border border-neutral-200/50 shadow-sm font-black'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {glw.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sector 4: About information */}
              <div className="space-y-2.5 md:col-span-3 border-t border-neutral-100 pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="block text-[9.5px] font-sans font-bold uppercase tracking-widest text-neutral-450 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-neutral-450" />
                    About Habittos
                  </span>
                  <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
                    Habittos is a modern, privacy-first routine tracker. It preserves data 100% offline using your local storage sandbox, and offers high-fidelity visual statistics, flexible reminders, and 3-state tick logs for consistent growth.
                  </p>
                </div>
                <div className="flex flex-col gap-0.5 text-[10px] font-mono text-neutral-400 text-right shrink-0">
                  <span>Version 2.4.0 (Stable)</span>
                  <span>UTC Synchronized</span>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Dynamic Display based on activeTab */}
        {activeTab === 'habits' && (
          <main className="space-y-4 animate-fade-in" id="active-checklist-tab">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-neutral-200/40 gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-sans font-bold text-xs tracking-tight text-neutral-500 uppercase">
                  {showArchived ? 'Archived Offline Vault' : 'Active Habits Checklist'} ({filteredHabits.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowDescriptions(!showDescriptions)}
                  className="px-2 py-0.5 rounded border border-neutral-250 bg-white text-[9px] font-mono hover:bg-neutral-50 hover:text-neutral-900 transition-all text-neutral-500 font-bold shadow-sm select-none"
                  title="Toggle show/hide description block to save vertical margins"
                >
                  {showDescriptions ? '👁️ Hide Desc' : '👁️ Show Desc'}
                </button>
              </div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                Tap title to edit parameters • Click cell emoji to record: ❌ ➔ ✅ ➔ ➖
              </span>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                <Calendar className="w-10 h-10 text-neutral-300 mx-auto" />
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="font-sans font-semibold text-sm text-neutral-800">
                    {showArchived ? 'No archived habits found' : 'The checklist is empty'}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-normal">
                    {showArchived 
                      ? 'You have not archived any habit records yet.'
                      : 'Build a durable routine! Click "Establish Habit" above to configure your schedules.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden" id="habits-list-panel">
                {filteredHabits.map((habit) => {
                  const stats = getStreakStats(habit);
                  const { currentScore } = calculateHabitStrength(habit);
                  const ringClass = borderRingMap[habit.color] || borderRingMap.emerald;
                  const badgeClass = badgeThemeMap[habit.color] || badgeThemeMap.emerald;
                  const reversedTrackingDates = [...trackingDates].reverse();

                  return (
                    <div
                      key={habit.id}
                      className="habit-row p-4.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
                    >
                      {/* Left: Name and parameters click trigger info detailed modal */}
                      <div 
                        onClick={() => setSelectedHabitForDetail(habit)}
                        className="space-y-1.5 cursor-pointer group flex-1 min-w-[200px]"
                        title="Tapping the title gives detailed habit overview with analytics"
                      >
                        {/* 1. Daily/interval, reminder time, Streak, percentage rate */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className={`text-[9px] font-mono font-bold tracking-widest uppercase border rounded px-1.5 py-0.5 leading-none ${badgeClass}`}>
                            {habit.schedule.type.replace('_', ' ')}
                          </span>
                          {habit.reminders.length > 0 && (
                            <span className="font-mono text-[9px] text-neutral-400 bg-neutral-100 rounded-md px-1.5 leading-none py-0.5 flex items-center space-x-1">
                              <Bell className="w-2.5 h-2.5 text-neutral-400" />
                              <span>{habit.reminders[0]}</span>
                            </span>
                          )}
                          <span className="text-neutral-300 font-mono text-[9px] select-none">•</span>
                          <span className="flex items-center text-amber-600 font-mono text-[10px] font-bold uppercase gap-0.5">
                            🔥 {stats.currentStreak}d Streak
                          </span>
                          <span className="text-neutral-300 font-mono text-[9px] select-none">•</span>
                          <span className="flex items-center text-blue-600 font-mono text-[10px] font-bold uppercase gap-0.5">
                            📈 {stats.completionRate}% Rate
                          </span>
                        </div>

                        {/* 2. Title */}
                        <div>
                          <h3 className="font-sans font-extrabold text-sm sm:text-base text-neutral-850 group-hover:text-black transition flex items-center gap-1 leading-relaxed">
                            <span className="border-b-2 border-transparent group-hover:border-neutral-850 leading-tight">
                              {habit.name}
                            </span>
                            <ChevronRight className="w-4 h-4 text-neutral-450 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </h3>
                        </div>

                        {/* 3. Description (Enabled/disabled with showDescriptions button to collapse to 3 elements) */}
                        {showDescriptions && (
                          <p className="text-xs text-neutral-450 leading-relaxed max-w-xl">
                            {habit.description || 'No description designated.'}
                          </p>
                        )}
                      </div>

                      {/* Right: Dates Counting Back and Scrollable leftwards */}
                      <div className="flex items-center gap-3 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3.5 md:pt-0 border-neutral-100">
                        {/* Scrollable dates container */}
                        <div className="flex-1 overflow-hidden bg-neutral-50/50 border border-neutral-200/50 p-2 rounded-2xl max-w-full md:max-w-md lg:max-w-xl">
                          <div 
                            className="flex flex-row gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 pr-2" 
                            style={{ WebkitOverflowScrolling: 'touch' }}
                          >
                            {reversedTrackingDates.map((dateStr) => {
                              const isScheduled = isDateScheduled(habit, dateStr);
                              const done = habit.completions.includes(dateStr);
                              const partial = habit.partials?.includes(dateStr) || false;
                              const activeDate = parseDate(dateStr);
                              
                              const dLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][activeDate.getDay()];
                              const dNum = activeDate.getDate();
                              const isToday = dateStr === formatDate(new Date());

                              let emoji = '❌';
                              if (done) emoji = '✅';
                              else if (partial) emoji = '➖';

                              // Dynamic background color matching completion status
                              let cellStyle = "flex flex-col items-center justify-between py-1 px-1.5 rounded-xl border w-10.5 h-14 flex-shrink-0 transition-all select-none ";
                              if (done) {
                                cellStyle += "bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm";
                              } else if (partial) {
                                cellStyle += "bg-amber-50 border-amber-200 text-amber-950 shadow-sm";
                              } else if (!isScheduled) {
                                cellStyle += "bg-neutral-100/60 border-neutral-150 text-neutral-400 opacity-60";
                              } else {
                                cellStyle += "bg-neutral-50 border-neutral-200 text-neutral-550";
                              }

                              return (
                                <div key={dateStr} className={cellStyle}>
                                  <span className="font-mono text-[7px] uppercase tracking-wider font-bold text-neutral-400 leading-none">
                                    {isToday ? 'Tdy' : `${dLetter}${dNum}`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCompletion(habit.id, dateStr)}
                                    className="text-[14px] cursor-pointer hover:scale-125 active:scale-90 transition-transform leading-none outline-none"
                                    title={`${dateStr}: Click to toggle Progress. State: ${done ? '✅ Met' : partial ? '➖ Partial' : '❌ Unmarked'}`}
                                  >
                                    {emoji}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Ring score strength indicator */}
                        <div 
                          onClick={() => setSelectedHabitForDetail(habit)}
                          className={`flex items-center space-x-1 font-mono text-xs font-black leading-none px-3 py-2 rounded-xl border cursor-pointer hover:scale-105 transition-all select-none ${ringClass}`}
                          title={`Click to open full analysis. Strength: ${currentScore}%`}
                        >
                          <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                          <span>{currentScore}%</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* Tab 2: Progress Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in" id="analytics-overview-tab">
            
            {/* Bento metrics counters board */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="analytics-counters-bento">
              <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">Active Routines</span>
                  <span className="text-3xl font-mono font-black text-neutral-900">{activeHabitsCount}</span>
                  <p className="text-[9px] text-neutral-400">Total habits in current offline tracker list</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">Average Strength</span>
                  <span className="text-3xl font-mono font-black text-neutral-900">{averageStrength}%</span>
                  <p className="text-[9px] text-neutral-400">Weighted progress scores index</p>
                </div>
                <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-sm flex items-start gap-3 md:col-span-2 lg:col-span-1">
                <div className="p-1 px-1.5 bg-neutral-100 rounded-lg text-neutral-600 border border-neutral-200/50">
                  <Info className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                  <strong>Integrated 3-State Scoring</strong>: Partial completions (➖) award buffers and 50% credit. Streaks do not break on partial targets, preventing psychological decay.
                </p>
              </div>
            </section>

            {/* Selection widget to look at detailed graphs of individual habits online */}
            <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-sans font-extrabold text-base text-neutral-850">Individual Performance Reports</h3>
                <p className="text-xs text-neutral-400">Select any target habit below to inspect its detailed graphs, calendars, and weekly distributions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {habits.map((habit) => {
                  const stats = getStreakStats(habit);
                  const { currentScore } = calculateHabitStrength(habit);
                  
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => setSelectedHabitForDetail(habit)}
                      className="flex flex-col items-start p-4 bg-neutral-50 hover:bg-neutral-100 active:scale-98 text-left border border-neutral-200 hover:border-neutral-300 rounded-2xl transition-all gap-2"
                    >
                      <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-neutral-200 border border-neutral-350 rounded-full text-neutral-600">
                        {habit.schedule.type}
                      </span>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-neutral-800 line-clamp-1">{habit.name}</h4>
                        <p className="text-[11px] text-neutral-400 font-sans mt-0.5 line-clamp-1">{habit.description || 'No description designated.'}</p>
                      </div>
                      <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-neutral-200/50 text-[10px] font-mono text-neutral-500">
                        <span className="text-amber-600">🔥 {stats.currentStreak}d Streak</span>
                        <span className="text-stone-700 font-bold">🎯 Strength: {currentScore}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Simulation and Sandbox tools */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="simulation-labs-tab">
            
            {/* Notification and checklist interaction modules */}
            <div className="lg:col-span-2 space-y-6">
              <NotificationCenter
                habits={habits.filter(h => !h.isArchived)}
                notifications={notifications}
                onTriggerDemoNotification={triggerDemoNotification}
                onUpdateNotificationStatus={updateNotificationStatus}
                onCheckHabit={(id) => handleToggleCompletion(id, formatDate(new Date()))}
              />
            </div>

            {/* Interactive live widgets previews */}
            <div className="space-y-6">
              <WidgetPanel
                habits={habits}
                onToggleDate={(id, date) => handleToggleCompletion(id, date)}
              />
            </div>

          </div>
        )}

        {/* Deep Credits */}
        <footer className="pt-6 border-t border-neutral-200 text-center text-[11px] text-neutral-400 font-sans" id="footer-branding">
          <p>© 2026 Habittos Engine • 100% Offline Client-Side Storage Protection</p>
        </footer>

      </div>

      {/* Add / Edit Habit Dialog Overlay */}
      {isAddingHabit && (
        <AddHabitModal
          onClose={() => setIsAddingHabit(false)}
          onSave={handleSaveHabit}
          editingHabit={editingHabit}
        />
      )}

      {/* Habit Details Deep-Dive Panel */}
      {selectedHabitForDetail && (
        <HabitDetailModal
          habit={selectedHabitForDetail}
          onClose={() => setSelectedHabitForDetail(null)}
          onEdit={() => {
            setEditingHabit(selectedHabitForDetail);
            setIsAddingHabit(true);
          }}
          onDelete={() => handleDeleteHabit(selectedHabitForDetail.id)}
          onToggleArchive={() => handleToggleArchive(selectedHabitForDetail.id)}
          onUpdateDescription={handleUpdateDescription}
          onToggleDate={handleToggleCompletion}
          onUpdateCreatedAt={handleUpdateCreatedAt}
        />
      )}

    </div>
  );
}
