import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProgressRing } from './ProgressRing';
import { format, isToday } from 'date-fns';
import { CheckCircle2, Target, History } from 'lucide-react';
import { DateNavigator } from './DateNavigator';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEditTask?: (id: string, name: string, points: number) => void;
  earnedPoints: number;
  totalPoints: number;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const TaskList = ({
  tasks,
  onToggle,
  onEditTask,
  earnedPoints,
  totalPoints,
  currentDate,
  onDateChange,
}: TaskListProps) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const isViewingToday = isToday(currentDate);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <DateNavigator currentDate={currentDate} onDateChange={onDateChange} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            {completedCount}/{tasks.length} tasks
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isViewingToday && (
            <History className="w-4 h-4 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm text-muted-foreground">
              {format(currentDate, 'EEEE')}
            </p>
            <p className="text-lg font-semibold">
              {isViewingToday ? "Today's Progress" : format(currentDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-4">
          <ProgressRing
            progress={progress}
            earned={earnedPoints}
            total={totalPoints}
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Daily Tasks</span>
          {!isViewingToday && (
            <span className="text-xs text-muted-foreground ml-auto">
              Viewing past record
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={onToggle}
              onEdit={onEditTask}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
