import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reflectionApi, Reflection } from '@/api/reflections';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { Book, Calendar, Quote, X } from 'lucide-react';

/** Helper to parse ISO date string as literal local date (no TZ shift) */
function parseDateLiteral(dateStr: string) {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
}

function ReflectionHistoryCard({ reflection, onClick }: { reflection: Reflection, onClick: () => void }) {
    const date = parseDateLiteral(reflection.date);
    const formattedDate = date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const summary = reflection.content.length > 120
        ? reflection.content.substring(0, 120) + '...'
        : reflection.content;

    return (
        <div
            onClick={onClick}
            className="card mb-4 border-surface-700/50 bg-surface-800/30 hover:bg-surface-800/50 transition-all active:scale-[0.99] cursor-pointer animate-slide-up group"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary-400" />
                    <span className="text-[11px] font-bold text-soft uppercase tracking-wider">{formattedDate}</span>
                </div>
                {reflection.mood && (
                    <span className="text-xl bg-surface-700/50 w-8 h-8 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                        {reflection.mood}
                    </span>
                )}
            </div>
            <div className="relative">
                <Quote size={16} className="absolute -top-1 -left-1 text-primary-500/20" />
                <p className="text-sm text-white/90 leading-relaxed pl-4 border-l-2 border-primary-500/10">
                    {summary}
                </p>
                {reflection.content.length > 120 && (
                    <span className="text-[10px] text-primary-400 font-bold mt-2 block ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        VER NOTA COMPLETA
                    </span>
                )}
            </div>
        </div>
    );
}

export default function DiaryPage() {
    const { t } = useTranslation();
    const [history, setHistory] = useState<Reflection[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<Reflection | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const { data } = await reflectionApi.getAll();
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="page-content animate-fade-in pb-20">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary-500/10 rounded-2xl text-primary-400">
                    <Book size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white italic tracking-tight">{t('diary.title')}</h1>
                    <p className="text-xs text-soft">{t('diary.subtitle')}</p>
                </div>
            </div>

            {/* Editor for today */}
            <section className="mb-10">
                <DailyReflectionCard onSave={fetchHistory} />
            </section>

            {/* History */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        {t('diary.history')}
                    </h2>
                    <span className="text-[10px] bg-surface-700 text-soft py-0.5 px-2 rounded-full">
                        {history.length} {t('diary.entries')}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">{t('diary.loading')}</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 bg-surface-800/10 rounded-3xl border-2 border-dashed border-surface-700/50">
                        <p className="text-4xl mb-4 opacity-30">✍️</p>
                        <p className="text-soft text-sm">{t('diary.empty')}</p>
                        <p className="text-xs text-muted mt-1 px-10">
                            {t('diary.emptySub')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <ReflectionHistoryCard
                                key={item.id}
                                reflection={item}
                                onClick={() => setSelectedEntry(item)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Entry Detail Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedEntry(null)}
                    />
                    <div className="relative w-full max-w-lg bg-surface-800 rounded-3xl overflow-hidden shadow-2xl border border-surface-700 animate-slide-up max-h-[85vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-surface-700/50 flex items-center justify-between bg-surface-800/50 sticky top-0 z-10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/10 rounded-xl text-primary-400">
                                    <Calendar size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-1">Entrada del día</p>
                                    <p className="text-sm font-bold text-white leading-none">
                                        {parseDateLiteral(selectedEntry.date).toLocaleDateString('es-AR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="p-2 hover:bg-surface-700/50 rounded-full text-soft transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {selectedEntry.mood && (
                                <div className="flex justify-center mb-8">
                                    <div className="w-20 h-20 bg-surface-700/30 flex items-center justify-center rounded-3xl text-5xl shadow-inner border border-surface-600/20">
                                        {selectedEntry.mood}
                                    </div>
                                </div>
                            )}
                            <div className="relative">
                                <Quote size={24} className="absolute -top-3 -left-3 text-primary-500/10" />
                                <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedEntry.content}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-surface-900/50 flex justify-center border-t border-surface-700/30">
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="btn-ghost text-xs font-bold py-2 px-8 rounded-full"
                            >
                                CERRAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
