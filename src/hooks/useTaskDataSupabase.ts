import { useState, useEffect, useCallback } from 'react';
import { Task, DEFAULT_TASKS } from '@/types/task';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DailyRecordDB {
  task_id: string;
  completed: boolean;
}

interface UserTaskDB {
  task_id: string;
  name: string;
  points: number;
}

export const useTaskDataSupabase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecordDB[]>>({});
  const [customTasks, setCustomTasks] = useState<Omit<Task, 'completed'>[]>(DEFAULT_TASKS);
  const [loading, setLoading] = useState(true);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load user's custom tasks
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadUserTasks = async () => {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('task_id, name, points')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      if (data && data.length > 0) {
        setCustomTasks(data.map(t => ({ id: t.task_id, name: t.name, points: t.points })));
      } else {
        // Initialize default tasks for new user
        const tasksToInsert = DEFAULT_TASKS.map(t => ({
          user_id: user.id,
          task_id: t.id,
          name: t.name,
          points: t.points,
        }));

        await supabase.from('user_tasks').insert(tasksToInsert);
        setCustomTasks(DEFAULT_TASKS);
      }
    };

    loadUserTasks();
  }, [user]);

  // Load daily records for current month
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadRecords = async () => {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('daily_records')
        .select('date, task_id, completed')
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error loading records:', error);
        setLoading(false);
        return;
      }

      const grouped: Record<string, DailyRecordDB[]> = {};
      data?.forEach(record => {
        if (!grouped[record.date]) {
          grouped[record.date] = [];
        }
        grouped[record.date].push({ task_id: record.task_id, completed: record.completed });
      });

      setDailyRecords(grouped);
      setLoading(false);
    };

    loadRecords();
  }, [user, currentDate]);

  const totalPossiblePoints = customTasks.reduce((sum, t) => sum + t.points, 0);

  const getTodaysTasks = useCallback((): Task[] => {
    const records = dailyRecords[dateKey] || [];
    
    return customTasks.map(t => {
      const record = records.find(r => r.task_id === t.id);
      return {
        ...t,
        completed: record?.completed || false,
      };
    });
  }, [dailyRecords, dateKey, customTasks]);

  const toggleTask = useCallback(async (taskId: string) => {
    if (!user) return;

    const currentTasks = getTodaysTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setDailyRecords(prev => {
      const records = prev[dateKey] || [];
      const existingIndex = records.findIndex(r => r.task_id === taskId);
      
      if (existingIndex >= 0) {
        const updated = [...records];
        updated[existingIndex] = { ...updated[existingIndex], completed: newCompleted };
        return { ...prev, [dateKey]: updated };
      } else {
        return { ...prev, [dateKey]: [...records, { task_id: taskId, completed: newCompleted }] };
      }
    });

    // Sync to database
    const { error } = await supabase
      .from('daily_records')
      .upsert({
        user_id: user.id,
        date: dateKey,
        task_id: taskId,
        completed: newCompleted,
      }, {
        onConflict: 'user_id,date,task_id',
      });

    if (error) {
      console.error('Error toggling task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save task. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, dateKey, getTodaysTasks, toast]);

  const editTask = useCallback(async (taskId: string, name: string, points: number) => {
    if (!user) return;

    // Optimistic update
    setCustomTasks(prev => prev.map(t => t.id === taskId ? { ...t, name, points } : t));

    const { error } = await supabase
      .from('user_tasks')
      .update({ name, points })
      .eq('user_id', user.id)
      .eq('task_id', taskId);

    if (error) {
      console.error('Error editing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const getMonthlyData = useCallback((month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd');
      const records = dailyRecords[key] || [];
      
      const earned = records
        .filter(r => r.completed)
        .reduce((sum, r) => {
          const task = customTasks.find(t => t.id === r.task_id);
          return sum + (task?.points || 0);
        }, 0);

      return {
        date: format(day, 'dd'),
        fullDate: key,
        earned,
        total: totalPossiblePoints,
      };
    });
  }, [dailyRecords, customTasks, totalPossiblePoints]);

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
      const records = dailyRecords[key] || [];
      
      records.forEach(r => {
        if (r.completed) {
          const task = customTasks.find(t => t.id === r.task_id);
          if (task) {
            taskCompletions[task.name] = (taskCompletions[task.name] || 0) + 1;
          }
        }
      });
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
    loading,
  };
};
