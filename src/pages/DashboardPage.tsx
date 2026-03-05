import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Dumbbell, Award, Bell, X } from 'lucide-react';
import { habitApi } from '@/api/habits';
import { taskApi } from '@/api/tasks';
import { gymApi, loadDoneSet, type WorkoutDay } from '@/api/gym';
import { useAuthStore } from '@/store/authStore';
import { isPushSubscribed } from '@/services/pushNotifications';
import { Habit, Task } from '@/types';
import { CATEGORIES, resolveCategory, getCategoryMeta } from './HabitsPage';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

function HabitRow({ habit, onCheck, onUncheck }: { habit: Habit; onCheck: (id: string, completed: boolean) => void; onUncheck: (id: string) => void }) {
    return (
        <div className={`flex items-center gap-3 py-3 border-b border-surface-700/40 last:border-0 ${habit.todayCompleted ? 'opacity-60' : ''}`}>
            <button
                onClick={() => habit.todayCompleted ? onUncheck(habit.id) : onCheck(habit.id, !!habit.todayCompleted)}
                className={`flex-shrink-0 transition-all active:scale-90 ${habit.todayCompleted ? 'text-accent-green' : 'text-white/20 hover:text-primary-400'}`}
            >
                {habit.todayCompleted
                    ? <CheckCircle2 size={24} className="animate-scale-in" />
                    : <Circle size={24} />
                }
            </button>
            <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${habit.todayCompleted ? 'line-through text-soft' : 'text-white'}`}>
                    {habit.template?.icon ?? getCategoryMeta(resolveCategory(habit)).emoji} {habit.name}
                </p>
                {habit.currentStreak! > 0 && (
                    <p className="text-[11px] text-accent-amber mt-0.5">🔥 {habit.currentStreak} días</p>
                )}
            </div>
            {habit.type === 'COUNTER' && (
                <span className="badge bg-surface-700 text-white">{habit.todayValue ?? 0}</span>
            )}
        </div>
    );
}

function TaskRow({ task, onStatus }: { task: Task; onStatus: (id: string) => void }) {
    const done = task.status === 'DONE';
    const inProgress = task.status === 'IN_PROGRESS';
    return (
        <div className={`flex items-center gap-3 py-3 border-b border-surface-700/40 last:border-0 ${done ? 'opacity-50' : ''}`}>
            <button onClick={() => onStatus(task.id)} className="flex-shrink-0 active:scale-90 transition-transform">
                {done
                    ? <CheckCircle2 size={20} className="text-accent-green" />
                    : inProgress
                        ? <div className="relative flex items-center justify-center">
                            <div className="absolute w-4 h-4 bg-primary-500/40 rounded-full animate-ping" />
                            <div className="w-5 h-5 rounded-full border-2 border-primary-500 bg-primary-500 flex items-center justify-center z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                        </div>
                        : <Circle size={20} className="text-white/20" />
                }
            </button>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${done ? 'line-through text-soft' : 'text-white'}`}>{task.title}</p>
                <p className="text-[11px] text-muted mt-0.5">{task.category}</p>
            </div>
            {task.isRecurring && <span className="badge bg-surface-700 text-white/60 text-[10px]">↺</span>}
        </div>
    );
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);

    const [habits, setHabits] = useState<Habit[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [gymDay, setGymDay] = useState<WorkoutDay | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPushBanner, setShowPushBanner] = useState(false);

    // Default selectedDate is today
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const dateStr = selectedDate.toISOString().split('T')[0];

    const dayOfWeekKey = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][selectedDate.getDay()] as any;

    useEffect(() => {
        setLoading(true);
        Promise.all([
            habitApi.getToday(dateStr),
            taskApi.getToday(dateStr),
            gymApi.getDay(dayOfWeekKey).catch(() => null),
        ]).then(([h, ta, g]) => {
            setHabits(h.data);
            setTasks(ta.data);
            setGymDay(g);
        }).finally(() => setLoading(false));
    }, [dateStr]);

    // Check push notification status
    useEffect(() => {
        if (sessionStorage.getItem('push_banner_dismissed')) return;
        isPushSubscribed().then(subscribed => {
            if (!subscribed) setShowPushBanner(true);
        });
    }, []);

    const dismissPushBanner = () => {
        setShowPushBanner(false);
        sessionStorage.setItem('push_banner_dismissed', '1');
    };

    const handleHabitCheck = async (id: string, completed: boolean) => {
        if (completed) return;
        try {
            await habitApi.log(id, { value: 1, dateStr });
            setHabits(prev => prev.map(h => h.id === id ? { ...h, todayCompleted: true, todayValue: (h.todayValue ?? 0) + 1 } : h));
        } catch { /* handled by api layer */ }
    };

    const handleHabitUncheck = async (id: string) => {
        try {
            await habitApi.unlog(id, dateStr);
            setHabits(prev => prev.map(h => h.id === id ? { ...h, todayCompleted: false, todayValue: Math.max(0, (h.todayValue ?? 1) - 1) } : h));
        } catch { /* handled */ }
    };

    const handleTaskStatus = async (id: string) => {
        const task = tasks.find(t => t.id === id)!;
        const next = task.status === 'PENDING' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'PENDING';
        try {
            // we update status locally
            // since taskApi might not support rollback date, we just change status for now
            await taskApi.changeStatus(id, next);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t));
        } catch { /* handled */ }
    };

    const doneHabits = habits.filter(h => h.todayCompleted).length;
    const pendingHabits = habits.length - doneHabits;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;
    const pendingTasks = tasks.length - doneTasks;
    const totalPending = pendingHabits + pendingTasks;
    const totalItems = habits.length + tasks.length;
    const completionPct = totalItems > 0 ? Math.round(((doneHabits + doneTasks) / totalItems) * 100) : 0;

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    return (
        <div className="page-content animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-bold text-white">Hola, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-sm text-muted mt-0.5">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</p>
                </div>
            </div>

            {/* Week Days Selector */}
            <div className="flex justify-between items-center bg-surface-800/50 p-3 rounded-2xl mb-6 border border-surface-700/50">
                {weekDays.map(day => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const label = format(day, 'EEEEEE', { locale: es }).toUpperCase(); // L M X J V S D
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className="flex flex-col items-center gap-1 transition-all active:scale-95"
                        >
                            <span className={`text-xs font-bold ${isSelected || isToday ? 'text-white' : 'text-white/40'}`}>
                                {label}
                            </span>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all
                                ${isSelected
                                    ? 'bg-primary-500 border-primary-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                                    : isToday
                                        ? 'border-primary-500/50 text-white'
                                        : 'border-surface-700/80 hover:border-surface-600'}`}
                            >
                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-transparent'}`}>
                                    {isSelected ? format(day, 'd') : ''}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Push notification banner */}
            {showPushBanner && (
                <div className="mb-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-surface-800 p-3.5 flex items-start gap-3 animate-fade-in">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Bell size={18} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">Activá las notificaciones</p>
                        <p className="text-xs text-soft mt-0.5">No te pierdas recordatorios ni mensajes de tus amigos.</p>
                        <Link to="/settings" className="inline-block mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                            Ir a Configuración →
                        </Link>
                    </div>
                    <button onClick={dismissPushBanner} className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 p-1">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Daily summary card (Reactive) */}
            <div className="card mb-6 bg-gradient-to-br from-primary-600/20 to-surface-800 border-primary-500/20 overflow-hidden relative">
                <div className="flex justify-between items-center gap-3 relative z-10">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">PROGRESO DIARIO</p>
                        <h2 className="text-base font-bold text-white leading-tight">
                            {totalPending === 0 && totalItems > 0
                                ? "¡Todo listo por hoy! 🎉"
                                : `Quedan ${totalPending} pendientes`}
                        </h2>
                        <p className="text-xs text-soft mt-1">
                            {pendingHabits} hábitos y {pendingTasks} tareas por hacer
                        </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <span className="text-2xl font-black text-white tabular-nums">{completionPct}%</span>
                    </div>
                </div>
                {/* Progress bar background indicator */}
                <div className="absolute bottom-0 left-0 h-1 bg-primary-500 transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>

            {/* Gym Motivation */}
            {gymDay && gymDay.exercises && gymDay.exercises.length > 0 && (() => {
                const isSelectedToday = isSameDay(selectedDate, new Date());
                const doneSet = isSelectedToday ? loadDoneSet(dayOfWeekKey) : new Set<string>();
                const allDone = gymDay.exercises.every(e => doneSet.has(e.id));
                const progress = `${doneSet.size}/${gymDay.exercises.length}`;

                return (
                    <Link to="/gym" className="block mb-6">
                        <div className={`card transition-colors flex items-center justify-between gap-3
                                         ${allDone
                                ? 'bg-gradient-to-br from-indigo-600/20 to-surface-800 border-indigo-500/20 hover:border-indigo-500/40'
                                : 'bg-gradient-to-br from-emerald-600/20 to-surface-800 border-emerald-500/20 hover:border-emerald-500/40'}`}>
                            <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold uppercase tracking-widest mb-1
                                             ${allDone ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                    {allDone ? 'Entrenamiento' : 'Gimnasio'}
                                </p>
                                <h2 className="text-base font-bold text-white leading-tight">
                                    {allDone
                                        ? '¡Rutina completada! 🎉'
                                        : `Hoy te toca ${gymDay.name ? `"${gymDay.name}"` : 'entrenar'} 💪`
                                    }
                                </h2>
                                {!allDone && doneSet.size > 0 && (
                                    <p className="text-xs text-soft mt-1">Progreso: {progress}</p>
                                )}
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                            ${allDone ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                                {allDone
                                    ? <Award size={20} className="text-indigo-400" />
                                    : <Dumbbell size={20} className="text-emerald-400" />
                                }
                            </div>
                        </div>
                    </Link>
                );
            })()}

            {loading ? (
                <div className="text-center py-12 text-muted animate-pulse-soft">{t('common.loading')}</div>
            ) : (
                <>
                    {/* Habits block — grouped by category */}
                    {habits.length > 0 && (() => {
                        const visibleHabits = pendingHabits > 0 ? habits.filter(h => !h.todayCompleted) : habits;

                        // Build category groups (preserving CATEGORIES order)
                        const groups: { meta: typeof CATEGORIES[0]; habits: Habit[] }[] = [];
                        for (const cat of CATEGORIES) {
                            const group = visibleHabits.filter(h => resolveCategory(h) === cat.value);
                            if (group.length > 0) groups.push({ meta: cat, habits: group });
                        }
                        // Unknown categories → 'otro'
                        const knownValues = CATEGORIES.map(c => c.value);
                        const unknown = visibleHabits.filter(h => !knownValues.includes(resolveCategory(h)));
                        if (unknown.length > 0) {
                            const otro = CATEGORIES.find(c => c.value === 'otro')!;
                            const existing = groups.find(g => g.meta.value === 'otro');
                            if (existing) existing.habits.push(...unknown);
                            else groups.push({ meta: otro, habits: unknown });
                        }

                        const isSingleGroup = groups.length === 1;

                        return (
                            <section className="card mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="section-title">{t('dashboard.habitsToday')}</h2>
                                    <span className={`badge ${pendingHabits === 0 ? 'bg-accent-green/20 text-accent-green' : 'bg-primary-500/20 text-primary-400'} font-bold`}>
                                        {doneHabits}/{habits.length}
                                    </span>
                                </div>
                                {groups.map(({ meta, habits: group }) => (
                                    <div key={meta.value}>
                                        {!isSingleGroup && (
                                            <div className="flex items-center gap-1.5 mb-1 mt-3 first:mt-0">
                                                <span className="text-sm">{meta.emoji}</span>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                                            </div>
                                        )}
                                        {group.map(h => (
                                            <HabitRow key={h.id} habit={h} onCheck={handleHabitCheck} onUncheck={handleHabitUncheck} />
                                        ))}
                                    </div>
                                ))}
                            </section>
                        );
                    })()}

                    {/* Tasks block */}
                    {tasks.length > 0 && (
                        <section className="card mb-4 min-h-[100px]">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="section-title">{t('dashboard.tasksToday')}</h2>
                                <span className={`badge ${pendingTasks === 0 ? 'bg-accent-green/20 text-accent-green' : 'bg-primary-500/20 text-primary-400'} font-bold`}>
                                    {doneTasks}/{tasks.length}
                                </span>
                            </div>
                            {(pendingTasks > 0 ? tasks.filter(t => t.status !== 'DONE') : tasks).map(t => (
                                <TaskRow key={t.id} task={t} onStatus={handleTaskStatus} />
                            ))}
                        </section>
                    )}

                    {habits.length === 0 && tasks.length === 0 && (!gymDay || !gymDay.exercises || gymDay.exercises.length === 0) && (
                        <div className="text-center py-12">
                            <p className="text-muted text-sm">{t('common.noData')}</p>
                        </div>
                    )}
                </>
            )}

            {/* Removed DailyReflectionCard from here */}
        </div>
    );
}
