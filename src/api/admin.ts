import api from './client';

export interface AdminStats {
    totalUsers: number;
    newUsersLastWeek: number;
    totalHabits: number;
    totalCompletedHabitSnapshots: number;
    totalTasks: number;
    totalCompletedTasks: number;
    latestUsers: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
    }[];
}

export const getAdminStats = async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
};
