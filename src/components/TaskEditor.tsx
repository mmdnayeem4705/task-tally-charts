import { useState } from 'react';
import { Task } from '@/types/task';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Save, X } from 'lucide-react';

interface TaskEditorProps {
  task: Task;
  onSave: (id: string, name: string, points: number) => void;
}

export const TaskEditor = ({ task, onSave }: TaskEditorProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(task.name);
  const [points, setPoints] = useState(task.points);

  const handleSave = () => {
    if (name.trim() && points > 0) {
      onSave(task.id, name.trim(), points);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setName(task.name);
    setPoints(task.points);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Points</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={points}
              onChange={(e) => setPoints(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
