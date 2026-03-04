import { create } from 'zustand';
import { Habit, HabitTemplate } from '@/types';

// Habit store — central state for habits and today's view

interface HabitState {
    habits: Habit[];
    todayHabits: Habit[];
    templates: HabitTemplate[];
    loading: boolean;
    error: string | null;
    setHabits: (habits: Habit[]) => void;
    setTodayHabits: (habits: Habit[]) => void;
    setTemplates: (templates: HabitTemplate[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateHabit: (updated: Partial<Habit> & { id: string }) => void;
    removeHabit: (id: string) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
    habits: [],
    todayHabits: [],
    templates: [],
    loading: false,
    error: null,
    setHabits: (habits) => set({ habits }),
    setTodayHabits: (todayHabits) => set({ todayHabits }),
    setTemplates: (templates) => set({ templates }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    updateHabit: (updated) =>
        set((s) => ({
            habits: s.habits.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)),
            todayHabits: s.todayHabits.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)),
        })),
    removeHabit: (id) =>
        set((s) => ({
            habits: s.habits.filter((h) => h.id !== id),
            todayHabits: s.todayHabits.filter((h) => h.id !== id),
        })),
}));
