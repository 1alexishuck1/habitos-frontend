import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Flame, Pause, Play, Trash2, ChevronRight, Trophy } from 'lucide-react';
import { habitApi } from '@/api/habits';
import { Habit, HabitTemplate } from '@/types';
import { useHabitStore } from '@/store/habitStore';
import { ConfirmModal } from '@/components/ConfirmModal';

// ─── Category config ──────────────────────────────────────────────────────────

export const CATEGORIES: { value: string; label: string; emoji: string; color: string }[] = [
    { value: 'salud', label: 'Salud Física', emoji: '💪', color: 'text-emerald-400' },
    { value: 'mente', label: 'Mente', emoji: '🧠', color: 'text-violet-400' },
    { value: 'productividad', label: 'Productividad', emoji: '🎯', color: 'text-blue-400' },
    { value: 'nutricion', label: 'Alimentación', emoji: '🥗', color: 'text-lime-400' },
    { value: 'hogar', label: 'Hogar', emoji: '🏠', color: 'text-amber-400' },
    { value: 'finanzas', label: 'Finanzas', emoji: '💰', color: 'text-yellow-400' },
    { value: 'digital', label: 'Digital', emoji: '📱', color: 'text-cyan-400' },
    { value: 'otro', label: 'Otro', emoji: '⭐', color: 'text-white/60' },
];

export function getCategoryMeta(value: string | null | undefined) {
    return CATEGORIES.find(c => c.value === value) ?? { value: 'otro', label: 'Otro', emoji: '⭐', color: 'text-white/60' };
}

/** Helper to resolve effective category for a habit (direct field > template.category > 'otro') */
export function resolveCategory(habit: Habit): string {
    return habit.category ?? habit.template?.category ?? 'otro';
}

// ─── HabitCard ────────────────────────────────────────────────────────────────

