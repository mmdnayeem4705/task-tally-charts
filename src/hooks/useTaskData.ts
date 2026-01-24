import { useState, useEffect, useCallback } from 'react';
import { Task, DailyRecord, DEFAULT_TASKS, TOTAL_POSSIBLE_POINTS } from '@/types/task';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parse } from 'date-fns';

const STORAGE_KEY = 'daily-tasks-data';

export const useTaskData = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>({});

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDailyRecords(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  const getTodaysTasks = useCallback((): Task[] => {
    const record = dailyRecords[dateKey];
    if (record) {
      return record.tasks;
    }
    return DEFAULT_TASKS.map(t => ({ ...t, completed: false }));
  }, [dailyRecords, dateKey]);

  const toggleTask = useCallback((taskId: string) => {
    setDailyRecords(prev => {
      const currentRecord = prev[dateKey] || {
        date: dateKey,
        tasks: DEFAULT_TASKS.map(t => ({ ...t, completed: false })),
        totalPoints: TOTAL_POSSIBLE_POINTS,
        earnedPoints: 0,
      };

      const updatedTasks = currentRecord.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      const earnedPoints = updatedTasks
        .filter(t => t.completed)
        .reduce((sum, t) => sum + t.points, 0);

      return {
        ...prev,
        [dateKey]: {
          ...currentRecord,
          tasks: updatedTasks,
          earnedPoints,
        },
      };
    });
  }, [dateKey]);

  const getMonthlyData = useCallback((month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd');
      const record = dailyRecords[key];
      return {
        date: format(day, 'dd'),
        fullDate: key,
        earned: record?.earnedPoints || 0,
        total: TOTAL_POSSIBLE_POINTS,
      };
    });
  }, [dailyRecords]);

  const getTaskStats = useCallback((month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const taskCompletions: Record<string, number> = {};
    DEFAULT_TASKS.forEach(t => {
      taskCompletions[t.name] = 0;
    });

    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const record = dailyRecords[key];
      if (record) {
        record.tasks.forEach(t => {
          if (t.completed) {
            taskCompletions[t.name] = (taskCompletions[t.name] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(taskCompletions).map(([name, count]) => ({
      name,
      completions: count,
      percentage: Math.round((count / days.length) * 100),
    }));
  }, [dailyRecords]);

  const todaysTasks = getTodaysTasks();
  const earnedPoints = todaysTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

  return {
    currentDate,
    setCurrentDate,
    todaysTasks,
    toggleTask,
    earnedPoints,
    totalPoints: TOTAL_POSSIBLE_POINTS,
    getMonthlyData,
    getTaskStats,
  };
};
