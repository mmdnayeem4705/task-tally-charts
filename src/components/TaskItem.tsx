import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { TaskEditor } from './TaskEditor';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit?: (id: string, name: string, points: number) => void;
}

export const TaskItem = ({ task, onToggle, onEdit }: TaskItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer group',
        task.completed
          ? 'bg-accent/10 border border-accent/20'
          : 'bg-secondary/50 hover:bg-secondary border border-transparent'
      )}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
        />
        <span
          className={cn(
            'text-sm font-medium transition-all',
            task.completed && 'task-completed'
          )}
        >
          {task.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <TaskEditor task={task} onSave={onEdit} />
        )}
        <div
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
            task.completed
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary/10 text-primary'
          )}
        >
          +{task.points}
        </div>
      </div>
    </div>
  );
};
