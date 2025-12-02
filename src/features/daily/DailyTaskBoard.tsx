import { useState } from 'react';
import { useDailyTasks } from '../../context/DailyTaskContext';
import { DailyTaskItem } from './DailyTaskItem';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export function DailyTaskBoard() {
    const { dailyTasks, addDailyTask } = useDailyTasks();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDisplayDate = (date: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (formatDate(date) === formatDate(today)) return 'Today';
        if (formatDate(date) === formatDate(yesterday)) return 'Yesterday';
        if (formatDate(date) === formatDate(tomorrow)) return 'Tomorrow';

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        await addDailyTask(newTaskTitle.trim(), formatDate(selectedDate));
        setNewTaskTitle('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    };

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // Get tasks for selected date
    const selectedDateStr = formatDate(selectedDate);
    const tasksForSelectedDate = dailyTasks.filter(
        t => t.taskDate === selectedDateStr
    );

    // Get tasks grouped by date for the last 7 days
    const last7Days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date);
    }

    const tasksByDate = last7Days.map(date => {
        const dateStr = formatDate(date);
        const tasks = dailyTasks.filter(t => t.taskDate === dateStr);
        return { date, dateStr, tasks };
    }).filter(group => group.tasks.length > 0);

    const completedCount = tasksForSelectedDate.filter(t => t.isCompleted).length;
    const totalCount = tasksForSelectedDate.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Daily Tasks
                </h1>
                <p className="text-muted-foreground mt-2">
                    Organize your daily to-do list. Tasks are kept for 7 days after the day ends.
                </p>
            </div>

            {/* Date Navigator */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateDate(-1)}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="text-center">
                        <h2 className="text-2xl font-semibold">
                            {formatDisplayDate(selectedDate)}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {selectedDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateDate(1)}
                        className="rounded-full"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Quick Add Input */}
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Add a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleAddTask}
                        disabled={!newTaskTitle.trim()}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </Button>
                </div>

                {/* Progress Indicator */}
                {totalCount > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>Progress</span>
                            <span>{completedCount} / {totalCount}</span>
                        </div>
                        <div className="w-full h-2 bg-accent/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Tasks for Selected Date */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Tasks for {formatDisplayDate(selectedDate)}
                </h3>

                {tasksForSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                        {tasksForSelectedDate.map(task => (
                            <DailyTaskItem key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">
                            No tasks for this day. Add one above!
                        </p>
                    </Card>
                )}
            </div>

            {/* Recent Days */}
            {tasksByDate.length > 1 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Days</h3>
                    <div className="space-y-6">
                        {tasksByDate.slice(1).map(({ date, dateStr, tasks }) => {
                            const completed = tasks.filter(t => t.isCompleted).length;
                            return (
                                <div key={dateStr}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-muted-foreground">
                                            {formatDisplayDate(date)}
                                        </h4>
                                        <span className="text-xs text-muted-foreground">
                                            {completed}/{tasks.length} completed
                                        </span>
                                    </div>
                                    <div className="space-y-2 opacity-70">
                                        {tasks.map(task => (
                                            <DailyTaskItem key={task.id} task={task} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
