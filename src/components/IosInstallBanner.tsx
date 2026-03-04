import { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';

// Detects iOS browser (not standalone) and shows an install-to-home-screen prompt.
// iOS Safari only supports Web Push from PWAs added to the Home Screen (iOS 16.4+).

function isIos(): boolean {
    const ua = navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua);
}

function isInStandaloneMode(): boolean {
    return (
        ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
        window.matchMedia('(display-mode: standalone)').matches
    );
}

const STORAGE_KEY = 'ios-install-banner-dismissed';

export default function IosInstallBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (isIos() && !isInStandaloneMode() && !dismissed) {
            // Small delay so the page settles first
            const t = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(t);
        }
    }, []);

    function dismiss() {
        localStorage.setItem(STORAGE_KEY, '1');
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Instalar aplicación"
            className="fixed bottom-4 left-3 right-3 z-[999] animate-slide-up"
        >
            <div
                className="relative rounded-2xl p-4 border border-white/10"
                style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(30,41,59,0.97) 60%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
            >
                {/* Close */}
                <button
                    onClick={dismiss}
                    className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                    aria-label="Cerrar"
                >
                    <X size={16} />
                </button>

                <div className="pr-6">
                    <p className="text-sm font-bold text-white mb-1">
                        📲 Activá las notificaciones
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed mb-3">
                        Para recibir avisos en tu iPhone, instalá la app en tu pantalla de inicio:
                    </p>

                    <ol className="space-y-1.5">
                        <li className="flex items-center gap-2 text-xs text-white/75">
                            <span className="w-5 h-5 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">1</span>
                            Tocá el botón{' '}
                            <span className="inline-flex items-center gap-0.5 bg-white/10 rounded px-1.5 py-0.5">
                                <Share size={11} /> Compartir
                            </span>
                        </li>
                        <li className="flex items-center gap-2 text-xs text-white/75">
                            <span className="w-5 h-5 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">2</span>
                            Elegí <span className="font-semibold text-white">"Añadir a pantalla de inicio"</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs text-white/75">
                            <span className="w-5 h-5 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">3</span>
                            Abrí la app desde el inicio y aceptá las notificaciones
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
