/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Clock, X, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Habit, InAppNotification } from '../types';
import { formatDate } from '../utils/habitUtils';

interface NotificationCenterProps {
  habits: Habit[];
  notifications: InAppNotification[];
  onTriggerDemoNotification: (habitId: string) => void;
  onUpdateNotificationStatus: (notifId: string, status: InAppNotification['status']) => void;
  onCheckHabit: (habitId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  habits,
  notifications,
  onTriggerDemoNotification,
  onUpdateNotificationStatus,
  onCheckHabit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id || '');

  // Update selected habit drop down if list updates
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  const activeNotifications = notifications.filter((n) => n.status === 'active');
  const pastNotifications = notifications.filter((n) => n.status !== 'active');

  const todayStr = formatDate(new Date());

  const handleAction = (notif: InAppNotification, action: 'complete' | 'snooze' | 'dismiss') => {
    if (action === 'complete') {
      onCheckHabit(notif.habitId);
      onUpdateNotificationStatus(notif.id, 'completed');
    } else if (action === 'snooze') {
      onUpdateNotificationStatus(notif.id, 'snoozed');
    } else {
      onUpdateNotificationStatus(notif.id, 'dismissed');
    }
  };

  return (
    <div className="bg-neutral-50 p-5 border border-neutral-200/60 rounded-[28px] space-y-5" id="notifications-sim-center">
      {/* Title */}
      <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/40">
        <div className="flex items-center space-x-2">
          <Bell className="w-4.5 h-4.5 text-neutral-50s" />
          <h3 className="font-sans font-medium text-sm text-neutral-800 uppercase tracking-tight">
            Interactive Reminders Shade
          </h3>
        </div>
        {activeNotifications.length > 0 && (
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
        Because search engines restrict browser push notifications unless you open a tab, we built a fully realistic <strong>Interactive Notification shade</strong>. Use the control below to fire a simulated smart notification!
      </p>

      {/* Simulator Control */}
      {habits.length > 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider">
            <span>Test Reminders Tool</span>
            <span>Manual Trigger</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black/5 flex-1"
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.reminders.length > 0 ? `(${h.reminders.join(', ')})` : '(No Reminders)'}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onTriggerDemoNotification(selectedHabitId || habits[0]?.id)}
              className="px-4 py-1.5 bg-neutral-900 border border-neutral-950 text-white rounded-xl text-xs font-sans font-medium hover:bg-neutral-800 active:scale-95 transition shadow-sm"
            >
              Trigger Alert
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50 text-center text-xs text-neutral-400">
          Create a habit first to unlock physical triggers
        </div>
      )}

      {/* Slide-out active shade stack */}
      {activeNotifications.length > 0 && (
        <div className="space-y-3">
          <span className="block text-[10px] font-mono font-semibold text-red-500 uppercase tracking-wider">
            Active Pending Shades ({activeNotifications.length})
          </span>
          
          <div className="space-y-2.5">
            {activeNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-3 animate-scale-up border-l-4 border-l-emerald-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 px-1.5 bg-emerald-500 rounded-lg text-white font-sans font-black text-[9px] leading-tight select-none">
                      H
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-xs text-neutral-100 leading-snug">
                        {notif.habitName}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-sans tracking-wide">
                        Scheduled reminder is set for {notif.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(notif, 'dismiss')}
                    className="p-0.5 rounded-lg text-neutral-500 hover:text-neutral-200 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => handleAction(notif, 'complete')}
                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-1.5 px-2 rounded-xl text-[10px] font-semibold text-white flex items-center justify-center space-x-1 transition select-none outline-none"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={() => handleAction(notif, 'snooze')}
                    className="bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 py-1.5 px-2 rounded-xl text-[10px] font-semibold text-neutral-300 flex items-center justify-center space-x-1 transition select-none outline-none"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Snooze</span>
                  </button>
                  <button
                    onClick={() => handleAction(notif, 'dismiss')}
                    className="bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 py-1.5 px-2 rounded-xl text-[10px] font-medium text-neutral-400 flex items-center justify-center space-x-1 transition select-none outline-none"
                  >
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log history of alerts */}
      <div className="space-y-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-xs font-sans text-neutral-500 hover:text-neutral-800"
        >
          <span>History Log ({pastNotifications.length})</span>
          <span className="font-mono text-[10px] underline">{isOpen ? 'Hide' : 'Expand'}</span>
        </button>

        {isOpen && (
          <div className="bg-white border border-neutral-150 rounded-2xl p-3 max-h-[140px] overflow-y-auto space-y-2.5 shadow-inner">
            {pastNotifications.length === 0 ? (
              <p className="text-[11px] text-neutral-400 italic text-center py-4">
                No archived alert activities.
              </p>
            ) : (
              pastNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center justify-between text-xs pb-1.5 border-b border-neutral-100 last:border-b-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <span className="font-sans font-semibold text-neutral-700 block truncate max-w-[120px]">
                      {notif.habitName}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400">
                      Alert trigger: {notif.time}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      notif.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
                        : notif.status === 'snoozed'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                        : 'bg-neutral-150 text-neutral-500'
                    }`}
                  >
                    {notif.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
