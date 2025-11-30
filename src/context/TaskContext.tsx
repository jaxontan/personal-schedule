import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Task, type TaskContextType } from '../types';
import { supabase } from '../lib/supabase';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: true });

            if (tasksError) throw tasksError;

            // Fetch subtasks
            const { data: subtasksData, error: subtasksError } = await supabase
                .from('subtasks')
                .select('*');

            if (subtasksError) throw subtasksError;

            // Combine tasks and subtasks
            const combinedTasks = tasksData.map((task: any) => ({
                id: task.id,
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                deadline: task.deadline || undefined,
                status: task.status,
                createdAt: task.created_at,
                subtasks: subtasksData
                    .filter((st: any) => st.task_id === task.id)
                    .map((st: any) => ({
                        id: st.id,
                        title: st.title,
                        deadline: st.deadline,
                        isCompleted: st.is_completed,
                    })),
            }));

            setTasks(combinedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'subtasks'>) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    title: taskData.title,
                    description: taskData.description,
                    priority: taskData.priority,
                    deadline: taskData.deadline,
                    status: 'Pending'
                }])
                .select()
                .single();

            if (error) throw error;

            const newTask: Task = {
                id: data.id,
                title: data.title,
                description: data.description || '',
                priority: data.priority,
                deadline: data.deadline || undefined,
                status: data.status,
                createdAt: data.created_at,
                subtasks: [],
            };

            setTasks((prev) => [...prev, newTask]);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: updates.title,
                    description: updates.description,
                    priority: updates.priority,
                    deadline: updates.deadline,
                    status: updates.status
                })
                .eq('id', id);

            if (error) throw error;

            setTasks((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
            );
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const toggleSubtask = async (taskId: string, subtaskId: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            const subtask = task?.subtasks.find(st => st.id === subtaskId);

            if (!subtask) return;

            const { error } = await supabase
                .from('subtasks')
                .update({ is_completed: !subtask.isCompleted })
                .eq('id', subtaskId);

            if (error) throw error;

            setTasks((prev) =>
                prev.map((task) => {
                    if (task.id !== taskId) return task;
                    const updatedSubtasks = task.subtasks.map((st) =>
                        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
                    );
                    return { ...task, subtasks: updatedSubtasks };
                })
            );
        } catch (error) {
            console.error('Error toggling subtask:', error);
        }
    };

    const addSubtask = async (taskId: string, title: string, deadline: string) => {
        try {
            const { data, error } = await supabase
                .from('subtasks')
                .insert([{
                    task_id: taskId,
                    title,
                    deadline,
                    is_completed: false
                }])
                .select()
                .single();

            if (error) throw error;

            const newSubtask = {
                id: data.id,
                title: data.title,
                deadline: data.deadline,
                isCompleted: data.is_completed
            };

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                            ...task,
                            subtasks: [...task.subtasks, newSubtask],
                        }
                        : task
                )
            );
        } catch (error) {
            console.error('Error adding subtask:', error);
        }
    };

    const deleteSubtask = async (taskId: string, subtaskId: string) => {
        try {
            const { error } = await supabase
                .from('subtasks')
                .delete()
                .eq('id', subtaskId);

            if (error) throw error;

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                            ...task,
                            subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
                        }
                        : task
                )
            );
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    const reorderTasks = (newOrder: Task[]) => {
        // Optimistic update for UI
        setTasks(newOrder);
        // Note: Persisting order in DB would require an 'order' column and batch update
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                deleteTask,
                toggleSubtask,
                addSubtask,
                deleteSubtask,
                reorderTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
