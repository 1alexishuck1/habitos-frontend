import api from './client';

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

const JS_DAY_TO_KEY: Record<number, DayOfWeek> = {
    0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT',
};

export function todayKey(): DayOfWeek {
    return JS_DAY_TO_KEY[new Date().getDay()];
}

export function todayDateStr() {
    return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function doneStorageKey(dayKey: DayOfWeek) {
    return `gym-done-${dayKey}-${todayDateStr()}`;
}

export function loadDoneSet(dayKey: DayOfWeek): Set<string> {
    try {
        const raw = localStorage.getItem(doneStorageKey(dayKey));
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
}

export function saveDoneSet(dayKey: DayOfWeek, set: Set<string>) {
    localStorage.setItem(doneStorageKey(dayKey), JSON.stringify([...set]));
}

export interface WorkoutExercise {
    id: string;
    workoutDayId: string;
    name: string;
    sets: number;
    reps: string;
    weight: number | null;
    notes: string | null;
    order: number;
}

export interface WorkoutDay {
    id: string;
    userId: string;
    dayOfWeek: DayOfWeek;
    name: string;
    exercises: WorkoutExercise[];
}

export type ExerciseInput = {
    name: string;
    sets: number;
    reps: string;
    weight?: number | null;
    notes?: string;
};

export const gymApi = {
    listDays: () =>
        api.get<WorkoutDay[]>('/gym').then(r => r.data),

    getDay: (day: DayOfWeek) =>
        api.get<WorkoutDay>(`/gym/${day}`).then(r => r.data),

    upsertDay: (day: DayOfWeek, name: string) =>
        api.put<WorkoutDay>(`/gym/${day}`, { name }).then(r => r.data),

    deleteDay: (day: DayOfWeek) =>
        api.delete(`/gym/${day}`).then(r => r.data),

    addExercise: (day: DayOfWeek, data: ExerciseInput) =>
        api.post<WorkoutExercise>(`/gym/${day}/exercises`, data).then(r => r.data),

    updateExercise: (id: string, data: Partial<ExerciseInput>) =>
        api.put<WorkoutExercise>(`/gym/exercises/${id}`, data).then(r => r.data),

    deleteExercise: (id: string) =>
        api.delete(`/gym/exercises/${id}`).then(r => r.data),
};
