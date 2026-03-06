import { useState, useEffect } from 'react';
import { smokeApi, DashboardData } from '@/api/smoke';
import { Flame, DollarSign, Wind, AlertCircle, MoreHorizontal, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function StatCard({ icon: Icon, label, value, color, delay }: { icon: any, label: string, value: string | number, color: string, delay: string }) {
    return (
        <div className={`card bg-surface-800/40 border-surface-700/50 p-4 animate-slide-up ${delay}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
            </div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-white tabular-nums">{value}</p>
        </div>
    );
}

export default function SmokePage() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const fetchData = async () => {
        try {
            const res = await smokeApi.getDashboard();
            if (!res.data) {
                navigate('/smoke/onboarding');
                return;
            }
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm('¿Estás seguro de que querés eliminar tus datos de fumador? Se borrará todo tu progreso y configuración.')) return;
        try {
            await smokeApi.deleteProfile();
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-muted animate-pulse-soft">
            <Flame size={48} className="mb-4 text-primary-500/20" />
            <p className="text-sm font-medium">Cargando tu progreso...</p>
        </div>
    );

    if (!data) return null;

    const { stats, profile } = data;

    return (
        <div className="page-content animate-fade-in pb-24">
            {/* Header / Motivation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white italic tracking-tight uppercase">Libre de Humo</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <User size={10} className="text-primary-400" />
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Lo hacés por: <span className="text-primary-400">{profile.mainMotivation}</span></p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/smoke/onboarding')}
                        className="p-2.5 bg-surface-800 rounded-xl text-muted hover:text-white transition-colors"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Main Streak Counter */}
            <div className="card mb-6 bg-gradient-to-br from-primary-600/30 via-surface-800 to-surface-800 border-primary-500/20 relative overflow-hidden">
                <div className="relative z-10 p-2">
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">RACHA SIN FUMAR</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                            {stats.smokeFreeDays}
                        </h2>
                        <span className="text-xl font-bold text-soft italic uppercase">Días</span>
                    </div>
                    <p className="text-xs text-soft mt-2 flex items-center gap-1.5 font-medium">
                        Desde el {format(new Date(profile.startDate), "d 'de' MMMM", { locale: es })}
                    </p>
                </div>
                {/* Background decoration */}
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-primary-600/10 rounded-full blur-[60px]" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard
                    icon={Flame}
                    label="Evitados"
                    value={stats.avoidedTotal}
                    color="text-primary-400 bg-primary-400/10"
                    delay="delay-[100ms]"
                />
                <StatCard
                    icon={DollarSign}
                    label="Dinero Ahorrado"
                    value={`$${stats.moneySaved.toLocaleString()}`}
                    color="text-accent-green bg-accent-green/10"
                    delay="delay-[200ms]"
                />
            </div>

            {/* Fumé un cigarrillo - Main Action */}
            <div className="mb-8">
                <button
                    onClick={() => {
                        setQuantity(1);
                        setSelectedTrigger(null);
                        setShowLogModal(true);
                    }}
                    className="w-full py-4 bg-surface-700 hover:bg-surface-600 rounded-3xl text-sm font-black text-white flex items-center justify-center gap-3 border-2 border-accent-red/20 transition-all active:scale-95 shadow-xl shadow-black/20 group"
                >
                    <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center text-accent-red group-hover:scale-110 transition-transform">
                        <AlertCircle size={22} strokeWidth={2.5} />
                    </div>
                    <span className="uppercase tracking-[0.1em]">Fumé un cigarrillo</span>
                </button>
            </div>

            {/* Daily Consumption Progress */}
            <div className="card mb-8 border-surface-700/50 bg-surface-800/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Consumo Hoy</h3>
                    <div className="badge bg-surface-700 font-black text-[10px] text-soft">
                        LÍMITE: {profile.strategy === 'COLD_TURKEY' ? '0' : profile.currentDailyLimit}
                    </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 h-3 bg-surface-700/50 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-700 ${stats.smokedToday > (profile.strategy === 'COLD_TURKEY' ? 0 : (profile.currentDailyLimit || 0)) ? 'bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]'}`}
                            style={{ width: `${Math.min(100, (stats.smokedToday / (profile.strategy === 'COLD_TURKEY' ? 1 : Math.max(1, (profile.currentDailyLimit || 1)))) * 100)}%` }}
                        />
                    </div>
                    <span className="text-xl font-black text-white italic">{stats.smokedToday}</span>
                </div>
                <p className="text-[10px] text-soft leading-tight">
                    {stats.smokedToday === 0
                        ? "¡Hoy venís perfecto! Ningún cigarrillo hasta ahora."
                        : stats.smokedToday > (profile.strategy === 'COLD_TURKEY' ? 0 : (profile.currentDailyLimit || 0))
                            ? "Te pasaste del límite diario. Calma, mañana lo intentamos de nuevo."
                            : "Estás dentro de tu plan diario de reducción."}
                </p>
            </div>

            {/* Panic Section */}
            <div className="card bg-accent-amber/5 border-accent-amber/10 mb-8 overflow-hidden relative group">
                <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 bg-accent-amber/20 rounded-2xl flex items-center justify-center text-accent-amber animate-pulse">
                        <Wind size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white leading-tight">¿Ganas de fumar?</h3>
                        <p className="text-xs text-soft">Toda ansiedad pasa en 3 minutos.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/smoke/panic')}
                    className="w-full py-4 bg-accent-amber text-black font-black text-sm rounded-2xl transition-all active:scale-95 shadow-lg shadow-accent-amber/20 relative z-10"
                >
                    TENGO GANAS DE FUMAR
                </button>
                <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform">
                    <Wind size={100} className="text-accent-amber" />
                </div>
            </div>

            {/* Danger Zone / Delete Profile */}
            <div className="mt-12 pt-8 border-t border-surface-700/30">
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4 text-center">Configuración</p>
                <button
                    onClick={handleDeleteProfile}
                    className="w-full py-4 bg-accent-red/5 hover:bg-accent-red/10 border border-accent-red/20 rounded-2xl text-accent-red text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                    ELIMINAR DATOS DE FUMADOR
                </button>
                <p className="text-[9px] text-muted/50 text-center mt-3 leading-relaxed">
                    Esta acción borrará permanentemente todo tu progreso, recompensas y configuración de la sección "Libre de Humo".
                </p>
            </div>

            {/* MODAL PARA REGISTRO DE DESLIZ */}
            {showLogModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in shadow-2xl">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowLogModal(false)} />
                    <div className="relative w-full max-w-[320px] bg-surface-800 rounded-3xl overflow-hidden border border-surface-700 animate-slide-up p-6">
                        <div className="w-16 h-16 bg-accent-red/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                            🚬
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Registrar desliz</h3>
                        <p className="text-xs text-soft text-center mb-6">Un tropiezo no es fracaso. Anotarlo nos ayuda a ver patrones.</p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-bold text-muted uppercase mb-2 ml-1">Cigarrillos</label>
                                <div className="flex items-center justify-between bg-surface-700/50 rounded-2xl p-2 px-4 shadow-inner">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-2xl font-bold p-2">-</button>
                                    <span className="text-2xl font-black text-white">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="text-2xl font-bold p-2">+</button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {['Estrés', 'Aburrimiento', 'Café', 'Alcohol', 'Después de comer'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTrigger(selectedTrigger === t ? null : t)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase border ${selectedTrigger === t
                                            ? 'bg-primary-500 border-primary-400 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                                            : 'bg-surface-700 border-white/5 text-white/60 hover:text-white hover:bg-surface-600'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => {
                                setShowLogModal(false);
                                setSelectedTrigger(null);
                                setQuantity(1);
                            }} className="btn-ghost py-3 font-bold text-xs uppercase tracking-widest bg-white/5">Cancelar</button>
                            <button
                                onClick={async () => {
                                    await smokeApi.logSmoke({
                                        quantity: quantity,
                                        trigger: selectedTrigger || undefined
                                    });
                                    setShowLogModal(false);
                                    setSelectedTrigger(null);
                                    setQuantity(1);
                                    fetchData();
                                }}
                                className="btn-primary py-3 font-bold text-xs uppercase tracking-widest bg-accent-red border-none shadow-lg shadow-accent-red/20"
                            >
                                Registrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
