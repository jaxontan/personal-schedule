import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isSameMonth, isToday, subDays, addDays } from 'date-fns';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';

export function WeeklyCalendar() {
    const { tasks } = useTasks();
    const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Weekly view: Yesterday, today, and next 5 days
    const today = new Date();
    const weekStart = subDays(today, 1); // Yesterday
    const weekEnd = addDays(today, 5); // 5 days from today
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Get the starting day offset (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = monthStart.getDay();
    const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Monday start

    // Flatten all subtasks with their parent task info
    const allSubtasks = tasks.flatMap(task =>
        task.subtasks.map(subtask => ({
            ...subtask,
            taskTitle: task.title,
            priority: task.priority,
        }))
    );

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight font-heading bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Calendar
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {viewMode === 'monthly' ? 'Monthly view of your schedule' : '7-day view of your schedule'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'monthly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('monthly')}
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Monthly
                        </Button>
                        <Button
                            variant={viewMode === 'weekly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('weekly')}
                        >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Weekly
                        </Button>
                    </div>

                    {/* Month Navigation (only for monthly view) */}
                    {viewMode === 'monthly' && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h2 className="text-xl md:text-2xl font-semibold font-heading min-w-[140px] md:min-w-[200px] text-center">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {viewMode === 'weekly' && (
                        <h2 className="text-lg md:text-2xl font-semibold font-heading">
                            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                        </h2>
                    )}
                </div>
            </div>

            {/* Monthly View */}
            {
                viewMode === 'monthly' && (
                    <Card className="overflow-hidden">
                        <CardContent className="p-0 overflow-x-auto">
                            <div className="grid grid-cols-7 min-w-[800px]">
                                {/* Day Headers */}
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                    <div
                                        key={day}
                                        className="p-3 text-center text-sm font-semibold text-muted-foreground border-b bg-muted/30"
                                    >
                                        {day}
                                    </div>
                                ))}

                                {/* Empty cells for offset */}
                                {Array.from({ length: startOffset }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[120px] border-b border-r bg-muted/10" />
                                ))}

                                {/* Calendar Days */}
                                {monthDays.map((day) => {
                                    const daySubtasks = allSubtasks.filter((subtask) => isSameDay(parseISO(subtask.deadline), day));
                                    const isCurrentDay = isToday(day);

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={cn(
                                                "min-h-[120px] border-b border-r p-2 transition-colors hover:bg-accent/30",
                                                !isSameMonth(day, currentMonth) && "bg-muted/10 text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span
                                                    className={cn(
                                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                                        isCurrentDay && "bg-primary text-primary-foreground font-bold"
                                                    )}
                                                >
                                                    {format(day, 'd')}
                                                </span>
                                            </div>

                                            {/* Subtasks */}
                                            <div className="space-y-1 overflow-auto max-h-[80px]">
                                                {daySubtasks.map((subtask) => (
                                                    <div
                                                        key={subtask.id}
                                                        className={cn(
                                                            "px-2 py-1 rounded text-xs border bg-card/50 backdrop-blur-sm",
                                                            subtask.isCompleted && "opacity-50 line-through"
                                                        )}
                                                    >
                                                        <div className="font-medium truncate">{subtask.title}</div>
                                                        <div className="text-[10px] text-muted-foreground truncate">{subtask.taskTitle}</div>
                                                        <Badge
                                                            variant={subtask.priority.toLowerCase() as 'high' | 'medium' | 'low'}
                                                            className="text-[10px] px-1 py-0 h-4 mt-1"
                                                        >
                                                            {subtask.priority}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            {/* Weekly View */}
            {
                viewMode === 'weekly' && (
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {weekDays.map((day) => {
                            const daySubtasks = allSubtasks.filter((subtask) => isSameDay(parseISO(subtask.deadline), day));
                            const isCurrentDay = isToday(day);

                            return (
                                <Card
                                    key={day.toString()}
                                    className={cn(
                                        "flex flex-col min-h-[300px]",
                                        isCurrentDay && "border-primary border-2 shadow-lg shadow-primary/20"
                                    )}
                                >
                                    <CardHeader className="p-4 pb-2 border-b bg-muted/30">
                                        <CardTitle className="text-sm font-medium text-center">
                                            {format(day, 'EEE')}
                                            <span className={cn("block text-2xl mt-1 font-heading", isCurrentDay && "text-primary")}>
                                                {format(day, 'd')}
                                            </span>
                                            <span className="block text-xs text-muted-foreground mt-1">
                                                {format(day, 'MMM yyyy')}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 flex-1 flex flex-col">
                                        {/* Subtasks */}
                                        <div className="space-y-2 flex-1 overflow-auto">
                                            {daySubtasks.length === 0 && (
                                                <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                                            )}
                                            {daySubtasks.map((subtask) => (
                                                <div
                                                    key={subtask.id}
                                                    className={cn(
                                                        "p-3 rounded-lg text-xs border bg-card shadow-sm hover:shadow-md transition-shadow",
                                                        subtask.isCompleted && "opacity-50 line-through"
                                                    )}
                                                >
                                                    <div className="font-medium mb-1">{subtask.title}</div>
                                                    <div className="text-[10px] text-muted-foreground mb-2">{subtask.taskTitle}</div>
                                                    <div className="flex justify-between items-center">
                                                        <Badge
                                                            variant={subtask.priority.toLowerCase() as 'high' | 'medium' | 'low'}
                                                            className="text-[10px] px-1.5 py-0 h-5"
                                                        >
                                                            {subtask.priority}
                                                        </Badge>
                                                        {subtask.isCompleted && (
                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ Done</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )
            }
        </div >
    );
}
