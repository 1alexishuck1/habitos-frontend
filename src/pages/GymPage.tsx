import { useState, useEffect, useCallback } from 'react';
import { Dumbbell, Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Weight } from 'lucide-react';
import { gymApi, todayKey, loadDoneSet, saveDoneSet, type DayOfWeek, type WorkoutDay, type WorkoutExercise, type ExerciseInput } from '@/api/gym';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
    { key: 'MON', label: 'Lunes', short: 'Lun' },
    { key: 'TUE', label: 'Martes', short: 'Mar' },
    { key: 'WED', label: 'Miércoles', short: 'Mié' },
    { key: 'THU', label: 'Jueves', short: 'Jue' },
    { key: 'FRI', label: 'Viernes', short: 'Vie' },
    { key: 'SAT', label: 'Sábado', short: 'Sáb' },
    { key: 'SUN', label: 'Domingo', short: 'Dom' },
];

// Map JS getDay() (0=Sun, 1=Mon...) to our enum


// ─── Exercise form (inline) ───────────────────────────────────────────────────

interface ExerciseFormData {
    name: string;
    sets: string;
    reps: string;
    weight: string;
    notes: string;
}

const EMPTY_FORM: ExerciseFormData = { name: '', sets: '3', reps: '10', weight: '', notes: '' };

function formToInput(f: ExerciseFormData): ExerciseInput {
    return {
        name: f.name.trim(),
        sets: Math.max(1, parseInt(f.sets) || 3),
        reps: f.reps.trim() || '10',
        weight: f.weight !== '' ? parseFloat(f.weight) : null,
        notes: f.notes.trim(),
    };
}

