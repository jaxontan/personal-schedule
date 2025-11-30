import { useTasks } from '../../context/TaskContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { cn } from '../../utils/cn';

export function DeadlineTimeline() {
    const { tasks } = useTasks();

    // Flatten all subtasks with their parent task info
    const allSubtasks = tasks.flatMap(task =>
        task.subtasks.map(subtask => ({
            ...subtask,
            taskTitle: task.title,
            priority: task.priority,
        }))
    );

    const sortedSubtasks = [...allSubtasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight font-heading bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Deadline Timeline
                </h1>
                <p className="text-muted-foreground mt-2">Chronological view of all subtasks</p>
            </div>

            <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-8">
                {sortedSubtasks.map((subtask) => {
                    const date = parseISO(subtask.deadline);
                    const isOverdue = isPast(date) && !isToday(date) && !subtask.isCompleted;

                    return (
                        <div key={subtask.id} className="relative pl-8">
                            {/* Dot */}
                            <div
                                className={cn(
                                    "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-background",
                                    subtask.isCompleted ? "border-primary bg-primary" :
                                        isOverdue ? "border-destructive bg-destructive" : "border-muted-foreground"
                                )}
                            />

                            <Card className={cn("transition-all hover:shadow-md", subtask.isCompleted && "opacity-60")}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {format(date, 'PPP')}
                                                </span>
                                                {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                                                {subtask.isCompleted && <Badge className="bg-emerald-500">Completed</Badge>}
                                            </div>
                                            <h3 className={cn("text-lg font-semibold mt-1", subtask.isCompleted && "line-through")}>
                                                {subtask.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                From: {subtask.taskTitle}
                                            </p>
                                        </div>
                                        <Badge variant={subtask.priority.toLowerCase() as 'high' | 'medium' | 'low'}>
                                            {subtask.priority} Priority
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}

                {sortedSubtasks.length === 0 && (
                    <div className="pl-8 text-muted-foreground text-center py-8">
                        No subtasks scheduled. Add tasks and create subtasks with deadlines.
                    </div>
                )}
            </div>
        </div>
    );
}