function HabitCard({ habit, onLog, onPause, onDelete }: {
    habit: Habit;
    onLog: (id: string) => void;
    onPause: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const maxVal = Math.max(habit.maxStreak, habit.currentStreak ?? 0);

    return (
        <div className="card mb-3 animate-slide-up">
            <div className="flex items-start gap-3">
                {/* Icon + name */}
                <div className="flex-1 cursor-pointer" onClick={() => setOpen(!open)}>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{habit.template?.icon ?? '⭐'}</span>
                        <div>
                            <p className="font-semibold text-white text-sm">{habit.name}</p>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{t(`habits.frequency.${habit.frequencyType}`)}</p>
                        </div>
                    </div>
                </div>

                {/* Streak current */}
                <div className="text-right">
                    <div className="flex items-center gap-1 text-accent-amber">
                        <Flame size={14} />
                        <span className="text-sm font-black">{habit.currentStreak ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* Expanded actions */}
            {open && (
                <div className="mt-3 pt-3 border-t border-surface-700/50 flex gap-2 flex-wrap animate-fade-in">
                    {!habit.isPaused && !habit.todayCompleted && (
                        <button
                            onClick={() => onLog(habit.id)}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                            <Plus size={13} /> {habit.type === 'COUNTER' ? '+1' : t('habits.completed')}
                        </button>
                    )}
                    <button onClick={() => onPause(habit.id)} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                        {habit.isPaused ? <><Play size={13} /> {t('habits.resume')}</> : <><Pause size={13} /> {t('habits.pause')}</>}
                    </button>
                    <button onClick={() => onDelete(habit.id)} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5">
                        <Trash2 size={13} /> {t('common.delete')}
                    </button>
                </div>
            )}

            {/* Progress bar */}
            <div className="mt-4">
                <div className="flex justify-between items-end mb-1.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted uppercase">
                        <span>Actual:</span>
                        <span className="text-accent-amber">{habit.currentStreak ?? 0}d</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted uppercase">
                        <Trophy size={10} className="opacity-40" />
                        <span>Récord:</span>
                        <span>{maxVal}d</span>
                    </div>
                </div>
                <div className="h-1.5 rounded-full bg-surface-700/50 overflow-hidden border border-white/5">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-amber via-primary-400 to-accent-green shadow-[0_0_8px_rgba(251,191,36,0.1)] transition-all duration-1000 ease-out"
                        style={{ width: `${maxVal > 0 ? ((habit.currentStreak ?? 0) / maxVal) * 100 : 0}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── GroupedHabitList ─────────────────────────────────────────────────────────

function GroupedHabitList({ habits, onLog, onPause, onDelete }: {
    habits: Habit[];
    onLog: (id: string) => void;
    onPause: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    // Group habits by resolved category, preserving CATEGORIES order
    const groups: { meta: typeof CATEGORIES[0]; habits: Habit[] }[] = [];

    for (const cat of CATEGORIES) {
        const group = habits.filter(h => resolveCategory(h) === cat.value);
        if (group.length > 0) groups.push({ meta: cat, habits: group });
    }

    // Any habit with an unknown category goes into "otro"
    const knownValues = CATEGORIES.map(c => c.value);
    const unknown = habits.filter(h => !knownValues.includes(resolveCategory(h)));
    if (unknown.length > 0) {
        const otro = CATEGORIES.find(c => c.value === 'otro')!;
        const existing = groups.find(g => g.meta.value === 'otro');
        if (existing) existing.habits.push(...unknown);
        else groups.push({ meta: otro, habits: unknown });
    }

    return (
        <>
            {groups.map(({ meta, habits: group }) => (
                <div key={meta.value} className="mb-5">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-base">{meta.emoji}</span>
                        <h2 className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</h2>
                        <span className="ml-auto text-[10px] text-muted">{group.length}</span>
                    </div>
                    {group.map(h => (
                        <HabitCard key={h.id} habit={h} onLog={onLog} onPause={onPause} onDelete={onDelete} />
                    ))}
                </div>
            ))}
        </>
    );
}

// ─── CreateHabitModal ─────────────────────────────────────────────────────────

function CreateHabitModal({ templates, onClose, onCreate }: {
    templates: HabitTemplate[];
    onClose: () => void;
    onCreate: (habit: Habit) => void;
}) {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'template' | 'custom'>('template');
    const [selectedCat, setSelectedCat] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
    const [form, setForm] = useState({
        name: '', type: 'CHECK', frequencyType: 'DAILY',
        frequencyDays: [] as number[], description: '', category: '',
    });
    const [loading, setLoading] = useState(false);

    const WEEKDAYS = [1, 2, 3, 4, 5];
    const WEEKEND = [6, 7];
    const DOW = [1, 2, 3, 4, 5, 6, 7];
    const dowLabels: Record<number, string> = { 1: 'L', 2: 'M', 3: 'M', 4: 'J', 5: 'V', 6: 'S', 7: 'D' };

    // Filter templates by selected category
    const filteredTemplates = selectedCat
        ? templates.filter(t => t.category === selectedCat)
        : templates;

    // Group templates by category
    const templateGroups: { meta: typeof CATEGORIES[0]; templates: HabitTemplate[] }[] = [];
    for (const cat of CATEGORIES) {
        const group = templates.filter(t => t.category === cat.value);
        if (group.length > 0) templateGroups.push({ meta: cat, templates: group });
    }

    const handleSelectTemplate = (tpl: HabitTemplate) => {
        setSelectedTemplate(tpl);
        setForm({
            name: tpl.name,
            type: tpl.type,
            frequencyType: tpl.defaultFrequency,
            frequencyDays: [],
            description: tpl.description ?? '',
            category: tpl.category ?? '',
        });
    };

    const handleConfirmTemplate = async () => {
        if (!selectedTemplate) return;
        setLoading(true);
        try {
            const { data } = await habitApi.create({
                templateId: selectedTemplate.id,
                name: selectedTemplate.name,
                type: selectedTemplate.type,
                frequencyType: form.frequencyType,
                frequencyDays: form.frequencyType === 'SPECIFIC_DAYS' ? form.frequencyDays : undefined,
                description: selectedTemplate.description ?? '',
                category: selectedTemplate.category ?? undefined,
            });
            onCreate(data);
        } finally { setLoading(false); }
    };

    const handleCustom = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await habitApi.create({ ...form, category: form.category || undefined });
            onCreate(data);
        } finally { setLoading(false); }
    };

    // ─── Frequency picker (shared between template config and custom form) ──
    const FrequencyPicker = () => (
        <div>
            <label className="block text-sm text-soft mb-1.5">Frecuencia</label>
            <select className="input" value={form.frequencyType} onChange={e => setForm({ ...form, frequencyType: e.target.value })}>
                <option value="DAILY">{t('habits.frequency.DAILY')}</option>
                <option value="WEEKLY">{t('habits.frequency.WEEKLY')}</option>
                <option value="SPECIFIC_DAYS">{t('habits.frequency.SPECIFIC_DAYS')}</option>
            </select>

            {/* Quick shortcuts */}
            <div className="flex gap-2 mt-2">
                <button type="button"
                    onClick={() => setForm(f => ({ ...f, frequencyType: 'SPECIFIC_DAYS', frequencyDays: WEEKDAYS }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.frequencyType === 'SPECIFIC_DAYS' &&
                        WEEKDAYS.every(d => form.frequencyDays.includes(d)) && form.frequencyDays.length === WEEKDAYS.length
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-700 text-soft hover:bg-surface-600'
                        }`}>
                    📅 Sem.
                </button>
                <button type="button"
                    onClick={() => setForm(f => ({ ...f, frequencyType: 'SPECIFIC_DAYS', frequencyDays: WEEKEND }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.frequencyType === 'SPECIFIC_DAYS' &&
                        WEEKEND.every(d => form.frequencyDays.includes(d)) && form.frequencyDays.length === WEEKEND.length
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-700 text-soft hover:bg-surface-600'
                        }`}>
                    🎉 Finde
                </button>
            </div>

            {form.frequencyType === 'SPECIFIC_DAYS' && (
                <div className="mt-2">
                    <label className="block text-sm text-soft mb-2">Días</label>
                    <div className="flex gap-2">
                        {DOW.map(d => (
                            <button key={d} type="button"
                                onClick={() => setForm(f => ({
                                    ...f,
                                    frequencyDays: f.frequencyDays.includes(d)
                                        ? f.frequencyDays.filter(x => x !== d)
                                        : [...f.frequencyDays, d]
                                }))}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.frequencyDays.includes(d) ? 'bg-primary-500 text-white' : 'bg-surface-700 text-soft'
                                    }`}>
                                {dowLabels[d]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="modal-overlay animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel animate-slide-up relative">
                {/* Mode tabs */}
                <div className="flex gap-2 mb-5">
                    <button onClick={() => { setMode('template'); setSelectedTemplate(null); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'template' ? 'bg-primary-500 text-white' : 'bg-surface-700 text-soft'}`}>
                        {t('habits.addFromTemplate')}
                    </button>
                    <button onClick={() => { setMode('custom'); setSelectedTemplate(null); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'custom' ? 'bg-primary-500 text-white' : 'bg-surface-700 text-soft'}`}>
                        {t('habits.addHabit')}
                    </button>
                </div>

                {mode === 'template' ? (
                    selectedTemplate ? (
                        /* ── Template frequency config step ── */
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/50">
                                <span className="text-2xl">{selectedTemplate.icon}</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">{selectedTemplate.name}</p>
                                    <p className="text-[11px] text-muted">{selectedTemplate.description}</p>
                                </div>
                            </div>

                            <FrequencyPicker />

                            <div className="flex gap-2">
                                <button type="button" onClick={() => setSelectedTemplate(null)}
                                    className="btn-ghost flex-1">
                                    ← Volver
                                </button>
                                <button type="button" onClick={handleConfirmTemplate}
                                    className="btn-primary flex-1" disabled={loading}>
                                    {loading ? t('common.loading') : t('common.save')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── Template list ── */
                        <div>
                            {/* Category filter chips */}
                            <div className="flex gap-2 flex-wrap mb-4">
                                <button
                                    onClick={() => setSelectedCat(null)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${!selectedCat ? 'bg-primary-500 border-primary-500 text-white' : 'border-surface-600 text-muted hover:border-white/30'}`}
                                >
                                    Todos
                                </button>
                                {CATEGORIES.filter(c => templates.some(t => t.category === c.value)).map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCat(selectedCat === cat.value ? null : cat.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border flex items-center gap-1 ${selectedCat === cat.value ? 'bg-primary-500 border-primary-500 text-white' : 'border-surface-600 text-muted hover:border-white/30'}`}
                                    >
                                        <span>{cat.emoji}</span> {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Templates grouped or filtered */}
                            {selectedCat ? (
                                <div className="space-y-2">
                                    {filteredTemplates.map(tpl => (
                                        <TemplateButton key={tpl.id} tpl={tpl} loading={loading} onClick={handleSelectTemplate} t={t} />
                                    ))}
                                </div>
                            ) : (
                                templateGroups.map(({ meta, templates: group }) => (
                                    <div key={meta.value} className="mb-4">
                                        <div className="flex items-center gap-1.5 mb-2 px-1">
                                            <span>{meta.emoji}</span>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {group.map(tpl => (
                                                <TemplateButton key={tpl.id} tpl={tpl} loading={loading} onClick={handleSelectTemplate} t={t} />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )
                ) : (
                    <form onSubmit={handleCustom} className="space-y-4">
                        <div>
                            <label className="block text-sm text-soft mb-1.5">Nombre *</label>
                            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Leer 30 min" />
                        </div>

                        {/* Category picker */}
                        <div>
                            <label className="block text-sm text-soft mb-2">Categoría</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, category: f.category === cat.value ? '' : cat.value }))}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all border-2 text-left ${form.category === cat.value
                                            ? 'bg-primary-500/10 border-primary-500 text-white'
                                            : 'bg-surface-700/40 border-transparent text-muted hover:bg-surface-700'}`}
                                    >
                                        <span className="text-base">{cat.emoji}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-soft mb-1.5">Tipo</label>
                            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="CHECK">{t('habits.type.CHECK')}</option>
                                <option value="COUNTER">{t('habits.type.COUNTER')}</option>
                            </select>
                        </div>

                        <FrequencyPicker />

                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                            {loading ? t('common.loading') : t('common.save')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

function TemplateButton({ tpl, loading, onClick, t }: {
    tpl: HabitTemplate;
    loading: boolean;
    onClick: (tpl: HabitTemplate) => void;
    t: (key: string) => string;
}) {
    return (
        <button key={tpl.id} disabled={loading} onClick={() => onClick(tpl)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-700 hover:bg-surface-600 active:scale-[0.98] transition-all text-left">
            <span className="text-2xl">{tpl.icon}</span>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{tpl.name}</p>
                <p className="text-[11px] text-muted">{tpl.description} · {t(`habits.frequency.${tpl.defaultFrequency}`)}</p>
            </div>
            <ChevronRight size={16} className="text-white/30" />
        </button>
    );
}

// ─── HabitsPage ───────────────────────────────────────────────────────────────

export default function HabitsPage() {
    const { t } = useTranslation();
    const { habits, setHabits, templates, setTemplates, updateHabit, removeHabit, setLoading } = useHabitStore();
    const [showCreate, setShowCreate] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([habitApi.getAll(), habitApi.getTemplates()]).then(([h, tpl]) => {
            setHabits(h.data);
            setTemplates(tpl.data);
        }).finally(() => setLoading(false));
    }, []);

    const handleLog = async (id: string) => {
        await habitApi.log(id, { value: 1 });
        // Refetch to get updated streak values from backend
        const { data } = await habitApi.getAll();
        setHabits(data);
    };

    const handlePause = async (id: string) => {
        const { data } = await habitApi.togglePause(id);
        updateHabit({ id, isPaused: data.isPaused });
    };

    const handleDelete = (id: string) => {
        setHabitToDelete(id);
    };

    const confirmDelete = async () => {
        if (!habitToDelete) return;
        setIsDeleting(true);
        try {
            await habitApi.delete(habitToDelete);
            removeHabit(habitToDelete);
        } finally {
            setIsDeleting(false);
            setHabitToDelete(null);
        }
    };

    return (
        <div className="page-content animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="section-title text-xl">{t('habits.title')}</h1>
                <button onClick={() => setShowCreate(true)} className="btn-primary py-2 px-3 flex items-center gap-1.5 text-sm">
                    <Plus size={16} /> {t('habits.addHabit')}
                </button>
            </div>

            {habits.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-4xl mb-3">🌱</p>
                    <p className="text-soft">Aún no tenés hábitos configurados.</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">Empezar ahora</button>
                </div>
            ) : (
                <GroupedHabitList
                    habits={habits}
                    onLog={handleLog}
                    onPause={handlePause}
                    onDelete={handleDelete}
                />
            )}

            {showCreate && (
                <CreateHabitModal
                    templates={templates}
                    onClose={() => setShowCreate(false)}
                    onCreate={(h) => { setHabits([...habits, h]); setShowCreate(false); }}
                />
            )}

            <ConfirmModal
                isOpen={habitToDelete !== null}
                title="Eliminar hábito"
                message={<>¿Estás seguro de que querés eliminar el hábito <strong className="text-white/80">{habits.find(h => h.id === habitToDelete)?.name}</strong>? Se perderá todo el progreso.</>}
                onConfirm={confirmDelete}
                onCancel={() => setHabitToDelete(null)}
                saving={isDeleting}
            />
        </div>
    );
}
