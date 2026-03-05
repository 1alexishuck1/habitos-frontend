import api from './client';
import { Habit, HabitTemplate } from '@/types';

// API calls for habit endpoints

export const habitApi = {
    getTemplates: () =>
        api.get<HabitTemplate[]>('/habits/templates'),

    getAll: () =>
        api.get<Habit[]>('/habits'),

    getToday: (date?: string) =>
        api.get<Habit[]>('/habits/today', { params: { date } }),

    create: (data: {
        templateId?: string;
        name: string;
        description?: string;
        type: string;
        goalValue?: number;
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

    log: (id: string, data: { value?: number; comment?: string; dateStr?: string }) =>
        api.post(`/habits/${id}/logs`, data),

    unlog: (id: string, date?: string) =>
        api.delete(`/habits/${id}/logs/today`, { params: { date } }),

    getLogs: (id: string) =>
        api.get(`/habits/${id}/logs`),
};
