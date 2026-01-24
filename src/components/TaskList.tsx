import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from './ProgressRing';
import { format } from 'date-fns';
import { CheckCircle2, Target } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  earnedPoints: number;
  totalPoints: number;
  currentDate: Date;
}

export const TaskList = ({
  tasks,
  onToggle,
  earnedPoints,
  totalPoints,
  currentDate,
}: TaskListProps) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = Math.round((earnedPoints / totalPoints) * 100);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(currentDate, 'EEEE')}
            </p>
            <CardTitle className="text-2xl">
              {format(currentDate, 'MMMM d, yyyy')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            {completedCount}/{tasks.length} tasks
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
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
