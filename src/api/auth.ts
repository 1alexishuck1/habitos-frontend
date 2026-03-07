import api from './client';
import { User } from '@/types';

// API calls for auth endpoints

export const authApi = {
    register: (data: { email: string; password: string; name: string }) =>
        api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', data),

    refresh: (refreshToken: string) =>
        api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),

    logout: (refreshToken: string) =>
        api.post('/auth/logout', { refreshToken }),

    me: () =>
        api.get<User>('/auth/me'),

    updateProfile: (data: { name: string }) =>
        api.patch<User>('/auth/me', data),

    getProfileStats: () =>
        api.get<{ friendsCount: number; habitsDoneCount: number; tasksDoneCount: number }>('/auth/me/stats'),

    getPublicProfile: (userId: string) =>
        api.get<{
            id: string;
            name: string;
            level: number;
            experience: number;
            stats: { friendsCount: number; habitsDoneCount: number; tasksDoneCount: number };
            friendshipStatus: 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE';
        }>(`/auth/${userId}/profile`),

    deleteAccount: () =>
        api.delete('/auth/me'),

    experienceLogs: () =>
        api.get<import('@/types').ExperienceLog[]>('/auth/me/experience'),

    uploadAvatar: (formData: FormData) =>
        api.post<{ avatar_url: string }>('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
};
