import React, { createContext, useContext, useEffect, useState } from 'react';
import { type DailyTask, type DailyTaskContextType } from '../types';
import { supabase } from '../lib/supabase';

const DailyTaskContext = createContext<DailyTaskContextType | undefined>(undefined);

export function DailyTaskProvider({ children }: { children: React.ReactNode }) {
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);

    useEffect(() => {
        cleanupOldTasks();
        fetchDailyTasks();
    }, []);

    const fetchDailyTasks = async () => {
        try {
            // Fetch tasks from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('daily_tasks')
                .select('*')
                .gte('task_date', sevenDaysAgoStr)
                .order('task_date', { ascending: false })
                .order('created_at', { ascending: true });

            if (error) throw error;

            const tasks: DailyTask[] = (data || []).map((task: any) => ({
                id: task.id,
                title: task.title,
                taskDate: task.task_date,
                isCompleted: task.is_completed,
                completedAt: task.completed_at,
                createdAt: task.created_at,
            }));

            setDailyTasks(tasks);
        } catch (error) {
            console.error('Error fetching daily tasks:', error);
        }
    };

    const addDailyTask = async (title: string, taskDate: string) => {
        try {
            const { data, error } = await supabase
                .from('daily_tasks')
                .insert([{
                    title,
                    task_date: taskDate,
                    is_completed: false
                }])
                .select()
                .single();

            if (error) throw error;

            const newTask: DailyTask = {
                id: data.id,
                title: data.title,
                taskDate: data.task_date,
                isCompleted: data.is_completed,
                completedAt: data.completed_at,
                createdAt: data.created_at,
            };

            setDailyTasks((prev) => [...prev, newTask]);
        } catch (error) {
            console.error('Error adding daily task:', error);
        }
    };

    const toggleDailyTask = async (id: string) => {
        try {
            const task = dailyTasks.find(t => t.id === id);
            if (!task) return;

            const newCompletedState = !task.isCompleted;
            const completedAt = newCompletedState ? new Date().toISOString() : null;

            const { error } = await supabase
                .from('daily_tasks')
                .update({
                    is_completed: newCompletedState,
                    completed_at: completedAt
                })
                .eq('id', id);

            if (error) throw error;

            setDailyTasks((prev) =>
                prev.map((t) =>
                    t.id === id
                        ? { ...t, isCompleted: newCompletedState, completedAt: completedAt || undefined }
                        : t
                )
            );
        } catch (error) {
            console.error('Error toggling daily task:', error);
        }
    };

    const deleteDailyTask = async (id: string) => {
        try {
            const { error } = await supabase
                .from('daily_tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setDailyTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Error deleting daily task:', error);
        }
    };

    const cleanupOldTasks = async () => {
        try {
            // Delete tasks older than 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

            const { error } = await supabase
                .from('daily_tasks')
                .delete()
                .lt('task_date', sevenDaysAgoStr);

            if (error) throw error;
        } catch (error) {
            console.error('Error cleaning up old tasks:', error);
        }
    };

    return (
        <DailyTaskContext.Provider
            value={{
                dailyTasks,
                addDailyTask,
                toggleDailyTask,
                deleteDailyTask,
                cleanupOldTasks,
            }}
        >
            {children}
        </DailyTaskContext.Provider>
    );
}

export function useDailyTasks() {
    const context = useContext(DailyTaskContext);
    if (context === undefined) {
        throw new Error('useDailyTasks must be used within a DailyTaskProvider');
    }
    return context;
}
