import { useState, useEffect, useCallback } from 'react';
import { Task, DailyRecord, DEFAULT_TASKS, TOTAL_POSSIBLE_POINTS } from '@/types/task';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const STORAGE_KEY = 'daily-tasks-data';
const CUSTOM_TASKS_KEY = 'custom-tasks-config';

export const useTaskData = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>({});
  const [customTasks, setCustomTasks] = useState<Omit<Task, 'completed'>[]>(DEFAULT_TASKS);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDailyRecords(JSON.parse(stored));
    }
    
    const storedTasks = localStorage.getItem(CUSTOM_TASKS_KEY);
    if (storedTasks) {
      setCustomTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  // Save custom tasks to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(customTasks));
  }, [customTasks]);

  const totalPossiblePoints = customTasks.reduce((sum, t) => sum + t.points, 0);

  const getTodaysTasks = useCallback((): Task[] => {
    const record = dailyRecords[dateKey];
    if (record) {
      // Merge with custom tasks to get updated names/points
      return record.tasks.map(t => {
        const customTask = customTasks.find(ct => ct.id === t.id);
        return customTask 
          ? { ...t, name: customTask.name, points: customTask.points }
          : t;
      });
    }
    return customTasks.map(t => ({ ...t, completed: false }));
  }, [dailyRecords, dateKey, customTasks]);

  const toggleTask = useCallback((taskId: string) => {
    setDailyRecords(prev => {
      const currentRecord = prev[dateKey] || {
        date: dateKey,
        tasks: customTasks.map(t => ({ ...t, completed: false })),
        totalPoints: totalPossiblePoints,
        earnedPoints: 0,
      };

      const updatedTasks = currentRecord.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      const earnedPoints = updatedTasks
        .filter(t => t.completed)
        .reduce((sum, t) => {
          const customTask = customTasks.find(ct => ct.id === t.id);
          return sum + (customTask?.points || t.points);
        }, 0);

      return {
        ...prev,
        [dateKey]: {
          ...currentRecord,
          tasks: updatedTasks,
          earnedPoints,
        },
      };
    });
  }, [dateKey, customTasks, totalPossiblePoints]);

  const editTask = useCallback((taskId: string, name: string, points: number) => {
    setCustomTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, name, points } : t)
    );
  }, []);

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
        total: totalPossiblePoints,
      };
    });
  }, [dailyRecords, totalPossiblePoints]);

  const getTaskStats = useCallback((month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const taskCompletions: Record<string, number> = {};
    customTasks.forEach(t => {
      taskCompletions[t.name] = 0;
    });

    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const record = dailyRecords[key];
      if (record) {
        record.tasks.forEach(t => {
          if (t.completed) {
            const customTask = customTasks.find(ct => ct.id === t.id);
            const taskName = customTask?.name || t.name;
            taskCompletions[taskName] = (taskCompletions[taskName] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(taskCompletions).map(([name, count]) => ({
      name,
      completions: count,
      percentage: Math.round((count / days.length) * 100),
    }));
  }, [dailyRecords, customTasks]);

  const todaysTasks = getTodaysTasks();
  const earnedPoints = todaysTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

  return {
    currentDate,
    setCurrentDate,
    todaysTasks,
    toggleTask,
    editTask,
    earnedPoints,
    totalPoints: totalPossiblePoints,
    getMonthlyData,
    getTaskStats,
  };
};
