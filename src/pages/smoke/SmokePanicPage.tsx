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
        }, 12000);

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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black">
            {/* Background animated circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary-600 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-accent-amber/40 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Back button */}
            <button
                onClick={() => navigate('/smoke')}
                className="absolute top-6 left-6 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-95"
            >
                <ChevronLeft size={24} />
            </button>

            {!done ? (
                <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-fade-in">
                    <div className="w-20 h-20 bg-accent-amber/20 rounded-3xl flex items-center justify-center text-accent-amber mb-8 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                        <Wind size={40} className="animate-pulse" />
                    </div>

                    <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Aguantá un poco más</h1>
                    <p className="text-muted text-center mb-12 italic h-10 px-4">{MESSAGES[messageIndex]}</p>

                    {/* Timer Circle */}
                    <div className="relative mb-20 flex items-center justify-center">
                        {/* Static bg circle */}
                        <div className="w-64 h-64 rounded-full border-[8px] border-white/5 flex items-center justify-center" />

                        {/* Animated breathing circle */}
                        <div className="absolute w-56 h-56 bg-primary-500/10 border-4 border-primary-500/30 rounded-full flex items-center justify-center animate-breathing" />

                        {/* Inner content */}
                        <div className="absolute flex flex-col items-center">
                            <span className="text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                                {formatTime(seconds)}
                            </span>
                            <span className="text-[10px] font-black tracking-[0.3em] text-primary-400 mt-2 uppercase">Quedan</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 w-full">
                        <button
                            onClick={() => setShowAdvice(!showAdvice)}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold text-white/50 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                        >
                            <Info size={16} />
                            {showAdvice ? "OCULTAR CONSEJOS" : "VER CONSEJOS RÁPIDOS"}
                        </button>

                        {showAdvice && (
                            <div className="grid grid-cols-2 gap-3 mt-2 animate-slide-up">
                                {ADVICE.map((a, i) => (
                                    <div key={i} className={`p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3 items-center text-center`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                                            <a.icon size={20} />
                                        </div>
                                        <p className="text-[10px] leading-tight font-bold text-white/80">{a.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleSuccess}
                            className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold text-white/30 hover:text-white/60 transition-all mt-4"
                        >
                            YA LO SUPERÉ (VOLVER)
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-scale-in">
                    <div className="w-24 h-24 bg-accent-green/20 rounded-full flex items-center justify-center text-accent-green mb-10 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 size={56} />
                    </div>
                    <h1 className="text-4xl font-black text-white text-center mb-4 tracking-tight">¡LO LOGRASTE!</h1>
                    <p className="text-soft text-center mb-12 text-sm max-w-[200px]">Pasaste los 3 minutos críticos. Este impulso ya no tiene poder sobre vos.</p>

                    <button
                        onClick={handleSuccess}
                        className="w-full py-5 bg-accent-green text-black font-black text-sm rounded-2xl shadow-xl shadow-accent-green/20 active:scale-95 transition-all"
                    >
                        REGRESAR VICTORIOSO
                    </button>
                </div>
            )}

            {/* Injected Breathing Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes breathing {
                    0%, 100% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.15); opacity: 0.25; }
                }
                .animate-breathing {
                    animation: breathing 4s ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
