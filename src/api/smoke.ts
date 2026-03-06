import client from './client';

export interface SmokeProfile {
    id: string;
    cigarettesPerDay: number;
    yearsSmoking: number;
    pricePerPack: number;
    cigPerPack: number;
    strategy: 'COLD_TURKEY' | 'GRADUAL';
    mainMotivation: string;
    startDate: string;
    currentDailyLimit?: number;
    gradualPlan?: { week: number; limit: number }[];
}

export interface SmokeStats {
    daysSinceStart: number;
    smokeFreeDays: number;
    avoidedTotal: number;
    moneySaved: number;
    smokedToday: number;
    avoidedTodayCravings: number;
    totalLogs: number;
    totalCravingsResisted: number;
}

export interface DashboardData {
    profile: SmokeProfile;
    stats: SmokeStats;
}

export const smokeApi = {
    getDashboard: () => client.get<DashboardData | null>('/smoke/dashboard'),
    createProfile: (data: Partial<SmokeProfile>) => client.post<SmokeProfile>('/smoke/profile', data),
    logSmoke: (data: { quantity: number; trigger?: string; comment?: string }) => client.post('/smoke/logs', data),
    logCraving: (data: { resisted: boolean; trigger?: string }) => client.post('/smoke/cravings', data),
};
