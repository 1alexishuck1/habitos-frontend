import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { X, GraduationCap, PartyPopper } from 'lucide-react';

const CELEBRATED_USERS = [
    '7cf8c230-024e-44c8-8c3f-b5f59e86f438'
];

// March 10, 2026 at 21:00 ARG (UTC-3) -> March 11, 2026 at 00:00 UTC
const EXPIRY_TIME = new Date('2026-03-11T00:00:00Z').getTime();

export default function CelebrationModal() {
    const user = useAuthStore(s => s.user);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (!user) return;

        const now = Date.now();
        const isTargetUser = CELEBRATED_USERS.includes(user.id);
        const isWithinTime = now < EXPIRY_TIME;

        if (isTargetUser && isWithinTime) {
            setIsOpen(true);
        }
    }, [user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />

            {/* Balloons layers */}
            <Balloons count={20} />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-indigo-600 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(79,70,229,0.5)] border-2 border-white/20 animate-pop-in text-center overflow-hidden group">
                {/* Background light effect */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl group-hover:bg-purple-400/30 transition-all duration-700" />

                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
                >
                    <X size={20} />
                </button>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-rotate-bounce">
                        <GraduationCap size={40} className="text-indigo-600" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                        ¡FELICITACIONES! 🎊
                    </h2>

                    <div className="space-y-4">
                        <p className="text-indigo-100 font-medium text-lg">
                            Te mereces este festejo por haber aprobado la <span className="text-white font-bold underline decoration-white/30">anteúltima</span> materia.
                        </p>

                        <p className="text-white/80 text-sm">
                            ¡Un pasito más cerca de la meta! Estamos orgullosos de todo tu esfuerzo. No pares que ya falta nada. 🚀
                        </p>

                        <p className="text-white font-bold text-lg pt-2 animate-bounce-slow">
                            ¡Te quiero mucho! ❤️
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2">
                        <PartyPopper className="text-white animate-bounce" size={24} />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
                        >
                            ¡GRACIAS! ❤️
                        </button>
                        <PartyPopper className="text-white animate-bounce" size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Balloons({ count }: { count: number }) {
    const colors = ['bg-purple-400', 'bg-indigo-400', 'bg-pink-400', 'bg-violet-500', 'bg-fuchsia-400'];

    return (
        <React.Fragment>
            {Array.from({ length: count }).map((_, i) => {
                const color = colors[i % colors.length];
                const left = `${Math.random() * 100}%`;
                const delay = `${Math.random() * 5}s`;
                const duration = `${4 + Math.random() * 4}s`;
                const size = `${30 + Math.random() * 40}px`;

                return (
                    <div
                        key={i}
                        className={`animate-float-up ${color} rounded-full absolute shadow-lg balloon-wobble`}
                        style={{
                            left,
                            width: size,
                            height: `calc(${size} * 1.2)`,
                            animationDelay: delay,
                            animationDuration: duration,
                            opacity: 0.8
                        }}
                    >
                        {/* Balloon knot */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit rotate-45" />
                    </div>
                );
            })}
        </React.Fragment>
    );
}
