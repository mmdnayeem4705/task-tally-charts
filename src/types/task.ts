export interface Task {
  id: string;
  name: string;
  points: number;
  completed: boolean;
}

export interface DailyRecord {
  date: string;
  tasks: Task[];
  totalPoints: number;
  earnedPoints: number;
}

export const DEFAULT_TASKS: Omit<Task, 'completed'>[] = [
  { id: 'coding', name: 'Coding', points: 5 },
  { id: 'namaaz', name: 'Namaaz', points: 4 },
  { id: 'walking', name: 'Walking', points: 4 },
  { id: 'gym', name: 'Gym', points: 2 },
  { id: 'college', name: 'College Work', points: 3 },
  { id: 'eating', name: 'Healthy Eating', points: 2 },
  { id: 'family', name: 'Talk with Family/Friends', points: 1 },
  { id: 'github', name: 'GitHub Push', points: 2 },
  { id: 'meditation', name: 'Meditation', points: 2 },
  { id: 'stretching', name: 'Body Stretching', points: 1 },
  { id: 'quran', name: 'Read Quran', points: 2 },
  { id: 'journals', name: 'Journals', points: 1 },
  { id: 'weekend', name: 'Complete Weekend Task', points: 1 },
];

export const TOTAL_POSSIBLE_POINTS = DEFAULT_TASKS.reduce((sum, t) => sum + t.points, 0);
