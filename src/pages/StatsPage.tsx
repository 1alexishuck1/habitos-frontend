import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Trophy, TrendingUp, Calendar, LayoutDashboard, CheckCircle2, ListTodo, Activity } from 'lucide-react';
import { statsApi } from '@/api/stats';
import { StreakData } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type Tab = 'GENERAL' | 'HABITS' | 'TASKS';

function StatCard({ label, value, sub, icon: Icon, color }: {
    label: string; value: string | number; sub?: string;
    icon: any; color: string;
}) {
    return (
        <div className="card flex items-center gap-4 border-surface-700/50 bg-surface-800/40">
            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/20`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
                {sub && <p className="text-[10px] text-soft mt-0.5 font-medium">{sub}</p>}
            </div>
        </div>
    );
}

export default function StatsPage() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<Period>('DAILY');
    const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
    const [summary, setSummary] = useState<any>(null);
    const [streaks, setStreaks] = useState<StreakData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const summaryCall = period === 'DAILY'
            ? statsApi.getToday()
            : statsApi.getSummary(period);

        Promise.all([
            summaryCall,
            statsApi.getStreaks()
        ]).then(([summ, str]) => {
            setSummary(summ.data);
            setStreaks(str.data);
        }).finally(() => setLoading(false));
    }, [period]);

    if (loading && !summary) return (
        <div className="page-content flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-muted uppercase tracking-widest">{t('common.loading')}</p>
            </div>
        </div>
    );

    const habitChartData = summary?.habitsData.map((h: any) => ({
        name: h.name.length > 8 ? h.name.substring(0, 8) + '..' : h.name,
        pct: h.daysRequired > 0 ? Math.round((h.daysCompleted / h.daysRequired) * 100) : 0,
    })) ?? [];

    const periodLabels: Record<Period, string> = {
        DAILY: 'Hoy',
        WEEKLY: 'Semanal',
        MONTHLY: 'Mensual',
        YEARLY: 'Anual'
    };

    return (
        <div className="page-content animate-fade-in pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-white italic tracking-tight uppercase">Estadísticas</h1>
                <div className="flex bg-surface-800 p-1 rounded-xl border border-surface-700">
                    {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all ${period === p ? 'bg-primary-500 text-white shadow-lg' : 'text-soft hover:bg-surface-700'}`}
                        >
                            {periodLabels[p].toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 mb-8 border-b border-surface-700/50 pb-4">
                {[
                    { id: 'GENERAL', label: 'Resumen', icon: LayoutDashboard },
                    { id: 'HABITS', label: 'Hábitos', icon: Activity },
                    { id: 'TASKS', label: 'Tareas', icon: CheckCircle2 },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${activeTab === tab.id
                            ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                            : 'bg-transparent border-transparent text-soft hover:bg-surface-800'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {activeTab === 'GENERAL' && summary && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Today special view */}
                        {period === 'DAILY' ? (
                            <>
                                {/* Big progress ring-style card */}
                                <div className="card bg-gradient-to-br from-primary-600/10 to-surface-800 border-primary-500/20 overflow-hidden relative">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4">Progreso de hoy</p>
                                    <div className="flex items-end justify-between gap-4 mb-4">
                                        <div>
                                            <span className="text-5xl font-black text-white tabular-nums">{summary.completionRate}%</span>
                                            <p className="text-sm text-soft mt-1">
                                                {summary.completionRate === 100 && summary.habitsTotal + summary.tasksTotal > 0
                                                    ? '¡Todo completo! 🎉'
                                                    : `${(summary.habitsDone ?? 0) + (summary.tasksDone ?? 0)} de ${(summary.habitsTotal ?? 0) + (summary.tasksTotal ?? 0)} completados`}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-xs text-soft">
                                                <span className="text-white font-bold">{summary.habitsDone ?? 0}/{summary.habitsTotal ?? 0}</span> hábitos
                                            </p>
                                            <p className="text-xs text-soft">
                                                <span className="text-white font-bold">{summary.tasksDone ?? 0}/{summary.tasksTotal ?? 0}</span> tareas
                                            </p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-2 rounded-full bg-surface-700/50 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${summary.completionRate >= 100
                                                ? 'bg-accent-green shadow-[0_0_12px_rgba(34,211,160,0.4)]'
                                                : 'bg-gradient-to-r from-primary-500 to-accent-green'
                                                }`}
                                            style={{ width: `${summary.completionRate}%` }}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 text-[80px] opacity-[0.04] font-black leading-none select-none">
                                        {summary.completionRate}%
                                    </div>
                                </div>

                                {/* Habit + Task mini cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <StatCard
                                        label="Hábitos"
                                        value={`${summary.habitsDone ?? 0}/${summary.habitsTotal ?? 0}`}
                                        sub="completados hoy"
                                        icon={Activity}
                                        color={(summary.habitsDone ?? 0) === (summary.habitsTotal ?? 0) && (summary.habitsTotal ?? 0) > 0 ? 'bg-accent-green' : 'bg-primary-500'}
                                    />
                                    <StatCard
                                        label="Tareas"
                                        value={`${summary.tasksDone ?? 0}/${summary.tasksTotal ?? 0}`}
                                        sub="completadas hoy"
                                        icon={CheckCircle2}
                                        color={(summary.tasksDone ?? 0) === (summary.tasksTotal ?? 0) && (summary.tasksTotal ?? 0) > 0 ? 'bg-accent-green' : 'bg-accent-purple'}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    label="Completado"
                                    value={`${summary.completionRate}%`}
                                    sub={`${summary.tasksDone} de ${summary.tasksTotal} tareas`}
                                    icon={TrendingUp}
                                    color="bg-primary-500"
                                />
                                <StatCard
                                    label="Mejor día"
                                    value={summary.bestDay?.label ?? '—'}
                                    sub="Este periodo"
                                    icon={Calendar}
                                    color="bg-accent-purple"
                                />
                            </div>
                        )}

                        {summary.highlights?.length > 0 && (
                            <div className="card bg-gradient-to-br from-primary-500/10 to-surface-800 border-primary-500/20">
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3">Insights Clave</p>
                                {summary.highlights.map((h: string, i: number) => (
                                    <p key={i} className="text-sm text-soft leading-relaxed flex items-start gap-3 mb-2 last:mb-0">
                                        <span className="text-primary-400">✨</span> {h}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'HABITS' && (
                    <div className="space-y-6 animate-fade-in">
                        {habitChartData.length > 0 && (
                            <div className="card">
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-xs font-bold text-white uppercase tracking-widest">Consistencia de Hábitos</p>
                                    <span className="text-[10px] font-medium text-muted">Afluencia semanal</span>
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={habitChartData} barSize={32}>
                                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                                            {habitChartData.map((entry: any, i: number) => (
                                                <Cell key={i} fill={entry.pct >= 80 ? '#22d3a0' : entry.pct >= 50 ? '#38bdf8' : '#475569'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Rachas Mundiales</p>
                            {streaks.length === 0 ? (
                                <p className="text-muted text-sm text-center py-8">{t('common.noData')}</p>
                            ) : (
                                streaks
                                    .sort((a, b) => b.currentStreak - a.currentStreak)
                                    .map(s => {
                                        const maxVal = Math.max(s.maxStreak, s.currentStreak);
                                        return (
                                            <div key={s.id} className="card border-surface-700/50 bg-surface-800/20">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-3xl filter drop-shadow-md">{s.icon ?? '⭐'}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-white truncate">{s.name}</p>
                                                        {s.isPaused && <span className="badge bg-surface-700 text-white/40 text-[9px] mt-1">PAUSADO</span>}
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <div className="flex items-center gap-1.5 text-accent-amber">
                                                            <span className="text-[9px] font-black opacity-40">ACTUAL</span>
                                                            <Flame size={14} />
                                                            <span className="text-xl font-black leading-none">{s.currentStreak}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-soft mt-1">
                                                            <span className="text-[8px] font-black opacity-30">RÉCORD</span>
                                                            <Trophy size={11} className="opacity-30" />
                                                            <span className="text-xs font-bold">{maxVal}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-surface-700/50 overflow-hidden border border-white/5">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-accent-amber via-primary-400 to-accent-green shadow-[0_0_10px_rgba(251,191,36,0.15)] transition-all duration-1000"
                                                        style={{ width: `${maxVal > 0 ? (s.currentStreak / maxVal) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'TASKS' && summary && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <p className="text-xs font-bold text-white uppercase tracking-widest mb-6">Por Categoría</p>
                            <div className="space-y-5">
                                {summary.tasksByCategory?.length === 0 ? (
                                    <p className="text-muted text-center py-8">No hay tareas este periodo</p>
                                ) : (
                                    summary.tasksByCategory.map((cat: any) => (
                                        <div key={cat.name}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                                                </span>
                                                <span className="text-[11px] font-bold text-soft">{cat.done} / {cat.total}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-surface-700/50 overflow-hidden p-[1px]">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${cat.pct >= 80 ? 'bg-accent-green shadow-[0_0_8px_rgba(34,211,160,0.3)]' :
                                                        cat.pct >= 40 ? 'bg-primary-500' : 'bg-surface-600'
                                                        }`}
                                                    style={{ width: `${cat.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="card bg-accent-purple/5 border-accent-purple/10 flex items-center gap-4">
                            <div className="p-3 bg-accent-purple/20 rounded-2xl text-accent-purple">
                                <ListTodo size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-accent-purple/60 uppercase tracking-widest">Eficiencia Total</p>
                                <p className="text-lg font-black text-white">
                                    {summary.completionRate}% de las tareas completadas
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
