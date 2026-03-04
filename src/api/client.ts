import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Axios instance — attaches access token and handles 401 → refresh flow

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_URL || '/', // proxied by Vite in dev; set VITE_API_URL for prod
    timeout: 10000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// On 401: attempt refresh → retry original request → logout on failure
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any, token: string | null) {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Don't intercept auth endpoints — let login/register errors propagate naturally
        const url = original?.url ?? '';
        if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const { refreshToken, setTokens } = useAuthStore.getState();
            if (!refreshToken) throw new Error('No refresh token');

            const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            setTokens(data.accessToken, data.refreshToken);
            processQueue(null, data.accessToken);
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
        } catch (err) {
            processQueue(err, null);
            useAuthStore.getState().logout();
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
