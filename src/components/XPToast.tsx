import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function XPToast() {
    const { user } = useAuthStore();
    const prevXpRef = useRef(user?.experience);
    const [lastGain, setLastGain] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!user || user.experience === prevXpRef.current) return;

        if (prevXpRef.current !== undefined && user.experience > prevXpRef.current) {
            setLastGain(user.experience - prevXpRef.current);
            setShow(true);
            setTimeout(() => setShow(false), 2500); // hide after 2.5 seconds
        }
        prevXpRef.current = user.experience;
    }, [user?.experience]);

    if (!show || !lastGain) return null;

    return (
        <div className="fixed top-20 right-4 z-[9999] pointer-events-none animate-slide-up">
            <div className="bg-gradient-to-br from-accent-amber/90 to-primary-500/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-3 font-black text-xl border border-white/20">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">⚡</span>
                <span className="drop-shadow-md">+{lastGain} XP</span>
            </div>
        </div>
    );
}
