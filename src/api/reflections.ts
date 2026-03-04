import api from './client';

export interface Reflection {
    id: string;
    content: string;
    mood?: string;
    date: string;
}

export const reflectionApi = {
    getToday: () =>
        api.get<Reflection | null>('/reflections/today'),

    getAll: () =>
        api.get<Reflection[]>('/reflections'),

    upsert: (data: { content: string; mood?: string }) =>
        api.post<Reflection>('/reflections', data),
};
