// TypeScript types matching the backend Prisma schema

export type HabitType = 'CHECK' | 'COUNTER';
export type FrequencyType = 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface User {
    id: string;
    email: string;
    name: string;
    timezone: string;
    createdAt: string;
    experience: number;
    level: number;
    avatarUrl?: string;
}

export interface ExperienceLog {
    id: string;
    userId: string;
    amount: number;
    reason: string;
    createdAt: string;
}

export interface HabitTemplate {
    id: string;
    name: string;
    description: string | null;
    type: HabitType;
    defaultFrequency: FrequencyType;
    icon: string | null;
    category: string | null;
}

export interface Habit {
    id: string;
    userId: string;
    templateId: string | null;
    name: string;
    description: string | null;
    type: HabitType;
    goalValue?: number;
    frequencyType: FrequencyType;
    frequencyDays: number[];
    isPaused: boolean;
    isArchived: boolean;
    maxStreak: number;
    category: string | null;
    createdAt: string;
    updatedAt: string;
    template: HabitTemplate | null;
    // Enriched when fetched from /habits/today
    todayValue?: number;
    todayCompleted?: boolean;
    todayComment?: string | null;
    currentStreak?: number;
    isDue?: boolean;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: string;
    value: number;
    comment: string | null;
    createdAt: string;
}

export interface RecurrenceRule {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[];
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    category: string;
    status: TaskStatus;
    isRecurring: boolean;
    recurrenceRule: RecurrenceRule | null;
    dueDate: string | null;
    doneAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WeeklyStats {
    weekStart: string;
    weekEnd: string;
    tasksDone: number;
    tasksTotal: number;
    completionRate: number;
    habitsData: Array<{
        habitId: string;
        name: string;
        daysCompleted: number;
        daysRequired: number;
    }>;
    bestDay: { weekday: number; label: string } | null;
    highlights?: string[];
}

export interface StreakData {
    id: string;
    name: string;
    icon: string | null;
    currentStreak: number;
    maxStreak: number;
    isPaused: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
