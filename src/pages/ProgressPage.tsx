import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { ExperienceLog } from '@/types';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProgressPage() {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuthStore(s => ({ user: s.user, refreshUser: s.refreshUser }));
    const [xpLogs, setXpLogs] = useState<ExperienceLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        refreshUser();
        authApi.experienceLogs()
            .then(res => setXpLogs(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Group logs by day
    const groupedLogs: Record<string, ExperienceLog[]> = {};
    for (const log of xpLogs) {
        const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
        if (!groupedLogs[dateStr]) groupedLogs[dateStr] = [];
        groupedLogs[dateStr].push(log);
    }

    const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

    return (
        <div className="page-content animate-fade-in pb-20">
            <div className="flex items-center justify-between mb-6">
                <h1 className="section-title text-xl">{t('nav.progress')}</h1>
            </div>

            {/* Experience Card */}
            <div className="card mb-6 bg-surface-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Zap size={16} className="text-primary-400" /> Tu Nivel Actual
                        </h2>
                        <p className="text-xs text-soft mt-0.5">Nivel {Math.floor((user?.experience ?? 0) / 100) + 1}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-white">{(user?.experience ?? 0) % 100} <span className="text-sm font-medium text-soft">/ 100 XP</span></span>
                    </div>
                </div>

                <div className="h-4 rounded-full bg-surface-700/50 overflow-hidden mb-2 border border-white/5 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-amber transition-all duration-1000 ease-out relative"
                        style={{ width: `${(user?.experience ?? 0) % 100}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <p className="text-[10px] text-center text-muted uppercase tracking-widest mt-2">
                    {100 - ((user?.experience ?? 0) % 100)} XP para el nivel {Math.floor((user?.experience ?? 0) / 100) + 2}
                </p>
            </div>

            {/* Logs List */}
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Historial de Experiencia</h2>

            {loading ? (
                <div className="text-center py-12 text-muted animate-pulse-soft">{t('common.loading')}</div>
            ) : xpLogs.length === 0 ? (
                <div className="text-center py-12 bg-surface-800/50 rounded-2xl border border-surface-700/50">
                    <span className="text-3xl mb-3 block">🌱</span>
                    <p className="text-soft text-sm">Aún no ganaste experiencia.</p>
                    <p className="text-xs text-muted mt-1">Completá hábitos y tareas para subir de nivel.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map(dateStr => {
                        const date = new Date(dateStr + 'T12:00:00'); // Prevent timezone shift
                        const label = isSameDay(date, new Date())
                            ? 'Hoy'
                            : format(date, "EEEE d 'de' MMMM", { locale: es });

                        return (
                            <div key={dateStr}>
                                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 pb-1 border-b border-surface-700/50 capitalize">
                                    {label}
                                </h3>
                                <div className="space-y-2">
                                    {groupedLogs[dateStr].map(log => (
                                        <div key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-surface-800/40 border border-surface-700/30">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-surface-700/50 flex items-center justify-center text-accent-amber shrink-0">
                                                    <Zap size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-white truncate text-left" title={log.reason}>
                                                    {log.reason.replace(/^Hábito completado:\s*/, '').replace(/^Tarea completada:\s*/, '')}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-accent-amber px-2 py-1 rounded-md bg-accent-amber/10 shrink-0 ml-2">
                                                +{log.amount} XP
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
