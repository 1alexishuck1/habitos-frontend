import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reflectionApi, Reflection } from '@/api/reflections';
import { Smile, Frown, Meh, Heart, Sun, Loader2 } from 'lucide-react';

const MOODS = [
    { icon: Sun, label: 'Enérgico', value: '☀️' },
    { icon: Smile, label: 'Feliz', value: '😊' },
    { icon: Meh, label: 'Normal', value: '😐' },
    { icon: Frown, label: 'Cansado', value: '😫' },
    { icon: Heart, label: 'Agradecido', value: '🙏' },
];

export function DailyReflectionCard({ onSave }: { onSave?: () => void }) {
    const { t } = useTranslation();
    const [reflection, setReflection] = useState<Reflection | null>(null);
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        reflectionApi.getToday().then(res => {
            if (res.data) {
                setReflection(res.data);
                setContent(res.data.content || '');
                setSelectedMood(res.data.mood || undefined);
            }
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!content || !content.trim()) return;
        setSaving(true);
        try {
            const { data } = await reflectionApi.upsert({ content, mood: selectedMood });
            setReflection(data);
            if (onSave) onSave();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="card mb-6 border-primary-500/20 bg-surface-800/50 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                    ✨
                </div>
                <h2 className="text-lg font-bold text-white">{t('diary.cardTitle')}</h2>
            </div>

            <p className="text-sm text-soft mb-4 italic">{t('diary.cardSubtitle')}</p>

            <div className="flex gap-2 mb-5">
                {MOODS.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => setSelectedMood(m.value)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1 min-w-0 border-2 ${selectedMood === m.value
                                ? 'bg-primary-500/10 border-primary-500 text-primary-400 scale-105'
                                : 'bg-surface-700/30 border-transparent text-muted hover:bg-surface-700/50'
                            }`}
                    >
                        <m.icon size={18} />
                        <span className="text-[9px] font-medium truncate w-full text-center">{m.label}</span>
                    </button>
                ))}
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('diary.placeholder')}
                style={{ fontSize: '16px' }}
                className="w-full bg-surface-900/50 border border-surface-700 rounded-xl p-3 text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all mb-3 resize-none min-h-[90px]"
            />

            <button
                onClick={handleSave}
                disabled={saving || !content?.trim()}
                className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {reflection ? t('diary.update') : t('diary.save')}
            </button>
        </div>
    );
}
