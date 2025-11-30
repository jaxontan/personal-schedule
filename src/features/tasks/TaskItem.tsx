import { useState } from 'react';
import { type Task } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Check, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../utils/cn';
import { useTasks } from '../../context/TaskContext';
import { Draggable } from '@hello-pangea/dnd';

interface TaskItemProps {
    task: Task;
    index: number;
    isDraggable?: boolean;
}

export function TaskItem({ task, index, isDraggable = true }: TaskItemProps) {
    const { deleteTask, updateTask, toggleSubtask, addSubtask, deleteSubtask } = useTasks();
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const [newSubtaskDeadline, setNewSubtaskDeadline] = useState('');

    const handleToggleComplete = () => {
        updateTask(task.id, { status: task.status === 'Done' ? 'Pending' : 'Done' });
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtask.trim() && newSubtaskDeadline) {
            addSubtask(task.id, newSubtask, newSubtaskDeadline);
            setNewSubtask('');
            setNewSubtaskDeadline('');
        }
    };

    const content = (provided?: any) => (
        <Card className={cn("transition-all", task.status === 'Done' && "opacity-60")}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {isDraggable ? (
                        <div {...(provided?.dragHandleProps)} className="cursor-grab text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                        </div>
                    ) : (
                        <div className="w-5" /> // Spacer to keep alignment
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6 rounded-full border", task.status === 'Done' ? "bg-primary text-primary-foreground" : "border-muted-foreground")}
                        onClick={handleToggleComplete}
                    >
                        {task.status === 'Done' && <Check className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className={cn("font-medium truncate", task.status === 'Done' && "line-through text-muted-foreground")}>
                                {task.title}
                            </h3>
                            <Badge variant={task.priority.toLowerCase() as 'high' | 'medium' | 'low'} className="ml-2 shrink-0">
                                {task.priority}
                            </Badge>
                        </div>
                        {task.deadline && (
                            <p className="text-xs text-muted-foreground">
                                Due: {format(parseISO(task.deadline), 'PPP')}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 pl-12 space-y-3">
                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

                        <div className="space-y-2">
                            {task.subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-2 group">
                                    <input
                                        type="checkbox"
                                        checked={subtask.isCompleted}
                                        onChange={() => toggleSubtask(task.id, subtask.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <span className={cn("text-sm", subtask.isCompleted && "line-through text-muted-foreground")}>
                                            {subtask.title}
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Due: {format(parseISO(subtask.deadline), 'PPP')}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                        onClick={() => deleteSubtask(task.id, subtask.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddSubtask} className="space-y-2">
                            <input
                                type="text"
                                placeholder="Subtask title..."
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                className="w-full text-sm border rounded px-2 py-1 bg-transparent"
                            />
                            <input
                                type="date"
                                value={newSubtaskDeadline}
                                onChange={(e) => setNewSubtaskDeadline(e.target.value)}
                                className="w-full text-sm border rounded px-2 py-1 bg-transparent"
                                required
                            />
                            <Button type="submit" size="sm" variant="secondary" className="w-full">Add Subtask</Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (!isDraggable) {
        return <div className="mb-4">{content()}</div>;
    }

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="mb-4"
                >
                    {content(provided)}
                </div>
            )}
        </Draggable>
    );
}
