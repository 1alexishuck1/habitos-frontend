import { create } from 'zustand';
import { Task } from '@/types';

// Task store — central state for tasks

interface TaskState {
    tasks: Task[];
    todayTasks: Task[];
    loading: boolean;
    error: string | null;
    setTasks: (tasks: Task[]) => void;
    setTodayTasks: (tasks: Task[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateTask: (updated: Partial<Task> & { id: string }) => void;
    removeTask: (id: string) => void;
    addTask: (task: Task) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
    tasks: [],
    todayTasks: [],
    loading: false,
    error: null,
    setTasks: (tasks) => set({ tasks }),
    setTodayTasks: (todayTasks) => set({ todayTasks }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    updateTask: (updated) =>
        set((s) => ({
            tasks: s.tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
            todayTasks: s.todayTasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
        })),
    removeTask: (id) =>
        set((s) => ({
            tasks: s.tasks.filter((t) => t.id !== id),
            todayTasks: s.todayTasks.filter((t) => t.id !== id),
        })),
    addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
}));
