import { useDailyTasks } from '../../context/DailyTaskContext';
import { type DailyTask } from '../../types';
import { Trash2, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DailyTaskItemProps {
    task: DailyTask;
}

export function DailyTaskItem({ task }: DailyTaskItemProps) {
    const { toggleDailyTask, deleteDailyTask } = useDailyTasks();

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            className={cn(
                'group flex items-center gap-3 p-4 rounded-lg border transition-all duration-200',
                'hover:shadow-md hover:border-primary/50',
                task.isCompleted
                    ? 'bg-accent/30 border-accent'
                    : 'bg-card border-border'
            )}
        >
            {/* Checkbox */}
            <button
                onClick={() => toggleDailyTask(task.id)}
                className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all duration-200',
                    'flex items-center justify-center',
                    task.isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                )}
            >
                {task.isCompleted && <Check className="w-4 h-4" />}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        'text-sm font-medium transition-all duration-200',
                        task.isCompleted
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                    )}
                >
                    {task.title}
                </p>
                {task.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Completed at {formatTime(task.completedAt)}
                    </p>
                )}
            </div>

            {/* Delete Button */}
            <button
                onClick={() => deleteDailyTask(task.id)}
                className={cn(
                    'flex-shrink-0 p-2 rounded-md transition-all duration-200',
                    'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                    'opacity-0 group-hover:opacity-100'
                )}
                title="Delete task"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
