import { useTasks } from '../../context/TaskContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { format, parseISO, isPast, isToday, getWeek, getYear, startOfWeek, endOfWeek } from 'date-fns';
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

    // Group subtasks by week
    const subtasksByWeek: Record<string, typeof sortedSubtasks> = {};
    sortedSubtasks.forEach(subtask => {
        const date = parseISO(subtask.deadline);
        const week = getWeek(date, { weekStartsOn: 1 }); // ISO week, starts on Monday
        const year = getYear(date);
        const key = `${year}-W${week}`;

        if (!subtasksByWeek[key]) {
            subtasksByWeek[key] = [];
        }
        subtasksByWeek[key].push(subtask);
    });

    // Sort week keys chronologically
    const weekKeys = Object.keys(subtasksByWeek).sort((a, b) => {
        const [yearA, weekA] = a.split('-W').map(Number);
        const [yearB, weekB] = b.split('-W').map(Number);
        return yearA !== yearB ? yearA - yearB : weekA - weekB;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight font-heading bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Deadline Timeline
                </h1>
                <p className="text-muted-foreground mt-2">Chronological view of all subtasks by week</p>
            </div>

            <div className="space-y-8">
                {weekKeys.map(weekKey => {
                    const weekSubtasks = subtasksByWeek[weekKey];
                    const [year, weekNum] = weekKey.split('-W');

                    // Get the first subtask's date to determine week range
                    const firstDate = parseISO(weekSubtasks[0].deadline);
                    const weekStart = startOfWeek(firstDate, { weekStartsOn: 1 });
                    const weekEnd = endOfWeek(firstDate, { weekStartsOn: 1 });

                    return (
                        <div key={weekKey} className="space-y-4">
                            {/* Week Header */}
                            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 border-b-2 border-primary/20">
                                <h2 className="text-2xl font-semibold text-primary">
                                    Week {weekNum}, {year}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                                </p>
                            </div>

                            {/* Timeline for this week */}
                            <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-8">
                                {weekSubtasks.map((subtask) => {
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
                            </div>
                        </div>
                    );
                })}

                {sortedSubtasks.length === 0 && (
                    <div className="text-muted-foreground text-center py-8">
                        No subtasks scheduled. Add tasks and create subtasks with deadlines.
                    </div>
                )}
            </div>
        </div>
    );
}
