import api from './client';
import { Task, TaskStatus, RecurrenceRule } from '@/types';

// API calls for task endpoints

export const taskApi = {
    getAll: (params?: { status?: TaskStatus; category?: string }) =>
        api.get<Task[]>('/tasks', { params }),

    getToday: (date?: string) =>
        api.get<Task[]>('/tasks/today', { params: { date } }),

    create: (data: {
        title: string;
        description?: string;
        category?: string;
        isRecurring?: boolean;
        recurrenceRule?: RecurrenceRule;
        dueDate?: string;
    }) => api.post<Task>('/tasks', data),

    update: (id: string, data: Partial<{
        title: string; description: string; category: string;
        isRecurring: boolean; recurrenceRule: RecurrenceRule; dueDate: string;
    }>) => api.put<Task>(`/tasks/${id}`, data),

    changeStatus: (id: string, status: TaskStatus) =>
        api.patch<Task>(`/tasks/${id}/status`, { status }),

    delete: (id: string) =>
        api.delete(`/tasks/${id}`),
};