function ExerciseForm({
    initial = EMPTY_FORM,
    onSave,
    onCancel,
    saving,
}: {
    initial?: ExerciseFormData;
    onSave: (data: ExerciseFormData) => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const [form, setForm] = useState(initial);
    const set = (k: keyof ExerciseFormData, v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="bg-surface-700/40 rounded-2xl p-4 border border-surface-600/30 mt-2">
            {/* Name */}
            <input
                className="w-full bg-surface-800/60 text-white text-sm rounded-xl px-3 py-2.5
                           border border-surface-600/30 focus:border-primary-500/60 outline-none
                           placeholder:text-white/30 mb-3"
                placeholder="Nombre del ejercicio (ej: Press banca)"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoFocus
            />

            {/* Sets / Reps / Weight */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Series</label>
                    <input
                        type="number"
                        min={1}
                        max={99}
                        className="w-full bg-surface-800/60 text-white text-sm rounded-xl px-3 py-2
                                   border border-surface-600/30 focus:border-primary-500/60 outline-none text-center"
                        value={form.sets}
                        onChange={e => set('sets', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Repeticiones</label>
                    <input
                        className="w-full bg-surface-800/60 text-white text-sm rounded-xl px-3 py-2
                                   border border-surface-600/30 focus:border-primary-500/60 outline-none text-center"
                        placeholder="10"
                        value={form.reps}
                        onChange={e => set('reps', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Peso (kg)</label>
                    <input
                        type="number"
                        min={0}
                        step={0.5}
                        className="w-full bg-surface-800/60 text-white text-sm rounded-xl px-3 py-2
                                   border border-surface-600/30 focus:border-primary-500/60 outline-none text-center"
                        placeholder="—"
                        value={form.weight}
                        onChange={e => set('weight', e.target.value)}
                    />
                </div>
            </div>

            {/* Notes */}
            <input
                className="w-full bg-surface-800/60 text-white/70 text-xs rounded-xl px-3 py-2
                           border border-surface-600/20 focus:border-surface-500/40 outline-none
                           placeholder:text-white/25 mb-4"
                placeholder="Notas opcionales..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
            />

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onSave(form)}
                    disabled={saving || !form.name.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                               bg-primary-500 text-white text-sm font-semibold
                               hover:bg-primary-400 disabled:opacity-40 transition-all"
                >
                    <Check size={14} />
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl bg-surface-700/60 text-white/50
                               hover:text-white hover:bg-surface-700 text-sm transition-all"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({
    ex,
    isDone,
    isNext,
    isToday,
    onToggleDone,
    onEdit,
    onDelete,
}: {
    ex: WorkoutExercise;
    isDone: boolean;
    isNext: boolean;
    isToday: boolean;
    onToggleDone: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className={`flex items-center gap-3 py-3 border-b border-surface-700/30 last:border-0 group
                        transition-all duration-300 rounded-xl px-2 -mx-2
                        ${isNext ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : ''}
                        ${isDone ? 'opacity-50' : ''}`}>

            {/* Done toggle OR static icon */}
            {isToday ? (
                <button
                    onClick={onToggleDone}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                                border-2 transition-all duration-200 active:scale-90
                                ${isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isNext
                                ? 'border-emerald-400/60 text-emerald-400/60 hover:border-emerald-400 hover:bg-emerald-500/10'
                                : 'border-surface-600/40 text-white/20 hover:border-primary-400/40 hover:text-primary-400/40'
                        }`}
                >
                    <Check size={13} strokeWidth={3} />
                </button>
            ) : (
                <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={14} className="text-primary-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold leading-none mb-1 transition-all
                                  ${isDone ? 'line-through text-white/30' : 'text-white'}`}>
                        {ex.name}
                    </p>
                    {isNext && !isDone && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10
                                         px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Siguiente
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isDone ? 'text-white/20' : 'text-primary-400'}`}>
                        {ex.sets} × {ex.reps}
                    </span>
                    {ex.weight != null && (
                        <span className="text-xs text-white/40 flex items-center gap-0.5">
                            <Weight size={9} /> {ex.weight} kg
                        </span>
                    )}
                    {ex.notes && (
                        <span className="text-xs text-white/30 truncate">{ex.notes}</span>
                    )}
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               text-white/40 hover:text-white hover:bg-surface-700 transition-all"
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={onDelete}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               text-white/40 hover:text-accent-red hover:bg-accent-red/10 transition-all"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// ─── Day card ─────────────────────────────────────────────────────────────────

function DayCard({
    dayKey,
    dayLabel,
    dayData,
    isToday,
    onRefresh,
}: {
    dayKey: DayOfWeek;
    dayLabel: string;
    dayData: WorkoutDay | null;
    isToday: boolean;
    onRefresh: () => void;
}) {
    const [open, setOpen] = useState(isToday); // auto-expand today
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [dayName, setDayName] = useState(dayData?.name || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [doneIds, setDoneIds] = useState<Set<string>>(() => loadDoneSet(dayKey));

    // Sync name when data arrives
    useEffect(() => { setDayName(dayData?.name || ''); }, [dayData?.name]);

    const exercises = dayData?.exercises ?? [];
    const hasExercises = exercises.length > 0;

    // Workout tracking helpers
    function toggleDone(id: string) {
        setDoneIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            saveDoneSet(dayKey, next);
            return next;
        });
    }

    const firstPendingId = exercises.find(e => !doneIds.has(e.id))?.id ?? null;
    const allDone = hasExercises && exercises.every(e => doneIds.has(e.id));

    async function handleSaveExercise(form: ExerciseFormData) {
        setSaving(true);
        try {
            await gymApi.addExercise(dayKey, formToInput(form));
            setShowAddForm(false);
            onRefresh();
        } finally { setSaving(false); }
    }

    async function handleUpdateExercise(id: string, form: ExerciseFormData) {
        setSaving(true);
        try {
            await gymApi.updateExercise(id, formToInput(form));
            setEditingId(null);
            onRefresh();
        } finally { setSaving(false); }
    }

    async function handleDeleteExercise(id: string) {
        setDeleting(id);
        try {
            await gymApi.deleteExercise(id);
            onRefresh();
        } finally { setDeleting(null); }
    }

    async function handleSaveDayName() {
        try {
            await gymApi.upsertDay(dayKey, dayName);
            setEditingName(false);
            onRefresh();
        } catch { /* ignore */ }
    }

    async function handleDeleteAll() {
        setSaving(true);
        try {
            await gymApi.deleteDay(dayKey);
            setShowClearConfirm(false);
            onRefresh();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={`card mb-3 cursor-pointer transition-all duration-200
                        ${open ? 'ring-1 ring-primary-500/20' : ''}
                        ${isToday && hasExercises ? 'ring-1 ring-primary-400/30' : ''}`}>
            {/* Header */}
            <div className="flex items-center gap-3" onClick={() => setOpen(o => !o)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                 ${allDone ? 'bg-emerald-500/20' : hasExercises ? 'bg-primary-500/15' : 'bg-surface-700/50'}`}>
                    <Dumbbell size={17} className={allDone ? 'text-emerald-400' : hasExercises ? 'text-primary-400' : 'text-white/25'} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{dayLabel}</p>
                        {isToday && (
                            <span className="text-[9px] font-bold text-primary-400 bg-primary-500/15
                                             px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                Hoy
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-white/40 truncate">
                        {allDone
                            ? '✅ Rutina completada'
                            : dayData?.name
                                ? dayData.name
                                : hasExercises
                                    ? `${exercises.length} ejercicio${exercises.length !== 1 ? 's' : ''}`
                                    : 'Sin rutina'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isToday && hasExercises && !allDone && (
                        <span className="text-xs bg-primary-500/15 text-primary-400 px-2 py-0.5 rounded-full font-medium">
                            {exercises.length - doneIds.size}/{exercises.length}
                        </span>
                    )}
                    {!isToday && hasExercises && (
                        <span className="text-xs bg-primary-500/15 text-primary-400 px-2 py-0.5 rounded-full font-medium">
                            {exercises.length}
                        </span>
                    )}
                    {open ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                </div>
            </div>

            {/* Expanded content */}
            {open && (
                <div className="mt-4 border-t border-surface-700/30 pt-4">

                    {/* Optional day name label */}
                    <div className="mb-4">
                        {editingName ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    className="flex-1 bg-surface-800/60 text-white text-sm rounded-xl px-3 py-2
                                               border border-surface-600/30 focus:border-primary-500/60 outline-none"
                                    placeholder="Ej: Pecho y Tríceps"
                                    value={dayName}
                                    onChange={e => setDayName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveDayName(); if (e.key === 'Escape') setEditingName(false); }}
                                />
                                <button onClick={handleSaveDayName} className="px-3 py-2 rounded-xl bg-primary-500 text-white text-xs">✓</button>
                                <button onClick={() => setEditingName(false)} className="px-3 py-2 rounded-xl bg-surface-700 text-white/50 text-xs">✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditingName(true)}
                                className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1.5 transition-colors"
                            >
                                <Pencil size={10} />
                                {dayData?.name ? `"${dayData.name}"` : 'Agregar nombre al día (ej: Pecho y Tríceps)'}
                            </button>
                        )}
                    </div>

                    {/* Exercise list */}
                    {exercises.length === 0 && !showAddForm && (
                        <p className="text-xs text-white/25 text-center py-4">
                            No hay ejercicios. Agregá uno con el botón de abajo.
                        </p>
                    )}

                    {exercises.map(ex => (
                        deleting === ex.id ? (
                            <div key={ex.id} className="py-3 text-xs text-white/30 text-center">Eliminando...</div>
                        ) : editingId === ex.id ? (
                            <ExerciseForm
                                key={ex.id}
                                initial={{ name: ex.name, sets: String(ex.sets), reps: ex.reps, weight: ex.weight != null ? String(ex.weight) : '', notes: ex.notes || '' }}
                                onSave={form => handleUpdateExercise(ex.id, form)}
                                onCancel={() => setEditingId(null)}
                                saving={saving}
                            />
                        ) : (
                            <ExerciseRow
                                key={ex.id}
                                ex={ex}
                                isDone={doneIds.has(ex.id)}
                                isNext={isToday && !allDone && ex.id === firstPendingId}
                                isToday={isToday}
                                onToggleDone={() => toggleDone(ex.id)}
                                onEdit={() => setEditingId(ex.id)}
                                onDelete={() => handleDeleteExercise(ex.id)}
                            />
                        )
                    ))}

                    {/* Add form */}
                    {showAddForm && (
                        <ExerciseForm
                            onSave={handleSaveExercise}
                            onCancel={() => setShowAddForm(false)}
                            saving={saving}
                        />
                    )}

                    {/* Actions */}
                    {!showAddForm && !editingId && (
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                           border border-dashed border-primary-500/25 text-primary-400/70
                                           hover:border-primary-500/50 hover:text-primary-400 hover:bg-primary-500/5
                                           text-sm font-medium transition-all"
                            >
                                <Plus size={15} />
                                Agregar ejercicio
                            </button>
                            {exercises.length > 0 && (
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    disabled={saving}
                                    title="Vaciar rutina"
                                    className="px-4 flex items-center justify-center py-2.5 rounded-xl
                                               border border-dashed border-accent-red/20 text-accent-red/50
                                               hover:border-accent-red/40 hover:text-accent-red hover:bg-accent-red/5
                                               transition-all disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Clear Confirm Modal */}
                    {showClearConfirm && (
                        <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
                            onClick={() => !saving && setShowClearConfirm(false)}>
                            <div className="bg-surface-800 rounded-3xl w-full max-w-sm border border-surface-700 shadow-2xl p-6 relative animate-scale-in"
                                onClick={e => e.stopPropagation()}>
                                <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mb-4">
                                    <Trash2 size={24} className="text-accent-red" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Vaciar rutina</h3>
                                <p className="text-sm text-white/50 mb-6 leading-relaxed">
                                    ¿Estás seguro de que querés vaciar la rutina del <strong className="text-white/80">{dayLabel}</strong>? Esto borrará definitivamente todos los ejercicios.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowClearConfirm(false)}
                                        disabled={saving}
                                        className="flex-1 py-3 as-btn rounded-xl bg-surface-700 text-white text-sm font-semibold hover:bg-surface-600 transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteAll}
                                        disabled={saving}
                                        className="flex-1 py-3 as-btn rounded-xl bg-accent-red text-white text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Borrando...' : 'Vaciar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GymPage() {
    const [daysMap, setDaysMap] = useState<Record<string, WorkoutDay>>({});
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const days = await gymApi.listDays();
            const map: Record<string, WorkoutDay> = {};
            days.forEach(d => { map[d.dayOfWeek] = d; });
            setDaysMap(map);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="page-content animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/15 flex items-center justify-center">
                    <Dumbbell size={20} className="text-primary-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Gimnasio</h1>
                    <p className="text-xs text-white/40">Tu rutina semanal</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-white/30 text-sm">
                    Cargando...
                </div>
            ) : (
                <div>
                    {DAYS.map(({ key, label }) => (
                        <DayCard
                            key={key}
                            dayKey={key}
                            dayLabel={label}
                            dayData={daysMap[key] ?? null}
                            isToday={key === todayKey()}
                            onRefresh={load}
                        />
                    ))}
                </div>
            )}

            <p className="text-center text-xs text-white/20 mt-8">
                Tocá un día para expandir y agregar ejercicios
            </p>
        </div>
    );
}
