import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { smokeApi } from '@/api/smoke';
import { Wind, ChevronLeft, Droplet, Footprints, MessageSquare, Info, CheckCircle2 } from 'lucide-react';

const MESSAGES = [
    "Respirá profundo... este aire es vida.",
    "El impulso solo dura unos minutos.",
    "Tu cerebro está intentando engañarte.",
    "Buscá un vaso de agua, distraete.",
    "Estás haciendo un cambio increíble.",
    "Un impulso resistido es una racha ganada.",
    "Acordate por qué empezaste esto.",
];

const ADVICE = [
    { icon: Droplet, text: "Tomá un vaso de agua", color: "text-blue-400 bg-blue-400/10" },
    { icon: Footprints, text: "Caminá unos minutos", color: "text-green-400 bg-green-400/10" },
    { icon: Wind, text: "Hacé 5 respiraciones profundas", color: "text-primary-400 bg-primary-400/10" },
    { icon: MessageSquare, text: "Llamá a un amigo", color: "text-purple-400 bg-purple-400/10" },
];

export default function SmokePanicPage() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(180);
    const [messageIndex, setMessageIndex] = useState(0);
    const [showAdvice, setShowAdvice] = useState(false);
    const [done, setDone] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    clearInterval(timerRef.current);
                    setDone(true);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        const msgInterval = setInterval(() => {
            setMessageIndex(i => (i + 1) % MESSAGES.length);
        }, 8000);

        return () => {
            clearInterval(timerRef.current);
            clearInterval(msgInterval);
        };
    }, []);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSuccess = async () => {
        try {
            await smokeApi.logCraving({ resisted: true });
            navigate('/smoke');
        } catch {
            navigate('/smoke');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden select-none">
            {/* Immersive Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-primary-900/20 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-accent-amber/10 rounded-full blur-[160px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
            </div>

            {/* Back Button (Floating) */}
            <div className="absolute top-8 left-8 z-20">
                <button
                    onClick={() => navigate('/smoke')}
                    className="group flex items-center gap-3 text-white/40 hover:text-white transition-all p-2"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-active:scale-90 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Abandonar</span>
                </button>
            </div>

            {!done ? (
                /* Main Layout Container */
                <div className={`w-full max-w-6xl px-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 transition-all duration-1000 opacity-100 scale-100 translate-y-0`}>

                    {/* Left Section: Immersion & Breathing */}
                    <div className="flex-1 flex flex-col items-center order-2 lg:order-1">
                        <div className="relative flex items-center justify-center">
                            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[520px] lg:h-[520px] rounded-full border border-white/[0.03]" />
                            <div className="absolute w-48 h-48 sm:w-64 sm:h-64 lg:w-[420px] lg:h-[420px] rounded-full border border-white/[0.05]" />

                            <div className="absolute w-40 h-40 sm:w-56 sm:h-56 lg:w-[340px] lg:h-[340px] bg-primary-500/5 border-2 border-primary-500/20 rounded-full flex items-center justify-center animate-breathing" />
                            <div className="absolute w-40 h-40 sm:w-56 sm:h-56 lg:w-[340px] lg:h-[340px] bg-primary-500/10 rounded-full blur-[50px] animate-breathing opacity-40" />

                            <div className="absolute flex flex-col items-center">
                                <span className="text-6xl sm:text-7xl lg:text-[10rem] font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                    {formatTime(seconds)}
                                </span>
                                <span className="text-[10px] lg:text-xs font-black tracking-[0.6em] text-primary-400 mt-2 lg:mt-4 uppercase opacity-50">Quedan</span>
                            </div>
                        </div>

                        <p className="mt-8 lg:mt-16 text-xs lg:text-sm font-bold text-primary-400/60 uppercase tracking-[0.5em] animate-pulse shrink-0">
                            Inhalá... Respirá...
                        </p>
                    </div>

                    {/* Right Section: Messages & User Guidance */}
                    <div className="flex-1 max-w-md w-full flex flex-col items-center lg:items-start order-1 lg:order-2">
                        <div className="mb-6 lg:mb-10 w-16 h-16 lg:w-20 lg:h-20 bg-accent-amber/20 rounded-3xl flex items-center justify-center text-accent-amber shadow-[0_0_60px_rgba(251,191,36,0.1)] animate-float">
                            <Wind size={32} strokeWidth={2.5} />
                        </div>

                        <div className="text-center lg:text-left mb-10 lg:mb-16">
                            <h1 className="text-3xl lg:text-6xl font-black text-white mb-6 lg:mb-8 tracking-tight leading-[1.1]">
                                Aguantá un<br className="hidden lg:block" /> poco más
                            </h1>
                            <p className="text-soft lg:text-xl italic font-medium h-12 lg:h-24 transition-all duration-700 ease-in-out">
                                "{MESSAGES[messageIndex]}"
                            </p>
                        </div>

                        <div className="w-full space-y-4 lg:space-y-6">
                            <button
                                onClick={() => setShowAdvice(!showAdvice)}
                                className={`w-full py-5 lg:py-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] lg:text-xs font-black tracking-[0.2em] text-white/40 flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all ${showAdvice ? 'bg-white/10 text-white border-white/20' : ''}`}
                            >
                                <Info size={18} />
                                {showAdvice ? "OCULTAR CONSEJOS" : "ESTOY MUY ANSIOSO"}
                            </button>

                            {showAdvice && (
                                <div className="grid grid-cols-2 gap-4 animate-slide-up">
                                    {ADVICE.map((a, i) => (
                                        <div key={i} className="p-4 lg:p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3 items-center text-center group hover:bg-white/[0.08] transition-all cursor-default">
                                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform shadow-lg`}>
                                                <a.icon size={20} />
                                            </div>
                                            <p className="text-[9px] lg:text-[10px] leading-tight font-black uppercase text-white/50 tracking-widest group-hover:text-white transition-colors">{a.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!showAdvice && (
                                <button
                                    onClick={handleSuccess}
                                    className="w-full py-4 text-[9px] lg:text-[10px] font-black tracking-[0.3em] text-white/10 hover:text-white/40 transition-all uppercase"
                                >
                                    Ya me siento mejor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Victory Immersive Screen */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-t from-accent-green/10 via-black to-black animate-fade-in">
                    <div className="w-32 h-32 lg:w-48 lg:h-48 bg-accent-green/20 rounded-full flex items-center justify-center text-accent-green mb-10 lg:mb-16 shadow-[0_0_120px_rgba(34,197,94,0.3)] border border-accent-green/30 animate-scale-in">
                        <CheckCircle2 size={72} strokeWidth={1} />
                    </div>

                    <div className="max-w-xl text-center animate-slide-up">
                        <h1 className="text-5xl lg:text-8xl font-black text-white mb-6 lg:mb-8 tracking-tighter italic uppercase">¡VICTORIA!</h1>
                        <p className="text-soft lg:text-2xl text-center mb-16 font-medium leading-relaxed">
                            Pasaste los 180 segundos clave. El impulso ya se fue de tu sistema. Sos dueño de tus decisiones.
                        </p>
                    </div>

                    <button
                        onClick={handleSuccess}
                        className="w-full max-w-sm py-6 lg:py-8 bg-accent-green text-black font-black text-xs lg:text-sm rounded-3xl shadow-[0_20px_50px_rgba(34,197,94,0.3)] active:scale-95 hover:scale-105 hover:brightness-110 transition-all uppercase tracking-[0.3em]"
                    >
                        Volver Triunfante
                    </button>

                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`absolute w-2 h-2 rounded-full bg-accent-green/40 blur-sm animate-float-slow`} style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDuration: `${3 + Math.random() * 4}s`,
                                animationDelay: `${Math.random() * 2}s`
                            }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Optimized Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes breathing {
                    0%, 100% { transform: scale(1); opacity: 0.05; }
                    50% { transform: scale(1.5); opacity: 0.25; }
                }
                .animate-breathing {
                    animation: breathing 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }
                .animate-float-slow {
                    animation: float-slow 5s ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
