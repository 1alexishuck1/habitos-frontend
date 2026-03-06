import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { smokeApi } from '@/api/smoke';
import { ChevronRight, ChevronLeft, Heart, DollarSign, Activity, Users, Flame, Info } from 'lucide-react';

const MOTIVATIONS = [
    { id: 'salud', label: 'Salud y Bienestar', icon: Heart, color: 'text-accent-red bg-accent-red/10' },
    { id: 'dinero', label: 'Ahorrar Dinero', icon: DollarSign, color: 'text-accent-green bg-accent-green/10' },
    { id: 'rendimiento', label: 'Rendimiento Físico', icon: Activity, color: 'text-primary-400 bg-primary-400/10' },
    { id: 'familia', label: 'Pedido de mi Familia', icon: Users, color: 'text-accent-amber bg-accent-amber/10' },
    { id: 'otro', label: 'Motivación Personal', icon: Flame, color: 'text-white bg-white/10' },
];

export default function SmokeOnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        cigarettesPerDay: 20,
        yearsSmoking: 5,
        pricePerPack: 1500,
        cigPerPack: 20,
        strategy: 'COLD_TURKEY' as 'COLD_TURKEY' | 'GRADUAL',
        mainMotivation: '',
    });

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else handleSubmit();
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!form.mainMotivation) return;
        setLoading(true);
        try {
            await smokeApi.createProfile(form);
            navigate('/smoke');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const yearlyCost = Math.round((form.cigarettesPerDay / form.cigPerPack) * form.pricePerPack * 365);
    const yearlyCigs = form.cigarettesPerDay * 365;

    return (
        <div className="page-content min-h-[90vh] flex flex-col items-center justify-center py-10 animate-fade-in">
            <div className="w-full max-w-md">
                {/* Progress bar */}
                <div className="flex gap-2 mb-10">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step > i ? 'bg-primary-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-surface-700'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-slide-up">
                        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                            🚬
                        </div>
                        <h1 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Hablemos de tu hábito</h1>
                        <p className="text-muted text-center mb-10 text-sm">Necesitamos estos datos para calcular el impacto en tu vida y tus ahorros.</p>

                        <div className="space-y-6">
                            <div className="bg-surface-800/50 p-6 rounded-3xl border border-surface-700">
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Cigarrillos por día</label>
                                <div className="flex items-center justify-between gap-4">
                                    <button onClick={() => setForm(f => ({ ...f, cigarettesPerDay: Math.max(1, f.cigarettesPerDay - 1) }))} className="w-12 h-12 bg-surface-700 rounded-full flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">-</button>
                                    <span className="text-4xl font-black text-white tracking-tighter">{form.cigarettesPerDay}</span>
                                    <button onClick={() => setForm(f => ({ ...f, cigarettesPerDay: f.cigarettesPerDay + 1 }))} className="w-12 h-12 bg-surface-700 rounded-full flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">+</button>
                                </div>
                            </div>

                            <div className="bg-surface-800/50 p-6 rounded-3xl border border-surface-700">
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Años fumando</label>
                                <div className="flex items-center justify-between gap-4">
                                    <button onClick={() => setForm(f => ({ ...f, yearsSmoking: Math.max(0, f.yearsSmoking - 1) }))} className="w-12 h-12 bg-surface-700 rounded-full flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">-</button>
                                    <span className="text-4xl font-black text-white tracking-tighter">{form.yearsSmoking}</span>
                                    <button onClick={() => setForm(f => ({ ...f, yearsSmoking: f.yearsSmoking + 1 }))} className="w-12 h-12 bg-surface-700 rounded-full flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                            💰
                        </div>
                        <h1 className="text-2xl font-black text-white text-center mb-2">Costos y cantidades</h1>
                        <p className="text-muted text-center mb-10 text-sm">Esto nos ayudará a medir cuánto vas a ahorrar al dejar este hábito.</p>

                        <div className="space-y-6">
                            <div className="bg-surface-800/50 p-6 rounded-3xl border border-surface-700">
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Precio por Atado/Paquete</label>
                                <div className="flex items-center bg-surface-700/50 px-4 rounded-2xl mb-4">
                                    <span className="text-accent-green font-black mr-2">$</span>
                                    <input
                                        type="number"
                                        className="bg-transparent border-none outline-none py-4 w-full text-xl font-bold text-white"
                                        value={form.pricePerPack}
                                        onChange={(e) => setForm(f => ({ ...f, pricePerPack: Number(e.target.value) }))}
                                    />
                                </div>
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Cigarrillos por Atado</label>
                                <div className="flex gap-2">
                                    {[10, 11, 20, 21].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setForm(f => ({ ...f, cigPerPack: n }))}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.cigPerPack === n ? 'bg-accent-green text-black' : 'bg-surface-700 text-muted'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 rounded-3xl bg-accent-amber/10 border border-accent-amber/20 flex gap-4 items-center">
                                <div className="w-10 h-10 bg-accent-amber/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Info size={20} className="text-accent-amber" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/90">Estás gastando aprox. <strong className="text-accent-amber">${yearlyCost.toLocaleString()}</strong> al año en <strong className="text-accent-amber">{yearlyCigs.toLocaleString()}</strong> cigarrillos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                            🚀
                        </div>
                        <h1 className="text-2xl font-black text-white text-center mb-2">Elegí tu estrategia</h1>
                        <p className="text-muted text-center mb-8 text-sm">¿Cómo preferís hacerlo? Ambos caminos son válidos y requieren coraje.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setForm(f => ({ ...f, strategy: 'COLD_TURKEY' }))}
                                className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${form.strategy === 'COLD_TURKEY' ? 'bg-primary-500/10 border-primary-500 shadow-lg' : 'bg-surface-800/50 border-surface-700 opacity-60'}`}
                            >
                                <h3 className="text-lg font-bold text-white">De golpe (Quit Cold Turkey)</h3>
                                <p className="text-xs text-soft mt-1">Dejar de fumar por completo hoy mismo. Un desafío total enfocado en mantener los días a cero.</p>
                            </button>

                            <button
                                onClick={() => setForm(f => ({ ...f, strategy: 'GRADUAL' }))}
                                className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${form.strategy === 'GRADUAL' ? 'bg-primary-500/10 border-primary-500 shadow-lg' : 'bg-surface-800/50 border-surface-700 opacity-60'}`}
                            >
                                <h3 className="text-lg font-bold text-white">Reducción Gradual</h3>
                                <p className="text-xs text-soft mt-1">Bajar el consumo semana a semana hasta llegar a cero. Ideal si fumás mucho y querés un plan guiado.</p>
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-slide-up">
                        <div className="w-16 h-16 bg-accent-amber/10 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                            🔥
                        </div>
                        <h1 className="text-2xl font-black text-white text-center mb-2">Tu motor principal</h1>
                        <p className="text-muted text-center mb-8 text-sm">¿Cuál es el motivo que te va a mantener firme en los momentos difíciles?</p>

                        <div className="grid grid-cols-1 gap-3">
                            {MOTIVATIONS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setForm(f => ({ ...f, mainMotivation: m.label }))}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${form.mainMotivation === m.label ? 'border-primary-500 bg-primary-500/10 shadow-lg' : 'border-surface-700 bg-surface-800/50 opacity-70'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                                        <m.icon size={22} />
                                    </div>
                                    <span className="font-bold text-white">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer buttons */}
                <div className="mt-12 flex gap-4">
                    {step > 1 && (
                        <button
                            onClick={handlePrev}
                            className="bg-surface-700 hover:bg-surface-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={loading || (step === 4 && !form.mainMotivation)}
                        className="btn-primary flex-1 h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-50"
                    >
                        {loading ? 'GUARDANDO...' : step === totalSteps ? '¡EMPEZAR EL CAMBIO!' : 'SIGUIENTE'}
                        {!loading && step < totalSteps && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
