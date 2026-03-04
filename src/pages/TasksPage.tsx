import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Circle, CheckCircle2, Trash2 } from 'lucide-react';
import { taskApi } from '@/api/tasks';
import { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { ConfirmModal } from '@/components/ConfirmModal';

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
    PENDING: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'PENDING',
};
function StatusIcon({ status }: { status: TaskStatus }) {
    if (status === 'DONE') return <CheckCircle2 size={22} className="text-accent-green" />;
    if (status === 'IN_PROGRESS') return (
        <div className="relative flex items-center justify-center">
            <div className="absolute w-5 h-5 bg-primary-500/40 rounded-full animate-ping" />
            <div className="w-5.5 h-5.5 rounded-full border-2 border-primary-500 bg-primary-500 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
        </div>
    );
    return <Circle size={22} className="text-white/20" />;
}

function TaskCard({ task, onStatus, onDelete }: { task: Task; onStatus: (id: string) => void; onDelete: (id: string) => void }) {
    return (
        <div className={`card mb-3 animate-slide-up transition-opacity ${task.status === 'DONE' ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
                <button onClick={() => onStatus(task.id)} className="flex-shrink-0 active:scale-90 transition-transform">
                    <StatusIcon status={task.status} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${task.status === 'DONE' ? 'line-through text-soft' : 'text-white'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="badge bg-surface-700 text-white/50 text-[10px]">{task.category}</span>
                        {task.isRecurring && <span className="badge bg-primary-500/10 text-primary-400 text-[10px]">↺ recurrente</span>}
                        {task.dueDate && <span className="text-[10px] text-muted">{new Date(task.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>}
                    </div>
                </div>
                <button onClick={() => onDelete(task.id)} className="text-white/20 hover:text-accent-red transition-colors p-1.5 rounded-lg hover:bg-accent-red/10">
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

function CreateTaskModal({ onClose, onCreate }: { onClose: () => void; onCreate: (t: Task) => void }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        title: '', description: '', category: 'general',
        isRecurring: false, dueDate: '',
        recurrenceType: 'daily' as 'daily' | 'weekly' | 'monthly',
        recurrenceDays: [] as number[],
    });
    const [loading, setLoading] = useState(false);

    const WEEKDAYS = [1, 2, 3, 4, 5];
    const WEEKEND = [6, 7];
    const DOW = [1, 2, 3, 4, 5, 6, 7];
    const dowLabels: Record<number, string> = { 1: 'L', 2: 'M', 3: 'M', 4: 'J', 5: 'V', 6: 'S', 7: 'D' };

    const suggestions = [
        { title: 'Trabajo Profundo', category: 'productividad' },
        { title: 'Planificar semana', category: 'personal' },
        { title: 'Inbox Zero', category: 'trabajo' },
        { title: 'Comprar víveres', category: 'hogar' },
        { title: 'Llamar a familia', category: 'social' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await taskApi.create({
                title: form.title,
                description: form.description || undefined,
                category: form.category,
                isRecurring: form.isRecurring,
                dueDate: form.dueDate || undefined,
                recurrenceRule: form.isRecurring
                    ? { type: form.recurrenceType, days: form.recurrenceDays.length ? form.recurrenceDays : undefined }
                    : undefined,
            });
            onCreate(data);
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="section-title text-lg m-0">{t('tasks.addTask')}</h3>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Sugerencias rápidas</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setForm({ ...form, title: s.title, category: s.category })}
                                className="px-3 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-[11px] font-semibold text-soft transition-all active:scale-95"
                            >
                                + {s.title}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Tarea</label>
                        <input className="input" placeholder="Ej: Leer libro" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Categoría</label>
                            <input className="input" placeholder="General" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Fecha</label>
                            <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                        </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface-700/30 border border-white/5">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-bold text-soft">{t('tasks.recurrent')}</span>
                            <div className={`w-10 h-5.5 rounded-full transition-colors ${form.isRecurring ? 'bg-primary-500' : 'bg-surface-600'} relative`}
                                onClick={() => setForm({ ...form, isRecurring: !form.isRecurring })}>
                                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${form.isRecurring ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                        </label>

                        {form.isRecurring && (
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fade-in">
                                <select className="input text-xs" value={form.recurrenceType} onChange={e => setForm({ ...form, recurrenceType: e.target.value as any })}>
                                    <option value="daily">Todos los días</option>
                                    <option value="weekly">Días específicos</option>
                                    <option value="monthly">Día del mes</option>
                                </select>

                                {/* Quick shortcuts */}
                                <div className="flex gap-2">
                                    <button type="button"
                                        onClick={() => setForm(f => ({
                                            ...f, isRecurring: true, recurrenceType: 'weekly', recurrenceDays: WEEKDAYS
                                        }))}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${form.recurrenceType === 'weekly' &&
                                            WEEKDAYS.every(d => form.recurrenceDays.includes(d)) && form.recurrenceDays.length === WEEKDAYS.length
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-surface-700 text-soft hover:bg-surface-600'
                                            }`}>
                                        📅 Días de semana
                                    </button>
                                    <button type="button"
                                        onClick={() => setForm(f => ({
                                            ...f, isRecurring: true, recurrenceType: 'weekly', recurrenceDays: WEEKEND
                                        }))}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${form.recurrenceType === 'weekly' &&
                                            WEEKEND.every(d => form.recurrenceDays.includes(d)) && form.recurrenceDays.length === WEEKEND.length
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-surface-700 text-soft hover:bg-surface-600'
                                            }`}>
                                        🎉 Fin de semana
                                    </button>
                                </div>
                                {form.recurrenceType === 'weekly' && (
                                    <div className="flex gap-1.5">
                                        {DOW.map(d => (
                                            <button key={d} type="button"
                                                onClick={() => setForm(f => ({
                                                    ...f, recurrenceDays: f.recurrenceDays.includes(d)
                                                        ? f.recurrenceDays.filter(x => x !== d)
                                                        : [...f.recurrenceDays, d]
                                                }))}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${form.recurrenceDays.includes(d) ? 'bg-primary-500 text-white' : 'bg-surface-700 text-soft'}`}>
                                                {dowLabels[d]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 text-sm font-bold shadow-lg shadow-primary-500/20" disabled={loading}>
                        {loading ? t('common.loading') : t('common.save')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function TasksPage() {
    const { t } = useTranslation();
    const { tasks, setTasks, updateTask, removeTask, addTask } = useTaskStore();
    const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
    const [showCreate, setShowCreate] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        taskApi.getAll().then(r => setTasks(r.data));
    }, []);

    const handleStatus = async (id: string) => {
        const task = tasks.find(t => t.id === id)!;
        const next = STATUS_CYCLE[task.status];
        const { data } = await taskApi.changeStatus(id, next);
        updateTask({ id, status: data.status, doneAt: data.doneAt });
    };

    const handleDelete = (id: string) => {
        setTaskToDelete(id);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        setIsDeleting(true);
        try {
            await taskApi.delete(taskToDelete);
            removeTask(taskToDelete);
        } finally {
            setIsDeleting(false);
            setTaskToDelete(null);
        }
    };

    const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

    // Group by category
    const groups = filtered.reduce<Record<string, Task[]>>((acc, t) => {
        (acc[t.category] = acc[t.category] ?? []).push(t);
        return acc;
    }, {});

    return (
        <div className="page-content animate-fade-in">
            <div className="flex items-center justify-between mb-5">
                <h1 className="section-title text-xl">{t('tasks.title')}</h1>
                <button onClick={() => setShowCreate(true)} className="btn-primary py-2 px-3 flex items-center gap-1.5 text-sm">
                    <Plus size={16} /> Nueva
                </button>
            </div>

            {/* Status filter */}
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
                {(['ALL', 'PENDING', 'IN_PROGRESS', 'DONE'] as const).map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === s ? 'bg-primary-500 text-white' : 'bg-surface-700 text-soft'
                            }`}>
                        {s === 'ALL' ? 'Todas' : t(`tasks.status.${s}`)} <span className="ml-1 opacity-60">{s === 'ALL' ? tasks.length : tasks.filter(t => t.status === s).length}</span>
                    </button>
                ))}
            </div>

            {Object.entries(groups).length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-4xl mb-3">✅</p>
                    <p className="text-soft">No hay tareas para mostrar.</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">Crear tarea</button>
                </div>
            ) : (
                Object.entries(groups).map(([cat, catTasks]) => (
                    <div key={cat} className="mb-4">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{cat}</p>
                        {catTasks.map(task => (
                            <TaskCard key={task.id} task={task} onStatus={handleStatus} onDelete={handleDelete} />
                        ))}
                    </div>
                ))
            )}

            {showCreate && (
                <CreateTaskModal
                    onClose={() => setShowCreate(false)}
                    onCreate={(task) => { addTask(task); setShowCreate(false); }}
                />
            )}

            <ConfirmModal
                isOpen={taskToDelete !== null}
                title="Eliminar tarea"
                message={<>¿Estás seguro de que querés eliminar la tarea <strong className="text-white/80">{tasks.find(t => t.id === taskToDelete)?.title}</strong>?</>}
                onConfirm={confirmDelete}
                onCancel={() => setTaskToDelete(null)}
                saving={isDeleting}
            />
        </div>
    );
}
