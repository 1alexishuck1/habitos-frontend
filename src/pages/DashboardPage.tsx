import { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Dumbbell, Award, Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { habitApi } from '@/api/habits';
import { taskApi } from '@/api/tasks';
import { gymApi, loadDoneSet, type WorkoutDay } from '@/api/gym';
import { useAuthStore } from '@/store/authStore';
import { isPushSubscribed } from '@/services/pushNotifications';
import { Habit, Task } from '@/types';
import { CATEGORIES, resolveCategory, getCategoryMeta } from './HabitsPage';
import { addDays, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';


function HabitRow({ habit, onCheck, onUncheck, disabled, onCounterClick }: { habit: Habit; onCheck: (id: string, completed: boolean) => void; onUncheck: (id: string) => void; disabled?: boolean; onCounterClick: (habit: Habit) => void }) {
    return (
        <div className={`flex items-center gap-3 py-3 border-b border-surface-700/40 last:border-0 ${habit.todayCompleted ? 'opacity-60' : ''} ${disabled ? 'opacity-50' : ''}`}>
            {habit.type === 'COUNTER' ? (
                <button
                    disabled={disabled}
                    onClick={() => !disabled && onCounterClick(habit)}
                    className={`flex-shrink-0 transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'active:scale-90'} ${habit.todayCompleted ? 'text-accent-green' : 'text-white/20 hover:text-primary-400'}`}
                >
                    {habit.todayCompleted
                        ? <CheckCircle2 size={24} className={disabled ? '' : "animate-scale-in"} />
                        : <Circle size={24} />
                    }
                </button>
            ) : (
                <button
                    disabled={disabled}
                    onClick={() => !disabled && (habit.todayCompleted ? onUncheck(habit.id) : onCheck(habit.id, !!habit.todayCompleted))}
                    className={`flex-shrink-0 transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'active:scale-90'} ${habit.todayCompleted ? 'text-accent-green' : 'text-white/20 hover:text-primary-400'}`}
                >
                    {habit.todayCompleted
                        ? <CheckCircle2 size={24} className={disabled ? '' : "animate-scale-in"} />
                        : <Circle size={24} />
                    }
                </button>
            )}
            <div className="flex-1 min-w-0" onClick={() => !disabled && habit.type === 'COUNTER' && onCounterClick(habit)}>
                <p className={`font-medium text-sm truncate ${habit.todayCompleted ? 'line-through text-soft' : 'text-white'} ${habit.type === 'COUNTER' ? 'cursor-pointer' : ''}`}>
                    {habit.template?.icon ?? getCategoryMeta(resolveCategory(habit)).emoji} {habit.name}
                </p>
                {habit.currentStreak! > 0 && (
                    <p className="text-[11px] text-accent-amber mt-0.5">🔥 {habit.currentStreak} días</p>
                )}
            </div>
            {habit.type === 'COUNTER' && (
                <button
                    disabled={disabled}
                    onClick={() => !disabled && onCounterClick(habit)}
                    className={`badge ${disabled ? 'cursor-not-allowed opacity-50' : 'active:scale-95 cursor-pointer'} ${habit.todayCompleted ? 'bg-primary-500/20 text-primary-400 font-bold' : 'bg-surface-700 text-white'}`}
                >
                    {habit.todayValue ?? 0} / {habit.goalValue ?? 1}
                </button>
            )}
        </div>
    );
}

function TaskRow({ task, onStatus, disabled }: { task: Task; onStatus: (id: string) => void; disabled?: boolean }) {
    const done = task.status === 'DONE';
    const inProgress = task.status === 'IN_PROGRESS';
    return (
        <div className={`flex items-center gap-3 py-3 border-b border-surface-700/40 last:border-0 ${done ? 'opacity-50' : ''} ${disabled ? 'opacity-50' : ''}`}>
            <button disabled={disabled} onClick={() => !disabled && onStatus(task.id)} className={`flex-shrink-0 ${disabled ? 'cursor-not-allowed opacity-50' : 'active:scale-90 transition-transform'}`}>
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
    const { user, refreshUser } = useAuthStore(s => ({ user: s.user, refreshUser: s.refreshUser }));

    const [habits, setHabits] = useState<Habit[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [gymDay, setGymDay] = useState<WorkoutDay | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPushBanner, setShowPushBanner] = useState(false);

    // Default selectedDate is today
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

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

    const [counterHabit, setCounterHabit] = useState<Habit | null>(null);
    const [counterValue, setCounterValue] = useState<number>(0);

    const handleCounterSubmit = async () => {
        if (!counterHabit || counterValue === 0) return;
        const delta = counterValue;
        setCounterHabit(null);
        try {
            const { data } = await habitApi.log(counterHabit.id, { value: delta, dateStr });
            setHabits(prev => prev.map(h => h.id === counterHabit.id ? {
                ...h,
                todayValue: data.totalValue,
                todayCompleted: data.completed,
                currentStreak: data.currentStreak,
                maxStreak: data.maxStreak
            } : h));
            refreshUser();
        } catch { /* handled */ }
    };

    const handleHabitCheck = async (id: string, completed: boolean) => {
        if (completed) return;
        try {
            await habitApi.log(id, { value: 1, dateStr });
            setHabits(prev => prev.map(h => h.id === id ? { ...h, todayCompleted: true, todayValue: (h.todayValue ?? 0) + 1 } : h));
            refreshUser();
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
            refreshUser();
        } catch { /* handled */ }
    };

    const doneHabits = habits.filter(h => h.todayCompleted).length;
    const pendingHabits = habits.length - doneHabits;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;
    const pendingTasks = tasks.length - doneTasks;
    const totalPending = pendingHabits + pendingTasks;
    const totalItems = habits.length + tasks.length;
    const completionPct = totalItems > 0 ? Math.round(((doneHabits + doneTasks) / totalItems) * 100) : 0;

    const scrollRef = useRef<HTMLDivElement>(null);
    const weekDays = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 60 }).map((_, i) => addDays(today, i - 30));
    }, []);

    const isSelectedToday = isSameDay(selectedDate, new Date());

    useEffect(() => {
        if (scrollRef.current) {
            const selectedBtn = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedBtn) {
                selectedBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [selectedDate]);

    return (
        <div className="page-content animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        Hola, {user?.name} 👋
                        <div className="badge border border-primary-500/50 bg-primary-500/20 text-primary-400 font-black px-2 py-0.5 text-xs">
                            Nvl. {Math.floor((user?.experience ?? 0) / 100) + 1}
                        </div>
                    </h1>
                    <p className="text-sm text-muted mt-0.5">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</p>
                </div>
            </div>

            {/* Week Days Selector */}
            <div className="relative mb-6 group">
                {/* Left Arrow (PC) */}
                <button
                    onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-surface-700 hover:bg-surface-600 items-center justify-center text-white z-10 shadow-lg border border-surface-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft size={18} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar bg-surface-800/50 p-3 rounded-2xl border border-surface-700/50 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {weekDays.map(day => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const isPast = isBefore(day, startOfDay(new Date()));
                        const label = format(day, 'EEEEEE', { locale: es }).toUpperCase(); // L M X J V S D
                        return (
                            <button
                                key={day.toISOString()}
                                data-selected={isSelected}
                                onClick={() => setSelectedDate(day)}
                                className={`flex flex-col items-center gap-1 transition-all active:scale-95 flex-shrink-0 snap-center min-w-[3rem] ${!isSelected && isPast ? 'opacity-40 hover:opacity-100' : ''}`}
                            >
                                <span className={`text-xs font-bold ${isSelected || isToday ? 'text-white' : 'text-white/40'}`}>
                                    {label}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-0 transition-all border-[3px]
                                    ${isSelected
                                        ? 'bg-primary-500 border-primary-500 shadow-[0_0_12px_rgba(236,72,153,0.6)]'
                                        : isToday
                                            ? 'bg-primary-500/20 border-primary-500/80 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                                            : 'border-surface-700/80 hover:border-surface-600'}`}
                                >
                                    <span className={`text-sm font-bold ${isSelected || isToday ? 'text-white' : 'text-white/50'}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right Arrow (PC) */}
                <button
                    onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-surface-700 hover:bg-surface-600 items-center justify-center text-white z-10 shadow-lg border border-surface-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight size={18} />
                </button>
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

            {/* Removed Experience Section for new Progress Page */}

            {loading ? (
                <div className="text-center py-12 text-muted animate-pulse-soft">{t('common.loading')}</div>
            ) : (
                <>
                    {/* Habits block — grouped by category */}
                    {habits.length > 0 && (() => {
                        const visibleHabits = habits;

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
                                            <HabitRow key={h.id} habit={h} onCheck={handleHabitCheck} onUncheck={handleHabitUncheck} disabled={!isSelectedToday} onCounterClick={(habit) => {
                                                setCounterHabit(habit);
                                                setCounterValue(0);
                                            }} />
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
                            {tasks.map(t => (
                                <TaskRow key={t.id} task={t} onStatus={handleTaskStatus} disabled={!isSelectedToday} />
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

            {/* Counter Modal */}
            {counterHabit && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCounterHabit(null)} />
                    <div className="relative w-full max-w-[320px] bg-surface-800 rounded-3xl overflow-hidden shadow-2xl border border-surface-700 animate-slide-up flex flex-col p-[2px]">
                        <div className="bg-surface-800 rounded-[22px] flex flex-col">
                            <div className="p-6 text-center relative z-10">
                                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-primary-500/20 shadow-[inset_0_2px_10px_rgba(236,72,153,0.1)]">
                                    {counterHabit.template?.icon ?? getCategoryMeta(resolveCategory(counterHabit)).emoji}
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{counterHabit.name}</h3>
                                <div className="text-sm text-soft mt-2">
                                    <p>¿Qué querés registrar hoy?</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        Llevás {counterHabit.todayValue ?? 0} de {counterHabit.goalValue ?? 1}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center items-center px-6 pb-8 pt-2 z-10">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => setCounterValue(counterValue - 1)}
                                            className="w-14 h-14 bg-surface-700 hover:bg-surface-600 rounded-full flex items-center justify-center text-3xl font-bold transition-all active:scale-90 border border-surface-600/50 text-white shadow-lg"
                                        >
                                            -
                                        </button>
                                        <span className={`text-5xl font-black tabular-nums leading-none w-28 text-center ${counterValue > 0 ? 'text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-accent-amber' : counterValue < 0 ? 'text-red-400' : 'text-white/20'}`}>
                                            {counterValue > 0 ? `+${counterValue}` : counterValue}
                                        </span>
                                        <button
                                            onClick={() => setCounterValue(counterValue + 1)}
                                            className="w-14 h-14 bg-surface-700 hover:bg-surface-600 rounded-full flex items-center justify-center text-3xl font-bold transition-all active:scale-90 border border-surface-600/50 text-white shadow-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setCounterValue(counterValue - 5)} className="px-4 py-2 bg-surface-700/50 hover:bg-surface-600 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90 text-white shadow border border-surface-600/30">
                                            - 5
                                        </button>
                                        <button onClick={() => setCounterValue(counterValue + 5)} className="px-4 py-2 bg-surface-700/50 hover:bg-surface-600 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90 text-white shadow border border-surface-600/30">
                                            + 5
                                        </button>
                                        <button onClick={() => setCounterValue(counterValue + 10)} className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/20 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90 shadow">
                                            + 10
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-4 border-t border-surface-700/50 bg-surface-900/40 rounded-b-[22px] z-10 relative">
                                <button onClick={() => setCounterHabit(null)} className="btn-ghost font-bold text-xs py-3 rounded-xl">
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleCounterSubmit}
                                    disabled={counterValue === 0}
                                    className="btn-primary font-bold text-xs py-3 rounded-xl shadow-[0_4px_12px_rgba(236,72,153,0.3)] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    GUARDAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
