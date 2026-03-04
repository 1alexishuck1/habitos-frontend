import api from './client';
import { Habit, HabitTemplate } from '@/types';

// API calls for habit endpoints

export const habitApi = {
    getTemplates: () =>
        api.get<HabitTemplate[]>('/habits/templates'),

    getAll: () =>
        api.get<Habit[]>('/habits'),

    getToday: () =>
        api.get<Habit[]>('/habits/today'),

    create: (data: {
        templateId?: string;
        name: string;
        description?: string;
        type: string;
        frequencyType: string;
        frequencyDays?: number[];
        category?: string;
    }) => api.post<Habit>('/habits', data),

    update: (id: string, data: Partial<{
        name: string; description: string;
        frequencyType: string; frequencyDays: number[];
    }>) => api.put<Habit>(`/habits/${id}`, data),

    togglePause: (id: string) =>
        api.patch<Habit>(`/habits/${id}/pause`),

    archive: (id: string) =>
        api.patch(`/habits/${id}/archive`),

    delete: (id: string) =>
        api.delete(`/habits/${id}`),

    log: (id: string, data: { value?: number; comment?: string }) =>
        api.post(`/habits/${id}/logs`, data),

    unlog: (id: string) =>
        api.delete(`/habits/${id}/logs/today`),

    getLogs: (id: string) =>
        api.get(`/habits/${id}/logs`),
};
