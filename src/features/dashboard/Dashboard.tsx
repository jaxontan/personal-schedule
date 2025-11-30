import { useTasks } from '../../context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { format, isToday, isPast, isFuture, parseISO } from 'date-fns';

export function Dashboard() {
    const { tasks } = useTasks();

    // Flatten all subtasks from all tasks
    const allSubtasks = tasks.flatMap(task =>
        task.subtasks.map(subtask => ({
            ...subtask,
            taskTitle: task.title,
            priority: task.priority,
        }))
    );

    const todaySubtasks = allSubtasks.filter((subtask) =>
        isToday(parseISO(subtask.deadline)) && !subtask.isCompleted
    );

    const upcomingSubtasks = allSubtasks
        .filter((subtask) => isFuture(parseISO(subtask.deadline)) && !subtask.isCompleted)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5);

    const highPrioritySubtasks = allSubtasks.filter((subtask) =>
        subtask.priority === 'High' && !subtask.isCompleted
    );

    const completedCount = allSubtasks.filter((subtask) => subtask.isCompleted).length;
    const missedCount = allSubtasks.filter((subtask) =>
        isPast(parseISO(subtask.deadline)) && !subtask.isCompleted && !isToday(parseISO(subtask.deadline))
    ).length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight font-heading bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Your schedule at a glance</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Subtasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-heading">{allSubtasks.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400">{completedCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-destructive">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Missed Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-heading text-destructive">{missedCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-heading text-amber-600 dark:text-amber-400">{todaySubtasks.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingSubtasks.length === 0 && <p className="text-muted-foreground text-center py-8">No upcoming deadlines.</p>}
                            {upcomingSubtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 hover:bg-accent/30 -mx-2 px-2 rounded-lg transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{subtask.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {subtask.taskTitle} • {format(parseISO(subtask.deadline), 'PPP')}
                                        </p>
                                    </div>
                                    <Badge variant={subtask.priority.toLowerCase() as 'high' | 'medium' | 'low'}>{subtask.priority}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>High Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {highPrioritySubtasks.length === 0 && <p className="text-muted-foreground text-center py-8">No high priority subtasks.</p>}
                            {highPrioritySubtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center justify-between hover:bg-accent/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">{subtask.title}</p>
                                            <p className="text-xs text-muted-foreground">{subtask.taskTitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{format(parseISO(subtask.deadline), 'MMM d')}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
