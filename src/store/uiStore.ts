import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI store — theme and language preferences

type Theme = 'dark' | 'light';

interface UIState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            setTheme: (theme) => {
                document.documentElement.classList.toggle('dark', theme === 'dark');
                set({ theme });
            },
            toggleTheme: () => {
                const next = get().theme === 'dark' ? 'light' : 'dark';
                document.documentElement.classList.toggle('dark', next === 'dark');
                set({ theme: next });
            },
        }),
        { name: 'ui-storage' }
    )
);
