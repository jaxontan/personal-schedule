import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { type Priority } from '../../types';

export function TaskForm() {
    const { addTask } = useTasks();
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            addTask({
                title,
                deadline: deadline || undefined, // Optional deadline
                priority,
                description,
            });
            setTitle('');
            setDeadline('');
            setPriority('Medium');
            setDescription('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">
                            Title
                        </label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task category (e.g., 'Project Alpha')"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                                Deadline (Optional)
                            </label>
                            <Input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Main task is just a category</p>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium mb-1">
                                Priority
                            </label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            Description (Optional)
                        </label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                        />
                    </div>

                    <Button type="submit" className="w-full">Add Task</Button>
                    <p className="text-xs text-muted-foreground text-center">
                        After adding, expand the task to add subtasks with deadlines
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
