import { useNavigate } from 'react-router-dom';
import {
    Flame, Zap, Trophy, Users, CheckSquare, BarChart2,
    Wind, Dumbbell, ShieldCheck, ArrowRight, UserCheck
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-surface-950 text-white selection:bg-primary-500/30">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shadow-lg shadow-primary-500/5">
                            <Flame size={20} className="text-primary-400" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tight italic">Hábitos</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-soft hover:text-white transition-colors">Funcionalidades</a>
                        <a href="#stats" className="text-sm font-medium text-soft hover:text-white transition-colors">Progreso</a>
                        <a href="#social" className="text-sm font-medium text-soft hover:text-white transition-colors">Comunidad</a>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-bold text-soft hover:text-white transition-colors"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-primary-500 hover:bg-primary-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20"
                        >
                            Empezar ahora
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pb-32 overflow-hidden" style={{ paddingTop: 'calc(10rem + env(safe-area-inset-top))' }}>
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-amber/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800 border border-surface-700/50 mb-6 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Puntaje máximo de productividad</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter mb-8 animate-slide-up">
                            Dominá tu día, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-accent-amber">forjá tu futuro.</span>
                        </h1>
                        <p className="text-xl text-soft leading-relaxed mb-10 max-w-2xl animate-slide-up delay-100">
                            La plataforma definitiva para gestionar hábitos, tareas y desafíos. Gamificá tu vida, competí con amigos y alcanzá tu mejor versión con un diseño premium diseñado para vos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-200">
                            <button
                                onClick={() => navigate('/register')}
                                className="group bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white px-6 py-3 rounded-xl text-base font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]"
                            >
                                Registrarse gratis
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-surface-800 hover:bg-surface-700 border border-surface-700/50 px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105 active:scale-95"
                            >
                                Ver demostración
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Preview */}
            <section id="features" className="py-24 bg-surface-900/50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-4xl font-black mb-4">Todo lo que necesitás en un solo lugar</h2>
                        <p className="text-soft font-medium">Diseñamos cada módulo para que sea intuitivo, rápido y visualmente impactante.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* FEATURE 1: HABITS */}
                        <div className="p-8 rounded-3xl bg-surface-800/40 border border-surface-700/50 group hover:border-primary-500/30 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Flame size={28} className="text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Gestión de Hábitos</h3>
                            <p className="text-soft text-sm leading-relaxed">
                                Seguí tus rachas diarias con recordatorios personalizados. Usá contadores para hábitos complejos como "tomar agua" o "leer páginas".
                            </p>
                        </div>

                        {/* FEATURE 2: TASKS */}
                        <div className="p-8 rounded-3xl bg-surface-800/40 border border-surface-700/50 group hover:border-accent-green/30 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-accent-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <CheckSquare size={28} className="text-accent-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Agenda & Tareas</h3>
                            <p className="text-soft text-sm leading-relaxed">
                                No te pierdas de nada. Sistema de tareas con recurrencia inteligente para que organices tu semana sin esfuerzo.
                            </p>
                        </div>

                        {/* FEATURE 3: SMOKE FREE */}
                        <div className="p-8 rounded-3xl bg-surface-800/40 border border-surface-700/50 group hover:border-accent-blue/30 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Wind size={28} className="text-accent-blue" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Libre de Humo</h3>
                            <p className="text-soft text-sm leading-relaxed">
                                Un módulo especializado para dejar de fumar. Calculá el dinero ahorrado, años de vida ganados y salud recuperada.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gamification Section */}
            <section id="stats" className="py-32 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20 mb-6">
                                <Trophy size={14} className="text-accent-amber" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent-amber">Gamificación Real</span>
                            </div>
                            <h2 className="text-5xl font-black mb-8 leading-tight">Tu esfuerzo tiene recompensa</h2>
                            <p className="text-xl text-soft leading-relaxed mb-10">
                                Ganá experiencia por cada hábito completado. Subí de nivel, desbloqueá insignias y visualizá tu mejora con estadísticas detalladas y gráficos de rendimiento semanal.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center flex-shrink-0">
                                        <BarChart2 size={20} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Análisis Profundo</h4>
                                        <p className="text-sm text-soft">Reportes detallados de tus mejores días y porcentaje de cumplimiento.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center flex-shrink-0">
                                        <Zap size={20} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Niveles & XP</h4>
                                        <p className="text-sm text-soft">Transformá tu disciplina en una aventura. Cada acción suma para tu evolución.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            {/* Visual Mockup - Based on ProgressPage */}
                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-accent-amber/20 rounded-full blur-[60px]" />
                                <div className="relative bg-surface-800 rounded-[2.5rem] p-8 border border-surface-700 shadow-2xl">

                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                                <Zap size={16} className="text-primary-400" /> Tu Nivel Actual
                                            </h2>
                                            <p className="text-xs text-soft mt-0.5">Nivel 4</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-white">85 <span className="text-sm font-medium text-soft">/ 100 XP</span></span>
                                        </div>
                                    </div>

                                    <div className="h-4 rounded-full bg-surface-700/50 overflow-hidden mb-2 border border-white/5 relative">
                                        <div className="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-amber relative" style={{ width: '85%' }} />
                                    </div>
                                    <p className="text-[10px] text-center text-muted uppercase tracking-widest mt-2 mb-8">
                                        15 XP para el nivel 5
                                    </p>

                                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 pb-1 border-b border-surface-700/50 leading-tight">
                                        Actividad reciente
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { reason: 'Completaste "Tomar agua"', amount: 15 },
                                            { reason: 'Racha de 7 días', amount: 50 },
                                            { reason: 'Ir al gimnasio', amount: 20 }
                                        ].map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-surface-800/40 border border-surface-700/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-surface-700/50 flex items-center justify-center text-accent-amber shrink-0">
                                                        <Zap size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-white truncate">{log.reason}</span>
                                                </div>
                                                <span className="text-sm font-black text-accent-amber px-2 py-1 rounded-md bg-accent-amber/10 shrink-0 ml-2">
                                                    +{log.amount} XP
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Section */}
            <section id="social" className="py-24 bg-surface-900 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                                <Users size={14} className="text-primary-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Social</span>
                            </div>
                            <h2 className="text-5xl font-black mb-8 leading-tight">No camines solo</h2>
                            <p className="text-xl text-soft leading-relaxed mb-10">
                                Agregá a tus amigos, compartí tus logros y motívalos cuando más lo necesiten. El sistema de chat integrado y notificaciones en tiempo real te mantienen conectado con tu comunidad.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-xl text-base font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary-500/20"
                            >
                                Unirse a la comunidad
                            </button>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { name: 'Alex', max: 12, week: 24, in: 'AL' },
                                    { name: 'Sofía', max: 30, week: 45, in: 'SO' },
                                    { name: 'Martín', max: 5, week: 12, in: 'MA' },
                                    { name: 'Lucía', max: 18, week: 32, in: 'LU' }
                                ].map((f, i) => (
                                    <div key={i} className={`p-4 rounded-2xl bg-surface-800 border border-surface-700 shadow-xl ${i % 2 === 0 ? 'mt-8' : ''}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center font-bold text-sm text-soft shrink-0">
                                                {f.in}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-white truncate">{f.name}</div>
                                                <div className="text-[10px] text-soft flex items-center gap-1 mt-0.5 truncate">
                                                    <UserCheck size={10} className="shrink-0" />
                                                    <span className="truncate">Amigos desde Sep.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-red bg-surface-700/50 px-2 py-1.5 rounded-lg border border-surface-600/30 shrink-0">
                                                <Flame size={12} className="text-accent-red" /> {f.max}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-green bg-surface-700/50 px-2 py-1.5 rounded-lg border border-surface-600/30 min-w-0 truncate">
                                                <CheckSquare size={12} className="text-accent-green" /> {f.week} t. hechas
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 relative">
                <div className="absolute inset-0 bg-primary-600/5 blur-[150px]" />
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">¿Estás listo para <br /> transformar tu vida?</h2>
                    <p className="text-xl text-soft mb-12 max-w-2xl mx-auto">
                        Miles de usuarios ya están mejorando su disciplina cada día. Unite hoy mismo y empezá a construir los hábitos que siempre soñaste.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full sm:w-auto bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white px-8 py-4 rounded-xl text-lg font-black shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] transition-all hover:scale-105 active:scale-95"
                        >
                            Crear mi cuenta ahora
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto bg-surface-800 border border-surface-700 hover:bg-surface-700 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                    <div className="mt-16 flex items-center justify-center gap-8 grayscale opacity-40">
                        <div className="flex items-center gap-2"><ShieldCheck size={18} /> <span className="font-bold">100% Seguro</span></div>
                        <div className="flex items-center gap-2"><Dumbbell size={18} /> <span className="font-bold">Fitness Ready</span></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-surface-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Flame size={16} className="text-primary-400" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-tight italic">Hábitos</span>
                    </div>
                    <p className="text-xs text-soft">© 2026 Hábitos App. Diseñado para la excelencia.</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/privacidad')} className="text-xs text-soft hover:text-white transition-colors">Privacidad</button>
                        <button onClick={() => navigate('/terminos')} className="text-xs text-soft hover:text-white transition-colors">Términos</button>
                        <button onClick={() => navigate('/soporte')} className="text-xs text-soft hover:text-white transition-colors">Soporte</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
