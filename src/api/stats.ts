import api from './client';
import { WeeklyStats, StreakData } from '@/types';

// API calls for stats endpoints

export const statsApi = {
    getStreaks: () =>
        api.get<StreakData[]>('/stats/habits/streaks'),

    getBestDay: () =>
        api.get<{ weekday: number; label: string; count: number } | null>('/stats/best-day'),

    getWeekly: (week?: string) =>
        api.get<WeeklyStats>('/stats/weekly', { params: week ? { week } : {} }),

    getWeeklySummary: (week?: string) =>
        api.get<any>('/stats/summary/weekly', { params: week ? { week } : {} }),

    getSummary: (period: string, date?: string) =>
        api.get<any>('/stats/summary', { params: { period, date } }),

    getToday: () =>
        api.get<any>('/stats/today'),
};
