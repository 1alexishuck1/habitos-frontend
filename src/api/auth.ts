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
};
