import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Dumbbell, Award } from 'lucide-react';
import { habitApi } from '@/api/habits';
import { taskApi } from '@/api/tasks';
import { gymApi, todayKey, loadDoneSet, type WorkoutDay } from '@/api/gym';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { useAuthStore } from '@/store/authStore';
import { Habit, Task } from '@/types';
import { CATEGORIES, resolveCategory } from './HabitsPage';


function HabitRow({ habit, onCheck }: { habit: Habit; onCheck: (id: string) => void }) {
    return (
        <div className={`flex items-center gap-3 py-3 border-b border-surface-700/40 last:border-0 ${habit.todayCompleted ? 'opacity-60' : ''}`}>
            <button
                onClick={() => !habit.todayCompleted && onCheck(habit.id)}
                className={`flex-shrink-0 transition-all active:scale-90 ${habit.todayCompleted ? 'text-accent-green' : 'text-white/20 hover:text-primary-400'}`}
            >
                {habit.todayCompleted
                    ? <CheckCircle2 size={24} className="animate-scale-in" />
                    : <Circle size={24} />
                }
            </button>
            <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${habit.todayCompleted ? 'line-through text-soft' : 'text-white'}`}>
                    {habit.template?.icon} {habit.name}
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

    useEffect(() => {
        Promise.all([
            habitApi.getToday(),
            taskApi.getToday(),
            gymApi.getDay(todayKey()).catch(() => null),
        ]).then(([h, ta, g]) => {
            setHabits(h.data);
            setTasks(ta.data);
            setGymDay(g);
        }).finally(() => setLoading(false));
    }, []);

    const handleHabitCheck = async (id: string) => {
        try {
            await habitApi.log(id, { value: 1 });
            setHabits(prev => prev.map(h => h.id === id ? { ...h, todayCompleted: true, todayValue: (h.todayValue ?? 0) + 1 } : h));
        } catch { /* handled by api layer */ }
    };

    const handleTaskStatus = async (id: string) => {
        const task = tasks.find(t => t.id === id)!;
        const next = task.status === 'PENDING' ? 'IN_PROGRESS' : 'DONE';
        try {
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

    return (
        <div className="page-content animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white">Hola, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-sm text-muted mt-0.5">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </div>

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
                const doneSet = loadDoneSet(todayKey());
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
                                            <HabitRow key={h.id} habit={h} onCheck={handleHabitCheck} />
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

            {/* Daily Reflection */}
            <DailyReflectionCard />
        </div>
    );
}
