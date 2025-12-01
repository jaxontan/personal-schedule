export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Done' | 'Overdue';

export interface Subtask {
    id: string;
    title: string;
    deadline: string; // ISO Date string - each subtask has its own deadline
    isCompleted: boolean;
}

export interface Task {
    id: string;
    title: string; // Main task is just a category/title
    description?: string;
    deadline?: string; // Optional - main task is just a category
    priority: Priority;
    status: TaskStatus;
    subtasks: Subtask[];
    createdAt: string;
}

export interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'subtasks'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    addSubtask: (taskId: string, title: string, deadline: string) => void;
    deleteSubtask: (taskId: string, subtaskId: string) => void;
    reorderTasks: (newOrder: Task[]) => void;
}

export interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export interface DailyTask {
    id: string;
    title: string;
    taskDate: string; // ISO date string (YYYY-MM-DD)
    isCompleted: boolean;
    completedAt?: string; // ISO timestamp
    createdAt: string;
}

export interface DailyTaskContextType {
    dailyTasks: DailyTask[];
    addDailyTask: (title: string, taskDate: string) => Promise<void>;
    toggleDailyTask: (id: string) => Promise<void>;
    deleteDailyTask: (id: string) => Promise<void>;
    cleanupOldTasks: () => Promise<void>;
}
